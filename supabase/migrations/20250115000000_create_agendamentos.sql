-- Supabase Migration: Sistema de Agendamentos
-- Execute no SQL Editor do Supabase

-- Tabela de Profissionais
CREATE TABLE IF NOT EXISTS profissionais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  nome VARCHAR(255) NOT NULL,
  nome_loja VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  descricao TEXT,
  foto TEXT,
  endereco TEXT NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  latitude FLOAT,
  longitude FLOAT,
  plano VARCHAR(20) DEFAULT 'FREE',
  plano_expiracao TIMESTAMP,
  contato_bloqueado BOOLEAN DEFAULT TRUE,
  localizador_bloqueado BOOLEAN DEFAULT TRUE,
  ativar_fila_espera BOOLEAN DEFAULT FALSE,
  ativar_periodicidade BOOLEAN DEFAULT FALSE,
  periodicidade_dias INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  duracao INT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  foto TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
  ean VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  quantidade INT DEFAULT 0,
  data_validade DATE,
  foto TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES servicos(id),
  cliente_id UUID,
  cliente_nome VARCHAR(255) NOT NULL,
  cliente_telefone VARCHAR(20) NOT NULL,
  cliente_email VARCHAR(255),
  data DATE NOT NULL,
  horario VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDENTE',
  observacao TEXT,
  posicao_fila INT,
  valor DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Itens de Venda
CREATE TABLE IF NOT EXISTS itens_venda (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL
);

-- Tabela de Funcionários
CREATE TABLE IF NOT EXISTS funcionarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  funcao VARCHAR(100) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
  destino VARCHAR(20) NOT NULL,
  tipo VARCHAR(30) NOT NULL,
  mensagem TEXT NOT NULL,
  enviada BOOLEAN DEFAULT FALSE,
  enviada_em TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_agendamentos_profissional ON agendamentos(profissional_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_produtos_ean ON produtos(ean);
CREATE INDEX idx_produtos_profissional ON produtos(profissional_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profissionais_updated_at 
  BEFORE UPDATE ON profissionais 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at 
  BEFORE UPDATE ON agendamentos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de Segurança RLS
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas: Usuários só veem seus próprios dados
CREATE POLICY profissionais_policy ON profissionais
  USING (auth.uid() = user_id);

CREATE POLICY servicos_policy ON servicos
  USING (profissional_id IN (SELECT id FROM profissionais WHERE user_id = auth.uid()));

CREATE POLICY produtos_policy ON produtos
  USING (profissional_id IN (SELECT id FROM profissionais WHERE user_id = auth.uid()));

CREATE POLICY agendamentos_policy ON agendamentos
  USING (profissional_id IN (SELECT id FROM profissionais WHERE user_id = auth.uid()));