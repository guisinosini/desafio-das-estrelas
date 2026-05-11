"use client";

import React, { useState } from "react";
import { clsx } from "clsx";

interface ServiceFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ServiceForm({ initialData, onSave, onCancel, isLoading }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    duration_minutes: initialData?.duration_minutes || 50,
    price: initialData?.price || "",
    active: initialData?.active ?? true,
    sessions_quantity: initialData?.sessions_quantity || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 text-white">
        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Nome do Serviço</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Psicoterapia Individual"
            className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-zinc-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva brevemente o serviço..."
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-zinc-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Duração (min)</label>
            <input
              required
              type="number"
              value={formData.duration_minutes || ""}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
              className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Preço (R$)</label>
            <input
              required
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0,00"
              className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Quantidade de Sessões</label>
          <input
            required
            type="number"
            min="1"
            value={formData.sessions_quantity || ""}
            onChange={(e) => setFormData({ ...formData, sessions_quantity: parseInt(e.target.value) || 1 })}
            className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 p-4 bg-zinc-800/60 rounded-2xl border border-zinc-700/50">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="w-5 h-5 rounded-lg accent-primary"
          />
          <label htmlFor="active" className="text-sm font-medium text-zinc-400">Serviço Ativo</label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-900 transition-all border border-zinc-700/50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={clsx(
            "flex-1 py-4 bg-primary text-primary-foreground font-bold rounded-2xl transition-all shadow-lg shadow-primary/20",
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90"
          )}
        >
          {isLoading ? "Salvando..." : "Salvar Serviço"}
        </button>
      </div>
    </form>
  );
}
