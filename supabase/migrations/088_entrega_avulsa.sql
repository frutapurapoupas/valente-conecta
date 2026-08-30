-- Caminho: C:\valente_conecta\supabase\migrations\088_entrega_avulsa.sql
--
-- Entrega avulsa por pedido, pedida pelo dono do projeto durante o desenho
-- do checkout da Cozinha Chef Neide: o cliente escolhe "entrega no
-- endereco" (taxa fixa configuravel), e o sistema aciona OU o pool
-- compartilhado do Moto Taxi (encomenda, mesmo mecanismo ja usado em
-- app/api/mototaxi/route.ts) OU um entregador proprio do negocio, se ele
-- tiver um cadastrado -- com rastreio ao vivo no mapa nos dois casos.
--
-- Explicitamente NAO mexe em agua_gas_entregadores (o Agua e Gas ja tem o
-- proprio sistema de entregador, funcionando, continua exatamente como
-- esta). As tabelas abaixo sao infraestrutura NOVA e generica, usada pela
-- Cozinha primeiro; outro modulo que precisar de entrega paga no futuro
-- reaproveita sem duplicar.
--
-- Comeca so' com o pool de Moto Taxi (Chef Neide ainda nao tem entregador
-- proprio) -- a tabela de entregador proprio ja fica pronta pra quando ela
-- quiser cadastrar um.

-- ============================================================
-- Entregador proprio GENERICO. Cadastro simples pelo dono do negocio
-- (nome/telefone/veiculo), sem login -- mesmo espirito de
-- agua_gas_entregadores, generalizado por origem_modulo.
-- ============================================================
create table if not exists entregadores_proprios (
  id uuid primary key default gen_random_uuid(),
  origem_modulo text not null, -- 'cozinha' por enquanto
  dono_id uuid, -- usuario_id do lojista dono; null em modulo singleton (Cozinha nao e' multi-tenant)
  nome text not null,
  telefone text not null,
  veiculo text,
  ativo boolean not null default true,
  latitude double precision,
  longitude double precision,
  atualizado_em timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_entregadores_proprios_modulo on entregadores_proprios(origem_modulo, ativo);

-- ============================================================
-- Job de entrega avulsa -- desacoplado do pedido de origem por
-- origem_modulo+origem_id, pra outros modulos poderem abrir uma entrega
-- sem alterar esta tabela.
-- ============================================================
create table if not exists entregas_avulsas (
  id uuid primary key default gen_random_uuid(),
  origem_modulo text not null,     -- 'cozinha_pedido'
  origem_id uuid not null,         -- cozinha_pedidos.id
  cliente_nome text not null,
  cliente_whatsapp text not null,
  endereco_entrega text not null,
  taxa_entrega numeric(10,2) not null default 0,
  tipo_entregador text not null check (tipo_entregador in ('mototaxi_pool', 'proprio')),
  entregador_proprio_id uuid references entregadores_proprios(id),
  mototaxi_corrida_id uuid references mototaxi_corridas(id),
  status text not null default 'aguardando_aceite'
    check (status in ('aguardando_aceite', 'aceita', 'coletado', 'em_entrega', 'entregue', 'cancelada')),
  aceita_em timestamptz,
  coletado_em timestamptz,
  entregue_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_entregas_avulsas_origem on entregas_avulsas(origem_modulo, origem_id);

-- ============================================================
-- Config: taxa de entrega padrao (mesmo padrao de
-- mototaxi_taxa_config/agua_gas_taxa_config em admin_configuracoes).
-- ============================================================
insert into admin_configuracoes (chave, valor, descricao)
select
  'entrega_avulsa_config',
  '{"taxaEntregaPadrao": 5.00}',
  'Taxa fixa de entrega avulsa cobrada do cliente (R$), usada por qualquer modulo que oferecer entrega no endereco'
where not exists (select 1 from admin_configuracoes where chave = 'entrega_avulsa_config');

alter table entregadores_proprios enable row level security;
alter table entregas_avulsas enable row level security;
create policy "entregadores_proprios_publica" on entregadores_proprios for all using (true) with check (true);
create policy "entregas_avulsas_publica" on entregas_avulsas for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto. O link /entregador/[id] funciona por posse do link
-- (mesmo padrao de /agua-gas/entregador/[id]), nao ha checagem de dono.

alter publication supabase_realtime add table entregas_avulsas;
alter publication supabase_realtime add table entregadores_proprios;

-- ============================================================
-- Pesquisa de satisfacao 1h apos entrega: o projeto esta no plano
-- gratuito da Vercel ate o lancamento, e o cron do Vercel Hobby so' roda
-- 1x/dia -- incompativel com "avisar 1h depois". Usa pg_cron + pg_net
-- DIRETO no Postgres do Supabase (disponivel no plano free do Supabase)
-- pra chamar a API a cada 15min, sem depender do cron da Vercel. Se/quando
-- o projeto migrar pra plano pago da Vercel, pode trocar por um cron
-- normal em vercel.json -- isso aqui ja funciona hoje sem custo extra.
-- ============================================================
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'cozinha-pesquisa-satisfacao',
  '*/15 * * * *',
  $$
  select net.http_get(
    url := current_setting('app.settings.site_url', true) || '/api/cozinha/cron/pesquisa-satisfacao',
    headers := jsonb_build_object('authorization', 'Bearer ' || current_setting('app.settings.cron_secret', true))
  );
  $$
);

-- IMPORTANTE -- passo manual obrigatorio (nao da' pra fazer por migration
-- porque sao segredos): rodar UMA VEZ no SQL Editor do Supabase, com a URL
-- real de producao e o MESMO valor de CRON_SECRET configurado na Vercel:
--
--   alter database postgres set app.settings.site_url = 'https://SEU_DOMINIO';
--   alter database postgres set app.settings.cron_secret = 'MESMO_VALOR_DE_CRON_SECRET_NA_VERCEL';
--
-- Sem isso, o job criado acima roda mas a URL/authorization ficam vazios e
-- a chamada falha silenciosamente (ver select * from cron.job_run_details
-- order by start_time desc limit 5; pra conferir).
