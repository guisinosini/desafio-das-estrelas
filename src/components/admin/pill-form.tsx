"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

interface PillFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PillForm({ initialData, onSave, onCancel, isLoading }: PillFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    type: initialData?.type || "text",
    media_url: initialData?.media_url || "",
    is_active: initialData?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-zinc-400 mb-2">Título da Pílula</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="Ex: Dica de Leitura da Semana"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-400 mb-2">Tipo de Conteúdo</label>
          <select
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="text">Texto / Reflexão</option>
            <option value="quote">Citação Inspiradora</option>
            <option value="book">Recomendação de Livro</option>
            <option value="video">Vídeo Curto (YouTube/Vimeo)</option>
            <option value="image">Imagem</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-400 mb-2">Conteúdo / Mensagem</label>
          <textarea
            required
            rows={4}
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors custom-scrollbar"
            placeholder="Mensagem, reflexão, citação ou descrição metodológica..."
          />
        </div>

        {(formData.type === "video" || formData.type === "image" || formData.type === "book") && (
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">URL da Mídia (Capa do Livro, Vídeo, Imagem)</label>
            <input
              type="url"
              value={formData.media_url}
              onChange={e => setFormData({ ...formData, media_url: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="https://..."
            />
          </div>
        )}

        <div className="flex items-center gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-primary focus:ring-primary/20"
          />
          <label htmlFor="is_active" className="text-sm font-bold text-zinc-300">
            Pílula Ativa (Visível para pacientes)
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-transparent border border-zinc-700 text-zinc-300 font-bold rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Pílula"}
        </button>
      </div>
    </form>
  );
}
