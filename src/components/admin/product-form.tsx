"use client";

import React, { useState } from "react";
import { clsx } from "clsx";

interface ProductFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductForm({ initialData, onSave, onCancel, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    stock_quantity: initialData?.stock_quantity ?? 0,
    is_digital: initialData?.is_digital ?? false,
    active: initialData?.active ?? true,
    digital_file_url: initialData?.digital_file_url || null,
    image_url: initialData?.image_url || null,
  });
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, digitalFile, imageFile });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar: Image Upload */}
      <div className="space-y-4">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Imagem do Produto</label>
        <div className="relative group">
          <input
            type="file"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
            accept="image/*"
          />
          <label 
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center aspect-square w-full bg-zinc-800 border-2 border-dashed border-zinc-700/50 rounded-[40px] cursor-pointer hover:border-primary/50 hover:bg-zinc-800/80 transition-all overflow-hidden relative"
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-xs font-black text-white uppercase tracking-widest bg-zinc-900/80 px-4 py-2 rounded-full">Alterar Foto</span>
                </div>
              </>
            ) : (
              <div className="text-center p-6 space-y-2">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl">📸</div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Clique para subir imagem</p>
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">(Tamanho recomendado: 800x800px)</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Main Content: Info */}
      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-4 text-white">
        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Nome do Produto</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Suplemento Foco & Performance"
            className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-zinc-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva o produto e seus benefícios..."
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-zinc-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {!formData.is_digital && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Estoque</label>
              <input
                required
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}
          <div className={clsx("space-y-1", formData.is_digital ? "col-span-2" : "")}>
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

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 p-4 bg-zinc-800/60 rounded-2xl border border-zinc-700/50">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-5 h-5 rounded-lg accent-primary"
            />
            <label htmlFor="active" className="text-sm font-medium text-zinc-400">Produto Ativo</label>
          </div>

          <div className="flex items-center gap-3 p-4 bg-zinc-800/60 rounded-2xl border border-zinc-700/50">
            <input
              type="checkbox"
              id="is_digital"
              checked={formData.is_digital}
              onChange={(e) => setFormData({ ...formData, is_digital: e.target.checked })}
              className="w-5 h-5 rounded-lg accent-primary"
            />
            <label htmlFor="is_digital" className="text-sm font-medium text-zinc-400">Produto Digital (Download)</label>
          </div>
        </div>

        {formData.is_digital && (
          <div className="space-y-2 p-6 bg-primary/5 border border-primary/20 rounded-[32px] animate-in zoom-in-95 duration-300">
            <label className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
              Anexar Arquivo Digital
            </label>
            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-2">E-book, Vídeo, Áudio ou Imagem</p>
            
            <input
              type="file"
              onChange={(e) => setDigitalFile(e.target.files?.[0] || null)}
              className="hidden"
              id="digital-upload"
              accept=".pdf,.mp3,.mp4,.jpg,.png,.jpeg,.zip"
            />
            
            <label 
              htmlFor="digital-upload"
              className="flex items-center justify-center gap-3 w-full py-8 border-2 border-dashed border-primary/30 rounded-2xl cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all group"
            >
              {digitalFile ? (
                <div className="text-center">
                  <p className="text-sm font-bold text-primary">{digitalFile.name}</p>
                  <p className="text-[10px] text-zinc-500 uppercase mt-1">Clique para alterar</p>
                </div>
              ) : formData.digital_file_url ? (
                <div className="text-center">
                  <p className="text-sm font-bold text-emerald-500 italic">Arquivo já anexado</p>
                  <p className="text-[10px] text-zinc-500 uppercase mt-1">Clque para substituir</p>
                </div>
              ) : (
                <div className="text-center group-hover:scale-105 transition-transform">
                  <span className="text-lg">📁</span>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2">Selecionar Arquivo</p>
                </div>
              )}
            </label>
          </div>
        )}
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
          {isLoading ? "Salvando..." : "Salvar Produto"}
        </button>
        </div>
      </div>
    </form>
  );
}
