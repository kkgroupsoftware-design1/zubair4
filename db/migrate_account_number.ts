import { pool } from './index.js';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE deposit_payment_methods
      ALTER COLUMN account_number DROP NOT NULL;
    `);
    console.log('✅ account_number column is now nullable in deposit_payment_methods');
  } catch (err: any) {
    // Already nullable or other non-fatal issue
    if (err.message && err.message.includes('does not exist')) {
      console.log('Column already nullable or constraint does not exist — skipping.');
    } else {
      throw err;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
