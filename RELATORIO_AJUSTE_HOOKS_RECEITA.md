# RELATORIO AJUSTE HOOKS RECEITA

Data: 2026-07-20  
Fase: 2B.2  
Escopo: adequacao dos hooks de Receita ao contrato canonico sem alterar layout, paginas, banco, rotas externas ou outras areas.

---

## 1. Hooks alterados

1) app/admin-master/cozinha-chef/hooks/useReceita.ts
2) app/admin-master/cozinha-chef/hooks/useEditarReceita.ts

---

## 2. Mock/TODO removidos

### useReceita.ts
- Removido fluxo principal mockado de receita (receita fixa "Pizza Margherita").
- Removido fluxo mockado de ingredientes disponiveis.
- Removida dependencia de TODO para carga/salvamento do fluxo principal.

Substituicoes realizadas:
- Carga real via /api/cozinha/receitas (principal) com fallback /api/cozinha/recipes.
- Carga de ingredientes via /api/cozinha/estoque.
- Salvamento real via /api/cozinha/receitas (PUT/POST) com fallback para variante por query param.
- Exclusao real via /api/cozinha/receitas (DELETE) com fallback para variante por query param.

### useEditarReceita.ts
- Mantido fluxo funcional existente, mas normalizado para contrato canonico e parse seguro de respostas de API.
- Sem uso de mock local para receita.

---

## 3. Contratos adaptados

Contrato adotado internamente:
- ReceitaCanonicaCompat (de types/receita-canonica.ts)

### Adaptacoes implementadas

1) Estado principal dos hooks com shape canonico compativel.
2) Normalizacao de payload de entrada/saida (pt/en e legado/canonico).
3) Aliases preservados para nao quebrar consumidores atuais:
- useReceita:
  - receita (legado)
  - receitaCanonica (novo)
  - receitas (legado)
  - receitasCanonicas (novo)
  - setReceita (legado)
  - setReceitaCanonica (novo)
- useEditarReceita:
  - receita (canonica compat)
  - recipe (alias legado em ingles)

4) Campos de compatibilidade mantidos no objeto canonico compat:
- preco
- custo_total
- margem
- ativo
- images
- ingredients
- servings
- isAvailable

5) Estados seguros garantidos:
- listas como []
- numericos com fallback 0
- opcionais com defaults seguros

---

## 4. APIs utilizadas

No ajuste dos hooks, foram utilizadas:

1) /api/cozinha/receitas
- GET (listar)
- POST (criar)
- PUT (atualizar por query fallback)
- DELETE (excluir por query fallback)

2) /api/cozinha/receitas/[id]
- GET (carregar receita)
- PUT (atualizar receita)
- DELETE (excluir receita)

3) /api/cozinha/recipes
- GET (fallback de compatibilidade para leitura/listagem)

4) /api/cozinha/estoque
- GET (ingredientes disponiveis para edicao)

---

## 5. Riscos encontrados

1) Divergencia historica de contratos entre APIs e camadas antigas (pt/en e nomes legados).
2) Alguns endpoints retornam shape { success, data } e outros podem retornar payload direto; mitigado por extracao segura.
3) Possivel variacao de campos opcionais na tabela receitas (imagem, integracoes, rendimento, peso_final) entre ambientes; mitigado por defaults.
4) Fallbacks de endpoint foram mantidos para reduzir risco de regressao, mas aumentam complexidade temporaria.

---

## 6. Testes realizados

1) Validacao de tipagem dos hooks alterados:
- app/admin-master/cozinha-chef/hooks/useReceita.ts -> sem erros
- app/admin-master/cozinha-chef/hooks/useEditarReceita.ts -> sem erros

2) Verificacao de compatibilidade de export/assinatura:
- aliases e funcoes legadas preservadas
- novos campos canonicos expostos sem remover os antigos

3) Validacao de seguranca de estado:
- normalizadores com fallback para listas vazias e numericos 0
- tratamento de campos opcionais em carga/salvamento

---

## Resultado desta fase

FASE 2B.2 concluida no escopo solicitado:
- hooks de Receita adequados ao contrato canonico
- experiencia visual preservada
- sem alteracao de layout/paginas/banco/rotas externas
- sem avancar para services
