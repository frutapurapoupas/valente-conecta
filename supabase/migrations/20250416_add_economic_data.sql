-- Sistema de Dados Econômicos para Analytics

-- Tabela de dados econômicos da região
CREATE TABLE IF NOT EXISTS economic_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city VARCHAR(100) NOT NULL DEFAULT 'Valente',
  state VARCHAR(2) NOT NULL DEFAULT 'BA',
  year INTEGER NOT NULL,
  month INTEGER,
  data_type VARCHAR(50) NOT NULL, -- 'companies', 'jobs', 'gdp', 'sectors', etc.
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit VARCHAR(20), -- 'units', 'currency', 'percentage', etc.
  source VARCHAR(100), -- Fonte dos dados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relatórios pagos
CREATE TABLE IF NOT EXISTS paid_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL, -- 'economic', 'market', 'competition', etc.
  report_name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  access_granted BOOLEAN DEFAULT false,
  granted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de acessos a relatórios
CREATE TABLE IF NOT EXISTS report_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES paid_reports(id) ON DELETE CASCADE,
  access_type VARCHAR(20) NOT NULL DEFAULT 'paid', -- 'free', 'paid', 'trial'
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_economic_data_city_year ON economic_data(city, year);
CREATE INDEX IF NOT EXISTS idx_economic_data_type ON economic_data(data_type);
CREATE INDEX IF NOT EXISTS idx_paid_reports_user ON paid_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_paid_reports_active ON paid_reports(is_active);
CREATE INDEX IF NOT EXISTS idx_report_access_user ON report_access(user_id);
CREATE INDEX IF NOT EXISTS idx_report_access_report ON report_access(report_id);

-- Trigger para updated_at
CREATE TRIGGER update_economic_data_updated_at BEFORE UPDATE ON economic_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paid_reports_updated_at BEFORE UPDATE ON paid_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE economic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE paid_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_access ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para economic_data (leitura pública para admins)
CREATE POLICY "Admins can view economic data" ON economic_data
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'admin'
      )
    );

CREATE POLICY "Admins can insert economic data" ON economic_data
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'admin'
      )
    );

-- Políticas RLS para paid_reports
CREATE POLICY "Users can view their own reports" ON paid_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports" ON paid_reports
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'admin'
      )
    );

-- Políticas RLS para report_access
CREATE POLICY "Users can view their own access" ON report_access
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all access" ON report_access
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'admin'
      )
    );

-- Inserir dados iniciais de Valente-BA
INSERT INTO economic_data (city, state, year, data_type, metric_name, metric_value, metric_unit, source) VALUES
-- Dados de 2025-2026
('Valente', 'BA', 2025, 'companies', 'Novas Empresas', 10, 'units', 'Registros Municipais'),
('Valente', 'BA', 2026, 'companies', 'Novas Empresas', 1, 'units', 'Registros Municipais'),
('Valente', 'BA', 2025, 'employment', 'Empregos Formais', 3700, 'units', 'RAIS'),
('Valente', 'BA', 2025, 'economy', 'PIB', 350600000, 'currency', 'IBGE'),
('Valente', 'BA', 2025, 'sectors', 'Serviços', 49, 'percentage', 'Dados Regionais'),
('Valente', 'BA', 2025, 'sectors', 'Comércio', 36, 'percentage', 'Dados Regionais'),
('Valente', 'BA', 2025, 'sectors', 'Indústria', 10, 'percentage', 'Dados Regionais'),
('Valente', 'BA', 2025, 'sectors', 'Construção Civil', 5, 'percentage', 'Dados Regionais'),
-- Dados da região
('Região', 'BA', 2025, 'companies', 'Novas Empresas (Região)', 81, 'units', 'Registros Municipais'),
('Valente', 'BA', 2025, 'market', 'Estabelecimentos Fixos', 85, 'percentage', 'Análise Local'),
('Valente', 'BA', 2025, 'market', 'Crescimento Moderado', true, 'boolean', 'Análise Local'),
('Valente', 'BA', 2025, 'market', 'Potencial Digitalização', 80, 'percentage', 'Estimativa Valente Conecta')
ON CONFLICT DO NOTHING;

-- Inserir relatórios disponíveis
INSERT INTO paid_reports (report_type, report_name, description, price) VALUES
('economic', 'Panorama Empresarial Completo', 'Análise detalhada do cenário econômico de Valente-BA com dados atualizados e projeções', 29.90),
('market', 'Análise de Concorrência', 'Mapeamento completo dos concorrentes e oportunidades de mercado na região', 49.90),
('growth', 'Potencial de Crescimento', 'Projeções de crescimento e identificação de nichos de mercado', 39.90),
('digital', 'Transformação Digital', 'Análise do potencial de digitalização das empresas locais', 34.90)
ON CONFLICT DO NOTHING;
