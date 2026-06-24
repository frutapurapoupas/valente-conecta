"use client";
import React from 'react';

interface Supplier {
  id?: string | number;
  nomeEmpresa?: string;
  telefone?: string;
  email?: string;
  servicos?: string[] | string;
  endereco?: string;
  preco?: number;
  price?: number;
  imagem?: string;
  image?: string;
}

export default function MachineCard({ supplier }: { supplier: Supplier }) {
  const nome = supplier.nomeEmpresa || supplier.fornecedorNome || (supplier as any).nome || 'Fornecedor';
  const endereco = supplier.endereco || supplier.fornecedorEndereco || (supplier as any).address || 'Endereço não informado';
  const preco = (supplier.preco ?? supplier.price) ? `R$ ${(supplier.preco ?? supplier.price).toString()}` : null;
  const imagem = supplier.imagem || supplier.image || '/images/placeholder-machine.png';
  const telefone = supplier.telefone || supplier.fornecedorTelefone || '';

  return (
    <div className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/6">
      <div className="w-28 h-20 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
        <img src={imagem} alt={nome} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <h3 className="text-white font-bold">{nome}</h3>
        <p className="text-sm text-gray-300 mt-1">{endereco}</p>
        {preco && <p className="text-sm text-emerald-400 font-semibold mt-2">{preco}</p>}
      </div>
      <div className="flex flex-col items-end gap-2">
        {telefone ? (
          <a className="text-sm bg-green-600 text-black px-3 py-2 rounded-full font-medium" href={`https://wa.me/${telefone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp</a>
        ) : (
          <button className="text-sm bg-gray-700 text-white px-3 py-2 rounded-full" disabled>Sem contato</button>
        )}
      </div>
    </div>
  );
}
