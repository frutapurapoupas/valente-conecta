"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Crown, Store, Wrench, Star, MapPin, Users, Dumbbell, Calendar, ChevronRight, Check, Truck, Building2, Home, Car, Briefcase, FileText } from "lucide-react";
import { usePlanos } from "@/hooks/usePlanos";
import { useAuth } from "@/hooks/useAuth";
import { TipoPlano, CategoriaPlano, getPlanosPorCategoria, getCamposCadastro } from "@/types/planos";
import { FormularioCadastroPlano } from "@/components/FormularioCadastroPlano";
import { CardConfiguracaoLoja } from "@/components/CardConfiguracaoLoja";

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

const planosTransporteDelivery = [
  {
    id: "motorista",
    nome: "Motorista",
    preco: "R$ 25,00/mês",
    descricao: "Para motoristas de transporte e delivery",
    cor: "border-teal-500/40",
    icone: <Truck className="w-5 h-5 text-teal-400" />,
    beneficios: [
      "Perfil público como motorista",
      "Aparecer na busca de transportes",
      "Contato visível para clientes",
      "Badge 'Motorista Verificado ✓'",
      "Histórico de entregas",
      "Avaliação e reputação",
    ],
  },
];

const planosImoveis = [
  {
    id: "aluguel",
    nome: "Aluguel",
    preco: "R$ 20,00/mês",
    descricao: "Para anunciar imóveis para alugar",
    cor: "border-cyan-500/40",
    icone: <Home className="w-5 h-5 text-cyan-400" />,
    beneficios: [
      "Até 10 anúncios de aluguel",
      "Renovação mensal automática",
      "Contato visível para interessados",
      "Destaque na busca de imóveis",
      "Fotos ilimitadas por anúncio",
      "Badge 'Imóvel Verificado ✓'",
    ],
  },
  {
    id: "venda",
    nome: "Venda",
    preco: "R$ 50,00/mês",
    descricao: "Para anunciar imóveis para vender",
    cor: "border-orange-500/40",
    icone: <Home className="w-5 h-5 text-orange-400" />,
    beneficios: [
      "Até 10 anúncios de venda",
      "Renovação mensal automática",
      "Contato visível para interessados",
      "Destaque premium na busca",
      "Fotos ilimitadas por anúncio",
      "Badge 'Imóvel Premium ✓'",
      "Prioridade nos resultados",
    ],
  },
];

const planosVeiculos = [
  {
    id: "aluguel",
    nome: "Aluguel",
    preco: "R$ 25,00/mês",
    descricao: "Para anunciar veículos para alugar",
    cor: "border-blue-500/40",
    icone: <Car className="w-5 h-5 text-blue-400" />,
    beneficios: [
      "Até 10 anúncios de aluguel",
      "Renovação mensal automática",
      "Contato visível para interessados",
      "Destaque na busca de veículos",
      "Fotos ilimitadas por anúncio",
      "Badge 'Veículo Verificado ✓'",
    ],
  },
  {
    id: "venda",
    nome: "Venda",
    preco: "R$ 35,00/mês",
    descricao: "Para anunciar veículos para vender",
    cor: "border-green-500/40",
    icone: <Car className="w-5 h-5 text-green-400" />,
    beneficios: [
      "Até 10 anúncios de venda",
      "Renovação mensal automática",
      "Contato visível para interessados",
      "Destaque premium na busca",
      "Fotos ilimitadas por anúncio",
      "Badge 'Veículo Premium ✓'",
      "Prioridade nos resultados",
    ],
  },
];

const planosEmpregos = [
  {
    id: "curriculo",
    nome: "Cadastro de Currículo",
    preco: "R$ 10,00/mês",
    descricao: "Para cadastrar seu currículo e ser encontrado por empresas",
    cor: "border-blue-500/40",
    icone: <FileText className="w-5 h-5 text-blue-400" />,
    beneficios: [
      "Perfil de currículo visível",
      "Contato visível para empresas",
      "Destaque na busca de candidatos",
      "Badge 'Candidato Verificado ✓'",
      "Renovação mensal automática",
      "Acesso a vagas disponíveis",
    ],
  },
  {
    id: "vagas",
    nome: "Cadastro de Vagas",
    preco: "R$ 20,00/mês",
    descricao: "Para empresas divulgarem oportunidades de emprego",
    cor: "border-green-500/40",
    icone: <Briefcase className="w-5 h-5 text-green-400" />,
    beneficios: [
      "Até 10 vagas ativas por mês",
      "Contato visível para candidatos",
      "Destaque na busca de vagas",
      "Badge 'Empresa Verificada ✓'",
      "Renovação mensal automática",
      "Acesso a candidatos disponíveis",
    ],
  },
];

function PlanoCard({ plano, onSelect, planoAtivo, isGratis }: { plano: any; onSelect?: () => void; planoAtivo?: boolean; isGratis?: boolean }) {
  return (
    <div className={`bg-zinc-900 border ${plano.cor} rounded-2xl p-5 flex-1 min-w-[260px] max-w-xs flex flex-col ${planoAtivo ? 'ring-2 ring-green-500' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        {plano.icone}
        <h3 className="font-black text-lg text-white">{plano.nome}</h3>
        {planoAtivo && <Check className="w-5 h-5 text-green-500 ml-auto" />}
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
      {onSelect && (
        <button
          onClick={isGratis ? undefined : onSelect}
          disabled={planoAtivo}
          className={`mt-4 w-full py-2 rounded-lg font-bold transition ${
            planoAtivo
              ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
              : isGratis
              ? 'bg-green-500 text-zinc-900 cursor-default'
              : 'bg-yellow-500 text-zinc-900 hover:bg-yellow-400'
          }`}
        >
          {planoAtivo ? 'Plano Ativo' : isGratis ? 'Já estou cadastrado' : 'Assinar'}
        </button>
      )}
    </div>
  );
}

export default function TodosPlanosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const planosHook = usePlanos(user?.id);
  const [planoSelecionado, setPlanoSelecionado] = useState<TipoPlano | null>(null);
  const [showCadastro, setShowCadastro] = useState(false);
  const [showConfiguracaoLoja, setShowConfiguracaoLoja] = useState(false);
  const [nomeLoja, setNomeLoja] = useState('');

  const handleSelecionarPlano = (tipoPlano: TipoPlano) => {
    setPlanoSelecionado(tipoPlano);
    // Não abre mais o formulário para planos grátis - botão é estático
    const isGratis = tipoPlano.includes('gratis') || tipoPlano === 'academia_gratis'
    if (!isGratis) {
      setShowCadastro(true);
    }
  };

  // Função para teste: simular assinatura de plano de serviço com agendamento
  const handleTesteServicoAgendamento = async () => {
    try {
      await planosHook.assinarPlano('servico_agendamento_basico', { nome: 'Teste', whatsapp: '75988888888' }, 'pix');
      await planosHook.confirmarPagamento('temp-id');
      router.push('/admin-servico');
    } catch (error) {
      console.error('Erro ao simular assinatura:', error);
    }
  };

  const handleConfirmarAssinatura = async (dados: Record<string, string>) => {
    if (!planoSelecionado) return;

    try {
      const isGratis = planoSelecionado.includes('gratis') || planoSelecionado === 'academia_gratis'
      
      await planosHook.assinarPlano(planoSelecionado, dados, 'pix');
      
      // Para planos grátis, ativa imediatamente
      if (isGratis) {
        await planosHook.confirmarPagamento('temp-id');
      }
      
      // Verifica se é plano de loja/empresa para mostrar configuração
      const isPlanoLoja = planoSelecionado.includes('empresa') || 
                         planoSelecionado.includes('loja')
      const isPlanoServicoAgendamento = planoSelecionado.includes('servico_agendamento')
      
      if (isPlanoServicoAgendamento) {
        setShowCadastro(false);
        setPlanoSelecionado(null);
        router.push('/admin-servico');
      } else if (isPlanoLoja && dados.nomeFantasia) {
        setNomeLoja(dados.nomeFantasia);
        setShowConfiguracaoLoja(true);
      } else {
        setShowCadastro(false);
        setPlanoSelecionado(null);
        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao assinar plano:', error);
    }
  };

  const handleConcluirConfiguracao = (configuracoes: any) => {
    // Salvar configurações da loja
    localStorage.setItem('configuracao_loja', JSON.stringify(configuracoes));
    setShowConfiguracaoLoja(false);
    setShowCadastro(false);
    setPlanoSelecionado(null);
    router.push('/admin-loja');
  };

  const handlePularConfiguracao = () => {
    setShowConfiguracaoLoja(false);
    setShowCadastro(false);
    setPlanoSelecionado(null);
    router.push('/');
  };

  const planosAtivos = planosHook.getPlanosAtivos();

  const isPlanoGratis = planoSelecionado?.includes('gratis') || planoSelecionado === 'academia_gratis'
  const camposCadastro = planoSelecionado ? getCamposCadastro(planoSelecionado, isPlanoGratis) : []

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-5 flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase italic text-white leading-none">Planos e Benefícios</h1>
        <p className="text-zinc-400">Veja todos os planos disponíveis para cada tipo de usuário</p>
      </header>

      {planosAtivos.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <h3 className="font-bold text-green-400 mb-2">Meus Planos Ativos</h3>
            <div className="flex flex-wrap gap-2">
              {planosAtivos.map(plano => {
                const config = planosHook.configuracoes.find(c => c.id === plano.tipoPlano);
                return (
                  <div key={plano.id} className="bg-zinc-800 px-3 py-2 rounded-lg text-sm">
                    <span className="font-bold">{config?.nome}</span>
                    <span className="text-zinc-400 ml-2">• Ativo desde {new Date(plano.dataInicio).toLocaleDateString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4 space-y-12">
        <section>
          <h2 className="text-xl font-black text-blue-400 mb-4 flex items-center gap-2"><Store className="w-5 h-5" /> Empresas & Lojas</h2>
          <div className="flex flex-wrap gap-5">
            {planosEmpresa.map(plano => (
              <PlanoCard
                key={plano.id}
                plano={plano}
                isGratis={plano.id === 'gratuito'}
                onSelect={() => handleSelecionarPlano(plano.id as TipoPlano)}
              />
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-black text-violet-400 mb-4 flex items-center gap-2"><Star className="w-5 h-5" /> Profissionais Liberais</h2>
          <div className="flex flex-wrap gap-5">
            {planosProfissional.map(plano => (
              <PlanoCard
                key={plano.id}
                plano={plano}
                isGratis={plano.id === 'gratuito'}
                onSelect={() => handleSelecionarPlano(plano.id as TipoPlano)}
              />
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-black text-amber-400 mb-4 flex items-center gap-2"><Zap className="w-5 h-5" /> Ambulantes</h2>
          <div className="flex flex-wrap gap-5">
            {planosAmbulante.map(plano => (
              <PlanoCard
                key={plano.id}
                plano={plano}
                isGratis={plano.id === 'gratuito'}
                onSelect={() => handleSelecionarPlano(plano.id as TipoPlano)}
              />
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-black text-green-400 mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> Usuário Geral</h2>
          <div className="flex flex-wrap gap-5">
            {planosUsuario.map(plano => (
              <PlanoCard
                key={plano.id}
                plano={plano}
                isGratis={plano.id === 'gratuito'}
                onSelect={() => handleSelecionarPlano(plano.id as TipoPlano)}
              />
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-black text-emerald-400 mb-4 flex items-center gap-2"><Dumbbell className="w-5 h-5" /> Academia</h2>
          <div className="flex flex-wrap gap-5">
            {getPlanosPorCategoria('academia').map(plano => {
              const planoAtivo = planosAtivos.some(p => p.tipoPlano === plano.id);
              return (
                <PlanoCard
                  key={plano.id}
                  plano={{
                    id: plano.id,
                    nome: plano.nome,
                    preco: plano.preco === 0 ? 'R$ 0' : `R$ ${plano.preco.toFixed(2)}/mês`,
                    descricao: plano.descricao,
                    cor: plano.preco === 0 ? 'border-zinc-700' : 'border-emerald-500/40',
                    icone: plano.preco === 0 ? <Dumbbell className="w-5 h-5 text-zinc-400" /> : <Crown className="w-5 h-5 text-emerald-400" />,
                    beneficios: plano.recursos,
                  }}
                  planoAtivo={planoAtivo}
                  isGratis={plano.preco === 0}
                  onSelect={() => handleSelecionarPlano(plano.id)}
                />
              );
            })}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-black text-purple-400 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Serviço com Agendamento</h2>
          <div className="flex flex-wrap gap-5">
            {getPlanosPorCategoria('servico_agendamento').map(plano => {
              const planoAtivo = planosAtivos.some(p => p.tipoPlano === plano.id);
              return (
                <PlanoCard
                  key={plano.id}
                  plano={{
                    id: plano.id,
                    nome: plano.nome,
                    preco: plano.preco === 0 ? 'R$ 0' : `R$ ${plano.preco.toFixed(2)}/mês`,
                    descricao: plano.descricao,
                    cor: plano.preco === 0 ? 'border-zinc-700' : plano.id.includes('basico') ? 'border-violet-500/40' : 'border-yellow-500/40',
                    icone: plano.preco === 0 ? <Calendar className="w-5 h-5 text-zinc-400" /> : plano.id.includes('basico') ? <Zap className="w-5 h-5 text-violet-400" /> : <Crown className="w-5 h-5 text-yellow-400" />,
                    beneficios: plano.recursos,
                  }}
                  planoAtivo={planoAtivo}
                  isGratis={plano.preco === 0}
                  onSelect={() => handleSelecionarPlano(plano.id)}
                />
              );
            })}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-black text-teal-400 mb-4 flex items-center gap-2"><Truck className="w-5 h-5" /> Transporte e Delivery</h2>
          <div className="flex flex-wrap gap-5">
            {planosTransporteDelivery.map(plano => (
              <PlanoCard
                key={plano.id}
                plano={plano}
                isGratis={plano.id === 'gratuito'}
                onSelect={() => handleSelecionarPlano(plano.id as TipoPlano)}
              />
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-black text-rose-400 mb-4 flex items-center gap-2"><Home className="w-5 h-5" /> Imóveis</h2>
          <div className="flex flex-wrap gap-5">
            {planosImoveis.map(plano => (
              <PlanoCard
                key={plano.id}
                plano={plano}
                isGratis={plano.id === 'gratuito'}
                onSelect={() => handleSelecionarPlano(plano.id as TipoPlano)}
              />
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-black text-blue-500 mb-4 flex items-center gap-2"><Car className="w-5 h-5" /> Veículos</h2>
          <div className="flex flex-wrap gap-5">
            {planosVeiculos.map(plano => (
              <PlanoCard
                key={plano.id}
                plano={plano}
                isGratis={plano.id === 'gratuito'}
                onSelect={() => handleSelecionarPlano(plano.id as TipoPlano)}
              />
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-black text-green-500 mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5" /> Empregos</h2>
          <div className="flex flex-wrap gap-5">
            {planosEmpregos.map(plano => (
              <PlanoCard
                key={plano.id}
                plano={plano}
                isGratis={plano.id === 'gratuito'}
                onSelect={() => {
                  if (plano.id === 'curriculo' || plano.id === 'vagas') {
                    router.push('/empregos')
                  } else {
                    handleSelecionarPlano(plano.id as TipoPlano)
                  }
                }}
              />
            ))}
          </div>
        </section>
      </main>

      {showCadastro && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {isPlanoGratis ? 'Cadastro Gratuito' : 'Concluir Assinatura'}
            </h3>
            <FormularioCadastroPlano
              campos={camposCadastro}
              onSubmit={handleConfirmarAssinatura}
              onCancel={() => { setShowCadastro(false); setPlanoSelecionado(null); }}
              isGratis={isPlanoGratis}
            />
          </div>
        </div>
      )}

      {showConfiguracaoLoja && (
        <CardConfiguracaoLoja
          nomeLoja={nomeLoja}
          onConcluir={handleConcluirConfiguracao}
          onPular={handlePularConfiguracao}
        />
      )}
    </div>
  );
}
