-- Caminho: C:\valente_conecta\supabase\migrations\085_lista_compras_workflow.sql
--
-- Evolui lista_compras_itens de "linha solta" pra suportar o fluxo completo
-- pedido: cada clique em "Enviar para Lista de Compras" vira uma remessa
-- (varios itens de uma receita, agrupados/recolhidos na tela), que o admin
-- aprova total ou parcialmente; so' os itens aprovados entram na lista
-- final de compra (com fornecedor e preco real editaveis); ao marcar
-- comprado, o estoque e' atualizado.
--
-- remessa_id: agrupa os itens da mesma "solicitacao" (mesmo clique de
-- envio) pra exibir como card unico recolhido, com nome do produto/receita
-- e data/hora.
-- ingrediente_id: liga de volta pro estoque -- necessario pra saber a
-- unidade minima de compra (pra arredondar pra cima na aprovacao) e pra
-- credita a quantidade comprada no estoque depois.
-- status: pendente (aguardando aprovacao) -> aprovado (entrou na lista
-- final, ja arredondado) -> comprado (fornecedor/preco real preenchidos,
-- estoque ja atualizado). rejeitado pra quando o admin decide nao comprar
-- aquele item da remessa.
-- fornecedor/preco_real: só fazem sentido a partir de "aprovado".

alter table lista_compras_itens
  add column if not exists remessa_id uuid,
  add column if not exists ingrediente_id uuid references estoque(id),
  add column if not exists status text not null default 'pendente'
    check (status in ('pendente', 'aprovado', 'rejeitado', 'comprado')),
  add column if not exists fornecedor text,
  add column if not exists preco_real numeric(12,2);

-- Linhas que ja existiam (criadas antes desta migration, direto como
-- "aprovadas" pela versao anterior da rota) continuam validas como estao.
update lista_compras_itens set status = 'aprovado' where status = 'pendente' and remessa_id is null;

create index if not exists idx_lista_compras_itens_remessa on lista_compras_itens(remessa_id);
create index if not exists idx_lista_compras_itens_status on lista_compras_itens(status);
