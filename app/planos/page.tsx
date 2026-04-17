"use client";

import Link from "next/link";
import { Zap, Crown, Store, Wrench, Star, MapPin, Users, ShieldCheck } from "lucide-react";

const planosEmpresa = [
  {
    id: "gratuito",
    nome: "Grátis",
    preco: "R$ 0",
    descricao: "Para colocar sua loja no mapa",
    cor: "border-zinc-700",
    icone: <Store className="w-5 h-5 text-zinc-400" />,
    beneficios: [
      "Perfil público da loja",
      "Até 5 produtos no catálogo",
      "Status aberto/fechado",
      "Contatos visíveis apenas com desbloqueio (R$ 5,90)",
      "Sem destaque na busca",
    ],
  },
  {
    id: "basico",
    nome: "Básico",
    preco: "R$ 29,90/mês",
    descricao: "Para lojas e comércios locais · pré-pago",
    cor: "border-blue-500/40",
    icone: <Zap className="w-5 h-5 text-blue-400" />,
    beneficios: [
      "Tudo do plano Grátis",
      "Até 50 produtos no catálogo",
      "Contatos visíveis para todos (sem custo)",
      "Badge 'Verificado ✓' no perfil",
      "Prioridade na busca local",
      "Controle de estoque com relatório de custo e venda",
      "Exibição de patrimônio total (custo e valor de venda)",
      "🎁 20 dias grátis de boas-vindas",
    ],
  },
  {
    id: "premium",
    nome: "Premium",
    preco: "R$ 49,90/mês",
    descricao: "Para lojas que querem crescer · pré-pago",
    cor: "border-yellow-500/40",
    icone: <Crown className="w-5 h-5 text-yellow-400" />,
    beneficios: [
      "Tudo do plano Básico",
      "Catálogo ilimitado de produtos",
      "Inteligência comercial e relatórios",
      "Destaque no carrossel e publicidade",
      "PDV completo (vendas, estoque, fiado)",
      "🎁 20 dias grátis de boas-vindas",
    ],
  },
  {
    id: "fisco",
    nome: "Fisco",
    preco: "R$ 99,90/mês",
    descricao: "Módulo fiscal e contábil · pré-pago",
    cor: "border-emerald-500/40",
    icone: <Wrench className="w-5 h-5 text-emerald-400" />,
    beneficios: [
      "Tudo do plano Premium",
      "Módulo fiscal e contábil completo",
      "Emissão de relatórios tributários",
      "Integração com dados de movimento",
      "Suporte prioritário",
      "🎁 20 dias grátis de boas-vindas",
    ],
  },
];

const planosProfissional = [
  {
    id: "gratuito",
    nome: "Grátis",
    preco: "R$ 0",
    descricao: "Para começar a mostrar seu trabalho",
    cor: "border-zinc-700",
    icone: <Star className="w-5 h-5 text-zinc-400" />,
    beneficios: [
      "Perfil público básico",
      "Catálogo de serviços visível (preços borrados)",
      "Desbloqueio de preços por pagamento",
      "Sem contatos visíveis",
    ],
  },
  {
    id: "basico",
    nome: "Básico",
    preco: "R$ 15,00/mês",
    descricao: "Ideal para profissionais autônomos",
    cor: "border-violet-500/40",
    icone: <Zap className="w-5 h-5 text-violet-400" />,
    beneficios: [
      "Tudo do plano Grátis",
      "Preços visíveis para todos",
      "Telefone e e-mail visíveis",
      "Badge 'Verificado ✓' no perfil",
      "Prioridade na busca",
    ],
  },
  {
    id: "premium",
    nome: "Premium",
    preco: "R$ 25,00/mês",
    descricao: "Para profissionais que querem crescer",
    cor: "border-yellow-500/40",
    icone: <Crown className="w-5 h-5 text-yellow-400" />,
    beneficios: [
      "Tudo do plano Básico",
      "Catálogo ilimitado",
      "Posição de destaque na busca",
      "Relatórios de visitas ao perfil",
      "Suporte prioritário",
      "Link personalizado do perfil",
    ],
  },
];

const planosAmbulante = [
  {
    id: "gratuito",
    nome: "Grátis",
    preco: "R$ 0",
    descricao: "Para começar a vender na rua",
    cor: "border-zinc-700",
    icone: <Star className="w-5 h-5 text-zinc-400" />,
    beneficios: [
      "Perfil público básico",
      "Catálogo de produtos visível (preços borrados)",
      "Desbloqueio de preços por pagamento",
      "Sem contatos visíveis",
    ],
  },
  {
    id: "basico",
    nome: "Básico",
    preco: "R$ 15,00/mês",
    descricao: "Para ambulantes em crescimento",
    cor: "border-amber-500/40",
    icone: <Zap className="w-5 h-5 text-amber-400" />,
    beneficios: [
      "Tudo do plano Grátis",
      "Preços visíveis para todos",
      "Telefone e WhatsApp visíveis",
      "Badge 'Verificado ✓' no perfil",
      "Prioridade na busca local",
    ],
  },
  {
    id: "premium",
    nome: "Premium",
    preco: "R$ 25,00/mês",
    descricao: "Para ambulantes que querem crescer",
    cor: "border-yellow-500/40",
    icone: <Crown className="w-5 h-5 text-yellow-400" />,
    beneficios: [
      "Tudo do plano Básico",
      "Catálogo ilimitado de produtos",
      "Destaque na busca e no mapa",
      "Relatórios de visitas ao perfil",
      "Suporte prioritário",
    ],
  },
];

const planosUsuario = [
  {
    id: "gratuito",
    nome: "Grátis",
    preco: "R$ 0",
    descricao: "Acesso básico à plataforma",
    cor: "border-zinc-700",
    icone: <Users className="w-5 h-5 text-zinc-400" />,
    beneficios: [
      "Consultas inteligentes na cidade base (livre)",
      "Desbloqueio de contatos por uso (valor configurável)",
      "Carteira e indicações",
      "Acesso a ofertas locais",
    ],
    avulsos: [
      { label: "Desbloquear contato de 1 resultado", valor: "R$ 1,00 (mín.)" },
    ],
  },
  {
    id: "cidades",
    nome: "Multi-Cidade",
    preco: "R$ 29,90/mês",
    descricao: "Consultas inteligentes em cidades adicionais",
    cor: "border-blue-500/40",
    icone: <MapPin className="w-5 h-5 text-blue-400" />,
    beneficios: [
      "Tudo do plano Grátis",
      "Consultas inteligentes em qualquer cidade desbloqueada",
      "Histórico de buscas salvo",
      "Prioridade nos resultados",
    ],
    avulsos: [
      { label: "Desbloquear contato de 1 resultado", valor: "R$ 1,00 (mín.)" },
    ],
  },
];

function PlanoCard({ plano }: { plano: any }) {
  return (
    <div className={`bg-zinc-900 border ${plano.cor} rounded-2xl p-5 flex-1 min-w-[260px] max-w-xs flex flex-col`}>
      <div className="flex items-center gap-2 mb-2">
        {plano.icone}
        <h3 className="font-black text-lg text-white">{plano.nome}</h3>
      </div>
      <p className="text-2xl font-black text-white mb-1">{plano.preco}</p>
      <p className="text-xs text-zinc-400 mb-3">{plano.descricao}</p>
      <ul className="text-sm text-zinc-300 space-y-1 mb-2 pl-4 list-disc">
        {plano.beneficios.map((b: string, i: number) => <li key={i}>{b}</li>)}
      </ul>
      {plano.avulsos && (
        <div className="mt-2">
          <p className="text-xs text-zinc-400 font-bold mb-1">Avulsos:</p>
          <ul className="text-xs text-zinc-300 pl-4 list-disc">
            {plano.avulsos.map((a: any, i: number) => <li key={i}>{a.label}: <span className="font-bold">{a.valor}</span></li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function TodosPlanosPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-5 flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase italic text-white leading-none">Planos e Benefícios</h1>
        <p className="text-zinc-400">Veja todos os planos disponíveis para cada tipo de usuário</p>
      </header>
      <main className="max-w-6xl mx-auto p-4 space-y-12">
        <section>
          <h2 className="text-xl font-black text-blue-400 mb-4 flex items-center gap-2"><Store className="w-5 h-5" /> Empresas & Lojas</h2>
          <div className="flex flex-wrap gap-5">
            {planosEmpresa.map(plano => <PlanoCard key={plano.id} plano={plano} />)}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-black text-violet-400 mb-4 flex items-center gap-2"><Star className="w-5 h-5" /> Profissionais Liberais</h2>
          <div className="flex flex-wrap gap-5">
            {planosProfissional.map(plano => <PlanoCard key={plano.id} plano={plano} />)}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-black text-amber-400 mb-4 flex items-center gap-2"><Zap className="w-5 h-5" /> Ambulantes</h2>
          <div className="flex flex-wrap gap-5">
            {planosAmbulante.map(plano => <PlanoCard key={plano.id} plano={plano} />)}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-black text-green-400 mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> Usuário Geral</h2>
          <div className="flex flex-wrap gap-5">
            {planosUsuario.map(plano => <PlanoCard key={plano.id} plano={plano} />)}
          </div>
        </section>
      </main>
    </div>
  );
}
