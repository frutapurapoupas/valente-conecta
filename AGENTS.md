# AGENTS.md - Documentação Completa do Valente Conecta

## Visão Geral

O **Valente Conecta** é uma plataforma multifuncional desenvolvida em Next.js/TypeScript que conecta a cidade de Valente, BA, através de diversos serviços digitais. O aplicativo serve como um hub central para comércio local, serviços profissionais, esportes, empregos, transporte e muito mais.

## Arquitetura e Stack Tecnológico

### Frontend

* **Framework**: Next.js 14+ com App Router
* **Linguagem**: TypeScript
* **Estilização**: TailwindCSS
* **Componentes**: Lucide React (ícones)
* **Estado**: React Hooks (useState, useEffect)

### Backend

* **API**: Next.js API Routes
* **Banco de Dados**: Supabase (PostgreSQL)
* **Autenticação**: Sistema próprio com localStorage
* **Pagamentos**: Mercado Pago SDK
* **Webhooks**: Mercado Pago

### Infraestrutura

* **Deploy**: Vercel
* **Domínio**: Clic.com
* **Versionamento**: GitHub
* **Bot**: Telegram (funcionando)

## Módulos Principais

### 1. Comércio Local (PDV)

* **PDV Colaborativo**: Sistema de ponto de venda compartilhado
* **Catálogo de Produtos**: Gestão de estoque e preços
* **Lojas Virtuais**: Perfis de estabelecimentos
* **Controle de Fiado**: Sistema de crédito local

### 2. Profissionais Liberais

* **Catálogo de Serviços**: Profissionais podem divulgar seus serviços
* **Agendamento**: Sistema de marcação de consultas
* **Avaliações**: Feedback dos clientes
* **Planos Assinatura**: Básico (R$ 15/mês), Premium (R$ 25/mês)

### 3. Academia e Esportes

* **Cadastro de Atletas**: Perfil físico e metas
* **Atividades Esportivas**: Registro de esportes com localização
* **Alertas**: Notificações para treinos
* **IA de Treinamento**: Inteligência artificial para planos personalizados

### 4. Empregos

* **Cadastro de Currículos**: R$ 10/mês
* **Divulgação de Vagas**: R$ 20/mês
* **Múltiplas Experiências**: Suporte para várias experiências profissionais
* **Sistema de Pagamento**: PIX com chave aleatória

### 5. Transporte e Delivery

* **Motoristas**: Cadastro de transportadores
* **Entregas**: Sistema de delivery local
* **Rastreamento**: Localização em tempo real

### 6. Imóveis e Veículos

* **Anúncios**: Aluguel e venda
* **Fotos**: Múltiplas imagens por anúncio
* **Contato Direto**: Comunicação com interessados

### 7. Sistema Financeiro

* **Carteira Digital**: Saldo e transações
* **Indicações**: Programa de indicação com bônus
* **Pagamentos**: Integração com Mercado Pago
* **Comprovantes**: Upload de provas de pagamento

### 8. IA de Conteúdo e Vídeos 🎬

* **Geração Automática de Roteiros**: Criação de scripts para vídeos curtos
* **Vídeos Estilo Reels**: Conteúdos rápidos e compartilháveis
* **Templates Inteligentes**: Modelos prontos adaptáveis por negócio
* **Personalização por Segmento**: Conteúdo para mercados, lojas, serviços, etc.
* **Engajamento Local**: Foco em viralização dentro da cidade
* **Integração com outros módulos**: Produtos, serviços e anúncios podem gerar vídeos automaticamente

## Planos e Preços

### Empresas e Lojas

* **Grátis**: Perfil básico, 5 produtos
* **Básico**: R$ 29,90/mês, 50 produtos, contatos visíveis
* **Premium**: R$ 49,90/mês, catálogo ilimitado, PDV completo
* **Fisco**: R$ 99,90/mês, módulo fiscal completo

### Profissionais

* **Grátis**: Perfil básico
* **Básico**: R$ 15,00/mês, preços visíveis
* **Premium**: R$ 25,00/mês, destaque na busca

### Empregos

* **Currículo**: R$ 10,00/mês
* **Vagas**: R$ 20,00/mês

### Outros Serviços

* **Academia**: Grátis / R$ 49,90/mês (com IA)
* **Transporte**: R$ 25,00/mês
* **Imóveis**: Aluguel R$ 20/mês, Venda R$ 50/mês
* **Veículos**: Aluguel R$ 25/mês, Venda R$ 35/mês

## Funcionalidades Técnicas

### Geolocalização

* **GPS**: Captura de coordenadas para esportes e eventos
* **Mapas**: Integração com serviços de mapa
* **Localização**: Busca por proximidade

### Notificações

* **Push Notifications**: Alertas no navegador
* **Telegram Bot**: Notificações via Telegram
* **E-mail**: Comunicação com usuários

### IA e Inteligência Artificial

* **Valentinha AI**: Sistema de geração de conteúdo
* **Análise de Dados**: Insights sobre comportamento
* **Previsões**: Alertas preditivos para treinos
* **IA de Vídeos**: Sistema de geração automática de vídeos para marketing e engajamento
* **Roteirização Inteligente**: Criação automática de histórias e conteúdos narrativos

#### 🎭 Estilo Oficial de Conteúdo: "Novela de Frutas"

* Narrativas dramáticas e envolventes
* Personificação de produtos (ex: frutas como personagens)
* Situações do cotidiano local
* Linguagem simples e popular
* Humor leve com emoção
* Conteúdo voltado para viralização

### Sistema de Busca

* **Busca Inteligente**: IA para encontrar produtos e serviços
* **Filtros**: Refinamento por categoria, preço, localização
* **Sugestões**: Autocomplete baseado em histórico
* **Fallback Inteligente**: Busca em catálogos locais quando não encontrado
* **Modal de Opções**: 3 itens mais baratos e próximos quando busca falha
* **Pendências Admin**: Sistema envia buscas não localizadas para admin master
* **Busca por Cidade**: Opção para aceitar busca local em até 24 horas
* **Alerta Sininho**: Notificação quando pendências são sanadas

## Segurança e Privacidade

### Autenticação

* **Login Local**: Sistema próprio de autenticação
* **Tokens JWT**: Sessões seguras
* **Recuperação**: Fluxo de recuperação de senha

### Proteção de Dados

* **LGPD Compliance**: Conformidade com lei brasileira
* **Criptografia**: Dados sensíveis criptografados
* **Backup**: Backup automático de dados

## Integrações Externas

### Mercado Pago

* **Processamento**: Pagamentos online
* **PIX**: Transferências instantâneas
* **Webhooks**: Notificações de pagamento

### Supabase

* **Banco de Dados**: PostgreSQL como serviço
* **Realtime**: Sincronização em tempo real
* **Storage**: Upload de arquivos

### Telegram

* **Bot**: @valenteconecta_bot
* **Notificações**: Alertas e comunicações
* **Comandos**: Interação via chat

## Desenvolvimento e Deploy

### Ambiente Local

```bash
npm install
npm run dev
```

### Build e Deploy

```bash
npm run build
git add .
git commit -m "mensagem"
git push
```

### URLs

* **Produção**: https://valenteconecta-pied.vercel.app
* **Alias**: https://valente-conecta.clic.com.br
* **GitHub**: https://github.com/frutapurapoupas/valente-conecta

## Estrutura de Arquivos

```
valente-conecta/
├── app/                    # Páginas Next.js
│   ├── academia/          # Módulo Academia
│   ├── admin/             # Painéis administrativos
│   ├── empregos/          # Módulo de Empregos
│   ├── planos/            # Planos e assinaturas
│   └── ...
├── components/            # Componentes React
├── hooks/                # Hooks personalizados
├── services/             # Serviços e APIs
├── types/                # Tipos TypeScript
├── public/               # Arquivos estáticos
└── docs/                 # Documentação
```

## Chave PIX Principal

**Chave Aleatória para Pagamentos**: `df79fd53-2ce0-4013-b906-44f8076e28a1`

Todos os pagamentos são direcionados para a conta **DREX Escrit Virtual** através desta chave PIX.

## Status Atual

### Completo ✅

* Sistema de PDV colaborativo
* Catálogo de produtos e lojas
* Módulo de profissionais liberais
* Sistema de academia e esportes
* Módulo de empregos completo
* Sistema de transporte e delivery
* Anúncios de imóveis e veículos
* Sistema financeiro e carteira
* Integração com Mercado Pago
* Bot do Telegram funcionando

### Em Desenvolvimento 🚧

* Módulo fiscal avançado
* Mais integrações de IA
* Sistema de avaliações melhorado
* App mobile nativo
* IA de geração automática de vídeos

### ✅ Recentes Implementações (Maio 2026)

#### Sistema de Busca Inteligente
* **Busca Local**: Catálogos de usuários da cidade
* **Fallback Inteligente**: Quando não encontrado, mostra 3 itens mais baratos e próximos
* **Modal de Opções**: Interface para escolher entre busca local ou Google
* **Pendências Admin**: Sistema envia buscas não localizadas para admin master
* **Busca por Cidade**: Opção para aceitar busca local em até 24 horas
* **Alerta Sininho**: Notificação quando pendências são sanadas

#### Layout Otimizado
* **Header Azul**: Altura reduzida em 10%
* **Card OFERTAS**: Altura reduzida pela metade
* **Card Indique**: Altura padronizada
* **Categorias**: Grid responsivo com 8 cards + Serviços
* **Publicidade**: Carrossel verde com 3 banners

#### Sistema de Rotação
* **Carrossel Publicidade**: 3 banners trocando a cada 10 segundos
* **Indicação**: 10 abas rotativas automáticas
* **Indicadores**: Pontos visuais de navegação
* **Transições**: Opacity suave de 500ms

### Próximos Passos 📋

* Otimização de performance
* Novos módulos de serviços
* Expansão para outras cidades
* API para desenvolvedores
* Automação completa de geração e publicação de vídeos

## Contato e Suporte

* **Desenvolvedor**: Equipe Valente Conecta
* **Suporte Local**: Valente, BA
* **Telegram**: @valenteconecta_bot
* **E-mail**: (configurar)

---

**Última Atualização**: Maio 2026
**Versão**: 2.0+
**Status**: Produção Ativa
