-- Caminho: C:\valente_conecta\supabase\migrations\079_mototaxi_taxa_uso.sql
--
-- Taxa de uso da plataforma no Moto Taxi (5% cliente + 5% motorista, valor
-- configuravel pelo admin master em admin_configuracoes, chave
-- 'mototaxi_taxa_config') -- NAO e' uma divisao da corrida em si (o valor da
-- corrida continua sendo acertado direto entre motorista e passageiro, fora
-- da plataforma, igual ja funciona hoje). E' uma cobranca separada da
-- plataforma pra cada lado, toda vez que a corrida foi arranjada pelo app.
--
-- Isencao: cliente com usuarios.plano_geral pago (basico/ilimitado) nao paga
-- a taxa dele; motorista com assinatura ativa em assinaturas_planos
-- (servico_id = 'moto_taxi', status = 'ativo') nao paga a dele -- cada lado e'
-- avaliado de forma independente.
--
-- Fluxo: ao concluir a corrida, tenta debitar da Carteira Digital (Moeda
-- Conecta) de cada parte nao isenta. Sem saldo suficiente, ou corrida paga em
-- dinheiro, fica 'pendente' e o app dispara lembrete automatico (push, com
-- link de WhatsApp) ate ser pago via checkout Mercado Pago -- mesmo padrao ja
-- usado em carona_desbloqueios (041_carona_solidaria.sql).

create table if not exists mototaxi_taxas_uso (
  id uuid primary key default gen_random_uuid(),
  corrida_id uuid not null references mototaxi_corridas(id) on delete cascade,
  papel text not null check (papel in ('cliente', 'motorista')),
  usuario_id uuid, -- passageiro (usuarios.id) ou motorista (mototaxi_motoristas.usuario_id) quando existir login
  usuario_local_id uuid, -- id anonimo do navegador, pra quem ainda nao tem login (ver lib/usuarioLocal.ts)
  telefone text, -- pra lembrete via WhatsApp mesmo sem login
  valor numeric(12,2) not null default 0,
  percentual_aplicado numeric(5,2) not null default 0,
  status text not null default 'pendente' check (status in ('isento', 'pendente', 'pago')),
  pago_via text check (pago_via in ('carteira', 'mercadopago')),
  mp_preference_id text,
  mp_payment_id text,
  lembretes_enviados integer not null default 0,
  ultimo_lembrete_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (corrida_id, papel)
);

create index if not exists idx_mototaxi_taxas_uso_status on mototaxi_taxas_uso(status);
create index if not exists idx_mototaxi_taxas_uso_usuario on mototaxi_taxas_uso(usuario_id);
create index if not exists idx_mototaxi_taxas_uso_mp_preference on mototaxi_taxas_uso(mp_preference_id);

alter table mototaxi_taxas_uso enable row level security;
create policy "mototaxi_taxas_uso_publica" on mototaxi_taxas_uso for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real completo), mesmo
-- padrao do resto do projeto.

alter publication supabase_realtime add table mototaxi_taxas_uso;

-- Config inicial (5% + 5%), no mesmo padrao key-value ja usado em
-- admin_configuracoes (ver app/api/admin-master/carona/config/route.ts) --
-- so' insere se ainda nao existir, pra nao sobrescrever se o admin ja tiver
-- rodado essa migration antes.
insert into admin_configuracoes (chave, valor, descricao)
select
  'mototaxi_taxa_config',
  '{"taxaPercentualCliente": 5, "taxaPercentualMotorista": 5}',
  'Taxa de uso da plataforma no Moto Taxi (% cobrado de cada lado por corrida, cliente e motorista com plano pago ficam isentos)'
where not exists (select 1 from admin_configuracoes where chave = 'mototaxi_taxa_config');
