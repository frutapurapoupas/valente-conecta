-- Caminho: C:\valente_conecta\supabase\migrations\087_cozinha_checkout_pedidos.sql
--
-- Fecha o fluxo real da Cozinha Chef Neide: RECEITA -> CATALOGO -> PEDIDO.
-- Ate aqui nao existia nenhuma tabela de pedido de verdade -- useDashboard.ts
-- fazia select numa tabela `pedidos` generica que nunca foi criada por
-- nenhuma migration (confirmado em docs/cozinha-chef-neide/04_APOSTILA_TECNICA
-- secao 7.4), e o botao "Adicionar" do catalogo publico
-- (app/cozinha/catalogo/page.tsx) nao tinha nenhum onClick.
--
-- Cria:
--   - cozinha_revendedores: cadastro REAL de revendedor aprovado pelo admin,
--     substituindo o `?perfil=revendedor` na URL como unica "prova" (hoje
--     qualquer um digita isso e ganha desconto sem verificacao nenhuma).
--   - cozinha_pedidos: fonte de verdade do checkout publico. Itens ficam
--     congelados em jsonb (snapshot do momento da compra) pra nao depender
--     de join com receitas/cardapio, que podem mudar de preco depois --
--     mesmo principio de "nao duplicar" do modulo (00_FILOSOFIA_DO_MODULO.md),
--     so' que aqui e' snapshot histórico de venda, nao cadastro duplicado.
--   - cozinha_avaliacoes: pesquisa de satisfacao pos-entrega (estrelas 1-5).
--
-- Segue o padrao de status/pagamento separados ja usado em agua_gas_pedidos
-- (014/052/081_*.sql) e RLS "publica temporaria" do resto do projeto --
-- protecao de dinheiro/fraude fica sempre no codigo da API, nunca confiada
-- ao client.

-- ============================================================
-- Revendedores aprovados -- religa por whatsapp, mesma chave de
-- identidade usada em usuarios/fiado_clientes (lib/auth.ts:cadastroSimples).
-- ============================================================
create table if not exists cozinha_revendedores (
  id uuid primary key default gen_random_uuid(),
  whatsapp text not null unique, -- digitos limpos (replace(/\D/g,''))
  nome text not null,
  ativo boolean not null default true,
  forma_confirmacao text not null default 'aprovacao_manual'
    check (forma_confirmacao in ('fiado_prazo', 'pagamento_entrega', 'aprovacao_manual')),
  observacoes text,
  aprovado_por text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cozinha_revendedores_whatsapp on cozinha_revendedores(whatsapp);

-- ============================================================
-- Pedido -- item central do checkout.
-- ============================================================
create table if not exists cozinha_pedidos (
  id uuid primary key default gen_random_uuid(),

  -- Snapshot do cliente (nao ha login real -- ver lib/auth.ts). Melhor
  -- esforco pra religar com usuarios.id por whatsapp, pode ficar null
  -- (mesmo padrao de fiado_clientes.cliente_usuario_id).
  cliente_usuario_id uuid references usuarios(id),
  cliente_nome text not null,
  cliente_whatsapp text not null,
  perfil text not null default 'publico' check (perfil in ('publico', 'assinante', 'revendedor')),

  -- Itens congelados no momento da compra:
  -- [{ receita_id, cardapio_id, titulo, preco_unitario, quantidade, subtotal }]
  itens jsonb not null default '[]'::jsonb,

  subtotal numeric(12,2) not null default 0,
  desconto_percentual numeric(5,2) not null default 0,
  desconto_valor numeric(12,2) not null default 0,
  taxa_entrega numeric(10,2) not null default 0,
  total numeric(12,2) not null default 0,

  tipo_entrega text not null check (tipo_entrega in ('retirada', 'entrega')),
  endereco_entrega text, -- obrigatorio so' quando tipo_entrega='entrega' (constraint abaixo + validado na API)
  observacao text,

  forma_pagamento text not null check (forma_pagamento in ('mercado_pago', 'pix_manual', 'combinado_admin')),
  status_pagamento text not null default 'aguardando_pagamento'
    check (status_pagamento in ('aguardando_pagamento', 'pago_online', 'pago_confirmado_manual', 'combinado_admin')),

  status text not null default 'aguardando_confirmacao'
    check (status in ('aguardando_confirmacao', 'confirmado', 'em_producao', 'pronto_para_retirada', 'saiu_para_entrega', 'entregue', 'cancelado')),

  confirmado_em timestamptz,
  em_producao_em timestamptz,
  pronto_em timestamptz,
  saiu_para_entrega_em timestamptz,
  entregue_em timestamptz,
  cancelado_em timestamptz,

  recebido_por text,
  pesquisa_satisfacao_enviada_em timestamptz,

  mp_preference_id text,
  mp_payment_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cozinha_pedidos_entregue_exige_recebido_por
    check (status <> 'entregue' or (recebido_por is not null and length(trim(recebido_por)) > 0)),
  constraint cozinha_pedidos_entrega_exige_endereco
    check (tipo_entrega <> 'entrega' or (endereco_entrega is not null and length(trim(endereco_entrega)) > 0))
);

create index if not exists idx_cozinha_pedidos_status on cozinha_pedidos(status);
create index if not exists idx_cozinha_pedidos_whatsapp on cozinha_pedidos(cliente_whatsapp);
create index if not exists idx_cozinha_pedidos_created_at on cozinha_pedidos(created_at desc);
-- Suporta o job de pesquisa de satisfacao (entregue ha mais de 1h e ainda
-- sem pesquisa enviada) sem varrer a tabela inteira.
create index if not exists idx_cozinha_pedidos_pesquisa_pendente
  on cozinha_pedidos(entregue_em)
  where status = 'entregue' and pesquisa_satisfacao_enviada_em is null;

-- ============================================================
-- Avaliacao pos-entrega (pesquisa de satisfacao com estrelas 1-5). O
-- cliente pode avaliar assim que o pedido vira 'entregue' (nao precisa
-- esperar o aviso passivo de 1h -- decisao do dono do projeto).
-- ============================================================
create table if not exists cozinha_avaliacoes (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null unique references cozinha_pedidos(id) on delete cascade,
  estrelas int not null check (estrelas between 1 and 5),
  motivo text,
  created_at timestamptz not null default now()
);

create index if not exists idx_cozinha_avaliacoes_pedido on cozinha_avaliacoes(pedido_id);

-- ============================================================
-- Config de checkout. admin_configuracoes.valor e' TEXT (ver
-- app/api/cozinha/descontos/route.ts, que faz JSON.parse(data.valor)) --
-- gravamos a string JSON como literal, mesmo padrao de
-- mototaxi_taxa_config/agua_gas_taxa_config.
-- ============================================================
insert into admin_configuracoes (chave, valor, descricao)
select
  'cozinha_checkout_config',
  '{"formasPagamentoAceitas":["mercado_pago"],"pixManualChave":"","pixManualNome":"","formaConfirmacaoRevendedorPadrao":"aprovacao_manual"}',
  'Checkout Cozinha Chef Neide: formas de pagamento aceitas e forma de confirmacao padrao sugerida ao cadastrar revendedor novo'
where not exists (select 1 from admin_configuracoes where chave = 'cozinha_checkout_config');

alter table cozinha_revendedores enable row level security;
alter table cozinha_pedidos enable row level security;
alter table cozinha_avaliacoes enable row level security;
create policy "cozinha_revendedores_publica" on cozinha_revendedores for all using (true) with check (true);
create policy "cozinha_pedidos_publica" on cozinha_pedidos for all using (true) with check (true);
create policy "cozinha_avaliacoes_publica" on cozinha_avaliacoes for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto -- o preco de cada item e' sempre recalculado no
-- servidor (app/api/cozinha/pedidos/route.ts) a partir da receita, nunca
-- confiado ao valor que vem do client; o perfil (revendedor) tambem e'
-- sempre revalidado contra cozinha_revendedores no servidor.

alter publication supabase_realtime add table cozinha_pedidos;
alter publication supabase_realtime add table cozinha_avaliacoes;
