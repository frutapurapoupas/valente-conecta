/**
 * Script: Sincronizar dados de localStorage para Supabase
 * Uso: npx ts-node modules-scaffold/scripts/sync-to-supabase.ts
 * 
 * Este script lÃª dados do localStorage (em JSON) e insere em tabelas Supabase
 * correspondentes, criando um backup e evitando duplicatas.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

interface SyncConfig {
  localKey: string;
  table: string;
  batchSize: number;
}

const SYNC_CONFIGS: SyncConfig[] = [
  { localKey: 'modulos_catalogo_itens', table: 'catalog_items', batchSize: 100 },
  { localKey: 'modulos_demandas', table: 'demands', batchSize: 50 },
  { localKey: 'modulos_fornecedores', table: 'suppliers', batchSize: 50 },
];

export async function syncLocalStorageToSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('âŒ Erro: Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('ðŸ”„ Iniciando sincronizaÃ§Ã£o localStorage â†’ Supabase...\n');

  for (const config of SYNC_CONFIGS) {
    try {
      // 1. Ler dados do localStorage (em arquivo JSON para testes)
      const dataPath = path.join(process.cwd(), `data/${config.localKey}.json`);
      if (!fs.existsSync(dataPath)) {
        console.log(`â­ï¸  Pulando ${config.localKey} (arquivo nÃ£o encontrado)`);
        continue;
      }

      const localData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      console.log(`ðŸ“¦ Carregado: ${localData.length} registros de ${config.localKey}`);

      // 2. Criar backup
      const backupPath = path.join(backupDir, `${config.table}-backup-${timestamp}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(localData, null, 2));
      console.log(`ðŸ’¾ Backup criado: ${backupPath}`);

      // 3. Sincronizar em lotes
      let synced = 0;
      let skipped = 0;

      for (let i = 0; i < localData.length; i += config.batchSize) {
        const batch = localData.slice(i, i + config.batchSize);

        // Verificar duplicatas antes de inserir
        const ids = batch.map((item: any) => item.id);
        const { data: existing } = await supabase
          .from(config.table)
          .select('id')
          .in('id', ids);

        const existingIds = new Set((existing || []).map((item: any) => item.id));
        const toInsert = batch.filter((item: any) => !existingIds.has(item.id));

        if (toInsert.length === 0) {
          skipped += batch.length;
          continue;
        }

        const { error } = await supabase
          .from(config.table)
          .insert(toInsert);

        if (error) {
          console.error(`âŒ Erro ao inserir em ${config.table}:`, error.message);
        } else {
          synced += toInsert.length;
          skipped += batch.length - toInsert.length;
          console.log(`âœ… ${config.table}: ${toInsert.length} novos registros`);
        }
      }

      console.log(
        `ðŸ“Š ${config.table}: ${synced} sincronizados, ${skipped} duplicatas puladas\n`
      );
    } catch (error: any) {
      console.error(`âŒ Erro ao sincronizar ${config.localKey}:`, error.message);
    }
  }

  console.log('âœ¨ SincronizaÃ§Ã£o concluÃ­da!');
}

// Executar se chamado diretamente
if (require.main === module) {
  syncLocalStorageToSupabase().catch(console.error);
}

export default syncLocalStorageToSupabase;

