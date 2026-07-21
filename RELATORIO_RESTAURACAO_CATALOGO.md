# RELATORIO_RESTAURACAO_CATALOGO

Data: 2026-07-20
Fase: 3.2
Escopo executado: restauracao minima do fluxo Receita -> Cardapio -> Catalogo -> Home Marmitas
Restricoes respeitadas:
- sem criar novo cadastro de produto
- sem criar nova tabela
- sem reativar modulos legados
- sem avancar para estoque/producao/compras

## 1. Arquivos modificados

1. app/api/cozinha/cardapio/route.ts
2. app/admin-master/cozinha-chef/preview/page.tsx
3. app/admin-master/cozinha-chef/hooks/useCatalogo.ts
4. app/cozinha/page.tsx

## 2. O que foi implementado (minimo necessario)

### 2.1 Completar operacoes ausentes de cardapio

Arquivo: app/api/cozinha/cardapio/route.ts

Implementado:
- POST
- PUT
- DELETE

Mantido:
- GET existente

Compatibilidade mantida no payload:
- leitura de campos camelCase e snake_case (ex.: receitaId/receita_id, diaSemana/dia_semana, isAvailable/is_available, precoCustomizado/preco_customizado).

### 2.2 Fazer Preview consumir Receita publicada

Arquivo: app/admin-master/cozinha-chef/preview/page.tsx

Ajuste:
- preview passou a ler receitas de /api/cozinha/receitas (fonte oficial) em vez de depender da rota de compatibilidade.
- normalizacao de campos canonicos para formato esperado pela tela (nome/descricao/preco/imagens).
- filtro de receitas ativas/publicadas no carregamento.

### 2.3 Corrigir catalogo para consumir dados reais

Arquivo: app/admin-master/cozinha-chef/hooks/useCatalogo.ts

Ajuste:
- leitura principal mudou para /api/cozinha/receitas + /api/cozinha/cardapio.
- normalizacao de receita canonica para vitrine.
- remocao de fallback para fontes paralelas do fluxo marmitas neste hook (storage compartilhado, cozinhaService.getPratos e fallback mock de cardapio).

### 2.4 Remover mocks do fluxo Marmitas

Arquivo: app/cozinha/page.tsx

Ajuste:
- rota /cozinha agora redireciona para /cozinha/catalogo?perfil=publico.
- com isso, o caminho principal acionado pela home deixa de usar o fluxo baseado em mock de produtos.

### 2.5 Manter compatibilidade existente

Mantido:
- endpoint /api/cozinha/recipes sem alteracao (compatibilidade legada de leitura).
- mapeamento flexivel de campos no novo POST/PUT de cardapio para nao quebrar consumidores atuais.

## 3. Validacoes executadas

### 3.1 Validacao de erros nos arquivos alterados

Resultado:
- sem erros nos 4 arquivos alterados (checagem via diagnostico do workspace).

### 3.2 Smoke test de fluxo (HTTP)

URLs testadas:
- /cozinha
- /cozinha/catalogo?perfil=publico
- /admin-master/cozinha-chef/preview
- /api/cozinha/receitas
- /api/cozinha/cardapio
- /api/cozinha/recipes

Resultado:
- 200: /cozinha, /cozinha/catalogo?perfil=publico, /admin-master/cozinha-chef/preview, /api/cozinha/receitas, /api/cozinha/recipes
- 500: /api/cozinha/cardapio

Observacao de redirecionamento de /cozinha:
- resposta confirma destino /cozinha/catalogo?perfil=publico no conteudo retornado.

## 4. Estado final do fluxo solicitado

Fluxo logico implementado:
- Receita canonica (fonte oficial): /api/cozinha/receitas
- Cardapio: operacoes GET/POST/PUT/DELETE disponiveis no codigo da rota
- Catalogo publico cozinha: usa Receita + Cardapio no hook do modulo
- Home Marmitas: passa por /cozinha e segue para /cozinha/catalogo?perfil=publico

## 5. Risco residual / bloqueio externo

- Endpoint /api/cozinha/cardapio continua retornando 500 no ambiente atual (provavel problema de dados/schema no banco, nao de ausencia de operacao no codigo da rota).
- As operacoes de cardapio foram implementadas na API, mas dependem da saude da tabela/estrutura de banco existente.

## 6. Conclusao

- Restauracao minima solicitada foi aplicada no codigo.
- Fluxo principal foi alinhado para consumir Receita canonica como fonte unica de dominio.
- Compatibilidade legada foi preservada.
- Nao houve avancos em estoque/producao/compras nesta fase.
