import { pool } from '../db/index.js';

async function seed() {
  console.log('Altering column constraint and seeding BTC and ETH...');
  
  // 1. Drop NOT NULL constraint on account_title so crypto channels can be null
  try {
    await pool.query(`ALTER TABLE deposit_payment_methods ALTER COLUMN account_title DROP NOT NULL;`);
    console.log('Dropped NOT NULL constraint on account_title successfully.');
  } catch (e) {
    console.warn('Constraint alter notice:', e);
  }

  // 2. Update existing USDT
  await pool.query(`
    UPDATE deposit_payment_methods 
    SET account_title = NULL, name = 'USDT (TRC20)', network_or_bank = 'TRC20 (Tron Network)'
    WHERE id = 'pm_usdt_trc20';
  `);

  // 3. Insert or update Bitcoin (BTC)
  await pool.query(`
    INSERT INTO deposit_payment_methods (
      id, name, category, icon_type, icon_url, account_title, account_number, 
      till_id, network_or_bank, qr_code_url, instructions, min_deposit, max_deposit, fee_percent, is_active
    ) VALUES (
      'pm_btc',
      'Bitcoin (BTC)',
      'crypto',
      'btc',
      'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      NULL,
      'bc1q9d84r82m04wks34z6t89lhsq82n890123hfkws',
      NULL,
      'Bitcoin Network (BTC)',
      'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=bc1q9d84r82m04wks34z6t89lhsq82n890123hfkws',
      'Send only Bitcoin (BTC) to this address. Requires 2 network confirmations for automatic balance clearance.',
      30.00,
      500000.00,
      0.00,
      TRUE
    ) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      category = EXCLUDED.category,
      icon_type = EXCLUDED.icon_type,
      account_title = NULL,
      account_number = EXCLUDED.account_number,
      network_or_bank = EXCLUDED.network_or_bank,
      instructions = EXCLUDED.instructions,
      is_active = TRUE;
  `);

  // 4. Insert or update Ethereum (ETH)
  await pool.query(`
    INSERT INTO deposit_payment_methods (
      id, name, category, icon_type, icon_url, account_title, account_number, 
      till_id, network_or_bank, qr_code_url, instructions, min_deposit, max_deposit, fee_percent, is_active
    ) VALUES (
      'pm_eth',
      'Ethereum (ETH)',
      'crypto',
      'eth',
      'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      NULL,
      '0x71C838961F35d326C2eB4A346Cfe9454fF517F72',
      NULL,
      'Ethereum (ERC-20)',
      'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=0x71C838961F35d326C2eB4A346Cfe9454fF517F72',
      'Send only ETH or ERC-20 assets via Ethereum mainnet. Smart contract verifies and credits within 12 network blocks.',
      25.00,
      500000.00,
      0.00,
      TRUE
    ) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      category = EXCLUDED.category,
      icon_type = EXCLUDED.icon_type,
      account_title = NULL,
      account_number = EXCLUDED.account_number,
      network_or_bank = EXCLUDED.network_or_bank,
      instructions = EXCLUDED.instructions,
      is_active = TRUE;
  `);

  const res = await pool.query('SELECT id, name, category, icon_type, account_title, account_number FROM deposit_payment_methods ORDER BY id ASC;');
  console.log('Updated Payment Methods in DB:', res.rows);
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
