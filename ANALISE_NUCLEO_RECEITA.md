# ANALISE NUCLEO RECEITA

Data: 2026-07-20  
Fase: 2A - Definir o Nucleo Receita  
Escopo analisado somente:
- app/admin-master/cozinha-chef/receitas
- app/admin-master/cozinha
- src/modules/cozinha
- backups relacionados a receita
- docs/cozinha-chef-neide/*.md

---

## Resumo executivo

Conclusao tecnica para seguir os docs oficiais com menor impacto:

- Base oficial de runtime deve ser o fluxo ativo do modulo atual (cozinha-chef) com API /api/cozinha/receitas e tabela receitas.
- Regras de negocio mais completas de Receita (custo, margem, ingredientes relacionais, rendimento) existem melhor estruturadas no bloco legado app/admin-master/cozinha/repositories/ReceitaRepository.ts, mas ele esta desacoplado do modulo atual e usa schema paralelo cozinha_*.
- Portanto, o caminho minimo nao e migrar para cozinha_*, e sim consolidar receitas como fonte unica no dominio atual (receitas), reaproveitando apenas logica util do legado.

---

## Matriz curta das implementacoes analisadas

### 1) app/admin-master/cozinha-chef/receitas + API atual
- Estado: ativo no menu e em uso real.
- Persistencia: /api/cozinha/receitas e /api/cozinha/receitas/[id], tabela receitas.
- Pontos fortes: ja integrado ao modulo atual e ao App Router ativo.
- Limites: tela atual e apenas listagem simples; hooks de edicao/receita ainda com mock/TODO.

### 2) app/admin-master/cozinha (repositorio legado)
- Estado: implementacao de regras mais rica para Receita.
- Persistencia: cozinha_receitas + cozinha_receita_ingredientes.
- Pontos fortes: calcula custoTotal, margemLucro, precoSugerido; organiza ingredientes em relacao.
- Limites: usa schema paralelo cozinha_* e nao e a trilha principal do modulo atual.

### 3) src/modules/cozinha
- Estado: camada simplificada de hooks/services.
- Persistencia: chamada para /api/cozinha/receitas.
- Pontos fortes: facil de plugar.
- Limites: contrato simples (nome/descricao/preco/categoria/ingredientes), sem motor consistente de ficha tecnica/custo/rendimento.

### 4) Backups relacionados a receita
- backup_routes_2026-07-16_09-48/app/api/cozinha/receitas/route.ts: CRUD em JSON (data/receitas.json), util como referencia de contrato antigo.
- backup_consolidacao_cozinha_2026-07-20_12-42/*receita*: copia da camada simplificada (nao adiciona regras novas).
- data/receitas.json: evidencia historica de campos ricos (ingredients, images, preparationTime, servings, isAvailable, price).

---

## Respostas objetivas (10 itens)

### 1. Qual implementacao de receita sera a base oficial?
Base oficial proposta: implementacao ativa do modulo cozinha-chef usando /api/cozinha/receitas (tabela receitas), por ser o caminho em producao e de menor impacto.

A implementacao de app/admin-master/cozinha/repositories/ReceitaRepository.ts sera reaproveitada como fonte de regras de negocio (calculo e estrutura de ingredientes), sem trocar o runtime para schema cozinha_*.

### 2. Qual tabela Supabase sera utilizada?
Tabela oficial proposta: receitas.

Motivo:
- ja e consumida por app/api/cozinha/receitas/route.ts
- ja e consumida por app/api/cozinha/recipes/route.ts (compatibilidade)
- ja aparece no modulo atual (receitas, dashboard, custoService)

### 3. Quais campos existem hoje?
Campos confirmados no uso ativo atual de receitas (codigo atual):
- id
- nome
- descricao
- preco
- categoria
- status
- ingredientes (estrutura serializada)
- created_at
- updated_at

Campos ja usados por regras/telas auxiliares do modulo atual (ainda parciais):
- custo_total
- margem
- porcoes
- preco_sugerido
- ativo

Campos observados em versoes/contratos antigos (JSON/historico):
- name/description/price/category (equivalentes)
- images
- preparationTime
- servings
- isAvailable

### 4. Como estao ingredientes?
Estado atual: fragmentado.

- No fluxo ativo (receitas), ingredientes aparecem como campo agregado (JSON) em receitas.
- No legado app/admin-master/cozinha, ingredientes sao relacionais em cozinha_receita_ingredientes.
- Em data/receitas.json, ingredientes estao em array detalhado (ingredientId, ingredientName, quantity, unit).

Conclusao: existe estrutura suficiente para ingredientes, mas sem contrato unico consolidado no runtime atual.

### 5. Existe calculo de custo?
Sim, parcialmente.

- Existe em app/admin-master/cozinha-chef/services/custoService.ts (calculo por ingredientes e estoque, gravando custo_total e margem em receitas).
- Existe tambem no legado ReceitaRepository (custoTotal e margemLucro no create).

Conclusao: a logica existe, mas esta espalhada e precisa ser unificada em torno da receita ativa.

### 6. Existe rendimento?
Sim, parcialmente.

- No legado de app/admin-master/cozinha/components/ReceitaList.tsx ha uso explicito de rendimento e unidadeRendimento.
- No fluxo historico/JSON ha servings e preparationTime.
- No modulo ativo cozinha-chef, rendimento nao esta consolidado no fluxo principal de receitas.

### 7. Existe imagem?
Sim.

- Historico de dados (data/receitas.json) usa images[].
- Tipagem em lib/cozinha/types.ts contem images/video para Recipe.
- Tela ativa simples de receitas ainda nao explora imagem de forma completa.

### 8. Existe integracao com catalogo?
Sim, parcial.

- Preview utiliza receitas + cardapio.
- /api/cozinha/recipes fornece compatibilidade de leitura para receitas.
- A publicacao receita -> catalogo/cardapio ainda nao esta consolidada como fluxo unico com fonte de verdade.

### 9. Quais arquivos serao reaproveitados?
Arquivos prioritarios para reaproveitamento (sem refatoracao ampla):
- app/api/cozinha/receitas/route.ts
- app/api/cozinha/receitas/[id]/route.ts
- app/api/cozinha/recipes/route.ts
- app/admin-master/cozinha-chef/receitas/page.tsx
- app/admin-master/cozinha-chef/services/custoService.ts
- app/admin-master/cozinha/repositories/ReceitaRepository.ts (somente regras/estrategia, nao schema)
- app/admin-master/cozinha/components/ReceitaList.tsx (referencia de campos de rendimento/custo/margem)
- app/admin-master/cozinha-chef/hooks/useReceita.ts (aproveitar estrutura de fluxo, removendo mock em fase posterior)
- app/admin-master/cozinha-chef/hooks/useEditarReceita.ts (aproveitar fluxo de edicao)
- lib/cozinha/types.ts (referencia de contrato rico de Recipe)
- data/receitas.json (referencia de payload historico real)

### 10. Qual menor caminho para deixar Receita como fonte unica da verdade?
Menor caminho proposto (sem refatoracao ampla):

1) Fixar dominio unico em receitas (nao migrar runtime para cozinha_* nesta etapa).
2) Definir contrato canonico de Receita no dominio ativo com:
- dados basicos (nome, categoria, descricao, status/imagem)
- ingredientes (array estruturado)
- custo e preco (custo_total, margem, preco/preco_sugerido)
- rendimento (porcoes e campos tecnicos minimos)
3) Adaptar hooks de receita do cozinha-chef para esse contrato canonico (retirar mock/TODO), mantendo as telas atuais.
4) Reusar calculo de custo existente (custoService + formula do legado ReceitaRepository) dentro do fluxo da tabela receitas.
5) Manter compatibilidade com /api/cozinha/recipes para preview/catalogo durante a transicao.
6) Publicacao para cardapio deve consumir apenas Receita canonica (sem duplicar cadastro em outra entidade).

Resultado esperado da Fase 2A:
- uma base oficial definida
- um schema alvo claro dentro do dominio ativo
- trilha curta para Fase 2B sem quebrar arquitetura atual

---

## Decisao final desta fase (para aprovacao)

- Base oficial: receitas no modulo cozinha-chef (runtime atual).
- Reuso de valor: logica de calculo/estrutura do legado app/admin-master/cozinha.
- Sem troca de arquitetura global nesta etapa.
- Proxima fase (2B) deve apenas consolidar contrato canonico de Receita e conectar fluxo ativo a ele.
