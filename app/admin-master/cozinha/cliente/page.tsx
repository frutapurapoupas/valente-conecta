'use client'

import { useEffect, useState } from 'react';

interface Prato {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  diaSemana: string;
  status: string;
  ordem: number;
  destaque: boolean;
}

export default function CozinhaClientePage() {
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [quantidades, setQuantidades] = useState<Record<number, number>>({});
  const [activeTab, setActiveTab] = useState<'salgados' | 'doces'>('salgados');
  const [diaSelecionado, setDiaSelecionado] = useState('');

  const dias = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];
  const diasNomes = { "SEGUNDA": "Segunda", "TERÇA": "Terça", "QUARTA": "Quarta", "QUINTA": "Quinta", "SEXTA": "Sexta", "SABADO": "Sábado", "DOMINGO": "Domingo" };

  useEffect(() => {
    async function carregarPratos() {
      try {
        const res = await fetch('/api/cozinha/cardapio')
        if (res.ok) {
          const json = await res.json()
          if (Array.isArray(json.cardapio) && json.cardapio.length > 0) {
            setPratos(json.cardapio)
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar cardápio do servidor:', error)
      }

      const stored = localStorage.getItem('cardapio_cozinha')
      if (stored) {
        const dados = JSON.parse(stored)
        setPratos(dados)
      }
    }

    carregarPratos()
    setDiaSelecionado(dias[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1])
  }, []);

  const aumentar = (id: number) => setQuantidades(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const diminuir = (id: number) => setQuantidades(prev => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));

  const fazerPedido = (item: Prato) => {
    const qtd = quantidades[item.id] || 1;
    window.open(`https://wa.me/5575999999999?text=🍽️ *Pedido*%0A${item.name}%0AQuantidade: ${qtd}%0ATotal: R$ ${(item.price * qtd).toFixed(2)}`, '_blank');
  };

  const pratosFiltrados = pratos.filter(p => p.status === "ativo" && p.diaSemana === diaSelecionado);

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <div className="sticky top-0 bg-black border-b border-yellow-500 px-4 py-5">
        <h1 className="text-3xl font-extrabold text-center text-yellow-400">COZINHA CHEF NEIDE</h1>
      </div>

      {/* Dias da semana */}
      <div className="px-4 mt-4 overflow-x-auto">
        <div className="flex gap-2">
          {dias.map(dia => (
            <button key={dia} onClick={() => setDiaSelecionado(dia)} className={`px-4 py-2 rounded-full text-sm ${diaSelecionado === dia ? 'bg-yellow-500 text-black' : 'bg-zinc-800'}`}>
              {diasNomes[dia]}
            </button>
          ))}
        </div>
      </div>

      {/* Cardápio */}
      <div className="px-4 py-5 space-y-6">
        {pratosFiltrados.map(item => {
          const qtd = quantidades[item.id] || 1;
          return (
            <div key={item.id} className="bg-zinc-900 rounded-3xl overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-56 object-cover" />
              <div className="p-5">
                <h2 className="text-2xl font-extrabold text-red-500">{item.name}</h2>
                <p className="text-gray-300 mt-3">{item.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-yellow-400 text-3xl font-extrabold">R$ {item.price.toFixed(2)}</span>
                  <div className="flex items-center gap-3 bg-zinc-800 rounded-full px-3 py-2">
                    <button onClick={() => diminuir(item.id)} className="bg-red-500 w-8 h-8 rounded-full">-</button>
                    <span className="text-lg w-6 text-center">{qtd}</span>
                    <button onClick={() => aumentar(item.id)} className="bg-green-500 w-8 h-8 rounded-full">+</button>
                  </div>
                </div>
                <button onClick={() => fazerPedido(item)} className="mt-6 w-full bg-green-500 rounded-2xl py-4 text-lg font-bold">FAZER PEDIDO</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}