/**
 * Database Migration CLI Script
 * 
 * Usage:
 *   npm run db:status   - Show diff between code schemas and database
 *   npm run db:migrate  - Apply migrations to sync database with code
 *   npm run db:generate - Generate migration script for review
 * 
 * Environment:
 *   POCKETBASE_ADMIN_EMAIL    - Superuser email
 *   POCKETBASE_ADMIN_PASSWORD - Superuser password
 */
import { MigrationService } from '../database/index.js';
import { createLogger } from '../utils/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================================
// CLI Setup
// =============================================================================

const log = createLogger('MigrateCLI');

const args = process.argv.slice(2);
const command = args.find(a => a.startsWith('--'))?.slice(2) ?? 'status';
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const verbose = args.includes('--verbose');

// =============================================================================
// Commands
// =============================================================================

async function showStatus() {
  const migration = new MigrationService();
  
  try {
    await migration.authenticate();
    const diff = await migration.diff();
    
    console.log('\n📊 Database Migration Status\n');
    console.log(`Summary: ${diff.summary}`);
    console.log(`Has Changes: ${diff.hasChanges ? '✅ Yes' : '❌ No'}\n`);
    
    if (diff.hasChanges) {
      console.log('Collections:');
      for (const col of diff.collections) {
        if (col.action === 'skip') continue;
        
        const icon = col.action === 'create' ? '🆕' : '🔄';
        console.log(`  ${icon} ${col.name} (${col.action})`);
        
        if (col.fieldDiffs) {
          for (const field of col.fieldDiffs) {
            const fieldIcon = field.action === 'create' ? '+' : field.action === 'delete' ? '-' : '~';
            console.log(`      ${fieldIcon} ${field.name}`);
          }
        }
        
        if (col.ruleDiffs) {
          console.log(`      ~ rules: ${col.ruleDiffs.join(', ')}`);
        }
      }
    }
    
    console.log('');
  } catch (error) {
    log.error('Status check failed:', error);
    process.exit(1);
  }
}

async function runMigration() {
  const migration = new MigrationService();
  
  try {
    await migration.authenticate();
    
    console.log('\n🚀 Running Database Migration\n');
    
    if (dryRun) {
      console.log('⚠️  DRY RUN MODE - No changes will be applied\n');
    }
    
    if (force) {
      console.log('⚠️  FORCE MODE - Destructive changes will be applied\n');
    }
    
    const result = await migration.migrate({ dryRun, force, verbose });
    
    console.log(`Duration: ${String(result.duration)}ms`);
    console.log(`Success: ${result.success ? '✅' : '❌'}`);
    
    if (result.applied.length > 0) {
      console.log(`\nApplied (${String(result.applied.length)}):`);
      result.applied.forEach(c => { console.log(`  ✅ ${c}`); });
    }
    
    if (result.failed.length > 0) {
      console.log(`\nFailed (${String(result.failed.length)}):`);
      result.failed.forEach(f => { console.log(`  ❌ ${f.collection}: ${f.error}`); });
    }
    
    console.log('');
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    log.error('Migration failed:', error);
    process.exit(1);
  }
}

async function generateScript() {
  const migration = new MigrationService();
  
  try {
    await migration.authenticate();
    const script = await migration.generateScript();
    
    console.log('\n📝 Migration Script\n');
    console.log(script);
    console.log('');
  } catch (error) {
    log.error('Script generation failed:', error);
    process.exit(1);
  }
}

async function pullSchema() {
  const migration = new MigrationService();
  const collectionsDir = path.resolve(__dirname, '../database/collections');
  
  try {
    await migration.authenticate();
    
    console.log('\n📥 Pulling Schema from PocketBase\n');
    
    // Get snapshot from DB
    const snapshot = await migration.snapshot();
    const changes: Array<{ file: string; action: 'create' | 'update' | 'skip' }> = [];
    
    // Ensure directory exists
    try {
      await fs.access(collectionsDir);
    } catch {
      await fs.mkdir(collectionsDir, { recursive: true });
    }

    // Process each file in snapshot
    for (const [filename, content] of snapshot) {
      const filePath = path.join(collectionsDir, filename);
      let action: 'create' | 'update' | 'skip' = 'create';
      
      try {
        const existing = await fs.readFile(filePath, 'utf-8');
        // Simple string comparison for now. 
        // In verify step we might want to be smarter about whitespace
        if (existing.trim() === content.trim()) {
          action = 'skip';
        } else {
          action = 'update';
        }
      } catch {
        // File doesn't exist, so create it
        action = 'create';
      }

      if (action !== 'skip') {
        if (dryRun) {
           console.log(`[DRY RUN] Would ${action} file: ${filename}`);
        } else {
           await fs.writeFile(filePath, content, 'utf-8');
           changes.push({ file: filename, action });
        }
      }
    }
    
    if (changes.length === 0) {
      console.log('✨ All files are up to date.');
    } else {
       console.log(`Updated ${String(changes.length)} files:`);
       changes.forEach(c => { console.log(`  ${c.action === 'create' ? '✅' : '🔄'} ${c.file}`); });
    }
    
  } catch (error) {
    log.error('Schema pull failed:', error);
    process.exit(1);
  }
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log('🔧 PocketBase Migration Tool\n');
  
  switch (command) {
    case 'status':
      await showStatus();
      break;
    case 'migrate':
      await runMigration();
      break;
    case 'generate':
      await generateScript();
      break;
    case 'pull':
      await pullSchema();
      break;
    default:
      console.log('Usage:');
      console.log('  npm run db:status   - Show migration status');
      console.log('  npm run db:migrate  - Apply migrations (push code to DB)');
      console.log('  npm run db:pull     - Pull schema from DB to code');
      console.log('  npm run db:generate - Generate migration script');
      console.log('\nOptions:');
      console.log('  --dry-run           - Preview changes without applying');
      console.log('  --force             - Allow destructive changes (field deletions)');
      console.log('  --verbose           - Show detailed output');
      process.exit(1);
  }
}

main().catch((error: unknown) => {
  log.error('Unexpected error:', error);
  process.exit(1);
});

