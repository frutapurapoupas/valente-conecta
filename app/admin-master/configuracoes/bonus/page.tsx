"use client";

import { Award, Briefcase, Building, Calendar, Car, Dumbbell, Home, Package, Save, ShoppingBag, Users, Wrench } from "lucide-react";
import { useState } from "react";

interface BonusConfig {
  id: string;
  nome: string;
  bonus: number;
  meta: string;
  ativo: boolean;
}

export default function ConfiguracoesBonusPage() {
  const [bonus, setBonus] = useState<BonusConfig[]>([
    { id: "amigos", nome: "Amigos", bonus: 2, meta: "10 amigos", ativo: true },
    { id: "empresa", nome: "Empresas", bonus: 5, meta: "3 empresas", ativo: true },
    { id: "profissionais", nome: "Profissionais", bonus: 3, meta: "5 profissionais", ativo: true },
    { id: "academia", nome: "Academia", bonus: 10, meta: "2 indicações", ativo: true },
    { id: "ambulantes", nome: "Ambulantes", bonus: 4, meta: "5 ambulantes", ativo: true },
    { id: "aluguel", nome: "Aluguel", bonus: 8, meta: "3 imóveis", ativo: true },
    { id: "veiculos", nome: "Veículos", bonus: 6, meta: "4 veículos", ativo: true },
    { id: "eventos", nome: "Eventos", bonus: 12, meta: "2 eventos", ativo: true },
    { id: "servicos", nome: "Serviços", bonus: 5, meta: "6 serviços", ativo: true },
    { id: "produtos", nome: "Produtos", bonus: 3, meta: "10 produtos", ativo: true }
  ]);

  const handleSave = () => {
    localStorage.setItem("bonus_config", JSON.stringify(bonus));
    alert("✅ Configurações de bônus salvas!");
  };

  const handleToggle = (id: string) => {
    setBonus(bonus.map(b => b.id === id ? { ...b, ativo: !b.ativo } : b));
  };

  const handleBonusChange = (id: string, valor: number) => {
    setBonus(bonus.map(b => b.id === id ? { ...b, bonus: valor } : b));
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
            amigos: Users, empresa: Building, profissionais: Briefcase, academia: Dumbbell,
            ambulantes: ShoppingBag, aluguel: Home, veiculos: Car, eventos: Calendar,
            servicos: Wrench, produtos: Package
          };
          const Icon = icones[b.id] || Award;
          return (
            <div key={b.id} className={`bg-white rounded-xl p-4 shadow-sm border ${b.ativo ? "border-gray-200" : "border-gray-200 bg-gray-50"}`}>
              <div className="flex items-center gap-3 mb-3"><Icon size={24} className="text-indigo-600" /><h3 className="font-bold text-lg">{b.nome}</h3></div>
              <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">Bônus por indicação</span><input type="number" value={b.bonus} onChange={(e) => handleBonusChange(b.id, parseFloat(e.target.value))} className="w-24 p-1 border rounded text-right font-bold text-green-600" step="0.5" /><span className="text-sm">R$</span></div>
              <p className="text-xs text-gray-400 mb-3">Meta: {b.meta}</p>
              <button onClick={() => handleToggle(b.id)} className={`w-full py-1 rounded-lg text-sm font-semibold ${b.ativo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>{b.ativo ? "✅ Ativo" : "❌ Inativo"}</button>
            </div>
          );
        })}
      </div>

      <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
        <div className="flex justify-between items-center"><span className="font-semibold">Total potencial mensal (todos ativos)</span><span className="text-2xl font-bold text-indigo-600">R$ {totalMensal.toFixed(2)}</span></div>
      </div>
    </div>
  );
}