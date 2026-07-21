// app/admin/notificacoes/types/notificacao.types.ts

export type Importancia = "alta" | "media" | "baixa";
export type TipoNotificacao = "aviso" | "alerta" | "info" | "sucesso" | "promocao";
export type TipoAlvo = "todos" | "grupo" | "usuario";

export interface Notificacao {
  id: number | string;
  titulo: string;
  mensagem: string;
  importancia: Importancia;
  tipo: TipoNotificacao;
  data: string;
  ativa: boolean;
  enviar_telegram: boolean;
  enviar_push: boolean;
  link_url: string;
  data_expiracao: string;
  exibida_uma_vez: boolean;
  para_grupo?: string;
  para_usuario_id?: string;
}

export interface GrupoDinamico {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  telegram_chat_id: string | null;
  ativo: boolean;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  plano?: string;
  whatsapp?: string;
}

export interface NovaNotificacaoState {
  titulo: string;
  mensagem: string;
  importancia: Importancia;
  tipo: TipoNotificacao;
  enviar_telegram: boolean;
  enviar_push: boolean;
  link_url: string;
  data_expiracao: string;
  exibida_uma_vez: boolean;
  tipoAlvo: TipoAlvo;
  grupoAlvo: string;
  usuarioAlvo: string;
}

