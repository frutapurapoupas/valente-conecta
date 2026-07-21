# docs/02_PADRAO_DE_CODIGO.md

# PADRÃO OFICIAL DE DESENVOLVIMENTO

Versão: 1.0

Documento Oficial de Engenharia

---

# Objetivo

Este documento define os padrões obrigatórios de desenvolvimento do Valente Conecta.

Nenhum código poderá ser integrado ao projeto caso viole estas regras.

Os objetivos são:

- manter consistência
- reduzir bugs
- facilitar manutenção
- reduzir consumo de contexto das IAs
- aumentar reutilização
- preparar o sistema para crescimento contínuo

---

# Filosofia do Projeto

Todo código deve ser:

Simples.

Legível.

Modular.

Reutilizável.

Testável.

Escalável.

Documentado.

---

# Regra Número Um

Antes de criar qualquer arquivo novo verificar:

Existe algo semelhante?

↓

SIM

↓

Reutilizar

↓

NÃO

↓

Criar

Duplicação é proibida.

---

# Organização dos Arquivos

Cada arquivo possui apenas uma responsabilidade.

Exemplo:

ERRADO

```
Produto.tsx

HTML

Hooks

Service

Fetch

Validação

Modal

Tabela

Tudo junto.
```

CORRETO

```
ProdutoPage

↓

ProdutoHeader

↓

ProdutoTable

↓

ProdutoModal

↓

useProdutos()

↓

ProdutoService

↓

ProdutoRepository

```

---

# Tamanho Máximo

Componentes

200 linhas

Ideal:

100

---

Hooks

200 linhas

---

Services

300 linhas

---

Repositories

200 linhas

---

APIs

150 linhas

---

Page

300 linhas

---

Arquivos maiores deverão ser divididos.

---

# Nomenclatura

Componentes

```
ProdutoCard

ReceitaTable

PedidoModal

UsuarioForm
```

---

Hooks

Sempre iniciar com use

```
useProdutos

useReceitas

usePedidos

useUsuarios
```

---

Services

Sempre terminar com Service

```
ProdutoService

ReceitaService

FinanceiroService
```

---

Repositories

Sempre terminar com Repository

```
ProdutoRepository

PedidoRepository
```

---

Types

Sempre singular.

```
produto.ts

pedido.ts

usuario.ts
```

---

Constantes

```
UPPER_CASE
```

---

Variáveis

camelCase

```
produtoSelecionado

usuarioAtual

listaPedidos
```

---

Componentes

PascalCase

```
ProductCard
```

---

Pastas

Sempre minúsculas.

```
components

services

repositories
```

Nunca:

```
Services

Repositories

Components
```

---

Imports

Ordem obrigatória.

```
React

Next

Bibliotecas

Componentes

Hooks

Services

Repositories

Types

Utils

CSS
```

---

Exports

Sempre export default apenas quando existir um único componente.

Caso contrário:

```
export const
```

---

TypeScript

Proibido:

```
any
```

Sempre utilizar interfaces.

Exemplo

```
interface Produto {

id

nome

preco

categoria

}
```

---

Props

Sempre tipadas.

Nunca:

```
props:any
```

---

Null

Sempre tratar.

```
if (!produto)

return null;
```

---

Optional Chaining

Sempre utilizar.

```
produto?.nome
```

---

Coalescência

Utilizar.

```
produto ?? {}
```

---

Strings

Nunca concatenar.

Utilizar:

```
Template String
```

---

Comentários

Somente quando realmente necessários.

Evitar comentários óbvios.

Ruim

```
// soma dois números
```

Bom

```
// Regra fiscal para cálculo municipal
```

---

Console.log

Proibido em produção.

Utilizar Logger.

---

TODO

Sempre padronizado.

```
TODO:

Descrição

Responsável

Data
```

---

Tratamento de Erros

Sempre.

Nunca deixar:

```
catch {}
```

Correto

```
try

catch

logger

toast

throw
```

---

Loading

Toda operação assíncrona deve possuir:

loading

erro

retry

feedback visual

---

Formulários

Sempre utilizar:

Validação

Máscaras

Mensagens

Loading

Botão desabilitado

---

Botões

Sempre possuir:

Loading

Disabled

Tooltip

Ícone

---

Inputs

Sempre possuir:

Label

Placeholder

Mensagem de erro

Validação

---

Tabelas

Sempre possuir:

Busca

Ordenação

Paginação

Loading

Estado vazio

---

Cards

Sempre reutilizáveis.

Nunca criar cards específicos para uma tela.

---

Modais

Sempre utilizar componente padrão.

Nunca criar modal exclusivo.

---

Toast

Centralizado.

Nunca utilizar alert().

---

Fetch

Nunca dentro do componente.

Sempre:

```
Component

↓

Hook

↓

Service

↓

Repository

↓

API
```

---

Banco

Nunca acessar Supabase diretamente na interface.

---

Regras de Negócio

Pertencem exclusivamente aos Services.

---

Cache

Sempre verificar necessidade.

Preferir:

React Query

Memo

Cache Local

---

Performance

Utilizar:

memo

useMemo

useCallback

Lazy

Dynamic Import

Virtualização

---

Responsividade

Obrigatória.

Mobile First.

Tablet.

Desktop.

---

Acessibilidade

Utilizar:

aria-label

role

tabIndex

Contraste

Navegação por teclado

---

Internacionalização

Preparar código para múltiplos idiomas.

Nunca escrever textos diretamente no componente.

---

Segurança

Nunca confiar no Frontend.

Toda validação crítica deve ocorrer na API.

---

Arquivos Grandes

Ao atingir aproximadamente 300 linhas:

avaliar separação.

Acima de 500 linhas:

obrigatória refatoração.

---

Estrutura Recomendada

```
produto/

page.tsx

components/

hooks/

services/

repositories/

types/

constants/

utils/
```

---

Checklist Antes do Commit

☐ Código compilando

☐ Sem any

☐ Sem console.log

☐ Sem duplicação

☐ Componentes pequenos

☐ Hooks separados

☐ Services separados

☐ Repository separado

☐ API padronizada

☐ Tipagem completa

☐ Tratamento de erros

☐ Loading

☐ Responsivo

☐ Documentação atualizada

☐ Auditoria executada

---

Regras para IA

Toda IA deverá:

Ler README.md

↓

00_PROJETO.md

↓

01_ARQUITETURA.md

↓

Este documento

Antes de produzir qualquer código.

Nunca alterar padrões estabelecidos.

Nunca criar nova arquitetura.

Sempre reutilizar componentes existentes.

Sempre preservar compatibilidade com módulos já implementados.

---

Conclusão

Este documento estabelece o padrão único de desenvolvimento do Valente Conecta.

Toda contribuição futura deverá seguir rigorosamente estas diretrizes para garantir consistência, estabilidade, desempenho e evolução sustentável da plataforma.

---

Fim do Documento
