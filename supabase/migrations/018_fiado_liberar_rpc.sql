-- Caminho: C:\valente_conecta\supabase\migrations\018_fiado_liberar_rpc.sql
--
-- UPDATE direto em fiado_habilitacoes via PostgREST retornava sucesso com os
-- valores certos no RETURNING, mas a escrita nao ficava persistida (leitura
-- logo em seguida, ate' apos reload completo, mostrava o valor antigo) —
-- mesma classe de comportamento ja visto com funcoes deste projeto Supabase.
-- RPC security definer contorna, mesmo padrao que resolveu os outros casos.

create or replace function liberar_fiado_v1(p_id uuid, p_ativo boolean, p_observacao text default null)
returns fiado_habilitacoes
language sql
security definer
set search_path = public
as $$
  update fiado_habilitacoes set
    ativo = p_ativo,
    liberado_em = case when p_ativo then now() else null end,
    observacao = coalesce(p_observacao, observacao),
    updated_at = now()
  where id = p_id
  returning *;
$$;
