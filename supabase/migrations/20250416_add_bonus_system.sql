-- Sistema de Bônus e Configurações

-- Tabela de configurações de bônus
CREATE TABLE IF NOT EXISTS bonus_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'amigos', 'empresa', 'profissionais', etc.
  name VARCHAR(200) NOT NULL,
  description TEXT,
  batch_size INTEGER NOT NULL DEFAULT 1, -- Quantidade por lote
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Valor do bônus
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de bônus ganhos pelos usuários
CREATE TABLE IF NOT EXISTS user_bonuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_config_id UUID REFERENCES bonus_configurations(id),
  referral_id UUID REFERENCES referrals(id),
  batch_number INTEGER NOT NULL, -- Número do lote
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'earned', 'blocked', 'unlocked')),
  earned_at TIMESTAMP WITH TIME ZONE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações globais
CREATE TABLE IF NOT EXISTS global_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de métricas populacionais
CREATE TABLE IF NOT EXISTS population_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_population INTEGER NOT NULL DEFAULT 0,
  active_population INTEGER NOT NULL DEFAULT 0,
  whatsapp_users INTEGER NOT NULL DEFAULT 0,
  app_active_users INTEGER NOT NULL DEFAULT 0,
  adoption_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- percentual
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de progresso de lotes dos usuários
CREATE TABLE IF NOT EXISTS user_batch_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_config_id UUID REFERENCES bonus_configurations(id),
  current_batch INTEGER NOT NULL DEFAULT 1,
  current_count INTEGER NOT NULL DEFAULT 0,
  total_completed INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_bonuses_user_id ON user_bonuses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bonuses_status ON user_bonuses(status);
CREATE INDEX IF NOT EXISTS idx_user_bonuses_bonus_config_id ON user_bonuses(bonus_config_id);

CREATE INDEX IF NOT EXISTS idx_bonus_configurations_type ON bonus_configurations(type);
CREATE INDEX IF NOT EXISTS idx_bonus_configurations_active ON bonus_configurations(is_active);

CREATE INDEX IF NOT EXISTS idx_user_batch_progress_user_id ON user_batch_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_batch_progress_config_id ON user_batch_progress(bonus_config_id);

CREATE INDEX IF NOT EXISTS idx_population_metrics_recorded_at ON population_metrics(recorded_at);

-- Inserir configurações iniciais
INSERT INTO bonus_configurations (type, name, description, batch_size, amount, is_active) VALUES
('amigos', 'Indicação de Amigos', 'Bônus pago a cada 10 amigos indicados', 10, 2.00, true),
('empresa', 'Indicação de Empresas/Lojas', 'Bônus pago a cada 3 empresas indicadas', 3, 2.00, true),
('profissionais', 'Indicação de Profissionais', 'Bônus pago a cada 5 profissionais indicados', 5, 1.50, false),
('servicos', 'Indicação de Serviços', 'Bônus pago a cada 7 serviços indicados', 7, 3.00, false),
('ambulantes', 'Indicação de Ambulantes', 'Bônus pago a cada 8 ambulantes indicados', 8, 1.00, false),
('academia', 'Indicação de Academia', 'Bônus pago a cada 4 academias indicadas', 4, 2.50, false)
ON CONFLICT (type) DO NOTHING;

-- Inserir configurações globais
INSERT INTO global_configurations (key, value, description) VALUES
('ambassador_threshold', '15', 'Percentual mínimo de adoção para liberar bônus'),
('population_target', '40000', 'População total da região'),
('unlock_rate', '100', 'Taxa de liberação de bônus ao atingir meta'),
('points_to_money_rate', '0.20', 'Taxa de conversão de pontos para reais')
ON CONFLICT (key) DO NOTHING;

-- Inserir métricas populacionais iniciais
INSERT INTO population_metrics (total_population, active_population, whatsapp_users, app_active_users, adoption_rate) VALUES
(40000, 35000, 30000, 5000, 16.67)
ON CONFLICT DO NOTHING;

-- Função para calcular bônus de usuário
CREATE OR REPLACE FUNCTION calculate_user_bonus_amount(user_id_param UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total_amount DECIMAL(10,2) := 0.00;
  unlocked_amount DECIMAL(10,2) := 0.00;
  blocked_amount DECIMAL(10,2) := 0.00;
  adoption_rate DECIMAL(5,2);
  threshold DECIMAL(5,2);
BEGIN
  -- Buscar taxa de adoção atual
  SELECT adoption_rate INTO adoption_rate 
  FROM population_metrics 
  ORDER BY recorded_at DESC 
  LIMIT 1;
  
  -- Buscar threshold configurado
  SELECT (value::DECIMAL(5,2)) INTO threshold
  FROM global_configurations 
  WHERE key = 'ambassador_threshold';
  
  -- Calcular bônus totais
  SELECT COALESCE(SUM(amount), 0) INTO total_amount
  FROM user_bonuses 
  WHERE user_id = user_id_param AND status IN ('earned', 'unlocked');
  
  -- Calcular bônus liberados
  IF adoption_rate >= threshold THEN
    unlocked_amount := total_amount;
    blocked_amount := 0.00;
  ELSE
    -- Liberação proporcional baseada na adoção
    unlocked_amount := total_amount * (adoption_rate / threshold);
    blocked_amount := total_amount - unlocked_amount;
  END IF;
  
  RETURN unlocked_amount;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar progresso de lote
CREATE OR REPLACE FUNCTION update_batch_progress(
  user_id_param UUID,
  config_type_param VARCHAR(50)
) RETURNS VOID AS $$
DECLARE
  config_id UUID;
  batch_size INTEGER;
  progress_record user_batch_progress%ROWTYPE;
  referral_count INTEGER;
  new_batch INTEGER;
  bonus_amount DECIMAL(10,2);
BEGIN
  -- Buscar configuração do bônus
  SELECT id, batch_size, amount INTO config_id, batch_size, bonus_amount
  FROM bonus_configurations 
  WHERE type = config_type_param AND is_active = true;
  
  IF NOT FOUND THEN RETURN; END IF;
  
  -- Buscar ou criar progresso
  SELECT * INTO progress_record
  FROM user_batch_progress 
  WHERE user_id = user_id_param AND bonus_config_id = config_id;
  
  IF NOT FOUND THEN
    INSERT INTO user_batch_progress (user_id, bonus_config_id, current_batch, current_count, total_completed)
    VALUES (user_id_param, config_id, 1, 0, 0)
    RETURNING * INTO progress_record;
  END IF;
  
  -- Contar indicações confirmadas
  SELECT COUNT(*) INTO referral_count
  FROM referrals
  WHERE user_id = user_id_param AND status = 'active';
  
  -- Calcular novo progresso
  new_batch := FLOOR(referral_count / batch_size) + 1;
  
  -- Se completou um lote, criar bônus
  IF new_batch > progress_record.current_batch THEN
    INSERT INTO user_bonuses (user_id, bonus_config_id, referral_id, batch_number, amount, status, earned_at)
    VALUES (user_id_param, config_id, NULL, progress_record.current_batch, bonus_amount, 'earned', NOW());
    
    -- Atualizar progresso
    UPDATE user_batch_progress 
    SET current_batch = new_batch,
        current_count = (referral_count % batch_size),
        total_completed = referral_count,
        last_updated = NOW()
    WHERE id = progress_record.id;
  ELSE
    -- Apenas atualizar contador
    UPDATE user_batch_progress 
    SET current_count = (referral_count % batch_size),
        last_updated = NOW()
    WHERE id = progress_record.id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar progresso quando indicação é confirmada
CREATE OR REPLACE FUNCTION trigger_update_referral_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    PERFORM update_batch_progress(NEW.user_id, 'amigos');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS referral_progress_trigger ON referrals;
CREATE TRIGGER referral_progress_trigger
    AFTER UPDATE ON referrals
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_referral_progress();
