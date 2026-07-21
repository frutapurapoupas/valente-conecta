# RELATORIO AJUSTE TIPOS RECEITA

Data: 2026-07-20  
Fase: 2B.1 (tipos)  
Escopo: ajuste tipado interno da entidade Receita sem alteracao de layout, regras de calculo, banco ou hooks/services.

---

## 1. Tipos encontrados

Tipos/interface de Receita identificados no codigo:

1) types/cozinha.ts
- interface Receita (dominio atual em portugues, com custo_total, preco_sugerido, porcoes, ingredientes)
- interface IngredienteReceita

2) lib/cozinha/types.ts
- interface Recipe (dominio em ingles: price, ingredients, images, servings, isAvailable)
- interface RecipeIngredient

3) src/modules/cozinha/types/receita.ts
- interface Receita simplificada (id, nome, descricao, preco, imagem, categoria, ingredientes)

4) services/cozinhaService.ts
- interface Receita usada por service de API (shape parcial do dominio atual)

5) app/api/cozinha/receitas/[id]/route.ts
- interface ReceitaUpdate (payload parcial de update: nome, descricao, preco, categoria, status, ingredientes)

6) outros contextos de receita (sem alteracao nesta etapa)
- features/cozinha/types/index.ts (Recipe/RecipeItem)
- types/estoque.ts (Recipe/RecipeItem)
- interfaces locais de pagina em app/admin-master/cozinha-chef/receitas/page.tsx e app/admin-master/cozinha-chef/preview/page.tsx

---

## 2. Conflitos encontrados

1) Conflito de idioma e nomenclatura
- Portugues: nome, descricao, preco_sugerido, custo_total, porcoes
- Ingles: name, description, price, servings, images

2) Conflito de granularidade de ingredientes
- Shape canonico desejado exige custo_unitario e custo_total por ingrediente.
- Alguns tipos antigos carregam apenas nome/quantidade/unidade.

3) Conflito de financeiro
- Alguns tipos usam preco/preco_sugerido/custo_total/margem.
- Contrato canonico exige custo_receita, custo_por_unidade, margem_percentual, lucro, preco_sugerido, preco_venda.

4) Conflito de status/disponibilidade
- Status em alguns pontos: ativo/inativo.
- Disponibilidade em outros: isAvailable.

5) Conflito de imagem
- Alguns tipos usam imagem unica.
- Outros usam images[] e video.

---

## 3. Tipos alterados

1) Novo arquivo oficial criado:
- types/receita-canonica.ts

Conteudo principal criado:
- ReceitaCanonica
- CanonicalRecipe (alias)
- ReceitaIngredienteCanonico
- CanonicalRecipeIngredient (alias)
- ReceitaIntegracoesCanonicas
- ReceitaCanonicaCompat (ponte de compatibilidade com legados)

2) Arquivo ajustado:
- types/cozinha.ts

Ajuste aplicado:
- exportacao dos tipos canonicos e alias ReceitaIngredienteCanonica
- preservacao total dos tipos legados existentes

3) Arquivo ajustado:
- lib/cozinha/types.ts

Ajuste aplicado:
- inclusao de alias tipado ReceitaCanonica/CanonicalRecipe para compatibilidade em camadas que usam esse arquivo
- sem alteracao de interfaces legadas existentes (Recipe/RecipeIngredient)

4) Arquivo ajustado:
- src/modules/cozinha/types/receita.ts

Ajuste aplicado:
- exportacao de ReceitaCanonica e ReceitaCompat para transicao
- interface Receita antiga mantida

---

## 4. Compatibilidades mantidas

1) Nenhuma remocao de tipo legado.
2) Nenhuma alteracao de assinatura em hooks/services/APIs.
3) Shapes antigos continuam validos nos pontos atuais do modulo.
4) Contrato canonico ficou disponivel para adocao gradual (sem quebra).
5) Compatibilidade de nomenclatura PT/EN preservada por alias e tipo de compatibilidade.

---

## 5. Proximo passo recomendado

Proxima etapa (somente apos aprovacao):

1) Ajustar tipagem dos hooks de Receita do cozinha-chef para consumir ReceitaCanonicaCompat (sem mudar layout).
2) Ajustar tipagem dos services de Receita para payload de entrada/saida canonico com aliases de compatibilidade.
3) Ajustar tipagem das APIs de receitas para request/response tipados no contrato canonico.
4) Manter adaptacao de nomes legados (preco/custo_total/margem) apenas em camada de compatibilidade.
5) Nao alterar regra de calculo ainda nesta proxima subetapa (somente tipagem e contrato entre camadas).
