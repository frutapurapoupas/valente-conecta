# CONTRATO CANONICO RECEITA

Data: 2026-07-20  
Fase: 2B (etapa 1)  
Status: definicao de contrato, sem alteracao de codigo

## Escopo de analise usado
- app/admin-master/cozinha-chef/receitas/page.tsx
- app/api/cozinha/receitas/route.ts
- app/api/cozinha/receitas/[id]/route.ts
- app/admin-master/cozinha/repositories/ReceitaRepository.ts
- app/admin-master/cozinha-chef/services/custoService.ts
- lib/cozinha/types.ts
- types/cozinha.ts
- data/receitas.json (historico)

---

## 1) Decisao de contrato oficial

A entidade oficial Receita no modulo Cozinha Chef Neide sera padronizada no dominio ativo:
- tabela oficial: receitas
- APIs oficiais: /api/cozinha/receitas e /api/cozinha/receitas/[id]
- API de compatibilidade de leitura: /api/cozinha/recipes

Sem migracao para schema cozinha_* nesta etapa.

---

## 2) Contrato canonico da entidade Receita

## 2.1 Estrutura principal (objeto Receita)

```ts
interface ReceitaCanonica {
  // Identificacao
  id: string;

  // Dados basicos
  nome: string;
  descricao: string;
  categoria: string;
  imagem: string | null;
  status: 'ativo' | 'inativo';

  // Ficha tecnica
  ingredientes: ReceitaIngredienteCanonico[];

  // Producao
  rendimento: number;
  peso_final: number | null;
  porcoes: number;

  // Financeiro
  custo_receita: number;
  custo_por_unidade: number;
  margem_percentual: number;
  lucro: number;
  preco_sugerido: number;
  preco_venda: number;

  // Integracoes
  integracoes: {
    catalogo: boolean;
    cardapio: boolean;
    producao: boolean;
    estoque: boolean;
    compras: boolean;
  };

  // Auditoria
  created_at: string;
  updated_at: string;
}

interface ReceitaIngredienteCanonico {
  ingrediente_id: string;
  ingrediente_nome: string;
  quantidade: number;
  unidade: string;
  custo_unitario: number;
  custo_total: number;
}
```

---

## 3) Campos obrigatorios por bloco

## 3.1 Dados basicos
Obrigatorios:
- id
- nome
- descricao
- categoria
- imagem (nullable)
- status

## 3.2 Ficha tecnica
Obrigatorios:
- ingredientes[]
- ingrediente_id
- ingrediente_nome
- quantidade
- unidade
- custo_unitario
- custo_total

Regra:
- `custo_total` do ingrediente = `quantidade * custo_unitario`

## 3.3 Producao
Obrigatorios:
- rendimento
- porcoes

Opcional:
- peso_final (nullable quando nao informado)

## 3.4 Financeiro
Obrigatorios:
- custo_receita
- custo_por_unidade
- margem_percentual
- lucro
- preco_sugerido
- preco_venda

Regras de calculo canonicas:
- `custo_receita = soma(ingredientes.custo_total)`
- `custo_por_unidade = custo_receita / max(porcoes, 1)`
- `lucro = preco_venda - custo_receita`
- `margem_percentual = preco_venda > 0 ? ((preco_venda - custo_receita) / preco_venda) * 100 : 0`
- `preco_sugerido` pode usar regra de margem alvo (quando houver)

## 3.5 Integracoes
Obrigatorios:
- integracoes.catalogo
- integracoes.cardapio
- integracoes.producao
- integracoes.estoque
- integracoes.compras

Observacao:
- estes flags definem disponibilidade funcional da receita nos modulos consumidores.

---

## 4) Mapeamento de origem (estado atual -> canonico)

## 4.1 Campos ja presentes no fluxo ativo (receitas)
Ja encontrados:
- id, nome, descricao, preco, categoria, status, ingredientes, created_at, updated_at

Mapeamento:
- `preco` atual -> `preco_venda`
- `margem` atual -> `margem_percentual`
- `custo_total` atual -> `custo_receita`
- `preco_sugerido` atual -> `preco_sugerido`
- `porcoes` atual -> `porcoes`

## 4.2 Campos de referencia no legado (ReceitaRepository)
Disponiveis como referencia de regra:
- custoTotal, margemLucro, precoSugerido
- ingredientes relacionais com quantidade/unidade/custoUnitario/custoTotal

Uso nesta fase:
- somente reaproveitar regra/estrategia de calculo e estrutura de ingredientes
- sem trocar para tabelas cozinha_receitas/cozinha_receita_ingredientes

## 4.3 Campos do historico (receitas.json e lib/cozinha/types.ts)
Encontrados:
- images[]
- preparationTime
- servings
- isAvailable
- ingredients com ingredientId, ingredientName, quantity, unit

Mapeamento:
- `images[0]` -> `imagem`
- `servings` -> `porcoes`
- `isAvailable` + status atual -> `status`

---

## 5) Estrategia de persistencia na tabela receitas

Sem criar tabela nova nesta etapa.

Campos que devem existir e/ou ser mantidos na tabela `receitas` para sustentar o contrato:
- id
- nome
- descricao
- categoria
- imagem
- status
- ingredientes (json/jsonb)
- rendimento
- peso_final
- porcoes
- custo_receita (ou custo_total como alias de transicao)
- custo_por_unidade
- margem_percentual (ou margem como alias de transicao)
- lucro
- preco_sugerido
- preco_venda (ou preco como alias de transicao)
- integracoes (json/jsonb)
- created_at
- updated_at

Observacao de transicao:
- durante consolidacao, manter compatibilidade com nomes antigos (`preco`, `custo_total`, `margem`) por adaptacao de camada.

---

## 6) Exemplo de payload canonico (API)

```json
{
  "id": "rec_001",
  "nome": "Carne de panela",
  "descricao": "Carne de panela com arroz e pure",
  "categoria": "prato",
  "imagem": "/uploads/receita/carne-panela.jpg",
  "status": "ativo",
  "ingredientes": [
    {
      "ingrediente_id": "ing_carne",
      "ingrediente_nome": "Carne bovina em cubos",
      "quantidade": 200,
      "unidade": "g",
      "custo_unitario": 0.0329,
      "custo_total": 6.58
    },
    {
      "ingrediente_id": "ing_arroz",
      "ingrediente_nome": "Arroz branco",
      "quantidade": 140,
      "unidade": "g",
      "custo_unitario": 0.0080,
      "custo_total": 1.12
    }
  ],
  "rendimento": 1,
  "peso_final": 500,
  "porcoes": 1,
  "custo_receita": 7.70,
  "custo_por_unidade": 7.70,
  "margem_percentual": 40.0,
  "lucro": 5.13,
  "preco_sugerido": 12.83,
  "preco_venda": 12.83,
  "integracoes": {
    "catalogo": true,
    "cardapio": true,
    "producao": true,
    "estoque": true,
    "compras": true
  },
  "created_at": "2026-07-20T00:00:00.000Z",
  "updated_at": "2026-07-20T00:00:00.000Z"
}
```

---

## 7) Regras de compatibilidade para nao quebrar o modulo

- Leitura: aceitar tanto contrato antigo quanto canonico durante transicao.
- Escrita: priorizar persistir no contrato canonico.
- Compatibilidade de preview/catalogo: manter endpoint /api/cozinha/recipes ativo.
- Nao alterar layout nesta fase.
- Nao remover codigo legado nesta fase.

---

## 8) Entregavel desta etapa (2B.1)

Entregue:
- definicao formal do contrato canonico da entidade Receita
- mapeamento de origem dos campos atuais
- regras de calculo e integracao
- estrategia de compatibilidade sem refatoracao ampla

Proxima etapa (apos aprovacao):
- adaptar hooks/servicos de receita do cozinha-chef para esse contrato, sem mudar layout e sem remover legado.
