-- Caminho: C:\valente_conecta\supabase\migrations\042_horario_funcionamento_fornecedor.sql
--
-- Horario semanal de funcionamento do fornecedor (prestadores de servico,
-- hospitais/clinicas em saude, e qualquer outro modulo que use
-- LojaAdminShell/PerfilFornecedorForm). Guardado em perfis_fornecedor
-- porque o horario e' do ESTABELECIMENTO, nao de cada item publicado.
--
-- Formato de "horarios" (jsonb): array de ate 7 entradas
--   [{ "dia": 0-6 (0=domingo), "ativo": bool, "abre": "HH:MM", "fecha": "HH:MM" }, ...]
--
-- perfis_fornecedor nao tem policy de select publica (telefone/whatsapp/
-- endereco sao protegidos, ver migration 003) — horario NAO e' dado
-- sensivel (e' informacao publica tipica de vitrine de loja), por isso
-- ganha uma RPC security definer dedicada que devolve so' o horario, sem
-- vazar o resto do perfil.

alter table perfis_fornecedor add column if not exists horarios jsonb;

-- create or replace em funcao ja em uso pelo pooler nao e' re-servido —
-- precisa de nome novo (ver nota de versionamento na migration 003).
create or replace function salvar_perfil_fornecedor_v2(
  p_usuario_id uuid,
  p_nome_exibicao text,
  p_telefone text,
  p_whatsapp text default null,
  p_endereco text default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_plano text default 'gratis',
  p_horarios jsonb default null
)
returns perfis_fornecedor
language sql
security definer
set search_path = public
as $$
  insert into perfis_fornecedor (usuario_id, nome_exibicao, telefone, whatsapp, endereco, latitude, longitude, plano, horarios, updated_at)
  values (p_usuario_id, p_nome_exibicao, p_telefone, p_whatsapp, p_endereco, p_latitude, p_longitude, p_plano, p_horarios, now())
  on conflict (usuario_id) do update set
    nome_exibicao = excluded.nome_exibicao,
    telefone = excluded.telefone,
    whatsapp = excluded.whatsapp,
    endereco = excluded.endereco,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    plano = excluded.plano,
    horarios = excluded.horarios,
    updated_at = now()
  returning *;
$$;

create or replace function horario_publico_fornecedor_v1(p_usuario_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select horarios from perfis_fornecedor where usuario_id = p_usuario_id;
$$;
