# docs/05_APIS.md

# PADRÃO OFICIAL DAS APIS

Versão: 1.0

Documento Oficial de Engenharia

---

# Objetivo

Este documento define o padrão obrigatório para todas as APIs do
Valente Conecta.

Nenhuma API poderá ser criada fora deste padrão.

Todas deverão possuir:

- estrutura única
- autenticação
- validação
- tratamento de erros
- logs
- auditoria
- documentação

---

# Arquitetura Oficial

```

Cliente

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

```

A API nunca será chamada diretamente por componentes.

---

# Estrutura Oficial

```
app/

api/

usuarios/

route.ts

produtos/

route.ts

pedidos/

route.ts

cozinha/

receitas/

route.ts
```

---

# Estrutura Interna

Toda API deverá possuir:

```
Receber Request

↓

Autenticar

↓

Validar

↓

Chamar Service

↓

Retornar Response
```

Nunca colocar regra de negócio na API.

---

# Responsabilidades da API

A API pode:

✔ validar entrada

✔ validar autenticação

✔ validar permissões

✔ chamar Services

✔ retornar respostas

A API NÃO pode:

✘ calcular regras de negócio

✘ acessar banco diretamente

✘ montar telas

✘ gerar HTML

✘ acessar Components

---

# Fluxo Oficial

```
Request

↓

Middleware

↓

Autenticação

↓

Validação

↓

Service

↓

Repository

↓

Supabase

↓

Banco

↓

Repository

↓

Service

↓

API

↓

Response
```

---

# Métodos HTTP

GET

Consultar informações.

Nunca alterar dados.

---

POST

Criar registros.

---

PUT

Atualização completa.

---

PATCH

Atualização parcial.

---

DELETE

Exclusão lógica ou física.

---

# Exemplo de Estrutura

```
app/api/produtos/route.ts
```

Fluxo

```
GET

↓

ProdutoService.listar()

↓

ProdutoRepository.buscar()

↓

Supabase
```

---

# Estrutura Recomendada

```
import

↓

Validação

↓

Autenticação

↓

Service

↓

Response

↓

Tratamento Erro
```

---

# Resposta Padrão

Sempre retornar JSON.

Sucesso

```
{
success:true,
data:{},
message:"",
timestamp:""
}
```

Erro

```
{
success:false,
error:"",
code:"",
details:"",
timestamp:""
}
```

Nunca retornar textos soltos.

---

# Status HTTP

200

Consulta realizada.

---

201

Registro criado.

---

204

Sem conteúdo.

---

400

Dados inválidos.

---

401

Não autenticado.

---

403

Sem permissão.

---

404

Não encontrado.

---

409

Conflito.

---

422

Erro de validação.

---

429

Muitas requisições.

---

500

Erro interno.

---

# Paginação

Obrigatória para listas grandes.

Parâmetros

```
page

limit

order

sort
```

Resposta

```
data

pagination

total

page

pages
```

---

# Filtros

Utilizar parâmetros claros.

Exemplo

```
?categoria=

?cidade=

?ativo=

?nome=
```

Nunca criar filtros inconsistentes.

---

# Ordenação

```
sort=nome

sort=data

sort=preco
```

---

# Busca

```
?q=
```

Exemplo

```
?q=banana
```

---

# Versionamento

Preparar estrutura.

```
api/v1/

api/v2/
```

Mesmo que inicialmente apenas v1 exista.

---

# Autenticação

Toda API privada deverá validar:

JWT

Usuário

Permissões

Plano

Cidade

---

# Permissões

Exemplo

```
ADMIN

EMPRESA

USUARIO

MOTORISTA

ACADEMIA

COZINHA

ADMIN_MASTER
```

Nunca confiar apenas no Frontend.

---

# Middleware

Responsável por:

Autenticação

Rate Limit

Idioma

Cidade

Plano

Logs

---

# Tratamento de Erros

Sempre utilizar

```
try

catch

logger

response
```

Nunca

```
catch {}
```

Nunca esconder erros.

---

# Logs

Registrar

Usuário

Data

IP

Método

Tempo

Erro

Status

---

# Auditoria

Toda alteração deverá gerar evento.

Exemplo

```
Produto Criado

Produto Alterado

Pedido Pago

Receita Excluída
```

---

# Upload

Utilizar Storage.

Nunca Base64 para arquivos grandes.

---

# Download

Sempre verificar autorização.

Nunca disponibilizar arquivos privados.

---

# Segurança

Obrigatório

Sanitização

Validação

Escape

JWT

RLS

Rate Limit

CORS

Helmet

Headers

---

# Cache

Utilizar quando possível.

Cache

Redis (futuro)

Next Cache

Revalidate

ISR

---

# Performance

Evitar consultas repetidas.

Selecionar apenas campos necessários.

Paginar resultados.

Limitar quantidade.

Evitar SELECT *

---

# Repository

Toda API obrigatoriamente utiliza Repository.

Nunca

```
Supabase direto
```

Correto

```
API

↓

Service

↓

Repository

↓

Supabase
```

---

# Service

Toda regra pertence ao Service.

Exemplo

```
ProdutoService

PedidoService

ReceitaService

FinanceiroService
```

---

# Validação

Sempre validar

Campos obrigatórios

Tipos

Datas

Valores

UUID

Slug

Permissões

---

# Convenções

URLs

Plural.

Correto

```
/produtos

/usuarios

/pedidos
```

Evitar

```
/produto

/usuario
```

Exceção:

quando representar recurso único.

---

# Tempo de Resposta

Objetivo

Consultas simples

< 300 ms

Consultas médias

< 800 ms

Consultas complexas

< 2 segundos

---

# Documentação

Toda API deverá possuir:

Objetivo

Parâmetros

Resposta

Erros

Permissões

Exemplo de uso

---

# Estrutura Recomendada do Projeto

```
services/

ProdutoService.ts

repositories/

ProdutoRepository.ts

app/api/produtos/

route.ts
```

---

# Checklist

☐ API documentada

☐ Validação implementada

☐ Autenticação

☐ Permissões

☐ Logs

☐ Auditoria

☐ Tratamento de erros

☐ Paginação

☐ Filtros

☐ Ordenação

☐ Cache

☐ Repository utilizado

☐ Service utilizado

☐ Sem acesso direto ao banco

---

# Regras para IA

Antes de criar uma API verificar:

Existe API semelhante?

↓

SIM

↓

Reutilizar

↓

NÃO

↓

Criar nova

Nunca duplicar endpoints.

Nunca acessar Supabase diretamente da API quando existir Repository.

Nunca implementar regra de negócio na camada de API.

---

# Conclusão

As APIs representam a porta oficial de entrada da plataforma.

Seguir este padrão garante segurança, previsibilidade, facilidade de manutenção e escalabilidade para todo o ecossistema do Valente Conecta.

---

Fim do Documento