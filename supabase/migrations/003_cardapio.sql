-- 003_cardapio.sql
CREATE TABLE IF NOT EXISTS cozinha_cardapio (
  id TEXT PRIMARY KEY,
  recipe_id TEXT REFERENCES cozinha_receitas(id),
  day_of_week INTEGER NOT NULL,
  period TEXT NOT NULL,
  custom_price DECIMAL(10,2),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
