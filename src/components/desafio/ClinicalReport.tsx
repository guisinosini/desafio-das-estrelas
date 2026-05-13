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
  Calendar as CalendarIcon
} from 'lucide-react';
import type { ChildData, Task } from '@/types/desafio';

interface ClinicalReportProps {
  activeChild?: ChildData | null;
}

export const ClinicalReport: React.FC<ClinicalReportProps> = ({ activeChild }) => {
  const [mentorNotes, setMentorNotes] = useState('');
  // Filtros de período
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

  // Cálculos do período
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Deduções de estrelas (Atritos de comportamento)
  const behaviorDeductions = history.filter(h => h.type === 'loss' || h.amount < 0 || h.title.includes('Birra') || h.title.includes('obedeceu') || h.title.includes('Agressividade'));
  const totalDeductionsCount = behaviorDeductions.length;

  // Ganhos de estrelas (Reforço positivo)
  const starGains = history.filter(h => h.type === 'gain' && h.amount > 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 clinical-report-container" style={{ background: 'transparent' }}>
      {/* Barra superior de Ação (Escondida na impressão) */}
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
        <div className="flex gap-2 items-center">
          <label className="text-xs font-black uppercase text-white/40">De:</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary" />
          <label className="text-xs font-black uppercase text-white/40">Até:</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary" />
        </div>
        {/* Botão WhatsApp */}
        <button
          onClick={() => {
            const reportText = `Relatório de ${activeChild.name} - ${new Date().toLocaleDateString('pt-BR')}`;
            const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(reportText)}`;
            window.open(url, '_blank');
          }}
          className="px-6 py-3 bg-green-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M9 9h6M9 13h6M9 17h6" /></svg>
          Enviar por WhatsApp
        </button>
        <button
          onClick={handlePrint}
          className="px-6 py-4 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2 shrink-0"
        >
          <Printer className="w-4 h-4" /> Exportar PDF / Imprimir
        </button>
      </div>
      </div>

      {/* --- PÁGINA DO RELATÓRIO (Visível na tela e formatada na impressão) --- */}
      <div className="bg-white/5 border border-white/10 rounded-[40px] p-6 sm:p-10 backdrop-blur-xl print:bg-white print:text-black print:border-none print:p-0 print:shadow-none space-y-8 text-white">
        
        {/* Cabeçalho do Documento */}
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

        {/* Gráfico de Barras - Missões Realizadas */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Missões Realizadas
          </h3>
          <div className="grid gap-2">
            {(() => {
              const counts: Record<string, number> = {};
              tasks.forEach(t => {
                if (t.status === 'done') {
                  counts[t.title] = (counts[t.title] || 0) + 1;
                }
              });
              const max = Math.max(...Object.values(counts), 1);
              return Object.entries(counts).map(([title, cnt]) => (
                <div key={title} className="flex items-center gap-2">
                  <span className="w-32 text-xs text-white/60">{title}</span>
                  <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(cnt / max) * 100}%` }}></div>
                  </div>
                  <span className="text-xs text-white/80 w-12 text-right">{cnt}</span>
                </div>
              ));
            })()}
          </div>
        </div>

          <div className="p-6 bg-white/5 print:bg-zinc-50 border border-white/5 print:border-zinc-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 print:text-emerald-700">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Adesão a Hábitos</span>
            </div>
            <div className="text-3xl font-black italic tracking-tighter print:text-black">
              {taskCompletionRate}%
            </div>
            {/* Medidor Gráfico Linear */}
            <div className="w-full h-2 bg-white/10 print:bg-zinc-200 rounded-full overflow-hidden relative mt-2">
              <div 
                className="h-full bg-emerald-400 print:bg-emerald-500 rounded-full transition-all duration-1000" 
                style={{ width: `${taskCompletionRate}%` }} 
              />
            </div>
            <p className="text-[10px] text-white/40 print:text-zinc-600 leading-relaxed pt-1">
              Taxa de conclusão de missões cadastradas ({doneTasks} de {totalTasks} tarefas concluídas na iteração atual). Reflete o engajamento e a constância na rotina visual.
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
              Episódios de desregulação ou quebra de combinados pontuados na Ponte de Comportamento. Indicador valioso para mapear gatilhos no ambiente familiar.
            </p>
          </div>
        </div>

        {/* Evolução por Grande Objetivo (Planetas) */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary print:text-zinc-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Engajamento por Objetivo Terapêutico (Planetas)
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {planets.map(planet => {
              const planetTasks = tasks.filter(t => t.planetId === planet.id);
              const completedCounts: Record<string, number> = {};
              planetTasks.forEach(t => {
                if (t.status === 'done') {
                  completedCounts[t.title] = (completedCounts[t.title] || 0) + 1;
                }
              });
              const totalCompleted = Object.values(completedCounts).reduce((a, b) => a + b, 0);
              const planetRate = planetTasks.length > 0 ? Math.round((totalCompleted / planetTasks.length) * 100) : 0;
              return (
                <div key={planet.id} className="p-4 bg-white/5 print:bg-zinc-50 rounded-xl border border-white/5 print:border-zinc-200 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{planet.icon || "🪐"}</span>
                      <div>
                        <h4 className="text-sm font-bold print:text-black">{planet.title}</h4>
                        <p className="text-[10px] text-white/40 print:text-zinc-500">
                          {planetTasks.length} missão(ões) vinculada(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black print:text-zinc-700">
                        {totalCompleted}/{planetTasks.length} ({planetRate}%)
                      </span>
                      {totalCompleted === planetTasks.length && planetTasks.length > 0 && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                  </div>

                  {/* Lista de tarefas concluídas por planeta */}
                  <ul className="list-disc list-inside text-xs text-white/60">
                    {Object.entries(completedCounts).map(([title, cnt]) => (
                      <li key={title}>
                        {title}: {cnt} vez(es) concluída(s)
                      </li>
                    ))}
                  </ul>

                  {/* Barra Gráfica de Progresso do Objetivo */}
                  <div className="w-full h-1.5 bg-white/5 print:bg-zinc-200 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-primary print:bg-primary rounded-full transition-all duration-1000" 
                      style={{ width: `${planetRate}%` }} 
                    />
                  </div>
                </div>
              );
            })}
            {planets.length === 0 && (
              <p className="text-xs text-white/40 print:text-zinc-500 italic">
                Nenhum Planeta (Objetivo Maior) mapeado no momento. Use a aba "Sala de Controle" para vincular tarefas a grandes metas.
              </p>
            )}
          </div>
        </div>

        {/* Gráfico de Barras - Punições Sofridas */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Punições Sofridas
          </h3>
          <div className="grid gap-2">
            {(() => {
              const counts: Record<string, number> = {};
              behaviorDeductions.forEach(b => {
                const label = b.title;
                counts[label] = (counts[label] || 0) + 1;
              });
              const max = Math.max(...Object.values(counts), 1);
              return Object.entries(counts).map(([label, cnt]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-32 text-xs text-white/60">{label}</span>
                  <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${(cnt / max) * 100}%` }}></div>
                  </div>
                  <span className="text-xs text-white/80 w-12 text-right">{cnt}</span>
                </div>
              ));
            })()}
          </div>
        </div>

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

        {/* Diário de Bordo / Observações dos Pais */}
        <div className="space-y-3 print:pt-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/60 print:text-zinc-800 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Observações da Família (Diário de Bordo)
          </h3>
          
          {/* TextArea editável na tela, renderizado como parágrafo limpo na impressão */}
          <div className="print:hidden">
            <textarea
              value={mentorNotes}
              onChange={e => setMentorNotes(e.target.value)}
              placeholder="Escreva aqui observações sobre o sono, humor, adaptação escolar ou fatos relevantes da semana para o terapeuta ler..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-primary resize-none"
            />
          </div>
          
          <div className="hidden print:block text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed border-l-2 border-zinc-400 pl-4 py-1">
            {mentorNotes || "Nenhuma observação adicional preenchida pelo mentor neste período."}
          </div>
        </div>

        {/* Rodapé Clínico na Impressão */}
        <div className="hidden print:block pt-12 border-t border-zinc-300 text-center text-[9px] text-zinc-500 uppercase tracking-widest">
          Documento gerado através do sistema Desafio das Estrelas • Gamificação & Acompanhamento de Desenvolvimento Infantil
        </div>

      </div>
    </div>
  );
};
