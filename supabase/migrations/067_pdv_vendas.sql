-- Caminho: C:\valente_conecta\supabase\migrations\067_pdv_vendas.sql
--
-- Registro de venda de verdade da frente de caixa (ate agora app/pdv/page.tsx
-- era um prototipo com dado ficticio, sem persistir nada). RPC
-- pdv_registrar_venda_v1 cria a venda + os itens + desconta o estoque
-- (pdv_estoque_itens.quantidade) numa transacao so' -- se faltar estoque de
-- algum item, nada e' criado, sem risco de baixa parcial. Mesmo padrao
-- security-definer ja usado em plano_geral_verificar_e_consumir (055).

create table if not exists pdv_vendas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null,
  cliente_id uuid references fiado_clientes(id),
  subtotal numeric(12,2) not null,
  desconto numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  forma_pagamento text not null check (forma_pagamento in ('dinheiro', 'pix', 'cartao', 'fiado')),
  valor_pago numeric(12,2),
  troco numeric(12,2),
  created_at timestamptz not null default now()
);

create index if not exists idx_pdv_vendas_usuario on pdv_vendas(usuario_id, created_at desc);

create table if not exists pdv_vendas_itens (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid not null references pdv_vendas(id) on delete cascade,
  catalogo_id uuid references pdv_produtos_catalogo(id),
  nome text not null,
  preco_unitario numeric(12,2) not null,
  quantidade numeric(12,3) not null check (quantidade > 0),
  subtotal numeric(12,2) not null
);

create index if not exists idx_pdv_vendas_itens_venda on pdv_vendas_itens(venda_id);

create or replace function pdv_registrar_venda_v1(
  p_usuario_id uuid,
  p_cliente_id uuid,
  p_itens jsonb, -- [{catalogo_id, estoque_id, nome, preco_unitario, quantidade}]
  p_desconto numeric,
  p_forma_pagamento text,
  p_valor_pago numeric
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_venda_id uuid;
  v_subtotal numeric := 0;
  v_total numeric;
  v_troco numeric;
  v_item jsonb;
  v_estoque_id uuid;
  v_quantidade numeric;
  v_afetadas integer;
begin
  select coalesce(sum((item->>'quantidade')::numeric * (item->>'preco_unitario')::numeric), 0)
  into v_subtotal
  from jsonb_array_elements(p_itens) as item;

  v_total := v_subtotal - coalesce(p_desconto, 0);
  v_troco := case when p_valor_pago is not null then greatest(0, p_valor_pago - v_total) else null end;

  insert into pdv_vendas (usuario_id, cliente_id, subtotal, desconto, total, forma_pagamento, valor_pago, troco)
  values (p_usuario_id, p_cliente_id, v_subtotal, coalesce(p_desconto, 0), v_total, p_forma_pagamento, p_valor_pago, v_troco)
  returning id into v_venda_id;

  for v_item in select * from jsonb_array_elements(p_itens)
  loop
    v_estoque_id := (v_item->>'estoque_id')::uuid;
    v_quantidade := (v_item->>'quantidade')::numeric;

    insert into pdv_vendas_itens (venda_id, catalogo_id, nome, preco_unitario, quantidade, subtotal)
    values (
      v_venda_id,
      (v_item->>'catalogo_id')::uuid,
      v_item->>'nome',
      (v_item->>'preco_unitario')::numeric,
      v_quantidade,
      v_quantidade * (v_item->>'preco_unitario')::numeric
    );

    if v_estoque_id is not null then
      update pdv_estoque_itens
      set quantidade = quantidade - v_quantidade, updated_at = now()
      where id = v_estoque_id and usuario_id = p_usuario_id and quantidade >= v_quantidade;

      get diagnostics v_afetadas = row_count;
      if v_afetadas = 0 then
        raise exception 'Estoque insuficiente para "%"', v_item->>'nome';
      end if;
    end if;
  end loop;

  return v_venda_id;
end;
$$;

alter table pdv_vendas enable row level security;
alter table pdv_vendas_itens enable row level security;
create policy "pdv_vendas_publica" on pdv_vendas for all using (true) with check (true);
create policy "pdv_vendas_itens_publica" on pdv_vendas_itens for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica publica temporaria (sem login real), mesmo
-- padrao do resto do projeto ate a autenticacao existir. A baixa de
-- estoque so' passa pela RPC acima (security definer), nunca por update
-- direto do client.
