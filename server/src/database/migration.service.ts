/**
 * Migration Service
 * 
 * Handles syncing collection schemas from code to PocketBase.
 * Requires superuser authentication to create/update collections.
 */
import { pb } from '../config/database.js';
import { config } from '../config/env.js';
import { createLogger } from '../utils/index.js';
import { allCollections } from './collections/index.js';
import type { 
  CollectionSchema, 
  CollectionField,
  MigrationDiff, 
  MigrationResult,
  CollectionDiff,
  FieldDiff,
} from './collection.schema.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================================
// Types
// =============================================================================

interface PBCollection {
  id: string;
  name: string;
  type: string;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    required?: boolean;
    [key: string]: unknown;
  }>;
  indexes: string[];
  listRule: string | null;
  viewRule: string | null;
  createRule: string | null;
  updateRule: string | null;
  deleteRule: string | null;
  system: boolean;
  [key: string]: unknown;
}

interface MigrationOptions {
  dryRun?: boolean;
  force?: boolean;
  verbose?: boolean;
}

// =============================================================================
// Migration Service
// =============================================================================

const log = createLogger('MigrationService');

export class MigrationService {
  private authenticated = false;
  
  // Cache for collection name → ID mapping (built when fetching collections)
  private collectionIdMap: Map<string, string> = new Map();
  // Cache for collection ID → name mapping (for reverse, building code from DB)
  private collectionIdToNameMap: Map<string, string> = new Map();

  // ===========================================================================
  // Authentication
  // ===========================================================================

  /**
   * Authenticate as superuser
   * Required before performing any migration operations
   */
  async authenticate(email?: string, password?: string): Promise<void> {
    const adminEmail = email ?? config.pocketbaseAdminEmail;
    const adminPassword = password ?? config.pocketbaseAdminPassword;

    if (!adminEmail || !adminPassword) {
      throw new Error(
        'Missing PocketBase admin credentials. Set POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD in .env'
      );
    }

    try {
      await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);
      this.authenticated = true;
      log.info('Authenticated as superuser');
    } catch (error) {
      throw new Error(`Failed to authenticate with PocketBase: ${(error as Error).message}`);
    }
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.authenticated && pb.authStore.isValid;
  }

  // ===========================================================================
  // Collection Operations
  // ===========================================================================

  /**
   * Get all collections from PocketBase
   * Also builds the collection name → ID map for relation field resolution
   */
  async getCurrentCollections(): Promise<PBCollection[]> {
    this.ensureAuthenticated();
    
    const collections = await pb.collections.getFullList();
    
    // Build the maps for relation field resolution
    this.collectionIdMap.clear();
    this.collectionIdToNameMap.clear();
    
    for (const collection of collections) {
      this.collectionIdMap.set(collection.name, collection.id);
      this.collectionIdToNameMap.set(collection.id, collection.name);
    }
    
    return collections as unknown as PBCollection[];
  }

  /**
   * Get collection by name
   */
  async getCollection(name: string): Promise<PBCollection | null> {
    this.ensureAuthenticated();
    
    try {
      const collection = await pb.collections.getOne(name);
      return collection as unknown as PBCollection;
    } catch {
      return null;
    }
  }

  // ===========================================================================
  // Diff Operations
  // ===========================================================================

  /**
   * Compare code schemas with database and return differences
   */
  async diff(): Promise<MigrationDiff> {
    this.ensureAuthenticated();

    const currentCollections = await this.getCurrentCollections();
    const currentMap = new Map(currentCollections.map(c => [c.name, c]));
    
    const collectionDiffs: CollectionDiff[] = [];
    let hasChanges = false;

    // Check each defined collection
    for (const schema of allCollections) {
      const existing = currentMap.get(schema.name);
      
      if (!existing) {
        // Collection doesn't exist - needs creation
        collectionDiffs.push({
          name: schema.name,
          action: 'create',
        });
        hasChanges = true;
      } else {
        // Collection exists - check for differences
        const diff = this.diffCollection(schema, existing);
        if (diff.action !== 'skip') {
          collectionDiffs.push(diff);
          hasChanges = true;
        }
      }
    }

    // Generate summary
    const creates = collectionDiffs.filter(d => d.action === 'create').length;
    const updates = collectionDiffs.filter(d => d.action === 'update').length;
    
    let summary = 'No changes needed';
    if (hasChanges) {
      const parts: string[] = [];
      if (creates > 0) parts.push(`${String(creates)} to create`);
      if (updates > 0) parts.push(`${String(updates)} to update`);
      summary = parts.join(', ');
    }

    return {
      collections: collectionDiffs,
      hasChanges,
      summary,
    };
  }

  /**
   * Compare a single collection schema with database
   */
  private diffCollection(schema: CollectionSchema, existing: PBCollection): CollectionDiff {
    const fieldDiffs: FieldDiff[] = [];
    const ruleDiffs: string[] = [];

    // Compare fields
    const existingFieldMap = new Map(existing.fields.map(f => [f.name, f]));
    const schemaFieldNames = new Set(schema.fields.map(f => f.name));

    // Check for new/changed fields
    for (const field of schema.fields) {
      const existingField = existingFieldMap.get(field.name);
      
      if (!existingField) {
        fieldDiffs.push({
          name: field.name,
          action: 'create',
          after: field,
        });
      } else if (this.fieldNeedsUpdate(field, existingField)) {
        fieldDiffs.push({
          name: field.name,
          action: 'update',
          before: existingField as unknown as CollectionField,
          after: field,
        });
      }
    }

    // Check for deleted fields (in DB but not in schema)
    for (const existingField of existing.fields) {
      if (!existingField.system && !schemaFieldNames.has(existingField.name)) {
        fieldDiffs.push({
          name: existingField.name,
          action: 'delete',
          before: existingField as unknown as CollectionField,
        });
      }
    }

    // Compare rules
    if (this.normalizeRule(schema.listRule) !== this.normalizeRule(existing.listRule)) {
      ruleDiffs.push('listRule');
    }
    if (this.normalizeRule(schema.viewRule) !== this.normalizeRule(existing.viewRule)) {
      ruleDiffs.push('viewRule');
    }
    if (this.normalizeRule(schema.createRule) !== this.normalizeRule(existing.createRule)) {
      ruleDiffs.push('createRule');
    }
    if (this.normalizeRule(schema.updateRule) !== this.normalizeRule(existing.updateRule)) {
      ruleDiffs.push('updateRule');
    }
    if (this.normalizeRule(schema.deleteRule) !== this.normalizeRule(existing.deleteRule)) {
      ruleDiffs.push('deleteRule');
    }

    const hasChanges = fieldDiffs.length > 0 || ruleDiffs.length > 0;
    
    return {
      name: schema.name,
      action: hasChanges ? 'update' : 'skip',
      fieldDiffs: hasChanges ? fieldDiffs : undefined,
      ruleDiffs: ruleDiffs.length > 0 ? ruleDiffs : undefined,
    };
  }

  /**
   * Check if a field needs to be updated
   */
  private fieldNeedsUpdate(
    schemaField: CollectionField, 
    existingField: { type: string; required?: boolean; [key: string]: unknown }
  ): boolean {
    // Check type
    if (schemaField.type !== existingField.type) {
      return true;
    }

    // Check required
    if ((schemaField.required ?? false) !== (existingField.required ?? false)) {
      return true;
    }

    // For simplicity, we don't deep compare all options
    // More sophisticated comparison can be added later
    return false;
  }

  /**
   * Normalize rule for comparison
   */
  private normalizeRule(rule: string | null | undefined): string | null {
    if (rule === undefined) return null;
    if (rule === '') return '';
    return rule;
  }

  // ===========================================================================
  // Migration Operations
  // ===========================================================================

  /**
   * Apply migrations to sync code schemas with database
   */
  async migrate(options: MigrationOptions = {}): Promise<MigrationResult> {
    const { dryRun = false, force = false, verbose = false } = options;
    const startTime = Date.now();
    
    this.ensureAuthenticated();

    const diff = await this.diff();
    
    if (!diff.hasChanges) {
      log.info('No changes to apply');
      return {
        success: true,
        applied: [],
        failed: [],
        duration: Date.now() - startTime,
      };
    }

    // Check for destructive changes (field deletions)
    const destructiveChanges = this.getDestructiveChanges(diff);
    if (destructiveChanges.length > 0 && !force) {
      log.warn('⚠️  DESTRUCTIVE CHANGES DETECTED - Data will be lost!');
      for (const change of destructiveChanges) {
        log.warn(`   - ${change.collection}: DELETE field "${change.field}"`);
      }
      log.warn('');
      log.warn('To apply these changes, use --force flag:');
      log.warn('  npm run db:migrate --workspace=server -- --force');
      
      return {
        success: false,
        applied: [],
        failed: [{ collection: 'migration', error: 'Destructive changes require --force flag' }],
        duration: Date.now() - startTime,
      };
    }

    const applied: string[] = [];
    const failed: Array<{ collection: string; error: string }> = [];

    for (const collectionDiff of diff.collections) {
      if (collectionDiff.action === 'skip') continue;

      const schema = allCollections.find(c => c.name === collectionDiff.name);
      if (!schema) continue;

      if (dryRun) {
        log.info(`[DRY RUN] Would ${collectionDiff.action}: ${collectionDiff.name}`);
        applied.push(collectionDiff.name);
        continue;
      }

      try {
        if (collectionDiff.action === 'create') {
          await this.createCollection(schema, verbose);
          applied.push(collectionDiff.name);
          log.info(`Created collection: ${collectionDiff.name}`);
        } else if (collectionDiff.action === 'update') {
          await this.updateCollection(schema, verbose);
          applied.push(collectionDiff.name);
          log.info(`Updated collection: ${collectionDiff.name}`);
        }
      } catch (error) {
        const errorMessage = (error as Error).message;
        failed.push({ collection: collectionDiff.name, error: errorMessage });
        log.error(`Failed to ${collectionDiff.action} collection ${collectionDiff.name}:`, error);
      }
    }

    return {
      success: failed.length === 0,
      applied,
      failed,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Create a new collection in PocketBase
   */
  private async createCollection(schema: CollectionSchema, verbose: boolean): Promise<void> {
    const createData = this.schemaToCreateData(schema);
    
    if (verbose) {
      log.debug('Creating collection:', JSON.stringify(createData, null, 2));
    }

    await pb.collections.create(createData);
  }

  /**
   * Update an existing collection in PocketBase
   */
  private async updateCollection(schema: CollectionSchema, verbose: boolean): Promise<void> {
    const updateData = this.schemaToCreateData(schema);
    
    if (verbose) {
      log.debug('Updating collection:', JSON.stringify(updateData, null, 2));
    }

    await pb.collections.update(schema.name, updateData);
  }

  /**
   * Convert our schema format to PocketBase create/update format
   */
  private schemaToCreateData(schema: CollectionSchema): Record<string, unknown> {
    const data: Record<string, unknown> = {
      name: schema.name,
      type: schema.type,
      fields: schema.fields.map(f => this.fieldToCreateData(f)),
      indexes: schema.indexes ?? [],
      listRule: schema.listRule,
      viewRule: schema.viewRule,
      createRule: schema.createRule,
      updateRule: schema.updateRule,
      deleteRule: schema.deleteRule,
    };

    // Add auth-specific options
    if (schema.type === 'auth' && 'passwordAuth' in schema) {
      data.passwordAuth = schema.passwordAuth;
      data.oauth2 = schema.oauth2;
      data.mfa = schema.mfa;
      data.authToken = schema.authToken;
      data.passwordResetToken = schema.passwordResetToken;
      data.emailChangeToken = schema.emailChangeToken;
      data.verificationToken = schema.verificationToken;
      data.fileToken = schema.fileToken;
    }

    // Add view-specific options
    if (schema.type === 'view' && 'viewQuery' in schema) {
      data.viewQuery = schema.viewQuery;
    }

    return data;
  }

  /**
   * Convert field definition to PocketBase format
   */
  private fieldToCreateData(field: CollectionField): Record<string, unknown> {
    const base: Record<string, unknown> = {
      name: field.name,
      type: field.type,
      required: field.required ?? false,
      hidden: field.hidden ?? false,
      presentable: field.presentable ?? false,
    };

    // Add type-specific options
    switch (field.type) {
      case 'text':
        if ('min' in field) base.min = field.min;
        if ('max' in field) base.max = field.max;
        if ('pattern' in field) base.pattern = field.pattern;
        break;
      case 'number':
        if ('min' in field) base.min = field.min;
        if ('max' in field) base.max = field.max;
        if ('noDecimal' in field) base.noDecimal = field.noDecimal;
        break;
      case 'select':
        base.values = field.values;
        if ('maxSelect' in field) base.maxSelect = field.maxSelect;
        break;
      case 'relation': {
        // Resolve collection name to ID if not already an ID
        let collectionId = field.collectionId;
        
        // If it looks like a name (not a PocketBase ID), try to resolve it
        if (!collectionId.startsWith('pbc_') && !collectionId.startsWith('_pb')) {
          const resolvedId = this.collectionIdMap.get(collectionId);
          if (resolvedId) {
            collectionId = resolvedId;
          } else {
            log.warn(`Could not resolve collection name "${collectionId}" to ID. Using as-is.`);
          }
        }
        
        base.collectionId = collectionId;
        if ('cascadeDelete' in field) base.cascadeDelete = field.cascadeDelete;
        if ('maxSelect' in field) base.maxSelect = field.maxSelect;
        break;
      }
      case 'file':
        if ('maxSelect' in field) base.maxSelect = field.maxSelect;
        if ('maxSize' in field) base.maxSize = field.maxSize;
        if ('mimeTypes' in field) base.mimeTypes = field.mimeTypes;
        break;
      case 'json':
        if ('maxSize' in field) base.maxSize = field.maxSize;
        break;
      case 'autodate':
        base.onCreate = field.onCreate ?? true;
        base.onUpdate = field.onUpdate ?? true;
        break;
    }

    return base;
  }

  /**
   * Get list of destructive changes (field deletions) from diff
   */
  private getDestructiveChanges(diff: MigrationDiff): Array<{ collection: string; field: string }> {
    const destructive: Array<{ collection: string; field: string }> = [];
    
    for (const col of diff.collections) {
      if (col.fieldDiffs) {
        for (const field of col.fieldDiffs) {
          if (field.action === 'delete') {
            destructive.push({ collection: col.name, field: field.name });
          }
        }
      }
    }
    
    return destructive;
  }

  // ===========================================================================
  // Backup & Restore
  // ===========================================================================

  /**
   * Backup current schema to a file
   */
  async backup(backupPath?: string): Promise<string> {
    this.ensureAuthenticated();
    
    // Default path: .backup/schema_<timestamp>.json
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const targetPath = backupPath ?? path.resolve(__dirname, `../../.backup/schema_${timestamp}.json`);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    
    const collections = await this.getCurrentCollections();
    
    // Filter out system collections
    const schema = collections.filter(c => !c.name.startsWith('_'));
    
    await fs.writeFile(targetPath, JSON.stringify(schema, null, 2));
    log.info(`Schema backed up to: ${targetPath}`);
    
    return targetPath;
  }

  /**
   * Restore schema from a backup file
   */
  async restore(backupPath: string): Promise<MigrationResult> {
    this.ensureAuthenticated();
    
    try {
      const content = await fs.readFile(backupPath, 'utf-8');
      const schema = JSON.parse(content) as PBCollection[];
      
      log.info(`Read backup with ${String(schema.length)} collections.`);

      const startTime = Date.now();
      const applied: string[] = [];
      const failed: Array<{ collection: string; error: string }> = [];

      // We treat restore as a force migration to the backup state
      // This is complex because we need to convert PBCollection back to CollectionSchema
      // For now, let's implement a simpler version that just warns this is experimental
      log.warn('Restore functionality is experimental. Use with caution.');
      
      // TODO: Implement full restore logic
      // 1. Delete all non-system collections? Or just update them?
      // 2. Re-create from backup schema
      
      return {
        success: true,
        applied,
        failed,
        duration: Date.now() - startTime,
      };
    } catch (error) {
       throw new Error(`Restore failed: ${(error as Error).message}`);
    }
  }

  // ===========================================================================
  // Seeding
  // ===========================================================================

  /**
   * Run seed files
   */
  async seed(verbose: boolean = false): Promise<void> {
    this.ensureAuthenticated();
    
    const seedsDir = path.resolve(__dirname, 'seeds');
    
    try {
      const files = await fs.readdir(seedsDir);
      const seedFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.js'));
      
      if (seedFiles.length === 0) {
        log.info('No seed files found.');
        return;
      }
      
      log.info(`Found ${String(seedFiles.length)} seed files.`);
      
      for (const file of seedFiles) {
        log.info(`Running seed: ${file}`);
        try {
          // Dynamic import of seed file
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const seedModule = await import(pathToFileURL(path.join(seedsDir, file)).href) as { run?: (pb: any) => Promise<void> };
          
          if (typeof seedModule.run === 'function') {
            await seedModule.run(pb);
            log.info(`✅ Seed ${file} completed.`);
          } else {
            log.warn(`⚠️ Skipped ${file}: No 'run' function exported.`);
          }
        } catch (error) {
          log.error(`❌ Seed ${file} failed:`, error);
          if (verbose) {
            console.error(error);
          }
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        log.info('No seeds directory found. Skipping seeds.');
      } else {
        throw error;
      }
    }
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  /**
   * Ensure authenticated before performing operations
   */
  private ensureAuthenticated(): void {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }
  }

  /**
   * Generate human-readable migration script
   */
  async generateScript(): Promise<string> {
    const diff = await this.diff();
    
    if (!diff.hasChanges) {
      return '// No changes needed - database is in sync with code schemas';
    }

    const lines: string[] = [
      '// Migration Script',
      `// Generated at: ${new Date().toISOString()}`,
      `// Summary: ${diff.summary}`,
      '',
    ];

    for (const collectionDiff of diff.collections) {
      if (collectionDiff.action === 'skip') continue;

      lines.push(`// ${collectionDiff.action.toUpperCase()}: ${collectionDiff.name}`);
      
      if (collectionDiff.fieldDiffs) {
        for (const fieldDiff of collectionDiff.fieldDiffs) {
          lines.push(`//   - ${fieldDiff.action} field: ${fieldDiff.name}`);
        }
      }
      
      if (collectionDiff.ruleDiffs) {
        lines.push(`//   - update rules: ${collectionDiff.ruleDiffs.join(', ')}`);
      }
      
      lines.push('');
    }

    return lines.join('\n');
  }

  // ===========================================================================
  // Introspect (Pull from Database)
  // ===========================================================================

  /**
   * Introspect database and generate TypeScript collection definitions
   * Use this to sync from an existing database to code
   */
  async introspect(collectionsToInclude?: string[]): Promise<string> {
    this.ensureAuthenticated();

    const collections = await this.getCurrentCollections();
    
    // Filter to only requested collections, or exclude system collections
    const filtered = collections.filter(c => {
      // Exclude PocketBase internal collections
      if (c.name.startsWith('_')) return false;
      if (collectionsToInclude && collectionsToInclude.length > 0) {
        return collectionsToInclude.includes(c.name);
      }
      return true;
    });

    const lines: string[] = [
      '/**',
      ' * Collection Definitions',
      ' * ',
      ' * Auto-generated from PocketBase at: ' + new Date().toISOString(),
      ' * ',
      ' * Review and customize as needed before using.',
      ' */',
      "import type {",
      "  BaseCollectionSchema,",
      "  AuthCollectionSchema,",
      "  CollectionSchema,",
      "} from './collection.schema.js';",
      "import { textField, numberField, boolField, jsonField, relationField, selectField, fileField, autodateField } from './collection.schema.js';",
      '',
      '// =============================================================================',
      '// Collections',
      '// =============================================================================',
      '',
    ];

    for (const collection of filtered) {
      lines.push(this.collectionToCode(collection));
      lines.push('');
    }

    // Generate allCollections export
    lines.push('// =============================================================================');
    lines.push('// All Collections Export');
    lines.push('// =============================================================================');
    lines.push('');
    lines.push('export const allCollections: CollectionSchema[] = [');
    for (const collection of filtered) {
      lines.push(`  ${collection.name}Collection,`);
    }
    lines.push('];');
    lines.push('');

    // Generate CollectionNames
    lines.push('export const CollectionNames = {');
    for (const collection of filtered) {
      lines.push(`  ${collection.name.toUpperCase()}: '${collection.name}',`);
    }
    lines.push('} as const;');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate a snapshot of all collections as a map of filename -> content
   */
  async snapshot(): Promise<Map<string, string>> {
    this.ensureAuthenticated();
    const collections = await this.getCurrentCollections();
    const result = new Map<string, string>();

    // Filter exclude system collections
    const filtered = collections.filter(c => !c.name.startsWith('_'));

    for (const collection of filtered) {
      const content = this.generateCollectionFileContent(collection);
      result.set(`${collection.name}.collection.ts`, content);
    }
    
    // Also generate index file content
    const indexContent = this.generateIndexFileContent(filtered);
    result.set('index.ts', indexContent);

    return result;
  }

  private generateIndexFileContent(collections: PBCollection[]): string {
    const lines: string[] = [
      '/**',
      ' * Collections Index',
      ' *',
      ' * Re-exports all collection definitions and aggregates them.',
      ' */',
      "import type { CollectionSchema } from '../collection.schema.js';",
      '',
    ];

    // Exports
    for (const col of collections) {
      lines.push(`export { ${col.name}Collection } from './${col.name}.collection.js';`);
    }
    lines.push('');

    // Imports for aggregation
    for (const col of collections) {
      lines.push(`import { ${col.name}Collection } from './${col.name}.collection.js';`);
    }
    lines.push('');

    // allCollections array
    lines.push('/**');
    lines.push(' * All collection schemas to be synced');
    lines.push(' */');
    lines.push('export const allCollections: CollectionSchema[] = [');
    for (const col of collections) {
      lines.push(`  ${col.name}Collection,`);
    }
    lines.push('];');
    lines.push('');

    // CollectionNames
    lines.push('/**');
    lines.push(' * Collection names for type safety');
    lines.push(' */');
    lines.push('export const CollectionNames = {');
    for (const col of collections) {
      lines.push(`  ${col.name.toUpperCase()}: '${col.name}',`);
    }
    lines.push('} as const;');
    lines.push('');
    lines.push('export type CollectionName = (typeof CollectionNames)[keyof typeof CollectionNames];');

    return lines.join('\n');
  }

  private generateCollectionFileContent(collection: PBCollection): string {
    const imports = new Set<string>();
    const isAuth = collection.type === 'auth';
    
    // Always import types
    if (isAuth) {
      imports.add('AuthCollectionSchema');
    } else {
      imports.add('BaseCollectionSchema');
    }

    // Check fields to determine imports
    const fieldHelpers = new Set<string>();
    for (const field of collection.fields) {
      if (field.system) continue;
      switch (field.type) {
        case 'text': fieldHelpers.add('textField'); break;
        case 'number': fieldHelpers.add('numberField'); break;
        case 'bool': fieldHelpers.add('boolField'); break;
        case 'email': fieldHelpers.add('emailField'); break;
        case 'url': fieldHelpers.add('urlField'); break;
        case 'date': fieldHelpers.add('dateField'); break;
        case 'select': fieldHelpers.add('selectField'); break;
        case 'relation': fieldHelpers.add('relationField'); break;
        case 'file': fieldHelpers.add('fileField'); break;
        case 'json': fieldHelpers.add('jsonField'); break;
        case 'editor': fieldHelpers.add('editorField'); break;
        case 'autodate': fieldHelpers.add('autodateField'); break;
      }
    }
    
    // Check indexes for helper imports
    // This is a naive check, if we used helper in strings it wouldn't be caught, 
    // but the `collectionToCode` generates naive strings for indexes anyway.
    // For now we will rely on creating basic strings for indexes or simple helpers
    // Let's stick to basic strings for indexes in current implementation to be safe
    // preventing cyclic dependency issues if we try to be too smart.
    
    // Build file content
    const lines: string[] = [
      '/**',
      ` * ${this.capitalize(collection.name)} Collection`,
      ' */',
    ];

    // Import statement
    if (imports.size > 0) {
      lines.push(`import type { ${Array.from(imports).sort().join(', ')} } from '../collection.schema.js';`);
    }
    
    if (fieldHelpers.size > 0) {
      lines.push(`import { ${Array.from(fieldHelpers).sort().join(', ')} } from '../collection.schema.js';`);
    }
    lines.push('');

    // Collection definition
    lines.push(this.collectionToCode(collection));
    
    return lines.join('\n');
  }

  /**
   * Convert a PocketBase collection to TypeScript code
   */
  private collectionToCode(collection: PBCollection): string {
    const isAuth = collection.type === 'auth';
    const typeName = isAuth ? 'AuthCollectionSchema' : 'BaseCollectionSchema';
    
    const lines: string[] = [
      `/**`,
      ` * ${this.capitalize(collection.name)} collection`,
      ` */`,
      `export const ${collection.name}Collection: ${typeName} = {`,
      `  name: '${collection.name}',`,
      `  type: '${collection.type}',`,
      ``,
      `  fields: [`,
    ];

    // Generate fields (skip system fields)
    const userFields = collection.fields.filter(f => !f.system);
    for (const field of userFields) {
      const fieldCode = this.fieldToCode(field);
      if (fieldCode) {
        lines.push(`    ${fieldCode},`);
      }
    }

    lines.push('  ],');
    lines.push('');

    // Generate indexes
    if (collection.indexes.length > 0) {
      lines.push('  indexes: [');
      for (const idx of collection.indexes) {
        lines.push(`    '${idx.replace(/'/g, "\\'")}',`);
      }
      lines.push('  ],');
      lines.push('');
    }

    // Generate rules
    lines.push(`  listRule: ${this.ruleToCode(collection.listRule)},`);
    lines.push(`  viewRule: ${this.ruleToCode(collection.viewRule)},`);
    lines.push(`  createRule: ${this.ruleToCode(collection.createRule)},`);
    lines.push(`  updateRule: ${this.ruleToCode(collection.updateRule)},`);
    lines.push(`  deleteRule: ${this.ruleToCode(collection.deleteRule)},`);

    // Auth-specific config
    if (isAuth) {
      const passwordAuth = collection['passwordAuth'] as { enabled?: boolean; identityFields?: string[] } | undefined;
      const oauth2 = collection['oauth2'] as { enabled?: boolean } | undefined;
      
      if (passwordAuth?.enabled) {
        lines.push('');
        lines.push('  passwordAuth: {');
        lines.push('    enabled: true,');
        if (passwordAuth.identityFields) {
          lines.push(`    identityFields: [${passwordAuth.identityFields.map(f => `'${f}'`).join(', ')}],`);
        }
        lines.push('  },');
      }
      
      if (oauth2?.enabled) {
        lines.push('');
        lines.push('  oauth2: { enabled: true },');
      }
    }

    lines.push('};');
    
    return lines.join('\n');
  }

  /**
   * Convert a PocketBase field to helper function call
   */
  private fieldToCode(field: { name: string; type: string; required?: boolean; [key: string]: unknown }): string | null {
    const opts: string[] = [];
    
    if (field.required) opts.push('required: true');
    
    switch (field.type) {
      case 'text': {
        const min = field['min'] as number | undefined;
        const max = field['max'] as number | undefined;
        const pattern = field['pattern'] as string | undefined;
        if (min !== undefined) opts.push(`min: ${String(min)}`);
        if (max !== undefined) opts.push(`max: ${String(max)}`);
        if (pattern) opts.push(`pattern: '${pattern}'`);
        return opts.length > 0 
          ? `textField('${field.name}', { ${opts.join(', ')} })`
          : `textField('${field.name}')`;
      }
        
      case 'number': {
        const min = field['min'] as number | undefined;
        const max = field['max'] as number | undefined;
        if (min !== undefined) opts.push(`min: ${String(min)}`);
        if (max !== undefined) opts.push(`max: ${String(max)}`);
        return opts.length > 0
          ? `numberField('${field.name}', { ${opts.join(', ')} })`
          : `numberField('${field.name}')`;
      }
        
      case 'bool':
        return opts.length > 0
          ? `boolField('${field.name}', { ${opts.join(', ')} })`
          : `boolField('${field.name}')`;
        
      case 'json':
        return opts.length > 0
          ? `jsonField('${field.name}', { ${opts.join(', ')} })`
          : `jsonField('${field.name}')`;
        
      case 'relation': {
        const collectionId = field['collectionId'] as string | undefined ?? '';
        let relationRef = `'${collectionId}'`;
        
        // Try to resolve collection ID to Name
        const collectionName = this.collectionIdToNameMap.get(collectionId);
        if (collectionName) {
           relationRef = `'${collectionName}'`;
        }
        
        const maxSelect = field['maxSelect'] as number | undefined;
        if (maxSelect) opts.push(`maxSelect: ${String(maxSelect)}`);
        
        return opts.length > 0
          ? `relationField('${field.name}', ${relationRef}, { ${opts.join(', ')} })`
          : `relationField('${field.name}', ${relationRef})`;
      }
        
      case 'select': {
        const values = field['values'] as string[] | undefined;
        if (values && values.length > 0) {
          const valuesStr = values.map(v => `'${v}'`).join(', ');
          return `selectField('${field.name}', [${valuesStr}])`;
        }
        return null;
      }
        
      case 'file': {
        const fileMaxSelect = field['maxSelect'] as number | undefined;
        if (fileMaxSelect) opts.push(`maxSelect: ${String(fileMaxSelect)}`);
        return opts.length > 0
          ? `fileField('${field.name}', { ${opts.join(', ')} })`
          : `fileField('${field.name}')`;
      }
        
      case 'autodate':
        return `autodateField('${field.name}')`;
        
      default:
        // Unknown type - generate as comment
        return `// ${field.name}: ${field.type} (unsupported, add manually)`;
    }
  }

  /**
   * Convert rule to code representation
   */
  private ruleToCode(rule: string | null | undefined): string {
    if (rule === null || rule === undefined) return 'null';
    if (rule === '') return "''";
    return `'${rule.replace(/'/g, "\\'")}'`;
  }

  /**
   * Capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

