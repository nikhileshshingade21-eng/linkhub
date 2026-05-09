/**
 * Run database migrations
 * Usage: npx tsx api/scripts/migrate.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/shared/db/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log('🔧 Running migrations...\n');

  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const client = await pool.connect();

  try {
    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        ran_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Get already-ran migrations
    const { rows: ran } = await client.query('SELECT name FROM _migrations');
    const ranNames = new Set(ran.map(r => r.name));

    for (const file of files) {
      if (ranNames.has(file)) {
        console.log(`  ⏭  ${file} (already applied)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  ✅ ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ❌ ${file} failed:`, err);
        throw err;
      }
    }

    console.log('\n✅ All migrations complete.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
