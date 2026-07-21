-- Migration: Criar tabela financeiro
-- Data: 2026-07-16

CREATE TABLE IF NOT EXISTS financeiro (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  data TEXT NOT NULL DEFAULT (datetime('now')),
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  valor REAL NOT NULL,
  categoria TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Inserir dados iniciais
INSERT OR IGNORE INTO financeiro (data, descricao, tipo, valor, categoria, status)
VALUES 
  (datetime('now'), 'Venda do dia', 'receita', 150.00, 'Vendas', 'confirmado'),
  (datetime('now', '-1 day'), 'Compra de ingredientes', 'despesa', 45.50, 'Compras', 'confirmado'),
  (datetime('now', '-2 days'), 'Pagamento de fornecedor', 'despesa', 120.00, 'Fornecedores', 'pendente');
