"use client";

// Caminho: C:\valente_conecta\components\pdv\ModalCompletarPerfilVitrine.tsx
//
// Formulário de nome da loja + endereço + categoria do negócio, pedido na
// hora de publicar estoque do PDV na vitrine pública (POST /api/pdv/
// perfil-vitrine) — usado tanto pelo cadastro individual (/pdv/estoque)
// quanto pela importação de planilha (/pdv/importar-estoque), já que os
// dois publicam na mesma vitrine e caem na mesma exigência de perfil.

import { useState } from "react";
import { Megaphone, X } from "lucide-react";

interface Props {
  nomeInicial?: string;
  enderecoInicial?: string;
  categoriaNegocioInicial?: string;
  categoriasNegocio: { id: string; nome: string }[];
  salvando: boolean;
  onClose: () => void;
  onConfirmar: (dados: { nome: string; endereco: string; categoriaNegocio: string }) => void;
}

export function ModalCompletarPerfilVitrine({
  nomeInicial = "",
  enderecoInicial = "",
  categoriaNegocioInicial = "",
  categoriasNegocio,
  salvando,
  onClose,
  onConfirmar,
}: Props) {
  const [nome, setNome] = useState(nomeInicial);
  const [endereco, setEndereco] = useState(enderecoInicial);
  const [categoriaNegocio, setCategoriaNegocio] = useState(categoriaNegocioInicial);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><Megaphone className="w-4.5 h-4.5 text-blue-600" /> Complete o perfil da loja</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <p className="text-sm text-gray-500 mb-3">Esses dados aparecem junto dos seus produtos na vitrine pública do app — só precisa preencher uma vez.</p>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Nome da loja</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Mercadinho da Dona Neide" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" autoFocus />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Endereço</label>
            <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número, bairro — Valente/BA" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Categoria do negócio</label>
            <select value={categoriaNegocio} onChange={(e) => setCategoriaNegocio(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="">Selecione...</option>
              {categoriasNegocio.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onConfirmar({ nome: nome.trim(), endereco: endereco.trim(), categoriaNegocio })}
            disabled={salvando}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60"
          >
            {salvando ? "Publicando..." : "Salvar e publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
