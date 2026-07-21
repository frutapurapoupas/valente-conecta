import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'valente.db');
    
    // Garantir que a pasta data existe
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    db = new Database(dbPath);
    
    // Criar tabela de migrações se não existir
    const createMigrationsSQL = 
      "CREATE TABLE IF NOT EXISTS migrations (" +
      "id TEXT PRIMARY KEY, " +
      "name TEXT NOT NULL, " +
      "executed_at TEXT DEFAULT (datetime('now'))" +
      ")";
    db.exec(createMigrationsSQL);
    
    // Executar migrações pendentes
    runMigrations(db);
  }
  return db;
}

function runMigrations(db: Database.Database) {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    return;
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter((f: string) => f.endsWith('.sql'))
    .sort();
  
  if (files.length === 0) return;
  
  // Verificar migrações já executadas
  const executed = db.prepare("SELECT name FROM migrations").all();
  const executedNames = new Set(executed.map((m: any) => m.name));
  
  for (const file of files) {
    if (!executedNames.has(file)) {
      try {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        db.exec(sql);
        db.prepare("INSERT INTO migrations (id, name) VALUES (?, ?)").run(file, file);
        console.log('? Migração executada: ' + file);
      } catch (error) {
        console.error('? Erro ao executar migração ' + file + ':', error);
      }
    }
  }
}

