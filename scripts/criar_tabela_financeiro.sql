-- Criar tabela financeiro
CREATE TABLE IF NOT EXISTS financeiro (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  descricao TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('receita', 'despesa')),
  valor DECIMAL(10,2) NOT NULL,
  categoria TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_financeiro_data ON financeiro(data);
CREATE INDEX IF NOT EXISTS idx_financeiro_tipo ON financeiro(tipo);
CREATE INDEX IF NOT EXISTS idx_financeiro_status ON financeiro(status);

-- Inserir dados de exemplo
INSERT INTO financeiro (data, descricao, tipo, valor, categoria, status)
VALUES 
  (NOW(), 'Venda do dia', 'receita', 150.00, 'Vendas', 'confirmado'),
  (NOW() - INTERVAL '1 day', 'Compra de ingredientes', 'despesa', 45.50, 'Compras', 'confirmado'),
  (NOW() - INTERVAL '2 days', 'Pagamento de fornecedor', 'despesa', 120.00, 'Fornecedores', 'pendente')
ON CONFLICT DO NOTHING;
