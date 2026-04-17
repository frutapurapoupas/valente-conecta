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
