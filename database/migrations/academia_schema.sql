-- MÓDULO ACADEMIA - SCHEMA SUPABASE
-- Valente Conecta - Sistema Inteligente de Academia

-- Tabela de unidades de academia
CREATE TABLE IF NOT EXISTS gym_units (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  responsavel VARCHAR(255),
  cidade VARCHAR(100) DEFAULT 'Valente-BA',
  contato VARCHAR(20),
  endereco TEXT,
  localizador TEXT, -- URL Google Maps
  alunos INTEGER DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  lat DECIMAL(10, 8), -- Coordenadas GPS
  lng DECIMAL(11, 8),
  raio_metros INTEGER DEFAULT 5, -- Raio para check-in automático
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de perfis de alunos
CREATE TABLE IF NOT EXISTS gym_members (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  foto TEXT,
  whatsapp VARCHAR(20),
  plano VARCHAR(20) DEFAULT 'gratuito' CHECK (plano IN ('gratuito', 'basico')),
  academia_id INTEGER REFERENCES gym_units(id),
  
  -- Dados físicos
  peso_atual DECIMAL(5,2),
  peso_meta DECIMAL(5,2),
  altura INTEGER, -- em cm
  idade INTEGER,
  sexo VARCHAR(10) CHECK (sexo IN ('masculino', 'feminino', 'outro')),
  
  -- Objetivos e nível
  objetivo VARCHAR(20) CHECK (objetivo IN ('emagrecer', 'hipertrofia', 'condicionamento', 'saude')),
  nivel VARCHAR(15) CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
  freq_semanal INTEGER DEFAULT 3, -- meta de treinos por semana
  
  -- Condições especiais
  condicoes_fisicas TEXT[], -- Array de condições médicas
  tipo_exercicio TEXT[], -- Preferências de exercício
  
  -- Controle de ativação
  ativo BOOLEAN DEFAULT true,
  data_inicio DATE DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de métricas diárias (coletada de sensores)
CREATE TABLE IF NOT EXISTS gym_metrics (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES gym_members(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  
  -- Métricas de sensores
  passos INTEGER DEFAULT 0,
  distancia_km DECIMAL(8,2) DEFAULT 0,
  calorias_ativas INTEGER DEFAULT 0,
  calorias_descanso INTEGER DEFAULT 0,
  tempo_ativo_minutos INTEGER DEFAULT 0,
  tempo_sedentario_minutos INTEGER DEFAULT 0,
  
  -- Sono
  sono_horas DECIMAL(4,2),
  sono_qualidade INTEGER CHECK (sono_qualidade BETWEEN 1 AND 5),
  
  -- Frequência cardíaca
  freq_cardiaca_media INTEGER,
  freq_cardiaca_max INTEGER,
  
  -- Check-in automático
  check_in_academia BOOLEAN DEFAULT false,
  check_in_horario TIME,
  tempo_treino_minutos INTEGER DEFAULT 0,
  
  -- Score calculado
  score_recuperacao INTEGER CHECK (score_recuperacao BETWEEN 0 AND 100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(member_id, data)
);

-- Tabela de check-ins (registros de presença)
CREATE TABLE IF NOT EXISTS gym_checkins (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES gym_members(id) ON DELETE CASCADE,
  academia_id INTEGER REFERENCES gym_units(id),
  
  check_in TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out TIMESTAMP WITH TIME ZONE,
  duracao_minutos INTEGER,
  
  -- Dados GPS
  lat_check_in DECIMAL(10, 8),
  lng_check_in DECIMAL(11, 8),
  
  -- Método de registro
  metodo VARCHAR(20) DEFAULT 'automatico' CHECK (metodo IN ('automatico', 'manual', 'qr')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de planos de treino gerados por IA
CREATE TABLE IF NOT EXISTS gym_training_plans (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES gym_members(id) ON DELETE CASCADE,
  
  data_geracao DATE DEFAULT CURRENT_DATE,
  validade_dias INTEGER DEFAULT 7, -- Plano válido por 7 dias
  
  -- Recomendações IA
  intensidade VARCHAR(20) CHECK (intensidade IN ('leve', 'moderado', 'intenso')),
  foco_muscular TEXT[], -- Grupos musculares prioritários
  duracao_minutos INTEGER,
  calorias_estimadas INTEGER,
  
  -- Score de recuperação no momento da geração
  score_recuperacao INTEGER CHECK (score_recuperacao BETWEEN 0 AND 100),
  
  -- Sugestões textuais
  sugestao_principal TEXT,
  sugestao_secundaria TEXT,
  
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de exercícios do plano
CREATE TABLE IF NOT EXISTS gym_training_exercises (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES gym_training_plans(id) ON DELETE CASCADE,
  
  nome_exercicio VARCHAR(255) NOT NULL,
  grupo_muscular VARCHAR(100),
  series INTEGER,
  repeticoes INTEGER,
  carga_kg DECIMAL(5,2),
  descanso_segundos INTEGER,
  
  ordem INTEGER NOT NULL, -- Ordem no treino
  concluido BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de recomendações/alertas inteligentes
CREATE TABLE IF NOT EXISTS gym_recommendations (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES gym_members(id) ON DELETE CASCADE,
  
  tipo VARCHAR(20) CHECK (tipo IN ('treino', 'descanso', 'hidratacao', 'nutricao', 'motivacao', 'alerta')),
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  
  -- Prioridade e urgência
  prioridade VARCHAR(10) CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  
  -- Data/hora de exibição
  data_exibicao DATE,
  hora_exibicao TIME,
  
  -- Controle de visualização
  visualizado BOOLEAN DEFAULT false,
  data_visualizacao TIMESTAMP WITH TIME ZONE,
  
  -- Contexto da recomendação
  score_recuperacao INTEGER,
  dias_sem_treinar INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(member_id, titulo, data_exibicao)
);

-- Tabela de histórico de progresso
CREATE TABLE IF NOT EXISTS gym_progress_history (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES gym_members(id) ON DELETE CASCADE,
  
  data DATE DEFAULT CURRENT_DATE,
  
  -- Medidas corporais
  peso DECIMAL(5,2),
  percentual_gordura DECIMAL(5,2),
  massa_muscular_kg DECIMAL(5,2),
  cintura_cm INTEGER,
  braco_cm INTEGER,
  perna_cm INTEGER,
  
  -- Força (cargas principais)
  supino_kg DECIMAL(5,2),
  agachamento_kg DECIMAL(5,2),
  levantamento_terra_kg DECIMAL(5,2),
  
  -- Performance
  flexoes INTEGER,
  abdominal_minutos INTEGER,
  corrida_5km_minutos INTEGER,
  
  -- Score geral
  score_performance INTEGER CHECK (score_performance BETWEEN 0 AND 100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(member_id, data)
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS gym_settings (
  id SERIAL PRIMARY KEY,
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT,
  descricao TEXT,
  
  -- Tipo de configuração
  tipo VARCHAR(20) CHECK (tipo IN ('boolean', 'number', 'string', 'json')),
  
  atualizado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_gym_members_user_id ON gym_members(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_members_academia_id ON gym_members(academia_id);
CREATE INDEX IF NOT EXISTS idx_gym_metrics_member_data ON gym_metrics(member_id, data);
CREATE INDEX IF NOT EXISTS idx_gym_checkins_member_data ON gym_checkins(member_id, check_in);
CREATE INDEX IF NOT EXISTS idx_gym_recommendations_member_visualizado ON gym_recommendations(member_id, visualizado);
CREATE INDEX IF NOT EXISTS idx_gym_progress_member_data ON gym_progress_history(member_id, data);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gym_units_updated_at BEFORE UPDATE ON gym_units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gym_members_updated_at BEFORE UPDATE ON gym_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gym_settings_updated_at BEFORE UPDATE ON gym_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Configurações iniciais
INSERT INTO gym_settings (chave, valor, descricao, tipo) VALUES
('score_recuperacao_peso_descanso', '0.4', 'Peso do descanso no score de recuperação', 'number'),
('score_recuperacao_peso_sono', '0.3', 'Peso do sono no score de recuperação', 'number'),
('score_recuperacao_peso_frequencia', '0.3', 'Peso da frequência no score de recuperação', 'number'),
('notificacoes_ativas', 'true', 'Se as notificações push estão ativas', 'boolean'),
('raio_checkin_padrao', '5', 'Raio padrão para check-in automático em metros', 'number'),
('dias_para_alerta_abandono', '7', 'Dias sem treinar para considerar abandono', 'number'),
('meta_passos_diaria', '10000', 'Meta diária de passos', 'number'),
('meta_sono_horas', '8', 'Meta diária de sono em horas', 'number')
ON CONFLICT (chave) DO NOTHING;

-- Política de segurança (RLS)
ALTER TABLE gym_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_progress_history ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (simplificado para desenvolvimento)
-- TODO: Implementar políticas específicas por usuário/academia

CREATE POLICY "Users can view their own data" ON gym_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON gym_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON gym_members FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own metrics" ON gym_metrics FOR SELECT USING (member_id IN (SELECT id FROM gym_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert their own metrics" ON gym_metrics FOR INSERT WITH CHECK (member_id IN (SELECT id FROM gym_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their own metrics" ON gym_metrics FOR UPDATE USING (member_id IN (SELECT id FROM gym_members WHERE user_id = auth.uid()));

-- Tabela de alertas preditivos
CREATE TABLE IF NOT EXISTS gym_alertas_preditivos (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES gym_members(id) ON DELETE CASCADE,
  
  tipo VARCHAR(20) CHECK (tipo IN ('abandono', 'lesao', 'sobrecarga', 'desmotivacao', 'meta_nao_atingida', 'sono_ruim')),
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  severidade VARCHAR(10) CHECK (severidade IN ('baixa', 'media', 'alta', 'critica')),
  probabilidade INTEGER CHECK (probabilidade BETWEEN 0 AND 100),
  data_prevista DATE,
  status VARCHAR(10) DEFAULT 'ativo' CHECK (status IN ('ativo', 'resolvido', 'ignorado')),
  
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolvido_em TIMESTAMP WITH TIME ZONE,
  
  acoes_recomendadas TEXT[]
);

-- Tabela de análises preditivas
CREATE TABLE IF NOT EXISTS gym_analises_preditivas (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES gym_members(id) ON DELETE CASCADE,
  
  data_analise TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score_geral INTEGER CHECK (score_geral BETWEEN 0 AND 100),
  fatores_risco JSONB,
  alertas_ativos JSONB,
  recomendacoes_ia TEXT[],
  proxima_analise DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para as novas tabelas
CREATE INDEX IF NOT EXISTS idx_gym_alertas_preditivos_member_status ON gym_alertas_preditivos(member_id, status);
CREATE INDEX IF NOT EXISTS idx_gym_analises_preditivas_member_data ON gym_analises_preditivas(member_id, data_analise);

-- Comentários para as novas tabelas
COMMENT ON TABLE gym_alertas_preditivos IS 'Alertas gerados pela IA para prever abandono, lesões e outros riscos';
COMMENT ON TABLE gym_analises_preditivas IS 'Análises completas geradas pelo motor de IA preditiva';
