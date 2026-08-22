-- Caminho: C:\valente_conecta\supabase\migrations\059_saude_reivindicacoes.sql
--
-- O diretorio de Saude (053_saude_estabelecimentos.sql) foi construido
-- ANTES do botao "Sou proprietário" existir (veio depois, junto com
-- 056_comercios_diretorio.sql) e nunca recebeu essa atualizacao — usuario
-- reportou que o botao nao aparece no grupo Farmacia (na verdade falta em
-- todos os tipos de saude, nao so' farmacia).
--
-- Tabela dedicada (em vez de reaproveitar comercios_diretorio_reivindicacoes,
-- que tem FK fixa pra comercios_diretorio) pra manter saude_estabelecimentos
-- como um dominio proprio, mesmo padrao. Reaproveita a MESMA config de
-- moderacao (admin_configuracoes.chave='comercios_moderacao') — e' a mesma
-- decisao de negocio (auto/manual), nao faz sentido ter dois toggles
-- separados pra a mesma coisa.

create table if not exists saude_estabelecimentos_reivindicacoes (
  id uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid not null references saude_estabelecimentos(id) on delete cascade,
  usuario_id uuid,
  nome_solicitante text,
  telefone_solicitante text not null,
  dados_novos jsonb not null, -- {nome, telefone, whatsapp, endereco, horario, tipo, especialidades, foto}
  status text not null default 'pendente' check (status in ('pendente', 'aprovada', 'recusada')),
  motivo_recusa text,
  created_at timestamptz not null default now(),
  processado_em timestamptz
);

create index if not exists idx_saude_reivindicacoes_status on saude_estabelecimentos_reivindicacoes(status);
create index if not exists idx_saude_reivindicacoes_estabelecimento on saude_estabelecimentos_reivindicacoes(estabelecimento_id);

alter table saude_estabelecimentos_reivindicacoes enable row level security;
create policy "saude_reivindicacoes_publica" on saude_estabelecimentos_reivindicacoes for all using (true) with check (true);

-- NOTA DE SEGURANCA: policy publica temporaria (sem login real), mesmo
-- padrao do resto do projeto ate a autenticacao existir.
