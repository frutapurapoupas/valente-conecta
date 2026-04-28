# 📊 Planilha de Controle - Dados Mockados Academia IA

## 🎯 OBJETIVO
Controlar e desativar dados mockados quando o sistema estiver pronto para produção.

---

## 📋 STATUS DOS DADOS MOCKADOS

### ✅ **Hook IA - useAcademiaIA.ts**
- **Localização:** `hooks/useAcademiaIA.ts`
- **Função:** `carregarDados()`
- **Status:** ⚠️ ATIVO (modo offline)
- **Desativar quando:** Schema SQL executado no Supabase

```typescript
// LINHA 115-140: DADOS MOCKADOS ATIVOS
const perfilSalvo = localStorage.getItem('academia_perfil_ia')

if (perfilSalvo) {
  // ✅ Usa perfil real do cadastro
  setPerfil(JSON.parse(perfilSalvo))
} else {
  // ⚠️ MOCKADO - Desativar quando banco estiver pronto
  const mockPerfil: PerfilAluno = {
    id: 1,
    user_id: 'demo-user',
    nome: 'João Silva',
    // ... dados mockados
  }
}
```

### ✅ **Métricas Mockadas**
- **Localização:** `hooks/useAcademiaIA.ts`
- **Função:** `carregarDados()`
- **Status:** ⚠️ ATIVO
- **Desativar quando:** Integração com sensores funcionando

```typescript
// LINHA 144-164: MÉTRICAS MOCKADAS
const mockMetricas: MetricasDiarias = {
  id: 1,
  member_id: 1,
  passos: 8500,
  distancia_km: 5.2,
  // ... métricas mockadas
}
```

---

## 🔧 **PLANOS DE DESATIVAÇÃO**

### 📅 **Fase 1: Banco de Dados**
- [ ] Executar schema SQL no Supabase
- [ ] Testar conexão com banco real
- [ ] Descomentar código Supabase no hook IA

### 📅 **Fase 2: Sensores**
- [ ] Implementar integração Health Connect
- [ ] Implementar integração Apple HealthKit
- [ ] Remover métricas mockadas

### 📅 **Fase 3: Produção**
- [ ] Remover todos os dados mockados
- [ ] Testar fluxo completo com dados reais
- [ ] Deploy para produção

---

## 🚨 **ALERTAS AUTOMÁTICAS**

### **Quando Desativar:**
1. **Schema SQL executado** ✅
2. **Conexão Supabase funcionando** ✅  
3. **Sensores integrados** ✅
4. **Testes validados** ✅

### **Como Desativar:**
```typescript
// SUBSTITUIR CÓDIGO MOCKADO POR:
const { data: userData } = await supabase.auth.getUser()
if (!userData.user) {
  throw new Error('Usuário não autenticado')
}

// Buscar perfil real do banco
const { data: perfilData } = await supabase
  .from('gym_members')
  .select('*')
  .eq('user_id', userData.user.id)
  .single()
```

---

## 📈 **MÉTRICAS DE MONITORAMENTO**

### **Dados Mockados Atuais:**
- 👤 **Perfil:** João Silva, 78kg → 72kg
- 📊 **Métricas:** 8.500 passos, 7.5h sono
- 🧠 **Score:** 75% (BOM)
- 🏋️ **Plano:** Não gerado inicialmente

### **Dados Reais Esperados:**
- 👤 **Perfil:** Usuário real do cadastro
- 📊 **Métricas:** Sensores Health Connect/HealthKit
- 🧠 **Score:** Calculado com dados reais
- 🏋️ **Plano:** Gerado automaticamente

---

## 🔍 **CHECKLIST DE VALIDAÇÃO**

### **Antes de Desativar:**
- [ ] Schema SQL executado sem erros
- [ ] Tabelas criadas no Supabase
- [ ] Permissões RLS configuradas
- [ ] Conexão Supabase testada
- [ ] Cadastro salvando dados reais
- [ ] Dashboard IA carregando perfil real
- [ ] Sensores coletando dados
- [ ] Score calculado com métricas reais

### **Após Desativar:**
- [ ] Sistema funcionando sem mock
- [ ] Dados persistindo no banco
- [ ] Dashboard IA com dados reais
- [ ] Sem erros no console
- [ ] Performance mantida

---

## 📞 **CONTATO DE SUPORTE**

**Desenvolvedor:** Cascade AI
**Status:** Em desenvolvimento
**Próxima revisão:** Pós-execução schema SQL

---

*Última atualização: 26/04/2026*
*Versão: 1.0.0*
