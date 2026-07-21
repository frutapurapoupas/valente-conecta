
# 📊 RELATÓRIO DE AUDITORIA UI x LÓGICA
# Módulo Cozinha - Valente Conecta
# Data: 16/07/2026 15:42

---

## 📋 RESUMO GERAL

| Métrica | Valor |
|---------|-------|
| **Total de arquivos analisados** | 18 |
| **Páginas** | 9 |
| **Componentes** | 0 |
| **Hooks** | 0 |
| **Services** | 5 |
| **APIs** | 4 |
| **Violações encontradas** | 6 |
| **Nota Geral** | 8.1/10 |

---

## 🚨 ARQUIVOS COM VIOLAÇÕES

### 📄 page.tsx
- **Tipo:** Page
- **Linhas:** 80
- **Nota:** 5/10
**Violações:**
  - ⚠️ PAGE_ACCESS_DB: Página acessa banco de dados diretamente

### 📄 page.tsx
- **Tipo:** Page
- **Linhas:** 642
- **Nota:** 1/10
**Violações:**
  - ⚠️ PAGE_ACCESS_DB: Página acessa banco de dados diretamente

### 📄 page.tsx
- **Tipo:** Page
- **Linhas:** 195
- **Nota:** 5/10
**Violações:**
  - ⚠️ PAGE_ACCESS_DB: Página acessa banco de dados diretamente

### 📄 page.tsx
- **Tipo:** Page
- **Linhas:** 307
- **Nota:** 5/10
**Violações:**
  - ⚠️ PAGE_ACCESS_DB: Página acessa banco de dados diretamente

### 📄 page.tsx
- **Tipo:** Page
- **Linhas:** 67
- **Nota:** 5/10
**Violações:**
  - ⚠️ PAGE_ACCESS_DB: Página acessa banco de dados diretamente

### 📄 page.tsx
- **Tipo:** Page
- **Linhas:** 71
- **Nota:** 5/10
**Violações:**
  - ⚠️ PAGE_ACCESS_DB: Página acessa banco de dados diretamente

---

## 📋 ARQUIVOS PARA REFATORAR

### 🔴 PRIORIDADE ALTA

- 📄 page.tsx - PAGE_ACCESS_DB: Página acessa banco de dados diretamente
- 📄 page.tsx - PAGE_ACCESS_DB: Página acessa banco de dados diretamente
- 📄 page.tsx - PAGE_ACCESS_DB: Página acessa banco de dados diretamente
- 📄 page.tsx - PAGE_ACCESS_DB: Página acessa banco de dados diretamente
- 📄 page.tsx - PAGE_ACCESS_DB: Página acessa banco de dados diretamente
- 📄 page.tsx - PAGE_ACCESS_DB: Página acessa banco de dados diretamente
### 🟡 PRIORIDADE MÉDIA

- 📄 page.tsx - 458 linhas
- 📄 page.tsx - 307 linhas
### 🟢 PRIORIDADE BAIXA

✅ Nenhum arquivo com prioridade baixa.

---

## ✅ RESUMO FINAL

- **Arquivos analisados:** 18
- **Violações encontradas:** 6
- **Nota geral:** 8.1/10
- **Status:** ✅ Arquitetura saudável

---
*Relatório gerado automaticamente pelo AUDITOR_UI_LOGICA_COZINHA.ps1*
