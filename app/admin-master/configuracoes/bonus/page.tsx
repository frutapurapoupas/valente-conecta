"use client";

import { Briefcase, Building, Save, Users, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

interface BonusConfig {
  id: string;
  nome: string;
  bonus: number;
  meta: number;
  ativo: boolean;
  descricao?: string;
}

interface BonusContentConfig {
  publicHeadline: string;
  publicSubtitle: string;
  explanationTitle: string;
  explanationText: string;
  shareTemplate: string;
}

export default function ConfiguracoesBonusPage() {
  const [bonus, setBonus] = useState<BonusConfig[]>([
    { id: "usuarios_gerais", nome: "Usuários Gerais", bonus: 10, meta: 30, ativo: true, descricao: "Bônus a cada lote de 30 usuários novos validados" },
    { id: "empresas_lojas", nome: "Empresas / Lojas", bonus: 5, meta: 3, ativo: true, descricao: "Bônus a cada lote de 3 empresas ou lojas validadas" },
    { id: "profissionais_liberais", nome: "Profissionais Liberais", bonus: 4, meta: 5, ativo: true, descricao: "Bônus a cada lote de 5 profissionais liberais validados" }
  ]);
  const [pixMinimo, setPixMinimo] = useState(1);
  const [content, setContent] = useState<BonusContentConfig>({
    publicHeadline: "Ganhe dinheiro indicando!",
    publicSubtitle: "Receba bônus por lotes de indicações validadas.",
    explanationTitle: "Como funcionam as bonificações",
    explanationText: "Cada bônus é liberado por lote validado: usuários gerais, empresas/lojas e profissionais liberais.",
    shareTemplate: "Use meu código {codigo}. Bônus por lotes validados no Valente Conecta. Link: {link}"
  });

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/referrals/config');
        const result = await response.json();
        if (result?.success && result.data?.rules) {
          setBonus(result.data.rules);
          setPixMinimo(Number(result.data.pixMinimo || 1));
          if (result.data.content) {
            setContent(result.data.content);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configuração de bônus', error);
      }
    }

    load();
  }, []);

  const handleSave = async () => {
    const response = await fetch('/api/referrals/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rules: bonus, pixMinimo, content })
    });
    const result = await response.json();
    if (result?.success) {
      alert("✅ Configurações de bônus salvas!");
      return;
    }
    alert("❌ Não foi possível salvar as configurações.");
  };

  const handleToggle = (id: string) => {
    setBonus(bonus.map(b => b.id === id ? { ...b, ativo: !b.ativo } : b));
  };

  const handleBonusChange = (id: string, valor: number) => {
    setBonus(bonus.map(b => b.id === id ? { ...b, bonus: valor } : b));
  };

  const handleMetaChange = (id: string, valor: number) => {
    setBonus(bonus.map(b => b.id === id ? { ...b, meta: valor } : b));
  };

  const totalMensal = bonus.reduce((acc, b) => acc + (b.ativo ? b.bonus : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-gray-800">🎁 Configuração de Bônus</h1><p className="text-sm text-gray-500">Defina os valores de bônus por tipo de indicação</p></div>
        <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Save size={16} /> Salvar</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bonus.map(b => {
          const icones: Record<string, any> = {
            usuarios_gerais: Users,
            empresas_lojas: Building,
            profissionais_liberais: Briefcase,
          };
          const Icon = icones[b.id] || Users;
          return (
            <div key={b.id} className={`bg-white rounded-xl p-4 shadow-sm border ${b.ativo ? "border-gray-200" : "border-gray-200 bg-gray-50"}`}>
              <div className="flex items-center gap-3 mb-3"><Icon size={24} className="text-indigo-600" /><h3 className="font-bold text-lg">{b.nome}</h3></div>
              <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">Valor do lote</span><input type="number" value={b.bonus} onChange={(e) => handleBonusChange(b.id, parseFloat(e.target.value))} className="w-24 p-1 border rounded text-right font-bold text-green-600" step="0.5" /><span className="text-sm">R$</span></div>
              <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">Quantidade por lote</span><input type="number" value={b.meta} onChange={(e) => handleMetaChange(b.id, parseInt(e.target.value) || 0)} className="w-24 p-1 border rounded text-right font-bold text-indigo-600" step="1" /></div>
              <p className="text-xs text-gray-400 mb-3">{b.descricao}</p>
              <button onClick={() => handleToggle(b.id)} className={`w-full py-1 rounded-lg text-sm font-semibold ${b.ativo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>{b.ativo ? "✅ Ativo" : "❌ Inativo"}</button>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={20} className="text-emerald-600" />
          <h3 className="font-semibold text-lg">Solicitação de PIX</h3>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Valor mínimo disponível para solicitar recebimento</p>
            <p className="text-xs text-gray-400">Quando um lote fechar, o usuário recebe aviso e pode informar sua chave PIX.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">R$</span>
            <input type="number" value={pixMinimo} onChange={(e) => setPixMinimo(parseFloat(e.target.value) || 0)} className="w-28 p-2 border rounded text-right font-bold text-emerald-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-4">
        <h3 className="font-semibold text-lg">📝 Conteúdo da página de indicação (QR)</h3>

        <div>
          <label className="text-sm text-gray-600">Título público</label>
          <input
            type="text"
            value={content.publicHeadline}
            onChange={(e) => setContent((prev) => ({ ...prev, publicHeadline: e.target.value }))}
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Subtítulo público</label>
          <input
            type="text"
            value={content.publicSubtitle}
            onChange={(e) => setContent((prev) => ({ ...prev, publicSubtitle: e.target.value }))}
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Título do pop-up explicativo</label>
          <input
            type="text"
            value={content.explanationTitle}
            onChange={(e) => setContent((prev) => ({ ...prev, explanationTitle: e.target.value }))}
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Texto do pop-up explicativo</label>
          <textarea
            value={content.explanationText}
            onChange={(e) => setContent((prev) => ({ ...prev, explanationText: e.target.value }))}
            className="w-full mt-1 p-2 border rounded min-h-[90px]"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Template de compartilhamento</label>
          <input
            type="text"
            value={content.shareTemplate}
            onChange={(e) => setContent((prev) => ({ ...prev, shareTemplate: e.target.value }))}
            className="w-full mt-1 p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">Use {'{codigo}'} e {'{link}'} como variáveis.</p>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
        <div className="flex justify-between items-center"><span className="font-semibold">Total potencial mensal (todos ativos)</span><span className="text-2xl font-bold text-indigo-600">R$ {totalMensal.toFixed(2)}</span></div>
      </div>
    </div>
  );
}