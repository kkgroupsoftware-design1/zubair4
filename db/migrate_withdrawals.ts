import { pool } from './index.js';

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('[Migration] Updating withdrawals table and withdrawal_payment_methods...');

    // 1. Add columns to withdrawals
    await client.query(`
      ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
      ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS admin_comment TEXT;
      ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS tx_hash TEXT;
    `);

    // 2. Create withdrawal_payment_methods table
    await client.query(`
      CREATE TABLE IF NOT EXISTS withdrawal_payment_methods (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        symbol VARCHAR(32) NOT NULL,
        network VARCHAR(64) NOT NULL,
        icon_type VARCHAR(64) DEFAULT 'usdt',
        icon_url TEXT,
        min_withdrawal NUMERIC(15, 2) DEFAULT 20.00,
        max_withdrawal NUMERIC(15, 2) DEFAULT 50000.00,
        fee_fixed NUMERIC(15, 2) DEFAULT 1.00,
        fee_percent NUMERIC(5, 2) DEFAULT 0.00,
        instructions TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Seed default 4 crypto methods
    const defaultMethods = [
      {
        id: 'wth_usdt_trc20',
        name: 'USDT TRC20',
        symbol: 'USDT',
        network: 'TRC20 (Tron Network)',
        icon_type: 'usdt',
        icon_url: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
        min_withdrawal: 20.00,
        max_withdrawal: 50000.00,
        fee_fixed: 1.00,
        fee_percent: 0.00,
        instructions: 'Provide your TRC20 address (begins with T). Transferred via Tron blockchain with $1.00 fixed network fee.',
        is_active: true,
      },
      {
        id: 'wth_usdt_erc20',
        name: 'USDT ERC20',
        symbol: 'USDT',
        network: 'ERC20 (Ethereum Network)',
        icon_type: 'usdt',
        icon_url: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
        min_withdrawal: 30.00,
        max_withdrawal: 50000.00,
        fee_fixed: 5.00,
        fee_percent: 0.00,
        instructions: 'Provide your ERC20 address (begins with 0x). Transferred via Ethereum network with $5.00 gas fee.',
        is_active: true,
      },
      {
        id: 'wth_eth',
        name: 'ETH (Ethereum)',
        symbol: 'ETH',
        network: 'Ethereum Mainnet',
        icon_type: 'eth',
        icon_url: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
        min_withdrawal: 30.00,
        max_withdrawal: 50000.00,
        fee_fixed: 3.00,
        fee_percent: 0.00,
        instructions: 'Provide your native Ethereum address (begins with 0x). Instant payout upon administrative broadcast.',
        is_active: true,
      },
      {
        id: 'wth_btc',
        name: 'BTC (Bitcoin)',
        symbol: 'BTC',
        network: 'Bitcoin Network',
        icon_type: 'btc',
        icon_url: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        min_withdrawal: 50.00,
        max_withdrawal: 50000.00,
        fee_fixed: 4.00,
        fee_percent: 0.00,
        instructions: 'Provide your native Bitcoin address (begins with 1, 3, or bc1). Settles across Bitcoin blockchain.',
        is_active: true,
      },
    ];

    for (const m of defaultMethods) {
      await client.query(`
        INSERT INTO withdrawal_payment_methods (id, name, symbol, network, icon_type, icon_url, min_withdrawal, max_withdrawal, fee_fixed, fee_percent, instructions, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          symbol = EXCLUDED.symbol,
          network = EXCLUDED.network,
          icon_type = EXCLUDED.icon_type,
          icon_url = EXCLUDED.icon_url,
          instructions = EXCLUDED.instructions;
      `, [
        m.id, m.name, m.symbol, m.network, m.icon_type, m.icon_url,
        m.min_withdrawal, m.max_withdrawal, m.fee_fixed, m.fee_percent,
        m.instructions, m.is_active
      ]);
    }

    console.log('[Migration] Success! Table and 4 crypto withdrawal methods verified.');
  } catch (err) {
    console.error('[Migration Error]', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
