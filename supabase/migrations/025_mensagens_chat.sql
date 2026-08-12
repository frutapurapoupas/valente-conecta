-- Caminho: C:\valente_conecta\supabase\migrations\025_mensagens_chat.sql
--
-- Chat simples entre o admin master e qualquer usuario do app. Usa o
-- mesmo id anonimo por dispositivo (obterUsuarioLocalId, lib/usuarioLocal.ts)
-- que ja e' usado por push_subscriptions/demandas_busca/agenda — assim
-- qualquer visitante consegue conversar sem precisar ter feito o cadastro
-- completo (nome+whatsapp) antes.

create table if not exists mensagens_chat (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null,
  remetente text not null check (remetente in ('admin', 'usuario')),
  texto text not null,
  lida boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_mensagens_chat_usuario on mensagens_chat(usuario_id, created_at);

alter table mensagens_chat enable row level security;
create policy "mensagens_chat_publica" on mensagens_chat for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login), mesmo padrao do
-- resto do projeto ate a autenticacao real existir — qualquer um
-- tecnicamente poderia ler a conversa de outro usuario pela API hoje,
-- mesma ressalva que ja se aplica a marketplace/agenda/fiado.
