-- Caminho: C:\valente_conecta\supabase\migrations\049_pdv_captura_externa.sql
--
-- Base pro "modo espiao" (#106 do backlog, tratado como pesquisa separada
-- — nao existe pesquisa previa registrada no projeto pra reaproveitar).
-- Reconhecer automaticamente a tela de qualquer PDV de terceiro via visao
-- computacional nao e' confiavel sem testar contra o sistema real do
-- comerciante (cada PDV tem layout proprio) — a fundacao segura separa
-- CAPTURA (foto) de APLICACAO (dado real no catalogo/caixa), com
-- confirmacao humana no meio. Hoje o preenchimento e' manual (comerciante
-- olha a foto e digita); quando um OCR automatico for viavel, ele so'
-- precisa preencher o mesmo campo `dados` que hoje e' preenchido a mao —
-- sem mudanca de schema.

create table if not exists pdv_modo_externo (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references usuarios(id) on delete cascade,
  ativo boolean not null default false,
  ativado_em timestamptz
);

create table if not exists pdv_capturas_externas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  tipo text not null check (tipo in ('produto', 'venda')),
  foto_url text not null,
  dados jsonb not null default '{}',
  status text not null default 'pendente' check (status in ('pendente', 'aplicado', 'descartado')),
  referencia_id uuid, -- id do pdv_estoque_itens ou pdv_caixa_lancamentos gerado ao aplicar, pra rastreabilidade
  created_at timestamptz not null default now(),
  aplicado_em timestamptz
);

create index if not exists idx_pdv_capturas_usuario on pdv_capturas_externas(usuario_id);
create index if not exists idx_pdv_capturas_status on pdv_capturas_externas(status);

alter table pdv_modo_externo enable row level security;
alter table pdv_capturas_externas enable row level security;
create policy "pdv_modo_externo_publica" on pdv_modo_externo for all using (true) with check (true);
create policy "pdv_capturas_externas_publica" on pdv_capturas_externas for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do resto do projeto.
