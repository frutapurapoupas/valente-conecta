-- Caminho: C:\valente_conecta\supabase\migrations\045_base_fiscal_pdv.sql
--
-- Base para emissao fiscal futura (NFe/NFC-e) — conforme combinado, isso
-- NAO liga emissao real de nota (exigiria certificado digital + integracao
-- paga com a SEFAZ/algum provedor, decisao de custo ainda pendente antes
-- do lancamento). O que entra aqui e' so' a fundacao: dado fiscal do
-- estabelecimento (sem o qual nenhuma nota poderia sair, seja qual for o
-- provedor escolhido depois) e um livro de controle manual de notas, pro
-- comerciante ja acompanhar o que precisa emitir enquanto a automacao nao
-- existe.

alter table perfis_fornecedor add column if not exists cnpj_cpf text;
alter table perfis_fornecedor add column if not exists inscricao_estadual text;
alter table perfis_fornecedor add column if not exists regime_tributario text
  check (regime_tributario in ('mei', 'simples_nacional', 'lucro_presumido', 'lucro_real') or regime_tributario is null);

-- create or replace em funcao ja em uso pelo pooler nao e' re-servido —
-- precisa de nome novo (ver nota de versionamento na migration 003).
create or replace function salvar_perfil_fornecedor_v3(
  p_usuario_id uuid,
  p_nome_exibicao text,
  p_telefone text,
  p_whatsapp text default null,
  p_endereco text default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_plano text default 'gratis',
  p_horarios jsonb default null,
  p_cnpj_cpf text default null,
  p_inscricao_estadual text default null,
  p_regime_tributario text default null
)
returns perfis_fornecedor
language sql
security definer
set search_path = public
as $$
  insert into perfis_fornecedor (
    usuario_id, nome_exibicao, telefone, whatsapp, endereco, latitude, longitude, plano, horarios,
    cnpj_cpf, inscricao_estadual, regime_tributario, updated_at
  )
  values (
    p_usuario_id, p_nome_exibicao, p_telefone, p_whatsapp, p_endereco, p_latitude, p_longitude, p_plano, p_horarios,
    p_cnpj_cpf, p_inscricao_estadual, p_regime_tributario, now()
  )
  on conflict (usuario_id) do update set
    nome_exibicao = excluded.nome_exibicao,
    telefone = excluded.telefone,
    whatsapp = excluded.whatsapp,
    endereco = excluded.endereco,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    plano = excluded.plano,
    horarios = excluded.horarios,
    cnpj_cpf = excluded.cnpj_cpf,
    inscricao_estadual = excluded.inscricao_estadual,
    regime_tributario = excluded.regime_tributario,
    updated_at = now()
  returning *;
$$;

-- Livro de controle manual de notas — o comerciante registra que emitiu
-- (ou precisa emitir) uma nota pra um lancamento do caixa. Sem chave de
-- acesso/XML/PDF de verdade (isso so' existe com emissao real automatizada,
-- fora de escopo agora) — so' numero/serie que o proprio emissor externo
-- (portal do MEI, contador etc) ja devolveu, se o comerciante quiser
-- registrar aqui por organizacao.
create table if not exists pdv_notas_fiscais (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  lancamento_id uuid references pdv_caixa_lancamentos(id) on delete set null,
  tipo text not null default 'nfce' check (tipo in ('nfce', 'nfe')),
  numero text,
  serie text,
  valor numeric(12,2) not null,
  status text not null default 'pendente' check (status in ('pendente', 'emitida', 'cancelada')),
  emitida_em timestamptz,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pdv_notas_usuario on pdv_notas_fiscais(usuario_id);
create index if not exists idx_pdv_notas_status on pdv_notas_fiscais(status);

alter table pdv_notas_fiscais enable row level security;
create policy "pdv_notas_fiscais_publica" on pdv_notas_fiscais for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do resto do projeto.
