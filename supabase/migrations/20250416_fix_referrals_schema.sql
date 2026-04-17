-- Fix para schema de referrals - adicionar colunas faltantes

-- Verificar se colunas existem antes de adicionar
DO $$
BEGIN
    -- Adicionar coluna store_photo se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='referrals' AND column_name='store_photo'
    ) THEN
        ALTER TABLE referrals ADD COLUMN store_photo TEXT;
    END IF;

    -- Adicionar coluna store_image_url se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='referrals' AND column_name='store_image_url'
    ) THEN
        ALTER TABLE referrals ADD COLUMN store_image_url TEXT;
    END IF;
END $$;

-- Criar função para gerar código de indicação único
CREATE OR REPLACE FUNCTION generate_unique_referral_code(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    attempts INTEGER := 0;
    max_attempts INTEGER := 10;
BEGIN
    LOOP
        -- Gerar código baseado no user_id e timestamp
        code := upper(substring(md5(user_id_param::text || extract(epoch from now())::text), 1, 8));
        
        -- Verificar se já existe
        IF NOT EXISTS (SELECT 1 FROM referrals WHERE referral_code = code) THEN
            RETURN code;
        END IF;
        
        attempts := attempts + 1;
        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Não foi possível gerar código único após % tentativas', max_attempts;
        END IF;
        
        -- Esperar um pouco antes de tentar novamente
        PERFORM pg_sleep(0.01);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar triggers se não existirem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_referrals_updated_at'
    ) THEN
        CREATE TRIGGER update_referrals_updated_at
            BEFORE UPDATE ON referrals
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_user_wallets_updated_at'
    ) THEN
        CREATE TRIGGER update_user_wallets_updated_at
            BEFORE UPDATE ON user_wallets
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);

-- Criar carteira automática para novos usuários
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_wallets (user_id, balance, total_earned, points_available, points_used)
    VALUES (NEW.id, 0, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar carteira automaticamente
DROP TRIGGER IF EXISTS create_wallet_on_user_signup ON auth.users;
CREATE TRIGGER create_wallet_on_user_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_wallet();
