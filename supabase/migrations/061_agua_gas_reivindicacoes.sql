-- Caminho: C:\valente_conecta\supabase\migrations\061_agua_gas_reivindicacoes.sql
--
-- O modulo Agua e Gas (014_agua_gas_supabase.sql) ja tem dono_id direto na
-- tabela agua_gas_fornecedores, mas so' dava pra virar dono criando um
-- cadastro novo do zero em /agua-gas/fornecedor — nao havia como reivindicar
-- um fornecedor ja' IMPORTADO do Google (dono_id nulo), diferente do padrao
-- ja' usado em Comercios (056) e Saude (059). Usuario reportou que o botao
-- "sou proprietário" nao aparece aqui tambem.
--
-- Mesma tabela dedicada, mesmo padrao, reaproveitando a MESMA config de
-- moderacao (admin_configuracoes.chave='comercios_moderacao').

create table if not exists agua_gas_reivindicacoes (
  id uuid primary key default gen_random_uuid(),
  fornecedor_id uuid not null references agua_gas_fornecedores(id) on delete cascade,
  usuario_id uuid,
  nome_solicitante text,
  telefone_solicitante text not null,
  dados_novos jsonb not null, -- {nome, responsavel, telefone, whatsapp, endereco, horario}
  status text not null default 'pendente' check (status in ('pendente', 'aprovada', 'recusada')),
  motivo_recusa text,
  created_at timestamptz not null default now(),
  processado_em timestamptz
);

create index if not exists idx_agua_gas_reivindicacoes_status on agua_gas_reivindicacoes(status);
create index if not exists idx_agua_gas_reivindicacoes_fornecedor on agua_gas_reivindicacoes(fornecedor_id);

alter table agua_gas_reivindicacoes enable row level security;
create policy "agua_gas_reivindicacoes_publica" on agua_gas_reivindicacoes for all using (true) with check (true);

-- NOTA DE SEGURANCA: policy publica temporaria (sem login real), mesmo
-- padrao do resto do projeto ate a autenticacao existir.
