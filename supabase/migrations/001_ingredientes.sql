-- 001_ingredientes.sql
CREATE TABLE IF NOT EXISTS cozinha_ingredientes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  stock DECIMAL(10,2) NOT NULL,
  min_stock DECIMAL(10,2) NOT NULL,
  supplier TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
