# RELATORIO_AUDITORIA_RECEITA_CATALOGO

Data: 2026-07-20
Fase: 3.1 - Auditoria Receita para Catalogo Publico
Escopo: analise somente leitura (sem alteracao de codigo)

## 1. Referencias obrigatorias analisadas

- docs/cozinha-chef-neide/00_FILOSOFIA_DO_MODULO.md
- docs/cozinha-chef-neide/01_ARQUITETURA_FUNCIONAL.md
- docs/cozinha-chef-neide/02_ARQUITETURA_TECNICA.md
- CONTRATO_CANONICO_RECEITA.md
- RELATORIO_VALIDACAO_RECEITA.md

Resumo da diretriz oficial:
- Receita deve ser a fonte unica da verdade.
- Cardapio/catalogo/pedidos/producao devem consumir Receita, sem cadastro paralelo de produto/prato com regra propria.

## 2. Investigacao do modulo Admin

### 2.1 Receitas (admin cozinha-chef)

Arquivos centrais:
- app/admin-master/cozinha-chef/receitas/page.tsx
- app/admin-master/cozinha-chef/receitas/novo/page.tsx
- app/admin-master/cozinha-chef/receitas/editar/[id]/page.tsx
- app/admin-master/cozinha-chef/hooks/useReceita.ts

Fluxo identificado:
- Tela lista e CRUD de receitas usam /api/cozinha/receitas (oficial) com fallback para /api/cozinha/recipes (compatibilidade).
- Contrato canonico passa por camada de traducao em app/api/cozinha/receitas/canonical.ts.

### 2.2 Preview de cardapio (admin cozinha-chef)

Arquivo central:
- app/admin-master/cozinha-chef/preview/page.tsx

Fluxo identificado:
- Preview carrega receitas de /api/cozinha/recipes.
- Preview manipula itens de cardapio via hook global hooks/useCardapio.ts, que chama /api/cozinha/cardapio para leitura e tenta POST/DELETE para escrita.

Ponto critico:
- app/api/cozinha/cardapio/route.ts implementa apenas GET.
- Portanto create/delete no preview nao tem backend oficial nesta rota.

### 2.3 Pratos e produtos (admin cozinha-chef)

Arquivo central:
- app/admin-master/cozinha-chef/pratos/page.tsx
- app/admin-master/cozinha-chef/hooks/usePratos.ts

Fluxo identificado:
- Usa tabela pratos diretamente (supabase.from('pratos')).
- Opera como cadastro/lista paralela ao dominio de receitas.

### 2.4 Cardapio (admin fora do cozinha-chef)

Arquivo encontrado:
- app/admin-master/cardapio/page.tsx

Fluxo identificado:
- Esta pagina nao integra o fluxo de receita/cozinha-chef; aponta para DemandView category CARDAPIO (fluxo de solicitacao, nao publicacao tecnica de cardapio da cozinha).

## 3. Investigacao das APIs solicitadas

### 3.1 APIs cozinha

- /api/cozinha/receitas -> existe em app/api/cozinha/receitas/route.ts
- /api/cozinha/recipes -> existe em app/api/cozinha/recipes/route.ts (compatibilidade)
- /api/cozinha/cardapio -> existe em app/api/cozinha/cardapio/route.ts (somente GET)

### 3.2 APIs catalogo/produtos/marmitas

- /api/produtos -> existe em app/api/produtos/route.ts
- /api/catalogo -> nao existe rota em app/api/catalogo/**
- /api/marmitas -> nao existe rota em app/api/marmitas/**

Observacao relevante:
- app/catalogo/produto/[id]/page.tsx tenta consumir /api/catalogo/produto/{id} e /api/catalogo/produtos, mas essas rotas nao existem no app/api atual.

## 4. Banco (tabelas envolvidas no fluxo atual)

Tabelas confirmadas por uso de supabase.from no codigo ativo relacionado:

Fluxo receita/cozinha-chef:
- receitas (APIs oficiais /api/cozinha/receitas e /api/cozinha/recipes)
- cardapio (API /api/cozinha/cardapio)
- pratos (hook admin cozinha-chef usePratos)
- estoque (API cozinha e useReceita para ingredientes)
- financeiro (API cozinha)

Fluxo catalogo/publico paralelo:
- produtos (src/modules/catalogo/repositories/CatalogoRepository.ts)
- categorias (src/modules/catalogo/repositories/CatalogoRepository.ts)

Fluxo cozinha publico paralelo:
- cozinha_produtos (src/modules/cozinha/repositories/ProdutoRepository.ts)

Conclusao de persistencia:
- Ha pelo menos tres eixos de dados para vitrine/comercial: receitas, produtos e cozinha_produtos; com cardapio como quarto eixo de orquestracao diaria.

## 5. Front publico (home, destino, componentes e hooks)

### 5.1 Botao Marmitas na home

Arquivo:
- app/page.tsx

Comportamento:
- Card MARMITA aponta para /cozinha.

### 5.2 Pagina destino atual

Arquivo:
- app/cozinha/page.tsx

Comportamento:
- Usa src/modules/cozinha/hooks/useProdutos.ts.
- Este hook retorna MOCK_PRODUTOS (dados mockados), sem leitura de receitas/cardapio oficiais.

### 5.3 Fluxo de catalogo publico cozinha

Arquivo:
- app/cozinha/catalogo/page.tsx

Comportamento:
- Importa useCatalogo diretamente de app/admin-master/cozinha-chef/hooks/useCatalogo.ts.
- Hook combina /api/cozinha/cardapio + /api/cozinha/recipes e tem fallback para storage/local e para cozinhaService.getPratos.

### 5.4 Fluxo de cardapio publico

Arquivo:
- app/cozinha/cardapio/page.tsx
- hooks/useCardapio.ts

Comportamento:
- Leitura via /api/cozinha/cardapio e /api/cozinha/recipes.
- Operacoes de create/delete tentam usar /api/cozinha/cardapio, mas backend atual nao implementa POST/DELETE.

### 5.5 Catalogo geral paralelo

Arquivo:
- app/catalogo/page.tsx
- src/modules/catalogo/hooks/index.ts
- src/modules/catalogo/repositories/CatalogoRepository.ts

Comportamento:
- Fluxo usa tabela produtos/categorias (nao receita/cardapio da cozinha).

## 6. Diagnostico solicitado (A-E)

## A) Qual e a fonte atual do catalogo?

Resposta objetiva:
- Nao existe uma unica fonte atual.
- Hoje o front publico de marmitas se divide em tres fontes paralelas:
  1) /cozinha (home -> /cozinha) usando MOCK_PRODUTOS de src/modules/cozinha/hooks/useProdutos.ts.
  2) /cozinha/catalogo usando combinacao de /api/cozinha/cardapio + /api/cozinha/recipes (com fallback localStorage/pratos).
  3) /catalogo usando tabela produtos/categorias (src/modules/catalogo), fora do dominio canonico de receitas.

## B) Qual deveria ser a fonte segundo a arquitetura oficial?

Resposta objetiva:
- Segundo 00/01/02 e CONTRATO_CANONICO_RECEITA, a fonte oficial deve ser Receita canonica (tabela receitas), com publicacao em cardapio como projeção/disponibilidade, e vitrine consumindo esse fluxo.
- Em outras palavras: receitas (canonico) + cardapio (agendamento/disponibilidade), sem cadastro comercial paralelo como verdade primaria para marmitas.

## C) Onde o fluxo esta quebrado?

Quebras principais:
1. Quebra de backend no cardapio:
- /api/cozinha/cardapio existe apenas com GET; preview/hook tentam POST e DELETE.
2. Quebra de unificacao de dominio:
- /cozinha (rota principal acionada pela home) nao consome receita/cardapio oficiais; usa mock local.
3. Quebra no catalogo geral:
- /catalogo opera em produtos/categorias paralelo ao dominio receita.
4. Quebra de API de catalogo detalhado:
- Front tenta /api/catalogo/produto e /api/catalogo/produtos, mas nao ha essas rotas no app/api atual.
5. Quebra de consistencia de modelo:
- useCatalogo exige shape legada (name, price, category, images), enquanto receita oficial e canonica em portugues (nome, preco_venda etc), dependendo de adaptacoes/aliases.

## D) Existe duplicacao entre receita/cardapio/produto?

Sim, existe duplicacao funcional e de persistencia:
- receitas (fonte tecnica canonica pretendida)
- pratos (cadastro paralelo usado por admin cozinha-chef)
- produtos (catalogo geral)
- cozinha_produtos (modulo cozinha paralelo)
- cardapio (lista/agendamento de exposicao)

Impacto da duplicacao:
- risco de preco/foto/status divergentes.
- risco de fluxo publicar em um eixo e nao refletir no outro.

## E) Qual a menor correcao possivel para restaurar o fluxo?

Menor correcao proposta (sem refatoracao ampla, sem mudar regra de negocio):
1. Definir uma rota publica unica de marmitas para consumir Receita canonica + Cardapio.
- Exemplo: manter /cozinha/catalogo como destino oficial da home.
2. Ajustar o destino do botao MARMITA da home de /cozinha para /cozinha/catalogo?perfil=publico.
3. Completar backend de /api/cozinha/cardapio para as operacoes usadas no preview (POST/DELETE), mantendo GET atual.
4. Manter /api/cozinha/recipes como adaptador de compatibilidade para shape do front enquanto a unificacao final nao e feita.
5. Congelar uso de fontes paralelas para marmitas (mock de /cozinha e produtos/categorias para este dominio) sem apagar nada nesta etapa.

Essa e a menor correcao porque:
- reaproveita estruturas ja existentes (receitas canonicas + preview + hook catalogo).
- evita migracao massiva imediata de tabelas.
- restaura fluxo ponta-a-ponta com menor superficie de mudanca.

## 7. Risco residual antes da implementacao

- Enquanto existir multi-fonte (receitas/pratos/produtos/cozinha_produtos), continuara risco de divergencia.
- Endpoint /api/cozinha/cardapio depende da existencia e consistencia da tabela cardapio no banco.
- Catalogo geral (/catalogo) continuara paralelo ao dominio da cozinha ate decisao de convergencia.

## 8. Conclusao

A arquitetura oficial esta clara: Receita canonica como origem.
O estado atual esta fragmentado em multiplos eixos e com quebras de endpoint de cardapio/escrita.
A menor restauracao de fluxo e centralizar a vitrine de marmitas no caminho que ja consome receitas+cardapio e completar as operacoes faltantes do endpoint de cardapio, aguardando aprovacao para implementacao.
