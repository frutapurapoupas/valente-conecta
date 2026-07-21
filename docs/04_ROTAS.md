# docs/04_ROTAS.md

# PADRÃO OFICIAL DE ROTAS

Versão: 1.0

Documento Oficial de Engenharia

---

# Objetivo

Este documento define a organização oficial das rotas do Valente Conecta.

Toda página da aplicação deverá seguir rigorosamente este padrão.

Nenhuma rota poderá ser criada de forma aleatória.

---

# Princípios

As rotas devem ser:

• previsíveis

• simples

• organizadas

• modulares

• escaláveis

• fáceis de localizar

---

# Estrutura Geral

O projeto utiliza:

Next.js App Router

Toda página deverá estar localizada dentro da pasta:

```
app/
```

---

# Estrutura Oficial

```
app/

layout.tsx

page.tsx

loading.tsx

error.tsx

not-found.tsx

globals.css
```

---

# Organização por Módulo

Exemplo

```
app/

cozinha/

page.tsx

layout.tsx

loading.tsx

error.tsx

components/

hooks/

services/

repositories/

types/
```

Cada módulo possui sua própria estrutura.

---

# Página Inicial

```
/
```

Responsável por:

Home

Categorias

Busca

Ofertas

Publicidade

Planos

Vídeos

---

# Rotas Públicas

```
/

login

cadastro

recuperar-senha

sobre

contato

planos

privacidade

termos
```

Não exigem autenticação.

---

# Rotas Autenticadas

```
/perfil

/favoritos

/pedidos

/notificacoes

/configuracoes
```

Necessitam usuário autenticado.

---

# Rotas Administrativas

Sempre iniciar com:

```
/admin
```

Exemplo

```
/admin

/admin/dashboard

/admin/usuarios

/admin/produtos

/admin/categorias

/admin/configuracoes
```

---

# Admin Master

Sempre iniciar com

```
/admin-master
```

Exemplo

```
/admin-master

/admin-master/dashboard

/admin-master/cozinha

/admin-master/financeiro

/admin-master/usuarios

/admin-master/logs

/admin-master/seguranca

/admin-master/auditoria
```

---

# Módulo Cozinha

```
/cozinha

/cozinha/cardapio

/cozinha/pratos

/cozinha/pedidos

/cozinha/carrinho

/cozinha/favoritos
```

---

# Administração da Cozinha

```
/admin-master/cozinha

/admin-master/cozinha/dashboard

/admin-master/cozinha/receitas

/admin-master/cozinha/ingredientes

/admin-master/cozinha/categorias

/admin-master/cozinha/fornecedores

/admin-master/cozinha/compras

/admin-master/cozinha/producao

/admin-master/cozinha/estoque

/admin-master/cozinha/financeiro

/admin-master/cozinha/relatorios
```

---

# Academia

```
/academia

/academia/treinos

/academia/eventos

/academia/alunos

/academia/planos
```

---

# Administração Academia

```
/admin-master/academia

/admin-master/academia/dashboard

/admin-master/academia/alunos

/admin-master/academia/professores

/admin-master/academia/treinos

/admin-master/academia/avaliacoes
```

---

# Comércio

```
/mercearias

/farmacias

/agua

/gas

/distribuidores
```

---

# Produtos

```
/produto/[id]
```

Nunca utilizar parâmetros por query quando o recurso puder ser identificado pelo caminho.

Correto

```
/produto/125
```

Evitar

```
/produto?id=125
```

---

# Categorias

```
/categoria/[slug]
```

Exemplo

```
/categoria/mercado

/categoria/farmacia

/categoria/restaurante
```

---

# Usuários

```
/usuario/[id]
```

---

# Empresas

```
/empresa/[slug]
```

---

# Serviços

```
/servicos

/servicos/[categoria]

/servicos/[categoria]/[profissional]
```

---

# Moto Táxi

```
/mototaxi

/mototaxi/chamar

/mototaxi/corridas

/mototaxi/historico
```

---

# Busca

```
/buscar

/buscar?q=produto

/buscar/mapa
```

---

# Financeiro

```
/financeiro

/financeiro/caixa

/financeiro/relatorios

/financeiro/despesas

/financeiro/receitas
```

---

# IA Valentinha

```
/ia

/ia/chat

/ia/documentos

/ia/relatorios

/ia/automacoes
```

---

# Configurações

```
/configuracoes

/configuracoes/perfil

/configuracoes/notificacoes

/configuracoes/privacidade

/configuracoes/integracoes
```

---

# API

Toda API deverá ficar em

```
app/api
```

Estrutura

```
app/

api/

usuarios/

route.ts

produtos/

route.ts

pedidos/

route.ts
```

Nunca criar APIs fora dessa estrutura.

---

# Layouts

Cada módulo pode possuir seu próprio layout.

Exemplo

```
cozinha/layout.tsx

academia/layout.tsx

admin/layout.tsx
```

---

# Loading

Sempre implementar

```
loading.tsx
```

para páginas com carregamento assíncrono.

---

# Error

Sempre implementar

```
error.tsx
```

para tratamento de falhas.

---

# Not Found

Sempre implementar

```
not-found.tsx
```

para recursos inexistentes.

---

# Middleware

Utilizar middleware para:

Autenticação

Permissões

Idioma

Cidade

Plano

---

# Nomes das Rotas

Sempre:

minúsculas

sem espaços

sem acentos

utilizar hífen apenas quando necessário.

Correto

```
admin-master

livro-caixa
```

Errado

```
AdminMaster

Livro Caixa

Livro_Caixa
```

---

# Rotas Dinâmicas

Utilizar

```
[id]

[slug]
```

Nunca utilizar nomes genéricos.

Ruim

```
[x]
```

Bom

```
[produtoId]

[categoria]

[empresaSlug]
```

---

# Navegação

Sempre utilizar

```
next/link
```

Nunca utilizar

```
window.location
```

---

# Redirecionamentos

Utilizar

```
redirect()

router.push()

router.replace()
```

Conforme o contexto.

---

# Breadcrumb

Todo módulo administrativo deverá possuir breadcrumb.

Exemplo

```
Dashboard

>

Cozinha

>

Receitas

>

Editar
```

---

# Checklist

☐ Estrutura correta

☐ Layout definido

☐ Loading criado

☐ Error criado

☐ Not Found criado

☐ Middleware aplicado

☐ Permissões verificadas

☐ Rota documentada

☐ Nome padronizado

☐ Navegação utilizando Next.js

---

# Regras para IA

Antes de criar qualquer nova rota verificar:

Existe rota semelhante?

↓

SIM

↓

Reutilizar

↓

NÃO

↓

Criar nova

Nunca duplicar funcionalidades.

Nunca criar páginas fora da estrutura oficial.

---

# Conclusão

Uma organização consistente de rotas é essencial para garantir previsibilidade, escalabilidade e facilidade de manutenção.

Toda nova funcionalidade deverá respeitar este padrão para preservar a arquitetura oficial do Valente Conecta.

---

Fim do Documento