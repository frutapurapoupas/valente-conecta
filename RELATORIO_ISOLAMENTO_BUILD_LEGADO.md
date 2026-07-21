# RELATORIO_ISOLAMENTO_BUILD_LEGADO

Data: 2026-07-20
Fase: 2C.3 - Isolar legado do processo de build

## Objetivo

Impedir participacao de arquivos historicos em _legacy/cozinha-chef-neide no fluxo de validacao (typecheck/lint/build), sem alterar codigo funcional e sem remover arquivos.

## Arquivos de configuracao alterados

- tsconfig.json
- .eslintignore (novo)

## Exclusoes adicionadas

### TypeScript

Em tsconfig.json, no campo exclude:
- _legacy
- _legacy/**

Resultado esperado:
- arquivos historicos da quarentena nao participam mais do typecheck global do TypeScript.

### Lint

Criado .eslintignore com:
- _legacy/**

Resultado esperado:
- quando o lint estiver configurado no projeto, arquivos de _legacy serao ignorados.

## Validacoes realizadas

1. Analise de configuracao
- tsconfig.json analisado e atualizado com exclusao explicita de _legacy.
- next.config.js analisado (sem necessidade de ajuste para exclusao de _legacy).
- configuracao ESLint inexistente no projeto; criado .eslintignore para garantir exclusao de _legacy.

2. Typecheck
- npx tsc --noEmit (global): nao apresentou erros vindos de _legacy; erros restantes sao preexistentes da base ativa.
- validacao adicional de ocorrencia de _legacy no output do tsc: sem ocorrencias.
- validacao por escopo ativo com get_errors:
  - app/admin-master/cozinha-chef: sem erros
  - app/api/cozinha: sem erros
  - app/admin-master/financeiro-pessoal: sem erros

3. Build
- npm run build -- --no-lint:
  - compilacao de build concluida
  - falha posterior em typecheck global por erros preexistentes do projeto ativo (fora de _legacy)
  - nao houve indicio de participacao de _legacy na falha

4. Rotas ativas (cozinha/admin)
- Smoke test em instancia limpa (porta 3101):
  - /admin-master/cozinha-chef -> 200
  - /admin-master/cozinha-chef/receitas -> 200
  - /admin-master/cozinha-chef/receitas/novo -> 200
  - /admin-master/cozinha-chef/compras -> 200
  - /admin-master/cozinha-chef/pratos -> 200
  - /admin-master/cozinha-chef/producao -> 200
  - /admin-master/cozinha-chef/pedidos -> 200
  - /admin-master/cozinha-chef/financeiro -> 200
  - /admin-master/cozinha-chef/movimentacoes -> 200
  - /api/cozinha/receitas -> 200
  - /api/cozinha/recipes -> 200
  - /api/cozinha/estoque -> 200
  - /api/cozinha/financeiro -> 200

## Riscos restantes

- O projeto possui grande volume de erros TypeScript preexistentes no codigo ativo global, independentes de _legacy.
- O comando npm run lint esta bloqueado por ausencia de configuracao ESLint instalada e conflito de versoes ao tentar bootstrap automatico (eslint/eslint-config-next), situacao preexistente.
- Mesmo com _legacy isolado, build completo com typecheck global continua sensivel a erros historicos do codigo ativo fora do modulo cozinha.

## Conclusao

- O isolamento de _legacy do processo de validacao foi aplicado no TypeScript e preparado para lint.
- Nao houve alteracao de codigo funcional.
- Nao houve impacto nas rotas ativas do Admin Master Cozinha Chef testadas.
- A fase 2C.3 foi concluida no escopo solicitado, sem iniciar integracao de catalogo.
