# RELATORIO_CORRECAO_RECEITA_CRUD

Data: 2026-07-20
Fase: 2B.5
Status: executada

## 1. Rotas restauradas

Rotas de UI restauradas:
- /admin-master/cozinha-chef/receitas/novo
- /admin-master/cozinha-chef/receitas/editar/[id]

Arquivos criados para restauracao:
- app/admin-master/cozinha-chef/receitas/novo/page.tsx
- app/admin-master/cozinha-chef/receitas/editar/[id]/page.tsx
- app/admin-master/cozinha-chef/receitas/_components/ReceitaFormularioCanonico.tsx

Observacoes:
- Layout atual preservado (estrutura de pagina existente no modulo admin).
- Formulario reutilizado entre novo e editar (sem duplicacao de formulario).
- Nao houve alteracao de arquitetura para outros modulos (catalogo/estoque/producao/compras/pedidos).

## 2. APIs corrigidas

Arquivos alterados:
- app/api/cozinha/receitas/route.ts
- app/api/cozinha/receitas/[id]/route.ts
- app/api/cozinha/receitas/canonical.ts (novo)
- app/api/cozinha/recipes/route.ts

Correcao aplicada:
1. POST /api/cozinha/receitas
- Passou a aceitar payload canonico completo.
- Faz normalizacao canonica e mapeamento seguro para schema atual da tabela receitas.
- Retorna resposta no formato canonico.

2. PUT /api/cozinha/receitas?id=... e PUT /api/cozinha/receitas/[id]
- Passou a aceitar atualizacao canonica completa.
- Preserva e atualiza campos canonicos (incluindo ingredientes, custos, status e imagem).
- Retorna resposta no formato canonico.

3. GET /api/cozinha/receitas e GET /api/cozinha/receitas/[id]
- Retorno unificado no formato canonico.

4. Compatibilidade /api/cozinha/recipes
- Alinhado para retornar formato canonico tambem.

Motivo do erro 500 resolvido:
- Antes: insert/update direto de payload bruto com campos nao mapeados para o schema atual da tabela.
- Agora: payload canonico e normalizado, com persistencia adaptada ao schema existente e serializacao de metadados canonicos.

## 3. Correcao de codificacao (UTF-8)

Escopo priorizado aplicado:
- app/admin-master/cozinha-chef/receitas/page.tsx
- app/admin-master/cozinha-chef/hooks/useReceita.ts
- app/admin-master/cozinha-chef/hooks/useEditarReceita.ts

Ajustes realizados:
- Correcoes pontuais de textos corrompidos (mojibake) no escopo de Receita.
- Sem alteracao de funcionalidade.

Observacao:
- Permanecem ocorrencias de encoding em outros pontos do modulo cozinha-chef fora do escopo priorizado desta fase.

## 4. Testes realizados

### 4.1 API canônica

Teste POST canônico completo:
- Resultado: PASSOU
- Evidencia: receita criada com sucesso e retorno completo no contrato canonico.

Teste PUT canônico completo:
- Resultado: PASSOU
- Evidencia: atualizacao de nome, descricao, imagem, status, ingredientes, porcoes e campos financeiros com retorno canonico.

Teste GET por id:
- Resultado: PASSOU
- Evidencia: reabertura retornando exatamente o contrato canonico preservado.

Teste DELETE de limpeza:
- Resultado: PASSOU
- Evidencia: registro removido ao final da validacao.

### 4.2 UI

Teste rota /receitas/novo:
- Resultado: PASSOU
- Evidencia: rota deixou de retornar 404 e formulario renderizado.

Teste rota /receitas/editar/[id]:
- Resultado: PASSOU
- Evidencia: rota deixou de retornar 404, carregou dados da receita e exibiu financeiros/ingredientes.

## 5. Erros restantes

1. Endpoint /api/cozinha/recipes (compatibilidade)
- Retorno em formato canonico corrigido.
- Ainda pode nao refletir imediatamente a mesma janela de dados do endpoint principal dependendo de estado local/cache do ambiente em execucao.

2. Encoding geral do modulo cozinha-chef
- Existem outras ocorrencias fora de Receita que nao foram alteradas por restricao de escopo da fase.

## 6. Conclusao

- CRUD de Receita restaurado para contrato canonico no escopo solicitado.
- Rotas de criar/editar UI restauradas sem nova experiencia visual e com formulario compartilhado.
- API canônica de Receita aceita POST/PUT completos, retorna GET no formato canonico e preserva os campos do contrato.
- Sem avanco para catalogo, estoque, producao, compras ou pedidos.
