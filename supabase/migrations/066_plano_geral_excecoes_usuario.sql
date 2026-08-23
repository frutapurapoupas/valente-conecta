-- Caminho: C:\valente_conecta\supabase\migrations\066_plano_geral_excecoes_usuario.sql
--
-- Controle por usuario individual do Plano Geral (055_plano_geral.sql).
-- Ate agora so' dava pra configurar limite por NIVEL (afeta todo mundo do
-- mesmo tier igual) -- pedido do admin master: poder bloquear, liberar ou
-- dar um limite diferente pra um usuario especifico, sem mudar o nivel
-- inteiro dele. Trocar o nivel em si (usuarios.plano_geral) ja e' suportado
-- pela RPC existente, nao precisa de nada novo pra isso.
--
-- Seguranca: a funcao so' muda de comportamento quando existe uma linha de
-- excecao pra aquele (usuario, servico). Sem excecao -- o caso de 100% dos
-- usuarios hoje -- o fluxo e' identico ao que ja roda em producao. As 7
-- rotas que ja chamam essa RPC nao precisam de nenhuma alteracao.

create table if not exists plano_geral_excecoes_usuario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null,
  servico text not null check (servico in ('carona_desbloqueio', 'fila_hospital', 'mototaxi', 'agua_gas', 'academia', 'busca_google')),
  modo text not null check (modo in ('bloqueado', 'ilimitado', 'limite_customizado')),
  limite_customizado integer, -- so' usado quando modo='limite_customizado'
  motivo text,
  criado_por uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (usuario_id, servico)
);

create index if not exists idx_plano_geral_excecoes_usuario on plano_geral_excecoes_usuario(usuario_id);

alter table plano_geral_excecoes_usuario enable row level security;
create policy "plano_geral_excecoes_usuario_publica" on plano_geral_excecoes_usuario for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica publica temporaria (sem login real), mesmo
-- padrao do restante do projeto ate a autenticacao existir.

-- ============================================================
-- Mesma RPC de 055_plano_geral.sql, com a leitura da excecao adicionada
-- logo depois de resolver o tier e antes de buscar plano_geral_limites.
-- Assinatura de retorno (permitido, restantes, tier) INALTERADA -- as
-- rotas que ja chamam essa funcao nao precisam saber que isso existe.
-- ============================================================
create or replace function plano_geral_verificar_e_consumir(p_usuario_id uuid, p_servico text)
returns table (permitido boolean, restantes integer, tier text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tier text;
  v_valido_ate timestamptz;
  v_limite integer;
  v_periodo text;
  v_chave text;
  v_contagem integer;
  v_excecao_modo text;
  v_excecao_limite integer;
begin
  select plano_geral, plano_geral_valido_ate into v_tier, v_valido_ate
  from usuarios where id = p_usuario_id;

  if v_tier is null then
    v_tier := 'gratis';
  end if;
  -- Assinatura paga vencida sem renovar: volta pro gratis na hora, sem
  -- precisar de job agendado pra isso.
  if v_tier <> 'gratis' and v_valido_ate is not null and v_valido_ate < now() then
    v_tier := 'gratis';
  end if;

  select limite, periodo into v_limite, v_periodo
  from plano_geral_limites where plano_geral_limites.tier = v_tier and servico = p_servico;

  if v_periodo is null then
    v_periodo := 'mensal';
  end if;
  v_chave := case when v_periodo = 'diario' then to_char(now(), 'YYYY-MM-DD') else to_char(now(), 'YYYY-MM') end;

  -- Excecao por usuario+servico (novo) -- sobrescreve so' o limite, o
  -- periodo continua vindo do tier (e' propriedade do servico, nao do
  -- usuario). Sem excecao cadastrada, v_limite fica exatamente como veio
  -- de plano_geral_limites acima, igual sempre foi.
  select modo, limite_customizado into v_excecao_modo, v_excecao_limite
  from plano_geral_excecoes_usuario
  where usuario_id = p_usuario_id and servico = p_servico;

  if v_excecao_modo = 'bloqueado' then
    permitido := false; restantes := 0; tier := v_tier;
    return next;
    return;
  elsif v_excecao_modo = 'ilimitado' then
    v_limite := null;
  elsif v_excecao_modo = 'limite_customizado' then
    v_limite := v_excecao_limite;
  end if;

  -- Sem limite (ilimitado por tier, por excecao, ou limite nao configurado)
  if v_limite is null then
    insert into plano_geral_uso (usuario_id, servico, periodo_chave, contagem)
      values (p_usuario_id, p_servico, v_chave, 1)
      on conflict (usuario_id, servico, periodo_chave) do update set contagem = plano_geral_uso.contagem + 1, updated_at = now();
    permitido := true; restantes := -1; tier := v_tier;
    return next;
    return;
  end if;

  select contagem into v_contagem from plano_geral_uso
    where usuario_id = p_usuario_id and servico = p_servico and periodo_chave = v_chave
    for update;

  if v_contagem is null then
    v_contagem := 0;
  end if;

  if v_contagem >= v_limite then
    permitido := false; restantes := 0; tier := v_tier;
    return next;
    return;
  end if;

  insert into plano_geral_uso (usuario_id, servico, periodo_chave, contagem)
    values (p_usuario_id, p_servico, v_chave, 1)
    on conflict (usuario_id, servico, periodo_chave) do update set contagem = plano_geral_uso.contagem + 1, updated_at = now();

  permitido := true; restantes := v_limite - (v_contagem + 1); tier := v_tier;
  return next;
end;
$$;
