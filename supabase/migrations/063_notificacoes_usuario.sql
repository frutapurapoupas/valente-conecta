-- Caminho: C:\valente_conecta\supabase\migrations\063_notificacoes_usuario.sql
--
-- Central de notificacoes do sininho (NotificacaoSininho.tsx). Ate agora o
-- endpoint /api/notificacoes fingia persistir em localStorage do lado do
-- servidor (nao existe la, entao sempre voltava vazio). Usa o mesmo id
-- anonimo por dispositivo (obterUsuarioLocalId, lib/usuarioLocal.ts) que
-- ja serve push_subscriptions/mensagens_chat/demandas_busca — mesmo padrao
-- documentado em 025_mensagens_chat.sql.
--
-- `origem` distingue quem gerou a notificacao (visivel so em log/debug por
-- enquanto, a UI do sininho nao precisa diferenciar hoje): admin master
-- manda avisos gerais ou automaticos do sistema; lojista/prestador manda
-- sobre pedido/agendamento especifico de um cliente dele.

create table if not exists notificacoes_usuario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null,
  origem text not null check (origem in ('sistema', 'admin_master', 'lojista', 'prestador')),
  titulo text not null,
  mensagem text not null,
  link text,
  lida boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notificacoes_usuario_usuario on notificacoes_usuario(usuario_id, created_at desc);

alter table notificacoes_usuario enable row level security;
create policy "notificacoes_usuario_publica" on notificacoes_usuario for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login), mesmo padrao do
-- resto do projeto ate a autenticacao real existir.
