"use client";

import React, { useState } from "react";
import { clsx } from "clsx";

interface ProfessionalFormProps {
  initialData?: any;
  services: any[];
  onSave: (data: any, selectedServiceIds: string[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProfessionalForm({ initialData, services, onSave, onCancel, isLoading }: ProfessionalFormProps) {
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    specialty: initialData?.specialty || "",
    crm: initialData?.crm || "",
    active: initialData?.active ?? true,
  });

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    initialData?.services?.map((s: any) => s.service_id) || []
  );

  const toggleService = (id: string) => {
    setSelectedServiceIds(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, selectedServiceIds);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="space-y-6 text-white">
        {/* ... existing fields ... */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Nome Completo</label>
            <input
              required
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Ex: Dra. Julia Mendes"
              className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-zinc-400 shadow-inner"
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
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Especialidade Principal</label>
              <input
                required
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Ex: Neuropsicologia"
                className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">CRM / Registro (Opcional)</label>
              <input
                type="text"
                value={formData.crm}
                onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                placeholder="000000-UF"
                className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* New: Clinical Services Selection */}
          <div className="space-y-3 pt-4">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Serviços Habilitados</label>
            <div className="grid grid-cols-1 gap-2">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => toggleService(svc.id)}
                  className={clsx(
                    "flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                    selectedServiceIds.includes(svc.id) 
                      ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(212,175,55,0.1)]" 
                      : "bg-zinc-900/20 border-zinc-700/50 hover:border-zinc-700/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "w-4 h-4 rounded border transition-colors flex items-center justify-center",
                      selectedServiceIds.includes(svc.id) ? "bg-primary border-primary" : "border-zinc-700/50"
                    )}>
                      {selectedServiceIds.includes(svc.id) && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                    </div>
                    <span className="text-sm font-medium">{svc.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-primary transition-colors">
                    {svc.duration} min
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-zinc-800/60 rounded-2xl border border-zinc-700/50 mt-4">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-5 h-5 rounded-lg accent-primary"
            />
            <label htmlFor="active" className="text-sm font-medium text-zinc-400">Profissional Ativo para Agendamento</label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-zinc-700/50 sticky bottom-0 bg-zinc-900/60 backdrop-blur-xl">
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
          {isLoading ? "Salvando..." : "Salvar Profissional"}
        </button>
      </div>
    </form>
  );
}
