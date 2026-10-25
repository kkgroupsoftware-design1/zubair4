import { pool } from './index.js';

async function verify() {
  try {
    const res = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    );
    console.log('ACTIVE_POSTGRES_TABLES:', res.rows.map((r: any) => r.table_name));

    const usersRes = await pool.query("SELECT id, name, email, role, kyc_status FROM users;");
    console.log('REGISTERED_USERS:', usersRes.rows);

    const plansRes = await pool.query("SELECT id, name, min_invest, max_invest, daily_reward_rate FROM investment_plans;");
    console.log('INVESTMENT_PLANS_COUNT:', plansRes.rowCount);

    const methodsRes = await pool.query("SELECT id, name, category, is_active FROM deposit_payment_methods;");
    console.log('PAYMENT_METHODS_COUNT:', methodsRes.rowCount);

    const rewardsRes = await pool.query("SELECT COUNT(*) FROM daily_rewards;");
    console.log('MOCK_REWARDS_COUNT (Should be 0):', rewardsRes.rows[0].count);

    const depositsRes = await pool.query("SELECT COUNT(*) FROM deposits;");
    console.log('MOCK_DEPOSITS_COUNT (Should be 0):', depositsRes.rows[0].count);

    await pool.end();
  } catch (err) {
    console.error('VERIFY ERROR:', err);
    process.exit(1);
  }
}

verify();
