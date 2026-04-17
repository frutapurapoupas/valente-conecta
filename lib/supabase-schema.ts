// Schema compatível com Supabase para compartilhamento entre todos os usuários
export interface SupabaseProduct {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  store_id: string
  store_name: string
  store_address: string
  store_lat: number
  store_lng: number
  user_id: string // ID do usuário que publicou
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Campos adicionais para compatibilidade
  barcode?: string
  brand?: string
  in_stock: boolean
  rating?: number
  tags?: string[]
  
  // Campos específicos do Preço da Hora (se aplicável)
  is_preco_da_hora?: boolean
  preco_minimo?: number
  preco_maximo?: number
  estabelecimentos?: number
  
  // Campos específicos do Google Maps (se aplicável)
  is_google_result?: boolean
  google_place_id?: string
}

export interface SupabaseStore {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  phone?: string
  whatsapp?: string
  website?: string
  category: string
  is_active: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface SupabaseUser {
  id: string
  email: string
  name: string
  phone?: string
  is_active: boolean
  is_store_owner: boolean
  created_at: string
  updated_at: string
}

// Tabela principal de produtos (compartilhada)
export const PRODUCTS_TABLE = 'products'

// Tabela de lojas/estabelecimentos
export const STORES_TABLE = 'stores'

// Tabela de usuários
export const USERS_TABLE = 'users'

// Tabela de categorias
export const CATEGORIES_TABLE = 'categories'

// SQL para criar as tabelas no Supabase
export const SUPABASE_SCHEMA_SQL = `
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  is_store_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de lojas
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela principal de produtos (compartilhada)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  category TEXT NOT NULL,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  store_address TEXT NOT NULL,
  store_lat DECIMAL(10, 8) NOT NULL,
  store_lng DECIMAL(11, 8) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  barcode TEXT,
  brand TEXT,
  in_stock BOOLEAN DEFAULT true,
  rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
  tags TEXT[],
  is_preco_da_hora BOOLEAN DEFAULT false,
  preco_minimo DECIMAL(10, 2),
  preco_maximo DECIMAL(10, 2),
  estabelecimentos INTEGER,
  is_google_result BOOLEAN DEFAULT false,
  google_place_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('portuguese', name));
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Índices geográficos
CREATE INDEX IF NOT EXISTS idx_products_location ON products USING GIST(point(store_lng, store_lat));
CREATE INDEX IF NOT EXISTS idx_stores_location ON stores USING GIST(point(lng, lat));

-- Índices para lojas
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);
CREATE INDEX IF NOT EXISTS idx_stores_is_active ON stores(is_active);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para lojas
CREATE POLICY "Users can view all active stores" ON stores
    FOR SELECT USING (is_active = true);

CREATE POLICY "Store owners can manage own stores" ON stores
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para produtos
CREATE POLICY "All users can view active products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage own products" ON products
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para categorias
CREATE POLICY "All users can view categories" ON categories
    FOR SELECT USING (is_active = true);
`

// Função para converter dados da API para formato Supabase
export function convertToSupabaseProduct(apiProduct: any, userId: string): Partial<SupabaseProduct> {
  return {
    name: apiProduct.name || apiProduct.nome,
    description: apiProduct.description || apiProduct.descricao,
    price: apiProduct.price || apiProduct.preco_medio,
    image: apiProduct.image || apiProduct.imagem,
    category: apiProduct.category || apiProduct.categoria,
    store_name: apiProduct.store?.name || apiProduct.loja,
    store_address: apiProduct.store?.address || apiProduct.endereco,
    store_lat: apiProduct.store?.location?.lat || apiProduct.lat,
    store_lng: apiProduct.store?.location?.lng || apiProduct.lng,
    user_id: userId,
    barcode: apiProduct.barcode || apiProduct.codigo_barras,
    brand: apiProduct.brand || apiProduct.marca,
    in_stock: apiProduct.in_stock ?? true,
    rating: apiProduct.rating,
    tags: apiProduct.tags,
    is_preco_da_hora: apiProduct.isPrecoDaHora || apiProduct.is_preco_da_hora,
    preco_minimo: apiProduct.precoMinimo || apiProduct.preco_minimo,
    preco_maximo: apiProduct.precoMaximo || apiProduct.preco_maximo,
    estabelecimentos: apiProduct.estabelecimentos,
    is_google_result: apiProduct.isGoogleResult || apiProduct.is_google_result,
    google_place_id: apiProduct.google_place_id,
    is_active: true
  }
}
