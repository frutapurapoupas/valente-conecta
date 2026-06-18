-- 002_receitas.sql
CREATE TABLE IF NOT EXISTS cozinha_receitas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  preparation_time INTEGER,
  servings INTEGER,
  is_available BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cozinha_receitas_ingredientes (
  recipe_id TEXT REFERENCES cozinha_receitas(id),
  ingredient_id TEXT REFERENCES cozinha_ingredientes(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL
);
