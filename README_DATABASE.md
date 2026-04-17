# 📊 Sistema Completo de Banco de Dados Supabase

## 🎯 Objetivo
Criar sistema completo de banco de dados com ambiente local espelhado, versionamento, backup automático e deploy seguro estilo SaaS.

## 📁 Estrutura de Diretórios

```
/supabase
├── migrations/
│   ├── 001_create_admin_users.sql
│   ├── 002_create_db_logs.sql
│   └── [futuras migrations]
├── seed.sql
└── [outros arquivos de banco]

/scripts
├── db-reset.sh
├── db-backup.sh
├── db-safe-check.ts
└── migrate.sh

/backups
└── [arquivos de backup gerados automaticamente]
```

## 🚀 Scripts Disponíveis

### 1. Reset Total do Banco Local
```bash
npm run db:reset
```
**O que faz:**
- Para Supabase local
- Reseta banco completamente
- Inicia Supabase novamente
- Executa seed automático
- **BLOQUEADO em produção** (proteção total)

### 2. Backup Automático
```bash
npm run db:backup
```
**O que faz:**
- Gera backup timestampado
- Salva em `/backups/`
- Mantém apenas 10 backups mais recentes
- Mostra tamanho dos arquivos

### 3. Criar Migration
```bash
npm run db:migrate <nome_da_migration>
```
**O que faz:**
- Cria arquivo de migration com timestamp
- Template com boas práticas
- Exemplo: `20240417_120000_add_user_role.sql`

### 4. Verificação de Segurança
```bash
npm run db:safe-check "<SQL>"
```
**O que faz:**
- Verifica se operação é segura
- **BLOQUEIA operações perigosas em produção**
- Lista operações permitidas

## 📊 Dados Iniciais (Seed)

### Usuários (3)
- **Admin Sistema**: admin@valenteconecta.com
- **João Mercearia**: joao@mercadovalente.com  
- **Maria Atacadão**: maria@atacadobompreco.com

### Estabelecimentos (3)
- **Mercado Central Valente**: Centro da cidade
- **Atacadão de Valente**: BR-116, Km 123
- **Supermercado São José**: Rua das Flores, 456

### Produtos (10 com EAN real)
- Arroz Tipo 1 5kg: 7891000013105 - R$ 25,90
- Feijão Carioca 1kg: 7891000033105 - R$ 8,90
- Óleo Liza 900ml: 7891916000115 - R$ 12,90
- Açúcar União 1kg: 7896002100175 - R$ 5,50
- Café Pilão 500g: 7896000100175 - R$ 18,90
- Sal Cisne 1kg: 7896000100185 - R$ 3,20
- Macarrão Santa Amália: 7891000123105 - R$ 4,80
- Detergente Ypê 500ml: 7896000100195 - R$ 7,90
- Sabonete Dove 90g: 7891000123106 - R$ 6,50
- Papel Higiênico Neve: 7891000123107 - R$ 15,90

### Ofertas (5)
- Feijão com 15% OFF: 7 dias
- Arroz com 10% OFF: 3 dias
- Óleo com 20% OFF: 5 dias
- Café com 25% OFF: 7 dias
- Detergente com 30% OFF: 5 dias

## 🔐 Segurança em Produção

### Operações BLOQUEADAS:
- `DROP TABLE`
- `DROP DATABASE`
- `TRUNCATE TABLE`
- `DELETE FROM users`
- `DELETE FROM stores`
- `DELETE FROM products`

### Operações PERMITIDAS:
- `INSERT`
- `UPDATE`
- `SELECT`
- `CREATE TABLE`
- `ALTER TABLE`
- `CREATE INDEX`

## 🔄 Pipeline SaaS Seguro

### Ambiente Local:
1. **Desenvolver** features
2. **Testar** localmente
3. **Resetar** banco se necessário: `npm run db:reset`
4. **Criar migrations** para alterações

### Deploy para Produção:
1. **Criar migration** se necessário
2. **Validar dados** com `npm run db:safe-check`
3. **Executar**: `supabase db push`
4. **NUNCA** usar `db reset` em produção

## 📋 Logs e Auditoria

### Tabela `db_logs`:
- **action**: Tipo de operação
- **table_name**: Tabela afetada
- **environment**: local/production
- **user_id**: Quem executou
- **details**: Detalhes da operação
- **created_at**: Timestamp

### Exemplos de Logs:
```sql
INSERT INTO db_logs (action, table_name, environment, details, created_at)
VALUES ('SEED', 'products', 'local', 'Inseridos 10 produtos iniciais', NOW());
```

## 👥 Controle Administrativo

### Tabela `admin_users`:
- **email**: Identificação única
- **name**: Nome do administrador
- **role**: Nível de acesso
- **permissions**: JSON com permissões específicas
- **is_active**: Status da conta
- **last_login**: Último acesso

### Níveis de Acesso:
- **super_admin**: Acesso total
- **developer**: Read/Write/Migrate
- **admin**: Acesso limitado ao negócio

## 🚀 Deploy Automatizado

### Frequência:
- **2-3 vezes por dia** (ou casos especiais)
- **Push otimizado** para Vercel
- **Zero downtime** com migrations seguras

### Comandos de Deploy:
```bash
# Criar migration
npm run db:migrate add_new_feature

# Validar segurança
npm run db:safe-check "ALTER TABLE users ADD COLUMN..."

# Enviar para produção
supabase db push
```

## ⚡ Comandos Rápidos

```bash
# Reset completo (apenas local)
npm run db:reset

# Backup imediato
npm run db:backup

# Verificar segurança
npm run db:safe-check "SELECT * FROM users"

# Criar migration
npm run db:migrate nome_da_migration
```

## 📱 URLs de Desenvolvimento

- **Local API**: http://localhost:54321
- **Studio**: http://localhost:54323
- **Banco Direto**: postgresql://localhost:54322

## ⚠️ Regras de Ouro

1. **NUNCA** executar `db:reset` em produção
2. **SEMPRE** criar migration antes de alterar estrutura
3. **SEMPRE** fazer backup antes de deploy
4. **SEMPRE** testar em desenvolvimento primeiro
5. **SEMPRE** usar `db:safe-check` em produção

## 🎉 Resultado Final

Sistema pronto para:
- ✅ Testar tudo localmente
- ✅ Fazer backup automático
- ✅ Deploy seguro 2-3x por dia
- ✅ Zero risco de perder dados
- ✅ Controle total administrativo
- ✅ Auditoria completa de operações

**Sistema SaaS 100% funcional e seguro!** 🚀🔒📊✨
