# RELATORIO_ISOLAMENTO_LEGADO_COZINHA

Data: 2026-07-20
Fase: 2C.2 - Isolamento do legado Cozinha Chef Neide
Escopo executado: movimentacao estrutural controlada para quarentena, sem delecao de arquivos e sem alteracao de regras de negocio.

## Estrutura criada

- _legacy/cozinha-chef-neide/
- _legacy/cozinha-chef-neide/README_LEGADO.md

## Arquivos movidos

### Grupo C - Codigo legado confirmado (movido para quarentena)

Arquivos:
- app/admin-master/cozinha-chef/hooks/useEditarReceita.ts
- hooks/useEditarReceita.ts
- app/admin-master/cozinha-chef/hooks/useMovimentacoes.ts
- hooks/useMovimentacoes.ts
- app/admin-master/cozinha-chef/useDashboardCozinha.ts
- app/admin-master/cozinha/repositories/ReceitaRepository.ts

Diretorios legados da API (sem rota ativa em app/api atual):
- app/api/cozinha/compras
- app/api/cozinha/compras-requests
- app/api/cozinha/fornecedores
- app/api/cozinha/ingredients
- app/api/cozinha/pedidos
- app/api/cozinha/pratos
- app/api/cozinha/producao
- app/api/cozinha/recipe-items
- app/api/cozinha/stock-movements
- app/api/cozinha/upload

### Grupo D - Backup historico (movido para quarentena)

- auditoria_2026-07-08_22-29
- auditoria_2026-07-08_22-37
- auditoria_2026-07-16_08-01
- auditoria_2026-07-16_08-46
- auditoria_2026-07-16_08-49
- auditoria_2026-07-16_08-51
- auditoria_2026-07-16_08-55
- auditoria_2026-07-16_08-57
- auditoria_2026-07-16_08-58
- auditoria_2026-07-16_09-09
- auditoria_2026-07-16_09-13
- auditoria_2026-07-16_09-16
- auditoria_2026-07-16_09-17
- auditoria_arquitetura_geral
- auditoria_completa
- AUDITORIA_COZINHA
- auditoria_definitiva
- auditoria_erp
- auditoria_simples_2026-07-08_22-41
- auditoria_ui_logica
- backup_20260620_224213
- backup_consolidacao_cozinha_2026-07-20_12-42
- backup_corrompidos_2026-07-20_09-06
- backup_modulos_2026-07-16_09-43
- backup_routes_2026-07-16_09-48

## Arquivos mantidos

Mantidos por uso ativo identificado (nao movidos):
- app/admin-master/cozinha-chef/hooks/useFinanceiro.ts
- app/admin-master/cozinha-chef/hooks/useFinanceiroPessoal.ts

Justificativa:
- sao consumidos por paginas ativas em app/admin-master/financeiro-pessoal.
- mover estes arquivos quebraria fluxo ativo fora do modulo de quarentena.

## Validacoes executadas

1. Imports quebrados
- Busca de referencias a itens movidos na arvore ativa (app/**) sem ocorrencias relevantes.
- Referencias remanescentes encontradas apenas dentro de _legacy.
- get_errors sem erros nos escopos ativos:
  - app/admin-master/cozinha-chef
  - app/api/cozinha
  - app/admin-master/financeiro-pessoal

2. Rotas ativas
- Smoke test HTTP em instancia limpa (porta 3100) com status 200 para:
  - /admin-master/cozinha-chef
  - /admin-master/cozinha-chef/receitas
  - /admin-master/cozinha-chef/receitas/novo
  - /admin-master/cozinha-chef/compras
  - /admin-master/cozinha-chef/pratos
  - /admin-master/cozinha-chef/producao
  - /admin-master/cozinha-chef/pedidos
  - /admin-master/cozinha-chef/financeiro
  - /admin-master/cozinha-chef/movimentacoes
  - /api/cozinha/receitas
  - /api/cozinha/recipes
  - /api/cozinha/estoque
  - /api/cozinha/financeiro

3. Build/typecheck dos arquivos relacionados
- npx tsc --noEmit: falhou por arquivo historico em _legacy (backup_20260620_224213/page.tsx), fora da arvore ativa.
- npm run build: compilacao Next concluida, mas processo encerrou por limite de memoria durante etapa de lint/typecheck.

## Riscos restantes

- Risco de validacao global: arquivos historicos em _legacy entram no escopo de include do tsconfig atual e podem impactar typecheck global.
- Risco nao relacionado ao isolamento: endpoint /api/cozinha/cardapio segue respondendo 500 na instancia limpa, indicando pendencia preexistente de backend/dados.
- Risco de ambiente: build completo pode falhar por memoria (OOM) em maquinas com heap Node insuficiente.

## Conclusao

- Objetivo de isolamento estrutural cumprido: ambiguidades entre codigo ativo e historico foram reduzidas sem delecao.
- Fluxo ativo principal da Cozinha Chef Neide permaneceu acessivel nas rotas testadas.
- Quarentena consolidada em _legacy/cozinha-chef-neide com documentacao de historico em README_LEGADO.md.
