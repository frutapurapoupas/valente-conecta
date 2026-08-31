-- Caminho: C:\valente_conecta\supabase\migrations\089_campanha_viral_populacao.sql
--
-- Substitui a logica individual de "teste 2 dias + indicar 50 pra ganhar 30
-- dias" por uma campanha de lancamento POR CIDADE: enquanto o numero de
-- usuarios cadastrados na cidade nao bate a meta configurada pelo admin
-- master, todo cadastro novo daquela cidade ganha acesso gratuito
-- indefinido (acesso_campanha_viral=true), setado uma unica vez no momento
-- do cadastro -- nao retroage se a meta for batida depois (quem ja tinha
-- a flag mantem o acesso pra sempre).

alter table usuarios add column if not exists acesso_campanha_viral boolean not null default false;

create table if not exists campanha_viral_cidades (
  cidade text primary key,
  meta_populacao integer not null check (meta_populacao > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table campanha_viral_cidades enable row level security;
create policy "campanha_viral_cidades_publica" on campanha_viral_cidades for all using (true) with check (true);

-- referral_processar_bonus_v3: mesma logica de referral_processar_bonus_v2
-- (036/037), so' que a contagem de "usuarios_gerais" tambem conta quem tem
-- acesso_campanha_viral=true (nao so' quem ainda esta dentro do
-- trial_end_at) -- nome novo por causa do cache do pooler de conexoes
-- (ver nota em 037_fix_ambiguidade_bonus_indicacao.sql / 003_marketplace_interesse.sql).
create or replace function referral_processar_bonus_v3(p_usuario_id uuid)
returns table (categoria text, lote_numero integer, valor numeric)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_cidade text;
  v_count_gerais integer;
  v_count_empresas integer;
  v_count_profissionais integer;
  v_cfg record;
  v_lotes integer;
  v_lote integer;
  v_pagamento_id uuid;
  v_transacao moeda_conecta_transacoes;
begin
  select upper(trim(cidade_base)) into v_cidade from usuarios where id = p_usuario_id;
  if v_cidade is null or v_cidade = '' then
    return;
  end if;

  select count(*) into v_count_gerais from usuarios
    where convidado_por_id = p_usuario_id
      and (acesso_campanha_viral = true or (trial_end_at is not null and trial_end_at > now()));
  select count(*) into v_count_empresas from indicacoes_estabelecimentos
    where usuario_id = p_usuario_id and tipo = 'comercio' and status in ('aprovado', 'pago');
  select count(*) into v_count_profissionais from indicacoes_estabelecimentos
    where usuario_id = p_usuario_id and tipo = 'servico' and status in ('aprovado', 'pago');

  for v_cfg in
    select rc.categoria, rc.bonus, rc.meta,
      case rc.categoria
        when 'usuarios_gerais' then v_count_gerais
        when 'empresas_lojas' then v_count_empresas
        when 'profissionais_liberais' then v_count_profissionais
      end as contagem
    from referral_config_cidades rc
    where rc.cidade = v_cidade and rc.ativo = true and rc.meta > 0 and rc.bonus > 0
  loop
    v_lotes := floor(v_cfg.contagem::numeric / v_cfg.meta);
    if v_lotes < 1 then
      continue;
    end if;

    for v_lote in 1..v_lotes loop
      v_pagamento_id := null;

      insert into referral_bonus_pagamentos (usuario_id, cidade, categoria, lote_numero, valor)
      values (p_usuario_id, v_cidade, v_cfg.categoria, v_lote, v_cfg.bonus)
      on conflict (usuario_id, categoria, lote_numero) do nothing
      returning id into v_pagamento_id;

      if v_pagamento_id is not null then
        insert into moeda_conecta_contas (usuario_id, cidade_base)
          values (p_usuario_id, v_cidade) on conflict (usuario_id) do nothing;

        update moeda_conecta_contas set saldo = saldo + v_cfg.bonus, atualizado_em = now()
          where usuario_id = p_usuario_id;

        insert into moeda_conecta_transacoes
          (tipo, remetente_id, destinatario_id, cidade, cidade_destino, valor, descricao, status, moderado_em)
        values
          ('bonus_indicacao', p_usuario_id, p_usuario_id, v_cidade, v_cidade, v_cfg.bonus,
           'Bônus de indicação — lote ' || v_lote || ' (' || v_cfg.categoria || ')', 'concluida', now())
        returning * into v_transacao;

        update referral_bonus_pagamentos set moeda_conecta_transacao_id = v_transacao.id where id = v_pagamento_id;

        categoria := v_cfg.categoria;
        lote_numero := v_lote;
        valor := v_cfg.bonus;
        return next;
      end if;
    end loop;
  end loop;
end;
$$;
