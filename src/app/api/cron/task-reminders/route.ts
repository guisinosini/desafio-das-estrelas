import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  sendEmail,
  buildMentorReminderHtml,
  buildProfessionalReminderHtml,
} from '@/lib/email';

// ---------------------------------------------------------------------------
// Segurança: apenas chamadas com o CRON_SECRET correto são aceitas
// ---------------------------------------------------------------------------

function isAuthorized(req: Request): boolean {
  const auth = req.headers.get('authorization') ?? '';
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

// ---------------------------------------------------------------------------
// Tipos auxiliares
// ---------------------------------------------------------------------------

interface Task {
  id: string;
  title: string;
  status: 'available' | 'pending' | 'done';
  recurrence: 'daily' | 'weekly' | 'monthly' | 'once';
  lastCompleted?: string;
}

interface Child {
  id: string;
  name: string;
  tasks: Task[];
}

interface GameState {
  children?: Child[];
}

interface PendingTask {
  title: string;
  daysPending: number;
}

// ---------------------------------------------------------------------------
// Utilitário: calcula há quantos dias uma tarefa está pendente
// ---------------------------------------------------------------------------

function getDaysPending(task: Task, recordUpdatedAt: string): number {
  const now = new Date();

  if (task.lastCompleted) {
    const last = new Date(task.lastCompleted);
    const diff = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(diff);
  }

  // Nunca foi completada — usa o updated_at do registro como proxy de quando foi criada/resetada
  const created = new Date(recordUpdatedAt);
  const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor(diff);
}

// ---------------------------------------------------------------------------
// Utilitário: verifica se já foi enviado lembrete nos últimos 7 dias
// ---------------------------------------------------------------------------

async function wasRecentlySent(
  profileId: string,
  taskId: string,
  recipient: 'mentor' | 'professional'
): Promise<boolean> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabaseAdmin
    .from('email_reminder_logs')
    .select('id')
    .eq('profile_id', profileId)
    .eq('task_id', taskId)
    .eq('recipient', recipient)
    .gte('sent_at', sevenDaysAgo)
    .limit(1)
    .maybeSingle();

  return !!data;
}

// ---------------------------------------------------------------------------
// Utilitário: registra o envio na tabela de logs
// ---------------------------------------------------------------------------

async function logReminderSent(
  profileId: string,
  childId: string,
  taskId: string,
  recipient: 'mentor' | 'professional'
) {
  await supabaseAdmin.from('email_reminder_logs').insert({
    profile_id: profileId,
    child_id: childId,
    task_id: taskId,
    recipient,
  });
}

// ---------------------------------------------------------------------------
// Handler principal do Cron
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🕘 [Task Reminder Cron] Iniciando varredura...');

  const stats = { checked: 0, emailsMentor: 0, emailsProfessional: 0, errors: 0 };

  try {
    // 1. Buscar todos os registros de gamification com seu updated_at
    const { data: gamRows, error: gamErr } = await supabaseAdmin
      .from('patient_gamification')
      .select('profile_id, state, updated_at');

    if (gamErr) {
      console.error('❌ Erro ao buscar patient_gamification:', gamErr);
      return NextResponse.json({ error: gamErr.message }, { status: 500 });
    }

    if (!gamRows || gamRows.length === 0) {
      return NextResponse.json({ message: 'Nenhum registro de gamification encontrado.', stats });
    }

    // 2. Buscar todos os perfis necessários em uma única query (evita N+1)
    const profileIds = gamRows.map((r: any) => r.profile_id);

    const { data: profiles, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, linked_professional_id, subscription_status')
      .in('id', profileIds);

    if (profileErr) {
      console.error('❌ Erro ao buscar perfis:', profileErr);
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    // 3. Coletar IDs de profissionais únicos para buscar seus dados
    const professionalIds = [
      ...new Set(
        (profiles ?? [])
          .map((p: any) => p.linked_professional_id)
          .filter(Boolean)
      ),
    ];

    let professionalMap: Record<string, { email: string; full_name: string }> = {};

    if (professionalIds.length > 0) {
      const { data: professionals } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name')
        .in('id', professionalIds);

      (professionals ?? []).forEach((pro: any) => {
        professionalMap[pro.id] = { email: pro.email, full_name: pro.full_name };
      });
    }

    // Monta mapa de perfis por ID para acesso rápido
    const profileMap: Record<string, any> = {};
    (profiles ?? []).forEach((p: any) => { profileMap[p.id] = p; });

    // 4. Iterar sobre cada registro de gamification
    for (const row of gamRows as any[]) {
      const { profile_id, state, updated_at } = row;
      const profile = profileMap[profile_id];

      // Pula perfis sem e-mail ou com assinatura inativa
      if (!profile?.email) continue;
      if (profile.subscription_status !== 'active') continue;

      const gameState = state as GameState;
      const children: Child[] = gameState?.children ?? [];

      for (const child of children) {
        const pendingByTask: PendingTask[] = [];

        for (const task of child.tasks ?? []) {
          stats.checked++;

          // Só avalia tarefas que estão disponíveis (não concluídas no ciclo atual)
          if (task.status !== 'available') continue;

          const days = getDaysPending(task, updated_at);
          if (days < 3) continue;

          pendingByTask.push({ title: task.title, daysPending: days });
        }

        if (pendingByTask.length === 0) continue;

        // ---- Lembrete para o Mentor ----
        for (const pending of pendingByTask) {
          // Pega o ID da tarefa para deduplicação
          const task = child.tasks.find((t) => t.title === pending.title);
          if (!task) continue;

          const alreadySentMentor = await wasRecentlySent(profile_id, task.id, 'mentor');
          if (alreadySentMentor) continue;

          try {
            await sendEmail({
              to: profile.email,
              subject: `🚀 Missão pendente: "${pending.title}" precisa de atenção!`,
              html: buildMentorReminderHtml({
                mentorName: profile.full_name ?? 'Mentor',
                childName: child.name,
                pendingTasks: [pending],
              }),
              from: `"Desafio das Estrelas" <${process.env.SMTP_USER}>`,
            });

            await logReminderSent(profile_id, child.id, task.id, 'mentor');
            stats.emailsMentor++;
            console.log(`📧 Lembrete → mentor ${profile.email} | tarefa: ${pending.title}`);
          } catch (err) {
            console.error(`❌ Falha ao enviar para mentor ${profile.email}:`, err);
            stats.errors++;
          }
        }

        // ---- Lembrete para o Profissional (se vinculado) ----
        const professionalId = profile.linked_professional_id;
        if (!professionalId) continue;

        const professional = professionalMap[professionalId];
        if (!professional?.email) continue;

        // Para o profissional: envia um e-mail consolidado com TODAS as tarefas pendentes da criança
        // mas somente se pelo menos uma delas ainda não foi notificada ao profissional esta semana
        const taskIdsToNotifyPro: string[] = [];

        for (const pending of pendingByTask) {
          const task = child.tasks.find((t) => t.title === pending.title);
          if (!task) continue;
          const alreadySent = await wasRecentlySent(profile_id, task.id, 'professional');
          if (!alreadySent) {
            taskIdsToNotifyPro.push(task.id);
          }
        }

        if (taskIdsToNotifyPro.length === 0) continue;

        const pendingForPro = pendingByTask.filter((p) => {
          const task = child.tasks.find((t) => t.title === p.title);
          return task && taskIdsToNotifyPro.includes(task.id);
        });

        try {
          await sendEmail({
            to: professional.email,
            subject: `⚠️ Alerta Clínico: Tarefas pendentes de ${child.name}`,
            html: buildProfessionalReminderHtml({
              professionalName: professional.full_name ?? 'Profissional',
              mentorName: profile.full_name ?? 'Mentor',
              childName: child.name,
              pendingTasks: pendingForPro,
            }),
            from: `"Instituto Kamaleon" <${process.env.SMTP_USER}>`,
          });

          // Registra log para cada tarefa notificada
          for (const taskId of taskIdsToNotifyPro) {
            await logReminderSent(profile_id, child.id, taskId, 'professional');
          }

          stats.emailsProfessional++;
          console.log(`📧 Alerta clínico → profissional ${professional.email} | paciente: ${profile.full_name}`);
        } catch (err) {
          console.error(`❌ Falha ao enviar para profissional ${professional.email}:`, err);
          stats.errors++;
        }
      }
    }

    console.log('✅ [Task Reminder Cron] Concluído.', stats);
    return NextResponse.json({ success: true, stats });

  } catch (err: any) {
    console.error('💥 [Task Reminder Cron] Erro fatal:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
