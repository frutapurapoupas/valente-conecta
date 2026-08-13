-- Caminho: C:\valente_conecta\supabase\migrations\034_cdl.sql
--
-- Papel do CDL (Camara de Dirigentes Lojistas) da cidade, configuravel —
-- pedido explicito do dono do projeto: cada cidade pode ligar uma
-- combinacao das 3 capacidades abaixo, sem o CDL ter participacao nos
-- resultados financeiros da Moeda Conecta (por isso ele nunca aparece nas
-- RPCs de dinheiro, so' em leitura agregada):
--
--   cdl_selo_ativo       — selo de apoio institucional (so' exibicao)
--   cdl_curadoria_ativa  — pode marcar comercios como "recomendado pelo CDL"
--   cdl_relatorios_ativo — ve metricas agregadas da cidade (sem dado por usuario)
--
-- Acesso do representante do CDL: PIN, mesmo padrao ja usado no login de
-- funcionario da Agenda (019_agenda_fila.sql) — hash com pgcrypto,
-- "extensions" no search_path porque e' onde o pgcrypto fica instalado no
-- Supabase.

alter table cidades_moeda_config
  add column if not exists cdl_selo_ativo boolean not null default false,
  add column if not exists cdl_curadoria_ativa boolean not null default false,
  add column if not exists cdl_relatorios_ativo boolean not null default false;

create table if not exists cdl_representantes (
  id uuid primary key default gen_random_uuid(),
  cidade text not null,
  nome text not null,
  whatsapp text,
  pin_hash text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_cdl_representantes_cidade on cdl_representantes(cidade);

-- Marca de curadoria do CDL num item do catalogo (reaproveita catalogo_itens,
-- ver 003_marketplace_interesse.sql) — so' visivel/editavel por quem tem
-- cdl_curadoria_ativa ligado pra cidade daquele item.
alter table catalogo_itens add column if not exists recomendado_cdl boolean not null default false;

create or replace function criar_representante_cdl(p_cidade text, p_nome text, p_whatsapp text, p_pin text)
returns table (id uuid, nome text, cidade text)
language sql
security definer
set search_path = public, extensions
as $$
  insert into cdl_representantes (cidade, nome, whatsapp, pin_hash)
  values (upper(trim(p_cidade)), p_nome, p_whatsapp, crypt(p_pin, gen_salt('bf')))
  returning id, nome, cidade;
$$;

create or replace function login_representante_cdl(p_representante_id uuid, p_pin text)
returns table (id uuid, nome text, cidade text)
language sql
security definer
set search_path = public, extensions
as $$
  select id, nome, cidade
  from cdl_representantes
  where id = p_representante_id and ativo = true and pin_hash = crypt(p_pin, pin_hash);
$$;

alter table cdl_representantes enable row level security;
create policy "cdl_representantes_publica" on cdl_representantes for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto — o PIN e' a unica barreira aqui, igual ao funcionario
-- da Agenda.
