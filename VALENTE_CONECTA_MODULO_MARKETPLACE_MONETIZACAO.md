# Valente Conecta — Módulo Marketplace, Monetização e Crescimento

> Documento de referência técnica. Complementa o `VALENTE_CONECTA_MASTER_SPEC.md`.
> Pode ser usado como contexto por qualquer IA (Claude, DeepSeek, Copilot, Windsurf) para dar continuidade ao desenvolvimento.

---

## 1. Visão geral do modelo

O Valente Conecta é um **ecossistema financeiro para cidades pequenas**. A camada de marketplace (catálogos públicos de comerciantes e usuários) segue o padrão de "vitrine aberta, contato pago":

1. Todo item cadastrado (produto, serviço, imóvel, vaga, etc.) aparece **publicamente** nas categorias e na busca da primeira página — com imagem, vídeo, preço e descrição.
2. Os **dados de contato do fornecedor** só são liberados ao comprador **após pagamento de uma taxa** configurável pelo admin master.
3. O fornecedor, ao receber uma notificação de interesse, também precisa pagar uma taxa (configurável) para desbloquear os dados de contato do comprador.
4. Alternativamente, qualquer usuário pode fazer um **pagamento único de adesão** que dá acesso irrestrito a todas as informações de contato do sistema, sem pagar por lead individualmente.

Este modelo é desenhado para funcionar com **dois trilhos de monetização em paralelo** (por lead e por assinatura), sem exigir reformulação de schema se um dos modelos for priorizado no futuro.

---

## 2. Modelo de dados (Supabase / PostgreSQL)

### 2.1 `catalogo_itens`
Tabela pública — dados visíveis sem restrição.

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid (PK) | |
| dono_id | uuid (FK → usuarios) | fornecedor/lojista |
| modulo | text | ex: `cozinha`, `imoveis`, `emprego` — permite filtrar por arquétipo |
| categoria | text | |
| titulo | text | |
| descricao_publica | text | |
| preco | numeric | pode ser null (ex: "sob consulta") |
| midia | jsonb | array de `{ tipo: 'imagem'|'video', url, thumb_url, ordem }` |
| localizacao | geography(point) | para cálculo de rota/distância |
| status | text | `ativo`, `pausado`, `removido` |
| created_at / updated_at | timestamptz | |

> **Importante:** nenhum campo de contato (telefone, endereço exato, WhatsApp) fica nesta tabela. Fica isolado em `usuarios` / `perfis_fornecedor`, protegido por RLS.

### 2.2 `interesses`
Registra cada manifestação de interesse de um comprador em um item.

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid (PK) | |
| item_id | uuid (FK → catalogo_itens) | |
| comprador_id | uuid (FK → usuarios) | |
| fornecedor_id | uuid (FK → usuarios) | desnormalizado do item, facilita RLS/consulta |
| status_comprador | text | `pendente_pagamento`, `liberado`, `isento_assinatura` |
| status_fornecedor | text | `pendente_pagamento`, `liberado`, `isento_assinatura` |
| valor_taxa_comprador | numeric | snapshot da taxa configurada no momento |
| valor_taxa_fornecedor | numeric | snapshot da taxa configurada no momento |
| created_at | timestamptz | |

Regra de liberação de dados: o backend só retorna o telefone/contato se `status_comprador = 'liberado'` **ou** o comprador tiver assinatura ativa (ver 2.4). Mesma lógica espelhada para o fornecedor ver o contato do comprador.

### 2.3 `taxas_config`
Configurável pelo admin master.

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid (PK) | |
| escopo | text | `global`, `modulo:cozinha`, `categoria:imoveis` — permite granularidade |
| tipo | text | `taxa_comprador`, `taxa_fornecedor`, `assinatura_unica` |
| valor | numeric | |
| ativo | boolean | |
| updated_at | timestamptz | |

O backend busca a regra mais específica primeiro (categoria > módulo > global).

### 2.4 `assinaturas_usuario`
Pagamento único de adesão geral.

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid (PK) | |
| usuario_id | uuid (FK → usuarios) | |
| status | text | `ativa`, `expirada`, `cancelada` |
| valor_pago | numeric | |
| valido_ate | timestamptz | null = vitalícia; ou expira em X meses, a definir |
| created_at | timestamptz | |

### 2.5 `pagamentos`
Genérica, reaproveitável para todos os fluxos financeiros do app (não só marketplace) — ligada ao "ecossistema financeiro" mais amplo.

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid (PK) | |
| usuario_id | uuid (FK) | |
| origem | text | `interesse_comprador`, `interesse_fornecedor`, `assinatura`, `bonus_indicacao` (crédito, não pagamento) |
| referencia_id | uuid | aponta pra `interesses.id` ou `assinaturas_usuario.id` |
| valor | numeric | |
| metodo | text | pix, cartão, saldo carteira |
| status | text | `pendente`, `aprovado`, `recusado`, `estornado` |
| created_at | timestamptz | |

### Fluxo de notificação
1. Comprador demonstra interesse → cria `interesses` (`pendente_pagamento` nos dois lados) → fornecedor recebe notificação (push, via `PushSubscriptionManager.tsx` já existente) avisando "alguém se interessou pelo seu item".
2. Comprador paga → `status_comprador = liberado` → comprador vê o contato do fornecedor.
3. Fornecedor paga → `status_fornecedor = liberado` → fornecedor vê o contato do comprador.
4. Se o comprador ou fornecedor tiver assinatura ativa (`assinaturas_usuario`), o pagamento daquele lado é pulado automaticamente (`isento_assinatura`).

---

## 3. Funil obrigatório de compressão de upload (imagem e vídeo)

Como o próprio usuário faz o upload, a compressão **precisa ser client-side, antes do envio** — isso economiza banda de upload e de storage simultaneamente, e evita depender de function serverless pesada (que tem timeout curto nos planos gratuitos).

### 3.1 Fluxo de imagem

1. Usuário seleciona a imagem no dispositivo.
2. No browser, antes do upload:
   - Redimensiona para no máximo **1600px** no lado maior (suficiente para tela cheia em celular, sem exagero)
   - Recomprime para **WebP, qualidade ~75-80%**
   - Gera também uma **thumbnail de 400px** (para listagem/busca) — o Supabase Storage também pode gerar isso via `image transformation`, mas gerar já no client evita gasto de transformação em runtime
3. Upload das duas versões (ou só a principal, se optar por depender do transform do Supabase para a thumb).
4. **Bloqueio de envio:** o botão "Salvar" da tela de upload só habilita depois que a compressão client-side terminar com sucesso — nunca permite subir o arquivo bruto direto.

Biblioteca recomendada: `browser-image-compression` (leve, roda 100% no navegador, sem dependência de servidor).

### 3.2 Fluxo de vídeo

Vídeo é mais pesado para comprimir no navegador puro. Estratégia:

1. **Limite de duração obrigatório na captura/seleção:** 15 a 30 segundos (estilo Reels/Stories) — resolve 80% do problema de peso só com essa regra.
2. Compressão client-side com `ffmpeg.wasm` (roda no navegador, sem servidor) — reduz para resolução 720p, bitrate controlado, formato MP4 (H.264) para compatibilidade universal.
3. Se o dispositivo do usuário for fraco e o `ffmpeg.wasm` travar (comum em celulares mais antigos), ter um fallback: aceitar o vídeo sem recompressão **mas rejeitar se ultrapassar um limite de tamanho** (ex: 15MB) — força o usuário a gravar um vídeo mais curto.
4. Enquanto o volume for baixo, manter no Supabase Storage. Se o consumo de banda/storage de vídeo crescer, migrar para um serviço de streaming dedicado (Cloudflare Stream ou Mux) sem alterar a UX — só troca o destino do upload.

### 3.3 Por que isso é seguro para o free tier
Com compressão obrigatória no cliente, cada imagem cai de possíveis 3-5MB (foto de celular moderno) para ~150-300KB, e cada vídeo de dezenas de MB para poucos MB. Isso multiplica por 10-15x quantos itens cabem no limite de 1GB de storage do Supabase Free — dá fôlego real para a fase de testes/piloto.

---

## 4. Busca inteligente da primeira página

A busca não é um campo de texto simples — é uma **vitrine comparativa**, no espírito Mercado Livre. Por resultado, exibir:

- Imagem/vídeo em destaque (primeiro item do array `midia`)
- Título, preço, categoria
- **Distância/rota** até o usuário (usa `localizacao` do item + geolocalização do usuário — cálculo simples de distância euclidiana/haversine é suficiente para uma cidade pequena, não precisa de roteamento real de mapas nessa etapa)
- Selo comparativo quando fizer sentido (ex: "menor preço da categoria", "mais próximo")
- Indicador de "alta demanda" (baseado em quantidade de `interesses` recentes no item — reaproveita dados que já vamos coletar)

Tecnicamente, isso é uma **view materializada ou função RPC no Supabase** que agrega `catalogo_itens` + contagem de interesses recentes + distância calculada, evitando N+1 queries no frontend.

---

## 5. Convite via QR Code + auto-instalação PWA

1. Cada usuário tem um código de convite único (derivado do próprio `id`, encurtado).
2. QR Code aponta para `valenteconecta.com/convite/[codigo]`.
3. Essa página:
   - Registra a relação indicador → indicado em `indicacoes` (nova tabela, ver 6.1)
   - Detecta se o PWA já está instalado; se não, dispara o prompt de instalação (`beforeinstallprompt` no Android/Chrome)
   - **Limitação a documentar:** no iOS, a Apple não permite instalação automática de PWA — o fluxo nesse caso precisa mostrar um passo a passo visual ("toque em compartilhar → adicionar à tela de início"), não dá pra automatizar 100%.

---

## 6. Bônus por indicação (campanha de lançamento)

### 6.1 Tabela `indicacoes`

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid (PK) | |
| indicador_id | uuid (FK → usuarios) | |
| indicado_id | uuid (FK → usuarios) | |
| status | text | `pendente`, `validado`, `invalido` |
| validado_em | timestamptz | |
| created_at | timestamptz | |

**Critério de validação** (evita fraude com contas fake): o indicado precisa ter telefone confirmado **e** ter realizado pelo menos uma ação de engajamento real (busca, interesse manifestado ou compra) dentro de um prazo definido (ex: 7 dias) após o cadastro.

### 6.2 Estrutura de bônus (recomendação)

Crédito em **saldo de carteira digital** (não dinheiro vivo saindo do caixa), com faixas progressivas:

| Indicados validados | Bônus |
|---|---|
| 3 | Crédito em carteira (valor a definir pelo admin master) |
| 10 | Crédito maior + isenção temporária da taxa de desbloqueio de contato por um período |
| 25 | Selo "Embaixador Valente Conecta" (destaque visual no perfil/catálogo) + crédito adicional |

O crédito é gasto dentro do próprio ecossistema (taxas de desbloqueio, compras nos módulos participantes) — o que mantém o usuário engajado no app em vez de simplesmente sacar o valor.

Tabela `taxas_config` (seção 2.3) pode ser reaproveitada com um novo `tipo = 'bonus_indicacao_faixa_N'` para o admin master configurar os valores de cada faixa sem alteração de código.

---

## 7. Ordem sugerida de implementação

1. Modelo de dados base (`catalogo_itens`, `interesses`, `taxas_config`, `assinaturas_usuario`, `pagamentos`) — fundação de tudo.
2. Funil de compressão de upload — aplicar primeiro no módulo Cozinha (já em andamento), depois replicar como padrão para os demais módulos.
3. Busca inteligente rica — depende do catálogo unificado estar populado com dados reais de pelo menos 2-3 módulos para fazer sentido testar.
4. Sistema de interesse pago (liberação de contato) — pode ser ativado módulo por módulo, começando desligado (contato aberto) até o admin master configurar as taxas.
5. QR Code de convite + campanha de bônus — última peça, mais voltada para crescimento pós-lançamento do que para a arquitetura central.
