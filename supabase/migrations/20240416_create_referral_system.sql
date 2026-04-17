-- Sistema de Indicação de Lojas

-- Tabela de indicações
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  store_name VARCHAR(255) NOT NULL,
  store_location TEXT NOT NULL,
  store_photo TEXT, -- URL da foto
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'active')),
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de carteiras dos usuários
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0, -- Saldo atual em pontos
  total_earned INTEGER DEFAULT 0, -- Total de pontos ganhos
  points_available INTEGER DEFAULT 0, -- Pontos disponíveis para uso
  points_used INTEGER DEFAULT 0, -- Pontos já utilizados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Dados adicionais
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de lojas (para quando forem cadastradas)
CREATE TABLE IF NOT EXISTS stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location TEXT NOT NULL,
  photo TEXT,
  referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para referrals
CREATE POLICY "Users can view their own referrals" ON referrals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referrals" ON referrals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referrals" ON referrals
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para user_wallets
CREATE POLICY "Users can view their own wallet" ON user_wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet" ON user_wallets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON user_wallets
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para stores
CREATE POLICY "Users can view stores" ON stores
    FOR SELECT USING (true);

CREATE POLICY "Store owners can update their stores" ON stores
    FOR UPDATE USING (auth.uid() = owner_id);

-- Função para gerar código de indicação único
CREATE OR REPLACE FUNCTION generate_unique_referral_code(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Gerar código: VAL + últimos 4 chars do user_id + timestamp + random
        new_code := 'VAL' || 
                    RIGHT(user_id_param::TEXT, 4) || 
                    EXTRACT(EPOCH FROM NOW())::TEXT || 
                    substr(md5(random()::TEXT), 1, 6);
        
        -- Verificar se já existe
        SELECT EXISTS(SELECT 1 FROM referrals WHERE referral_code = new_code) INTO code_exists;
        
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar pontos automaticamente
CREATE OR REPLACE FUNCTION update_referral_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Se status mudou para registered, adicionar 100 pontos
    IF OLD.status != 'registered' AND NEW.status = 'registered' THEN
        UPDATE user_wallets 
        SET 
            balance = balance + 100,
            total_earned = total_earned + 100,
            points_available = points_available + 100
        WHERE user_id = NEW.user_id;
        
        NEW.points_earned = NEW.points_earned + 100;
    END IF;
    
    -- Se status mudou para active, adicionar 300 pontos
    IF OLD.status != 'active' AND NEW.status = 'active' THEN
        UPDATE user_wallets 
        SET 
            balance = balance + 300,
            total_earned = total_earned + 300,
            points_available = points_available + 300
        WHERE user_id = NEW.user_id;
        
        NEW.points_earned = NEW.points_earned + 300;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar pontos automaticamente
CREATE TRIGGER referral_points_trigger
    AFTER UPDATE ON referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_referral_points();

-- Inserir carteira para novos usuários
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_wallets (user_id, balance, total_earned, points_available, points_used)
    VALUES (NEW.id, 0, 0, 0, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar carteira automaticamente
CREATE TRIGGER create_user_wallet_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_wallet();
