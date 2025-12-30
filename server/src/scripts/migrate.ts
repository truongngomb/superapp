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
import * as readline from 'readline/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================================
// CLI Setup
// =============================================================================

const log = createLogger('MigrateCLI');

const args = process.argv.slice(2);
const command = args.find(a => a.startsWith('--'))?.slice(2) ?? 'status'; // e.g. --migrate
const commandArg = args.find(a => !a.startsWith('--')); // e.g. restore <file>
const dryRun = args.includes('--dry-run');
let force = args.includes('--force');
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
    
    // Check for destructive changes if not forced
    if (!force && !dryRun) {
      const diff = await migration.diff();
      
      // We need to access the private method or replicate logic. 
      // Since getDestructiveChanges is private, let's look at the diff directly.
      const destructive: string[] = [];
      for (const col of diff.collections) {
        if (col.fieldDiffs) {
          for (const field of col.fieldDiffs) {
            if (field.action === 'delete') {
              destructive.push(`${col.name}.${field.name}`);
            }
          }
        }
      }

      if (destructive.length > 0) {
        console.log('⚠️  DESTRUCTIVE CHANGES DETECTED:\n');
        destructive.forEach(d => { console.log(`  ❌ DELETE ${d}`); });
        console.log('');
        
        if (process.stdout.isTTY) {
          const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
          const answer = await rl.question('Are you sure you want to apply these changes? (y/N) ');
          rl.close();
          
          if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            force = true;
          } else {
            console.log('Migration cancelled.');
            process.exit(0);
          }
        } else {
          console.log('Run with --force to apply destructive changes in non-interactive mode.');
          process.exit(1);
        }
      }
    }
    
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

async function runBackup() {
  const migration = new MigrationService();
  try {
    await migration.authenticate();
    console.log('\n📦 Backing up schema...\n');
    const path = await migration.backup();
    console.log(`✅ Backup created at: ${path}\n`);
  } catch (error) {
    log.error('Backup failed:', error);
    process.exit(1);
  }
}

async function runRestore() {
  if (!commandArg) {
    console.error('Error: Please specify the backup file to restore.');
    console.error('Usage: npm run db:restore <path/to/backup.json>');
    process.exit(1);
  }

  const migration = new MigrationService();
  try {
    await migration.authenticate();
    
    console.log(`\n♻️  Restoring schema from: ${commandArg}\n`);
    
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question('⚠️  WARNING: This will overwrite the current database schema. Proceed? (y/N) ');
    rl.close();
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('Restore cancelled.');
      process.exit(0);
    }

    const result = await migration.restore(commandArg);
    console.log(`Success: ${result.success ? '✅' : '❌'}`);
    console.log('');
  } catch (error) {
    log.error('Restore failed:', error);
    process.exit(1);
  }
}

async function runSeed() {
  const migration = new MigrationService();
  try {
    await migration.authenticate();
    console.log('\n🌱 Running Seeds...\n');
    await migration.seed(verbose);
    console.log('\n✅ Seeding finished.\n');
  } catch (error) {
    log.error('Seeding failed:', error);
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

// =============================================================================
// Interactive Menu
// =============================================================================

async function showInteractiveMenu() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  
  console.log('🔧 PocketBase Database Tools');
  console.log('--------------------------------');
  console.log('1. 📊 Show Status     (Diff between code and DB)');
  console.log('2. 🚀 Migrate         (Apply code changes to DB)');
  console.log('3. 📥 Pull Schema     (Update code from DB)');
  console.log('4. 📝 Generate Script (Create migration file)');
  console.log('5. 📦 Backup          (Save schema snapshot)');
  console.log('6. ♻️  Restore         (Restore from backup)');
  console.log('7. 🌱 Seed            (Run seed data)');
  console.log('0. 🚪 Exit');
  console.log('--------------------------------');

  try {
    const answer = await rl.question('Select an option (0-7): ');
    rl.close();
    
    console.log(''); // New line

    switch (answer.trim()) {
      case '1': await showStatus(); break;
      case '2': await runMigration(); break;
      case '3': await pullSchema(); break;
      case '4': await generateScript(); break;
      case '5': await runBackup(); break;
      case '6': 
        // For restore in interactive mode, we need to ask for file path
        // For now, let's just list backups and ask to copy path
        console.log('To restore, run: npm run db:restore <path/to/backup.json>'); 
        break;
      case '7': await runSeed(); break;
      case '0': process.exit(0); break;
      default:
        console.log('Invalid option.');
        await showInteractiveMenu();
    }
  } catch (error) {
    log.error('Error:', error);
    rl.close();
  }
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  // If no specific command flag is provided, verify if we should run interactive mode
  // The 'status' default in original code was slightly aggressive if arguments were just missing.
  // Let's implement logic: if args present, map to command. If no args, interactive.
  
  if (command !== 'status' || args.length > 0) {
    // Arguments were provided
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
      case 'backup':
        await runBackup();
        break;
      case 'restore':
        await runRestore();
        break;
      case 'seed':
        await runSeed();
        break;
      default:
        // Even if 'status' was defaulted, if args were passed but meaningless, show help
        // But here we rely on the top argument parsing logic. 
        // If args has something but it didn't match known flags (except --verbose etc), 
        // we might just default to status as before or show help.
        // Let's stick to previous behavior of status if unsure, OR show interactive if truly empty.
        
        console.log('Usage:');
        console.log('  npm run db:status   - Show migration status');
        console.log('  npm run db:migrate  - Apply migrations (push code to DB)');
        console.log('  npm run db:pull     - Pull schema from DB to code');
        console.log('  npm run db:generate - Generate migration script');
        console.log('  npm run db:backup   - Backup current schema');
        console.log('  npm run db:restore  - Restore schema from backup');
        console.log('  npm run db:seed     - Run seed scripts');
        console.log('\nOptions:');
        console.log('  --dry-run           - Preview changes without applying');
        console.log('  --force             - Allow destructive changes (field deletions)');
        console.log('  --verbose           - Show detailed output');
        process.exit(1);
    }
  } else {
    // No arguments provided
    await showInteractiveMenu();
  }
}

main().catch((error: unknown) => {
  log.error('Unexpected error:', error);
  process.exit(1);
});

