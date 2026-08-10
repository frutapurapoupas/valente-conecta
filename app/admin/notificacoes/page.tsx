// app/admin/notificacoes/page.tsx - REFATORADO

"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { Bell, Award, Dumbbell, Bike, Store, Globe, Users, TestTube, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

import { Notificacao, NovaNotificacaoState } from "./types/notificacao.types";
import { useNotificacoes } from "./hooks/useNotificacoes";
import { NotificacaoHeader } from "./components/NotificacaoHeader";
import { NotificacaoStats } from "./components/NotificacaoStats";
import { NotificacaoForm } from "./components/NotificacaoForm";
import { NotificacaoList } from "./components/NotificacaoList";
import { NotificacaoInfo } from "./components/NotificacaoInfo";

export default function AdminNotificacoesPage() {
  const router = useRouter();
  const { isAdmin } = useApp();
  const [mounted, setMounted] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<number | string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const {
    notificacoes,
    setNotificacoes,
    usuarios,
    grupos,
    modoTeste,
    carregandoUsuarios,
    carregandoGrupos,
    carregarModoTeste,
    carregarUsuarios,
    carregarGrupos,
    carregarNotificacoes,
    adicionarNotificacao,
    editarNotificacao,
    removerNotificacao,
    toggleAtiva,
    getNotificacoesAtivas
  } = useNotificacoes();

  const [novaNotificacao, setNovaNotificacao] = useState<NovaNotificacaoState>({
    titulo: "",
    mensagem: "",
    importancia: "media",
    tipo: "aviso",
    enviar_telegram: true,
    enviar_push: true,
    link_url: "",
    data_expiracao: "",
    exibida_uma_vez: true,
    tipoAlvo: "todos",
    grupoAlvo: "todos",
    usuarioAlvo: ""
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAdmin) {
      const notificacoesCarregadas = carregarNotificacoes();
      setNotificacoes(notificacoesCarregadas);
      carregarUsuarios();
      carregarGrupos();
      carregarModoTeste();
    }
  }, [mounted, isAdmin]);

  // ============================================================================
  // FUNÇÕES DE UTILIDADE
  // ============================================================================

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-12 h-12 text-yellow-400 animate-pulse mx-auto" />
          <p className="text-white mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    router.push("/login");
    return null;
  }

  const getIconeGrupo = (icone: string) => {
    switch (icone) {
      case 'Globe': return <Globe className="w-4 h-4" />;
      case 'Award': return <Award className="w-4 h-4" />;
      case 'Dumbbell': return <Dumbbell className="w-4 h-4" />;
      case 'Bike': return <Bike className="w-4 h-4" />;
      case 'Store': return <Store className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'TestTube': return <TestTube className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getAlvoLabel = (notif: Notificacao) => {
    if (notif.para_usuario_id) {
      const usuario = usuarios.find(u => u.id === notif.para_usuario_id);
      return `👤 ${usuario?.nome || 'Usuário específico'}`;
    }
    if (notif.para_grupo && notif.para_grupo !== 'todos') {
      const grupo = grupos.find(g => g.id === notif.para_grupo);
      return grupo ? `${getIconeGrupo(grupo.icone)} ${grupo.nome}` : `📌 Grupo: ${notif.para_grupo}`;
    }
    return "🌍 Todos os usuários";
  };

  const handleAdicionar = async () => {
    if (!novaNotificacao.titulo || !novaNotificacao.mensagem) {
      toast.error("Preencha título e mensagem");
      return;
    }
    if (novaNotificacao.tipoAlvo === 'usuario' && !novaNotificacao.usuarioAlvo) {
      toast.error("Selecione um usuário para enviar");
      return;
    }

    setEnviando(true);
    const result = await adicionarNotificacao(novaNotificacao);
    
    const msgAlvo = novaNotificacao.tipoAlvo === 'todos' ? 'para todos' : 
                    (novaNotificacao.tipoAlvo === 'grupo' ? `para grupo ${novaNotificacao.grupoAlvo}` : 'para usuário específico');
    const msgTeste = modoTeste ? ' 🧪 MODO TESTE ATIVADO' : '';
    
    setNovaNotificacao({ 
      titulo: "", 
      mensagem: "", 
      importancia: "media",
      tipo: "aviso",
      enviar_telegram: true,
      enviar_push: true,
      link_url: "",
      data_expiracao: "",
      exibida_uma_vez: true,
      tipoAlvo: "todos",
      grupoAlvo: "todos",
      usuarioAlvo: ""
    });
    setMostrarFormulario(false);
    
    toast.success(`✅ Notificação publicada ${msgAlvo}!${msgTeste} ${result.canais.length > 0 ? `Enviada via: ${result.canais.join(", ")}` : ""}`);
    setEnviando(false);
  };

  const handleEditar = (notif: Notificacao) => {
    setEditandoId(notif.id);
    setNovaNotificacao({
      titulo: notif.titulo,
      mensagem: notif.mensagem,
      importancia: notif.importancia,
      tipo: notif.tipo,
      enviar_telegram: notif.enviar_telegram,
      enviar_push: notif.enviar_push,
      link_url: notif.link_url || "",
      data_expiracao: notif.data_expiracao || "",
      exibida_uma_vez: notif.exibida_uma_vez,
      tipoAlvo: notif.para_usuario_id ? "usuario" : (notif.para_grupo && notif.para_grupo !== 'todos' ? "grupo" : "todos"),
      grupoAlvo: notif.para_grupo || "todos",
      usuarioAlvo: notif.para_usuario_id || ""
    });
    setMostrarFormulario(true);
  };

  const handleSalvarEdicao = () => {
    if (!novaNotificacao.titulo || !novaNotificacao.mensagem) {
      toast.error("Preencha título e mensagem");
      return;
    }

    editarNotificacao(editandoId!, {
      titulo: novaNotificacao.titulo,
      mensagem: novaNotificacao.mensagem,
      importancia: novaNotificacao.importancia,
      tipo: novaNotificacao.tipo,
      enviar_telegram: novaNotificacao.enviar_telegram,
      enviar_push: novaNotificacao.enviar_push,
      link_url: novaNotificacao.link_url,
      data_expiracao: novaNotificacao.data_expiracao,
      exibida_uma_vez: novaNotificacao.exibida_uma_vez,
      para_grupo: novaNotificacao.tipoAlvo === 'grupo' ? novaNotificacao.grupoAlvo : (novaNotificacao.tipoAlvo === 'todos' ? 'todos' : undefined),
      para_usuario_id: novaNotificacao.tipoAlvo === 'usuario' ? novaNotificacao.usuarioAlvo : undefined
    });
    
    setNovaNotificacao({ 
      titulo: "", 
      mensagem: "", 
      importancia: "media",
      tipo: "aviso",
      enviar_telegram: true,
      enviar_push: true,
      link_url: "",
      data_expiracao: "",
      exibida_uma_vez: true,
      tipoAlvo: "todos",
      grupoAlvo: "todos",
      usuarioAlvo: ""
    });
    setMostrarFormulario(false);
    setEditandoId(null);
    toast.success("✅ Notificação atualizada!");
  };

  const handleToggleAtiva = (id: number | string) => {
    const ativa = toggleAtiva(id);
    toast.success(ativa ? "✅ Notificação ativada!" : "❌ Notificação desativada!");
  };

  const handleRemover = (id: number | string) => {
    removerNotificacao(id);
    toast.success("🗑️ Notificação removida!");
  };

  const handleNovaNotificacao = () => {
    setMostrarFormulario(true);
    setEditandoId(null);
    setNovaNotificacao({ 
      titulo: "", 
      mensagem: "", 
      importancia: "media",
      tipo: "aviso",
      enviar_telegram: true,
      enviar_push: true,
      link_url: "",
      data_expiracao: "",
      exibida_uma_vez: true,
      tipoAlvo: "todos",
      grupoAlvo: "todos",
      usuarioAlvo: ""
    });
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setEditandoId(null);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NotificacaoHeader 
        modoTeste={modoTeste}
        onNovaNotificacao={handleNovaNotificacao}
      />

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <NotificacaoStats 
          notificacoes={notificacoes}
          notificacoesAtivas={getNotificacoesAtivas()}
        />

        {mostrarFormulario && (
          <NotificacaoForm
            novaNotificacao={novaNotificacao}
            setNovaNotificacao={setNovaNotificacao}
            grupos={grupos}
            usuarios={usuarios}
            carregandoGrupos={carregandoGrupos}
            carregandoUsuarios={carregandoUsuarios}
            modoTeste={modoTeste}
            editandoId={editandoId}
            enviando={enviando}
            onSalvar={editandoId ? handleSalvarEdicao : handleAdicionar}
            onCancelar={handleCancelar}
            getIconeGrupo={getIconeGrupo}
          />
        )}

        <NotificacaoList
          notificacoes={notificacoes}
          notificacoesAtivas={getNotificacoesAtivas()}
          onToggleAtiva={handleToggleAtiva}
          onEditar={handleEditar}
          onRemover={handleRemover}
          getAlvoLabel={getAlvoLabel}
        />

        <NotificacaoInfo modoTeste={modoTeste} />
      </main>
    </div>
  );
}

