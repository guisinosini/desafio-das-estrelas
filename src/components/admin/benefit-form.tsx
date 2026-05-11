"use client";

import React, { useState } from "react";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { clsx } from "clsx";

interface BenefitFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function BenefitForm({ initialData, onSave, onCancel, isLoading }: BenefitFormProps) {
  const [formData, setFormData] = useState({
    company_name: initialData?.company_name || "",
    description: initialData?.description || "",
    coupon_code: initialData?.coupon_code || "",
    contact_link: initialData?.contact_link || "",
    contact_type: initialData?.contact_type || "site",
    max_uses_per_user: initialData?.max_uses_per_user || 1,
    active: initialData?.active ?? true,
    image_url: initialData?.image_url || "",
    imageFile: null as File | null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imageFile: e.target.files[0] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs font-black text-white uppercase tracking-widest mb-2">Imagem do Benefício</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
            {formData.imageFile ? (
              <img src={URL.createObjectURL(formData.imageFile)} alt="Preview" className="w-full h-full object-cover" />
            ) : formData.image_url ? (
              <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-6 h-6 text-white/20" />
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
            />
            <p className="text-[10px] text-white/40 mt-2 italic">Recomendado: 800x600px. JPG, PNG ou WEBP.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black text-white uppercase tracking-widest mb-2">Nome da Empresa</label>
          <input
            type="text"
            required
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="Ex: Farmácia São João"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-white uppercase tracking-widest mb-2">Nome do Cupom</label>
          <input
            type="text"
            required
            value={formData.coupon_code}
            onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors uppercase"
            placeholder="Ex: DESCONTO10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black text-white uppercase tracking-widest mb-2">Tipo de Contato</label>
          <select
            value={formData.contact_type}
            onChange={(e) => setFormData({ ...formData, contact_type: e.target.value })}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="site">Site (Página Web)</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="other">Outros</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-white uppercase tracking-widest mb-2">Link / Número</label>
          <input
            type="text"
            required
            value={formData.contact_link}
            onChange={(e) => setFormData({ ...formData, contact_link: e.target.value })}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
            placeholder={formData.contact_type === 'whatsapp' ? "Ex: 5511999999999 ou link wa.me" : "https://..."}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-black text-white uppercase tracking-widest mb-2">Descrição do Benefício</label>
        <textarea
          required
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors resize-none"
          placeholder="Descreva o que o cupom oferece..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black text-white uppercase tracking-widest mb-2">Limite de Usos por Usuário</label>
          <input
            type="number"
            min="1"
            required
            value={formData.max_uses_per_user}
            onChange={(e) => setFormData({ ...formData, max_uses_per_user: parseInt(e.target.value) || 1 })}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-white uppercase tracking-widest mb-2">Status</label>
          <select
            value={formData.active ? "true" : "false"}
            onChange={(e) => setFormData({ ...formData, active: e.target.value === "true" })}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl text-xs font-black text-white uppercase tracking-widest hover:bg-white/5 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 rounded-xl text-xs font-black text-black bg-primary uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {initialData ? "Salvar Alterações" : "Cadastrar Benefício"}
        </button>
      </div>
    </form>
  );
}
