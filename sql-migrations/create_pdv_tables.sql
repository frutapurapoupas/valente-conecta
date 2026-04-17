-- Migração para criar tabelas do PDV Colaborativo
-- Execute no Supabase SQL Editor

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  ean TEXT UNIQUE, -- Código de barras EAN
  preco DECIMAL(10,2),
  imagem TEXT,
  estoque INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'pendente_validacao', 'inativo')),
  loja_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos pendentes (para validação)
CREATE TABLE IF NOT EXISTS produtos_pendentes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_digitado TEXT NOT NULL,
  ean TEXT,
  usuario_id TEXT NOT NULL,
  loja_id TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id TEXT NOT NULL,
  usuario_id TEXT NOT NULL,
  itens JSONB NOT NULL, -- Array de itens da venda
  total DECIMAL(10,2) NOT NULL,
  forma_pagamento TEXT NOT NULL,
  cliente_nome TEXT,
  cliente_telefone TEXT,
  status TEXT DEFAULT 'confirmada' CHECK (status IN ('pendente', 'confirmada', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
  tipo_movimentacao TEXT NOT NULL CHECK (tipo_movimentacao IN ('venda', 'compra', 'ajuste', 'perda')),
  quantidade INTEGER NOT NULL,
  motivo TEXT,
  usuario_id TEXT NOT NULL,
  venda_id UUID REFERENCES vendas(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_ean ON produtos(ean);
CREATE INDEX IF NOT EXISTS idx_produtos_loja_status ON produtos(loja_id, status);
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos USING gin(to_tsvector('portuguese', nome));
CREATE INDEX IF NOT EXISTS idx_vendas_loja_data ON vendas(loja_id, created_at);
CREATE INDEX IF NOT EXISTS idx_vendas_usuario ON vendas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_produtos_pendentes_status ON produtos_pendentes(status);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto ON movimentacoes_estoque(produto_id);

-- Function para atualizar estoque automaticamente
CREATE OR REPLACE FUNCTION atualizar_estoque(p_produto_id UUID, p_quantidade INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE produtos 
  SET estoque = estoque - p_quantidade,
      updated_at = NOW()
  WHERE id = p_produto_id;
  
  -- Registrar movimentação
  INSERT INTO movimentacoes_estoque (produto_id, tipo_movimentacao, quantidade, usuario_id, motivo)
  VALUES (p_produto_id, 'venda', p_quantidade, 'system', 'Venda automática');
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger às tabelas
CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON produtos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendas_updated_at
  BEFORE UPDATE ON vendas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança (RLS)
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos_pendentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

-- Políticas para produtos
CREATE POLICY "Produtos visíveis para todos" ON produtos
  FOR SELECT USING (status = 'ativo');

CREATE POLICY "Usuários podem inserir produtos pendentes" ON produtos
  FOR INSERT WITH CHECK (status = 'pendente_validacao');

CREATE POLICY "Admins podem gerenciar produtos" ON produtos
  FOR ALL USING (
    -- Adicionar lógica para verificar se é admin
    true -- Temporário, ajustar conforme sistema de autenticação
  );

-- Políticas para produtos pendentes
CREATE POLICY "Usuários podem ver seus produtos pendentes" ON produtos_pendentes
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem inserir produtos pendentes" ON produtos_pendentes
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- Políticas para vendas
CREATE POLICY "Usuários podem ver vendas da loja" ON vendas
  FOR SELECT USING (loja_id = 'loja_temp'); -- Ajustar conforme lógica de negócio

CREATE POLICY "Usuários podem inserir vendas" ON vendas
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- Políticas para movimentações
CREATE POLICY "Movimentações visíveis para usuários da loja" ON movimentacoes_estoque
  FOR SELECT USING (true); -- Ajustar conforme lógica de negócio

-- Inserir alguns dados de exemplo
INSERT INTO produtos (nome, ean, preco, estoque, loja_id) VALUES
('Arroz 5kg', '7891234567890', 25.50, 50, 'loja_temp'),
('Feijão 1kg', '7891234567891', 8.90, 100, 'loja_temp'),
('Óleo de Soja 900ml', '7891234567892', 7.50, 30, 'loja_temp'),
('Açúcar 1kg', '7891234567893', 5.20, 80, 'loja_temp'),
('Café 500g', '7891234567894', 15.80, 40, 'loja_temp')
ON CONFLICT (ean) DO NOTHING;

-- Criar view para vendas do dia
CREATE OR REPLACE VIEW vendas_do_dia AS
SELECT 
  v.*,
  EXTRACT(HOUR FROM v.created_at) as hora,
  COUNT(vi.*) as total_itens
FROM vendas v
WHERE DATE(v.created_at) = CURRENT_DATE
  AND v.status = 'confirmada'
GROUP BY v.id, EXTRACT(HOUR FROM v.created_at)
ORDER BY v.created_at DESC;

-- Comentários para documentação
COMMENT ON TABLE produtos IS 'Produtos cadastrados no sistema PDV';
COMMENT ON TABLE produtos_pendentes IS 'Produtos aguardando validação do admin';
COMMENT ON TABLE vendas IS 'Registros de vendas realizadas';
COMMENT ON TABLE movimentacoes_estoque IS 'Controle de movimentações de estoque';
