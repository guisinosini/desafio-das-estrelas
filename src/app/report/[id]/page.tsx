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
    <div className="min-h-screen bg-[#0f172a] py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center print:hidden">
          <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-black uppercase tracking-widest mb-4">
            Visualização Digital de Relatório
          </div>
          <p className="text-white/40 text-xs">
            Este é um link de acesso seguro e temporário compartilhado pelo mentor do Herói.
          </p>
        </div>
        
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden">
          <ClinicalReport activeChild={childData} language={language} />
        </div>

        <div className="mt-12 text-center text-white/20 text-[10px] font-black uppercase tracking-[0.3em] print:hidden">
          Desafio das Estrelas • Sistema de Gamificação Clínica
        </div>
      </div>
    </div>
  );
}
