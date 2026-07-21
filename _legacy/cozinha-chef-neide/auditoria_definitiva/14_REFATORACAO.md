# 14 - PLANO DE REFATORACAO
# Gerado em 16/07/2026 15:59

## Prioridade Alta (Corrigir Imediatamente)

- app\admin-master\cozinha-chef\estoque\movimentacao\page.tsx - PAGE_ACCESS_DB
- app\admin-master\cozinha-chef\estoque\page.tsx - PAGE_ACCESS_DB
- app\admin-master\cozinha-chef\financeiro\page.tsx - PAGE_ACCESS_DB, PAGE_TOO_LARGE
- app\admin-master\cozinha-chef\page.tsx - PAGE_ACCESS_DB
- app\admin-master\cozinha-chef\pedidos\page.tsx - PAGE_ACCESS_DB
- app\admin-master\cozinha-chef\pratos\novo\page.tsx - PAGE_ACCESS_DB
- app\admin-master\cozinha-chef\preview\page.tsx - PAGE_ACCESS_DB
- app\admin-master\cozinha-chef\receitas\page.tsx - PAGE_ACCESS_DB
- app\cozinha\catalogo\page.tsx - PAGE_ACCESS_DB
- components\cozinha\CatalogoUI.tsx - COMPONENT_ACCESS_DB, COMPONENT_TOO_LARGE
- components\cozinha\ModalFotoProduto.tsx - COMPONENT_ACCESS_DB
- hooks\cozinha\page.tsx - HOOK_CONTA_HTML
- hooks\cozinha\useCatalogo.ts - HOOK_CONTA_HTML
- hooks\cozinha\usePedidos.ts - HOOK_CONTA_HTML
- hooks\cozinha\useReceita.ts - HOOK_CONTA_HTML

## Prioridade Media (Refatorar em Breve)

- app\admin-master\cozinha-chef\compras\page.tsx - 458 linhas
- app\admin-master\cozinha-chef\estoque\movimentacao\page.tsx - 343 linhas
- app\admin-master\cozinha-chef\pratos\novo\page.tsx - 448 linhas
- app\admin-master\cozinha-chef\preview\page.tsx - 307 linhas
- components\cozinha\CatalogoUI.tsx - 459 linhas
- components\cozinha\PratoForm.tsx - 435 linhas

## Prioridade Baixa (Melhorar Gradualmente)


