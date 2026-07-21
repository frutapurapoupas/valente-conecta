# AUDITORIA COZINHA CHEF NEIDE

Data: 2026-07-20  
Escopo: Fase de diagnostico do documento `docs/cozinha-chef-neide/03_PROMPT_EXECUCAO_RESTAURACAO_COZINHA_CHEF_NEIDE.md`  
Metodo: leitura de arquitetura oficial + radiografia de paginas, rotas, componentes, hooks, services, APIs, dados e versoes paralelas.

---

## 1. Estado atual encontrado

### 1.1 Paginas existentes no modulo atual (`app/admin-master/cozinha-chef`)

Paginas identificadas:
- `/admin-master/cozinha-chef` -> `app/admin-master/cozinha-chef/page.tsx`
- `/admin-master/cozinha-chef/financeiro` -> `app/admin-master/cozinha-chef/financeiro/page.tsx`
- `/admin-master/cozinha-chef/receitas` -> `app/admin-master/cozinha-chef/receitas/page.tsx`
- `/admin-master/cozinha-chef/estoque` -> `app/admin-master/cozinha-chef/estoque/page.tsx`
- `/admin-master/cozinha-chef/movimentacoes` -> `app/admin-master/cozinha-chef/movimentacoes/page.tsx`
- `/admin-master/cozinha-chef/compras` -> `app/admin-master/cozinha-chef/compras/page.tsx`
- `/admin-master/cozinha-chef/preview` -> `app/admin-master/cozinha-chef/preview/page.tsx`

Menu oficial do Admin Master aponta 10 itens para cozinha em `components/admin/adminMenuFull.ts`, mas 3 rotas de menu nao existem como pagina:
- `/admin-master/cozinha-chef/pratos` (ausente)
- `/admin-master/cozinha-chef/producao` (ausente)
- `/admin-master/cozinha-chef/pedidos` (ausente)

Tambem ha divergencia de caminho:
- Menu aponta `/admin-master/cozinha-chef/estoque/movimentacao`
- Pagina existente e `/admin-master/cozinha-chef/movimentacoes`

### 1.2 Componentes (cozinha-chef)

Arquivos existentes:
- `app/admin-master/cozinha-chef/components/DashboardUI.tsx`
- `app/admin-master/cozinha-chef/containers/DashboardContainer.tsx`

Observacao importante:
- `DashboardContainer` e `FinanceiroPage` operam com dados mockados/temporarios, nao com fluxo real integrado de receita->producao->estoque->compras->financeiro.

### 1.3 Hooks (cozinha-chef)

Hooks encontrados em `app/admin-master/cozinha-chef/hooks`:
- `useCatalogo.ts`
- `useCompras.ts`
- `useComprasRequests.ts`
- `useDashboard.ts`
- `useEditarReceita.ts`
- `useEstoque.ts`
- `useFinanceiro.ts`
- `useFinanceiroPessoal.ts`
- `useHybridData.ts`
- `useIngredients.ts`
- `useMovimentacoes.ts`
- `usePerfilCozinha.ts`
- `usePratos.ts`
- `useProducao.ts`
- `useReceita.ts`

Estado geral dos hooks:
- Parte relevante usa tabelas Supabase diretamente.
- Parte relevante usa mocks, TODOs e fallback localStorage.
- Alguns hooks tem contratos diferentes dos consumidores de pagina (nomes e funcoes incompatveis).

### 1.4 Services

Services no modulo atual (`app/admin-master/cozinha-chef/services`):
- `comprasService.ts`
- `custoService.ts`
- `dashboardService.ts`
- `estoqueService.ts`
- `pratosService.ts`
- `producaoService.ts`

Services globais correlatos:
- `services/cozinhaService.ts`
- `services/financeiroService.ts`
- `services/estoqueService.ts` (localStorage)

Estado geral:
- Ha sobreposicao de camadas e duplicacao de responsabilidade (service local + hook direto em supabase + API route + service global).

### 1.5 APIs (`/api/cozinha`)

Endpoints ativos (com `route.ts`):
- `GET /api/cozinha/cardapio`
- `GET/POST/PUT/DELETE /api/cozinha/estoque`
- `GET/PUT/DELETE /api/cozinha/estoque/[id]`
- `GET/POST/PUT/DELETE /api/cozinha/financeiro`
- `GET/PUT/DELETE /api/cozinha/financeiro/[id]`
- `GET/POST/PUT/DELETE /api/cozinha/receitas`
- `GET/PUT/DELETE /api/cozinha/receitas/[id]`
- `GET /api/cozinha/recipes` (compatibilidade)

Pastas existentes mas sem `route.ts` (vazias):
- `app/api/cozinha/compras`
- `app/api/cozinha/compras-requests`
- `app/api/cozinha/fornecedores`
- `app/api/cozinha/ingredients`
- `app/api/cozinha/pedidos`
- `app/api/cozinha/pratos`
- `app/api/cozinha/producao`
- `app/api/cozinha/recipe-items`
- `app/api/cozinha/stock-movements`
- `app/api/cozinha/upload`

### 1.6 Tabelas Supabase relacionadas (detectadas por uso no codigo)

Uso no modulo atual (`cozinha-chef` e APIs ativas):
- `receitas`
- `estoque`
- `financeiro`
- `cardapio`
- `compras`
- `compras_requests`
- `pratos`
- `producao`
- `pedidos`
- `vendas`
- `alertas`
- `movimentacoes`

Uso em versoes paralelas/antigas (modulo `app/admin-master/cozinha` e `src/modules/cozinha`):
- `cozinha_receitas`
- `cozinha_receita_ingredientes`
- `cozinha_ingredientes`
- `cozinha_estoque_movimentacoes`
- `cozinha_financeiro_lancamentos`
- `cozinha_pedidos`
- `cozinha_cardapio`
- `cozinha_produtos`

Conclusao de dados:
- Ha dois domínios de schema coexistindo (`receitas/estoque/...` e `cozinha_*`), sem orquestracao unica.

---

## 2. Funcionalidades funcionando

Funcionalidades com implementacao concreta no estado atual:
- Listagem de receitas via `GET /api/cozinha/receitas` e `GET /api/cozinha/recipes`.
- CRUD basico de receitas via `/api/cozinha/receitas` e `/api/cozinha/receitas/[id]`.
- CRUD basico de estoque via `/api/cozinha/estoque` e `/api/cozinha/estoque/[id]`.
- CRUD basico de financeiro via `/api/cozinha/financeiro` e `/api/cozinha/financeiro/[id]`.
- Leitura de cardapio via `GET /api/cozinha/cardapio`.
- Paginas com render visual existente: dashboard, receitas, estoque, compras, movimentacoes, financeiro, preview.

Observacao:
- "Funcionar" aqui significa existir implementacao/caminho de execucao no codigo. Nao significa conformidade com arquitetura oficial nem fluxo ponta-a-ponta completo.

---

## 3. Funcionalidades quebradas

### 3.1 Rotas de menu sem pagina correspondente

No menu da cozinha (`components/admin/adminMenuFull.ts`) existem links ativos para rotas inexistentes:
- `Pratos & Produtos` -> `/admin-master/cozinha-chef/pratos`
- `Producao` -> `/admin-master/cozinha-chef/producao`
- `Pedidos` -> `/admin-master/cozinha-chef/pedidos`

### 3.2 Rota de movimentacao divergente

- Menu aponta `/admin-master/cozinha-chef/estoque/movimentacao`
- Pagina existente: `/admin-master/cozinha-chef/movimentacoes`

### 3.3 Endpoints consumidos por paginas/hooks, mas ausentes

Codigo consome endpoints sem `route.ts` ativo:
- `/api/cozinha/pratos` (ex.: `app/admin-master/cozinha-chef/useDashboardCozinha.ts`)
- `/api/cozinha/stock-movements` (ex.: `app/admin-master/cozinha-chef/movimentacoes/page.tsx`)
- `/api/cozinha/compras` e `/api/cozinha/compras-requests` (via `cozinhaService` e fluxo de compras)
- `/api/cozinha/pedidos`, `/api/cozinha/producao`, `/api/cozinha/ingredients`, `/api/cozinha/fornecedores`, `/api/cozinha/recipe-items`, `/api/cozinha/upload`

### 3.4 Contrato quebrado entre pagina e hook (compras)

`app/admin-master/cozinha-chef/compras/page.tsx` espera:
- `useCompras()` com `items`, `carregar`, `toggleComprado`, `excluir`

`app/admin-master/cozinha-chef/hooks/useCompras.ts` retorna:
- `compras`, `fetchCompras`, `createCompra`, `updateCompra`, `deleteCompra`

Conclusao:
- Assinatura incompatível. Fluxo de compras no front esta quebrado por contrato.

### 3.5 Contrato quebrado entre pagina e hook (movimentacao)

`app/admin-master/cozinha-chef/movimentacoes/page.tsx` espera:
- `useEstoque()` com `items`, `carregar`, `atualizar`

`app/admin-master/cozinha-chef/hooks/useEstoque.ts` retorna:
- `estoque`, `fetchEstoque`, `updateItem`

Conclusao:
- Assinatura incompatível. Fluxo de movimentacao usa shape inexistente.

### 3.6 Hook com dependencia incorreta no preview

`app/admin-master/cozinha-chef/preview/page.tsx` usa `useCardapio` de `@/hooks/useCardapio` esperando:
- `cardapio`, `create`, `delete`, `reload`

`hooks/useCardapio.ts` retorna:
- `menuItems`, `recipes`, `carregarDados` (sem `cardapio/create/delete/reload`)

Conclusao:
- Fluxo de preview/admin cardapio esta quebrado por contrato do hook importado.

### 3.7 Uso de mocks/TODO em areas centrais

Quebra funcional em relacao ao fluxo oficial da arquitetura:
- `financeiro/page.tsx` opera com mockData e "Modo Teste".
- `DashboardContainer.tsx` usa `MOCK_STATS` e `MOCK_ATIVIDADES`.
- `useReceita.ts` usa TODO + dados mock para ingredientes/receita/salvamento.

### 3.8 Problemas de codificacao (mojibake) em partes da cozinha-chef

Diversos textos em `compras/page.tsx`, `movimentacoes/page.tsx`, `preview/page.tsx`, `preview/design.config.ts` e hooks mostram encoding corrompido (ex.: `ÃƒÂ`, `Ã¢`), degradando UX.

### 3.9 Qualidade tecnica observada

Erro de tipagem reportado:
- `app/api/cozinha/estoque/route.ts` (spread em tipo nao objeto, reportado pelo validador atual).

---

## 4. Funcionalidades duplicadas

Duplicacoes estruturais detectadas:

### 4.1 Modulos paralelos de cozinha

- `app/admin-master/cozinha-chef/*` (modulo atual de menu)
- `app/admin-master/cozinha/*` (modulo alternativo com services/repositories proprios)
- `src/modules/cozinha/*` (terceiro bloco de hooks/services/repositories)

### 4.2 Duplicacao de dominio de dados

- Dominio A: tabelas sem prefixo (`receitas`, `estoque`, `financeiro`, etc.)
- Dominio B: tabelas com prefixo `cozinha_*`

### 4.3 Duplicacao de endpoint de receitas

- `/api/cozinha/receitas`
- `/api/cozinha/recipes` (compatibilidade)

### 4.4 Duplicacao de estrategia de persistencia

- APIs em Supabase (ativo)
- APIs e fluxo antigo em JSON local (`data/*.json`) preservados em `backup_routes_2026-07-16_09-48`
- services locais no browser (`services/estoqueService.ts` com `localStorage`)

### 4.5 Duplicacao de camada de regra

- Regras em hooks
- Regras em services
- Regras em APIs
- Regras em repositories de modulos paralelos

Resultado:
- perda da "fonte unica da verdade" (principio central dos docs 00/01/02).

---

## 5. Possiveis versoes antigas existentes

Evidencias de versoes anteriores ainda presentes:
- `backup_routes_2026-07-16_09-48/app/api/cozinha/*` com conjunto de endpoints mais amplo.
- `backup_modulos_2026-07-16_09-43/app/admin-master/cozinha-chef-neide/page.tsx` (versao antiga de admin da cozinha).
- `app/admin-master/cozinha/*` com arquitetura repository/service para `cozinha_*`.
- `src/modules/cozinha/*` com hooks/services/repositories adicionais.
- Arquivo de backup no modulo atual: `app/admin-master/cozinha-chef/financeiro/page.tsx.bak`.

Interpretacao:
- O projeto conserva rastros de multiplas fases de refatoracao/migracao nao finalizadas.

---

## 6. Fluxos que perderam integracao

Comparado com a arquitetura oficial (Receita -> Ingredientes -> Custos -> Preco -> Catalogo -> Pedidos -> Producao -> Estoque -> Compras -> Financeiro):

### 6.1 Receita como fonte unica da verdade (quebrado)
- `receitas/page.tsx` usa tabela `receitas`, mas `useReceita.ts` opera em mock/TODO e nao integra ingrediente/custo real.

### 6.2 Receita -> Catalogo/Preview (parcial/quebrado)
- Preview tenta combinar `cardapio` + `recipes`, mas hook importado nao entrega contrato esperado.
- `cardapio` API ativa apenas GET; sem POST/PUT/DELETE ativos no endpoint atual.

### 6.3 Receita -> Producao (quebrado)
- Menu aponta producao, mas pagina nao existe em `cozinha-chef`.
- Endpoint `/api/cozinha/producao` inexistente no estado atual (apenas pasta vazia).

### 6.4 Producao -> Estoque (quebrado)
- Movimentacao usa endpoint inexistente (`/api/cozinha/stock-movements`) e fallback localStorage.
- Sem integracao confiavel para baixa automatica por ordem de producao.

### 6.5 Estoque -> Compras (quebrado)
- Compras depende de `useCompras`/`useComprasRequests` com contrato diferente do consumidor.
- Endpoints de compras/requests estao ausentes no runtime atual.

### 6.6 Pedidos -> Financeiro (quebrado)
- Sem pagina `cozinha-chef/pedidos` e sem endpoint ativo `/api/cozinha/pedidos`.
- Financeiro atual da pagina e mockado, sem consolidacao de pedido real.

### 6.7 Padrao de camadas (desalinhado ao doc tecnico)
- UI com logica/mocks relevantes.
- Hooks com regra de negocio e persistencia direta.
- Services duplicados e parcialmente ignorados.
- APIs incompletas para os fluxos do menu.

---

## 7. Plano minimo de recuperacao

Plano minimo, sem refatoracao ampla, para restaurar operacao basica conforme docs:

1. Restaurar rotas do menu para nao quebrar navegacao.
Arquivo alvo:
- `components/admin/adminMenuFull.ts`
Motivo:
- rotas inexistentes e path divergente.
Acao minima:
- alinhar menu a paginas existentes OU recriar paginas faltantes reutilizando codigo existente.

2. Restaurar endpoints ausentes criticos da cozinha.
Arquivos alvo:
- `app/api/cozinha/compras/route.ts`
- `app/api/cozinha/compras-requests/route.ts`
- `app/api/cozinha/stock-movements/route.ts`
- `app/api/cozinha/pedidos/route.ts`
- `app/api/cozinha/producao/route.ts`
- `app/api/cozinha/pratos/route.ts`
Motivo:
- consumidores ativos no frontend sem backend correspondente.
Acao minima:
- reaproveitar implementacao existente em `backup_routes_2026-07-16_09-48` e ajustar para padrao atual.

3. Corrigir contratos pagina <-> hook nas telas de compras e movimentacao.
Arquivos alvo:
- `app/admin-master/cozinha-chef/compras/page.tsx`
- `app/admin-master/cozinha-chef/movimentacoes/page.tsx`
- hooks correlatos em `app/admin-master/cozinha-chef/hooks/*`
Motivo:
- nomes/retornos incompatveis quebrando fluxo.
Acao minima:
- padronizar shape retornado sem criar nova arquitetura.

4. Corrigir integracao do preview cardapio.
Arquivos alvo:
- `app/admin-master/cozinha-chef/preview/page.tsx`
- `hooks/useCardapio.ts` (ou uso de hook correto do modulo)
Motivo:
- contrato inexistente (`cardapio/create/delete/reload`).
Acao minima:
- apontar para hook correto do dominio cozinha ou adaptar retorno existente.

5. Remover dependencia de mock nos pontos centrais.
Arquivos alvo:
- `app/admin-master/cozinha-chef/containers/DashboardContainer.tsx`
- `app/admin-master/cozinha-chef/financeiro/page.tsx`
- `app/admin-master/cozinha-chef/hooks/useReceita.ts`
Motivo:
- bloqueio do fluxo real receita->financeiro.
Acao minima:
- conectar com APIs/services ja existentes.

6. Definir uma unica fonte de verdade de tabelas.
Escopo de decisao:
- consolidar em `receitas/estoque/financeiro/...` ou `cozinha_*`.
Motivo:
- coexistencia de dois modelos gera duplicidade e inconsistencias.
Acao minima:
- definir alvo oficial e mapear adaptadores de transicao.

7. Corrigir codificacao UTF-8 nas telas da cozinha-chef ainda afetadas.
Arquivos alvo:
- `app/admin-master/cozinha-chef/compras/page.tsx`
- `app/admin-master/cozinha-chef/movimentacoes/page.tsx`
- `app/admin-master/cozinha-chef/preview/page.tsx`
- `app/admin-master/cozinha-chef/preview/design.config.ts`
- hooks com strings corrompidas
Motivo:
- legibilidade/UX comprometida.

---

## Comparacao com arquitetura oficial

Resumo comparativo com docs 00/01/02:
- Principio "Receita e fonte unica da verdade": **nao atendido**.
- Fluxo funcional integrado (Receita ate Financeiro): **quebrado/parcial**.
- Separacao de camadas UI -> Hooks -> Services -> API -> DB: **parcial e inconsistente**.
- Nao duplicacao de cadastro e regras: **nao atendido**.

Conclusao final da fase de diagnostico:
- O modulo possui base util reutilizavel, mas esta fragmentado em versoes paralelas e integracoes interrompidas.  
- Ha evidencias claras de regressao apos refatoracoes, principalmente em rotas, APIs ausentes e contratos quebrados entre pagina/hook.
