-- Caminho: C:\valente_conecta\supabase\migrations\053_saude_estabelecimentos.sql
--
-- Diretorio publico e GRATUITO de hospitais/clinicas/consultorios, separado
-- do catalogo_itens generico (003_marketplace_interesse.sql) de proposito:
-- catalogo_itens esconde telefone/endereco atras do fluxo pago de
-- "interesse" (desbloqueio), e informacao de saude/emergencia nao deveria
-- ficar atras de paywall nenhum — decisao confirmada com o dono do projeto.
--
-- dono_id fica nullable e sem FK de proposito: a maioria das linhas nasce
-- importada do Google Places (sem usuario dono ainda). Quando o
-- estabelecimento "reclamar" o cadastro (usuario real assumir), dono_id
-- passa a apontar pra usuarios.id — e nesse momento o MESMO id dessa linha
-- pode virar o dono_id de agenda_habilitacoes (019_agenda_fila.sql) pra
-- ligar o hospital/clinica na fila digital ja existente, sem precisar de
-- schema novo pra isso.

create table if not exists saude_estabelecimentos (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid,
  nome text not null,
  tipo text not null default 'clinica' check (tipo in ('hospital', 'clinica', 'consultorio', 'laboratorio', 'farmacia', 'outro')),
  especialidades text[] not null default '{}',
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

create index if not exists idx_saude_estabelecimentos_status on saude_estabelecimentos(status);
create index if not exists idx_saude_estabelecimentos_tipo on saude_estabelecimentos(tipo);
create index if not exists idx_saude_estabelecimentos_cidade on saude_estabelecimentos(cidade);

-- Constraint unique "cheia" (nao indice parcial) — precisa ser assim pra
-- funcionar como alvo de ON CONFLICT no upsert do supabase-js (ver
-- 051_fix_unique_google_place_id.sql, mesmo problema ja resolvido la'). NULL
-- nunca colide com NULL, entao continua permitindo varias linhas sem
-- google_place_id (cadastradas manualmente) sem violar a unicidade.
alter table saude_estabelecimentos add constraint saude_estabelecimentos_google_place_id_key unique (google_place_id);

alter table saude_estabelecimentos enable row level security;
create policy "saude_estabelecimentos_leitura_publica" on saude_estabelecimentos
  for select using (true);
create policy "saude_estabelecimentos_escrita_publica" on saude_estabelecimentos
  for all using (true) with check (true);

-- NOTA DE SEGURANCA: policy publica temporaria (sem login), mesmo padrao do
-- resto do projeto ate a autenticacao real existir. Escrita hoje e' feita
-- so' pelo admin master (importacao) e futuramente pelo dono que reclamar
-- o cadastro.
