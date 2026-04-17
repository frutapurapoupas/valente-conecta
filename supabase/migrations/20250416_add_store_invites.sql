-- Adicionar tabela de convites de lojas
CREATE TABLE IF NOT EXISTS store_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  store_name VARCHAR(255) NOT NULL,
  responsible_name VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  invite_code VARCHAR(10) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_store_invites_referral_id ON store_invites(referral_id);
CREATE INDEX IF NOT EXISTS idx_store_invites_invite_code ON store_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_store_invites_status ON store_invites(status);
CREATE INDEX IF NOT EXISTS idx_store_invites_whatsapp ON store_invites(whatsapp);

-- Trigger para updated_at
CREATE TRIGGER update_store_invites_updated_at BEFORE UPDATE ON store_invites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE store_invites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own invites" ON store_invites
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM referrals r 
        WHERE r.id = store_invites.referral_id 
        AND r.user_id = auth.uid()
      )
    );

CREATE POLICY "Users can create invites for their referrals" ON store_invites
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM referrals r 
        WHERE r.id = store_invites.referral_id 
        AND r.user_id = auth.uid()
      )
    );

-- Função para aceitar convite
CREATE OR REPLACE FUNCTION accept_store_invite(invite_code_param TEXT, store_data JSONB)
RETURNS UUID AS $$
DECLARE
  invite_record store_invites%ROWTYPE;
  new_store_id UUID;
BEGIN
  -- Buscar convite
  SELECT * INTO invite_record 
  FROM store_invites 
  WHERE invite_code = invite_code_param AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite não encontrado ou já processado';
  END IF;
  
  -- Criar loja
  INSERT INTO stores (name, location, photo, status)
  VALUES (
    store_data->>'name',
    store_data->>'location',
    store_data->>'photo',
    'active'
  )
  RETURNING id INTO new_store_id;
  
  -- Atualizar status do convite
  UPDATE store_invites 
  SET 
    status = 'accepted',
    responded_at = NOW()
  WHERE id = invite_record.id;
  
  -- Atualizar status da indicação para active
  UPDATE referrals 
  SET status = 'active'
  WHERE id = invite_record.referral_id;
  
  RETURN new_store_id;
END;
$$ LANGUAGE plpgsql;
