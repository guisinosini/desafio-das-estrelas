"use client";

import React from "react";
import { Search, Plus, Edit2, Trash2, UserPlus, ChevronLeft, ChevronRight, ArrowUpDown, RefreshCcw, Link2, Mail } from "lucide-react";
import { clsx } from "clsx";

interface DataTableProps {
  title: string;
  description: string;
  buttonLabel?: string;
  columns: string[];
  data: any[];
  renderRow: (item: any) => React.ReactNode;
  onAddClick?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onLink?: (item: any) => void;
  onInvite?: (item: any) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
  };
}

export function DataTable({ 
  title, 
  description, 
  buttonLabel, 
  columns, 
  data, 
  renderRow, 
  onAddClick,
  onEdit,
  onDelete,
  onLink,
  onInvite,
  onRefresh,
  isRefreshing,
  pagination,
  search
}: DataTableProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex border-b border-white/5 pb-6 flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white italic">{title}</h1>
          <p className="text-white/60 text-sm mt-1 italic">{description}</p>
        </div>
        {buttonLabel && (
          <button 
            onClick={onAddClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-[0_10px_30px_rgba(212,175,55,0.3)] transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            {buttonLabel}
          </button>
        )}
      </div>

      <div className="bg-black/20 backdrop-blur-3xl border-white/5 rounded-[32px] overflow-hidden border">
        <div className="p-5 border-b border-white/5 flex items-center justify-between gap-3 bg-white/5">
          {search && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                className="bg-black/20 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all w-80 text-white placeholder:text-white/20"
              />
            </div>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:text-primary transition-all group shadow-lg"
              title="Atualizar dados"
            >
              <RefreshCcw className={clsx("w-4 h-4", isRefreshing && "animate-spin text-primary")} />
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                {columns.map((col) => (
                  <th key={col} className="px-8 py-5 text-left text-[10px] font-black text-white/40 uppercase tracking-[0.3em] border-b border-white/5">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                      {col}
                      <ArrowUpDown className="w-3 h-3 opacity-20" />
                    </div>
                  </th>
                ))}
                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] border-b border-white/5 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.length > 0 ? (
                data.map((item, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    {renderRow(item)}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        {onInvite && (
                          <button 
                            onClick={() => onInvite(item)}
                            className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl text-white/40 hover:text-emerald-400 hover:border-emerald-400/30 transition-all"
                            title="Enviar Convite"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        {onLink && (
                          <button 
                            onClick={() => onLink(item)}
                            className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl text-white/40 hover:text-blue-400 hover:border-blue-400/30 transition-all"
                            title="Vincular a Usuário"
                          >
                            <Link2 className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(item)}
                            className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl text-white/40 hover:text-primary hover:border-primary/30 transition-all"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(item)}
                            className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl text-white/40 hover:text-red-500 hover:border-red-500/30 transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="px-8 py-20 text-center text-white/20 text-xs font-black uppercase tracking-[0.3em] italic">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {pagination && (
        <div className="flex items-center justify-between px-8 py-5 bg-black/20 border border-white/5 rounded-[24px] backdrop-blur-xl">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
            Página <span className="text-primary">{pagination.currentPage}</span> de <span className="text-white/60">{pagination.totalPages}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1 || isRefreshing}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white disabled:opacity-10 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage >= pagination.totalPages || isRefreshing}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white disabled:opacity-10 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
