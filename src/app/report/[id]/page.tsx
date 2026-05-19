import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ClinicalReport } from '@/components/desafio/ClinicalReport';
import { translations } from '@/lib/translations';

export const dynamic = 'force-dynamic';

export default async function SharedReportPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from('shared_reports')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  // Verifica expiração
  if (new Date(data.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-black italic text-red-500">LINK EXPIRADO</h1>
          <p className="text-white/60">Este relatório não está mais disponível. Solicite um novo link ao mentor do Herói.</p>
        </div>
      </div>
    );
  }

  const childData = data.data;
  const language = childData.language || 'pt-BR';

  return (
    <div className="min-h-screen bg-[#0f172a] py-12 px-4 md:px-8 relative overflow-hidden">
      {/* Estrelas de fundo com gradiente radial nativo */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_center,#1e293b_0%,#0f172a_100%)]">
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-12 text-center print:hidden">
          <div className="inline-block px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            Portal do Profissional • Visualização Segura
          </div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter mb-2">Relatório de Missão: {childData.name}</h2>
          <p className="text-white/40 text-xs max-w-md mx-auto leading-relaxed">
            Este relatório contém dados de desempenho e observações comportamentais capturados pelo sistema Desafio das Estrelas.
          </p>
        </div>
        
        <div className="bg-[#16213e]/60 backdrop-blur-2xl border-2 border-white/5 rounded-[40px] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
          <ClinicalReport activeChild={childData} language={language} isSharedView={true} />
        </div>

        <div className="mt-12 text-center flex flex-col items-center gap-4 print:hidden">
          <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
            Desafio das Estrelas • Gamificação & Desenvolvimento
          </div>
          <div className="w-1 h-12 bg-gradient-to-b from-primary/20 to-transparent rounded-full" />
        </div>
      </div>
    </div>
  );
}
