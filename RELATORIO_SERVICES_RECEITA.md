# RELATORIO_SERVICES_RECEITA

## 1. Servicos analisados

- app/admin-master/cozinha-chef/services/custoService.ts
- app/admin-master/cozinha/repositories/ReceitaRepository.ts
- app/admin-master/cozinha-chef/hooks/useReceita.ts
- app/admin-master/cozinha-chef/hooks/useEditarReceita.ts

## 2. Onde estavam as regras duplicadas

- Calculo de custo da receita (soma de ingredientes) repetido em hooks e repository.
- Calculo de margem percentual repetido em hooks, repository e service com pequenas variacoes.
- Definicao de preco sugerido/preco venda repetida em pontos diferentes.
- Normalizacao de ingredientes e receita (campos canonicos x legados) repetida em hooks e service.
- Montagem de payload para persistencia (incluindo aliases legados) repetida em hooks e service.

## 3. Qual passou a ser a fonte oficial de calculo

Fonte oficial centralizada em:

- app/admin-master/cozinha-chef/services/custoService.ts

Funcoes oficiais de regra de negocio:

- normalizarIngredienteCanonico
- calcularFinanceiroReceita
- normalizarReceitaCanonica
- buildReceitaPayload

Com isso, hooks e repository deixam de manter formulas proprias e passam a reutilizar estas funcoes.

## 4. Funcoes criadas/ajustadas

No custoService:

- Criada normalizarIngredienteCanonico para unificar conversao de ingrediente canonico/legado.
- Criada calcularFinanceiroReceita para centralizar custo_receita, custo_por_unidade, margem_percentual, lucro, preco_sugerido e preco_venda.
- Criada normalizarReceitaCanonica para normalizacao completa da entidade Receita com aliases de compatibilidade.
- Criada buildReceitaPayload para persistencia unificada (canonico + aliases legados).
- Ajustada calcularCustoReceita para usar normalizacao/calculo centralizados.

No ReceitaRepository:

- Ajustada criar para reutilizar normalizarIngredienteCanonico e calcularFinanceiroReceita.
- Removido calculo local duplicado de custoTotal/margemLucro/precoSugerido.

No useReceita:

- Ajustada normalizeReceitaCanonica para delegar ao service oficial.
- Ajustada toCanonicalFromLegacy para usar normalizarIngredienteCanonico e calcularFinanceiroReceita.
- Ajustada toApiPayload para usar buildReceitaPayload.
- Ajustada adicionarIngrediente para usar normalizarIngredienteCanonico.
- Ajustada calcularMargem para usar calcularFinanceiroReceita.

No useEditarReceita:

- Ajustada normalizeReceita para delegar ao normalizarReceitaCanonica oficial.
- Ajustada toApiPayload para recalculo via calcularFinanceiroReceita e montagem via buildReceitaPayload.

## 5. Arquivos afetados

- app/admin-master/cozinha-chef/services/custoService.ts
- app/admin-master/cozinha/repositories/ReceitaRepository.ts
- app/admin-master/cozinha-chef/hooks/useReceita.ts
- app/admin-master/cozinha-chef/hooks/useEditarReceita.ts
- RELATORIO_SERVICES_RECEITA.md

## 6. Testes realizados

- Validacao estatica de erros nos arquivos alterados via get_errors.
- Resultado:
  - custoService.ts: sem erros
  - ReceitaRepository.ts: sem erros
  - useReceita.ts: sem erros
  - useEditarReceita.ts: sem erros

Observacao:
- Nao foram executados testes E2E/integracao nesta fase; foco foi centralizacao de regras no service/repository sem alterar pagina, layout ou schema.
