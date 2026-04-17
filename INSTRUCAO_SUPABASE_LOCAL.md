# Configuração do Supabase Local

## Status Atual
- Docker Desktop não está rodando
- Supabase local não está disponível
- Sistema está operando em modo MOCK para testes

## Para Usar Supabase Local

### 1. Iniciar Docker Desktop
- Abra o Docker Desktop
- Aguarde o serviço iniciar completamente

### 2. Iniciar Supabase Local
```bash
# No diretório do projeto
supabase start
```

### 3. Configurar Variáveis de Ambiente
Crie/edite `.env.local` com:
```env
# Supabase Local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Aplicar Migrations
```bash
# Aplicar todas as migrations
supabase db push
```

### 5. Voltar para Modo Produção
Mudar os imports nos arquivos:
- `app/indicar-loja/page.tsx`: linha 5
- Mudar de `@/hooks/useReferralSystem.mock` para `@/hooks/useReferralSystem`

### 6. Reiniciar Servidor
```bash
# Parar (Ctrl+C) e reiniciar
npm run dev
```

## Comandos Úteis

```bash
# Verificar status
supabase status

# Ver logs
supabase logs

# Parar serviços
supabase stop

# Reset completo
supabase db reset
```

## Estrutura do Banco

Quando o Supabase local estiver rodando, as seguintes tabelas estarão disponíveis:
- `referrals` - Indicações de lojas
- `user_wallets` - Carteiras dos usuários
- `notifications` - Notificações do sistema
- `stores` - Lojas cadastradas
- `store_invites` - Convites pendentes

## Testes

### Modo MOCK (Atual)
- Funciona sem Docker
- Dados simulados
- Para testes de UI/UX

### Modo Supabase Local
- Requer Docker rodando
- Dados reais
- Para testes completos de integração

## Problemas Comuns

1. **Docker não inicia**: Verifique se o Docker Desktop está instalado e rodando
2. **Porta em uso**: `supabase stop` e depois `supabase start`
3. **Permissões negadas**: Verifique as políticas RLS nas migrations
4. **Migrations não aplicadas**: Use `supabase db push`

## Links Úteis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Documentação Local Development](https://supabase.com/docs/guides/local-development)
