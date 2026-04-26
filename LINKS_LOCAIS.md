# Links Locais para Testes - Valente Conecta

## 🚀 Servidor Local
Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
Acesse em: **http://localhost:3000**

---

## 🔐 Admin Master

### Dashboard Principal
- **URL:** http://localhost:3000/admin-master/dashboard
- **Descrição:** Dashboard principal com KPIs, gráficos e atalhos rápidos

### Financeiro Pessoal
- **URL:** http://localhost:3000/admin-master/financeiro-pessoal
- **Descrição:** Sistema completo de finanças pessoais com categorias, fornecedores, cartões e lançamentos

### Multi-Cidade - Gestão de Usuários
- **URL:** http://localhost:3000/admin-master/multi-cidade/usuarios
- **Descrição:** Gerenciamento de usuários por cidade com filtros e ações

### Multi-Cidade - Relatórios Comparativos
- **URL:** http://localhost:3000/admin-master/multi-cidade/relatorios
- **Descrição:** Relatórios comparativos entre cidades com gráficos e métricas

---

## 📅 Agendamentos (Admin)

### Fila de Espera
- **URL:** http://localhost:3000/admin/agendamento/fila-espera
- **Descrição:** Gerenciamento de fila de espera para agendamentos

### Notificações de Agendamento
- **URL:** http://localhost:3000/admin/agendamento/notificacoes
- **Descrição:** Envio de notificações para lembretes de agendamentos

---

## 🛺 Ambulantes

### Lista de Ambulantes
- **URL:** http://localhost:3000/ambulantes
- **Descrição:** Listagem geral de ambulantes

### Catálogo de Ambulante (Específico)
- **URL:** http://localhost:3000/ambulantes/catalogo/[id]
- **Descrição:** Catálogo de produtos de um ambulante específico
- **Exemplo:** http://localhost:3000/ambulantes/catalogo/1

---

## 🏋️ Academia

### Página Principal da Academia
- **URL:** http://localhost:3000/academia
- **Descrição:** Sistema de academia com geo-referência, check-in automático, treinos guiados e metas pessoais
- **Funcionalidades:**
  - Geo-referência para check-in automático na academia
  - Cadastro de perfil do aluno (peso, altura, metas, condições físicas)
  - Treinos guiados com acompanhamento de cargas
  - Sistema de metas e progresso
  - Notificações personalizadas por objetivo
  - Histórico de treinos e conquistas

---

## 🏪 Admin Serviço com Agendamento

### Painel Admin do Serviço
- **URL:** http://localhost:3001/admin-servico
- **Descrição:** Painel administrativo exclusivo para serviços com agendamento (barbearias, clínicas, etc.)
- **Funcionalidades:**
  - Gestão de catálogo de produtos/serviços
  - Resposta a mensagens de clientes
  - Criação e atribuição de tarefas para equipe
  - Extrato financeiro por período (hoje, mês, personalizado)
  - Publicação automática de catálogo na home e busca inteligente
  - Acesso restrito a usuários com role "servico_agendamento"

---

## 💰 Sistema de Planos

### Página de Planos
- **URL:** http://localhost:3001/planos
- **Descrição:** Sistema completo de planos e assinaturas
- **Funcionalidades:**
  - Planos para Academia (Grátis e Premium R$9,90)
  - Planos para Serviço com Agendamento (Básico R$25, Premium R$35)
  - Planos para Profissionais Liberais (Básico R$15, Premium R$25)
  - Planos para Ambulantes (Básico R$15, Premium R$25)
  - Múltiplos planos por usuário
  - Cadastro dinâmico por tipo de plano
  - Planos grátis: Nome, WhatsApp, Cidade Base
  - Planos Academia: CPF, Cidade Base
  - Planos Empresas: CNPJ, Nome Responsável, Nome Fantasia, Endereço, Localizador, Complemento, Cidade Base
  - Pagamento integrado
  - Destaque de planos ativos na home
  - Card de configuração exclusivo para admins de lojas após assinatura

### Admin Master - Configuração de Planos
- **URL:** http://localhost:3001/admin-master/planos
- **Descrição:** Interface para Admin Master configurar preços e planos
- **Funcionalidades:**
  - Configuração de preços de todos os planos
  - Ativação/desativação de planos
  - Visualização de recursos e limites
  - Acesso restrito a Admin Master

---

## 🏋️ Módulo Academia

### Página Principal
- **URL:** http://localhost:3001/academia
- **Descrição:** Sistema completo de gestão de treinos
- **Funcionalidades:**
  - Check-in automático por geolocalização
  - Rastreamento de tempo de treino
  - Treino do dia com exercícios e cargas
  - Metas personalizadas (peso, altura, período)
  - Frequência semanal configurável (1-7 dias)
  - Notificações de incentivo personalizadas
  - Conquistas e badges
  - Contraste aprimorado em todos os campos de entrada

### Histórico de Cargas
- **URL:** http://localhost:3001/academia/historico-carga
- **Descrição:** Configuração de atividades e cargas rotineiras
- **Funcionalidades:**
  - Cadastro de exercícios personalizados
  - Configuração de carga atual e meta
  - Agrupamento por grupo muscular
  - Ajuste rápido de cargas (+/- 2.5kg)
  - Histórico de últimos treinos
  - Resumo de metas atingidas

### Biblioteca de Exercícios
- **URL:** http://localhost:3001/academia/biblioteca
- **Descrição:** Biblioteca de exercícios e técnicas
- **Funcionalidades:**
  - Busca de exercícios por nome
  - Filtro por categoria e nível
  - Instruções detalhadas passo a passo
  - Dicas importantes para execução
  - Informações de equipamento necessário
  - Exercícios pré-cadastrados (Supino, Agachamento, Puxada, etc.)

---

## 📊 Funcionalidades Integradas

### ✅ Sistema Financeiro Pessoal
- Categorias personalizadas (receitas/despesas)
- Gerenciamento de fornecedores
- Gerenciamento de cartões de crédito
- Lançamentos com recorrência
- Gráficos financeiros
- Extrato profissional com PDF
- Alertas de cartões

### ✅ Sistema de Agendamentos
- Fila de espera
- Notificações automáticas
- Lembretes de agendamento

### ✅ Sistema de Ambulantes
- Catálogo de produtos
- Upload de fotos
- Gestão de pedidos
- Sistema de avaliações
- Localização

### ✅ Admin Multi-Cidades
- Gestão de usuários por cidade
- Relatórios comparativos
- Métricas por cidade
- Ranking de cidades

---

## 🔧 Configuração de Mock vs Real Data

Os hooks usam a constante `USE_MOCK` do arquivo `lib/supabase-client-switch.ts` para alternar entre dados mock e dados reais do Supabase.

Para testar com dados mock (padrão):
```typescript
// lib/supabase-client-switch.ts
export const USE_MOCK = true
```

Para testar com dados reais do Supabase:
```typescript
// lib/supabase-client-switch.ts
export const USE_MOCK = false
```

---

## 📝 Checklist de Testes

### Financeiro Pessoal
- [ ] Criar nova categoria
- [ ] Criar novo fornecedor
- [ ] Adicionar novo cartão
- [ ] Criar lançamento de receita
- [ ] Criar lançamento de despesa
- [ ] Editar lançamento existente
- [ ] Excluir lançamento
- [ ] Filtrar por mês/ano
- [ ] Gerar extrato PDF
- [ ] Ver alertas de cartões

### Agendamentos
- [ ] Adicionar cliente à fila de espera
- [ ] Atualizar status na fila
- [ ] Enviar notificação manual
- [ ] Configurar notificações automáticas

### Ambulantes
- [ ] Visualizar catálogo
- [ ] Buscar produtos
- [ ] Adicionar ao carrinho
- [ ] Finalizar pedido via WhatsApp
- [ ] Avaliar ambulante

### Multi-Cidade
- [ ] Selecionar cidade
- [ ] Filtrar usuários por tipo/status
- [ ] Bloquear/desbloquear usuário
- [ ] Ver relatórios comparativos
- [ ] Ver gráficos de evolução

### Academia
- [ ] Cadastrar perfil do aluno (nome, peso, altura, metas)
- [ ] Selecionar objetivo (emagrecer, hipertrofia, condicionamento, saúde)
- [ ] Configurar frequência semanal desejada
- [ ] Selecionar nível (iniciante, intermediário, avançado)
- [ ] Testar geo-referência para check-in automático
- [ ] Verificar notificações de check-in/check-out
- [ ] Acompanhar treinos guiados
- [ ] Ver progresso em relação às metas
- [ ] Ver histórico de conquistas

### Admin Serviço com Agendamento
- [ ] Criar usuário com role "servico_agendamento" para teste
- [ ] Acessar painel admin em /admin-servico
- [ ] Criar produto/serviço no catálogo
- [ ] Publicar produto no catálogo
- [ ] Responder mensagem de cliente
- [ ] Criar tarefa para equipe
- [ ] Concluir tarefa
- [ ] Ver extrato por período (hoje, mês, personalizado)
- [ ] Verificar produto na busca inteligente da home

### Sistema de Planos
- [ ] Acessar página de planos em /planos
- [ ] Verificar planos de Academia (grátis e pago)
- [ ] Verificar planos de Serviço com Agendamento (básico e premium)
- [ ] Assinar plano com cadastro (CPF/CNPJ, endereço, localizador)
- [ ] Verificar plano ativo na home
- [ ] Verificar card de gestão para usuários com planos de gestão
- [ ] Acessar admin master em /admin-master/planos
- [ ] Configurar preços dos planos
- [ ] Ativar/desativar planos

---

## 🚀 Preparação para Deploy

### 1. Verificar Variáveis de Ambiente

#### Ambiente Local (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Ambiente Produção (.env.production)
Atualize o arquivo `.env.production` com as credenciais reais:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key_here
NEXT_PUBLIC_APP_URL=https://valenteconecta.com.br
```

### 2. Configurar Supabase Client Switch

Antes do deploy, altere o arquivo `lib/supabase-client-switch.ts` para usar dados reais:
```typescript
export const USE_MOCK = false
```

### 3. Build de Produção
```bash
npm run build
```

### 4. Deploy na Vercel

#### Deploy via CLI
```bash
vercel --prod
```

#### Deploy via Vercel Dashboard
1. Acesse [vercel.com](https://vercel.com)
2. Conecte o repositório GitHub
3. Configure as variáveis de ambiente no painel da Vercel
4. Clique em "Deploy"

### 5. Verificar após Deploy
- [ ] Testar todas as rotas principais
- [ ] Verificar integração com Supabase
- [ ] Testar funcionalidades core (financeiro, agendamentos, ambulantes)
- [ ] Verificar performance de carregamento
- [ ] Testar responsividade mobile
- [ ] Verificar logs de erros no dashboard Vercel

### 6. Configurações Específicas

#### Vercel Regions
O projeto está configurado para usar a região `gru1` (São Paulo) no arquivo `vercel.json`.

#### Domínio Personalizado
O domínio `valenteconecta.com.br` deve estar configurado nas configurações do projeto na Vercel.

---

## 📞 Suporte

Em caso de problemas durante os testes locais:
1. Verifique se o servidor está rodando na porta 3000
2. Verifique as variáveis de ambiente
3. Verifique o console do navegador para erros
4. Verifique o terminal para erros de build

Em caso de problemas no deploy:
1. Verifique as variáveis de ambiente na Vercel
2. Verifique os logs de build no dashboard Vercel
3. Verifique a conexão com Supabase
4. Verifique se `USE_MOCK` está definido como `false`
