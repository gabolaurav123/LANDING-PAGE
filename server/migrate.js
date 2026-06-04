import { assertDatabaseConfig } from './config.js';
import { closeDatabase, initializeDatabase } from './db.js';

try {
  assertDatabaseConfig();
  await initializeDatabase();
  console.log('Database migration completed');
} catch {
  console.error('Database migration failed. Check DATABASE_URL and database access.');
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
