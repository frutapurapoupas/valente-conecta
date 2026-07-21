# Valente Conecta

> Framework Oficial de Engenharia de Software da Plataforma Valente Conecta

Versão: 1.0.0

Status: Em desenvolvimento

---

# Objetivo

O Valente Conecta não é apenas um aplicativo.

É uma plataforma digital destinada a integrar cidadãos, empresas, profissionais, prestadores de serviço e órgãos administrativos de uma cidade em um único ecossistema.

Toda implementação futura deverá seguir obrigatoriamente os padrões descritos nesta documentação.

Este conjunto de documentos constitui a referência oficial de arquitetura do projeto.

---

# Objetivos do Projeto

• Baixíssimo custo operacional

• Arquitetura preparada para 100.000+ usuários ativos

• Código altamente reutilizável

• Separação rigorosa entre interface e lógica

• Alta performance

• Escalabilidade horizontal

• Manutenção simplificada

• Desenvolvimento assistido por IA

• Documentação viva

---

# Tecnologias Oficiais

Frontend

- Next.js (App Router)
- React
- TypeScript
- TailwindCSS

Backend

- Next.js API Routes
- Supabase

Banco

- PostgreSQL (Supabase)

Autenticação

- Supabase Auth
- JWT
- Row Level Security

Pagamentos

- Mercado Pago
- PIX

Mapas

- Google Maps
- OpenStreetMap (quando aplicável)

Geolocalização

- Browser Geolocation
- GPS Mobile

PWA

- Sim

Offline

- Sim

---

# Princípios Fundamentais

## 1.

Nenhum componente acessa banco.

---

## 2.

Nenhuma página possui regra de negócio.

---

## 3.

Toda regra de negócio pertence aos Services.

---

## 4.

Todo acesso externo passa por APIs.

---

## 5.

Toda API utiliza Repository.

---

## 6.

Todo Repository é responsável por persistência.

---

## 7.

Hooks controlam estado.

Nunca HTML.

---

## 8.

Componentes apenas renderizam.

---

## 9.

HTML nunca contém lógica complexa.

---

## 10.

Toda funcionalidade deverá possuir documentação.

---

# Arquitetura Oficial

```
UI

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

Banco de Dados
```

Nenhuma camada poderá ignorar outra.

---

# Organização do Projeto

```
app/

components/

hooks/

services/

repositories/

types/

lib/

docs/

engineering/

public/

scripts/

tools/

tests/
```

---

# Organização da Documentação

```
docs/

README.md

00_PROJETO.md

01_ARQUITETURA.md

02_PADRAO_DE_CODIGO.md

03_MODULOS.md

04_ROTAS.md

05_APIS.md

06_SUPABASE.md

07_COMPONENTES.md

08_HOOKS.md

09_SERVICES.md

10_REPOSITORIES.md

11_TYPES.md

12_FLUXOS.md

13_EVENTOS.md

14_REGRAS_NEGOCIO.md

15_UI_DESIGN.md

16_PERFORMANCE.md

17_SEGURANCA.md

18_ESCALABILIDADE.md

19_CACHE.md

20_OFFLINE.md

21_DEPLOY.md

22_TESTES.md

23_AUDITORIA.md

24_MAPA_GERAL.md

25_BACKLOG.md

26_DUPLICADOS.md

27_OBSOLETOS.md

28_PADRAO_HTML.md

29_PADRAO_REACT.md

30_PADRAO_TYPESCRIPT.md

31_PADRAO_SUPABASE.md

32_PADRAO_API.md

33_PADRAO_COMPONENTES.md

34_PADRAO_HOOKS.md

35_PADRAO_SERVICE.md

36_PADRAO_REPOSITORY.md

37_PADRAO_ESTADO.md

38_PADRAO_FORMULARIOS.md

39_PADRAO_LISTAS.md

40_PADRAO_TABELAS.md

41_PADRAO_MODAL.md

42_PADRAO_NOTIFICACOES.md

43_PADRAO_LOGS.md

44_PADRAO_ERROS.md

45_PADRAO_IA.md

46_MAPA_DEPENDENCIAS.md

47_MAPA_USUARIO.md

48_MAPA_NEGOCIO.md

49_RELEASE.md
```

---

# Módulos Oficiais

O sistema será organizado em módulos independentes.

Entre eles:

- Home

- Busca Inteligente

- Catálogo

- Comércio

- Cozinha

- Academia

- Moto Táxi

- Serviços

- Financeiro

- Administração

- IA Valentinha

- Configurações

- Moeda Digital

- Criptomoeda

Novos módulos deverão seguir exatamente a mesma arquitetura.

---

# Desenvolvimento Assistido por IA

Toda IA deverá consultar esta documentação antes de alterar qualquer código.

A ordem obrigatória de leitura é:

1. README.md

2. 01_ARQUITETURA.md

3. Documento específico do assunto

Exemplo

Criar componente

↓

01_ARQUITETURA.md

↓

07_COMPONENTES.md

↓

33_PADRAO_COMPONENTES.md

---

# Auditoria

Nenhuma alteração poderá ser considerada concluída antes da execução dos scripts de auditoria.

Os scripts verificarão:

- arquitetura

- imports

- dependências

- arquivos órfãos

- duplicações

- tamanho dos arquivos

- componentes

- hooks

- APIs

- segurança

---

# Meta Final

Transformar o Valente Conecta na principal plataforma digital municipal do Brasil, suportando centenas de milhares de usuários ativos, mantendo alta disponibilidade, baixo custo operacional, facilidade de manutenção e evolução contínua baseada em uma arquitetura consistente.

---

# Próximos Documentos

00_PROJETO.md

01_ARQUITETURA.md

02_PADRAO_DE_CODIGO.md

03_MODULOS.md

04_ROTAS.md

05_APIS.md

(...)

49_RELEASE.md

---

Fim do Documento