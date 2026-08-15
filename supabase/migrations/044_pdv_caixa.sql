-- Caminho: C:\valente_conecta\supabase\migrations\044_pdv_caixa.sql
--
-- Livro caixa do estabelecimento (PDV Colaborativo) — controle manual de
-- entradas e saidas do comerciante, escopado por usuario_id (mesma
-- identidade real usada em pdv_estoque_itens/pdv_produtos_catalogo, ver
-- migration 038). Nao reaproveita a tabela `financeiro` (usada pela
-- Cozinha Chef Neide) porque aquela tabela nao tem NENHUM escopo por
-- usuario/loja — e' de um unico estabelecimento so', misturar os dois
-- vazaria o financeiro de um comerciante pra todos os outros.

create table if not exists pdv_caixa_lancamentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  tipo text not null check (tipo in ('entrada', 'saida')),
  descricao text not null,
  valor numeric(12,2) not null check (valor > 0),
  categoria text,
  forma_pagamento text not null default 'dinheiro' check (forma_pagamento in ('dinheiro', 'pix', 'cartao', 'fiado', 'outro')),
  data date not null default current_date,
  observacoes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_pdv_caixa_usuario on pdv_caixa_lancamentos(usuario_id);
create index if not exists idx_pdv_caixa_data on pdv_caixa_lancamentos(data);

alter table pdv_caixa_lancamentos enable row level security;
create policy "pdv_caixa_lancamentos_publica" on pdv_caixa_lancamentos for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do resto do projeto.
