#!/usr/bin/env ts-node

// Script Anti-Erro para Produção
// Protege o banco de dados contra operações destrutivas

interface DbSafeCheck {
  environment: string;
  blockedOperations: string[];
  allowedOperations: string[];
}

const SAFE_CONFIG: DbSafeCheck = {
  environment: process.env.NODE_ENV || 'development',
  blockedOperations: [
    'DROP TABLE',
    'DROP DATABASE',
    'TRUNCATE TABLE',
    'DELETE FROM users',
    'DELETE FROM stores',
    'DELETE FROM products'
  ],
  allowedOperations: [
    'INSERT',
    'UPDATE',
    'SELECT',
    'CREATE TABLE',
    'ALTER TABLE',
    'CREATE INDEX'
  ]
};

function checkOperation(operation: string): boolean {
  const upperOperation = operation.toUpperCase();
  
  if (SAFE_CONFIG.environment === 'production') {
    // Bloquear operações perigosas em produção
    for (const blocked of SAFE_CONFIG.blockedOperations) {
      if (upperOperation.includes(blocked)) {
        console.error('🚨 OPERAÇÃO BLOQUEADA EM PRODUÇÃO:', operation);
        console.error('🚨 Operações permitidas:', SAFE_CONFIG.allowedOperations.join(', '));
        process.exit(1);
      }
    }
    
    console.log('✅ Operação segura para produção:', operation);
    return true;
  }
  
  // Em desenvolvimento, permitir tudo com aviso
  if (SAFE_CONFIG.blockedOperations.some(blocked => upperOperation.includes(blocked))) {
    console.warn('⚠️ ATENÇÃO: Operação destrutiva em desenvolvimento:', operation);
  }
  
  return true;
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('🔍 Uso: npm run db:safe-check <operation>');
  console.log('🔍 Exemplo: npm run db:safe-check "SELECT * FROM users"');
  process.exit(0);
}

const operation = args.join(' ');
console.log('🔍 Verificando operação:', operation);
console.log('🌍 Ambiente:', SAFE_CONFIG.environment);

checkOperation(operation);
console.log('✅ Verificação concluída com sucesso!');
