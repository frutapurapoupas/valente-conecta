// app/admin/notificacoes/hooks/useNotificacoes.ts

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Notificacao, GrupoDinamico, Usuario, NovaNotificacaoState } from "../types/notificacao.types";

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [grupos, setGrupos] = useState<GrupoDinamico[]>([]);
  const [modoTeste, setModoTeste] = useState(true);
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);
  const [carregandoGrupos, setCarregandoGrupos] = useState(false);

  const carregarModoTeste = async () => {
    try {
      const response = await fetch('/api/configuracoes?chave=modo_teste');
      const data = await response.json();
      if (data.success && data.data) {
        setModoTeste(data.data.valor === true || data.data.valor === 'true');
      }
    } catch (error) {
      console.error("Erro ao carregar modo teste:", error);
    }
  };

  const carregarUsuarios = async () => {
    setCarregandoUsuarios(true);
    try {
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data.data || []);
      } else {
        setUsuarios([
          { id: "1", nome: "UsuÃ¡rio Teste", email: "teste@email.com", plano: "premium", whatsapp: "11999999999" },
          { id: "2", nome: "JoÃ£o Silva", email: "joao@email.com", plano: "basico", whatsapp: "11988888888" },
          { id: "3", nome: "Maria Santos", email: "maria@email.com", plano: "premium", whatsapp: "11977777777" }
        ]);
      }
    } catch (error) {
      console.error("Erro ao carregar usuÃ¡rios:", error);
    } finally {
      setCarregandoUsuarios(false);
    }
  };

  const carregarGrupos = async () => {
    setCarregandoGrupos(true);
    try {
      const response = await fetch('/api/grupos');
      const data = await response.json();
      if (data.success && data.data) {
        setGrupos(data.data);
      } else {
        setGrupos([
          { id: "premium", nome: "â­ UsuÃ¡rios Premium", descricao: "UsuÃ¡rios com plano Premium", icone: "Award", cor: "#f59e0b", telegram_chat_id: "@valenteconecta_premium", ativo: true },
          { id: "academia", nome: "ðŸ’ª Academia", descricao: "Alunos da academia", icone: "Dumbbell", cor: "#10b981", telegram_chat_id: "@valenteconecta_academia", ativo: true },
          { id: "mototaxi", nome: "ðŸï¸ Moto TÃ¡xi", descricao: "Motoristas parceiros", icone: "Bike", cor: "#ef4444", telegram_chat_id: "@valenteconecta_mototaxi", ativo: true },
          { id: "comercio", nome: "ðŸª ComÃ©rcio Local", descricao: "Lojistas e comerciantes", icone: "Store", cor: "#8b5cf6", telegram_chat_id: "@valenteconecta_comercio", ativo: true },
          { id: "teste", nome: "ðŸ§ª Grupo de Teste", descricao: "Para testar notificaÃ§Ãµes", icone: "TestTube", cor: "#06b6d4", telegram_chat_id: "@valenteconecta_teste", ativo: true }
        ]);
      }
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
    } finally {
      setCarregandoGrupos(false);
    }
  };

  const carregarNotificacoes = (): Notificacao[] => {
    const salvas = localStorage.getItem("admin_notificacoes_sistema");
    if (salvas) {
      return JSON.parse(salvas);
    }
    const notificacoesPadrao: Notificacao[] = [
      { 
        id: 1, 
        titulo: "ðŸŽ‰ Novas funcionalidades!", 
        mensagem: "Confira o novo cardÃ¡pio da Cozinha com opÃ§Ãµes fitness.", 
        importancia: "alta", 
        tipo: "aviso",
        data: new Date().toLocaleDateString(), 
        ativa: true,
        enviar_telegram: true,
        enviar_push: true,
        link_url: "",
        data_expiracao: "",
        exibida_uma_vez: true,
        para_grupo: "todos"
      },
      { 
        id: 2, 
        titulo: "ðŸ’° Campanha de IndicaÃ§Ã£o", 
        mensagem: "Indique um amigo e ganhe R$5 de bÃ´nus!", 
        importancia: "media", 
        tipo: "promocao",
        data: new Date().toLocaleDateString(), 
        ativa: true,
        enviar_telegram: true,
        enviar_push: true,
        link_url: "",
        data_expiracao: "",
        exibida_uma_vez: true,
        para_grupo: "todos"
      },
      { 
        id: 3, 
        titulo: "ðŸ’ª Academia Atualizada", 
        mensagem: "Nova funcionalidade de geolocalizaÃ§Ã£o disponÃ­vel para alunos!", 
        importancia: "alta", 
        tipo: "aviso",
        data: new Date().toLocaleDateString(), 
        ativa: true,
        enviar_telegram: true,
        enviar_push: true,
        link_url: "",
        data_expiracao: "",
        exibida_uma_vez: true,
        para_grupo: "academia"
      }
    ];
    localStorage.setItem("admin_notificacoes_sistema", JSON.stringify(notificacoesPadrao));
    return notificacoesPadrao;
  };

  const salvarNotificacoes = (novas: Notificacao[]) => {
    setNotificacoes(novas);
    localStorage.setItem("admin_notificacoes_sistema", JSON.stringify(novas));
  };

  const getGrupoTelegramChatId = (grupoId: string): string => {
    if (modoTeste) return '@valenteconecta_teste';
    if (grupoId === 'todos') return '@valenteconecta';
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo?.telegram_chat_id || '@valenteconecta';
  };

  const enviarTelegram = async (notificacao: Notificacao) => {
    try {
      let chatId = '@valenteconecta';
      if (modoTeste) {
        chatId = '@valenteconecta_teste';
      } else if (notificacao.para_grupo && notificacao.para_grupo !== 'todos') {
        chatId = getGrupoTelegramChatId(notificacao.para_grupo);
      }
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId,
          message: `ðŸ“¢ *${notificacao.titulo}*\n\n${notificacao.mensagem}\n\n${modoTeste ? 'ðŸ§ª *MODO TESTE* - Esta notificaÃ§Ã£o nÃ£o foi enviada para todos\n\n' : ''}ðŸ“Œ *Grupo:* ${notificacao.para_grupo === 'todos' ? 'Todos' : notificacao.para_grupo}\n\nðŸ”— Acesse o app: valenteconecta.clic.com.br`,
          parseMode: 'Markdown'
        })
      });
      return response.ok;
    } catch (error) {
      console.error("Erro ao enviar Telegram:", error);
      return false;
    }
  };

  const enviarPushNotification = async (notificacao: Notificacao) => {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return false;
      }
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(notificacao.titulo, {
        body: `${notificacao.mensagem}${modoTeste ? ' ðŸ§ª MODO TESTE' : ''}${notificacao.para_grupo ? `\nðŸ“Œ Para: ${notificacao.para_grupo}` : ''}`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: { url: notificacao.link_url || '/' }
      });
      return true;
    } catch (error) {
      console.error("Erro ao enviar Push:", error);
      return false;
    }
  };

  const adicionarNotificacao = async (novaNotificacao: NovaNotificacaoState) => {
    const nova: Notificacao = {
      id: Date.now(),
      titulo: novaNotificacao.titulo,
      mensagem: novaNotificacao.mensagem,
      importancia: novaNotificacao.importancia,
      tipo: novaNotificacao.tipo,
      data: new Date().toLocaleDateString(),
      ativa: true,
      enviar_telegram: novaNotificacao.enviar_telegram,
      enviar_push: novaNotificacao.enviar_push,
      link_url: novaNotificacao.link_url,
      data_expiracao: novaNotificacao.data_expiracao,
      exibida_uma_vez: novaNotificacao.exibida_uma_vez,
      para_grupo: novaNotificacao.tipoAlvo === 'grupo' ? novaNotificacao.grupoAlvo : (novaNotificacao.tipoAlvo === 'todos' ? 'todos' : undefined),
      para_usuario_id: novaNotificacao.tipoAlvo === 'usuario' ? novaNotificacao.usuarioAlvo : undefined
    };

    const novas = [nova, ...notificacoes];
    salvarNotificacoes(novas);

    const msgCanais: string[] = [];
    if (nova.enviar_telegram && await enviarTelegram(nova)) msgCanais.push("Telegram");
    if (nova.enviar_push && await enviarPushNotification(nova)) msgCanais.push("Push");

    return { notificacao: nova, canais: msgCanais };
  };

  const editarNotificacao = (id: number | string, dados: Partial<Notificacao>) => {
    const novas = notificacoes.map(n => n.id === id ? { ...n, ...dados } : n);
    salvarNotificacoes(novas);
  };

  const removerNotificacao = (id: number | string) => {
    const novas = notificacoes.filter(n => n.id !== id);
    salvarNotificacoes(novas);
  };

  const toggleAtiva = (id: number | string) => {
    const novas = notificacoes.map(n => n.id === id ? { ...n, ativa: !n.ativa } : n);
    salvarNotificacoes(novas);
    return novas.find(n => n.id === id)?.ativa;
  };

  const getNotificacoesAtivas = () => notificacoes.filter(n => n.ativa).length;

  return {
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
    salvarNotificacoes,
    adicionarNotificacao,
    editarNotificacao,
    removerNotificacao,
    toggleAtiva,
    getNotificacoesAtivas,
    getGrupoTelegramChatId,
    enviarTelegram,
    enviarPushNotification
  };
}

