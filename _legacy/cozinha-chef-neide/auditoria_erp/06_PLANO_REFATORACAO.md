# 06 - PLANO DE REFATORACAO ERP
# Gerado em 16/07/2026 17:29

## OBJETIVO

Transformar o modulo Cozinha em um ERP completo onde a RECEITA e o coracao do sistema.

## FASES

### FASE 1: CORRECAO IMEDIATA

1. Criar fluxo Receita -> Prato
   - Ao salvar Receita, criar Prato automaticamente
   - Prato herda nome, descricao, preco, categoria

2. Criar fluxo Producao -> Estoque
   - Ao finalizar Producao, consumir Estoque
   - Registrar movimentacao de saida

3. Criar fluxo Producao -> Lista de Compras
   - Calcular necessidade de ingredientes
   - Gerar itens pendentes automaticamente

### FASE 2: CONEXOES

4. Conectar Preview -> Catalogo
   - Preview define cardapio do dia
   - Catalogo publico exibe cardapio

5. Conectar Pedidos -> Producao
   - Pedidos geram tarefas de producao
   - Status do pedido atualizado automaticamente

### FASE 3: AUTOMACAO

6. Sistema de Movimentacao
   - Toda entrada/saida de estoque registrada
   - Historico completo

7. Sistema de Custos
   - Custo por receita calculado
   - Margem por prato

## ESTRUTURA FINAL DESEJADA

cozinha-chef/
â”œâ”€â”€ pages/
â”‚   â”œâ”€â”€ receitas/
â”‚   â”œâ”€â”€ pratos/
â”‚   â”œâ”€â”€ estoque/
â”‚   â”œâ”€â”€ movimentacao/
â”‚   â”œâ”€â”€ compras/
â”‚   â”œâ”€â”€ producao/
â”‚   â”œâ”€â”€ pedidos/
â”‚   â”œâ”€â”€ financeiro/
â”‚   â””â”€â”€ preview/
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ receita/
â”‚   â”œâ”€â”€ prato/
â”‚   â”œâ”€â”€ estoque/
â”‚   â”œâ”€â”€ compra/
â”‚   â”œâ”€â”€ producao/
â”‚   â””â”€â”€ pedido/
â”œâ”€â”€ hooks/
â”‚   â”œâ”€â”€ useReceita.ts
â”‚   â”œâ”€â”€ usePrato.ts
â”‚   â”œâ”€â”€ useEstoque.ts
â”‚   â”œâ”€â”€ useCompra.ts
â”‚   â”œâ”€â”€ useProducao.ts
â”‚   â””â”€â”€ usePedido.ts
â”œâ”€â”€ services/
â”‚   â”œâ”€â”€ receitaService.ts
â”‚   â”œâ”€â”€ pratoService.ts
â”‚   â”œâ”€â”€ estoqueService.ts
â”‚   â”œâ”€â”€ compraService.ts
â”‚   â”œâ”€â”€ producaoService.ts
â”‚   â””â”€â”€ pedidoService.ts
â”œâ”€â”€ api/
â”‚   â””â”€â”€ cozinha/
â””â”€â”€ types/
    â””â”€â”€ index.ts
