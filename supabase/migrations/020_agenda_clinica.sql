-- Caminho: C:\valente_conecta\supabase\migrations\020_agenda_clinica.sql
--
-- Especializacao do modulo Agenda+Fila (019_agenda_fila.sql) para
-- clinicas/hospitais (arquetipo 'agenda-profissional' do modulo saude —
-- ver lib/catalogo/marketplaceTypes.ts), pedido do usuario do projeto:
--   - cadastro presencial obrigatorio (opcional por loja): paciente so'
--     consegue entrar na fila/agendar virtualmente depois de ter sido
--     cadastrado pessoalmente na recepcao
--
-- Requer 019_agenda_fila.sql ja aplicado (com o fix de search_path do
-- pgcrypto em login_funcionario_agenda incluido nele).

-- 1) Cadastro presencial de pacientes -------------------------------------
create table if not exists agenda_pacientes (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null,
  nome text not null,
  telefone text not null,
  observacao text,
  cadastrado_em timestamptz not null default now()
);

create index if not exists idx_agenda_pacientes_dono on agenda_pacientes(dono_id);
create unique index if not exists idx_agenda_pacientes_dono_telefone on agenda_pacientes(dono_id, telefone);

alter table agenda_pacientes enable row level security;
create policy "agenda_pacientes_publica" on agenda_pacientes for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login), mesmo padrao do
-- restante do modulo agenda e do resto do projeto ate a autenticacao
-- existir de verdade.

-- 2) Loja pode exigir cadastro presencial previo -------------------------
alter table agenda_habilitacoes add column if not exists exige_cadastro_previo boolean not null default false;
