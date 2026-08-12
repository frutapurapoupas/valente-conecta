-- Caminho: C:\valente_conecta\supabase\migrations\027_cidades_adicionais.sql
--
-- Usuario registrado (usuarios, cadastro nome+whatsapp+cidade_base) pode
-- pedir acesso a outras cidades alem da base. Pedido nasce como 'solicitado'
-- (o app ja registra e avisa o admin master pelo chat), admin master decide
-- cobrar (preco configuravel em admin_configuracoes, chave
-- 'preco_cidade_adicional') e muda o status conforme acompanha o pagamento
-- manualmente (mesmo padrao ja usado em pagamentos.status / interesses,
-- ja que nao ha checkout automatico ligado a essa cobranca ainda).
--
-- usuario_local_id fica salvo pra permitir a resposta no chat de suporte
-- (mensagens_chat.usuario_id, ver 025_mensagens_chat.sql), que usa o id
-- anonimo do navegador, nao o id de usuarios.

create table if not exists usuario_cidades_adicionais (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  usuario_local_id uuid,
  cidade text not null,
  status text not null default 'solicitado' check (status in ('solicitado', 'aguardando_pagamento', 'ativo', 'recusado')),
  valor_cobrado numeric(12,2),
  solicitado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (usuario_id, cidade)
);

create index if not exists idx_usuario_cidades_status on usuario_cidades_adicionais(status);
create index if not exists idx_usuario_cidades_usuario on usuario_cidades_adicionais(usuario_id);

alter table usuario_cidades_adicionais enable row level security;
create policy "usuario_cidades_adicionais_publica" on usuario_cidades_adicionais for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto ate a autenticacao existir.
