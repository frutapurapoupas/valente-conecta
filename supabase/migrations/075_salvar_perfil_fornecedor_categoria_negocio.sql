-- Caminho: C:\valente_conecta\supabase\migrations\075_salvar_perfil_fornecedor_categoria_negocio.sql
--
-- categoria_negocio (074_perfil_fornecedor_categoria_negocio.sql) precisa
-- ser escrita pela mesma RPC security definer que grava os outros campos
-- de perfis_fornecedor -- update direto na tabela pela chave anon nao
-- persiste (a tabela so tem policy de insert/update "using(true)", sem
-- policy de select nenhuma, e na pratica o PostgREST nao efetiva o UPDATE
-- sem conseguir montar a representacao de volta; achado testando).
--
-- p_categoria_negocio com default null: nao quebra a chamada ja existente
-- em lib/catalogo/catalogoService.ts (salvarPerfilFornecedor), que continua
-- passando os parametros nomeados de sempre sem esse novo campo.
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
  p_regime_tributario text default null,
  p_categoria_negocio text default null
)
returns perfis_fornecedor
language sql
security definer
set search_path = public
as $$
  insert into perfis_fornecedor (
    usuario_id, nome_exibicao, telefone, whatsapp, endereco, latitude, longitude, plano, horarios,
    cnpj_cpf, inscricao_estadual, regime_tributario, categoria_negocio, updated_at
  )
  values (
    p_usuario_id, p_nome_exibicao, p_telefone, p_whatsapp, p_endereco, p_latitude, p_longitude, p_plano, p_horarios,
    p_cnpj_cpf, p_inscricao_estadual, p_regime_tributario, p_categoria_negocio, now()
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
    categoria_negocio = coalesce(excluded.categoria_negocio, perfis_fornecedor.categoria_negocio),
    updated_at = now()
  returning *;
$$;
