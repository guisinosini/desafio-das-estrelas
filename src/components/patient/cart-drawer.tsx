"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus, CreditCard } from "lucide-react";
import { clsx } from "clsx";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  is_digital?: boolean;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout 
}: CartDrawerProps) {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-[100] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-white">Seu Carrinho</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
              {items.length > 0 ? (
                items.map((item) => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="flex gap-4 group"
                  >
                    <div className="w-20 h-20 bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700/50 flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl bg-zinc-800">
                          📦
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-zinc-100 text-sm line-clamp-1">{item.name}</h3>
                          <button 
                            onClick={() => onRemove(item.id)}
                            className="text-zinc-500 hover:text-red-500 transition-colors ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-primary font-bold mt-1">
                          {formatPrice(item.price)}
                          {item.is_digital && <span className="ml-2 text-[9px] uppercase tracking-widest bg-primary/10 px-1 border border-primary/20 rounded">Digital</span>}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center bg-zinc-800 rounded-lg border border-zinc-700/50">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1 px-2 hover:text-primary transition-colors disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-white w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 px-2 hover:text-primary transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center border border-zinc-700/30">
                    <ShoppingBag className="w-10 h-10 text-zinc-700" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Carrinho vazio</h3>
                    <p className="text-sm text-zinc-500 mt-1">Explore nossa loja e adicione <br/> produtos incríveis!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-zinc-900 border-t border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Subtotal</span>
                  <span className="text-xl font-black text-white">{formatPrice(total)}</span>
                </div>
                
                <button 
                  onClick={onCheckout}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group"
                >
                  <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Finalizar Pedido
                </button>
                
                <p className="text-[10px] text-zinc-500 text-center font-bold uppercase tracking-tighter">
                  🔒 Pagamento Seguro e Processamento Instantâneo
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
