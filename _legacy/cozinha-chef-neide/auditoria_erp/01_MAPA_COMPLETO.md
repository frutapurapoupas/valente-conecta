# 01 - MAPA COMPLETO DO MODULO COZINHA
# Gerado em 16/07/2026 17:29

## ARQUIVOS POR TIPO

| Tipo | Quantidade |
|------|------------|
| Paginas | 17 |
| Componentes | 31 |
| Hooks | 37 |
| Services | 25 |
| APIs | 7 |
| Types | 2 |
| **Total** | **13** |

## ESTRUTURA ATUAL

app/
â”œâ”€â”€ admin-master/
â”‚   â””â”€â”€ cozinha-chef/
â”‚       â”œâ”€â”€ page.tsx (Dashboard)
â”‚       â”œâ”€â”€ compras/
â”‚       â”‚   â””â”€â”€ page.tsx
â”‚       â”œâ”€â”€ estoque/
â”‚       â”‚   â””â”€â”€ page.tsx
â”‚       â”œâ”€â”€ financeiro/
â”‚       â”‚   â””â”€â”€ page.tsx
â”‚       â”œâ”€â”€ pedidos/
â”‚       â”‚   â””â”€â”€ page.tsx
â”‚       â”œâ”€â”€ pratos/
â”‚       â”‚   â””â”€â”€ page.tsx
â”‚       â”œâ”€â”€ producao/
â”‚       â”‚   â””â”€â”€ page.tsx
â”‚       â”œâ”€â”€ receitas/
â”‚       â”‚   â”œâ”€â”€ page.tsx
â”‚       â”‚   â””â”€â”€ editar/[id]/
â”‚       â”‚       â””â”€â”€ page.tsx
â”‚       â””â”€â”€ preview/
â”‚           â””â”€â”€ page.tsx
â”œâ”€â”€ api/
â”‚   â””â”€â”€ cozinha/
â”‚       â”œâ”€â”€ cardapio/route.ts
â”‚       â”œâ”€â”€ compras/route.ts
â”‚       â”œâ”€â”€ estoque/route.ts
â”‚       â”œâ”€â”€ financeiro/route.ts
â”‚       â”œâ”€â”€ pedidos/route.ts
â”‚       â”œâ”€â”€ pratos/route.ts
â”‚       â”œâ”€â”€ producao/route.ts
â”‚       â””â”€â”€ receitas/route.ts
â”œâ”€â”€ cozinha/
â”‚   â”œâ”€â”€ catalogo/
â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â””â”€â”€ page.tsx

components/cozinha/
â”œâ”€â”€ CatalogoUI.tsx
â”œâ”€â”€ DashboardUI.tsx
â”œâ”€â”€ PratoList.tsx
â”œâ”€â”€ ReceitaForm.tsx
â””â”€â”€ SelecaoPerfilUI.tsx

hooks/cozinha/
â”œâ”€â”€ useCardapio.ts
â”œâ”€â”€ useCompras.ts
â”œâ”€â”€ useDashboard.ts
â”œâ”€â”€ useEstoque.ts
â”œâ”€â”€ usePratos.ts
â”œâ”€â”€ useProducao.ts
â””â”€â”€ useReceitas.ts

services/
â””â”€â”€ cozinhaService.ts
