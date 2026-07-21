# RELATORIO DE AUDITORIA COMPLETA - MODULO COZINHA
# Data: 16/07/2026 15:53

---

## RESUMO EXECUTIVO

| Metrica | Valor |
|---------|-------|
| Total de arquivos analisados | 90 |
| Paginas | 13 |
| Componentes | 27 |
| Hooks | 26 |
| Services | 19 |
| APIs | 4 |
| Types | 1 |
| Violacoes encontradas | 19 |
| Nota Geral | 8.9/10 |

---

## NOTA POR CATEGORIA
| Categoria | Nota | Status |
|-----------|------|--------|
| Paginas (UI) | 7.1/10 | OK |
| Componentes | 9.5/10 | OK |
| Hooks (Logica) | 9.2/10 | OK |
| Services | 10/10 | OK |
| APIs | 10/10 | OK |

---

## VIOLACOES DETECTADAS

### app\admin-master\cozinha-chef\financeiro\page.tsx
- Tipo: Page
- Linhas: 642
- Nota: 4/10
Violacoes:
  - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente
  - PAGE_TOO_LARGE: 642 linhas (recomendado <300)

### components\cozinha\CatalogoUI.tsx
- Tipo: Component
- Linhas: 459
- Nota: 4/10
Violacoes:
  - COMPONENT_ACCESS_DB: Componente acessa banco de dados
  - COMPONENT_TOO_LARGE: 459 linhas (recomendado <200)

### hooks\cozinha\page.tsx
- Tipo: Hook
- Linhas: 101
- Nota: 5/10
Violacoes:
  - HOOK_CONTA_HTML: Hook renderiza HTML (deve ser componente)

### hooks\cozinha\useReceita.ts
- Tipo: Hook
- Linhas: 291
- Nota: 5/10
Violacoes:
  - HOOK_CONTA_HTML: Hook renderiza HTML (deve ser componente)

### hooks\cozinha\useCatalogo.ts
- Tipo: Hook
- Linhas: 291
- Nota: 5/10
Violacoes:
  - HOOK_CONTA_HTML: Hook renderiza HTML (deve ser componente)

### hooks\cozinha\usePedidos.ts
- Tipo: Hook
- Linhas: 55
- Nota: 5/10
Violacoes:
  - HOOK_CONTA_HTML: Hook renderiza HTML (deve ser componente)

### app\admin-master\cozinha-chef\estoque\movimentacao\page.tsx
- Tipo: Page
- Linhas: 343
- Nota: 6/10
Violacoes:
  - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente

### components\cozinha\ModalFotoProduto.tsx
- Tipo: Component
- Linhas: 170
- Nota: 6/10
Violacoes:
  - COMPONENT_ACCESS_DB: Componente acessa banco de dados

### app\cozinha\catalogo\page.tsx
- Tipo: Page
- Linhas: 71
- Nota: 6/10
Violacoes:
  - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente

### app\admin-master\cozinha-chef\pratos\novo\page.tsx
- Tipo: Page
- Linhas: 448
- Nota: 6/10
Violacoes:
  - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente

### app\admin-master\cozinha-chef\pedidos\page.tsx
- Tipo: Page
- Linhas: 195
- Nota: 6/10
Violacoes:
  - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente

### app\admin-master\cozinha-chef\page.tsx
- Tipo: Page
- Linhas: 113
- Nota: 6/10
Violacoes:
  - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente

### app\admin-master\cozinha-chef\estoque\page.tsx
- Tipo: Page
- Linhas: 80
- Nota: 6/10
Violacoes:
  - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente

### app\admin-master\cozinha-chef\receitas\page.tsx
- Tipo: Page
- Linhas: 67
- Nota: 6/10
Violacoes:
  - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente

### app\admin-master\cozinha-chef\preview\page.tsx
- Tipo: Page
- Linhas: 307
- Nota: 6/10
Violacoes:
  - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente

### components\cozinha\ReceitaForm.tsx
- Tipo: Component
- Linhas: 541
- Nota: 8/10
Violacoes:
  - COMPONENT_TOO_LARGE: 541 linhas (recomendado <200)

### components\cozinha\PratoForm.tsx
- Tipo: Component
- Linhas: 435
- Nota: 8/10
Violacoes:
  - COMPONENT_TOO_LARGE: 435 linhas (recomendado <200)

---

## PLANO DE REFATORACAO

### PRIORIDADE ALTA (Corrigir Imediatamente)
- app\admin-master\cozinha-chef\financeiro\page.tsx - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente; PAGE_TOO_LARGE: 642 linhas (recomendado <300)
- components\cozinha\CatalogoUI.tsx - COMPONENT_ACCESS_DB: Componente acessa banco de dados; COMPONENT_TOO_LARGE: 459 linhas (recomendado <200)
- app\admin-master\cozinha-chef\financeiro\page.tsx - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente; PAGE_TOO_LARGE: 642 linhas (recomendado <300)
- app\admin-master\cozinha-chef\receitas\page.tsx - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente
- app\cozinha\catalogo\page.tsx - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente
- app\admin-master\cozinha-chef\estoque\movimentacao\page.tsx - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente
- components\cozinha\ModalFotoProduto.tsx - COMPONENT_ACCESS_DB: Componente acessa banco de dados
- app\admin-master\cozinha-chef\page.tsx - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente
- app\admin-master\cozinha-chef\estoque\page.tsx - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente
- app\admin-master\cozinha-chef\pedidos\page.tsx - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente
- app\admin-master\cozinha-chef\preview\page.tsx - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente
- app\admin-master\cozinha-chef\pratos\novo\page.tsx - PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente

### PRIORIDADE MEDIA (Refatorar em Breve)
- app\admin-master\cozinha-chef\compras\page.tsx - 458 linhas
- app\admin-master\cozinha-chef\estoque\movimentacao\page.tsx - 343 linhas
- app\admin-master\cozinha-chef\pratos\novo\page.tsx - 448 linhas
- app\admin-master\cozinha-chef\preview\page.tsx - 307 linhas
- components\cozinha\DashboardUI.tsx - 236 linhas
- components\cozinha\ModalPagamento.tsx - 205 linhas
- hooks\cozinha\useCatalogo.ts - 291 linhas
- hooks\cozinha\usePratoForm.ts - 230 linhas
- hooks\cozinha\useReceita.ts - 291 linhas

### PRIORIDADE BAIXA (Melhorar Gradualmente)
- hooks\cozinha\page.tsx - HOOK_CONTA_HTML: Hook renderiza HTML (deve ser componente)
- hooks\cozinha\useCardapio.ts - 
- hooks\cozinha\useCatalogo.ts - HOOK_CONTA_HTML: Hook renderiza HTML (deve ser componente)
- hooks\cozinha\useCompras.ts - 
- hooks\cozinha\useComprasRequests.ts - 
- hooks\cozinha\useDashboard.ts - 
- hooks\cozinha\useEditarReceita.ts - 
- hooks\cozinha\useEstoque.ts - 
- hooks\cozinha\useFinanceiro.ts - 
- hooks\cozinha\useFinanceiroPessoal.ts - 
- hooks\cozinha\useHybridData.ts - 
- hooks\cozinha\useIngredients.ts - 
- hooks\cozinha\useMovimentacoes.ts - 
- hooks\cozinha\usePedidos.ts - HOOK_CONTA_HTML: Hook renderiza HTML (deve ser componente)
- hooks\cozinha\usePerfilCozinha.ts - 
- hooks\cozinha\usePratoForm.ts - 
- hooks\cozinha\usePratos.ts - 
- hooks\cozinha\useProducao.ts - 
- hooks\cozinha\useReceita.ts - HOOK_CONTA_HTML: Hook renderiza HTML (deve ser componente)
- hooks\cozinha\useReceitas.ts - 
- app\admin-master\cozinha-chef\hooks\useCardapio.ts - 
- app\admin-master\cozinha-chef\hooks\useCompras.ts - 
- app\admin-master\cozinha-chef\hooks\useComprasRequests.ts - 
- app\admin-master\cozinha-chef\hooks\useEstoque.ts - 
- app\admin-master\cozinha-chef\hooks\usePratos.ts - 
- app\admin-master\cozinha-chef\hooks\useProducao.ts - 

---

## MAPA DE ARQUITETURA

| Tela | Page | Componentes | Hooks | Services | APIs |
|------|------|-------------|-------|----------|------|
| page.tsx | OK | - | - | - |
| page.tsx | OK | - | - | - |
| page.tsx | OK | - | - | - |
| page.tsx | OK | - | - | - |
| page.tsx | OK | - | - | - |
| page.tsx | OK | - | - | - |
| page.tsx | OK | - | - | - |
| page.tsx | OK | - | - | - |
| page.tsx | OK | - | - | - |
| page.tsx | OK | - | - | - |
---

## RESUMO FINAL

- Arquivos analisados: 90
- Violacoes encontradas: 19
- Nota geral: 8.9/10
- Status: Arquitetura saudavel

---
*RelatÃ³rio gerado automaticamente pelo AUDITOR_INTELIGENTE_V2.ps1*
