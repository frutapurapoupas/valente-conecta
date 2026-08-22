-- Caminho: C:\valente_conecta\supabase\migrations\056_comercios_diretorio.sql
--
-- Generaliza o padrao gratuito ja usado em saude_estabelecimentos
-- (053) e agua_gas_fornecedores (014) pros modulos restantes do catalogo
-- que ainda nao tem fornecedor real cadastrado (confirmado com o dono do
-- projeto — a unica excecao e' Cozinha Chef Neide, que e' um sistema
-- totalmente separado, nem passa pelo catalogo_itens generico, entao nao
-- e' afetada por nada aqui): alimentacao, mercados, moda, pet, construcao,
-- servicos. UMA tabela generica em vez de 6 iguais, parametrizada por
-- "modulo" — mesmos nomes usados em CATEGORIAS_POR_MODULO
-- (lib/catalogo/modulosConfig.ts).
--
-- Novidade em relacao ao padrao anterior: "reivindicar" o cadastro. O dono
-- de verdade clica "Sou proprietário", atualiza os dados, e isso vira uma
-- solicitacao — aprovada manualmente pelo admin master OU automaticamente,
-- conforme a config em admin_configuracoes (chave 'comercios_moderacao').
-- Ao aprovar, o comercio ganha dono_id de verdade e uma habilitacao no
-- modulo Agenda+Fila (019_agenda_fila.sql) e' criada/ativada — a partir
-- dai o dono pode cadastrar profissionais/horarios e o comercio passa a
-- aceitar agendamento pelos clientes.

create table if not exists comercios_diretorio (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid,
  modulo text not null check (modulo in ('alimentacao', 'mercados', 'moda', 'pet', 'construcao', 'servicos')),
  categoria text not null,
  nome text not null,
  telefone text,
  whatsapp text,
  endereco text,
  bairro text,
  cidade text not null default 'Valente',
  latitude double precision,
  longitude double precision,
  horario text,
  foto text,
  google_place_id text,
  status text not null default 'publicado' check (status in ('publicado', 'pausado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_comercios_diretorio_modulo on comercios_diretorio(modulo);
create index if not exists idx_comercios_diretorio_status on comercios_diretorio(status);
create index if not exists idx_comercios_diretorio_cidade on comercios_diretorio(cidade);

alter table comercios_diretorio add constraint comercios_diretorio_google_place_id_key unique (google_place_id);

-- ============================================================
-- Reivindicacao de negocio ("Sou proprietário")
-- ============================================================
create table if not exists comercios_diretorio_reivindicacoes (
  id uuid primary key default gen_random_uuid(),
  comercio_id uuid not null references comercios_diretorio(id) on delete cascade,
  usuario_id uuid,
  nome_solicitante text,
  telefone_solicitante text not null,
  dados_novos jsonb not null, -- {nome, telefone, whatsapp, endereco, horario, categoria, foto}
  status text not null default 'pendente' check (status in ('pendente', 'aprovada', 'recusada')),
  motivo_recusa text,
  created_at timestamptz not null default now(),
  processado_em timestamptz
);

create index if not exists idx_comercios_reivindicacoes_status on comercios_diretorio_reivindicacoes(status);
create index if not exists idx_comercios_reivindicacoes_comercio on comercios_diretorio_reivindicacoes(comercio_id);

-- Config de moderacao (auto/manual), mesmo padrao de admin_configuracoes ja
-- usado no resto do projeto (chave/valor jsonb-em-texto).
insert into admin_configuracoes (chave, valor)
select 'comercios_moderacao', '{"auto": false}'
where not exists (select 1 from admin_configuracoes where chave = 'comercios_moderacao');

alter table comercios_diretorio enable row level security;
alter table comercios_diretorio_reivindicacoes enable row level security;
create policy "comercios_diretorio_publica" on comercios_diretorio for all using (true) with check (true);
create policy "comercios_reivindicacoes_publica" on comercios_diretorio_reivindicacoes for all using (true) with check (true);

-- NOTA DE SEGURANCA: policies publicas temporarias (sem login real), mesmo
-- padrao do resto do projeto ate a autenticacao existir.
