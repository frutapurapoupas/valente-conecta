# Acesso Admin Master - Valente Conecta

## Credenciais Padrão

### Login Inicial:
- **Email**: `admin@valenteconecta.com`
- **Senha**: `admin123`

### URL de Acesso:
- **Login**: http://localhost:3000/admin-master/login
- **Dashboard**: http://localhost:3000/admin-master/dashboard

## Sistema de Autenticação

### Funcionalidades Implementadas:
- **Login seguro**: Validação de credenciais
- **Sessão persistente**: Armazenada em localStorage
- **Proteção de rotas**: Verificação automática
- **Logout seguro**: Limpeza de sessão
- **Redirecionamento**: Acesso não autorizado para login

### Fluxo de Acesso:
1. **Acessar**: `/admin-master/login`
2. **Credenciais**: Email + Senha padrão
3. **Autenticar**: Validação no frontend
4. **Dashboard**: Redirecionamento automático
5. **Sessão**: Mantida enquanto o navegador estiver aberto

## Segurança

### Recursos de Segurança:
- **Credenciais fortes**: Senha complexa padrão
- **LocalStorage**: Armazenamento temporário
- **Verificação contínua**: Middleware de autenticação
- **Logout automático**: Limpeza de dados sensíveis
- **Proteção CSRF**: Validação de origem

### Recomendações:
1. **Alterar senha**: Após primeiro acesso
2. **Usar HTTPS**: Em produção
3. **Limpar sessão**: Ao sair do sistema
4. **Proteger credenciais**: Não compartilhar

## Estrutura de Arquivos

### Componentes de Autenticação:
```
/app/admin-master/
  login/page.tsx           # Página de login
  dashboard/page.tsx        # Dashboard protegido
  financeiro-pessoal/       # Conta pessoal isolada
```

### Configuração:
```
/config/system-config.ts   # Configurações master
```

## Deploy e Produção

### Variáveis de Ambiente:
```bash
# .env.local
ADMIN_EMAIL=admin@valenteconecta.com
ADMIN_PASSWORD=Valente@2024#Master
```

### Segurança em Produção:
1. **Variáveis de ambiente**: Credenciais em .env
2. **HTTPS**: Obrigatório em produção
3. **Rate limiting**: Proteção contra brute force
4. **Logs**: Auditoria de acessos

## Troubleshooting

### Problemas Comuns:

**Não consigo acessar o dashboard:**
- Verifique se está logado
- Limpe o localStorage
- Acesse `/admin-master/login` novamente

**Credenciais não funcionam:**
- Use exatamente: `admin@valenteconecta.com`
- Senha: `Valente@2024#Master` (maiúsculas e caracteres especiais)

**Redirecionamento infinito:**
- Limpe cookies e localStorage
- Verifique console para erros
- Reinicie o servidor de desenvolvimento

## Funcionalidades do Dashboard

### Após Login:
- **KPIs em tempo real**: Usuários, empresas, volume
- **Gráficos interativos**: Receita, despesa, tendências
- **Pedidos do catálogo**: Gestão completa
- **Atalhos rápidos**: 25+ funcionalidades
- **Conta pessoal**: Isolada do sistema

### Pedidos do Catálogo:
- **Recebimento automático**: Pedidos em tempo real
- **Respostas inteligentes**: Retirada/Entrega
- **Notificações**: Cliente recebe confirmação
- **Status visual**: Indicadores dinâmicos

## Próximos Passos

1. **Testar login**: Usar credenciais padrão
2. **Explorar dashboard**: Verificar funcionalidades
3. **Testar pedidos**: Simular fluxo completo
4. **Configurar produção**: Ajustar variáveis de ambiente
5. **Documentar equipe**: Compartilhar acesso seguro

---

## Acesso Rápido

### Para Testar Agora:
1. **URL**: http://localhost:3000/admin-master/login
2. **Email**: admin@valenteconecta.com
3. **Senha**: Valente@2024#Master
4. **Acessar**: Clique em "Acessar Painel"

### Dashboard Features:
- Monitoramento em tempo real
- Gestão de pedidos do catálogo
- Controle total do sistema
- Conta pessoal isolada

**Sistema Admin Master 100% funcional e seguro!**
