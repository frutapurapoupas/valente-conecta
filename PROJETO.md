# VALENTE CONECTA

Versão:
1.0

Status:
Em Refatoração Estrutural

Autor da Arquitetura:
OpenAI + Engenharia do Projeto

Local do Projeto

C:\valente_conecta

--------------------------------------------------

OBJETIVO

O Valente Conecta é uma plataforma integrada para cidades inteligentes.

Não é apenas um aplicativo.

É um ecossistema modular onde novos serviços podem ser adicionados sem alterar a arquitetura principal.

O sistema deverá suportar crescimento contínuo, mantendo desempenho, organização e facilidade de manutenção.

--------------------------------------------------

OBJETIVOS PRINCIPAIS

✔ Organização absoluta

✔ Código reutilizável

✔ Separação rigorosa entre Interface e Regra de Negócio

✔ Escalabilidade

✔ Facilidade de manutenção

✔ Uso intensivo de componentes reutilizáveis

✔ Aproveitamento máximo do código existente

✔ Redução de consumo de tokens por IA

✔ Publicação para mais de 100.000 usuários ativos

--------------------------------------------------

PRINCÍPIOS

Todo código deve ser:

Simples

Organizado

Documentado

Tipado

Reutilizável

Escalável

Testável

--------------------------------------------------

NÃO É PERMITIDO

Página acessar banco

Página acessar Supabase

Página conter regra de negócio

Página realizar cálculos complexos

Componentes fazer fetch

Componentes acessar banco

Hooks renderizar HTML

Services renderizar JSX

Repository conter HTML

--------------------------------------------------

ARQUITETURA OFICIAL

HTML

↓

Componentes

↓

Hooks

↓

Services

↓

Repositories

↓

APIs

↓

Supabase

↓

Banco

--------------------------------------------------

REGRA PRINCIPAL

Cada arquivo possui uma única responsabilidade.

Nenhum arquivo pode misturar responsabilidades.

Sempre reutilizar arquivos existentes antes de criar novos.

Duplicação de código é proibida.

--------------------------------------------------

PADRÃO DE NOMES

Page

NomePage.tsx

Component

NomeCard.tsx

NomeModal.tsx

NomeTable.tsx

Hook

useNome.ts

Service

nomeService.ts

Repository

nomeRepository.ts

Type

nome.types.ts

API

route.ts

--------------------------------------------------

DOCUMENTAÇÃO

Toda alteração relevante deverá atualizar:

MAPA_GERAL.md

BACKLOG.md

RELEASE.md

quando aplicável.

--------------------------------------------------

META FINAL

Publicação do sistema completo com estabilidade para mais de 100.000 usuários ativos.