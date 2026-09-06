-- Caminho: C:\valente_conecta\supabase\migrations\101_fix_indicacao_estabelecimento_aprovar.sql
--
-- Corrige indicacao_estabelecimento_aprovar_v1/recusar_v1 (100): a checagem
-- de "já processado" usava "v_row.id is null" depois de um UPDATE...RETURNING
-- que não bateu nenhuma linha -- isso NÃO garante linha nula de forma
-- confiável em todo caso no PL/pgSQL. Achado testando: aprovar a mesma
-- indicação duas vezes não dava erro (mas também não pagava bônus em
-- dobro, porque o lote_numero unique já protegia isso -- só a mensagem de
-- erro pro admin estava furada). Troca pra GET DIAGNOSTICS, que conta as
-- linhas afetadas de forma explícita.

create or replace function indicacao_estabelecimento_aprovar_v1(p_id uuid, p_admin_id uuid)
returns indicacoes_estabelecimento
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row indicacoes_estabelecimento;
  v_linhas integer;
begin
  update indicacoes_estabelecimento
    set status = 'aprovado', avaliado_por = p_admin_id, processado_em = now()
    where id = p_id and status = 'pendente'
    returning * into v_row;
  get diagnostics v_linhas = row_count;

  if v_linhas = 0 then
    raise exception 'Indicação não encontrada ou já processada';
  end if;

  perform indicacao_estabelecimento_processar_bonus_v1(v_row.usuario_id);

  return v_row;
end;
$$;

create or replace function indicacao_estabelecimento_recusar_v1(p_id uuid, p_admin_id uuid, p_motivo text default null)
returns indicacoes_estabelecimento
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row indicacoes_estabelecimento;
  v_linhas integer;
begin
  update indicacoes_estabelecimento
    set status = 'recusado', motivo_recusa = p_motivo, avaliado_por = p_admin_id, processado_em = now()
    where id = p_id and status = 'pendente'
    returning * into v_row;
  get diagnostics v_linhas = row_count;

  if v_linhas = 0 then
    raise exception 'Indicação não encontrada ou já processada';
  end if;

  return v_row;
end;
$$;
