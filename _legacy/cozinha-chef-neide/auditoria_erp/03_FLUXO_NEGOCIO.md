# 03 - FLUXO DE NEGOCIO
# Gerado em 16/07/2026 17:29

## FLUXO IDEAL (RECEITA COMO CORACAO)

RECEITA
    â”‚
    â”œâ”€â”€ Ingredientes
    â”‚   â”œâ”€â”€ Verifica Estoque
    â”‚   â”‚   â”œâ”€â”€ Existe â†’ Usa preco
    â”‚   â”‚   â””â”€â”€ Nao existe â†’ Cria novo
    â”‚   â””â”€â”€ Calcula Custo
    â”‚
    â”œâ”€â”€ Prato
    â”‚   â”œâ”€â”€ Categoria
    â”‚   â”œâ”€â”€ Preco
    â”‚   â””â”€â”€ Disponibilidade
    â”‚
    â”œâ”€â”€ Producao
    â”‚   â”œâ”€â”€ Quantidade
    â”‚   â”œâ”€â”€ Calcula Necessidade
    â”‚   â””â”€â”€ Consumo Estoque
    â”‚
    â”œâ”€â”€ Lista de Compras
    â”‚   â”œâ”€â”€ Gera automaticamente
    â”‚   â”œâ”€â”€ Aprovacao
    â”‚   â””â”€â”€ Compra
    â”‚
    â”œâ”€â”€ Preview Cardapio
    â”‚   â”œâ”€â”€ Selecao por dia
    â”‚   â””â”€â”€ Publicacao
    â”‚
    â””â”€â”€ Catalogo Publico
        â”œâ”€â”€ Exibicao
        â”œâ”€â”€ Pedidos
        â””â”€â”€ Producao

## FLUXO ATUAL (MApeado)
## PAGINAS POR FUNCAO

| Funcao | Pagina | Status |
|--------|--------|--------|
| Receitas | /admin-master/cozinha-chef/receitas | OK |
| Pratos | /admin-master/cozinha-chef/pratos | OK |
| Estoque | /admin-master/cozinha-chef/estoque | OK |
| Compras | /admin-master/cozinha-chef/compras | OK |
| Producao | /admin-master/cozinha-chef/producao | OK |
| Pedidos | /admin-master/cozinha-chef/pedidos | OK |
| Financeiro | /admin-master/cozinha-chef/financeiro | OK |
| Preview | /admin-master/cozinha-chef/preview | OK |
| Dashboard | /admin-master/cozinha-chef | OK |

## GAPS IDENTIFICADOS

1. Receita nao gera Prato automaticamente
2. Producao nao consome Estoque
3. Lista de Compras nao e gerada automaticamente
4. Preview nao esta conectado ao Catalogo
5. Pedidos nao alimentam Producao
