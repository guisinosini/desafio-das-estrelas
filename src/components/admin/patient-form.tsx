"use client";

import React, { useState } from "react";
import { clsx } from "clsx";

interface PatientFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PatientForm({ initialData, onSave, onCancel, isLoading }: PatientFormProps) {
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    cpf: initialData?.cpf || "",
    birth_date: initialData?.birth_date || "",
    active: initialData?.active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 text-white">
        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Nome Completo</label>
          <input
            required
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Ex: Maria Silva"
            className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-zinc-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">E-mail</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
              className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Telefone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
              className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">CPF</label>
            <input
              required
              type="text"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              placeholder="000.000.000-00"
              className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Data de Nascimento</label>
            <input
              required
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-zinc-800/60 rounded-2xl border border-zinc-700/50">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="w-5 h-5 rounded-lg accent-primary"
          />
          <label htmlFor="active" className="text-sm font-medium text-zinc-400">Paciente Ativo</label>
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
          {isLoading ? "Salvando..." : "Salvar Paciente"}
        </button>
      </div>
    </form>
  );
}
