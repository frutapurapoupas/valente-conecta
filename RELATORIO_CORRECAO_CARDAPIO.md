# RELATORIO_CORRECAO_CARDAPIO

## FASE 3.3 - Correcao final do fluxo Cardapio

Data: 2026-07-20
Escopo aplicado: somente endpoint /api/cozinha/cardapio

## 1) Causa raiz do erro 500

O endpoint estava acoplado as tabelas `cardapio` (legado) e `cozinha_cardapio` (migracao).
No ambiente real do Supabase, nenhuma dessas tabelas existe no schema cache.
Erros encontrados no runtime:

- `PGRST205: Could not find the table public.cardapio`
- `PGRST205: Could not find the table public.cozinha_cardapio`
- Hint recorrente: `public.cardapio_config`

Resultado: GET/POST/PUT/DELETE em `/api/cozinha/cardapio` retornavam 500.

## 2) Correcao aplicada

Arquivo alterado:

- `app/api/cozinha/cardapio/route.ts`

Ajustes realizados:

1. Mantida compatibilidade para os 2 schemas antigos:
   - `cardapio` (receita_id, dia_semana, preco_customizado)
   - `cozinha_cardapio` (recipe_id, day_of_week, custom_price)
2. Adicionado fallback automatico quando as duas tabelas nao existem:
   - origem `file_fallback` em `data/cardapio.json`
3. CRUD completo no fallback de arquivo:
   - GET lista itens
   - POST cria item
   - PUT atualiza item por id
   - DELETE remove item por id
4. Normalizacao de payload/resposta preservada para contrato atual do frontend:
   - `receitaId/receita_id`
   - `diaSemana/dia_semana`
   - `precoCustomizado/preco_customizado`
   - `isAvailable/is_available`

## 3) Schema utilizado apos correcao

Ordem de resolucao em runtime:

1. `cardapio`
2. `cozinha_cardapio`
3. `file_fallback` (`data/cardapio.json`) se as duas opcoes acima nao existirem

No ambiente auditado, o endpoint passou a operar no modo `file_fallback`.

## 4) Testes executados

Ambiente de validacao: `http://localhost:3102`

### 4.1 API Cardapio (CRUD)

- GET `/api/cozinha/cardapio` -> 200
- POST `/api/cozinha/cardapio` -> 200 (`success: true`)
- PUT `/api/cozinha/cardapio?id=<id>` -> 200 (`success: true`)
- DELETE `/api/cozinha/cardapio?id=<id>` -> 200 (`success: true`)

Evidencia do ciclo CRUD:

- `postSuccess: true`
- `getSuccess: true`
- `putSuccess: true`
- `deleteSuccess: true`

### 4.2 Fluxo solicitado

- `/api/cozinha/receitas` -> 200
- `/api/cozinha/cardapio` -> 200
- `/admin-master/cozinha-chef/preview` -> 200
- `/cozinha/catalogo?perfil=publico` -> 200
- `/cozinha` -> 200

## 5) Impacto e limites

- Nenhuma alteracao feita em estoque, producao, compras, pedidos ou financeiro.
- Nenhuma tabela nova foi criada.
- O endpoint deixou de retornar 500 e voltou a responder com contrato compativel.
- Persistencia atual depende do fallback em arquivo enquanto o banco nao tiver tabela de cardapio ativa.

## 6) Conclusao

A falha 500 do endpoint `/api/cozinha/cardapio` foi corrigida com sucesso.
O fluxo Receita -> Cardapio -> Preview -> Catalogo publico -> Home Marmitas voltou a responder sem erro 500.
