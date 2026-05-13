import React, { useState } from 'react';
import {
  Brain,
  Printer,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  FileText,
} from 'lucide-react';
import type { ChildData } from '@/types/desafio';

interface ClinicalReportProps {
  activeChild?: ChildData | null;
}

export const ClinicalReport: React.FC<ClinicalReportProps> = ({ activeChild }) => {
  const [mentorNotes, setMentorNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!activeChild) {
    return (
      <div className="p-12 text-center text-white/40 font-black uppercase italic tracking-widest">
        Selecione um Herói para visualizar os relatórios clínicos.
      </div>
    );
  }

  const tasks = activeChild.tasks || [];
  const history = activeChild.history || [];
  const planets = activeChild.planets || [];

  // ─── Datas de filtro calculadas uma única vez ────────────────────────────
  const startTs = startDate ? new Date(startDate).getTime() : null;
  const endTs   = endDate   ? new Date(endDate + 'T23:59:59').getTime() : null;

  const isInRange = (isoStr: string): boolean => {
    if (!startTs && !endTs) return true;
    const t = new Date(isoStr).getTime();
    if (startTs && t < startTs) return false;
    if (endTs   && t > endTs)   return false;
    return true;
  };

  // ─── Missões concluídas no período (usa completionLog para precisão total) ─
  // Cada entrada no log representa uma conclusão aprovada com timestamp ISO.
  // Tarefas recorrentes acumulam entradas a cada ciclo, então o filtro é exato.
  const missionCounts: Record<string, number> = {};
  tasks.forEach(t => {
    if (t.completionLog && t.completionLog.length > 0) {
      // Conta apenas os timestamps que caem no período selecionado
      const countInRange = t.completionLog.filter(isInRange).length;
      if (countInRange > 0) {
        missionCounts[t.title] = (missionCounts[t.title] || 0) + countInRange;
      }
    } else if (t.status === 'done' && t.lastCompleted) {
      // Fallback para tarefas antigas (sem completionLog ainda)
      if (isInRange(t.lastCompleted)) {
        missionCounts[t.title] = (missionCounts[t.title] || 0) + 1;
      }
    }
  });
  const missionMax = Math.max(...Object.values(missionCounts), 1);

  // ─── Total de missões concluídas no período (para as métricas de adesão) ─
  const totalMissionsInPeriod = Object.values(missionCounts).reduce((a, b) => a + b, 0);
  // Taxa de adesão: missões no período / total de tarefas configuradas
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((totalMissionsInPeriod / totalTasks) * 100) : 0;

  // ─── Punições (filtradas pelo history) ───────────────────────────────────
  const behaviorDeductions = history.filter(h =>
    (h.type === 'loss' || h.amount < 0 ||
      h.title.includes('Birra') ||
      h.title.includes('obedeceu') ||
      h.title.includes('Agressividade')) &&
    isInRange(h.date)
  );
  const totalDeductionsCount = behaviorDeductions.length;

  // ─── Punições agrupadas para o gráfico ───────────────────────────────────
  const punishCounts: Record<string, number> = {};
  behaviorDeductions.forEach(b => {
    punishCounts[b.title] = (punishCounts[b.title] || 0) + 1;
  });
  const punishMax = Math.max(...Object.values(punishCounts), 1);

  // ─── Engajamento por Planeta (filtrado pelo completionLog) ───────────────
  const getPlanetStats = (planetId: string) => {
    const planetTasks = tasks.filter(t => t.planetId === planetId);
    const completedCounts: Record<string, number> = {};
    planetTasks.forEach(t => {
      let count = 0;
      if (t.completionLog && t.completionLog.length > 0) {
        count = t.completionLog.filter(isInRange).length;
      } else if (t.status === 'done' && t.lastCompleted && isInRange(t.lastCompleted)) {
        count = 1;
      }
      if (count > 0) completedCounts[t.title] = (completedCounts[t.title] || 0) + count;
    });
    const totalCompleted = Object.values(completedCounts).reduce((a, b) => a + b, 0);
    const planetRate = planetTasks.length > 0 ? Math.round((totalCompleted / planetTasks.length) * 100) : 0;
    return { planetTasks, completedCounts, totalCompleted, planetRate };
  };

  const handlePrint = () => window.print();


  return (
    <div className="space-y-8 clinical-report-container" style={{ background: 'transparent' }}>

      {/* Barra de Ação (oculta na impressão) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-primary/10 border border-primary/20 p-6 rounded-3xl backdrop-blur-md print:hidden">
        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-primary flex items-center gap-2">
            <Brain className="w-6 h-6" /> Integração Terapêutica
          </h2>
          <p className="text-xs text-white/60 font-medium mt-1">
            Gere o relatório formatado para o psicólogo ou neuropediatra acompanhar a evolução comportamental em casa.
          </p>
        </div>

        {/* Filtro de Período */}
        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-xs font-black uppercase text-white/40">De:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary"
          />
          <label className="text-xs font-black uppercase text-white/40">Até:</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary"
          />
        </div>

        {/* Botão WhatsApp */}
        <button
          onClick={() => {
            const periodo = (startDate || endDate)
              ? `Período: ${startDate || '...'} até ${endDate || '...'}`
              : 'Período: Geral (sem filtro)';

            const missoesList = Object.entries(missionCounts)
              .map(([title, cnt]) => `  • ${title}: ${cnt}x`)
              .join('\n') || '  Nenhuma missão concluída no período.';

            const punicoesList = Object.entries(punishCounts)
              .map(([title, cnt]) => `  • ${title}: ${cnt}x`)
              .join('\n') || '  Nenhuma punição registrada no período.';

            const observacoes = mentorNotes?.trim()
              ? mentorNotes.trim()
              : 'Nenhuma observação adicional preenchida.';

            const reportText =
`📊 *RELATÓRIO DE ACOMPANHAMENTO COMPORTAMENTAL*
👦 Herói: ${activeChild.name}
📅 Emitido em: ${new Date().toLocaleDateString('pt-BR')}
🗓 ${periodo}

━━━━━━━━━━━━━━━━━━━━
📈 *MÉTRICAS DO PERÍODO*
⭐ Estrelas acumuladas: ${activeChild.stars}
✅ Taxa de adesão a hábitos: ${taskCompletionRate}% (${doneTasks}/${totalTasks} tarefas)
⚠️ Registros de atrito: ${totalDeductionsCount} episódio(s)

━━━━━━━━━━━━━━━━━━━━
🚀 *MISSÕES REALIZADAS*
${missoesList}

━━━━━━━━━━━━━━━━━━━━
🔴 *PUNIÇÕES REGISTRADAS*
${punicoesList}

━━━━━━━━━━━━━━━━━━━━
📝 *OBSERVAÇÕES DA FAMÍLIA*
${observacoes}

━━━━━━━━━━━━━━━━━━━━
_Gerado pelo sistema Desafio das Estrelas | Instituto Kamaleon_`;

            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(reportText)}`, '_blank');
          }}
          className="px-6 py-3 bg-green-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M11.997 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.826L.057 23.27a.75.75 0 00.916.916l5.444-1.466A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.624 0 11.997 0zM12 22c-1.891 0-3.657-.51-5.178-1.396l-.37-.22-3.832 1.033 1.033-3.832-.22-.37A9.952 9.952 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          Enviar por WhatsApp
        </button>

        <button
          onClick={handlePrint}
          className="px-6 py-4 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2 shrink-0"
        >
          <Printer className="w-4 h-4" /> Exportar PDF / Imprimir
        </button>
      </div>

      {/* Página do Relatório */}
      <div className="bg-white/5 border border-white/10 rounded-[40px] p-6 sm:p-10 backdrop-blur-xl print:bg-white print:text-black print:border-none print:p-0 print:shadow-none space-y-8 text-white">

        {/* Cabeçalho */}
        <div className="border-b border-white/10 print:border-zinc-300 pb-6 flex justify-between items-start">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary print:text-zinc-500 block">
              Relatório de Acompanhamento Comportamental
            </span>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter mt-1 print:text-black">
              {activeChild.name}
            </h1>
            <p className="text-xs text-white/40 print:text-zinc-600 font-medium mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Emitido em: {new Date().toLocaleDateString('pt-BR')}
              {(startDate || endDate) && (
                <span className="ml-2">
                  | Período: {startDate || '...'} até {endDate || '...'}
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-yellow-400 print:text-zinc-800 block">
              {activeChild.stars}⭐
            </span>
            <span className="text-[9px] font-bold uppercase text-white/40 print:text-zinc-500 block">
              Estrelas Atuais
            </span>
            {activeChild.badges && activeChild.badges.length > 0 && (
              <span className="text-[9px] font-bold uppercase text-primary print:text-zinc-600 block mt-1">
                🏆 {activeChild.badges.length} Medalhas
              </span>
            )}
          </div>
        </div>

        {/* Métricas Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 bg-white/5 print:bg-zinc-50 border border-white/5 print:border-zinc-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 print:text-emerald-700">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Adesão a Hábitos</span>
            </div>
            <div className="text-3xl font-black italic tracking-tighter print:text-black">
              {taskCompletionRate}%
            </div>
            <div className="w-full h-2 bg-white/10 print:bg-zinc-200 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-400 print:bg-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </div>
            <p className="text-[10px] text-white/40 print:text-zinc-600 leading-relaxed pt-1">
              Taxa de conclusão: {totalMissionsInPeriod} missão(ões) concluída(s) de {totalTasks} tarefa(s) configurada(s){startTs || endTs ? ' no período' : ''}.
            </p>
          </div>

          <div className="p-6 bg-white/5 print:bg-zinc-50 border border-white/5 print:border-zinc-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-red-400 print:text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Registros de Atrito</span>
            </div>
            <div className="text-3xl font-black italic tracking-tighter print:text-black">
              {totalDeductionsCount}
            </div>
            <p className="text-[10px] text-white/40 print:text-zinc-600 leading-relaxed">
              Episódios de desregulação ou quebra de combinados pontuados na Ponte de Comportamento.
            </p>
          </div>
        </div>

        {/* Gráfico de Barras - Missões Realizadas */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Missões Realizadas
          </h3>
          <div className="grid gap-2">
            {Object.keys(missionCounts).length === 0 ? (
              <p className="text-xs text-white/40 italic">Nenhuma missão concluída no período.</p>
            ) : (
              Object.entries(missionCounts).map(([title, cnt]) => (
                <div key={title} className="flex items-center gap-2">
                  <span className="w-36 text-xs text-white/60 truncate">{title}</span>
                  <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(cnt / missionMax) * 100}%` }} />
                  </div>
                  <span className="text-xs text-white/80 w-8 text-right">{cnt}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Engajamento por Planeta */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary print:text-zinc-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Engajamento por Objetivo Terapêutico (Planetas)
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {planets.length === 0 ? (
              <p className="text-xs text-white/40 print:text-zinc-500 italic">
                Nenhum Planeta mapeado. Use a &quot;Sala de Controle&quot; para vincular tarefas a grandes metas.
              </p>
            ) : (
              planets.map(planet => {
                const { planetTasks, completedCounts, totalCompleted, planetRate } = getPlanetStats(planet.id);
                return (
                  <div key={planet.id} className="p-4 bg-white/5 print:bg-zinc-50 rounded-xl border border-white/5 print:border-zinc-200 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{planet.icon || '🪐'}</span>
                        <div>
                          <h4 className="text-sm font-bold print:text-black">{planet.title}</h4>
                          <p className="text-[10px] text-white/40 print:text-zinc-500">
                            {planetTasks.length} missão(ões) vinculada(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black print:text-zinc-700">
                          {totalCompleted} conclusão(ões) ({planetRate}%)
                        </span>
                        {planetRate >= 100 && planetTasks.length > 0 && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                    </div>

                    {/* Lista de tarefas concluídas por planeta */}
                    {Object.keys(completedCounts).length > 0 && (
                      <ul className="list-disc list-inside text-xs text-white/60 print:text-zinc-600">
                        {Object.entries(completedCounts).map(([title, cnt]) => (
                          <li key={title}>{title}: {cnt} vez(es){startTs || endTs ? ' no período' : ''}</li>
                        ))}
                      </ul>
                    )}

                    {/* Barra de Progresso */}
                    <div className="w-full h-1.5 bg-white/5 print:bg-zinc-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(planetRate, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Gráfico de Barras - Punições Sofridas */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-red-400 print:text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Punições Sofridas
          </h3>
          <div className="grid gap-2">
            {Object.keys(punishCounts).length === 0 ? (
              <p className="text-xs text-white/40 italic">Nenhuma punição registrada no período.</p>
            ) : (
              Object.entries(punishCounts).map(([label, cnt]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-36 text-xs text-white/60 truncate">{label}</span>
                  <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${(cnt / punishMax) * 100}%` }} />
                  </div>
                  <span className="text-xs text-white/80 w-8 text-right">{cnt}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detalhamento de Atritos */}
        {behaviorDeductions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-red-400 print:text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Detalhamento de Atritos Comportamentais
            </h3>
            <div className="space-y-2">
              {behaviorDeductions.slice(0, 5).map((item, idx) => (
                <div key={idx} className="p-3 bg-red-500/5 print:bg-white print:border-b print:border-zinc-200 rounded-lg flex justify-between items-center text-xs">
                  <span className="font-bold text-white/80 print:text-zinc-800">{item.title}</span>
                  <span className="text-[10px] text-white/40 print:text-zinc-500">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diário de Bordo */}
        <div className="space-y-3 print:pt-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/60 print:text-zinc-800 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Observações da Família (Diário de Bordo)
          </h3>
          <div className="print:hidden">
            <textarea
              value={mentorNotes}
              onChange={e => setMentorNotes(e.target.value)}
              placeholder="Escreva aqui observações sobre o sono, humor, adaptação escolar ou fatos relevantes da semana para o terapeuta ler..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-primary resize-none"
            />
          </div>
          <div className="hidden print:block text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed border-l-2 border-zinc-400 pl-4 py-1">
            {mentorNotes || 'Nenhuma observação adicional preenchida pelo mentor neste período.'}
          </div>
        </div>

        {/* Rodapé */}
        <div className="hidden print:block pt-12 border-t border-zinc-300 text-center text-[9px] text-zinc-500 uppercase tracking-widest">
          Documento gerado através do sistema Desafio das Estrelas • Gamificação &amp; Acompanhamento de Desenvolvimento Infantil
        </div>

      </div>
    </div>
  );
};
