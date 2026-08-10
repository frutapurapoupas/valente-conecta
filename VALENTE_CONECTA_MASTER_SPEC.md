# VALENTE CONECTA — MASTER SPEC

> Documento de referência única do projeto. Consolida todas as decisões arquiteturais
> tomadas até aqui. Deve ser usado como contexto de partida em qualquer nova conversa,
> com qualquer IA (Claude, DeepSeek, Copilot, Windsurf), para manter consistência
> e reduzir consumo de tokens explicando o projeto do zero.
>
> Complementado por: `VALENTE_CONECTA_MODULO_MARKETPLACE_MONETIZACAO.md` (sistema de
> interesse pago, compressão de upload, busca inteligente, QR Code, bônus por indicação).

---

## 1. Visão do projeto

O Valente Conecta é um **ecossistema financeiro para cidades pequenas**, começando
pela cidade de Valente, BA (~25.000 habitantes). Reúne comércio, serviços e um
sistema financeiro (carteira digital, taxas, pagamentos) numa única plataforma,
com baixo custo de implantação e operação.

**Stack:** Next.js, Supabase (banco + auth + storage), deploy em Vercel.
**Caminho local do projeto:** `C:\valente_conecta`

---

## 2. Princípios arquiteturais

- **Separação absoluta entre Design (HTML/UI) e Lógica** (Hooks/Services/Repositories) —
  nenhuma tela deve conter regra de negócio embutida no JSX.
- **Interface única reutilizável para todos os módulos** — os módulos verticais não
  reinventam UI própria; usam os mesmos componentes-base.
- **Arquitetura pensada para 100.000 usuários ativos.**
- **Diretriz de aproveitamento máximo dos arquivos existentes** — evitar reescrever
  do zero o que já funciona; consolidar e reaproveitar.
- **Módulo de referência arquitetural: Alimentação** (não Cozinha). A Cozinha
  Chef Neide é um módulo especializado derivado da arquitetura de Alimentação.

---

## 3. Arquétipos reutilizáveis

Em vez de construir um sistema isolado para cada uma das ~20 verticais de
comércio/serviço identificadas (alimentação, roupas/sapatos, serviços com
agendamento, saúde, imóveis, emprego, mercearia, pet shop, beleza, eventos etc.),
o projeto agrupa tudo em poucos arquétipos reutilizáveis:

| Arquétipo | Cobre |
|---|---|
| **Catálogo + Carrinho** | Alimentação, mercearia, roupas/sapatos, pet shop, utilidades |
| **Agenda + Profissional** | Saúde, beleza/estética, serviços com agendamento |
| **Anúncio + Contato** | Imóveis, emprego, aluguel de máquinas |
| **Geolocalização móvel** | Moto Táxi, ambulantes |
| **Financeiro** | Carteira digital, taxas, pagamentos (transversal a todos) |

Cada vertical nova deve, antes de qualquer implementação, ser mapeada para um
(ou combinação de) desses arquétipos.

---

## 4. Módulos do lançamento

Decidido que participam do lançamento inicial:

**Cozinha** (Chef Neide) · **Academia** (visão do aluno) · **Moto Táxi** ·
**Gás e Água** · **Serviços** · **Mercados** · **Imóveis** · **Emprego** ·
**Construção** · **Saúde** · **Pet Shop**

O restante das verticais mapeadas fica para uma fase seguinte, com um pop-up
coletando interesse da população já no lançamento.

### Ordem de execução definida
1. Testar/finalizar o módulo Cozinha
2. Este documento mestre + arquétipos (em andamento)
3. Moto Táxi
4. Academia
5. Demais módulos do lançamento (Gás e Água, Serviços, Mercados, Imóveis,
   Emprego, Construção, Saúde, Pet Shop) — padronizados conforme os arquétipos
6. Últimos ajustes (sistema de login) se der tempo antes do lançamento

---

## 5. Módulo Cozinha Chef Neide

### 5.1 Status
Implementação oficial consolidada em `app/admin-master/cozinha-chef/` — as
implementações paralelas que existiam (`app/admin-master/cozinha/`,
`src/modules/cozinha/`) foram removidas durante a limpeza de build.

### 5.2 Fluxo definido
`Receitas → Estoque → Produção → Compras → Preview → Catálogo Público`

- **Estoque inteligente:** criação automática de novos ingredientes ao montar
  uma receita, se o ingrediente ainda não existir.
- **Organização automática das receitas por categoria** (pratos, doces,
  salgados, bolos etc.).
- **Módulo de Produção** calcula custos, lucro e consumo de estoque.
- **Lista de compras** gerada a partir das necessidades de produção (implementada
  na tela de receita como ação — ver `_lib/indicadoresReceita.ts`).
- **Fluxo de pedidos:** `Pedido → Produção → Expedição → Entrega`

### 5.3 Conversão de unidades
Sistema converte automaticamente entre unidade de compra (kg, L, unidade) e
unidade usada na receita (g, ml). Caso especial: itens comprados por unidade
mas usados em peso (ex: ovo ~50g) têm esse valor de equivalência editável por
item, ajustável conforme a compra real.

### 5.4 Página de receita — estado atual
Campos e indicadores implementados: nome, categoria, descrição (pública,
aparece no catálogo), imagem (upload com preview), porções, peso final do
produto, status, preço de venda/sugerido, custos extras por porção, indicadores
financeiros (margem, lucro, cenários de preço), ranking de custo por
ingrediente, régua de progresso do peso final, lista de ingredientes com
conversão de unidade exibida, botões "Salvar Receita" e "Enviar para Lista de
Compras".

**Pendência conhecida (não bloqueante):** o campo "Custo total" no painel
executivo lê `receita.custo_receita` (valor salvo, desatualizado até o próximo
save) em vez de recalcular em tempo real a partir da soma dos ingredientes
atuais — correção já mapeada em `_lib/indicadoresReceita.ts`, aguardando
aplicação.

**Pendência de layout:** a página de receita ainda não está no formato
combinado; refinamento visual adiado para depois da conclusão do restante do
projeto.

---

## 6. Home do app

Layout de referência (imagem fornecida pelo usuário): header com logo/
localização, card de Carteira Digital, banners de lançamento/indicação, grade
de categorias, lista de comércio local em destaque, navegação inferior fixa.

**Descobertas relevantes da limpeza de build:**
- `HomeViewNew.tsx` (com subcomponentes HeaderHome, BuscaHome, CarrosselBanners,
  SecaoCategorias, SecaoEstatisticas, SecaoPlanos, VideoLancamento, BotaoAdmin)
  está **órfão** — não conectado à página raiz `app/page.tsx`, que tem sua
  própria implementação inline hoje.
- `services/homeService.ts` contém os dados reais da Home atual (grid de itens,
  categorias em 4 blocos, cores, ícones, links) — referência útil para o
  redesenho.
- `PushSubscriptionManager.tsx` (Web Push API, VAPID key) está implementado mas
  não conectado a nenhuma página, e falta o método `salvarPushSubscription` no
  backend. Candidato natural a reativar quando push notification (ex:
  notificação de interesse no marketplace) entrar em escopo.

Redesenho da Home está previsto para depois da consolidação do módulo Cozinha
e dos arquétipos.

---

## 7. Moto Táxi

Requisitos: mapa de rota, motorista mais próximo, preço calculado da corrida,
identificação do motorista — modelo similar a Uber/99. Decidido consolidar
numa única implementação estável (havia rotas paralelas) e deletar as demais.
Usa o arquétipo **Geolocalização móvel**.

---

## 8. Academia

Ajustes finos na visão do aluno, para participar do lançamento. Detalhamento
ainda pendente — a ser tratado na etapa 4 da ordem de execução.

---

## 9. Login / Autenticação

**Status atual: não implementado em nenhuma parte do projeto** (confirmado via
busca no código por `supabase.auth`, `useAuth`, `AuthContext`, `getSession`,
`getUser()` — nenhuma ocorrência). Decidido deixar como **última ação antes do
lançamento**, priorizando algo bem pensado, discreto e exclusivo. Biometria
facial opcional, habilitável por estabelecimento, é um requisito já definido
para o sistema mais amplo (provavelmente ligado a login/checkout).

Enquanto não existe autenticação, os fluxos que dependeriam de `usuario_id`
real (ex: lista de compras, sistema de interesse pago) usam placeholders
temporários, sinalizados com `// TODO` no código.

---

## 10. Outras decisões transversais já tomadas

- **Fila de espera em tempo real** para clínicas, hospitais e serviços com
  agendamento (arquétipo Agenda + Profissional).
- **Sistema financeiro do ecossistema** (ver documento complementar de
  marketplace/monetização): interesse pago com taxa dupla (comprador/
  fornecedor), assinatura única de acesso geral, carteira digital para bônus
  de indicação, tudo configurável pelo admin master via `taxas_config`.
- **Deploy:** Vercel + Supabase. Free tier suficiente para desenvolvimento e
  piloto; upgrade para planos pagos (~US$45/mês combinados) recomendado no dia
  do lançamento oficial, por causa da pausa automática do Supabase Free após
  inatividade e do limite de armazenamento de mídia.
- **Uploads de imagem/vídeo** feitos pelos próprios usuários, com funil
  obrigatório de compressão client-side antes do envio (ver
  `utils/comprimirImagem.ts` e documento complementar).

---

## 11. Log de marcos técnicos

- Sessão extensa de consolidação de build: árvores duplicadas da Cozinha
  removidas (+40 arquivos), Moto Táxi unificado, ~15 arquivos órfãos
  removidos, dezenas de erros de tipo corrigidos, senha de admin removida da
  tela pública de login, `free-claude-code` isolado do build. Commit final:
  133 arquivos alterados, 25.447 linhas removidas contra 1.000 inseridas.
- Upload de imagem implementado na tela de receita (localizar arquivo +
  preview + salvar via `/api/upload/recipe`), build passando limpo.
- Dropdown de ingredientes (antes reportado vazio) confirmado funcionando em
  teste real.
- Migrations criadas: `003_marketplace_interesse.sql` (catálogo, interesses,
  taxas, assinaturas, pagamentos, indicações) e `004_lista_compras.sql`.
- Funil de compressão de imagem (`utils/comprimirImagem.ts`) e botão "Enviar
  para Lista de Compras" (`/api/cozinha/lista-compras`) implementados e
  aguardando aplicação/teste no projeto local.

---

## 12. Documentos complementares

- `VALENTE_CONECTA_MODULO_MARKETPLACE_MONETIZACAO.md` — modelo de dados do
  sistema de interesse pago, funil de compressão, busca inteligente rica,
  convite via QR Code com auto-instalação PWA, bônus por indicação.
