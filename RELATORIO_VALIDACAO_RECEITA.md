# RELATORIO_VALIDACAO_RECEITA

## 1. Fluxos testados

1. Criacao de receita teste via API canonica (`POST /api/cozinha/receitas`) com payload completo.
2. Criacao de receita teste via API com schema atualmente aceito (fallback minimo) para permitir continuidade do ciclo.
3. Leitura por ID da receita criada (`GET /api/cozinha/receitas/{id}`).
4. Edicao da receita criada com payload canonico completo (`PUT /api/cozinha/receitas?id={id}`).
5. Edicao da receita criada com schema atualmente aceito (fallback minimo).
6. Reabertura da receita apos edicao (`GET /api/cozinha/receitas/{id}`).
7. Conferencia de listagem principal (`GET /api/cozinha/receitas`) e endpoint de compatibilidade (`GET /api/cozinha/recipes`).
8. Validacao de UI para criacao/edicao nas rotas administrativas.

Receita de teste usada no ciclo:
- ID: `74750e4b-ec0a-4905-8734-aa1401208def`
- Nome inicial: `Receita Teste F2B4 20260720185041`
- Nome editado: `Receita Teste F2B4 Editada`
- Ao final, o registro foi removido para limpeza do ambiente.

## 2. Resultado de cada teste

1. **Criacao canonica completa**: **FALHOU**.
- Resultado: HTTP 500.
- Evidencia: `{"success":false,"error":"Erro ao criar receita"}`.

2. **Criacao fallback minimo**: **PASSOU**.
- Campos aceitos: `nome`, `descricao`, `categoria`, `porcoes`, `custo_total`, `preco_sugerido`.
- Resultado: registro criado com sucesso.

3. **Leitura por ID apos criacao**: **PASSOU**.
- Resultado: API retornou registro criado com os campos minimos persistidos.

4. **Edicao canonica completa**: **FALHOU**.
- Resultado: HTTP 500.
- Evidencia: `{"success":false,"error":"Erro ao atualizar receita"}`.

5. **Edicao fallback minimo**: **PASSOU**.
- Atualizado com sucesso: `nome`, `categoria`, `porcoes`, `custo_total`, `preco_sugerido`.

6. **Reabertura apos edicao**: **PASSOU (parcial)**.
- Dados minimos atualizados foram persistidos e retornados corretamente.
- Contrato canonico completo nao foi preservado (campos ausentes).

7. **Listagem principal vs compatibilidade**: **PARCIAL**.
- `GET /api/cozinha/receitas`: retornou 6 itens durante o teste e continha a receita criada.
- `GET /api/cozinha/recipes`: retornou lista antiga (5 itens) e **nao** refletiu a receita de teste no momento da validacao.

8. **Rotas UI de criacao/edicao**: **FALHOU**.
- `/admin-master/cozinha-chef/receitas/novo`: 404.
- `/admin-master/cozinha-chef/receitas/editar/{id}`: 404.

## 3. Campos validados

### 3.1 Campos de identificacao e basicos

- `id`: validado (criado e lido).
- `nome`: validado (criacao e edicao).
- `categoria`: validado (criacao e edicao).
- `descricao`: validado (persistencia).

### 3.2 Campos de imagem e ingredientes (contrato canonico)

- `imagem`: **nao validado em persistencia canonica** (payload completo falha).
- `ingredientes`: **nao validado em persistencia canonica**.
- `quantidades` e `unidades` dos ingredientes: **nao validadas em persistencia canonica**.

### 3.3 Campos financeiros

- `custo_receita`: **nao persistido** no endpoint atual.
- `custo_por_unidade`: **nao persistido** no endpoint atual.
- `margem_percentual`: **nao persistido** no endpoint atual.
- `lucro`: **nao persistido** no endpoint atual.
- `preco_sugerido`: validado (persistido no schema atual).
- `preco_venda`: **nao persistido** no endpoint atual.
- Campos legados persistidos: `custo_total` e `preco_sugerido`.

## 4. Erros encontrados

1. **Erro 500 na criacao com contrato canonico completo**.
- Impacto: bloqueia validacao completa da entidade Receita no formato canonico.

2. **Erro 500 na edicao com contrato canonico completo**.
- Impacto: bloqueia atualizacao de ingredientes e recálculo financeiro canonico via API oficial.

3. **Rotas de UI para criar/editar receita retornando 404**.
- Impacto: impede validacao de fluxo completo pela interface administrativa.

4. **Divergencia no endpoint de compatibilidade** (`/api/cozinha/recipes`).
- Impacto: leitura inconsistente durante o ciclo; risco para consumidores legados.

## 5. Ajustes necessarios antes da integracao com catalogo

1. Alinhar `POST/PUT` de `api/cozinha/receitas` para aceitar e persistir o contrato canonico de Receita (incluindo ingredientes e campos financeiros canonicos).
2. Garantir que `GET` da entidade (lista e detalhe) retorne estrutura canonica consistente (com aliases legados somente para compatibilidade).
3. Corrigir/reativar rotas de UI de criacao e edicao (`/receitas/novo` e `/receitas/editar/[id]`) para permitir validacao funcional end-to-end via tela.
4. Revisar o endpoint de compatibilidade `/api/cozinha/recipes` para refletir os dados atuais e evitar divergencia de leitura.
5. Reexecutar FASE 2B.4 apos os ajustes acima e somente entao liberar avanco para catalogo.

---

Observacao final:
- A centralizacao de regras (FASE 2B.3) foi concluida no codigo, porem a validacao funcional completa do ciclo canonico de Receita ainda esta **bloqueada** por incompatibilidade de API/persistencia e por rotas de UI inexistentes (404).
