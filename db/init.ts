import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('[DB Init] Connecting to PostgreSQL database...');
    
    // 1. Run DDL Schema Migration
    const schemaCandidates = [
      path.join(__dirname, 'schema.sql'),
      path.join(__dirname, 'db', 'schema.sql'),
      path.join(process.cwd(), 'db', 'schema.sql'),
      path.join(__dirname, '..', 'db', 'schema.sql'),
    ];
    const schemaPath = schemaCandidates.find((p) => fs.existsSync(p));
    if (!schemaPath) {
      throw new Error(`[DB Init] schema.sql not found in candidate paths: ${schemaCandidates.join(', ')}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schemaSql);

    // Synchronize optional columns on existing tables
    await client.query(`
      ALTER TABLE deposits ADD COLUMN IF NOT EXISTS plan_id VARCHAR(64);
      ALTER TABLE deposits ADD COLUMN IF NOT EXISTS plan_name VARCHAR(255);
      ALTER TABLE deposits ADD COLUMN IF NOT EXISTS investment_id VARCHAR(64);
      ALTER TABLE deposits ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE deposits ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255);
      ALTER TABLE active_investments ADD COLUMN IF NOT EXISTS deposit_id VARCHAR(64);
      ALTER TABLE kyc_verifications ADD COLUMN IF NOT EXISTS advance_kyc_allowed BOOLEAN DEFAULT TRUE;
      ALTER TABLE kyc_verifications ADD COLUMN IF NOT EXISTS basic_status VARCHAR(64) DEFAULT 'Not Started';
      ALTER TABLE kyc_verifications ADD COLUMN IF NOT EXISTS advance_status VARCHAR(64) DEFAULT 'Not Started';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS withdraw_pin_hash VARCHAR(64);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_rewards_user_plan_date ON daily_rewards (user_id, plan_name, reward_date);

      -- Synchronize KYC tier statuses for existing records
      UPDATE kyc_verifications
      SET basic_status = CASE 
            WHEN status = 'Approved' THEN 'Approved'
            WHEN first_name IS NOT NULL OR doc_number IS NOT NULL THEN 'Approved'
            ELSE 'Not Started'
          END,
          advance_status = CASE 
            WHEN status = 'Approved' THEN 'Approved'
            WHEN status = 'Rejected' THEN 'Rejected'
            WHEN document_front_url IS NOT NULL OR selfie_url IS NOT NULL THEN 'Under Review'
            ELSE 'Not Started'
          END,
          advance_kyc_allowed = TRUE
      WHERE basic_status IS NULL OR basic_status = 'Not Started' OR advance_status IS NULL;

      -- Ensure every user has a valid RENTO-XXXX format referral code (random 4-digit numeric suffix)
      UPDATE users
      SET referral_code = 'RENTO-' || (1000 + floor(random() * 9000))::int
      WHERE referral_code IS NULL OR referral_code = '' OR referral_code NOT LIKE 'RENTO-%';
    `);
    console.log('[DB Init] Schema tables verified and synchronized.');

    // 2. Schema is already created above via schema.sql (CREATE TABLE IF NOT EXISTS).
    // No data wipe — this runs on every server start so we never destroy real user data.

    // 3. Upsert SuperAdmin User
    const adminUser = {
      id: 'usr_admin_001',
      name: 'RentoBit Admin',
      first_name: 'Admin',
      last_name: 'Supervisor',
      email: 'admin@rentobit.com',
      password_hash: 'Admin@rentobit2026', // Production Admin Password
      phone: '+1 (800) 555-0199',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      status: 'Active',
      kyc_status: 'Approved',
      two_factor_enabled: true,
      referral_code: 'RENTO-HQ',
    };

    await client.query(`
      INSERT INTO users (id, name, first_name, last_name, email, password_hash, phone, avatar, role, status, kyc_status, two_factor_enabled, referral_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        kyc_status = EXCLUDED.kyc_status,
        status = EXCLUDED.status;
    `, [
      adminUser.id,
      adminUser.name,
      adminUser.first_name,
      adminUser.last_name,
      adminUser.email,
      adminUser.password_hash,
      adminUser.phone,
      adminUser.avatar,
      adminUser.role,
      adminUser.status,
      adminUser.kyc_status,
      adminUser.two_factor_enabled,
      adminUser.referral_code,
    ]);

    await client.query(`
      INSERT INTO balances (user_id, total_balance, available_balance, total_invested, today_reward, active_plans_count)
      VALUES ($1, 0.00, 0.00, 0.00, 0.00, 0)
      ON CONFLICT (user_id) DO NOTHING;
    `, [adminUser.id]);

    // 4. Seed Standard Clean Investment Plans
    const defaultPlans = [
      {
        id: 'plan_economy',
        name: 'Economy Plan',
        category: 'ECONOMY',
        vehicle_examples: ['Toyota Corolla', 'Honda Civic', 'Hyundai Elantra', 'Nissan Sentra'],
        min_invest: 10.00,
        max_invest: 300.00,
        daily_reward_rate: 1.5, // 1.5% daily
        duration_days: 90,
        image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80',
        accent_color: '#3B82F6',
        badge_color: '#60A5FA',
        is_popular: false,
        description: 'Entry-level fleet allocation targeting high-demand ride-share economy vehicles.',
        features: ['Weekly Automated Payouts', '100% Capital Principal Protection', 'Verified Urban Rideshare Fleets'],
        payout_frequency: 'Weekly',
      },
      {
        id: 'plan_standard',
        name: 'Standard Plan',
        category: 'STANDARD',
        vehicle_examples: ['Toyota Camry Hybrid', 'Honda Accord', 'Kia K5', 'Hyundai Sonata'],
        min_invest: 301.00,
        max_invest: 980.00,
        daily_reward_rate: 2.2, // 2.2% daily
        duration_days: 120,
        image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
        accent_color: '#10B981',
        badge_color: '#34D399',
        is_popular: true,
        description: 'Mid-tier sedan fleet with high utilization rates across corporate transport contracts.',
        features: ['Automated Weekly ROI Distribution', 'Tier-1 Corporate Sedan Contracts', '24/7 Telematics & Asset Shield'],
        payout_frequency: 'Weekly',
      },
      {
        id: 'plan_suv',
        name: 'SUV & Executive Plan',
        category: 'SUV',
        vehicle_examples: ['Toyota RAV4', 'Honda CR-V', 'Ford Explorer', 'Kia Telluride'],
        min_invest: 981.00,
        max_invest: 1720.00,
        daily_reward_rate: 3.3, // 3.3% daily
        duration_days: 180,
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
        accent_color: '#8B5CF6',
        badge_color: '#A78BFA',
        is_popular: false,
        description: 'High-demand SUV fleet with consistent commercial and executive charter bookings.',
        features: ['Weekly High-Utilization Dividend', 'Commercial Airport & Executive Fleets', 'Dedicated Portfolio Asset Manager'],
        payout_frequency: 'Weekly',
      },
      {
        id: 'plan_premium',
        name: 'Luxury & Fleet Tier',
        category: 'PREMIUM',
        vehicle_examples: ['Mercedes-Benz E-Class', 'BMW 5 Series', 'Audi A6', 'Tesla Model S'],
        min_invest: 1721.00,
        max_invest: 999999999.00,
        daily_reward_rate: 4.6, // 4.6% daily
        duration_days: 365,
        image: 'https://images.unsplash.com/photo-1555353540-64580b51c258?w=800&auto=format&fit=crop&q=80',
        accent_color: '#F59E0B',
        badge_color: '#FBBF24',
        is_popular: false,
        description: 'Tier-1 premium fleet powering luxury hospitality, private airport transfers, and VIP fleets.',
        features: ['Weekly Automated VIP Capital Yields', 'Chauffeur & Luxury Fleet Escrow', 'Uncapped Allocation & Priority Liquidity'],
        payout_frequency: 'Weekly',
      },
    ];

    for (const plan of defaultPlans) {
      await client.query(`
        INSERT INTO investment_plans (id, name, category, vehicle_examples, min_invest, max_invest, daily_reward_rate, duration_days, image, accent_color, badge_color, is_popular, description, features, payout_frequency)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          vehicle_examples = EXCLUDED.vehicle_examples,
          min_invest = EXCLUDED.min_invest,
          max_invest = EXCLUDED.max_invest,
          daily_reward_rate = EXCLUDED.daily_reward_rate,
          duration_days = EXCLUDED.duration_days,
          image = EXCLUDED.image,
          accent_color = EXCLUDED.accent_color,
          badge_color = EXCLUDED.badge_color,
          is_popular = EXCLUDED.is_popular,
          description = EXCLUDED.description,
          features = EXCLUDED.features,
          payout_frequency = EXCLUDED.payout_frequency;
      `, [
        plan.id,
        plan.name,
        plan.category,
        plan.vehicle_examples,
        plan.min_invest,
        plan.max_invest,
        plan.daily_reward_rate,
        plan.duration_days,
        plan.image,
        plan.accent_color,
        plan.badge_color,
        plan.is_popular,
        plan.description,
        plan.features,
        plan.payout_frequency,
      ]);
    }

    // 5. Seed Clean Payment Methods
    const defaultMethods = [
      {
        id: 'pm_jazzcash',
        name: 'JazzCash',
        category: 'mobile_wallet',
        icon_type: 'jazzcash',
        icon_url: 'https://seeklogo.com/images/J/jazz-cash-logo-829841352E-seeklogo.com.png',
        account_title: 'RentoBit Mobility Official',
        account_number: '03001234567',
        till_id: '889211',
        instructions: 'Transfer to the official JazzCash Account or Merchant Till ID. Upload Transaction ID / Screenshot.',
        min_deposit: 10.00,
        max_deposit: 500000.00,
        fee_percent: 0.00,
        is_active: true,
      },
      {
        id: 'pm_easypaisa',
        name: 'Easypaisa',
        category: 'mobile_wallet',
        icon_type: 'easypaisa',
        icon_url: 'https://seeklogo.com/images/E/easypaisa-logo-4034873133-seeklogo.com.png',
        account_title: 'RentoBit Mobility Official',
        account_number: '03451234567',
        till_id: '772109',
        instructions: 'Send money via Easypaisa Direct Wallet or Merchant Till. Enter TRX ID as reference.',
        min_deposit: 10.00,
        max_deposit: 500000.00,
        fee_percent: 0.00,
        is_active: true,
      },
      {
        id: 'pm_usdt_trc20',
        name: 'USDT (TRC20)',
        category: 'crypto',
        icon_type: 'usdt',
        icon_url: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
        account_title: null,
        account_number: 'TYDzsYUbT2CnCq6GM74PdcZwjNSBRTZnyP',
        network_or_bank: 'TRC20 (Tron Network)',
        qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TYDzsYUbT2CnCq6GM74PdcZwjNSBRTZnyP',
        instructions: 'Send only USDT via Tron (TRC20) network. Other assets will be permanently lost.',
        min_deposit: 10.00,
        max_deposit: 500000.00,
        fee_percent: 0.00,
        is_active: true,
      },
      {
        id: 'pm_btc',
        name: 'Bitcoin (BTC)',
        category: 'crypto',
        icon_type: 'btc',
        icon_url: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        account_title: null,
        account_number: 'bc1q9d84r82m04wks34z6t89lhsq82n890123hfkws',
        network_or_bank: 'Bitcoin Network (BTC)',
        qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=bc1q9d84r82m04wks34z6t89lhsq82n890123hfkws',
        instructions: 'Send only Bitcoin (BTC) to this address. Requires 2 blockchain confirmations for automatic balance clearance.',
        min_deposit: 10.00,
        max_deposit: 500000.00,
        fee_percent: 0.00,
        is_active: true,
      },
      {
        id: 'pm_eth',
        name: 'Ethereum (ETH)',
        category: 'crypto',
        icon_type: 'eth',
        icon_url: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
        account_title: null,
        account_number: '0x71C838961F35d326C2eB4A346Cfe9454fF517F72',
        network_or_bank: 'Ethereum (ERC-20)',
        qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=0x71C838961F35d326C2eB4A346Cfe9454fF517F72',
        instructions: 'Send only ETH or ERC-20 assets via Ethereum mainnet. Smart contract verifies and credits within 12 network blocks.',
        min_deposit: 10.00,
        max_deposit: 500000.00,
        fee_percent: 0.00,
        is_active: true,
      },
      {
        id: 'pm_bank_transfer',
        name: 'Bank Wire Transfer',
        category: 'bank',
        icon_type: 'bank',
        icon_url: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png',
        account_title: 'RentoBit Global Fleet Investments SMC-Pvt Ltd',
        account_number: '01928374650192',
        network_or_bank: 'Meezan Bank Ltd (IBAN: PK12MEZN0001928374650192)',
        instructions: 'Direct Interbank Funds Transfer (IBFT). Mention your User ID in transaction remarks.',
        min_deposit: 10.00,
        max_deposit: 500000.00,
        fee_percent: 0.00,
        is_active: true,
      },
    ];

    for (const pm of defaultMethods) {
      await client.query(`
        INSERT INTO deposit_payment_methods (id, name, category, icon_type, icon_url, account_title, account_number, till_id, network_or_bank, qr_code_url, instructions, min_deposit, max_deposit, fee_percent, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          icon_type = EXCLUDED.icon_type,
          icon_url = EXCLUDED.icon_url,
          account_title = EXCLUDED.account_title,
          account_number = EXCLUDED.account_number,
          till_id = EXCLUDED.till_id,
          network_or_bank = EXCLUDED.network_or_bank,
          qr_code_url = EXCLUDED.qr_code_url,
          instructions = EXCLUDED.instructions,
          min_deposit = EXCLUDED.min_deposit,
          max_deposit = EXCLUDED.max_deposit,
          fee_percent = EXCLUDED.fee_percent,
          is_active = EXCLUDED.is_active;
      `, [
        pm.id,
        pm.name,
        pm.category,
        pm.icon_type,
        pm.icon_url,
        pm.account_title,
        pm.account_number,
        pm.till_id || null,
        pm.network_or_bank || null,
        pm.qr_code_url || null,
        pm.instructions,
        pm.min_deposit,
        pm.max_deposit,
        pm.fee_percent,
        pm.is_active,
      ]);
    }

    // 6. Seed Default Distribution Schedule Settings
    await client.query(`
      INSERT INTO system_settings (key, value)
      VALUES ('distribution_schedule', $1)
      ON CONFLICT (key) DO NOTHING;
    `, [
      JSON.stringify({
        startTime: '12:00',
        endTime: '15:00',
        timezone: 'UTC',
        distributionEnabled: true,
        allowImmediateClaim: false,
        label: 'Daily Distribution Window',
      })
    ]);

    // 7. Audit Log for Clean System Initialization
    await client.query(`
      INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [
      `aud_${Date.now()}`,
      'SYSTEM_SCHEMA_INITIALIZED',
      'PostgreSQL Migration Engine',
      'System Core',
      'Initialized PostgreSQL tables, system settings, and provisioned Admin account admin@rentobit.com',
      '127.0.0.1',
    ]);

    console.log('[DB Init] Database initialization complete. SuperAdmin and production templates ready.');
  } catch (error) {
    console.error('[DB Init Error] Failed to initialize database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].includes('init.ts')) {
  initializeDatabase()
    .then(() => {
      console.log('✅ DB INITIALIZATION SUCCESSFUL');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ DB INITIALIZATION FAILED:', err);
      process.exit(1);
    });
}
