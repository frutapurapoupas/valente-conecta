-- Caminho: C:\valente_conecta\supabase\migrations\024_contatos_divulgacao.sql
--
-- Contatos pra divulgacao/convite (gente que ainda nao usa o app, digitada
-- manualmente ou importada de planilha pelo admin master). Cada um vira um
-- link de WhatsApp pronto pro admin clicar e enviar um a um — ver nota em
-- app/admin-master/configuracoes/divulgacao/page.tsx sobre por que nao e'
-- envio automatico (risco de banimento do numero sem a API oficial paga).

create table if not exists contatos_divulgacao (
  id uuid primary key default gen_random_uuid(),
  nome text,
  telefone text not null,
  origem text not null default 'manual' check (origem in ('manual', 'planilha')),
  status text not null default 'pendente' check (status in ('pendente', 'enviado')),
  criado_em timestamptz not null default now(),
  enviado_em timestamptz
);

create index if not exists idx_contatos_divulgacao_status on contatos_divulgacao(status);

alter table contatos_divulgacao enable row level security;
create policy "contatos_divulgacao_publica" on contatos_divulgacao for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login), mesmo padrao do
-- resto do projeto ate a autenticacao real existir.
