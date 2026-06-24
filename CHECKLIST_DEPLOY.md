# 📋 CHECKLIST - DEPLOY VERCEL

## ✅ Correções Implementadas (24/06/2026)

### 1. **Problema: Múltiplos Pop-ups ao Carregar**
- ✅ Removido auto-dismiss de notificações em `PushSubscriptionManager.tsx`
- ✅ Consolidada notificação única em `BuscaInteligente.tsx`
- ✅ Adicionada flag para evitar duplicatas em `page.tsx`
- ✅ Simplificado popup de notificações com localStorage

### 2. **Arquivos de Build**
- ✅ `vercel.json` criado com configurações otimizadas
- ✅ `DEPLOY_VERCEL.md` - Guia completo de deploy
- ✅ `prepare-deploy.sh` - Script automático (Linux/Mac)
- ✅ `prepare-deploy.ps1` - Script automático (Windows)

### 3. **Validações TypeScript**
- ✅ Sem erros em: `app/page.tsx`
- ✅ Sem erros em: `components/PushSubscriptionManager.tsx`
- ✅ Sem erros em: `components/busca/BuscaInteligente.tsx`

---

## 🚀 Passos para Deploy Vercel

### Passo 1: Preparar Ambiente Local
```bash
# Windows PowerShell
.\prepare-deploy.ps1

# Linux/Mac
bash prepare-deploy.sh
```

### Passo 2: Configurar Variáveis de Ambiente
```bash
# Copiar template
cp .env.example .env.local

# Preencher valores:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - DATABASE_URL
# - NEXT_PUBLIC_VAPID_PUBLIC_KEY
# - VAPID_PRIVATE_KEY
# - NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
# - MERCADOPAGO_ACCESS_TOKEN
# - TELEGRAM_BOT_TOKEN
# - TELEGRAM_CHANNEL_ID
```

### Passo 3: Fazer Commit
```bash
git add .
git commit -m "Deploy: Correção de pop-ups e preparação Vercel (24/06/2026)"
git push origin main
```

### Passo 4: Deploy no Vercel
```bash
# Opção A: Automático (GitHub)
# Vercel detectará push e iniciará build automaticamente

# Opção B: CLI (se preferir)
npm install -g vercel
vercel --prod
```

---

## 📊 Verificação Pré-Deploy

| Item | Status | Arquivo |
|------|--------|---------|
| Build sem erros | ✅ | Testar: `npm run build` |
| Pop-ups consolidados | ✅ | `PushSubscriptionManager.tsx` |
| Notificações única | ✅ | `BuscaInteligente.tsx` |
| Popup deduplica | ✅ | `page.tsx` |
| Config Vercel | ✅ | `vercel.json` |
| Variáveis setup | ⏳ | Dashboard Vercel |
| Domínio customizado | ⏳ | `valente-conecta.clic.com.br` |

---

## 📝 Checklist Rápido

- [ ] Executar `prepare-deploy.ps1` (Windows) ou `prepare-deploy.sh` (Linux)
- [ ] Preencher `.env.local` com variáveis de produção
- [ ] Testar build localmente: `npm run build`
- [ ] Fazer commit: `git commit -m "Deploy..."`
- [ ] Push: `git push origin main`
- [ ] Aguardar build automático no Vercel
- [ ] Verificar: https://vercel.com/dashboard/valente-conecta
- [ ] Testar: https://valenteconecta-pied.vercel.app
- [ ] Apontar domínio customizado (opcional)

---

## 🔧 Troubleshooting

### Build Failed?
```bash
# Limpar cache
rm -r node_modules .next
npm install
npm run build
```

### Variáveis não reconhecidas?
- Verificar spelling (case-sensitive)
- Reconfigurar no Dashboard Vercel
- Redeploy

### API retorna 500?
- Verificar DATABASE_URL
- Verificar CORS no Supabase
- Ver logs: `vercel logs --prod`

---

## 📞 Suporte

- **Vercel**: https://vercel.com/support
- **Docs**: https://vercel.com/docs
- **Status**: https://vercel-status.com

---

## 🎯 URLs Após Deploy

| Ambiente | URL | Status |
|----------|-----|--------|
| Production | https://valenteconecta-pied.vercel.app | ⏳ Deploy |
| Custom | https://valente-conecta.clic.com.br | ⏳ DNS |
| Local | http://localhost:3000 | ✅ Dev |

---

**Última Atualização**: 24/06/2026
**Versão**: 2.0+
**Status**: ✅ Pronto para Deploy
