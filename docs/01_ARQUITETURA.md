# docs/01_ARQUITETURA.md

# ARQUITETURA OFICIAL DO VALENTE CONECTA

Versão: 1.0

Status: Documento Mestre de Engenharia

---

# Objetivo

Este documento define a arquitetura oficial do Valente Conecta.

Nenhum desenvolvedor, IA ou colaborador poderá implementar funcionalidades fora dos padrões aqui definidos.

Toda decisão técnica deverá respeitar esta arquitetura.

---

# Princípios Arquiteturais

A arquitetura foi construída com cinco objetivos:

• Alta Escalabilidade

• Alta Performance

• Baixo Acoplamento

• Alta Reutilização

• Facilidade de Manutenção

---

# Objetivo Final

Preparar a plataforma para suportar:

✔ 100.000 usuários ativos

✔ Crescimento contínuo

✔ Novos módulos

✔ Novos serviços

✔ Novos municípios

Sem necessidade de reescrever a arquitetura.

---

# Arquitetura em Camadas

A arquitetura oficial possui sete camadas.

```

HTML/UI

↓

Pages

↓

Components

↓

Hooks

↓

Services

↓

Repositories

↓

API

↓

Supabase

↓

Banco

```

Cada camada possui responsabilidade única.

Nenhuma camada poderá executar funções pertencentes à outra.

---

# Camada 1 — HTML / UI

Responsabilidade:

Exibir informações.

Receber interação do usuário.

Renderizar layout.

Nunca poderá:

- acessar banco

- fazer fetch

- acessar Supabase

- executar regra de negócio

- montar SQL

- tratar autenticação

Pode apenas:

renderizar componentes.

---

# Camada 2 — Pages

Responsabilidade:

Montar a página.

Organizar os componentes.

Conectar Hooks.

Nunca poderá:

conter regra de negócio.

Nunca poderá:

acessar banco.

Nunca poderá:

fazer cálculos complexos.

---

# Camada 3 — Components

Responsabilidade:

Renderização reutilizável.

Exemplos:

Button

Card

Table

Modal

Header

Sidebar

Form

SearchBar

ProductCard

RecipeCard

Nunca poderão:

fazer fetch.

Nunca acessar banco.

Nunca conhecer Supabase.

Nunca conhecer SQL.

Nunca conter lógica de negócio.

---

# Camada 4 — Hooks

Responsabilidade:

Estado da tela.

Eventos.

Paginação.

Filtros.

Loading.

Cache local.

Exemplos

useProdutos()

useReceitas()

usePedidos()

useBusca()

Nunca poderão:

renderizar HTML.

Nunca montar SQL.

Nunca acessar banco diretamente.

---

# Camada 5 — Services

Responsabilidade:

Toda regra de negócio.

Exemplos

Calcular estoque.

Gerar lista de compras.

Calcular comissão.

Calcular frete.

Validar pedido.

Aplicar descontos.

Aplicar promoções.

Gerar indicadores.

Toda lógica pertence aqui.

---

# Camada 6 — Repositories

Responsabilidade

Persistência.

Somente comunicação com APIs ou banco.

Exemplos

ProdutoRepository

PedidoRepository

UsuarioRepository

ReceitaRepository

Nunca conter regras de negócio.

---

# Camada 7 — APIs

Responsabilidade

Receber requisição.

Validar dados.

Chamar Service.

Retornar resposta.

Fluxo oficial

Request

↓

Validação

↓

Service

↓

Repository

↓

Banco

↓

Response

Nunca executar regra de negócio.

---

# Camada 8 — Supabase

Responsabilidade

Persistência.

Autenticação.

Storage.

Realtime.

RLS.

Nunca poderá ser acessado diretamente por Components.

---

# Banco de Dados

Modelo

```

Interface

↓

API

↓

Repository

↓

Supabase

↓

PostgreSQL

```

Toda consulta deverá passar pelas camadas.

---

# Organização Oficial

```

app/

components/

hooks/

services/

repositories/

types/

lib/

utils/

providers/

contexts/

styles/

public/

docs/

engineering/

scripts/

tests/

```

---

# Organização por Módulo

Exemplo

```

cozinha/

page.tsx

components/

hooks/

services/

repositories/

types/

api/

utils/

constants/

```

Cada módulo deverá ser completamente independente.

---

# Fluxo Oficial de Dados

```

Usuário

↓

Página

↓

Hook

↓

Service

↓

Repository

↓

API

↓

Supabase

↓

Banco

↓

Repository

↓

Service

↓

Hook

↓

Página

↓

Usuário

```

Nunca quebrar este fluxo.

---

# Dependências Permitidas

Page

↓

Component

↓

Hook

↓

Service

↓

Repository

↓

API

↓

Banco

---

# Dependências Proibidas

Component

→ Banco

Component

→ Supabase

Page

→ Banco

Hook

→ SQL

Repository

→ HTML

Service

→ JSX

Banco

→ Component

---

# Organização de Componentes

```

components/

ui/

layout/

forms/

tables/

cards/

charts/

navigation/

feedback/

modals/

inputs/

buttons/

```

Componentes devem ser pequenos.

Ideal:

menos de 200 linhas.

---

# Organização dos Hooks

```

hooks/

useProdutos.ts

usePedidos.ts

useReceitas.ts

useUsuarios.ts

```

Um Hook por responsabilidade.

---

# Organização dos Services

```

services/

ProdutoService.ts

PedidoService.ts

FinanceiroService.ts

AcademiaService.ts

```

Toda inteligência do sistema pertence aos Services.

---

# Organização dos Repositories

```

repositories/

ProdutoRepository.ts

PedidoRepository.ts

ReceitaRepository.ts

```

Sem regra de negócio.

Somente persistência.

---

# Organização dos Types

```

types/

produto.ts

pedido.ts

usuario.ts

receita.ts

financeiro.ts

```

Nunca utilizar any.

Tipagem obrigatória.

---

# Comunicação Entre Módulos

Os módulos nunca devem depender diretamente uns dos outros.

Exemplo correto:

```

Cozinha

↓

PedidoService

↓

PedidoRepository

↓

API

```

Nunca:

```

Cozinha

↓

Financeiro

↓

Academia

```

---

# Eventos

Sempre utilizar eventos bem definidos.

Exemplos:

PedidoCriado

PedidoCancelado

CompraRealizada

ProdutoAtualizado

UsuarioLogado

TreinoConcluido

---

# Performance

Toda tela deverá utilizar:

Paginação.

Lazy Loading.

Virtualização.

Cache.

Memoização.

Streaming quando necessário.

---

# Segurança

Obrigatório:

RLS.

Middleware.

JWT.

Permissões.

Sanitização.

Logs.

Auditoria.

---

# Escalabilidade

Toda implementação deverá considerar:

Novos módulos.

Novas cidades.

Novos idiomas.

Novas moedas.

Novos gateways.

Novos meios de pagamento.

Novos serviços.

---

# Regras para IA

Antes de escrever qualquer código a IA deverá consultar:

README.md

↓

00_PROJETO.md

↓

01_ARQUITETURA.md

↓

Documento específico.

Nenhuma IA poderá criar arquitetura própria.

---

# Checklist Obrigatório

Antes de finalizar qualquer funcionalidade verificar:

☐ Arquitetura respeitada

☐ Sem acesso direto ao banco

☐ Sem lógica na interface

☐ Sem duplicação

☐ Tipagem completa

☐ Componentes reutilizáveis

☐ Hooks separados

☐ Services separados

☐ Repository separado

☐ API padronizada

☐ Documentação atualizada

☐ Auditoria executada

---

# Conclusão

Este documento estabelece a arquitetura oficial e obrigatória do Valente Conecta.

Qualquer código que não siga estas diretrizes deverá ser considerado fora do padrão e deverá ser refatorado antes de integrar a base principal do projeto.

---
Fim do Documento
