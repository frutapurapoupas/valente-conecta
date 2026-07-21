# COZINHA CHEF NEIDE
# ARQUITETURA TÉCNICA DO MÓDULO

Versão: 1.0  
Projeto: Valente Conecta  
Módulo: Cozinha Chef Neide  

---

# 1. OBJETIVO DESTE DOCUMENTO

Este documento define como o módulo Cozinha Chef Neide deve ser organizado tecnicamente.

Ele estabelece:

- responsabilidades das camadas;
- padrões de desenvolvimento;
- organização de código;
- regras para manutenção;
- integração entre frontend, backend e banco de dados;
- limites que não devem ser ultrapassados.

Este documento existe para impedir que futuras evoluções destruam a arquitetura funcional do módulo.

---

# 2. PRINCÍPIO TÉCNICO PRINCIPAL

A arquitetura deve refletir a regra de negócio:


RECEITA É A ENTIDADE CENTRAL


Portanto:

- componentes exibem dados;
- hooks controlam estados e ações;
- services concentram regras;
- APIs fazem comunicação;
- banco mantém a persistência.

Nenhuma camada deve assumir responsabilidade de outra.

---

# 3. PADRÃO DE CAMADAS

Arquitetura desejada:


UI
|
|
Components
|
|
Hooks
|
|
Services
|
|
API Routes
|
|
Database


---

# 4. CAMADA DE INTERFACE (UI)

Responsável:

- exibição;
- interação;
- formulários;
- tabelas;
- componentes visuais.

Não deve:

- calcular custos;
- manipular regras financeiras;
- realizar consultas diretamente;
- alterar estoque.

---

# 5. COMPONENTES

Componentes devem ser reutilizáveis.

Exemplos:


RecipeCard

IngredientTable

CostSummary

ProfitCalculator

ProductionForm

StockIndicator

MenuPreview


---

# 6. HOOKS

Responsabilidade:

Controlar comunicação entre tela e lógica.

Exemplos:


useRecipes()

useIngredients()

useProduction()

useStock()

useOrders()

useFinancial()


---

# 6.1 Regras dos Hooks

Hooks devem:

- buscar dados;
- controlar loading;
- controlar erros;
- atualizar estado.

Hooks não devem:

- possuir regras complexas;
- calcular custo;
- decidir negócio.

---

# 7. SERVICES

Services são o cérebro operacional.

Toda regra de negócio deve estar aqui.

Exemplos:


recipeService

costService

productionService

stockService

purchaseService

financialService


---

# 7.1 Recipe Service

Responsabilidades:

- criar receita;
- atualizar receita;
- adicionar ingredientes;
- calcular rendimento;
- publicar receita.

---

# 7.2 Cost Service

Responsabilidades:

Calcular:

- custo ingredientes;
- custo embalagem;
- custo total;
- custo unitário;
- margem;
- lucro.

Exemplo:


calculateRecipeCost()
calculateUnitCost()
calculateProfit()
calculateSuggestedPrice()


---

# 7.3 Production Service

Responsabilidades:

- criar ordem de produção;
- calcular necessidade de ingredientes;
- validar estoque;
- consumir estoque.

---

# 7.4 Stock Service

Responsabilidades:

- entrada;
- saída;
- ajuste;
- saldo;
- histórico.

---

# 7.5 Purchase Service

Responsabilidades:

- identificar faltas;
- gerar lista de compras;
- atualizar status.

---

# 8. API ROUTES

As APIs devem representar ações do sistema.

Exemplos:


/api/cozinha/recipes

/api/cozinha/ingredients

/api/cozinha/costs

/api/cozinha/production

/api/cozinha/stock

/api/cozinha/purchases

/api/cozinha/orders


---

# 9. REGRA DAS APIS

Uma API não deve duplicar lógica.

Errado:


Tela calcula custo

API calcula outro custo

Banco salva outro valor


Correto:


Tela solicita cálculo

Service calcula

API retorna resultado

Banco grava


---

# 10. MODELO DE DADOS CONCEITUAL

## Recipe

Representa uma receita.

Campos esperados:


id

name

description

image

category

status

yield

portion_size

created_at


---

# Recipe Ingredients

Relacionamento:


Recipe

|

Recipe Ingredients

|

Ingredient


Campos:


recipe_id

ingredient_id

quantity

unit

cost


---

# Ingredient

Representa matéria-prima.

Exemplo:

- arroz;
- carne;
- tomate;
- embalagem.

Campos:


id

name

unit

current_stock

minimum_stock

cost


---

# Production

Representa fabricação.

Campos:


id

recipe_id

quantity

date

status

responsible


---

# Stock Movement

Histórico.

Campos:


id

ingredient_id

type

quantity

origin

date


---

# Order

Venda.

Campos:


id

recipe_id

quantity

price

customer

status


---

# 11. PRINCÍPIO DE RELACIONAMENTO

A estrutura ideal:


Recipe

|

+---- Recipe Ingredients

|

+---- Production

|

+---- Catalog

|

+---- Orders

|

+---- Financial


---

# 12. BANCO DE DADOS

Regras:

## Não duplicar dados calculados.

Exemplo:

Evitar armazenar:


produto.preco
receita.preco
catalogo.preco


O correto:


Recipe

↓

Preço calculado/publicado


---

# 13. IMAGENS

Imagens devem possuir origem única.

Fluxo:


Upload

↓

Recipe Image

↓

Catálogo

↓

Cardápio


Não criar cópias independentes.

---

# 14. PADRÃO DE NOMENCLATURA

Arquivos:


recipe-service.ts

production-service.ts

stock-service.ts


Componentes:


RecipeForm.tsx

IngredientSelector.tsx

CostPanel.tsx


Hooks:


useRecipe.ts

useProduction.ts


---

# 15. REGRAS PARA REFATORAÇÃO

Antes de alterar:

1. localizar funcionalidades existentes;
2. identificar duplicações;
3. preservar regras atuais;
4. remover apenas código morto;
5. evitar criar novas estruturas paralelas.

---

# 16. PROIBIÇÕES

Nunca:

Criar nova tabela sem verificar existente.

Criar novo cadastro para algo existente.

Duplicar regra de negócio.

Mover cálculo para componentes.

Criar API sem necessidade.

Alterar fluxo funcional sem validação.

---

# 17. ESTRATÉGIA DE RECUPERAÇÃO DO MÓDULO ATUAL

Como o módulo possui histórico de múltiplas versões:

A abordagem correta é:

FASE 1

Mapear:

- páginas existentes;
- componentes;
- APIs;
- tabelas;
- hooks;
- serviços.

---

FASE 2

Identificar:

- funcionalidades perdidas;
- duplicações;
- versões antigas;
- fluxos quebrados.

---

FASE 3

Restaurar:

- fluxo Receita → Produção → Estoque → Compras → Catálogo.

---

FASE 4

Melhorar:

- experiência;
- automações;
- cálculos.

---

# 18. INSTRUÇÃO PARA AGENTES DE IA

Antes de modificar qualquer arquivo:

Executar análise:

1. Qual funcionalidade está sendo alterada?
2. Qual página utiliza?
3. Qual service controla?
4. Qual API alimenta?
5. Qual tabela persiste?
6. Essa alteração mantém Receita como fonte principal?

Se não conseguir responder:

Não alterar código.

---

# 19. OBJETIVO FINAL DA ARQUITETURA

A arquitetura deve permitir:

- evolução rápida;
- manutenção simples;
- múltiplos agentes trabalhando;
- menos regressões;
- menos código duplicado.

O módulo deve crescer adicionando capacidades, nunca criando caminhos paralelos.

---

# FIM DO DOCUMENTO