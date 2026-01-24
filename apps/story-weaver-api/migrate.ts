import dotenv from 'dotenv';
import { migrateVideoProjects } from './src/database/migrations/001_rename_collections.js';

dotenv.config();

console.log('Running migration...');
migrateVideoProjects()
  .then(() => console.log('Done'))
  .catch((e) => console.error(e));
