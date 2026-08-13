-- Caminho: C:\valente_conecta\supabase\migrations\032_moeda_conecta_fix_cidade.sql
--
-- Corrige bug real encontrado em teste: moeda_conecta_transferir_v1 comparava
-- a cidade do remetente (normalizada em maiusculas pela API) com a cidade do
-- destinatario vinda direto de usuarios.cidade_base (texto livre, "Valente"
-- em vez de "VALENTE") — a comparacao de texto sempre dava diferente,
-- entao TODA transferencia, mesmo dentro da mesma cidade, ficava presa
-- como "pendente_moderacao" por engano.
--
-- v2 normaliza (upper+trim) os dois lados sempre, dentro da propria funcao,
-- sem depender de quem chama ja ter normalizado. Nome novo (v2) por causa
-- do cache do pooler de conexoes documentado em 003_marketplace_interesse.sql
-- — "create or replace" numa funcao ja em uso nao troca o plano servido.

create or replace function moeda_conecta_transferir_v2(
  p_remetente_id uuid,
  p_destinatario_id uuid,
  p_cidade text,
  p_valor numeric,
  p_tipo text default 'transferencia',
  p_descricao text default null
)
returns moeda_conecta_transacoes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_saldo numeric;
  v_cidade text;
  v_cidade_destino text;
  v_status text;
  v_transacao moeda_conecta_transacoes;
begin
  if p_valor is null or p_valor <= 0 then
    raise exception 'Valor deve ser positivo';
  end if;
  if p_remetente_id = p_destinatario_id then
    raise exception 'Remetente e destinatario nao podem ser o mesmo usuario';
  end if;
  if p_tipo not in ('transferencia', 'pagamento_comercio', 'recarga') then
    raise exception 'Tipo invalido para transferencia';
  end if;

  v_cidade := upper(trim(p_cidade));

  insert into moeda_conecta_contas (usuario_id, cidade_base)
    values (p_remetente_id, v_cidade) on conflict (usuario_id) do nothing;

  select upper(trim(cidade_base)) into v_cidade_destino from moeda_conecta_contas where usuario_id = p_destinatario_id;
  if v_cidade_destino is null then
    select upper(trim(cidade_base)) into v_cidade_destino from usuarios where id = p_destinatario_id;
  end if;
  v_cidade_destino := coalesce(v_cidade_destino, v_cidade);

  insert into moeda_conecta_contas (usuario_id, cidade_base)
    values (p_destinatario_id, v_cidade_destino) on conflict (usuario_id) do nothing;

  select saldo into v_saldo from moeda_conecta_contas where usuario_id = p_remetente_id for update;

  if v_saldo < p_valor then
    raise exception 'Saldo insuficiente';
  end if;

  update moeda_conecta_contas set saldo = saldo - p_valor, atualizado_em = now() where usuario_id = p_remetente_id;

  if v_cidade_destino = v_cidade then
    update moeda_conecta_contas set saldo = saldo + p_valor, atualizado_em = now() where usuario_id = p_destinatario_id;
    v_status := 'concluida';
  else
    v_status := 'pendente_moderacao';
  end if;

  insert into moeda_conecta_transacoes (tipo, remetente_id, destinatario_id, cidade, cidade_destino, valor, descricao, status)
  values (p_tipo, p_remetente_id, p_destinatario_id, v_cidade, v_cidade_destino, p_valor, p_descricao, v_status)
  returning * into v_transacao;

  return v_transacao;
end;
$$;

-- Mesma normalizacao (upper+trim) na recarga administrativa, pra manter
-- moeda_conecta_contas.cidade_base sempre no mesmo formato que
-- moeda_conecta_transferir_v2 espera — evita o mesmo tipo de bug aparecer
-- mais tarde numa transferencia envolvendo uma conta criada via credito
-- administrativo.
create or replace function moeda_conecta_creditar_admin_v2(
  p_admin_id uuid,
  p_destinatario_id uuid,
  p_cidade text,
  p_valor numeric,
  p_descricao text default null
)
returns moeda_conecta_transacoes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cidade text;
  v_transacao moeda_conecta_transacoes;
begin
  if p_valor is null or p_valor <= 0 then
    raise exception 'Valor deve ser positivo';
  end if;

  v_cidade := upper(trim(p_cidade));

  insert into moeda_conecta_contas (usuario_id, cidade_base)
    values (p_destinatario_id, v_cidade) on conflict (usuario_id) do nothing;

  update moeda_conecta_contas set saldo = saldo + p_valor, atualizado_em = now() where usuario_id = p_destinatario_id;

  insert into moeda_conecta_transacoes (tipo, remetente_id, destinatario_id, cidade, cidade_destino, valor, descricao, status, moderado_por, moderado_em)
  values ('ajuste_admin', p_admin_id, p_destinatario_id, v_cidade, v_cidade, p_valor, p_descricao, 'concluida', p_admin_id, now())
  returning * into v_transacao;

  return v_transacao;
end;
$$;
