# DEPLOY VERCEL - INSTRUÇÕES COMPLETAS

## 📋 Pré-requisitos

1. **Conta no Vercel**: https://vercel.com (usar GitHub para login)
2. **Repositório GitHub**: Já deve estar conectado
3. **Variáveis de ambiente** configuradas

---

## 🚀 Passo 1: Preparar Variáveis de Ambiente

### No seu `.env.local` (desenvolvimento):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=seu-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui

# Database (se usar PostgreSQL direto)
DATABASE_URL=postgresql://user:password@host:port/db

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua-chave-publica
VAPID_PRIVATE_KEY=sua-chave-privada

# Mercado Pago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=sua-chave-publica
MERCADOPAGO_ACCESS_TOKEN=seu-token-de-acesso

# Telegram Bot
TELEGRAM_BOT_TOKEN=seu-token-aqui
TELEGRAM_CHANNEL_ID=seu-canal-aqui

# Outros
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

### Criar `.env.example` (sem valores sensíveis):
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_ACCESS_TOKEN=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=
NEXT_PUBLIC_SITE_URL=
NODE_ENV=
```

---

## 🔐 Passo 2: Configurar no Vercel Dashboard

### 2.1 Conectar Repositório
1. Ir em https://vercel.com/dashboard
2. Clique em "Add New" → "Project"
3. Selecione seu repositório GitHub: `frutapurapoupas/valente-conecta`
4. Clique em "Import"

### 2.2 Configurar Build Settings
Na tela de configuração:

**Framework Preset**: Next.js ✅ (auto-detectado)

**Build Command**: 
```bash
npm run build
```

**Output Directory**: `.next` ✅ (auto-preenchido)

**Install Command**:
```bash
npm install
```

### 2.3 Adicionar Variáveis de Ambiente
1. Clique na aba "Environment Variables"
2. Adicione cada variável:

| Variável | Valor | Escopo |
|----------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Cole do Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cole do Supabase | Production, Preview, Development |
| `DATABASE_URL` | Sua conexão PostgreSQL | Production |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Sua chave pública | Production, Preview, Development |
| `VAPID_PRIVATE_KEY` | Sua chave privada | Production |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Chave pública MP | Production, Preview, Development |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acesso MP | Production |
| `TELEGRAM_BOT_TOKEN` | Token do bot | Production |
| `TELEGRAM_CHANNEL_ID` | ID do canal | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://seu-dominio.com` | Production |
| `NODE_ENV` | `production` | Production |

### 2.4 Configurar Domínio Customizado
1. Clique em "Settings" → "Domains"
2. Remova o domínio padrão (valente-conecta.vercel.app) se quiser
3. Adicione seu domínio customizado: `valente-conecta.clic.com.br`
4. Configure DNS conforme instruções Vercel

---

## 🔄 Passo 3: Deploy Automático

### Opção A: Git Push (Recomendado)
```bash
# No seu terminal local
git add .
git commit -m "Deploy: Correção de pop-ups e preparação Vercel"
git push origin main
```

✅ Vercel detectará automaticamente e iniciará build

### Opção B: Deploy via Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

---

## ✅ Checklist Pré-Deploy

- [ ] Arquivo `vercel.json` criado ✅
- [ ] Variáveis de ambiente configuradas
- [ ] `.env.example` criado
- [ ] Nenhum erro em `npm run build` local
- [ ] Domínio customizado configurado (opcional)
- [ ] CORS configurado no Supabase/Backend
- [ ] SSL/HTTPS ativado (automático no Vercel)

---

## 🧪 Testar Build Localmente

Antes de fazer push:

```bash
# Build
npm run build

# Se houver erros, corrigir aqui

# Testar versão production
npm run start
```

---

## 📊 Monitorar Deploy

1. Acesse https://vercel.com/dashboard
2. Clique no projeto `valente-conecta`
3. Veja logs em "Deployments"
4. Confira "Analytics" para performance

---

## 🔍 Verificar Errors Comuns

### Build Failed?
```bash
# Verificar logs
vercel logs --prod

# Erro de módulo não encontrado
npm install

# Limpar cache
rm -rf node_modules .next
npm install
npm run build
```

### Variável de ambiente não reconhecida?
- Verificar spelling exato (case-sensitive)
- Certificar que está no escopo correto
- Redeploy após alterar

### API retorna 500?
- Verificar DATABASE_URL está correto
- Verificar CORS no Supabase
- Verificar credenciais Mercado Pago
- Ver logs do Vercel

---

## 🚀 URLs Após Deploy

| Ambiente | URL |
|----------|-----|
| Production | https://valente-conecta.clic.com.br |
| Preview | https://valente-conecta-[hash].vercel.app |
| Local | http://localhost:3000 |

---

## 📞 Suporte Vercel

- Docs: https://vercel.com/docs
- Community: https://vercel.com/support
- Status: https://vercel-status.com

---

## 🎯 Próximos Passos

1. **Após primeiro deploy bem-sucedido**:
   - Testar todas as rotas
   - Verificar notificações push
   - Testar pagamentos (mode test)
   - Validar performance

2. **Configurar CI/CD**:
   - Enable Preview deployments
   - Configure automatic deploys

3. **Monitorar em produção**:
   - Sentry para error tracking
   - LogRocket para user sessions
   - Vercel Analytics para performance

---

## 💡 Dicas

- Usar `revalidate` em rotas estáticas para cache
- ISR (Incremental Static Regeneration) para dashboard
- Edge Middleware para autenticação
- Serverless Functions com timeout de 300s

---

**Status**: ✅ Pronto para deploy!
**Data**: 24/06/2026
**Versão**: 2.0+
