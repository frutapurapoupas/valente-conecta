"use client";
import React from 'react';
import { Item } from '@/modules-scaffold/types/modules';
import { ArrowLeft, Phone, MapPin } from 'lucide-react';

export default function DetailView({
  item,
  onBack,
}: {
  item: Item;
  onBack?: () => void;
}) {
  return (
    <div className="rounded-3xl p-6 bg-slate-900 border border-white/10">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      )}

      {item.imagem && (
        <img
          src={item.imagem}
          alt={item.nome}
          className="w-full h-64 object-cover rounded-2xl mb-6"
        />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">{item.nome}</h1>
          {item.categoria && (
            <span className="inline-block mt-2 px-3 py-1 text-sm rounded-lg bg-cyan-500/20 text-cyan-300">
              {item.categoria}
            </span>
          )}
        </div>

        {item.descricao && (
          <div>
            <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-2">Descrição</h2>
            <p className="text-gray-300 leading-relaxed">{item.descricao}</p>
          </div>
        )}

        {item.preco !== undefined && (
          <div>
            <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-2">Preço</h2>
            <p className="text-3xl font-bold text-emerald-400">
              R$ {item.preco.toFixed(2)}
            </p>
          </div>
        )}

        <div className="space-y-3 pt-4">
          {item.telefone && (
            <a
              href={`https://wa.me/${item.telefone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 transition text-emerald-300"
            >
              <Phone className="h-5 w-5" />
              <div>
                <p className="text-sm text-gray-400">Contato</p>
                <p className="font-semibold">{item.telefone}</p>
              </div>
            </a>
          )}

          {item.fornecedorNome && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400">Fornecedor</p>
              <p className="font-semibold text-white">{item.fornecedorNome}</p>
            </div>
          )}

          {item.status && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400">Status</p>
              <span
                className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${
                  item.status === 'publicado'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-orange-500/15 text-orange-300'
                }`}
              >
                {item.status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
