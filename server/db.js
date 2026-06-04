import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { getConfig } from './config.js';

const { Pool } = pg;
const migrationUrl = new URL('./migrations/001_init.sql', import.meta.url);

let pool;

export function getPool() {
  if (pool) return pool;

  const { databaseUrl } = getConfig();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  pool = new Pool({
    connectionString: databaseUrl,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  pool.on('error', () => {
    console.error('Unexpected database connection error');
  });

  return pool;
}

export async function initializeDatabase() {
  const { initialTotalQuantity } = getConfig();
  const migration = await readFile(fileURLToPath(migrationUrl), 'utf8');
  const database = getPool();

  await database.query(migration);
  await database.query(
    `INSERT INTO campaign_counters (counter_key, total_quantity, sold_count)
     VALUES ('main', $1, 0)
     ON CONFLICT (counter_key) DO NOTHING`,
    [initialTotalQuantity],
  );
}

export async function closeDatabase() {
  if (!pool) return;

  const database = pool;
  pool = undefined;
  await database.end();
}
