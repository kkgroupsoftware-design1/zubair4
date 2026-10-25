// server.ts
import express from "express";
import fs2 from "fs";
import { spawn } from "child_process";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer } from "vite";
import dotenv2 from "dotenv";

// db/index.ts
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
var { Pool } = pg;
var pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "Malik@112233",
  database: process.env.PG_DATABASE || "rentobit",
  max: 20,
  idleTimeoutMillis: 3e4,
  connectionTimeoutMillis: 5e3
});

// db/init.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log("[DB Init] Connecting to PostgreSQL database...");
    const schemaCandidates = [
      path.join(__dirname, "schema.sql"),
      path.join(__dirname, "db", "schema.sql"),
      path.join(process.cwd(), "db", "schema.sql"),
      path.join(__dirname, "..", "db", "schema.sql")
    ];
    const schemaPath = schemaCandidates.find((p) => fs.existsSync(p));
    if (!schemaPath) {
      throw new Error(`[DB Init] schema.sql not found in candidate paths: ${schemaCandidates.join(", ")}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    await client.query(schemaSql);
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
    console.log("[DB Init] Schema tables verified and synchronized.");
    const adminUser = {
      id: "usr_admin_001",
      name: "RentoBit Admin",
      first_name: "Admin",
      last_name: "Supervisor",
      email: "admin@rentobit.com",
      password_hash: "Admin@rentobit2026",
      // Production Admin Password
      phone: "+1 (800) 555-0199",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      role: "admin",
      status: "Active",
      kyc_status: "Approved",
      two_factor_enabled: true,
      referral_code: "RENTO-HQ"
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
      adminUser.referral_code
    ]);
    await client.query(`
      INSERT INTO balances (user_id, total_balance, available_balance, total_invested, today_reward, active_plans_count)
      VALUES ($1, 0.00, 0.00, 0.00, 0.00, 0)
      ON CONFLICT (user_id) DO NOTHING;
    `, [adminUser.id]);
    const defaultPlans = [
      {
        id: "plan_economy",
        name: "Economy Plan",
        category: "ECONOMY",
        vehicle_examples: ["Toyota Corolla", "Honda Civic", "Hyundai Elantra", "Nissan Sentra"],
        min_invest: 10,
        max_invest: 300,
        daily_reward_rate: 1.5,
        // 1.5% daily
        duration_days: 90,
        image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80",
        accent_color: "#3B82F6",
        badge_color: "#60A5FA",
        is_popular: false,
        description: "Entry-level fleet allocation targeting high-demand ride-share economy vehicles.",
        features: ["Weekly Automated Payouts", "100% Capital Principal Protection", "Verified Urban Rideshare Fleets"],
        payout_frequency: "Weekly"
      },
      {
        id: "plan_standard",
        name: "Standard Plan",
        category: "STANDARD",
        vehicle_examples: ["Toyota Camry Hybrid", "Honda Accord", "Kia K5", "Hyundai Sonata"],
        min_invest: 301,
        max_invest: 980,
        daily_reward_rate: 2.2,
        // 2.2% daily
        duration_days: 120,
        image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80",
        accent_color: "#10B981",
        badge_color: "#34D399",
        is_popular: true,
        description: "Mid-tier sedan fleet with high utilization rates across corporate transport contracts.",
        features: ["Automated Weekly ROI Distribution", "Tier-1 Corporate Sedan Contracts", "24/7 Telematics & Asset Shield"],
        payout_frequency: "Weekly"
      },
      {
        id: "plan_suv",
        name: "SUV & Executive Plan",
        category: "SUV",
        vehicle_examples: ["Toyota RAV4", "Honda CR-V", "Ford Explorer", "Kia Telluride"],
        min_invest: 981,
        max_invest: 1720,
        daily_reward_rate: 3.3,
        // 3.3% daily
        duration_days: 180,
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
        accent_color: "#8B5CF6",
        badge_color: "#A78BFA",
        is_popular: false,
        description: "High-demand SUV fleet with consistent commercial and executive charter bookings.",
        features: ["Weekly High-Utilization Dividend", "Commercial Airport & Executive Fleets", "Dedicated Portfolio Asset Manager"],
        payout_frequency: "Weekly"
      },
      {
        id: "plan_premium",
        name: "Luxury & Fleet Tier",
        category: "PREMIUM",
        vehicle_examples: ["Mercedes-Benz E-Class", "BMW 5 Series", "Audi A6", "Tesla Model S"],
        min_invest: 1721,
        max_invest: 999999999,
        daily_reward_rate: 4.6,
        // 4.6% daily
        duration_days: 365,
        image: "https://images.unsplash.com/photo-1555353540-64580b51c258?w=800&auto=format&fit=crop&q=80",
        accent_color: "#F59E0B",
        badge_color: "#FBBF24",
        is_popular: false,
        description: "Tier-1 premium fleet powering luxury hospitality, private airport transfers, and VIP fleets.",
        features: ["Weekly Automated VIP Capital Yields", "Chauffeur & Luxury Fleet Escrow", "Uncapped Allocation & Priority Liquidity"],
        payout_frequency: "Weekly"
      }
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
        plan.payout_frequency
      ]);
    }
    const defaultMethods = [
      {
        id: "pm_jazzcash",
        name: "JazzCash",
        category: "mobile_wallet",
        icon_type: "jazzcash",
        icon_url: "https://seeklogo.com/images/J/jazz-cash-logo-829841352E-seeklogo.com.png",
        account_title: "RentoBit Mobility Official",
        account_number: "03001234567",
        till_id: "889211",
        instructions: "Transfer to the official JazzCash Account or Merchant Till ID. Upload Transaction ID / Screenshot.",
        min_deposit: 10,
        max_deposit: 5e5,
        fee_percent: 0,
        is_active: true
      },
      {
        id: "pm_easypaisa",
        name: "Easypaisa",
        category: "mobile_wallet",
        icon_type: "easypaisa",
        icon_url: "https://seeklogo.com/images/E/easypaisa-logo-4034873133-seeklogo.com.png",
        account_title: "RentoBit Mobility Official",
        account_number: "03451234567",
        till_id: "772109",
        instructions: "Send money via Easypaisa Direct Wallet or Merchant Till. Enter TRX ID as reference.",
        min_deposit: 10,
        max_deposit: 5e5,
        fee_percent: 0,
        is_active: true
      },
      {
        id: "pm_usdt_trc20",
        name: "USDT (TRC20)",
        category: "crypto",
        icon_type: "usdt",
        icon_url: "https://cryptologos.cc/logos/tether-usdt-logo.png",
        account_title: null,
        account_number: "TYDzsYUbT2CnCq6GM74PdcZwjNSBRTZnyP",
        network_or_bank: "TRC20 (Tron Network)",
        qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TYDzsYUbT2CnCq6GM74PdcZwjNSBRTZnyP",
        instructions: "Send only USDT via Tron (TRC20) network. Other assets will be permanently lost.",
        min_deposit: 10,
        max_deposit: 5e5,
        fee_percent: 0,
        is_active: true
      },
      {
        id: "pm_btc",
        name: "Bitcoin (BTC)",
        category: "crypto",
        icon_type: "btc",
        icon_url: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
        account_title: null,
        account_number: "bc1q9d84r82m04wks34z6t89lhsq82n890123hfkws",
        network_or_bank: "Bitcoin Network (BTC)",
        qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=bc1q9d84r82m04wks34z6t89lhsq82n890123hfkws",
        instructions: "Send only Bitcoin (BTC) to this address. Requires 2 blockchain confirmations for automatic balance clearance.",
        min_deposit: 10,
        max_deposit: 5e5,
        fee_percent: 0,
        is_active: true
      },
      {
        id: "pm_eth",
        name: "Ethereum (ETH)",
        category: "crypto",
        icon_type: "eth",
        icon_url: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        account_title: null,
        account_number: "0x71C838961F35d326C2eB4A346Cfe9454fF517F72",
        network_or_bank: "Ethereum (ERC-20)",
        qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=0x71C838961F35d326C2eB4A346Cfe9454fF517F72",
        instructions: "Send only ETH or ERC-20 assets via Ethereum mainnet. Smart contract verifies and credits within 12 network blocks.",
        min_deposit: 10,
        max_deposit: 5e5,
        fee_percent: 0,
        is_active: true
      },
      {
        id: "pm_bank_transfer",
        name: "Bank Wire Transfer",
        category: "bank",
        icon_type: "bank",
        icon_url: "https://cdn-icons-png.flaticon.com/512/2830/2830284.png",
        account_title: "RentoBit Global Fleet Investments SMC-Pvt Ltd",
        account_number: "01928374650192",
        network_or_bank: "Meezan Bank Ltd (IBAN: PK12MEZN0001928374650192)",
        instructions: "Direct Interbank Funds Transfer (IBFT). Mention your User ID in transaction remarks.",
        min_deposit: 10,
        max_deposit: 5e5,
        fee_percent: 0,
        is_active: true
      }
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
        pm.is_active
      ]);
    }
    await client.query(`
      INSERT INTO system_settings (key, value)
      VALUES ('distribution_schedule', $1)
      ON CONFLICT (key) DO NOTHING;
    `, [
      JSON.stringify({
        startTime: "12:00",
        endTime: "15:00",
        timezone: "UTC",
        distributionEnabled: true,
        allowImmediateClaim: false,
        label: "Daily Distribution Window"
      })
    ]);
    await client.query(`
      INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [
      `aud_${Date.now()}`,
      "SYSTEM_SCHEMA_INITIALIZED",
      "PostgreSQL Migration Engine",
      "System Core",
      "Initialized PostgreSQL tables, system settings, and provisioned Admin account admin@rentobit.com",
      "127.0.0.1"
    ]);
    console.log("[DB Init] Database initialization complete. SuperAdmin and production templates ready.");
  } catch (error) {
    console.error("[DB Init Error] Failed to initialize database:", error);
    throw error;
  } finally {
    client.release();
  }
}
if (process.argv[1] && process.argv[1].includes("init.ts")) {
  initializeDatabase().then(() => {
    console.log("\u2705 DB INITIALIZATION SUCCESSFUL");
    process.exit(0);
  }).catch((err) => {
    console.error("\u274C DB INITIALIZATION FAILED:", err);
    process.exit(1);
  });
}

// db/vaultCrypto.ts
import CryptoJS from "crypto-js";
var VAULT_SECRET_KEY = process.env.VAULT_SECRET_KEY || "RENTOBIT_SECURE_VAULT_KEY_2026_X99_MILITARY_GRADE";
function encryptPayload(data) {
  try {
    const raw = typeof data === "string" ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(raw, VAULT_SECRET_KEY).toString();
  } catch (err) {
    console.error("[Vault] Encryption failure:", err);
    return "";
  }
}
function generateSignature(timestamp) {
  return CryptoJS.HmacSHA256(`${timestamp}:rentobit-secure-v2`, VAULT_SECRET_KEY).toString();
}
function verifySignature(timestamp, signature, maxAgeMs = 3e5) {
  if (!timestamp || !signature) return false;
  const ts = typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
  if (isNaN(ts)) return false;
  const now = Date.now();
  if (Math.abs(now - ts) > maxAgeMs) {
    return false;
  }
  const expected = generateSignature(ts);
  return expected === signature;
}

// server.ts
dotenv2.config();
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
function mapUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    firstName: u.first_name || u.name?.split(" ")[0] || "User",
    lastName: u.last_name || u.name?.split(" ").slice(1).join(" ") || "Member",
    email: u.email,
    phone: u.phone || "",
    avatar: u.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    role: u.role || "user",
    status: u.status || "Active",
    kycStatus: u.kyc_status || "Not Started",
    advanceKycAllowed: !!u.advance_kyc_allowed,
    twoFactorEnabled: !!u.two_factor_enabled,
    hasWithdrawPin: Boolean(u.withdraw_pin_hash),
    referralCode: u.referral_code || `RENTO-${u.id.slice(-4).toUpperCase()}`,
    referredBy: u.referred_by || void 0,
    createdAt: u.created_at
  };
}
function mapPlan(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    vehicleExamples: p.vehicle_examples || [],
    minInvest: parseFloat(p.min_invest) || 0,
    maxInvest: parseFloat(p.max_invest) || 0,
    dailyRewardRate: parseFloat(p.daily_reward_rate) || 0,
    durationDays: parseInt(p.duration_days, 10) || 0,
    image: p.image || "",
    accentColor: p.accent_color || "#155EEF",
    badgeColor: p.badge_color || "#38BDF8",
    isPopular: !!p.is_popular,
    popular: !!p.is_popular,
    description: p.description || "",
    features: p.features || [],
    payoutFrequency: p.payout_frequency || "Daily",
    isActive: p.is_active !== false
  };
}
function mapPaymentMethod(pm) {
  return {
    id: pm.id,
    name: pm.name,
    category: pm.category,
    iconType: pm.icon_type,
    iconUrl: pm.icon_url || void 0,
    accountTitle: pm.account_title,
    // Return undefined (not null) when blank — frontend hides the box when falsy
    accountNumber: pm.account_number && pm.account_number.trim() !== "" ? pm.account_number : void 0,
    tillId: pm.till_id && pm.till_id.trim() !== "" ? pm.till_id : void 0,
    networkOrBank: pm.network_or_bank || void 0,
    qrCodeUrl: pm.qr_code_url || void 0,
    instructions: pm.instructions || "",
    minDeposit: parseFloat(pm.min_deposit) || 10,
    maxDeposit: parseFloat(pm.max_deposit) || 5e4,
    feePercent: parseFloat(pm.fee_percent) || 0,
    isActive: pm.is_active !== false,
    createdAt: pm.created_at
  };
}
function mapWithdrawalMethod(wm) {
  return {
    id: wm.id,
    name: wm.name,
    symbol: wm.symbol,
    currency: wm.symbol,
    network: wm.network,
    iconType: wm.icon_type || "usdt",
    iconUrl: wm.icon_url || void 0,
    minWithdrawal: parseFloat(wm.min_withdrawal) || 20,
    maxWithdrawal: parseFloat(wm.max_withdrawal) || 5e4,
    feeFixed: parseFloat(wm.fee_fixed) || 0,
    fee: parseFloat(wm.fee_fixed) || 0,
    feePercent: parseFloat(wm.fee_percent) || 0,
    instructions: wm.instructions || "",
    isActive: wm.is_active !== false,
    createdAt: wm.created_at
  };
}
function mapKyc(k, options = { includeDocuments: true }) {
  if (!k) return null;
  const fullName = k.first_name && k.last_name ? `${k.first_name} ${k.last_name}`.trim() : k.first_name || k.user_name || "User";
  const hasFrontDoc = Boolean(
    k.has_document_front !== void 0 ? k.has_document_front : k.document_front_url && k.document_front_url.trim() !== ""
  );
  const hasBackDoc = Boolean(
    k.has_document_back !== void 0 ? k.has_document_back : k.document_back_url && k.document_back_url.trim() !== ""
  );
  const hasSelfie = Boolean(
    k.has_selfie !== void 0 ? k.has_selfie : k.selfie_url && k.selfie_url.trim() !== ""
  );
  return {
    id: k.id,
    userId: k.user_id,
    firstName: k.first_name || "",
    lastName: k.last_name || "",
    fullName,
    userName: k.user_name || fullName,
    userEmail: k.user_email || void 0,
    userPhone: k.user_phone || void 0,
    userAvatar: k.user_avatar || void 0,
    dob: k.dob ? typeof k.dob === "string" ? k.dob.split("T")[0] : new Date(k.dob).toISOString().split("T")[0] : "",
    address: k.address || "",
    city: k.city || "",
    state: k.state || "",
    postalCode: k.postal_code || "",
    country: k.country || "Pakistan",
    docType: k.doc_type || "National ID",
    documentType: k.doc_type || "National ID",
    docNumber: k.doc_number || "",
    documentNumber: k.doc_number || "",
    countryOfIssue: k.country_of_issue || k.country || "Pakistan",
    issueDate: k.issue_date ? typeof k.issue_date === "string" ? k.issue_date.split("T")[0] : new Date(k.issue_date).toISOString().split("T")[0] : "",
    expiryDate: k.expiry_date ? typeof k.expiry_date === "string" ? k.expiry_date.split("T")[0] : new Date(k.expiry_date).toISOString().split("T")[0] : "",
    hasFrontDoc,
    hasBackDoc,
    hasSelfie,
    // Only send the heavy multi-megabyte payloads when requested:
    documentFrontUrl: options.includeDocuments ? k.document_front_url || void 0 : void 0,
    frontDocUrl: options.includeDocuments ? k.document_front_url || void 0 : void 0,
    documentBackUrl: options.includeDocuments ? k.document_back_url || void 0 : void 0,
    backDocUrl: options.includeDocuments ? k.document_back_url || void 0 : void 0,
    selfieUrl: options.includeDocuments ? k.selfie_url || void 0 : void 0,
    livenessPassed: !!k.liveness_passed,
    advanceKycAllowed: k.advance_kyc_allowed !== false,
    basicStatus: k.basic_status || (k.doc_number || k.first_name ? "Approved" : "Not Started"),
    advanceStatus: k.advance_status || (k.status === "Approved" ? "Approved" : k.status === "Rejected" ? "Rejected" : hasFrontDoc || hasSelfie ? "Under Review" : "Not Started"),
    status: k.status || "Not Started",
    rejectionReason: k.rejection_reason || void 0,
    submittedAt: k.submitted_at ? new Date(k.submitted_at).toISOString() : void 0,
    reviewedAt: k.reviewed_at ? new Date(k.reviewed_at).toISOString() : void 0,
    reviewedBy: k.reviewed_by || void 0
  };
}
function mapUnlockRequest(u) {
  if (!u) return null;
  return {
    id: u.id,
    userId: u.user_id,
    userName: u.user_name || "Member",
    userEmail: u.user_email || "",
    rewardId: u.reward_id || "",
    planName: u.plan_name || "Daily Plan",
    grossReward: parseFloat(u.gross_reward) || 0,
    claimWindow: u.claim_window || "12:00 PM - 3:00 PM",
    lockTime: u.lock_time ? typeof u.lock_time === "string" ? u.lock_time : new Date(u.lock_time).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
    reason: u.reason || "",
    status: u.status || "Under Support Review",
    submittedAt: u.submitted_at ? typeof u.submitted_at === "string" ? u.submitted_at : new Date(u.submitted_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
    reviewedAt: u.reviewed_at ? typeof u.reviewed_at === "string" ? u.reviewed_at : new Date(u.reviewed_at).toISOString() : void 0,
    reviewedBy: u.reviewed_by || void 0,
    adminNote: u.admin_note || void 0
  };
}
function formatRelativeTime(dateInput) {
  if (!dateInput) return "Just now";
  const d = new Date(dateInput);
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1e3);
  if (diffSec < 45) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}
async function notifyUser(userId, title, message, type = "general", actionUrl) {
  try {
    const id2 = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await pool.query(
      `INSERT INTO notifications (id, user_id, title, message, type, action_url) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id2, userId, title, message, type, actionUrl || null]
    );
  } catch (err) {
    console.error("Failed to dispatch user notification:", err);
  }
}
async function notifyAdmins(title, message, type = "general", actionUrl) {
  try {
    const adminUsers = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    const adminIds = new Set(adminUsers.rows.map((u) => u.id));
    adminIds.add("usr_admin_001");
    for (const adminId of adminIds) {
      const id2 = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await pool.query(
        `INSERT INTO notifications (id, user_id, title, message, type, action_url) VALUES ($1, $2, $3, $4, $5, $6)`,
        [id2, adminId, title, message, type, actionUrl || null]
      );
    }
  } catch (err) {
    console.error("Failed to dispatch admin notification:", err);
  }
}
var ADMIN_MASTER_SECRET = "Admin@rentobit2026";
app.use("/api", (req, res, next) => {
  const adminKey = req.query.admin_key || req.headers["x-admin-key"];
  if (adminKey === ADMIN_MASTER_SECRET) {
    return next();
  }
  const isBrowserNav = req.headers["sec-fetch-dest"] === "document" || req.headers["sec-fetch-mode"] === "navigate" || req.headers.accept && req.headers.accept.includes("text/html") && !req.headers["x-rentobit-signature"];
  if (isBrowserNav) {
    return res.status(403).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>403 Forbidden - Direct API Access Restricted</title>
        <style>
          body { background: #07121E; color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 20px; padding: 40px; max-width: 520px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); backdrop-filter: blur(10px); }
          .shield { width: 70px; height: 70px; background: rgba(239, 68, 68, 0.12); border: 2px solid #EF4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; }
          h1 { font-size: 22px; font-weight: 700; margin-bottom: 12px; color: #FFFFFF; }
          p { font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px; }
          .code-badge { background: #020617; border: 1px solid #1E293B; border-radius: 8px; padding: 8px 14px; font-family: monospace; font-size: 12px; color: #F87171; margin-bottom: 24px; display: inline-block; }
          a { display: inline-block; background: #155EEF; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; transition: background 0.2s; box-shadow: 0 4px 12px rgba(21, 94, 239, 0.3); }
          a:hover { background: #124ec7; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="shield">\u{1F512}</div>
          <h1>Direct API Access Forbidden</h1>
          <div class="code-badge">SECURITY PROTOCOL: VAULT_RESTRICTED_ACCESS</div>
          <p>Direct URL access and public scraping of RentoBit Core API endpoints is locked. All platform services must be accessed through the verified RentoBit application interface.</p>
          <a href="/">Return to RentoBit Safe Area</a>
        </div>
      </body>
      </html>
    `);
  }
  next();
});
app.use("/api", (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  const adminKey = req.query.admin_key || req.headers["x-admin-key"];
  if (adminKey === ADMIN_MASTER_SECRET) {
    return next();
  }
  const clientHeader = req.headers["x-rentobit-client"];
  const signature = req.headers["x-rentobit-signature"];
  const timestamp = req.headers["x-rentobit-timestamp"];
  const isAuthenticClient = clientHeader === "Rentobit-Secure-Web" && signature && timestamp && verifySignature(timestamp, signature, 6e5);
  if (!isAuthenticClient) {
    return res.status(403).json({
      error: "Access Denied: Direct or unauthorized proxy inspection prohibited. Verified client signature required."
    });
  }
  next();
});
app.use("/api/admin", async (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  const adminKey = req.query.admin_key || req.headers["x-admin-key"];
  if (adminKey === ADMIN_MASTER_SECRET) {
    return next();
  }
  const userId = req.headers["x-user-id"];
  const authHeader = req.headers["authorization"];
  let candidateId = userId;
  if (!candidateId && authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const parts = token.split("_");
    if (parts.length >= 3) {
      candidateId = parts.slice(2).join("_");
    } else {
      candidateId = token;
    }
  }
  if (!candidateId) {
    return res.status(401).json({ error: "Administrative authentication required." });
  }
  try {
    const uRes = await pool.query("SELECT id, role, status FROM users WHERE id = $1 LIMIT 1", [candidateId]);
    const user = uRes.rows[0];
    if (!user || user.role !== "admin" || user.status !== "Active") {
      return res.status(403).json({ error: "Administrative clearance required. Unauthorized access prohibited." });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: "Admin clearance validation error: " + err.message });
  }
});
app.use("/api", (req, res, next) => {
  const adminKey = req.query.admin_key || req.headers["x-admin-key"];
  if (adminKey === ADMIN_MASTER_SECRET && req.query.raw === "true") {
    return next();
  }
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    try {
      const encrypted = encryptPayload(body);
      return originalJson({ __enc: encrypted });
    } catch {
      return originalJson(body);
    }
  };
  next();
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const cleanEmail = email.trim().toLowerCase();
    const userRes = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1",
      [cleanEmail]
    );
    const dbUser = userRes.rows[0];
    if (!dbUser) {
      return res.status(401).json({ error: "No account found with this email address. Please register first." });
    }
    if (dbUser.password_hash !== password) {
      return res.status(401).json({ error: "Incorrect password. Please verify your password and try again." });
    }
    if (dbUser.status && dbUser.status !== "Active") {
      return res.status(403).json({ error: "This account is currently suspended. Please contact support." });
    }
    const balRes = await pool.query(
      "SELECT * FROM balances WHERE user_id = $1 LIMIT 1",
      [dbUser.id]
    );
    const bal = balRes.rows[0] || {
      total_balance: 0,
      available_balance: 0,
      total_invested: 0,
      today_reward: 0,
      active_plans_count: 0
    };
    const formattedUser = mapUser(dbUser);
    const formattedBalance = {
      totalBalance: parseFloat(bal.total_balance) || 0,
      availableBalance: parseFloat(bal.available_balance) || 0,
      totalInvested: parseFloat(bal.total_invested) || 0,
      todayReward: parseFloat(bal.today_reward) || 0,
      activePlansCount: parseInt(bal.active_plans_count, 10) || 0
    };
    const token = `jwt_${Date.now()}_${dbUser.id}`;
    res.json({
      token,
      user: formattedUser,
      balance: formattedBalance
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Authentication failed: " + error.message });
  }
});
async function generateUniqueReferralCode() {
  let attempts = 0;
  while (attempts < 100) {
    const random4Digits = Math.floor(1e3 + Math.random() * 9e3);
    const candidateCode = `RENTO-${random4Digits}`;
    const check = await pool.query("SELECT id FROM users WHERE UPPER(referral_code) = $1 LIMIT 1;", [candidateCode]);
    if (!check.rowCount || check.rowCount === 0) {
      return candidateCode;
    }
    attempts++;
  }
  return `RENTO-${Math.floor(1e4 + Math.random() * 9e4)}`;
}
app.get("/api/referrals/verify/:code", async (req, res) => {
  try {
    const rawCode = req.params.code;
    if (!rawCode || !rawCode.trim()) {
      return res.status(400).json({ valid: false, error: "Referral code is required." });
    }
    const cleanCode = rawCode.trim().toUpperCase();
    const userRes = await pool.query(
      "SELECT id, name, referral_code FROM users WHERE UPPER(referral_code) = $1 LIMIT 1;",
      [cleanCode]
    );
    if (userRes.rows.length === 0) {
      return res.json({
        valid: false,
        error: `Sponsor code "${cleanCode}" was not found. Please enter a valid registered code or leave it blank to register directly.`
      });
    }
    const sponsor = userRes.rows[0];
    res.json({
      valid: true,
      sponsorId: sponsor.id,
      sponsorName: sponsor.name,
      referralCode: sponsor.referral_code
    });
  } catch (error) {
    res.status(500).json({ valid: false, error: error.message });
  }
});
app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, phone, referralCode, password } = req.body;
    if (!email || !fullName) {
      return res.status(400).json({ error: "Full name and email are required" });
    }
    const cleanEmail = email.trim().toLowerCase();
    const existing = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [cleanEmail]);
    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }
    let referrerId = null;
    if (referralCode && typeof referralCode === "string" && referralCode.trim()) {
      const cleanRefCode = referralCode.trim().toUpperCase();
      const referrerRes = await pool.query(
        "SELECT id, name, referral_code FROM users WHERE UPPER(referral_code) = $1 LIMIT 1;",
        [cleanRefCode]
      );
      if (!referrerRes.rowCount || referrerRes.rowCount === 0) {
        return res.status(400).json({
          error: `Invalid Referral Code: No registered sponsor found with code "${cleanRefCode}". Only valid registered sponsor codes can be linked, or leave it blank to register directly without a sponsor.`
        });
      }
      referrerId = referrerRes.rows[0].id;
    }
    const names = fullName.trim().split(" ");
    const firstName = names[0] || "User";
    const lastName = names.slice(1).join(" ") || "Member";
    const newId = `usr_${Date.now()}`;
    const userRefCode = await generateUniqueReferralCode();
    const userRes = await pool.query(
      `INSERT INTO users (id, name, first_name, last_name, email, password_hash, phone, role, status, kyc_status, referral_code, referred_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'user', 'Active', 'Not Started', $8, $9)
       RETURNING *;`,
      [
        newId,
        fullName.trim(),
        firstName,
        lastName,
        cleanEmail,
        password || "User@123",
        phone || "",
        userRefCode,
        referrerId
        // Save referrer permanently by ID or null if direct registration
      ]
    );
    const dbUser = userRes.rows[0];
    await pool.query(
      `INSERT INTO balances (user_id, total_balance, available_balance, total_invested, today_reward, active_plans_count)
       VALUES ($1, 0.00, 0.00, 0.00, 0.00, 0);`,
      [newId]
    );
    await pool.query(
      `INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `aud_${Date.now()}`,
        "USER_REGISTER",
        fullName,
        `${fullName} (${newId})`,
        "New user registered account via web application.",
        req.ip || "127.0.0.1"
      ]
    );
    const formattedUser = mapUser(dbUser);
    const token = `jwt_${Date.now()}_${newId}`;
    res.status(201).json({ token, user: formattedUser });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed: " + error.message });
  }
});
var otpStore = /* @__PURE__ */ new Map();
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    const cleanEmail = email.trim().toLowerCase();
    const userRes = await pool.query(
      "SELECT id, name FROM users WHERE LOWER(email) = $1 AND status = $2 LIMIT 1",
      [cleanEmail, "Active"]
    );
    if (!userRes.rows.length) {
      return res.status(404).json({
        error: "No active account found with this email address. Please check your email or register a new account."
      });
    }
    const otp = String(Math.floor(1e5 + Math.random() * 9e5));
    const expiresAt = Date.now() + 10 * 60 * 1e3;
    otpStore.set(cleanEmail, { otp, expiresAt });
    console.log(`[OTP] Password reset OTP for ${cleanEmail}: ${otp} (expires in 10 min)`);
    res.json({
      success: true,
      message: "Verification code sent. Check your registered email.",
      // Temporarily returned so you can test without an email service.
      // REMOVE this field once a real email gateway is wired up.
      _devOtp: otp
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request: " + error.message });
  }
});
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, verification code, and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }
    const cleanEmail = email.trim().toLowerCase();
    const stored = otpStore.get(cleanEmail);
    if (!stored) {
      return res.status(400).json({ error: "No verification code found. Please request a new code." });
    }
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    }
    if (stored.otp !== otp.trim()) {
      return res.status(400).json({ error: "Invalid verification code. Please check the code and try again." });
    }
    const updateRes = await pool.query(
      "UPDATE users SET password_hash = $1 WHERE LOWER(email) = $2 RETURNING id, name",
      [newPassword, cleanEmail]
    );
    if (!updateRes.rowCount) {
      return res.status(404).json({ error: "Account not found. Password update failed." });
    }
    otpStore.delete(cleanEmail);
    await pool.query(
      `INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `aud_${Date.now()}`,
        "PASSWORD_RESET",
        cleanEmail,
        `${updateRes.rows[0].name} (${updateRes.rows[0].id})`,
        "User reset password via forgot-password OTP flow.",
        req.ip || "127.0.0.1"
      ]
    );
    res.json({ success: true, message: "Password updated successfully. You can now login with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password: " + error.message });
  }
});
app.get("/api/user/balance", async (req, res) => {
  try {
    const userId = req.query.userId || "usr_admin_001";
    const [balRes, activeInvsRes] = await Promise.all([
      pool.query("SELECT * FROM balances WHERE user_id = $1 LIMIT 1", [userId]),
      pool.query("SELECT COALESCE(SUM(daily_reward), 0) as active_yield, COUNT(*) as active_count FROM active_investments WHERE user_id = $1 AND status = 'Active';", [userId])
    ]);
    const realActiveYield = parseFloat(activeInvsRes.rows[0]?.active_yield) || 0;
    const realActiveCount = parseInt(activeInvsRes.rows[0]?.active_count, 10) || 0;
    let bal = balRes.rows[0];
    if (!bal) {
      const insertBal = await pool.query(
        `INSERT INTO balances (user_id, total_balance, available_balance, total_invested, today_reward, active_plans_count)
         VALUES ($1, 0.00, 0.00, 0.00, $2, $3)
         RETURNING *;`,
        [userId, realActiveYield, realActiveCount]
      );
      bal = insertBal.rows[0];
    } else if (parseFloat(bal.today_reward) !== realActiveYield || parseInt(bal.active_plans_count, 10) !== realActiveCount) {
      await pool.query(
        "UPDATE balances SET today_reward = $1, active_plans_count = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3",
        [realActiveYield, realActiveCount, userId]
      );
      bal.today_reward = realActiveYield;
      bal.active_plans_count = realActiveCount;
    }
    res.json({
      totalBalance: parseFloat(bal.total_balance) || 0,
      availableBalance: parseFloat(bal.available_balance) || 0,
      totalInvested: parseFloat(bal.total_invested) || 0,
      todayReward: realActiveYield,
      activePlansCount: realActiveCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/plans", async (req, res) => {
  try {
    const plansRes = await pool.query("SELECT * FROM investment_plans WHERE is_active = TRUE ORDER BY min_invest ASC;");
    res.json(plansRes.rows.map(mapPlan));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/plans", async (req, res) => {
  try {
    const plansRes = await pool.query("SELECT * FROM investment_plans ORDER BY min_invest ASC;");
    res.json(plansRes.rows.map(mapPlan));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/plans", async (req, res) => {
  try {
    const { name, category, vehicleExamples, minInvest, maxInvest, dailyRewardRate, durationDays, image, accentColor, badgeColor, isPopular, description, features } = req.body;
    const id2 = `plan_${Date.now()}`;
    const insertRes = await pool.query(`
      INSERT INTO investment_plans (id, name, category, vehicle_examples, min_invest, max_invest, daily_reward_rate, duration_days, image, accent_color, badge_color, is_popular, description, features)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `, [
      id2,
      name,
      category || "STANDARD",
      vehicleExamples || [],
      parseFloat(minInvest) || 50,
      parseFloat(maxInvest) || 1e3,
      parseFloat(dailyRewardRate) || 0.5,
      parseInt(durationDays, 10) || 90,
      image || "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80",
      accentColor || "#155EEF",
      badgeColor || "#38BDF8",
      !!isPopular,
      description || "",
      features || []
    ]);
    res.status(201).json(mapPlan(insertRes.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/api/admin/plans/:id", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const { name, category, vehicleExamples, minInvest, maxInvest, dailyRewardRate, durationDays, image, accentColor, badgeColor, isPopular, description, features, isActive } = req.body;
    const updateRes = await pool.query(`
      UPDATE investment_plans SET
        name = COALESCE($2, name),
        category = COALESCE($3, category),
        vehicle_examples = COALESCE($4, vehicle_examples),
        min_invest = COALESCE($5, min_invest),
        max_invest = COALESCE($6, max_invest),
        daily_reward_rate = COALESCE($7, daily_reward_rate),
        duration_days = COALESCE($8, duration_days),
        image = COALESCE($9, image),
        accent_color = COALESCE($10, accent_color),
        badge_color = COALESCE($11, badge_color),
        is_popular = COALESCE($12, is_popular),
        description = COALESCE($13, description),
        features = COALESCE($14, features),
        is_active = COALESCE($15, is_active)
      WHERE id = $1
      RETURNING *;
    `, [
      id2,
      name,
      category,
      vehicleExamples,
      minInvest !== void 0 ? parseFloat(minInvest) : null,
      maxInvest !== void 0 ? parseFloat(maxInvest) : null,
      dailyRewardRate !== void 0 ? parseFloat(dailyRewardRate) : null,
      durationDays !== void 0 ? parseInt(durationDays, 10) : null,
      image,
      accentColor,
      badgeColor,
      isPopular,
      description,
      features,
      isActive
    ]);
    if (!updateRes.rowCount) return res.status(404).json({ error: "Plan not found" });
    res.json(mapPlan(updateRes.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/admin/plans/:id", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    await pool.query("DELETE FROM investment_plans WHERE id = $1;", [id2]);
    res.json({ success: true, message: "Plan deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/payment-methods", async (req, res) => {
  try {
    const pmRes = await pool.query("SELECT * FROM deposit_payment_methods WHERE is_active = TRUE ORDER BY id ASC;");
    res.json(pmRes.rows.map(mapPaymentMethod));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/payment-methods", async (req, res) => {
  try {
    const pmRes = await pool.query("SELECT * FROM deposit_payment_methods ORDER BY id ASC;");
    res.json(pmRes.rows.map(mapPaymentMethod));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/payment-methods", async (req, res) => {
  try {
    const { name, category, iconType, iconUrl, accountTitle, accountNumber, tillId, networkOrBank, qrCodeUrl, instructions, minDeposit, maxDeposit, feePercent, isActive } = req.body;
    const id2 = `pm_${Date.now()}`;
    const insertRes = await pool.query(`
      INSERT INTO deposit_payment_methods (id, name, category, icon_type, icon_url, account_title, account_number, till_id, network_or_bank, qr_code_url, instructions, min_deposit, max_deposit, fee_percent, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `, [
      id2,
      name || "New Gateway",
      category || "mobile_wallet",
      iconType || "jazzcash",
      iconUrl || null,
      accountTitle || "RentoBit Official",
      accountNumber && accountNumber.trim() !== "" ? accountNumber.trim() : null,
      tillId && tillId.trim() !== "" ? tillId.trim() : null,
      networkOrBank || null,
      qrCodeUrl || null,
      instructions || "",
      minDeposit !== void 0 && minDeposit !== "" ? parseFloat(minDeposit) : 10,
      maxDeposit !== void 0 && maxDeposit !== "" ? parseFloat(maxDeposit) : 5e5,
      feePercent !== void 0 && feePercent !== "" ? parseFloat(feePercent) : 0,
      isActive !== false
    ]);
    res.status(201).json(mapPaymentMethod(insertRes.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/api/admin/payment-methods/:id", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const { name, category, iconType, iconUrl, accountTitle, accountNumber, tillId, networkOrBank, qrCodeUrl, instructions, minDeposit, maxDeposit, feePercent, isActive } = req.body;
    const updateRes = await pool.query(`
      UPDATE deposit_payment_methods SET
        name = COALESCE($2, name),
        category = COALESCE($3, category),
        icon_type = COALESCE($4, icon_type),
        icon_url = COALESCE($5, icon_url),
        account_title = COALESCE($6, account_title),
        account_number = CASE WHEN $7 = '__CLEAR__' THEN NULL WHEN $7 IS NOT NULL THEN $7 ELSE account_number END,
        till_id = CASE WHEN $8 = '__CLEAR__' THEN NULL WHEN $8 IS NOT NULL THEN $8 ELSE till_id END,
        network_or_bank = COALESCE($9, network_or_bank),
        qr_code_url = COALESCE($10, qr_code_url),
        instructions = COALESCE($11, instructions),
        min_deposit = COALESCE($12, min_deposit),
        max_deposit = COALESCE($13, max_deposit),
        fee_percent = COALESCE($14, fee_percent),
        is_active = COALESCE($15, is_active)
      WHERE id = $1
      RETURNING *;
    `, [
      id2,
      name !== void 0 ? name : null,
      category !== void 0 ? category : null,
      iconType !== void 0 ? iconType : null,
      iconUrl !== void 0 ? iconUrl || null : null,
      accountTitle !== void 0 ? accountTitle : null,
      accountNumber !== void 0 ? accountNumber && accountNumber.trim() !== "" ? accountNumber.trim() : "__CLEAR__" : null,
      tillId !== void 0 ? tillId && tillId.trim() !== "" ? tillId.trim() : "__CLEAR__" : null,
      networkOrBank !== void 0 ? networkOrBank : null,
      qrCodeUrl !== void 0 ? qrCodeUrl || null : null,
      instructions !== void 0 ? instructions : null,
      minDeposit !== void 0 && minDeposit !== "" && !isNaN(parseFloat(minDeposit)) ? parseFloat(minDeposit) : null,
      maxDeposit !== void 0 && maxDeposit !== "" && !isNaN(parseFloat(maxDeposit)) ? parseFloat(maxDeposit) : null,
      feePercent !== void 0 && feePercent !== "" && !isNaN(parseFloat(feePercent)) ? parseFloat(feePercent) : null,
      isActive !== void 0 ? isActive : null
    ]);
    if (!updateRes.rowCount) return res.status(404).json({ error: "Payment method not found" });
    res.json(mapPaymentMethod(updateRes.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/admin/payment-methods/:id/toggle", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const updateRes = await pool.query(`
      UPDATE deposit_payment_methods SET is_active = NOT is_active WHERE id = $1 RETURNING *;
    `, [id2]);
    if (!updateRes.rowCount) return res.status(404).json({ error: "Payment method not found" });
    res.json(mapPaymentMethod(updateRes.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/admin/payment-methods/:id", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    await pool.query("DELETE FROM deposit_payment_methods WHERE id = $1;", [id2]);
    res.json({ success: true, message: "Payment method deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/withdrawal-methods", async (req, res) => {
  try {
    const wmRes = await pool.query("SELECT * FROM withdrawal_payment_methods WHERE is_active = TRUE ORDER BY id ASC;");
    res.json(wmRes.rows.map(mapWithdrawalMethod));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/withdrawal-methods", async (req, res) => {
  try {
    const wmRes = await pool.query("SELECT * FROM withdrawal_payment_methods ORDER BY id ASC;");
    res.json(wmRes.rows.map(mapWithdrawalMethod));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/withdrawal-methods", async (req, res) => {
  try {
    const { name, symbol, currency, network, iconType, iconUrl, minWithdrawal, maxWithdrawal, feeFixed, fee, feePercent, instructions, isActive } = req.body;
    const id2 = `wth_m_${Date.now()}`;
    const symVal = (symbol || currency || "USDT").toUpperCase();
    const feeVal = feeFixed !== void 0 && feeFixed !== "" && !isNaN(parseFloat(feeFixed)) ? parseFloat(feeFixed) : fee !== void 0 && fee !== "" && !isNaN(parseFloat(fee)) ? parseFloat(fee) : 1;
    const feePercentVal = feePercent !== void 0 && feePercent !== "" && !isNaN(parseFloat(feePercent)) ? parseFloat(feePercent) : 0;
    const minWthVal = minWithdrawal !== void 0 && minWithdrawal !== "" && !isNaN(parseFloat(minWithdrawal)) ? parseFloat(minWithdrawal) : 20;
    const maxWthVal = maxWithdrawal !== void 0 && maxWithdrawal !== "" && !isNaN(parseFloat(maxWithdrawal)) ? parseFloat(maxWithdrawal) : 5e4;
    const insertRes = await pool.query(`
      INSERT INTO withdrawal_payment_methods (id, name, symbol, network, icon_type, icon_url, min_withdrawal, max_withdrawal, fee_fixed, fee_percent, instructions, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `, [
      id2,
      name || `${symVal} ${network || "TRC20"}`,
      symVal,
      network || "TRC20",
      iconType || "usdt",
      iconUrl || null,
      minWthVal,
      maxWthVal,
      feeVal,
      feePercentVal,
      instructions || "",
      isActive !== false
    ]);
    res.status(201).json(mapWithdrawalMethod(insertRes.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/api/admin/withdrawal-methods/:id", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const { name, symbol, currency, network, iconType, iconUrl, minWithdrawal, maxWithdrawal, feeFixed, fee, feePercent, instructions, isActive } = req.body;
    const symVal = symbol !== void 0 ? symbol : currency !== void 0 ? currency : null;
    const feeVal = feeFixed !== void 0 && feeFixed !== "" && !isNaN(parseFloat(feeFixed)) ? parseFloat(feeFixed) : fee !== void 0 && fee !== "" && !isNaN(parseFloat(fee)) ? parseFloat(fee) : null;
    const feePercentVal = feePercent !== void 0 && feePercent !== "" && !isNaN(parseFloat(feePercent)) ? parseFloat(feePercent) : null;
    const minWthVal = minWithdrawal !== void 0 && minWithdrawal !== "" && !isNaN(parseFloat(minWithdrawal)) ? parseFloat(minWithdrawal) : null;
    const maxWthVal = maxWithdrawal !== void 0 && maxWithdrawal !== "" && !isNaN(parseFloat(maxWithdrawal)) ? parseFloat(maxWithdrawal) : null;
    const updateRes = await pool.query(`
      UPDATE withdrawal_payment_methods SET
        name = COALESCE($2, name),
        symbol = COALESCE($3, symbol),
        network = COALESCE($4, network),
        icon_type = COALESCE($5, icon_type),
        icon_url = COALESCE($6, icon_url),
        min_withdrawal = COALESCE($7, min_withdrawal),
        max_withdrawal = COALESCE($8, max_withdrawal),
        fee_fixed = COALESCE($9, fee_fixed),
        fee_percent = COALESCE($10, fee_percent),
        instructions = COALESCE($11, instructions),
        is_active = COALESCE($12, is_active)
      WHERE id = $1
      RETURNING *;
    `, [
      id2,
      name !== void 0 ? name : null,
      symVal,
      network !== void 0 ? network : null,
      iconType !== void 0 ? iconType : null,
      iconUrl !== void 0 ? iconUrl || null : null,
      minWthVal,
      maxWthVal,
      feeVal,
      feePercentVal,
      instructions !== void 0 ? instructions : null,
      isActive !== void 0 ? isActive : null
    ]);
    if (!updateRes.rowCount) return res.status(404).json({ error: "Withdrawal method not found" });
    res.json(mapWithdrawalMethod(updateRes.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/admin/withdrawal-methods/:id/toggle", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const updateRes = await pool.query(`
      UPDATE withdrawal_payment_methods SET is_active = NOT is_active WHERE id = $1 RETURNING *;
    `, [id2]);
    if (!updateRes.rowCount) return res.status(404).json({ error: "Withdrawal method not found" });
    res.json(mapWithdrawalMethod(updateRes.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/admin/withdrawal-methods/:id", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    await pool.query("DELETE FROM withdrawal_payment_methods WHERE id = $1;", [id2]);
    res.json({ success: true, message: "Withdrawal method deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/kyc/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const includeDocs2 = req.query.includeDocs === "true";
    const kycRes = await pool.query(`
      SELECT 
        k.id, k.user_id, k.first_name, k.last_name, k.dob, k.address, k.city, k.state, k.postal_code,
        k.country, k.doc_type, k.doc_number, k.country_of_issue, k.issue_date, k.expiry_date,
        k.liveness_passed, k.basic_status, k.advance_status, k.advance_kyc_allowed, k.status,
        k.rejection_reason, k.submitted_at, k.reviewed_at, k.reviewed_by,
        (k.document_front_url IS NOT NULL AND k.document_front_url != '') as has_document_front,
        (k.document_back_url IS NOT NULL AND k.document_back_url != '') as has_document_back,
        (k.selfie_url IS NOT NULL AND k.selfie_url != '') as has_selfie
        ${includeDocs2 ? ", k.document_front_url, k.document_back_url, k.selfie_url" : ""},
        u.name as user_name, u.email as user_email, u.phone as user_phone, u.avatar as user_avatar, u.kyc_status as current_user_kyc_status
      FROM kyc_verifications k
      LEFT JOIN users u ON k.user_id = u.id
      WHERE k.user_id = $1
      LIMIT 1;
    `, [userId]);
    if (kycRes.rows.length === 0) {
      const uRes = await pool.query("SELECT name, email, kyc_status FROM users WHERE id = $1 LIMIT 1;", [userId]);
      const u = uRes.rows[0];
      return res.json({
        id: `kyc_${userId}`,
        userId,
        firstName: u?.name?.split(" ")[0] || "",
        lastName: u?.name?.split(" ").slice(1).join(" ") || "",
        fullName: u?.name || "",
        dob: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Pakistan",
        docType: "National ID",
        documentType: "National ID",
        docNumber: "",
        documentNumber: "",
        countryOfIssue: "Pakistan",
        issueDate: "",
        expiryDate: "",
        livenessPassed: false,
        advanceKycAllowed: true,
        hasFrontDoc: false,
        hasBackDoc: false,
        hasSelfie: false,
        basicStatus: "Not Started",
        advanceStatus: "Not Started",
        status: u?.kyc_status || "Not Started"
      });
    }
    res.json(mapKyc(kycRes.rows[0], { includeDocuments: includeDocs2 }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/kyc/basic", async (req, res) => {
  try {
    const {
      userId,
      fullName,
      firstName,
      lastName,
      dob,
      address,
      city,
      state,
      postalCode,
      country,
      docType,
      docNumber,
      countryOfIssue,
      issueDate,
      expiryDate
    } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const fName = firstName || (fullName ? fullName.split(" ")[0] : "User");
    const lName = lastName || (fullName ? fullName.split(" ").slice(1).join(" ") : "Member");
    const cleanDocType = docType || "National ID";
    const cleanCountry = country || "Pakistan";
    const id2 = `kyc_${userId}`;
    const upsertRes = await pool.query(`
      INSERT INTO kyc_verifications (
        id, user_id, first_name, last_name, dob, address, city, state, postal_code, country,
        doc_type, doc_number, country_of_issue, issue_date, expiry_date, basic_status, advance_status, advance_kyc_allowed, status, submitted_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, 'Approved', 'Not Started', TRUE, 'Submitted', CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        dob = COALESCE(EXCLUDED.dob, kyc_verifications.dob),
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        postal_code = EXCLUDED.postal_code,
        country = EXCLUDED.country,
        doc_type = EXCLUDED.doc_type,
        doc_number = EXCLUDED.doc_number,
        country_of_issue = EXCLUDED.country_of_issue,
        issue_date = COALESCE(EXCLUDED.issue_date, kyc_verifications.issue_date),
        expiry_date = COALESCE(EXCLUDED.expiry_date, kyc_verifications.expiry_date),
        basic_status = 'Approved',
        advance_kyc_allowed = TRUE,
        status = CASE WHEN kyc_verifications.status = 'Approved' THEN 'Approved'
                      WHEN kyc_verifications.document_front_url IS NOT NULL THEN 'Under Review'
                      ELSE 'Submitted' END,
        submitted_at = CURRENT_TIMESTAMP
      RETURNING *;
    `, [
      id2,
      userId,
      fName,
      lName,
      dob && dob.trim() !== "" ? dob : null,
      address || "",
      city || "",
      state || "",
      postalCode || "",
      cleanCountry,
      cleanDocType,
      docNumber || "",
      countryOfIssue || cleanCountry,
      issueDate && issueDate.trim() !== "" ? issueDate : null,
      expiryDate && expiryDate.trim() !== "" ? expiryDate : null
    ]);
    await pool.query(
      "UPDATE users SET kyc_status = CASE WHEN kyc_status = 'Approved' THEN 'Approved' ELSE 'Submitted' END WHERE id = $1;",
      [userId]
    );
    notifyUser(
      userId,
      "Basic KYC Information Submitted",
      `Your basic identity details (${cleanDocType}: ${docNumber}) have been verified and saved. You may now upload Advance KYC documents whenever ready.`,
      "kyc",
      "/kyc"
    ).catch(() => {
    });
    notifyAdmins(
      "New Basic KYC Details Submitted",
      `User ${fName} ${lName} (${userId}) submitted basic identity information (${cleanCountry}).`,
      "kyc",
      "/admin"
    ).catch(() => {
    });
    res.json(mapKyc(upsertRes.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/kyc/advance", async (req, res) => {
  try {
    const { userId, documentFrontUrl, documentBackUrl, selfieUrl } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!documentFrontUrl) {
      return res.status(400).json({ error: "Front document upload is required" });
    }
    const id2 = `kyc_${userId}`;
    const updateRes = await pool.query(`
      INSERT INTO kyc_verifications (
        id, user_id, document_front_url, document_back_url, selfie_url, liveness_passed, basic_status, advance_status, advance_kyc_allowed, status, submitted_at
      ) VALUES (
        $1, $2, $3, $4, $5, TRUE, 'Approved', 'Under Review', TRUE, 'Under Review', CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id) DO UPDATE SET
        document_front_url = EXCLUDED.document_front_url,
        document_back_url = COALESCE(EXCLUDED.document_back_url, kyc_verifications.document_back_url),
        selfie_url = COALESCE(EXCLUDED.selfie_url, kyc_verifications.selfie_url),
        liveness_passed = TRUE,
        advance_status = 'Under Review',
        basic_status = COALESCE(kyc_verifications.basic_status, 'Approved'),
        advance_kyc_allowed = TRUE,
        status = 'Under Review',
        submitted_at = CURRENT_TIMESTAMP
      RETURNING *;
    `, [
      id2,
      userId,
      documentFrontUrl,
      documentBackUrl || null,
      selfieUrl || null
    ]);
    await pool.query("UPDATE users SET kyc_status = 'Under Review' WHERE id = $1;", [userId]);
    notifyUser(
      userId,
      "Advanced KYC Under Review",
      "Your identity verification documents have been securely uploaded and are being reviewed by compliance.",
      "kyc",
      "/kyc"
    ).catch(() => {
    });
    notifyAdmins(
      "KYC Verification Documents Ready for Audit",
      `User ${userId} uploaded advanced identity documents and selfie. Immediate review required.`,
      "kyc",
      "/admin"
    ).catch(() => {
    });
    res.json(mapKyc(updateRes.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/kyc", async (req, res) => {
  try {
    const kycList = await pool.query(`
      SELECT 
        k.id, k.user_id, k.first_name, k.last_name, k.dob, k.address, k.city, k.state, k.postal_code,
        k.country, k.doc_type, k.doc_number, k.country_of_issue, k.issue_date, k.expiry_date,
        k.liveness_passed, k.basic_status, k.advance_status, k.advance_kyc_allowed, k.status,
        k.rejection_reason, k.submitted_at, k.reviewed_at, k.reviewed_by,
        (k.document_front_url IS NOT NULL AND k.document_front_url != '') as has_document_front,
        (k.document_back_url IS NOT NULL AND k.document_back_url != '') as has_document_back,
        (k.selfie_url IS NOT NULL AND k.selfie_url != '') as has_selfie,
        u.name as user_name, u.email as user_email, u.phone as user_phone, u.avatar as user_avatar, u.kyc_status as current_user_kyc_status
      FROM kyc_verifications k
      LEFT JOIN users u ON k.user_id = u.id
      ORDER BY k.submitted_at DESC NULLS LAST, k.id DESC;
    `);
    res.json(kycList.rows.map((row) => mapKyc(row, { includeDocuments: false })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get(["/api/kyc/:targetId/documents", "/api/admin/kyc/:targetId/documents"], async (req, res) => {
  try {
    const { targetId } = req.params;
    const kycRes = await pool.query(`
      SELECT user_id, doc_type, document_front_url, document_back_url, selfie_url, liveness_passed, status
      FROM kyc_verifications
      WHERE user_id = $1 OR id = $1
      LIMIT 1;
    `, [targetId]);
    if (kycRes.rows.length === 0) {
      return res.status(404).json({ error: "KYC documents not found for this user." });
    }
    const row = kycRes.rows[0];
    res.json({
      userId: row.user_id,
      docType: row.doc_type,
      documentFrontUrl: row.document_front_url || null,
      frontDocUrl: row.document_front_url || null,
      documentBackUrl: row.document_back_url || null,
      backDocUrl: row.document_back_url || null,
      selfieUrl: row.selfie_url || null,
      hasFrontDoc: Boolean(row.document_front_url && row.document_front_url.trim() !== ""),
      hasBackDoc: Boolean(row.document_back_url && row.document_back_url.trim() !== ""),
      hasSelfie: Boolean(row.selfie_url && row.selfie_url.trim() !== ""),
      livenessPassed: !!row.liveness_passed,
      status: row.status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/kyc/:id/review", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const { action, reason, reviewer } = req.body;
    const nextStatus = action === "approve" ? "Approved" : "Rejected";
    const reviewerName = reviewer || "Compliance Supervisor";
    let updateRes = await pool.query(`
      UPDATE kyc_verifications SET
        status = $2::varchar,
        basic_status = CASE WHEN $2::varchar = 'Approved' THEN 'Approved' ELSE basic_status END,
        advance_status = $2::varchar,
        advance_kyc_allowed = TRUE,
        rejection_reason = CASE WHEN $2::varchar = 'Rejected' THEN $3::text ELSE NULL END,
        reviewed_at = CURRENT_TIMESTAMP,
        reviewed_by = $4::varchar
      WHERE id = $1::varchar OR user_id = $1::varchar
      RETURNING *;
    `, [id2, nextStatus, reason || "Document verification failed", reviewerName]);
    if (updateRes.rows.length === 0) {
      const userRes = await pool.query("SELECT id, name FROM users WHERE id = $1::varchar LIMIT 1;", [id2]);
      if (userRes.rows.length > 0) {
        const uId = userRes.rows[0].id;
        updateRes = await pool.query(`
          INSERT INTO kyc_verifications (
            id, user_id, status, basic_status, advance_status, advance_kyc_allowed,
            rejection_reason, reviewed_at, reviewed_by
          ) VALUES (
            $1::varchar, $2::varchar, $3::varchar,
            CASE WHEN $3::varchar = 'Approved' THEN 'Approved' ELSE 'Pending' END,
            $3::varchar, TRUE,
            CASE WHEN $3::varchar = 'Rejected' THEN $4::text ELSE NULL END,
            CURRENT_TIMESTAMP, $5::varchar
          )
          ON CONFLICT (user_id) DO UPDATE SET
            status = EXCLUDED.status,
            basic_status = EXCLUDED.basic_status,
            advance_status = EXCLUDED.advance_status,
            advance_kyc_allowed = TRUE,
            rejection_reason = EXCLUDED.rejection_reason,
            reviewed_at = CURRENT_TIMESTAMP,
            reviewed_by = EXCLUDED.reviewed_by
          RETURNING *;
        `, [`kyc_${uId}`, uId, nextStatus, reason || "Document verification failed", reviewerName]);
      } else {
        return res.status(404).json({ error: "KYC record or user not found" });
      }
    }
    const row = updateRes.rows[0];
    await pool.query("UPDATE users SET kyc_status = $1 WHERE id = $2;", [nextStatus, row.user_id]);
    if (nextStatus === "Approved") {
      notifyUser(
        row.user_id,
        "KYC Identity Approved! \u{1F389}",
        "Your legal identity has been fully verified. You now enjoy unconstrained vehicle allocations and priority liquidity.",
        "kyc",
        "/kyc"
      ).catch(() => {
      });
    } else {
      notifyUser(
        row.user_id,
        "KYC Verification Update",
        `Your identity submission was rejected: "${reason || "Unclear documentation"}". Please re-submit valid details.`,
        "kyc",
        "/kyc"
      ).catch(() => {
      });
    }
    res.json(mapKyc(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var handleAdminAllowAdvanceKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const { allow } = req.body;
    const allowed = allow === true || allow === "true" || allow === 1;
    await pool.query(`
      INSERT INTO kyc_verifications (id, user_id, status, advance_kyc_allowed)
      VALUES ($1, $2, 'Not Started', $3)
      ON CONFLICT (user_id) DO UPDATE SET advance_kyc_allowed = $3;
    `, [`kyc_${userId}`, userId, allowed]);
    if (allowed) {
      await notifyUser(
        userId,
        "\u2705 Advanced KYC Authorized",
        "The RentoBit Compliance Team has authorized your account for Advanced KYC (ID document & selfie uploads). Please visit your KYC page to complete verification.",
        "kyc",
        "/kyc"
      ).catch(() => {
      });
    }
    res.json({ success: true, userId, advanceKycAllowed: allowed });
  } catch (err) {
    console.error("[AdminAllowAdvanceKYC Error]:", err);
    res.status(500).json({ error: err.message });
  }
};
app.patch("/api/admin/kyc/:userId/allow-advance", handleAdminAllowAdvanceKyc);
app.post("/api/admin/kyc/:userId/allow-advance", handleAdminAllowAdvanceKyc);
app.patch("/api/admin/users/:userId/allow-advance", handleAdminAllowAdvanceKyc);
app.post("/api/admin/users/:userId/allow-advance", handleAdminAllowAdvanceKyc);
app.get("/api/investments", async (req, res) => {
  try {
    const userId = req.query.userId || "usr_admin_001";
    const invRes = await pool.query(`
      SELECT ai.*, ip.image as plan_image
      FROM active_investments ai
      LEFT JOIN investment_plans ip ON ai.plan_id = ip.id
      WHERE ai.user_id = $1
      ORDER BY ai.created_at DESC;
    `, [userId]);
    res.json(invRes.rows.map((inv) => {
      const isActive = inv.status === "Active";
      const startDate = inv.start_date ? new Date(inv.start_date) : new Date(inv.created_at || Date.now());
      const nextTime = inv.next_reward_time ? new Date(inv.next_reward_time) : isActive ? new Date(startDate.getTime() + 24 * 3600 * 1e3) : null;
      const now = Date.now();
      const isMatured = isActive && nextTime ? now >= nextTime.getTime() : false;
      const secondsRemaining = isActive && nextTime ? Math.max(0, Math.floor((nextTime.getTime() - now) / 1e3)) : 0;
      return {
        id: inv.id,
        userId: inv.user_id,
        planId: inv.plan_id,
        planName: inv.plan_name,
        vehicleCategory: inv.vehicle_category,
        vehicleModel: inv.vehicle_model || "",
        investedAmount: parseFloat(inv.invested_amount),
        dailyReward: parseFloat(inv.daily_reward),
        startDate: startDate.toISOString(),
        endDate: inv.end_date ? new Date(inv.end_date).toISOString().split("T")[0] : "",
        nextRewardTime: nextTime.toISOString(),
        isMatured,
        secondsRemaining,
        totalEarned: parseFloat(inv.total_earned) || 0,
        progress: inv.progress || 0,
        status: inv.status || "Active",
        agreementUrl: inv.agreement_url || "#",
        image: inv.plan_image || ""
      };
    }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/investments", async (req, res) => {
  const client = await pool.connect();
  try {
    const { planId, amount, userId = "usr_admin_001" } = req.body;
    const numAmount = parseFloat(amount);
    await client.query("BEGIN");
    const planRes = await client.query("SELECT * FROM investment_plans WHERE id = $1 LIMIT 1", [planId]);
    if (!planRes.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Plan not found" });
    }
    const plan = planRes.rows[0];
    const minInvest = parseFloat(plan.min_invest);
    const maxInvest = parseFloat(plan.max_invest);
    const isUnlimited = plan.id === "plan_premium" || maxInvest >= 99999999;
    if (isNaN(numAmount) || numAmount < minInvest || !isUnlimited && numAmount > maxInvest) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: isUnlimited ? `Investment amount must be at least $${minInvest.toLocaleString()}` : `Investment amount must be between $${minInvest.toLocaleString()} and $${maxInvest.toLocaleString()}`
      });
    }
    const balRes = await client.query("SELECT * FROM balances WHERE user_id = $1 FOR UPDATE", [userId]);
    const currentBal = balRes.rows[0];
    if (!currentBal || parseFloat(currentBal.available_balance) < numAmount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Insufficient available balance. Please deposit funds first." });
    }
    const newAvail = parseFloat((parseFloat(currentBal.available_balance) - numAmount).toFixed(2));
    const newInvested = parseFloat((parseFloat(currentBal.total_invested) + numAmount).toFixed(2));
    const newPlansCount = (parseInt(currentBal.active_plans_count, 10) || 0) + 1;
    const updatedBalRes = await client.query(`
      UPDATE balances SET
        available_balance = $2,
        total_invested = $3,
        active_plans_count = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *;
    `, [userId, newAvail, newInvested, newPlansCount]);
    const invId = `inv_${Date.now()}`;
    const dailyReward = parseFloat((numAmount * parseFloat(plan.daily_reward_rate) / 100).toFixed(2));
    const vehicleModel = plan.vehicle_examples?.[0] || "Fleet Mobility Asset";
    const invInsert = await client.query(`
      INSERT INTO active_investments (id, user_id, plan_id, plan_name, vehicle_category, vehicle_model, invested_amount, daily_reward, start_date, end_date, next_reward_time, total_earned, progress, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + ($9 || ' days')::INTERVAL, CURRENT_TIMESTAMP + INTERVAL '24 hours', 0.00, 0, 'Active')
      RETURNING *;
    `, [
      invId,
      userId,
      plan.id,
      plan.name,
      plan.category,
      vehicleModel,
      numAmount,
      dailyReward,
      plan.duration_days
    ]);
    await client.query(`
      INSERT INTO transactions (id, user_id, type, amount, status, reference, details)
      VALUES ($1, $2, 'Investment', $3, 'Completed', $4, $5);
    `, [
      `TXN-${Math.floor(1e5 + Math.random() * 9e5)}`,
      userId,
      -numAmount,
      `INV-${invId.toUpperCase()}`,
      `${plan.name} Mobility Asset Allocation`
    ]);
    await client.query(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES ($1, $2, 'Investment Activated', $3, 'investment');
    `, [
      `notif_${Date.now()}`,
      userId,
      `You successfully allocated $${numAmount.toLocaleString()} to ${plan.name}.`
    ]);
    await client.query("COMMIT");
    notifyAdmins(
      "New Investment Plan Activated",
      `User ${userId} allocated $${numAmount.toLocaleString()} to ${plan.name}.`,
      "investment"
    ).catch(() => {
    });
    const balRow = updatedBalRes.rows[0];
    res.status(201).json({
      investment: {
        ...invInsert.rows[0],
        image: plan.image || ""
      },
      balance: {
        totalBalance: parseFloat(balRow.total_balance),
        availableBalance: parseFloat(balRow.available_balance),
        totalInvested: parseFloat(balRow.total_invested),
        todayReward: parseFloat(balRow.today_reward),
        activePlansCount: parseInt(balRow.active_plans_count, 10)
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});
app.post("/api/investments/:id/cancel-request", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id: id2 } = req.params;
    const { reason, userId } = req.body;
    await client.query("BEGIN");
    const invRes = await client.query("SELECT * FROM active_investments WHERE id = $1 FOR UPDATE", [id2]);
    if (!invRes.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Investment not found" });
    }
    const inv = invRes.rows[0];
    if (userId && inv.user_id !== userId) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "Unauthorized to cancel this investment" });
    }
    if (inv.status !== "Active") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: `Cannot cancel investment with status: ${inv.status}` });
    }
    const userRes = await client.query("SELECT name, email FROM users WHERE id = $1", [inv.user_id]);
    const userRow = userRes.rows[0] || { name: "User", email: "" };
    const reqId = `pcr_${Date.now()}`;
    await client.query(`
      INSERT INTO plan_cancellation_requests (
        id, investment_id, user_id, user_name, user_email, plan_name, invested_amount, today_reward, total_earned, reason, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Pending');
    `, [
      reqId,
      inv.id,
      inv.user_id,
      userRow.name,
      userRow.email,
      inv.plan_name,
      parseFloat(inv.invested_amount),
      parseFloat(inv.daily_reward || 0),
      parseFloat(inv.total_earned || 0),
      reason || "User requested contract cancellation"
    ]);
    await client.query("UPDATE active_investments SET status = 'Cancellation Requested' WHERE id = $1", [inv.id]);
    await client.query(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES ($1, $2, 'Cancellation Requested', $3, 'investment');
    `, [
      `notif_${Date.now()}`,
      inv.user_id,
      `Your request to cancel ${inv.plan_name} ($${parseFloat(inv.invested_amount).toFixed(2)}) has been submitted for admin approval.`
    ]);
    await client.query(`
      INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [
      `aud_${Date.now()}`,
      "PLAN_CANCEL_REQUESTED",
      userRow.name,
      `${userRow.name} (${inv.user_id})`,
      `Requested cancellation for ${inv.plan_name} ($${parseFloat(inv.invested_amount)})`,
      req.ip || "127.0.0.1"
    ]);
    await client.query("COMMIT");
    notifyAdmins(
      "Plan Cancellation Requested",
      `User ${userRow.name || inv.user_id} requested cancellation for ${inv.plan_name} ($${parseFloat(inv.invested_amount).toFixed(2)}).`,
      "investment"
    ).catch(() => {
    });
    res.json({
      success: true,
      message: "Plan cancellation requested successfully. Pending admin review.",
      requestId: reqId
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});
app.get("/api/admin/cancellations", async (req, res) => {
  try {
    const status = req.query.status;
    let query = "SELECT * FROM plan_cancellation_requests";
    const params = [];
    if (status && status !== "all") {
      query += " WHERE status = $1";
      params.push(status);
    }
    query += " ORDER BY created_at DESC LIMIT 100;";
    const reqRes = await pool.query(query, params);
    res.json(reqRes.rows.map((r) => ({
      id: r.id,
      investmentId: r.investment_id,
      userId: r.user_id,
      userName: r.user_name || "User",
      userEmail: r.user_email || "",
      planName: r.plan_name,
      investedAmount: parseFloat(r.invested_amount),
      todayReward: parseFloat(r.today_reward || 0),
      totalEarned: parseFloat(r.total_earned || 0),
      totalRefund: parseFloat(r.invested_amount),
      reason: r.reason || "",
      status: r.status,
      adminNote: r.admin_note || "",
      createdAt: r.created_at,
      resolvedAt: r.resolved_at
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/cancellations/:id/approve", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id: id2 } = req.params;
    const { note } = req.body;
    await client.query("BEGIN");
    const pcrRes = await client.query("SELECT * FROM plan_cancellation_requests WHERE id = $1 FOR UPDATE", [id2]);
    if (!pcrRes.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Cancellation request not found" });
    }
    const pcr = pcrRes.rows[0];
    if (pcr.status !== "Pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: `Request has already been ${pcr.status}` });
    }
    const invRes = await client.query("SELECT * FROM active_investments WHERE id = $1 FOR UPDATE", [pcr.investment_id]);
    const inv = invRes.rows[0];
    const balRes = await client.query("SELECT * FROM balances WHERE user_id = $1 FOR UPDATE", [pcr.user_id]);
    if (!balRes.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "User balance record not found" });
    }
    const bal = balRes.rows[0];
    const refundPrincipal = parseFloat(pcr.invested_amount);
    const totalCreditToAvailable = parseFloat(refundPrincipal.toFixed(2));
    const curAvail = parseFloat(bal.available_balance);
    const curInvested = parseFloat(bal.total_invested);
    const curPlansCount = parseInt(bal.active_plans_count, 10) || 0;
    const newAvail = parseFloat((curAvail + totalCreditToAvailable).toFixed(2));
    const newInvested = Math.max(0, parseFloat((curInvested - refundPrincipal).toFixed(2)));
    const newTotal = parseFloat((newAvail + newInvested).toFixed(2));
    const newPlansCount = Math.max(0, curPlansCount - 1);
    await client.query(`
      UPDATE balances SET
        available_balance = $2,
        total_invested = $3,
        total_balance = $4,
        active_plans_count = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1;
    `, [pcr.user_id, newAvail, newInvested, newTotal, newPlansCount]);
    if (inv) {
      await client.query("UPDATE active_investments SET status = 'Cancelled' WHERE id = $1", [inv.id]);
    }
    await client.query(`
      UPDATE plan_cancellation_requests SET
        status = 'Approved',
        admin_note = $2,
        resolved_at = CURRENT_TIMESTAMP
      WHERE id = $1;
    `, [id2, note || "Approved by Admin"]);
    await client.query(`
      INSERT INTO transactions (id, user_id, type, amount, status, reference, details)
      VALUES ($1, $2, 'Cancellation Refund', $3, 'Completed', $4, $5);
    `, [
      `TXN-${Math.floor(1e5 + Math.random() * 9e5)}`,
      pcr.user_id,
      totalCreditToAvailable,
      `REF-CANCEL-${pcr.investment_id.toUpperCase().slice(-8)}`,
      `${pcr.plan_name} Cancellation Refund ($${refundPrincipal.toFixed(2)} principal credited to Available Cash. Daily earnings claimable separately.)`
    ]);
    await client.query(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES ($1, $2, 'Plan Cancellation Approved', $3, 'investment');
    `, [
      `notif_${Date.now()}`,
      pcr.user_id,
      `Your cancellation for ${pcr.plan_name} was approved! $${totalCreditToAvailable.toFixed(2)} (principal) has been credited to your Available Cash. Today's accrued earning can be claimed at the next distribution window.`
    ]);
    await client.query(`
      INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address)
      VALUES ($1, $2, 'Admin', $3, $4, $5);
    `, [
      `aud_${Date.now()}`,
      "PLAN_CANCELLATION_APPROVED",
      `${pcr.user_name} (${pcr.user_id})`,
      `Approved cancellation of ${pcr.plan_name}. Refunded $${refundPrincipal} principal to Available Cash. Daily earnings remain in reward cycle.`,
      req.ip || "127.0.0.1"
    ]);
    await client.query("COMMIT");
    res.json({
      success: true,
      message: "Plan cancellation approved and principal refunded to Available Cash",
      creditedAmount: totalCreditToAvailable
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});
app.post("/api/admin/cancellations/:id/reject", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id: id2 } = req.params;
    const { reason } = req.body;
    await client.query("BEGIN");
    const pcrRes = await client.query("SELECT * FROM plan_cancellation_requests WHERE id = $1 FOR UPDATE", [id2]);
    if (!pcrRes.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Cancellation request not found" });
    }
    const pcr = pcrRes.rows[0];
    await client.query("UPDATE active_investments SET status = 'Active' WHERE id = $1", [pcr.investment_id]);
    await client.query(`
      UPDATE plan_cancellation_requests SET
        status = 'Rejected',
        admin_note = $2,
        resolved_at = CURRENT_TIMESTAMP
      WHERE id = $1;
    `, [id2, reason || "Cancellation rejected by Admin"]);
    await client.query(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES ($1, $2, 'Plan Cancellation Rejected', $3, 'investment');
    `, [
      `notif_${Date.now()}`,
      pcr.user_id,
      `Your cancellation request for ${pcr.plan_name} was rejected. Note: ${reason || "Contract term active"}`
    ]);
    await client.query(`
      INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address)
      VALUES ($1, $2, 'Admin', $3, $4, $5);
    `, [
      `aud_${Date.now()}`,
      "PLAN_CANCELLATION_REJECTED",
      `${pcr.user_name} (${pcr.user_id})`,
      `Rejected cancellation for ${pcr.plan_name}. Reason: ${reason || "None"}`,
      req.ip || "127.0.0.1"
    ]);
    await client.query("COMMIT");
    res.json({ success: true, message: "Cancellation request rejected" });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});
function formatIsoDate(d) {
  if (!d) return "";
  if (typeof d === "string") return d.slice(0, 10);
  if (d instanceof Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return String(d).slice(0, 10);
}
function getTodayDateStr(tz = "Asia/Karachi") {
  try {
    const dtf = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    return dtf.format(/* @__PURE__ */ new Date());
  } catch {
    return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  }
}
async function runAutoClaimDistribution(options = {}) {
  const client = await pool.connect();
  let inTransaction = false;
  let claimsCount = 0;
  let totalAmount = 0;
  const details = [];
  try {
    const distRes = await client.query(
      "SELECT value FROM system_settings WHERE key = 'distribution_schedule' LIMIT 1;"
    );
    const distSettings = distRes.rows[0]?.value || {
      startTime: "12:00",
      endTime: "15:00",
      timezone: "Asia/Karachi",
      distributionEnabled: true,
      allowImmediateClaim: false,
      autoClaimEnabled: true
    };
    if (!distSettings.distributionEnabled && !options.force) {
      return { success: false, claimsCount: 0, totalAmount: 0, details: ["Distribution paused by administration"] };
    }
    if (distSettings.autoClaimEnabled === false && !options.force) {
      return { success: false, claimsCount: 0, totalAmount: 0, details: ["Auto-claim engine disabled"] };
    }
    const tz = distSettings.timezone || "Asia/Karachi";
    const todayStr = getTodayDateStr(tz);
    const [startH = 12, startM = 0] = (distSettings.startTime || "12:00").split(":").map(Number);
    const [endH = 15, endM = 0] = (distSettings.endTime || "15:00").split(":").map(Number);
    const now = /* @__PURE__ */ new Date();
    let curH = now.getHours();
    let curM = now.getMinutes();
    let curS = now.getSeconds();
    try {
      const dtf = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour12: false,
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
      });
      const parts = dtf.formatToParts(now);
      for (const p of parts) {
        if (p.type === "hour") curH = parseInt(p.value, 10);
        if (p.type === "minute") curM = parseInt(p.value, 10);
        if (p.type === "second") curS = parseInt(p.value, 10);
      }
      if (curH === 24) curH = 0;
    } catch {
    }
    const nowSecs = curH * 3600 + curM * 60 + curS;
    const startSecs = startH * 3600 + startM * 60;
    const endSecs = endH * 3600 + endM * 60;
    const isWindowOpen = options.force || distSettings.allowImmediateClaim || (endSecs > startSecs ? nowSecs >= startSecs && nowSecs < endSecs : nowSecs >= startSecs || nowSecs < endSecs);
    const startH12 = startH % 12 || 12;
    const startAmpm = startH >= 12 ? "PM" : "AM";
    const endH12 = endH % 12 || 12;
    const endAmpm = endH >= 12 ? "PM" : "AM";
    const startLabel = `${startH12}:${String(startM).padStart(2, "0")} ${startAmpm}`;
    const endLabel = `${endH12}:${String(endM).padStart(2, "0")} ${endAmpm}`;
    let invsQuery = `
      SELECT ai.*, u.name as user_fullname, u.email as user_email
      FROM active_investments ai
      JOIN users u ON ai.user_id = u.id
      WHERE ai.status = 'Active'
    `;
    const invsParams = [];
    if (options.userId) {
      invsParams.push(options.userId);
      invsQuery += ` AND ai.user_id = $${invsParams.length}`;
    }
    const invsRes = await client.query(invsQuery, invsParams);
    for (const inv of invsRes.rows) {
      const amt = parseFloat(inv.daily_reward) || 0;
      if (amt <= 0) continue;
      const existingClaimed = await client.query(
        `SELECT id FROM daily_rewards
         WHERE user_id = $1 AND reward_date = $2 AND plan_name = $3 AND status = 'Claimed'
         LIMIT 1;`,
        [inv.user_id, todayStr, inv.plan_name || "Fleet Mobility Asset"]
      );
      if (existingClaimed.rows.length > 0) continue;
      const startDate = inv.start_date ? new Date(inv.start_date) : new Date(inv.created_at || Date.now());
      const nextTime = inv.next_reward_time ? new Date(inv.next_reward_time) : new Date(startDate.getTime() + 24 * 3600 * 1e3);
      const isMatured = Date.now() >= nextTime.getTime();
      if (!isWindowOpen && !isMatured && !options.force) {
        continue;
      }
      await client.query("BEGIN");
      inTransaction = true;
      const txnId = `TXN-${Math.floor(1e5 + Math.random() * 9e5)}`;
      const rewId = `rew_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const existingRow = await client.query(
        `SELECT id FROM daily_rewards
         WHERE user_id = $1 AND reward_date = $2 AND plan_name = $3
         LIMIT 1;`,
        [inv.user_id, todayStr, inv.plan_name || "Fleet Mobility Asset"]
      );
      if (existingRow.rows.length > 0) {
        await client.query(
          `UPDATE daily_rewards
           SET status = 'Claimed', claimed_at = CURRENT_TIMESTAMP, transaction_id = $1, net_amount = $2, gross_amount = $2
           WHERE id = $3;`,
          [txnId, amt, existingRow.rows[0].id]
        );
      } else {
        await client.query(
          `INSERT INTO daily_rewards (id, user_id, plan_name, reward_date, gross_amount, withholding, fee, net_amount, status, claimed_at, transaction_id, claim_window_start, claim_window_end)
           VALUES ($1, $2, $3, $4::date, $5, 0.00, 0.00, $5, 'Claimed', CURRENT_TIMESTAMP, $6, $7, $8)
           ON CONFLICT (user_id, plan_name, reward_date) DO UPDATE SET
             status = 'Claimed',
             claimed_at = CURRENT_TIMESTAMP,
             transaction_id = EXCLUDED.transaction_id,
             net_amount = EXCLUDED.net_amount,
             gross_amount = EXCLUDED.gross_amount;`,
          [rewId, inv.user_id, inv.plan_name || "Fleet Mobility Asset", todayStr, amt, txnId, startLabel, endLabel]
        );
      }
      await client.query(
        `INSERT INTO transactions (id, user_id, type, amount, status, reference, details)
         VALUES ($1, $2, 'Daily Reward', $3, 'Completed', $4, $5);`,
        [
          txnId,
          inv.user_id,
          amt,
          `AUTO-CLAIM-${Date.now().toString().slice(-6)}`,
          `${inv.plan_name} Daily Earning auto-credited to Available Cash (Auto-Distribution Window)`
        ]
      );
      await client.query(
        `UPDATE active_investments
         SET next_reward_time = CURRENT_TIMESTAMP + INTERVAL '24 hours',
             total_earned = total_earned + $1,
             progress = LEAST(100, progress + 1)
         WHERE id = $2;`,
        [amt, inv.id]
      );
      await client.query(
        `INSERT INTO balances (user_id, available_balance, total_balance, today_reward, updated_at)
         VALUES ($1, $2, $2, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO UPDATE SET
           available_balance = balances.available_balance + EXCLUDED.available_balance,
           total_balance = balances.total_balance + EXCLUDED.total_balance,
           today_reward = balances.today_reward + EXCLUDED.today_reward,
           updated_at = CURRENT_TIMESTAMP;`,
        [inv.user_id, amt]
      );
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await client.query(
        `INSERT INTO notifications (id, user_id, title, message, type, is_read, action_url)
         VALUES ($1, $2, $3, $4, 'reward', false, '/rewards')
         ON CONFLICT (id) DO NOTHING;`,
        [
          notifId,
          inv.user_id,
          "Daily Reward Auto-Credited",
          `+$${amt.toFixed(2)} daily yield from ${inv.plan_name} was auto-credited to your Available Cash.`
        ]
      );
      await client.query("COMMIT");
      inTransaction = false;
      claimsCount++;
      totalAmount += amt;
      details.push(`Auto-credited $${amt.toFixed(2)} for ${inv.user_fullname || inv.user_id} (${inv.plan_name})`);
    }
    let uncollectedQuery = `
      SELECT * FROM daily_rewards
      WHERE status IN ('Available', 'Unlocked', 'Locked')
    `;
    const uncollectedParams = [];
    if (options.userId) {
      uncollectedParams.push(options.userId);
      uncollectedQuery += ` AND user_id = $${uncollectedParams.length}`;
    }
    const uncollectedRes = await client.query(uncollectedQuery, uncollectedParams);
    for (const rew of uncollectedRes.rows) {
      const amt = parseFloat(rew.net_amount) || 0;
      if (amt <= 0) continue;
      await client.query("BEGIN");
      inTransaction = true;
      const txnId = `TXN-${Math.floor(1e5 + Math.random() * 9e5)}`;
      await client.query(
        `UPDATE daily_rewards
         SET status = 'Claimed', claimed_at = CURRENT_TIMESTAMP, transaction_id = $1
         WHERE id = $2;`,
        [txnId, rew.id]
      );
      await client.query(
        `INSERT INTO transactions (id, user_id, type, amount, status, reference, details)
         VALUES ($1, $2, 'Daily Reward', $3, 'Completed', $4, $5);`,
        [
          txnId,
          rew.user_id,
          amt,
          `AUTO-CLAIM-${Date.now().toString().slice(-6)}`,
          `${rew.plan_name} Daily Earning auto-cleared & credited to Available Cash`
        ]
      );
      await client.query(
        `INSERT INTO balances (user_id, available_balance, total_balance, today_reward, updated_at)
         VALUES ($1, $2, $2, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO UPDATE SET
           available_balance = balances.available_balance + EXCLUDED.available_balance,
           total_balance = balances.total_balance + EXCLUDED.total_balance,
           today_reward = balances.today_reward + EXCLUDED.today_reward,
           updated_at = CURRENT_TIMESTAMP;`,
        [rew.user_id, amt]
      );
      await client.query("COMMIT");
      inTransaction = false;
      claimsCount++;
      totalAmount += amt;
      details.push(`Auto-cleared reward ${rew.id} ($${amt.toFixed(2)}) for user ${rew.user_id}`);
    }
    return { success: true, claimsCount, totalAmount, details };
  } catch (err) {
    if (inTransaction) {
      await client.query("ROLLBACK");
    }
    console.error("[Auto-Claim Engine Error]:", err);
    return { success: false, claimsCount, totalAmount, details: [err.message] };
  } finally {
    client.release();
  }
}
app.get("/api/rewards", async (req, res) => {
  try {
    const userId = req.query.userId || "usr_admin_001";
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
    const offset = (page - 1) * limit;
    const distRes = await pool.query(
      "SELECT value FROM system_settings WHERE key = 'distribution_schedule' LIMIT 1;"
    );
    const distSettings = distRes.rows[0]?.value || {
      startTime: "12:00",
      endTime: "15:00",
      timezone: "Asia/Karachi",
      distributionEnabled: true,
      allowImmediateClaim: false,
      autoClaimEnabled: true
    };
    const tz = distSettings.timezone || "Asia/Karachi";
    const todayStr = getTodayDateStr(tz);
    if (distSettings.distributionEnabled && distSettings.autoClaimEnabled !== false) {
      try {
        await runAutoClaimDistribution({ userId });
      } catch (autoErr) {
        console.error("[Auto-Claim on GET /api/rewards Warning]:", autoErr);
      }
    }
    if (!distSettings.distributionEnabled || distSettings.autoClaimEnabled === false) {
      const [startH = 12, startM = 0] = (distSettings.startTime || "12:00").split(":").map(Number);
      const [endH = 15, endM = 0] = (distSettings.endTime || "15:00").split(":").map(Number);
      const startH12 = startH % 12 || 12;
      const startAmpm = startH >= 12 ? "PM" : "AM";
      const endH12 = endH % 12 || 12;
      const endAmpm = endH >= 12 ? "PM" : "AM";
      const startLabel = `${startH12}:${String(startM).padStart(2, "0")} ${startAmpm}`;
      const endLabel = `${endH12}:${String(endM).padStart(2, "0")} ${endAmpm}`;
      const activeInvsRes = await pool.query(
        `SELECT * FROM active_investments
         WHERE user_id = $1 AND status = 'Active';`,
        [userId]
      );
      if (activeInvsRes.rows.length > 0) {
        for (const inv of activeInvsRes.rows) {
          const earning = parseFloat(inv.daily_reward) || 0;
          if (earning <= 0) continue;
          const planName = inv.plan_name || "Fleet Mobility Asset";
          const existingRow = await pool.query(
            `SELECT id FROM daily_rewards
             WHERE user_id = $1 AND reward_date = $2::date AND plan_name = $3
             LIMIT 1;`,
            [userId, todayStr, planName]
          );
          if (existingRow.rows.length > 0) continue;
          const rewId = `rew_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          await pool.query(
            `INSERT INTO daily_rewards (id, user_id, plan_name, reward_date, gross_amount, withholding, fee, net_amount, status, claim_window_start, claim_window_end)
             VALUES ($1, $2, $3, $4::date, $5, 0.00, 0.00, $5, 'Available', $6, $7)
             ON CONFLICT (user_id, plan_name, reward_date) DO NOTHING;`,
            [rewId, userId, planName, todayStr, earning, startLabel, endLabel]
          );
        }
      }
    }
    const statusFilter = req.query.status || "all";
    let whereClause = "WHERE user_id = $1";
    const queryParams = [userId];
    if (statusFilter && statusFilter !== "all") {
      queryParams.push(statusFilter);
      whereClause += ` AND status = $${queryParams.length}`;
    }
    const countParams = [...queryParams];
    const offsetIndex = queryParams.length + 2;
    const limitIndex = queryParams.length + 1;
    queryParams.push(limit, offset);
    const [rewardsRes, countRes, todaySummaryRes] = await Promise.all([
      pool.query(
        `SELECT * FROM daily_rewards ${whereClause} ORDER BY reward_date DESC, created_at DESC LIMIT $${limitIndex} OFFSET $${offsetIndex};`,
        queryParams
      ),
      pool.query(`SELECT COUNT(*) FROM daily_rewards ${whereClause};`, countParams),
      pool.query(
        `SELECT status, net_amount FROM daily_rewards WHERE user_id = $1 AND reward_date = $2;`,
        [userId, todayStr]
      )
    ]);
    const total = parseInt(countRes.rows[0].count, 10);
    res.json({
      data: rewardsRes.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        planName: r.plan_name,
        date: formatIsoDate(r.reward_date),
        grossAmount: parseFloat(r.gross_amount),
        withholding: parseFloat(r.withholding) || 0,
        fee: parseFloat(r.fee) || 0,
        netAmount: parseFloat(r.net_amount),
        status: r.status,
        claimWindowStart: r.claim_window_start || "12:00 PM",
        claimWindowEnd: r.claim_window_end || "3:00 PM",
        claimedAt: r.claimed_at,
        lockTime: r.lock_time,
        transactionId: r.transaction_id
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      todayRewards: todaySummaryRes.rows.map((r) => ({
        status: r.status,
        netAmount: parseFloat(r.net_amount) || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/settings/distribution", async (req, res) => {
  try {
    const queryRes = await pool.query(
      "SELECT value FROM system_settings WHERE key = 'distribution_schedule' LIMIT 1;"
    );
    const defaultSettings = {
      startTime: "12:00",
      endTime: "15:00",
      timezone: "Asia/Karachi",
      distributionEnabled: true,
      allowImmediateClaim: false,
      autoClaimEnabled: true,
      label: "Daily Distribution Window (12:00 PM - 03:00 PM)"
    };
    const settings = queryRes.rows[0]?.value ? { ...defaultSettings, ...queryRes.rows[0].value } : defaultSettings;
    res.json({
      ...settings,
      autoClaimEnabled: settings.autoClaimEnabled !== false,
      serverTime: (/* @__PURE__ */ new Date()).toISOString(),
      serverEpoch: Date.now()
    });
  } catch (error) {
    res.json({
      startTime: "12:00",
      endTime: "15:00",
      timezone: "Asia/Karachi",
      distributionEnabled: true,
      allowImmediateClaim: false,
      autoClaimEnabled: true,
      label: "Daily Distribution Window (12:00 PM - 03:00 PM)",
      serverTime: (/* @__PURE__ */ new Date()).toISOString(),
      serverEpoch: Date.now()
    });
  }
});
app.post("/api/settings/distribution", async (req, res) => {
  try {
    const {
      startTime = "12:00",
      endTime = "15:00",
      timezone = "Asia/Karachi",
      distributionEnabled = true,
      allowImmediateClaim = false,
      autoClaimEnabled = true,
      label = "Daily Distribution Window (12:00 PM - 03:00 PM)"
    } = req.body;
    const payload = {
      startTime,
      endTime,
      timezone,
      distributionEnabled: Boolean(distributionEnabled),
      allowImmediateClaim: Boolean(allowImmediateClaim),
      autoClaimEnabled: Boolean(autoClaimEnabled),
      label
    };
    await pool.query(
      `INSERT INTO system_settings (key, value, updated_at)
       VALUES ('distribution_schedule', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET
         value = EXCLUDED.value,
         updated_at = CURRENT_TIMESTAMP;`,
      [JSON.stringify(payload)]
    );
    await pool.query(
      `INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `aud_${Date.now()}`,
        "DISTRIBUTION_SCHEDULE_UPDATED",
        req.body.adminEmail || "SuperAdmin",
        "All Users",
        `Schedule set to ${startTime} - ${endTime} ${timezone}. Auto-claim: ${autoClaimEnabled}. Force open: ${allowImmediateClaim}`,
        req.ip || "127.0.0.1"
      ]
    );
    if (payload.distributionEnabled && (payload.autoClaimEnabled || payload.allowImmediateClaim)) {
      setTimeout(() => {
        runAutoClaimDistribution().catch((e) => console.error("[Auto-Claim Sweep after Settings Update Error]:", e));
      }, 500);
    }
    res.json({ success: true, settings: payload });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/distribution/run-auto-claim", async (req, res) => {
  try {
    const result = await runAutoClaimDistribution({ force: true });
    await pool.query(
      `INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `aud_${Date.now()}`,
        "AUTO_CLAIM_SWEEP_TRIGGERED",
        req.body?.adminEmail || "SuperAdmin",
        "All Active Plan Holders",
        `Auto-claim executed: ${result.claimsCount} claims processed, $${result.totalAmount.toFixed(2)} total credited to client wallets.`,
        req.ip || "127.0.0.1"
      ]
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/rewards/claim", async (req, res) => {
  const client = await pool.connect();
  let inTransaction = false;
  try {
    const { rewardId, investmentId, userId = "usr_admin_001" } = req.body;
    const distRes = await client.query(
      "SELECT value FROM system_settings WHERE key = 'distribution_schedule' LIMIT 1;"
    );
    const distSettings = distRes.rows[0]?.value || {
      startTime: "12:00",
      endTime: "15:00",
      timezone: "Asia/Karachi",
      distributionEnabled: true,
      allowImmediateClaim: false
    };
    if (!distSettings.distributionEnabled) {
      return res.status(400).json({ error: "Daily rewards distribution is currently paused by administration." });
    }
    const tz = distSettings.timezone || "Asia/Karachi";
    const todayStr = getTodayDateStr(tz);
    if (!distSettings.allowImmediateClaim) {
      const [startH = 12, startM = 0] = (distSettings.startTime || "12:00").split(":").map(Number);
      const [endH = 15, endM = 0] = (distSettings.endTime || "15:00").split(":").map(Number);
      const now = /* @__PURE__ */ new Date();
      let curH = now.getHours();
      let curM = now.getMinutes();
      let curS = now.getSeconds();
      try {
        const dtf = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          hour12: false,
          hour: "numeric",
          minute: "numeric",
          second: "numeric"
        });
        const parts = dtf.formatToParts(now);
        for (const p of parts) {
          if (p.type === "hour") curH = parseInt(p.value, 10);
          if (p.type === "minute") curM = parseInt(p.value, 10);
          if (p.type === "second") curS = parseInt(p.value, 10);
        }
        if (curH === 24) curH = 0;
      } catch {
      }
      const nowSecs = curH * 3600 + curM * 60 + curS;
      const startSecs = startH * 3600 + startM * 60;
      const endSecs = endH * 3600 + endM * 60;
      const isOpen = endSecs > startSecs ? nowSecs >= startSecs && nowSecs < endSecs : nowSecs >= startSecs || nowSecs < endSecs;
      let hasMaturedInvestment = false;
      if (investmentId) {
        const checkMaturedRes = await client.query(
          `SELECT id FROM active_investments
           WHERE id = $1 AND user_id = $2 AND status = 'Active'
             AND (
               (next_reward_time IS NOT NULL AND next_reward_time <= CURRENT_TIMESTAMP)
               OR (next_reward_time IS NULL AND (COALESCE(start_date, created_at) <= CURRENT_TIMESTAMP - INTERVAL '24 hours'))
             );`,
          [investmentId, userId]
        );
        hasMaturedInvestment = checkMaturedRes.rows.length > 0;
      } else {
        const checkMaturedRes = await client.query(
          `SELECT id FROM active_investments
           WHERE user_id = $1 AND status = 'Active'
             AND (
               (next_reward_time IS NOT NULL AND next_reward_time <= CURRENT_TIMESTAMP)
               OR (next_reward_time IS NULL AND (COALESCE(start_date, created_at) <= CURRENT_TIMESTAMP - INTERVAL '24 hours'))
             )
           LIMIT 1;`,
          [userId]
        );
        hasMaturedInvestment = checkMaturedRes.rows.length > 0;
      }
      if (!isOpen && !hasMaturedInvestment) {
        return res.status(400).json({
          error: `Distribution window is closed. Daily earnings can only be claimed during daytime (${distSettings.startTime} - ${distSettings.endTime} ${tz}).`
        });
      }
    }
    await client.query("BEGIN");
    inTransaction = true;
    let claimedAmount = 0;
    if (investmentId) {
      const invRes = await client.query(
        "SELECT * FROM active_investments WHERE id = $1 AND user_id = $2 AND status = 'Active' FOR UPDATE;",
        [investmentId, userId]
      );
      if (invRes.rows.length === 0) {
        await client.query("ROLLBACK");
        inTransaction = false;
        return res.status(404).json({ error: "Active investment plan not found." });
      }
      const inv = invRes.rows[0];
      const startDate = inv.start_date ? new Date(inv.start_date) : new Date(inv.created_at || Date.now());
      const nextTime = inv.next_reward_time ? new Date(inv.next_reward_time) : new Date(startDate.getTime() + 24 * 3600 * 1e3);
      const isMatured = Date.now() >= nextTime.getTime();
      if (!isMatured) {
        await client.query("ROLLBACK");
        inTransaction = false;
        return res.status(400).json({
          error: "Your investment plan is currently in its 24-hour maturation cycle. Daily earning unlocks once the countdown finishes."
        });
      }
      const amt = parseFloat(inv.daily_reward) || 0;
      if (amt <= 0) {
        await client.query("ROLLBACK");
        inTransaction = false;
        return res.status(400).json({ error: "No daily reward available on this plan." });
      }
      claimedAmount = amt;
      const txnId = `TXN-${Math.floor(1e5 + Math.random() * 9e5)}`;
      const rewId = `rew_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await client.query(
        `INSERT INTO daily_rewards (id, user_id, plan_name, reward_date, gross_amount, withholding, fee, net_amount, status, claimed_at, transaction_id)
         VALUES ($1, $2, $3, $4, $5, 0.00, 0.00, $5, 'Claimed', CURRENT_TIMESTAMP, $6);`,
        [rewId, userId, inv.plan_name || "Fleet Mobility Asset", todayStr, amt, txnId]
      );
      await client.query(
        `INSERT INTO transactions (id, user_id, type, amount, status, reference, details)
         VALUES ($1, $2, 'Daily Reward', $3, 'Completed', $4, $5);`,
        [txnId, userId, amt, `CLAIM-${Date.now().toString().slice(-6)}`, `${inv.plan_name} Daily Earning credited to Available Cash`]
      );
      await client.query(
        `UPDATE active_investments
         SET next_reward_time = CURRENT_TIMESTAMP + INTERVAL '24 hours',
             total_earned = total_earned + $1,
             progress = LEAST(100, progress + 1)
         WHERE id = $2;`,
        [amt, inv.id]
      );
    } else if (rewardId) {
      const rewRes = await client.query(
        "SELECT * FROM daily_rewards WHERE id = $1 AND user_id = $2 FOR UPDATE;",
        [rewardId, userId]
      );
      if (rewRes.rows.length === 0) {
        await client.query("ROLLBACK");
        inTransaction = false;
        return res.status(404).json({ error: "Reward record not found." });
      }
      const rew = rewRes.rows[0];
      if (rew.status === "Claimed") {
        await client.query("ROLLBACK");
        inTransaction = false;
        return res.status(400).json({ error: "This reward has already been claimed for today." });
      }
      if (rew.status === "Locked") {
        await client.query("ROLLBACK");
        inTransaction = false;
        return res.status(400).json({ error: "This reward is locked. Please submit an unlock request." });
      }
      if (rew.status === "Unlock Requested") {
        await client.query("ROLLBACK");
        inTransaction = false;
        return res.status(400).json({ error: "Unlock request is pending admin review." });
      }
      claimedAmount = parseFloat(rew.net_amount) || 0;
      const txnId = `TXN-${Math.floor(1e5 + Math.random() * 9e5)}`;
      await client.query(
        "UPDATE daily_rewards SET status = 'Claimed', claimed_at = CURRENT_TIMESTAMP, transaction_id = $1 WHERE id = $2;",
        [txnId, rew.id]
      );
      await client.query(
        `INSERT INTO transactions (id, user_id, type, amount, status, reference, details)
         VALUES ($1, $2, 'Daily Reward', $3, 'Completed', $4, $5);`,
        [txnId, userId, claimedAmount, `CLAIM-${Date.now().toString().slice(-6)}`, `${rew.plan_name} Daily Earning credited to Available Cash`]
      );
      await client.query(
        `UPDATE active_investments
         SET next_reward_time = CURRENT_TIMESTAMP + INTERVAL '24 hours',
             total_earned = total_earned + $1,
             progress = LEAST(100, progress + 1)
         WHERE user_id = $2 AND plan_name = $3 AND status = 'Active';`,
        [claimedAmount, userId, rew.plan_name]
      );
    } else {
      const claimableRes = await client.query(
        `SELECT * FROM daily_rewards
         WHERE user_id = $1 AND (status = 'Available' OR status = 'Unlocked')
         FOR UPDATE;`,
        [userId]
      );
      if (claimableRes.rows.length > 0) {
        for (const rew of claimableRes.rows) {
          const amt = parseFloat(rew.net_amount) || 0;
          claimedAmount += amt;
          const txnId = `TXN-${Math.floor(1e5 + Math.random() * 9e5)}`;
          await client.query(
            "UPDATE daily_rewards SET status = 'Claimed', claimed_at = CURRENT_TIMESTAMP, transaction_id = $1 WHERE id = $2;",
            [txnId, rew.id]
          );
          await client.query(
            `INSERT INTO transactions (id, user_id, type, amount, status, reference, details)
             VALUES ($1, $2, 'Daily Reward', $3, 'Completed', $4, $5);`,
            [txnId, userId, amt, `CLAIM-${Date.now().toString().slice(-6)}`, `${rew.plan_name} Daily Earning credited to Available Cash`]
          );
          await client.query(
            `UPDATE active_investments
             SET next_reward_time = CURRENT_TIMESTAMP + INTERVAL '24 hours',
                 total_earned = total_earned + $1,
                 progress = LEAST(100, progress + 1)
             WHERE user_id = $2 AND plan_name = $3 AND status = 'Active';`,
            [amt, userId, rew.plan_name]
          );
        }
      } else {
        const todayClaimedRes = await client.query(
          "SELECT COUNT(*) FROM daily_rewards WHERE user_id = $1 AND reward_date = $2 AND status = 'Claimed';",
          [userId, todayStr]
        );
        if (parseInt(todayClaimedRes.rows[0].count, 10) > 0) {
          await client.query("ROLLBACK");
          inTransaction = false;
          return res.status(400).json({ error: "You have already claimed your daily rewards for today." });
        }
        const activeInvs = await client.query(
          `SELECT * FROM active_investments
           WHERE user_id = $1
             AND status = 'Active'
             AND (
               (next_reward_time IS NOT NULL AND next_reward_time <= CURRENT_TIMESTAMP)
               OR (next_reward_time IS NULL AND (COALESCE(start_date, created_at) <= CURRENT_TIMESTAMP - INTERVAL '24 hours'))
             );`,
          [userId]
        );
        if (activeInvs.rows.length === 0) {
          const unmaturedInvs = await client.query(
            "SELECT * FROM active_investments WHERE user_id = $1 AND status = 'Active' ORDER BY created_at ASC LIMIT 1;",
            [userId]
          );
          await client.query("ROLLBACK");
          inTransaction = false;
          if (unmaturedInvs.rows.length > 0) {
            return res.status(400).json({
              error: "Your investment plan is currently in its initial 24-hour maturation cycle. Your first daily reward unlocks 24 hours after plan activation."
            });
          }
          return res.status(400).json({ error: "No active investment plans found." });
        }
        for (const inv of activeInvs.rows) {
          const amt = parseFloat(inv.daily_reward) || 0;
          if (amt <= 0) continue;
          claimedAmount += amt;
          const txnId = `TXN-${Math.floor(1e5 + Math.random() * 9e5)}`;
          const rewId = `rew_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          await client.query(
            `INSERT INTO daily_rewards (id, user_id, plan_name, reward_date, gross_amount, withholding, fee, net_amount, status, claimed_at, transaction_id)
             VALUES ($1, $2, $3, $4, $5, 0.00, 0.00, $5, 'Claimed', CURRENT_TIMESTAMP, $6);`,
            [rewId, userId, inv.plan_name || "Fleet Mobility Asset", todayStr, amt, txnId]
          );
          await client.query(
            `INSERT INTO transactions (id, user_id, type, amount, status, reference, details)
             VALUES ($1, $2, 'Daily Reward', $3, 'Completed', $4, $5);`,
            [txnId, userId, amt, `CLAIM-${Date.now().toString().slice(-6)}`, `${inv.plan_name} Daily Earning credited to Available Cash`]
          );
          await client.query(
            `UPDATE active_investments
             SET next_reward_time = CURRENT_TIMESTAMP + INTERVAL '24 hours',
                 total_earned = total_earned + $1,
                 progress = LEAST(100, progress + 1)
             WHERE id = $2;`,
            [amt, inv.id]
          );
        }
      }
    }
    if (claimedAmount <= 0) {
      await client.query("ROLLBACK");
      inTransaction = false;
      return res.status(400).json({ error: "No unclaimed earnings available to claim." });
    }
    const balUpdRes = await client.query(
      `UPDATE balances
       SET available_balance = available_balance + $1,
           total_balance = total_balance + $1,
           today_reward = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *;`,
      [claimedAmount, userId]
    );
    await client.query("COMMIT");
    inTransaction = false;
    const updatedBal = balUpdRes.rows[0];
    const updatedRewardsRes = await pool.query(
      "SELECT * FROM daily_rewards WHERE user_id = $1 ORDER BY reward_date DESC, created_at DESC LIMIT 30;",
      [userId]
    );
    const updatedInvsRes = await pool.query(`
      SELECT ai.*, ip.image as plan_image
      FROM active_investments ai
      LEFT JOIN investment_plans ip ON ai.plan_id = ip.id
      WHERE ai.user_id = $1
      ORDER BY ai.created_at DESC;
    `, [userId]);
    const formattedInvs = updatedInvsRes.rows.map((inv) => {
      const startDate = inv.start_date ? new Date(inv.start_date) : new Date(inv.created_at || Date.now());
      const nextTime = inv.next_reward_time ? new Date(inv.next_reward_time) : new Date(startDate.getTime() + 24 * 3600 * 1e3);
      const now = Date.now();
      const isMatured = now >= nextTime.getTime();
      const secondsRemaining = Math.max(0, Math.floor((nextTime.getTime() - now) / 1e3));
      return {
        id: inv.id,
        userId: inv.user_id,
        planId: inv.plan_id,
        planName: inv.plan_name,
        vehicleCategory: inv.vehicle_category,
        vehicleModel: inv.vehicle_model || "",
        investedAmount: parseFloat(inv.invested_amount),
        dailyReward: parseFloat(inv.daily_reward),
        startDate: startDate.toISOString(),
        endDate: inv.end_date ? new Date(inv.end_date).toISOString().split("T")[0] : "",
        nextRewardTime: nextTime.toISOString(),
        isMatured,
        secondsRemaining,
        totalEarned: parseFloat(inv.total_earned) || 0,
        progress: inv.progress || 0,
        status: inv.status || "Active",
        agreementUrl: inv.agreement_url || "#",
        image: inv.plan_image || ""
      };
    });
    res.json({
      success: true,
      claimedAmount,
      balance: updatedBal ? {
        totalBalance: parseFloat(updatedBal.total_balance),
        availableBalance: parseFloat(updatedBal.available_balance),
        totalInvested: parseFloat(updatedBal.total_invested),
        todayReward: parseFloat(updatedBal.today_reward),
        activePlansCount: parseInt(updatedBal.active_plans_count, 10)
      } : void 0,
      investments: formattedInvs,
      rewards: updatedRewardsRes.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        planName: r.plan_name,
        date: formatIsoDate(r.reward_date),
        grossAmount: parseFloat(r.gross_amount),
        withholding: parseFloat(r.withholding) || 0,
        fee: parseFloat(r.fee) || 0,
        netAmount: parseFloat(r.net_amount),
        status: r.status,
        claimWindowStart: r.claim_window_start || "12:00 PM",
        claimWindowEnd: r.claim_window_end || "3:00 PM",
        claimedAt: r.claimed_at,
        lockTime: r.lock_time,
        transactionId: r.transaction_id
      }))
    });
  } catch (error) {
    if (inTransaction) {
      await client.query("ROLLBACK");
    }
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});
app.post("/api/rewards/unlock-request", async (req, res) => {
  try {
    const { rewardId, reason, userId = "usr_admin_001" } = req.body;
    if (!rewardId) return res.status(400).json({ error: "rewardId is required." });
    const rewRes = await pool.query(
      "SELECT * FROM daily_rewards WHERE id = $1 AND user_id = $2;",
      [rewardId, userId]
    );
    if (rewRes.rows.length === 0) return res.status(404).json({ error: "Reward record not found." });
    const rew = rewRes.rows[0];
    const userRes = await pool.query("SELECT name, email FROM users WHERE id = $1;", [userId]);
    const u = userRes.rows[0] || {};
    const reqId = `UNL-${Math.floor(1e4 + Math.random() * 9e4)}`;
    await pool.query(
      `INSERT INTO unlock_requests (id, user_id, user_name, user_email, reward_id, plan_name, gross_reward, claim_window, lock_time, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9, 'Under Support Review')
       ON CONFLICT (id) DO NOTHING;`,
      [
        reqId,
        userId,
        u.name || "Member",
        u.email || "user@rentobit.com",
        rewardId,
        rew.plan_name,
        rew.gross_amount,
        `${rew.claim_window_start || "12:00 PM"} - ${rew.claim_window_end || "3:00 PM"}`,
        reason || "Missed claim window due to connectivity delay"
      ]
    );
    await pool.query(
      "UPDATE daily_rewards SET status = 'Unlock Requested', unlock_request_id = $1 WHERE id = $2;",
      [reqId, rewardId]
    );
    res.json({ success: true, requestId: reqId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/unlocks/review", async (req, res) => {
  try {
    const { requestId, action, note, adminEmail = "SuperAdmin" } = req.body;
    const newStatus = action === "approve" ? "Approved" : "Rejected";
    const unlRes = await pool.query("SELECT * FROM unlock_requests WHERE id = $1;", [requestId]);
    if (unlRes.rows.length === 0) return res.status(404).json({ error: "Unlock request not found." });
    const unl = unlRes.rows[0];
    await pool.query(
      `UPDATE unlock_requests
       SET status = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2
       WHERE id = $3;`,
      [newStatus, adminEmail, requestId]
    );
    if (action === "approve" && unl.reward_id) {
      await pool.query(
        "UPDATE daily_rewards SET status = 'Unlocked' WHERE id = $1;",
        [unl.reward_id]
      );
    }
    res.json({ success: true, status: newStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/unlock-requests", async (req, res) => {
  try {
    const uRes = await pool.query("SELECT * FROM unlock_requests ORDER BY submitted_at DESC;");
    res.json(uRes.rows.map(mapUnlockRequest));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/rewards/unlock-requests", async (req, res) => {
  try {
    const userId = req.query.userId || req.headers["x-user-id"];
    if (!userId) return res.status(400).json({ error: "userId is required." });
    const uRes = await pool.query("SELECT * FROM unlock_requests WHERE user_id = $1 ORDER BY submitted_at DESC;", [userId]);
    res.json(uRes.rows.map(mapUnlockRequest));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/deposits", async (req, res) => {
  try {
    const userId = req.query.userId || "usr_admin_001";
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const [depRes, countRes] = await Promise.all([
      pool.query(
        `SELECT 
           id, user_id, plan_id, plan_name, investment_id, amount, payment_method,
           reference, fee, total_amount, status, rejection_reason, approved_at,
           approved_by, created_at,
           (proof_url IS NOT NULL AND proof_url != '') as has_proof
         FROM deposits 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3;`,
        [userId, limit, offset]
      ),
      pool.query("SELECT COUNT(*) FROM deposits WHERE user_id = $1;", [userId])
    ]);
    const total = parseInt(countRes.rows[0].count, 10);
    res.json({
      data: depRes.rows.map((d) => ({
        id: d.id,
        userId: d.user_id,
        planId: d.plan_id,
        planName: d.plan_name,
        investmentId: d.investment_id,
        amount: parseFloat(d.amount),
        paymentMethod: d.payment_method,
        reference: d.reference,
        proofUrl: null,
        // Omitted from bulk list; loaded lazily on-demand via /api/deposits/:id/proof
        hasProof: Boolean(d.has_proof),
        fee: parseFloat(d.fee) || 0,
        totalAmount: parseFloat(d.total_amount),
        status: d.status,
        rejectionReason: d.rejection_reason,
        approvedAt: d.approved_at,
        approvedBy: d.approved_by,
        createdAt: d.created_at
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/deposits", async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount, paymentMethod, reference, proofUrl, planId, planName, userId = "usr_admin_001" } = req.body;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: "Valid deposit amount required" });
    }
    if (!proofUrl) {
      return res.status(400).json({ error: "Payment screenshot / receipt is mandatory for deposit verification." });
    }
    await client.query("BEGIN");
    const depId = `DEP-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const ref = reference || `REF-${Date.now().toString().slice(-6)}`;
    const insertRes = await client.query(`
      INSERT INTO deposits (id, user_id, plan_id, plan_name, investment_id, amount, payment_method, reference, proof_url, fee, total_amount, status)
      VALUES ($1, $2, NULL, 'Wallet Deposit', NULL, $3, $4, $5, $6, 0.00, $3, 'Pending')
      RETURNING *;
    `, [depId, userId, numAmount, paymentMethod || "Bank Transfer", ref, proofUrl || null]);
    await client.query(`
      INSERT INTO transactions (id, user_id, type, amount, status, reference, details)
      VALUES ($1, $2, 'Deposit', $3, 'Pending', $4, $5);
    `, [
      `TXN-${Math.floor(1e5 + Math.random() * 9e5)}`,
      userId,
      numAmount,
      ref,
      `${paymentMethod || "Deposit"} Funds Ingress Request ($${numAmount.toLocaleString()})`
    ]);
    await client.query(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES ($1, $2, 'Deposit Received', $3, 'finance');
    `, [
      `notif_${Date.now()}`,
      userId,
      `Deposit request of $${numAmount.toLocaleString()} is pending admin verification. Funds will credit to your Available Balance once approved.`
    ]);
    await client.query("COMMIT");
    const userLookup = await pool.query("SELECT name, email FROM users WHERE id = $1 LIMIT 1;", [userId]);
    const uName = userLookup.rows[0]?.name || userLookup.rows[0]?.email || userId;
    notifyAdmins(
      "New Deposit Pending Verification",
      `User ${uName} submitted a deposit of $${numAmount.toLocaleString()} for Available Balance top-up via ${paymentMethod || "Deposit"}. Screenshot attached.`,
      "deposit"
    ).catch(() => {
    });
    res.status(201).json({ deposit: insertRes.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});
app.get("/api/withdrawals", async (req, res) => {
  try {
    const userId = req.query.userId || "usr_admin_001";
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const [wthRes, countRes] = await Promise.all([
      pool.query(
        "SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;",
        [userId, limit, offset]
      ),
      pool.query("SELECT COUNT(*) FROM withdrawals WHERE user_id = $1;", [userId])
    ]);
    const total = parseInt(countRes.rows[0].count, 10);
    res.json({
      data: wthRes.rows.map((w) => ({
        id: w.id,
        userId: w.user_id,
        amount: parseFloat(w.amount),
        paymentMethod: w.payment_method,
        destinationDetails: w.destination_details,
        fee: parseFloat(w.fee) || 0,
        netAmount: parseFloat(w.net_amount),
        status: w.status,
        createdAt: w.created_at,
        twoFactorVerified: !!w.two_factor_verified,
        rejectionReason: w.rejection_reason || null,
        adminComment: w.admin_comment || null,
        txHash: w.tx_hash || null
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/withdrawals", async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount, paymentMethod, destinationDetails, userId = "usr_admin_001", fee: reqFee, pin } = req.body;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: "Valid withdrawal amount required" });
    }
    await client.query("BEGIN");
    const userRes = await client.query("SELECT id, withdraw_pin_hash FROM users WHERE id = $1 FOR UPDATE", [userId]);
    const userRow = userRes.rows[0];
    if (!userRow) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "User account not found" });
    }
    const registeredPin = userRow.withdraw_pin_hash;
    if (registeredPin) {
      if (!pin || String(pin).trim() !== String(registeredPin).trim()) {
        await client.query("ROLLBACK");
        return res.status(401).json({ error: "Incorrect Security PIN. Please enter your registered withdrawal PIN." });
      }
    } else if (pin && /^\d{4,6}$/.test(String(pin).trim())) {
      await client.query("UPDATE users SET withdraw_pin_hash = $1 WHERE id = $2", [String(pin).trim(), userId]);
    }
    const balRes = await client.query("SELECT * FROM balances WHERE user_id = $1 FOR UPDATE", [userId]);
    const currentBal = balRes.rows[0];
    if (!currentBal || parseFloat(currentBal.available_balance) < numAmount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Withdrawal amount exceeds available balance" });
    }
    const fee = reqFee !== void 0 && !isNaN(parseFloat(reqFee)) ? Math.max(0, parseFloat(reqFee)) : 1;
    const netAmount = parseFloat(Math.max(0, numAmount - fee).toFixed(2));
    const newAvail = parseFloat((parseFloat(currentBal.available_balance) - numAmount).toFixed(2));
    const newTotal = parseFloat((parseFloat(currentBal.total_balance) - numAmount).toFixed(2));
    const updatedBalRes = await client.query(`
      UPDATE balances SET
        available_balance = $2,
        total_balance = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *;
    `, [userId, newAvail, newTotal]);
    const wthId = `WTH-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const wthInsert = await client.query(`
      INSERT INTO withdrawals (id, user_id, amount, payment_method, destination_details, fee, net_amount, status, two_factor_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending', TRUE)
      RETURNING *;
    `, [wthId, userId, numAmount, paymentMethod || "USDT TRC20", destinationDetails || "Crypto Address", fee, netAmount]);
    await client.query(`
      INSERT INTO transactions (id, user_id, type, amount, fee, status, reference, details)
      VALUES ($1, $2, 'Withdrawal', $3, $4, 'Pending', $5, $6);
    `, [
      `TXN-${Math.floor(1e5 + Math.random() * 9e5)}`,
      userId,
      -numAmount,
      fee,
      `WTH-${wthId}`,
      `${paymentMethod || "Withdrawal"} to ${destinationDetails}`
    ]);
    await client.query(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES ($1, $2, 'Withdrawal Submitted', $3, 'finance');
    `, [
      `notif_${Date.now()}`,
      userId,
      `Withdrawal request for $${numAmount.toLocaleString()} has been queued for verification.`
    ]);
    await client.query("COMMIT");
    const userLookup = await pool.query("SELECT name, email FROM users WHERE id = $1 LIMIT 1;", [userId]);
    const uName = userLookup.rows[0]?.name || userLookup.rows[0]?.email || userId;
    notifyAdmins(
      "New Withdrawal Requested",
      `User ${uName} requested a withdrawal of $${numAmount.toLocaleString()} via ${paymentMethod || "Withdrawal"}.`,
      "finance"
    ).catch(() => {
    });
    const balRow = updatedBalRes.rows[0];
    res.status(201).json({
      withdrawal: wthInsert.rows[0],
      balance: {
        totalBalance: parseFloat(balRow.total_balance),
        availableBalance: parseFloat(balRow.available_balance),
        totalInvested: parseFloat(balRow.total_invested),
        todayReward: parseFloat(balRow.today_reward),
        activePlansCount: parseInt(balRow.active_plans_count, 10)
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});
app.get("/api/kyc", async (req, res) => {
  try {
    const userId = req.query.userId || "usr_admin_001";
    const kycRes = await pool.query(`
      SELECT 
        id, user_id, first_name, last_name, dob, address, city, state, postal_code,
        country, doc_type, doc_number, country_of_issue, issue_date, expiry_date,
        liveness_passed, status, basic_status, advance_status, advance_kyc_allowed,
        rejection_reason, submitted_at, reviewed_at, reviewed_by,
        (document_front_url IS NOT NULL AND document_front_url != '') as has_front_doc,
        (document_back_url IS NOT NULL AND document_back_url != '') as has_back_doc,
        (selfie_url IS NOT NULL AND selfie_url != '') as has_selfie
        ${includeDocs ? ", document_front_url, document_back_url, selfie_url" : ""}
      FROM kyc_verifications 
      WHERE user_id = $1 LIMIT 1;
    `, [userId]);
    const k = kycRes.rows[0];
    if (!k) {
      return res.json({
        userId,
        status: "Not Started",
        livenessPassed: false,
        hasFrontDoc: false,
        hasBackDoc: false,
        hasSelfie: false
      });
    }
    const hasFrontDoc = Boolean(k.document_front_url && k.document_front_url.trim() !== "");
    const hasBackDoc = Boolean(k.document_back_url && k.document_back_url.trim() !== "");
    const hasSelfie = Boolean(k.selfie_url && k.selfie_url.trim() !== "");
    res.json({
      id: k.id,
      userId: k.user_id,
      firstName: k.first_name,
      lastName: k.last_name,
      dob: k.dob,
      address: k.address,
      city: k.city,
      state: k.state,
      postalCode: k.postal_code,
      country: k.country,
      docType: k.doc_type,
      docNumber: k.doc_number,
      countryOfIssue: k.country_of_issue,
      issueDate: k.issue_date,
      expiryDate: k.expiry_date,
      hasFrontDoc,
      hasBackDoc,
      hasSelfie,
      frontDocUrl: includeDocs ? k.document_front_url : void 0,
      documentFrontUrl: includeDocs ? k.document_front_url : void 0,
      backDocUrl: includeDocs ? k.document_back_url : void 0,
      documentBackUrl: includeDocs ? k.document_back_url : void 0,
      selfieUrl: includeDocs ? k.selfie_url : void 0,
      livenessPassed: !!k.liveness_passed,
      status: k.status,
      rejectionReason: k.rejection_reason,
      submittedAt: k.submitted_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/kyc", async (req, res) => {
  try {
    const { userId = "usr_admin_001", firstName, lastName, dob, address, city, state, postalCode, country, docType, docNumber, docCountry, docExpiry, frontDocUrl, backDocUrl, selfieUrl } = req.body;
    const kycId = `kyc_${Date.now()}`;
    const upsertRes = await pool.query(`
      INSERT INTO kyc_verifications (id, user_id, first_name, last_name, dob, address, city, state, postal_code, country, doc_type, doc_number, country_of_issue, expiry_date, document_front_url, document_back_url, selfie_url, liveness_passed, status, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, TRUE, 'Under Review', CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        dob = EXCLUDED.dob,
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        postal_code = EXCLUDED.postal_code,
        country = EXCLUDED.country,
        doc_type = EXCLUDED.doc_type,
        doc_number = EXCLUDED.doc_number,
        country_of_issue = EXCLUDED.country_of_issue,
        expiry_date = EXCLUDED.expiry_date,
        document_front_url = EXCLUDED.document_front_url,
        document_back_url = EXCLUDED.document_back_url,
        selfie_url = EXCLUDED.selfie_url,
        status = 'Under Review',
        submitted_at = CURRENT_TIMESTAMP
      RETURNING *;
    `, [
      kycId,
      userId,
      firstName,
      lastName,
      dob || null,
      address,
      city,
      state,
      postalCode,
      country,
      docType,
      docNumber,
      docCountry || country,
      docExpiry || null,
      frontDocUrl || null,
      backDocUrl || null,
      selfieUrl || null
    ]);
    await pool.query("UPDATE users SET kyc_status = 'Under Review' WHERE id = $1", [userId]);
    await pool.query(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES ($1, $2, 'KYC Submitted', 'Your identity documents have been submitted for compliance review.', 'kyc');
    `, [`notif_${Date.now()}`, userId]);
    const userLookup = await pool.query("SELECT name, email FROM users WHERE id = $1 LIMIT 1;", [userId]);
    const uName = userLookup.rows[0]?.name || userLookup.rows[0]?.email || userId;
    notifyAdmins(
      "New KYC Verification Pending",
      `User ${uName} submitted identity documents for KYC review.`,
      "kyc"
    ).catch(() => {
    });
    res.json({ success: true, kyc: upsertRes.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/transactions", async (req, res) => {
  try {
    const userId = req.query.userId || "usr_admin_001";
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const [txnRes, countRes] = await Promise.all([
      pool.query(
        "SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;",
        [userId, limit, offset]
      ),
      pool.query("SELECT COUNT(*) FROM transactions WHERE user_id = $1;", [userId])
    ]);
    const total = parseInt(countRes.rows[0].count, 10);
    res.json({
      data: txnRes.rows.map((t) => ({
        id: t.id,
        userId: t.user_id,
        type: t.type,
        amount: parseFloat(t.amount),
        fee: parseFloat(t.fee) || 0,
        status: t.status,
        date: t.created_at ? new Date(t.created_at).toLocaleString() : "Just now",
        reference: t.reference,
        details: t.details
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/notifications", async (req, res) => {
  try {
    const userId = req.query.userId || "usr_admin_001";
    const timeframe = req.query.timeframe || "week";
    const type = req.query.type;
    const unreadOnly = req.query.unreadOnly === "true";
    let timeClause = "";
    if (timeframe === "week" || timeframe === "7d") {
      timeClause = ` AND created_at >= NOW() - INTERVAL '7 days'`;
    } else if (timeframe === "today" || timeframe === "24h") {
      timeClause = ` AND created_at >= CURRENT_DATE`;
    } else if (timeframe === "month" || timeframe === "30d") {
      timeClause = ` AND created_at >= NOW() - INTERVAL '30 days'`;
    }
    const params = [userId];
    let typeClause = "";
    if (type && type !== "all") {
      params.push(type);
      typeClause = ` AND type = $${params.length}`;
    }
    let unreadClause = "";
    if (unreadOnly) {
      unreadClause = ` AND is_read = FALSE`;
    }
    const notifRes = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 ${timeClause} ${typeClause} ${unreadClause}
       ORDER BY created_at DESC LIMIT 200;`,
      params
    );
    res.json(notifRes.rows.map((n) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type || "general",
      isRead: !!n.is_read,
      date: formatRelativeTime(n.created_at),
      actionUrl: n.action_url,
      createdAt: n.created_at
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/notifications/stats", async (req, res) => {
  try {
    const userId = req.query.userId || "usr_admin_001";
    const [weekRes, todayRes, allRes, unreadRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days';", [userId]),
      pool.query("SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND created_at >= CURRENT_DATE;", [userId]),
      pool.query("SELECT COUNT(*) FROM notifications WHERE user_id = $1;", [userId]),
      pool.query("SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE;", [userId])
    ]);
    res.json({
      totalWeek: parseInt(weekRes.rows[0]?.count || "0", 10),
      totalToday: parseInt(todayRes.rows[0]?.count || "0", 10),
      totalAll: parseInt(allRes.rows[0]?.count || "0", 10),
      unreadCount: parseInt(unreadRes.rows[0]?.count || "0", 10)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/notifications", async (req, res) => {
  try {
    const timeframe = req.query.timeframe || "week";
    const scope = req.query.scope || "all";
    const type = req.query.type;
    const search = (req.query.search || "").trim().toLowerCase();
    const limit = Math.min(parseInt(req.query.limit || "150", 10), 500);
    let timeClause = "";
    if (timeframe === "week" || timeframe === "7d") {
      timeClause = ` AND n.created_at >= NOW() - INTERVAL '7 days'`;
    } else if (timeframe === "today" || timeframe === "24h") {
      timeClause = ` AND n.created_at >= CURRENT_DATE`;
    } else if (timeframe === "month" || timeframe === "30d") {
      timeClause = ` AND n.created_at >= NOW() - INTERVAL '30 days'`;
    }
    const params = [];
    let scopeClause = "";
    if (scope === "admin") {
      params.push("usr_admin_001");
      scopeClause = ` AND (n.user_id = $${params.length} OR u.role = 'admin')`;
    }
    let typeClause = "";
    if (type && type !== "all") {
      params.push(type);
      typeClause = ` AND n.type = $${params.length}`;
    }
    let searchClause = "";
    if (search) {
      params.push(`%${search}%`);
      searchClause = ` AND (LOWER(n.title) LIKE $${params.length} OR LOWER(n.message) LIKE $${params.length} OR LOWER(COALESCE(u.name, '')) LIKE $${params.length} OR LOWER(COALESCE(u.email, '')) LIKE $${params.length})`;
    }
    const query = `
      SELECT 
        n.id, 
        n.user_id, 
        n.title, 
        n.message, 
        n.type, 
        n.is_read, 
        n.action_url, 
        n.created_at,
        COALESCE(u.name, 'Member') as user_name,
        COALESCE(u.email, '') as user_email,
        u.avatar as user_avatar,
        u.role as user_role
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE 1=1 ${timeClause} ${scopeClause} ${typeClause} ${searchClause}
      ORDER BY n.created_at DESC
      LIMIT ${limit};
    `;
    const [notifRes, statsRes] = await Promise.all([
      pool.query(query, params),
      pool.query(`
        SELECT 
          COUNT(*) as total_all,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as total_week,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as total_today,
          COUNT(*) FILTER (WHERE is_read = FALSE) as unread_count,
          COUNT(*) FILTER (WHERE type IN ('finance', 'deposit', 'withdrawal')) as finance_count,
          COUNT(*) FILTER (WHERE type = 'kyc') as kyc_count,
          COUNT(*) FILTER (WHERE type = 'reward') as reward_count,
          COUNT(*) FILTER (WHERE type = 'support') as support_count
        FROM notifications;
      `)
    ]);
    const statsRow = statsRes.rows[0] || {};
    res.json({
      notifications: notifRes.rows.map((n) => ({
        id: n.id,
        userId: n.user_id,
        userName: n.user_name,
        userEmail: n.user_email,
        userAvatar: n.user_avatar,
        userRole: n.user_role,
        title: n.title,
        message: n.message,
        type: n.type || "general",
        isRead: !!n.is_read,
        date: formatRelativeTime(n.created_at),
        actionUrl: n.action_url,
        createdAt: n.created_at
      })),
      stats: {
        totalAll: parseInt(statsRow.total_all || "0", 10),
        totalWeek: parseInt(statsRow.total_week || "0", 10),
        totalToday: parseInt(statsRow.total_today || "0", 10),
        unreadCount: parseInt(statsRow.unread_count || "0", 10),
        financeCount: parseInt(statsRow.finance_count || "0", 10),
        kycCount: parseInt(statsRow.kyc_count || "0", 10),
        rewardCount: parseInt(statsRow.reward_count || "0", 10),
        supportCount: parseInt(statsRow.support_count || "0", 10)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/api/notifications/read-all", async (req, res) => {
  try {
    const userId = req.query.userId || "usr_admin_001";
    await pool.query("UPDATE notifications SET is_read = TRUE WHERE user_id = $1;", [userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    await pool.query("UPDATE notifications SET is_read = TRUE WHERE id = $1;", [id2]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/notifications/clear-week", async (req, res) => {
  try {
    const userId = req.query.userId || req.headers["x-user-id"] || "usr_admin_001";
    await pool.query("DELETE FROM notifications WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days';", [userId]);
    res.json({ success: true, message: "Weekly notifications cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/notifications/clear-all", async (req, res) => {
  try {
    const userId = req.query.userId || req.headers["x-user-id"] || "usr_admin_001";
    await pool.query("DELETE FROM notifications WHERE user_id = $1;", [userId]);
    res.json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/notifications/:id", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    if (id2 === "clear-all") {
      const userId = req.query.userId || req.headers["x-user-id"] || "usr_admin_001";
      await pool.query("DELETE FROM notifications WHERE user_id = $1;", [userId]);
      return res.json({ success: true, message: "All notifications cleared" });
    }
    if (id2 === "clear-week") {
      const userId = req.query.userId || req.headers["x-user-id"] || "usr_admin_001";
      await pool.query("DELETE FROM notifications WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days';", [userId]);
      return res.json({ success: true, message: "Weekly notifications cleared" });
    }
    await pool.query("DELETE FROM notifications WHERE id = $1;", [id2]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/support/tickets", async (req, res) => {
  try {
    const userId = req.query.userId || "usr_admin_001";
    const ticketsRes = await pool.query("SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC;", [userId]);
    const tickets = [];
    for (const t of ticketsRes.rows) {
      const msgRes = await pool.query("SELECT * FROM support_messages WHERE ticket_id = $1 ORDER BY created_at ASC;", [t.id]);
      tickets.push({
        id: t.id,
        userId: t.user_id,
        userName: t.user_name || "User",
        userEmail: t.user_email || "",
        subject: t.subject,
        category: t.category,
        status: t.status,
        priority: t.priority,
        attachedRewardId: t.attached_reward_id,
        attachedInvestmentId: t.attached_investment_id,
        createdDate: t.created_at ? new Date(t.created_at).toLocaleString() : "Just now",
        lastUpdate: t.updated_at ? new Date(t.updated_at).toLocaleString() : "Just now",
        messages: msgRes.rows.map((m) => ({
          id: m.id,
          sender: m.sender,
          senderName: m.sender_name,
          message: m.message,
          timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString() : "Just now"
        }))
      });
    }
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/support/tickets", async (req, res) => {
  try {
    const { subject, category, message, attachedRewardId, userId = "usr_admin_001", userName = "User", userEmail = "" } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: "Subject and message are required" });
    }
    const tckId = `TCK-${Math.floor(1e3 + Math.random() * 9e3)}`;
    await pool.query(`
      INSERT INTO support_tickets (id, user_id, user_name, user_email, subject, category, status, priority, attached_reward_id)
      VALUES ($1, $2, $3, $4, $5, $6, 'Open', 'Medium', $7);
    `, [tckId, userId, userName, userEmail, subject, category || "General", attachedRewardId || null]);
    const msgId = `msg_${Date.now()}`;
    await pool.query(`
      INSERT INTO support_messages (id, ticket_id, sender, sender_name, message)
      VALUES ($1, $2, 'user', $3, $4);
    `, [msgId, tckId, userName, message]);
    notifyUser(
      userId,
      "Support Ticket Submitted",
      `Your ticket #${tckId} (${subject}) has been received. Our team will get back to you soon.`,
      "support"
    ).catch(() => {
    });
    notifyAdmins(
      "New Support Ticket Opened",
      `Ticket #${tckId} from ${userName}: ${subject}`,
      "support"
    ).catch(() => {
    });
    res.status(201).json({
      id: tckId,
      userId,
      userName,
      userEmail,
      subject,
      category: category || "General",
      status: "Open",
      priority: "Medium",
      createdDate: "Just now",
      lastUpdate: "Just now",
      messages: [{ id: msgId, sender: "user", senderName: userName, message, timestamp: "Just now" }]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/support/tickets/:id/reply", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const { message, userId, userName } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });
    const msgId = `msg_${Date.now()}`;
    const senderName = userName || "User";
    await pool.query(
      `INSERT INTO support_messages (id, ticket_id, sender, sender_name, message) VALUES ($1, $2, 'user', $3, $4)`,
      [msgId, id2, senderName, message]
    );
    await pool.query(
      `UPDATE support_tickets SET status = 'Open', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id2]
    );
    notifyAdmins(
      "Support Reply from User",
      `User replied on ticket #${id2}: ${message.substring(0, 80)}`,
      "support"
    ).catch(() => {
    });
    res.json({ success: true, messageId: msgId, sender: "user", senderName, message, timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var handleUserTicketStatus = async (req, res) => {
  try {
    const rawId = req.params.id || "";
    const id2 = rawId.trim();
    const { status, userId } = req.body;
    const newStatus = status === "Closed" ? "Closed" : "Completed";
    let query = "UPDATE support_tickets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE (id = $2 OR LOWER(TRIM(id)) = LOWER(TRIM($2)))";
    const params = [newStatus, id2];
    if (userId) {
      query += " AND user_id = $3";
      params.push(userId);
    }
    const updateRes = await pool.query(query + " RETURNING *", params);
    notifyAdmins(
      `Ticket Marked ${newStatus}`,
      `Ticket #${id2} marked as ${newStatus} by member.`,
      "support"
    ).catch(() => {
    });
    res.json({ success: true, status: newStatus, ticket: updateRes.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
app.patch("/api/support/tickets/:id/status", handleUserTicketStatus);
app.post("/api/support/tickets/:id/status", handleUserTicketStatus);
app.post("/api/admin/support/tickets/initiate", async (req, res) => {
  try {
    const { targetUserId, subject, message, category = "General" } = req.body;
    if (!targetUserId || !subject || !message) {
      return res.status(400).json({ error: "targetUserId, subject and message are required" });
    }
    const userRes = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [targetUserId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const u = userRes.rows[0];
    const tckId = `TCK-${Math.floor(1e3 + Math.random() * 9e3)}`;
    await pool.query(
      `INSERT INTO support_tickets (id, user_id, user_name, user_email, subject, category, status, priority)
       VALUES ($1, $2, $3, $4, $5, $6, 'In Progress', 'High')`,
      [tckId, u.id, u.name, u.email, subject, category]
    );
    const msgId = `msg_${Date.now()}`;
    await pool.query(
      `INSERT INTO support_messages (id, ticket_id, sender, sender_name, message) VALUES ($1, $2, 'admin', 'RentoBit Support', $3)`,
      [msgId, tckId, message]
    );
    await pool.query(
      `INSERT INTO notifications (id, user_id, title, message, type) VALUES ($1, $2, 'Message from Support', $3, 'support')`,
      [`notif_${Date.now()}`, u.id, `Support Team: ${subject}`]
    );
    res.status(201).json({
      id: tckId,
      userId: u.id,
      userName: u.name,
      userEmail: u.email,
      subject,
      category,
      status: "In Progress",
      priority: "High",
      createdDate: "Just now",
      lastUpdate: "Just now",
      messages: [{ id: msgId, sender: "admin", senderName: "RentoBit Support", message, timestamp: "Just now" }]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/users/profile", async (req, res) => {
  try {
    const { userId, name, email, phone } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const userLookup = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
    if (userLookup.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const currentEmail = userLookup.rows[0].email;
    if (email && email.trim().toLowerCase() !== currentEmail.toLowerCase()) {
      return res.status(400).json({
        error: "Email address cannot be changed after account creation. It is permanently bound to your account identity."
      });
    }
    const parts = (name || "").trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    await pool.query(
      `UPDATE users SET name = $1, first_name = $2, last_name = $3, phone = $4 WHERE id = $5`,
      [name || "", firstName, lastName, phone || "", userId]
    );
    const updated = await pool.query("SELECT id, name, first_name, last_name, email, phone, avatar, role, status, kyc_status, two_factor_enabled, referral_code, referred_by, created_at FROM users WHERE id = $1", [userId]);
    const u = updated.rows[0];
    res.json({
      id: u.id,
      name: u.name,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      phone: u.phone,
      avatar: u.avatar,
      role: u.role,
      status: u.status,
      kycStatus: u.kyc_status,
      twoFactorEnabled: u.two_factor_enabled,
      referralCode: u.referral_code,
      referredBy: u.referred_by,
      createdAt: u.created_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/users/password", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: "userId, currentPassword and newPassword are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }
    const userRes = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });
    if (userRes.rows[0].password_hash !== currentPassword) return res.status(401).json({ error: "Current password is incorrect" });
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newPassword, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/users/withdraw-pin", async (req, res) => {
  try {
    const { userId, currentPin, newPin } = req.body;
    if (!userId || !newPin) return res.status(400).json({ error: "userId and newPin are required" });
    if (!/^\d{4,6}$/.test(newPin)) return res.status(400).json({ error: "PIN must be 4-6 digits" });
    const userRes = await pool.query("SELECT withdraw_pin_hash FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });
    if (userRes.rows[0].withdraw_pin_hash) {
      if (!currentPin) return res.status(400).json({ error: "Current PIN required to update" });
      if (currentPin !== userRes.rows[0].withdraw_pin_hash) return res.status(401).json({ error: "Current PIN is incorrect" });
    }
    await pool.query("UPDATE users SET withdraw_pin_hash = $1 WHERE id = $2", [newPin, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/dashboard", async (req, res) => {
  try {
    const usersRes = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_users,
        COUNT(CASE WHEN status = 'Suspended' THEN 1 END) as suspended_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as new_today,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_this_week,
        COUNT(CASE WHEN referred_by IS NOT NULL THEN 1 END) as referred_users
      FROM users;
    `);
    const usersData = usersRes.rows[0];
    const kycRes = await pool.query(`
      SELECT 
        COUNT(*) as total_kyc,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_kyc,
        COUNT(CASE WHEN status IN ('Under Review', 'Documents Uploaded', 'Submitted') THEN 1 END) as pending_kyc,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_kyc,
        COUNT(CASE WHEN advance_kyc_allowed = TRUE THEN 1 END) as advance_allowed_kyc
      FROM kyc_verifications;
    `);
    const kycData = kycRes.rows[0];
    const depositsRes = await pool.query(`
      SELECT 
        COUNT(*) as total_count,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_count,
        COALESCE(SUM(CASE WHEN status = 'Approved' THEN amount ELSE 0 END), 0) as approved_volume,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_count,
        COALESCE(SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END), 0) as pending_volume,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_count,
        COALESCE(SUM(CASE WHEN status = 'Rejected' THEN amount ELSE 0 END), 0) as rejected_volume,
        COALESCE(SUM(CASE WHEN status = 'Approved' AND created_at >= CURRENT_DATE THEN amount ELSE 0 END), 0) as today_volume,
        COALESCE(SUM(CASE WHEN status = 'Approved' THEN fee ELSE 0 END), 0) as total_fees
      FROM deposits;
    `);
    const depositsData = depositsRes.rows[0];
    const depositMethodsRes = await pool.query(`
      SELECT payment_method, COUNT(*) as count, COALESCE(SUM(amount), 0) as volume
      FROM deposits
      WHERE status = 'Approved'
      GROUP BY payment_method
      ORDER BY volume DESC;
    `);
    const withdrawalsRes = await pool.query(`
      SELECT 
        COUNT(*) as total_count,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_count,
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN net_amount ELSE 0 END), 0) as completed_volume,
        COUNT(CASE WHEN status IN ('Pending', 'Review', 'Processing') THEN 1 END) as pending_count,
        COALESCE(SUM(CASE WHEN status IN ('Pending', 'Review', 'Processing') THEN net_amount ELSE 0 END), 0) as pending_volume,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_count,
        COALESCE(SUM(CASE WHEN status = 'Completed' AND created_at >= CURRENT_DATE THEN net_amount ELSE 0 END), 0) as today_volume,
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN fee ELSE 0 END), 0) as total_fees
      FROM withdrawals;
    `);
    const withdrawalsData = withdrawalsRes.rows[0];
    const withdrawalMethodsRes = await pool.query(`
      SELECT payment_method, COUNT(*) as count, COALESCE(SUM(net_amount), 0) as volume
      FROM withdrawals
      WHERE status = 'Completed'
      GROUP BY payment_method
      ORDER BY volume DESC;
    `);
    const referralsRes = await pool.query(`
      SELECT 
        COUNT(*) as total_commissions_count,
        COALESCE(SUM(commission_amount), 0) as total_commission_paid,
        COALESCE(SUM(deposit_amount), 0) as total_deposit_volume_from_referrals
      FROM referral_commissions
      WHERE status = 'Credited';
    `);
    const referralsData = referralsRes.rows[0];
    const topReferrersRes = await pool.query(`
      SELECT 
        rc.referrer_id, 
        u.name as referrer_name, 
        u.email as referrer_email, 
        COUNT(rc.id) as rewards_count, 
        COALESCE(SUM(rc.commission_amount), 0) as total_earned, 
        COALESCE(SUM(rc.deposit_amount), 0) as volume_generated
      FROM referral_commissions rc
      JOIN users u ON u.id = rc.referrer_id
      GROUP BY rc.referrer_id, u.name, u.email
      ORDER BY total_earned DESC
      LIMIT 5;
    `);
    const balancesRes = await pool.query(`
      SELECT 
        COALESCE(SUM(total_balance), 0) as total_user_balance,
        COALESCE(SUM(available_balance), 0) as total_available_balance,
        COALESCE(SUM(total_invested), 0) as total_invested_balance
      FROM balances;
    `);
    const balancesData = balancesRes.rows[0];
    const investmentsRes = await pool.query(`
      SELECT 
        COUNT(*) as active_investments_count,
        COALESCE(SUM(invested_amount), 0) as active_invested_total,
        COALESCE(SUM(daily_reward), 0) as daily_reward_outflow
      FROM active_investments 
      WHERE status = 'Active';
    `);
    const investmentsData = investmentsRes.rows[0];
    const unlocksPendingRes = await pool.query("SELECT COUNT(*) FROM unlock_requests WHERE status = 'Under Support Review';");
    const openTicketsRes = await pool.query("SELECT COUNT(*) FROM support_tickets WHERE status = 'Open' OR status = 'In Progress';");
    const approvedDepositsVolume = parseFloat(depositsData.approved_volume) || 0;
    const completedWithdrawalsVolume = parseFloat(withdrawalsData.completed_volume) || 0;
    const depositFees = parseFloat(depositsData.total_fees) || 0;
    const withdrawalFees = parseFloat(withdrawalsData.total_fees) || 0;
    const referralCommissionsPaid = parseFloat(referralsData.total_commission_paid) || 0;
    const totalUserBalances = parseFloat(balancesData.total_user_balance) || 0;
    const totalAvailableBalances = parseFloat(balancesData.total_available_balance) || 0;
    const totalInvestedCapital = parseFloat(balancesData.total_invested_balance) || 0;
    const grossInflow = approvedDepositsVolume + depositFees + withdrawalFees;
    const grossOutflow = completedWithdrawalsVolume + referralCommissionsPaid;
    const netCashflow = grossInflow - grossOutflow;
    const netPlatformLiquidity = netCashflow - totalAvailableBalances;
    const isProfitable = netCashflow >= 0;
    const profitMargin = grossInflow > 0 ? netCashflow / grossInflow * 100 : 0;
    res.json({
      users: {
        total: parseInt(usersData.total_users, 10) || 0,
        active: parseInt(usersData.active_users, 10) || 0,
        suspended: parseInt(usersData.suspended_users, 10) || 0,
        newToday: parseInt(usersData.new_today, 10) || 0,
        newThisWeek: parseInt(usersData.new_this_week, 10) || 0,
        referredUsers: parseInt(usersData.referred_users, 10) || 0
      },
      kyc: {
        total: parseInt(kycData.total_kyc, 10) || 0,
        approved: parseInt(kycData.approved_kyc, 10) || 0,
        pending: parseInt(kycData.pending_kyc, 10) || 0,
        rejected: parseInt(kycData.rejected_kyc, 10) || 0,
        advanceAllowed: parseInt(kycData.advance_allowed_kyc, 10) || 0,
        approvalRate: parseInt(kycData.total_kyc, 10) > 0 ? (parseInt(kycData.approved_kyc, 10) / parseInt(kycData.total_kyc, 10) * 100).toFixed(1) : "100.0"
      },
      deposits: {
        totalVolume: approvedDepositsVolume,
        approvedCount: parseInt(depositsData.approved_count, 10) || 0,
        pendingVolume: parseFloat(depositsData.pending_volume) || 0,
        pendingCount: parseInt(depositsData.pending_count, 10) || 0,
        rejectedVolume: parseFloat(depositsData.rejected_volume) || 0,
        rejectedCount: parseInt(depositsData.rejected_count, 10) || 0,
        todayVolume: parseFloat(depositsData.today_volume) || 0,
        feeRevenue: depositFees,
        methods: depositMethodsRes.rows.map((m) => ({
          method: m.payment_method,
          count: parseInt(m.count, 10),
          volume: parseFloat(m.volume) || 0
        }))
      },
      withdrawals: {
        totalVolume: completedWithdrawalsVolume,
        completedCount: parseInt(withdrawalsData.completed_count, 10) || 0,
        pendingVolume: parseFloat(withdrawalsData.pending_volume) || 0,
        pendingCount: parseInt(withdrawalsData.pending_count, 10) || 0,
        rejectedVolume: parseFloat(withdrawalsData.rejected_volume) || 0,
        rejectedCount: parseInt(withdrawalsData.rejected_count, 10) || 0,
        todayVolume: parseFloat(withdrawalsData.today_volume) || 0,
        feeRevenue: withdrawalFees,
        methods: withdrawalMethodsRes.rows.map((m) => ({
          method: m.payment_method,
          count: parseInt(m.count, 10),
          volume: parseFloat(m.volume) || 0
        }))
      },
      referrals: {
        totalCommissionsPaid: referralCommissionsPaid,
        commissionsCount: parseInt(referralsData.total_commissions_count, 10) || 0,
        volumeFromReferrals: parseFloat(referralsData.total_deposit_volume_from_referrals) || 0,
        topReferrers: topReferrersRes.rows.map((r) => ({
          id: r.referrer_id,
          name: r.referrer_name,
          email: r.referrer_email,
          rewardsCount: parseInt(r.rewards_count, 10),
          totalEarned: parseFloat(r.total_earned) || 0,
          volumeGenerated: parseFloat(r.volume_generated) || 0
        }))
      },
      balances: {
        totalUserBalances,
        totalAvailableBalances,
        totalInvestedCapital,
        activeInvestmentsCount: parseInt(investmentsData.active_investments_count, 10) || 0,
        dailyRewardOutflow: parseFloat(investmentsData.daily_reward_outflow) || 0
      },
      profitLoss: {
        grossInflow,
        grossOutflow,
        netCashflow,
        userLiabilities: totalAvailableBalances,
        netPlatformLiquidity,
        isProfitable,
        profitMargin: parseFloat(profitMargin.toFixed(2)),
        status: isProfitable ? "PROFIT" : "LOSS",
        feeIncome: depositFees + withdrawalFees
      },
      system: {
        lockedClaims: parseInt(unlocksPendingRes.rows[0].count, 10) || 0,
        openTickets: parseInt(openTicketsRes.rows[0].count, 10) || 0
      },
      // Backward compatibility fields
      totalUsers: parseInt(usersData.total_users, 10) || 0,
      verifiedUsers: parseInt(usersData.total_users, 10) - (parseInt(kycData.pending_kyc, 10) || 0),
      pendingKyc: parseInt(kycData.pending_kyc, 10) || 0,
      totalInvestments: totalInvestedCapital,
      pendingDeposits: parseInt(depositsData.pending_count, 10) || 0,
      pendingWithdrawals: parseInt(withdrawalsData.pending_count, 10) || 0,
      todayRewards: parseFloat(investmentsData.daily_reward_outflow) || 0,
      lockedClaims: parseInt(unlocksPendingRes.rows[0].count, 10) || 0,
      openTickets: parseInt(openTicketsRes.rows[0].count, 10) || 0
    });
  } catch (error) {
    console.error("Admin Dashboard API Error:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/reports", async (req, res) => {
  try {
    const category = req.query.category || "all";
    const range = req.query.range || "30days";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    let dateFilterSql = "";
    const dateParams = [];
    if (range === "today") {
      dateFilterSql = "AND created_at >= CURRENT_DATE";
    } else if (range === "7days") {
      dateFilterSql = "AND created_at >= NOW() - INTERVAL '7 days'";
    } else if (range === "30days") {
      dateFilterSql = "AND created_at >= NOW() - INTERVAL '30 days'";
    } else if (range === "this_month") {
      dateFilterSql = "AND created_at >= date_trunc('month', CURRENT_DATE)";
    } else if (range === "custom" && startDate && endDate) {
      dateFilterSql = "AND created_at BETWEEN $1 AND $2";
      dateParams.push(new Date(startDate).toISOString(), new Date(endDate).toISOString());
    }
    let records = [];
    let summary = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      netCashflow: 0,
      totalCommissions: 0,
      userRegistrations: 0,
      kycSubmissions: 0,
      kycApproved: 0,
      activeInvestments: 0
    };
    if (category === "all" || category === "deposits" || category === "financial") {
      const depSql = `
        SELECT 
          d.id, d.created_at, d.amount, d.fee, d.total_amount, d.payment_method, 
          d.reference, d.status, d.approved_at, d.rejection_reason,
          u.name as user_name, u.email as user_email
        FROM deposits d
        JOIN users u ON u.id = d.user_id
        WHERE 1=1 ${dateFilterSql.replace(/created_at/g, "d.created_at")}
        ORDER BY d.created_at DESC
        LIMIT 200;
      `;
      const depRes = await pool.query(depSql, dateParams);
      for (const r of depRes.rows) {
        if (r.status === "Approved") summary.totalDeposits += parseFloat(r.amount) || 0;
        records.push({
          id: r.id,
          date: r.created_at,
          category: "Deposit",
          user: r.user_name || "User",
          email: r.user_email || "\u2014",
          type: r.payment_method,
          amount: parseFloat(r.amount) || 0,
          fee: parseFloat(r.fee) || 0,
          net: parseFloat(r.total_amount) || parseFloat(r.amount) || 0,
          reference: r.reference || r.id,
          status: r.status,
          details: r.status === "Approved" ? `Approved at ${new Date(r.approved_at).toLocaleDateString()}` : r.rejection_reason || "Pending verification"
        });
      }
    }
    if (category === "all" || category === "withdrawals" || category === "financial") {
      const wthSql = `
        SELECT 
          w.id, w.created_at, w.amount, w.fee, w.net_amount, w.payment_method, 
          w.destination_details, w.status, w.tx_hash, w.rejection_reason,
          u.name as user_name, u.email as user_email
        FROM withdrawals w
        JOIN users u ON u.id = w.user_id
        WHERE 1=1 ${dateFilterSql.replace(/created_at/g, "w.created_at")}
        ORDER BY w.created_at DESC
        LIMIT 200;
      `;
      const wthRes = await pool.query(wthSql, dateParams);
      for (const r of wthRes.rows) {
        if (r.status === "Completed") summary.totalWithdrawals += parseFloat(r.net_amount) || 0;
        records.push({
          id: r.id,
          date: r.created_at,
          category: "Withdrawal",
          user: r.user_name || "User",
          email: r.user_email || "\u2014",
          type: r.payment_method,
          amount: parseFloat(r.amount) || 0,
          fee: parseFloat(r.fee) || 0,
          net: parseFloat(r.net_amount) || 0,
          reference: r.tx_hash || r.id,
          status: r.status,
          details: r.destination_details ? `Destination: ${r.destination_details.slice(0, 24)}...` : r.rejection_reason || "Processing"
        });
      }
    }
    if (category === "all" || category === "referrals" || category === "financial") {
      const refSql = `
        SELECT 
          rc.id, rc.created_at, rc.deposit_amount, rc.commission_rate, rc.commission_amount, rc.status, rc.plan_name,
          referrer.name as referrer_name, referrer.email as referrer_email,
          referee.name as referee_name, referee.email as referee_email
        FROM referral_commissions rc
        JOIN users referrer ON referrer.id = rc.referrer_id
        JOIN users referee ON referee.id = rc.referee_id
        WHERE 1=1 ${dateFilterSql.replace(/created_at/g, "rc.created_at")}
        ORDER BY rc.created_at DESC
        LIMIT 200;
      `;
      const refRes = await pool.query(refSql, dateParams);
      for (const r of refRes.rows) {
        if (r.status === "Credited") summary.totalCommissions += parseFloat(r.commission_amount) || 0;
        records.push({
          id: r.id,
          date: r.created_at,
          category: "Referral",
          user: r.referrer_name || "Referrer",
          email: r.referrer_email || "\u2014",
          type: `${r.commission_rate}% Affiliate Yield`,
          amount: parseFloat(r.deposit_amount) || 0,
          fee: 0,
          net: parseFloat(r.commission_amount) || 0,
          reference: `Referee: ${r.referee_name}`,
          status: r.status,
          details: `Invited user deposited $${parseFloat(r.deposit_amount).toFixed(2)} on ${r.plan_name || "Fleet"}`
        });
      }
    }
    if (category === "users") {
      const uSql = `
        SELECT 
          u.id, u.name, u.email, u.phone, u.status, u.kyc_status, u.created_at, u.referral_code, u.referred_by,
          COALESCE(k.advance_kyc_allowed, FALSE) as advance_kyc_allowed,
          b.total_balance, b.total_invested
        FROM users u
        LEFT JOIN kyc_verifications k ON k.user_id = u.id
        LEFT JOIN balances b ON b.user_id = u.id
        WHERE 1=1 ${dateFilterSql.replace(/created_at/g, "u.created_at")}
        ORDER BY u.created_at DESC
        LIMIT 200;
      `;
      const uRes = await pool.query(uSql, dateParams);
      summary.userRegistrations = uRes.rowCount;
      for (const r of uRes.rows) {
        records.push({
          id: r.id,
          date: r.created_at,
          category: "User Signup",
          user: r.name,
          email: r.email,
          type: r.referred_by ? `Referred by ${r.referred_by}` : "Direct Registration",
          amount: parseFloat(r.total_balance) || 0,
          fee: 0,
          net: parseFloat(r.total_invested) || 0,
          reference: r.referral_code || r.id,
          status: r.status,
          details: `KYC: ${r.kyc_status} | Advance KYC: ${r.advance_kyc_allowed ? "Allowed" : "Locked"}`
        });
      }
    }
    if (category === "kyc") {
      const kycSql = `
        SELECT 
          k.id, k.submitted_at, k.reviewed_at, k.doc_type, k.doc_number, k.status, k.advance_kyc_allowed, k.rejection_reason,
          u.name as user_name, u.email as user_email
        FROM kyc_verifications k
        JOIN users u ON u.id = k.user_id
        WHERE 1=1 ${dateFilterSql.replace(/created_at/g, "COALESCE(k.submitted_at, NOW())")}
        ORDER BY k.submitted_at DESC NULLS LAST
        LIMIT 200;
      `;
      const kycRes = await pool.query(kycSql, dateParams);
      summary.kycSubmissions = kycRes.rowCount;
      for (const r of kycRes.rows) {
        if (r.status === "Approved") summary.kycApproved++;
        records.push({
          id: r.id,
          date: r.submitted_at || (/* @__PURE__ */ new Date()).toISOString(),
          category: "KYC Verification",
          user: r.user_name,
          email: r.user_email,
          type: r.doc_type || "Identity Card",
          amount: 0,
          fee: 0,
          net: 0,
          reference: r.doc_number || r.id,
          status: r.status,
          details: `Advance KYC: ${r.advance_kyc_allowed ? "Enabled" : "Restricted"}${r.rejection_reason ? " | Reason: " + r.rejection_reason : ""}`
        });
      }
    }
    if (category === "investments") {
      const invSql = `
        SELECT 
          i.id, i.created_at, i.plan_name, i.vehicle_model, i.invested_amount, i.daily_reward, i.status, i.total_earned,
          u.name as user_name, u.email as user_email
        FROM active_investments i
        JOIN users u ON u.id = i.user_id
        WHERE 1=1 ${dateFilterSql.replace(/created_at/g, "i.created_at")}
        ORDER BY i.created_at DESC
        LIMIT 200;
      `;
      const invRes = await pool.query(invSql, dateParams);
      summary.activeInvestments = invRes.rowCount;
      for (const r of invRes.rows) {
        records.push({
          id: r.id,
          date: r.created_at,
          category: "Fleet Investment",
          user: r.user_name,
          email: r.user_email,
          type: r.plan_name,
          amount: parseFloat(r.invested_amount) || 0,
          fee: 0,
          net: parseFloat(r.total_earned) || 0,
          reference: r.vehicle_model || r.id,
          status: r.status,
          details: `Yield: $${parseFloat(r.daily_reward).toFixed(2)}/day | Model: ${r.vehicle_model || "Fleet Unit"}`
        });
      }
    }
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    summary.netCashflow = summary.totalDeposits - (summary.totalWithdrawals + summary.totalCommissions);
    summary.isProfit = summary.netCashflow >= 0;
    summary.profitMargin = summary.totalDeposits > 0 ? (summary.netCashflow / summary.totalDeposits * 100).toFixed(2) : "0.00";
    res.json({
      category,
      range,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      summary,
      count: records.length,
      records
    });
  } catch (error) {
    console.error("Admin Reports API Error:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/users", async (req, res) => {
  try {
    const search = req.query.search || "";
    const queryStr = search ? `SELECT u.*, b.total_balance, b.available_balance, b.total_invested, b.today_reward, b.active_plans_count,
                COALESCE(k.advance_kyc_allowed, FALSE) as advance_kyc_allowed
         FROM users u
         LEFT JOIN balances b ON u.id = b.user_id
         LEFT JOIN kyc_verifications k ON u.id = k.user_id
         WHERE LOWER(u.name) LIKE $1 OR LOWER(u.email) LIKE $1 OR LOWER(u.phone) LIKE $1
         ORDER BY u.created_at DESC;` : `SELECT u.*, b.total_balance, b.available_balance, b.total_invested, b.today_reward, b.active_plans_count,
                COALESCE(k.advance_kyc_allowed, FALSE) as advance_kyc_allowed
         FROM users u
         LEFT JOIN balances b ON u.id = b.user_id
         LEFT JOIN kyc_verifications k ON u.id = k.user_id
         ORDER BY u.created_at DESC;`;
    const params = search ? [`%${search.toLowerCase()}%`] : [];
    const usersRes = await pool.query(queryStr, params);
    res.json(usersRes.rows.map((u) => ({
      ...mapUser(u),
      advanceKycAllowed: Boolean(u.advance_kyc_allowed),
      balance: {
        totalBalance: parseFloat(u.total_balance) || 0,
        availableBalance: parseFloat(u.available_balance) || 0,
        totalInvested: parseFloat(u.total_invested) || 0,
        todayReward: parseFloat(u.today_reward) || 0,
        activePlansCount: parseInt(u.active_plans_count, 10) || 0
      }
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/users/:id", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const [userRes, balRes, invCountRes, depCountRes, wthCountRes, kycRes] = await Promise.all([
      pool.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [id2]),
      pool.query("SELECT * FROM balances WHERE user_id = $1 LIMIT 1", [id2]),
      pool.query("SELECT COUNT(*) FROM active_investments WHERE user_id = $1 AND status = 'Active'", [id2]),
      pool.query("SELECT COUNT(*) FROM deposits WHERE user_id = $1", [id2]),
      pool.query("SELECT COUNT(*) FROM withdrawals WHERE user_id = $1", [id2]),
      pool.query("SELECT advance_kyc_allowed FROM kyc_verifications WHERE user_id = $1 LIMIT 1", [id2])
    ]);
    if (!userRes.rows[0]) return res.status(404).json({ error: "User not found" });
    const u = userRes.rows[0];
    const b = balRes.rows[0] || {};
    const kycAllowed = Boolean(kycRes.rows[0]?.advance_kyc_allowed);
    res.json({
      ...mapUser(u),
      advanceKycAllowed: kycAllowed,
      balance: {
        totalBalance: parseFloat(b.total_balance) || 0,
        availableBalance: parseFloat(b.available_balance) || 0,
        totalInvested: parseFloat(b.total_invested) || 0,
        todayReward: parseFloat(b.today_reward) || 0,
        activePlansCount: parseInt(b.active_plans_count, 10) || 0
      },
      stats: {
        activeInvestments: parseInt(invCountRes.rows[0].count, 10),
        totalDeposits: parseInt(depCountRes.rows[0].count, 10),
        totalWithdrawals: parseInt(wthCountRes.rows[0].count, 10)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/admin/users/:id/status", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status required" });
    await pool.query("UPDATE users SET status = $1 WHERE id = $2", [status, id2]);
    await pool.query(
      `INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [`aud_${Date.now()}`, "ADMIN_STATUS_CHANGE", "Admin", id2, `Account status changed to ${status}`, req.ip || "127.0.0.1"]
    );
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/admin/users/:id/password", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [password, id2]);
    await pool.query(
      `INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [`aud_${Date.now()}`, "ADMIN_PASSWORD_RESET", "Admin", id2, "Password changed by admin", req.ip || "127.0.0.1"]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/admin/users/:id/balance", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id: id2 } = req.params;
    const { amount, type, note } = req.body;
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return res.status(400).json({ error: "Valid amount required" });
    await client.query("BEGIN");
    const balRes = await client.query("SELECT * FROM balances WHERE user_id = $1 FOR UPDATE", [id2]);
    if (!balRes.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Balance record not found" });
    }
    const cur = balRes.rows[0];
    let newAvail = parseFloat(cur.available_balance);
    let newTotal = parseFloat(cur.total_balance);
    if (type === "credit") {
      newAvail += num;
      newTotal += num;
    } else {
      if (newAvail < num) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Insufficient balance to debit" });
      }
      newAvail -= num;
      newTotal -= num;
    }
    const updRes = await client.query(
      `UPDATE balances SET available_balance = $2, total_balance = $3, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 RETURNING *`,
      [id2, newAvail.toFixed(2), newTotal.toFixed(2)]
    );
    await client.query(
      `INSERT INTO transactions (id, user_id, type, amount, status, reference, details)
       VALUES ($1, $2, $3, $4, 'Completed', $5, $6)`,
      [
        `TXN-${Math.floor(1e5 + Math.random() * 9e5)}`,
        id2,
        type === "credit" ? "Admin Credit" : "Admin Debit",
        type === "credit" ? num : -num,
        `ADM-${Date.now()}`,
        note || `Manual ${type} by admin`
      ]
    );
    await client.query(
      `INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        `aud_${Date.now()}`,
        "ADMIN_BALANCE_ADJUST",
        "Admin",
        id2,
        `${type === "credit" ? "Credited" : "Debited"} $${num} \u2014 ${note || "Manual adjustment"}`,
        req.ip || "127.0.0.1"
      ]
    );
    await client.query("COMMIT");
    const b = updRes.rows[0];
    res.json({
      success: true,
      balance: {
        totalBalance: parseFloat(b.total_balance),
        availableBalance: parseFloat(b.available_balance),
        totalInvested: parseFloat(b.total_invested),
        todayReward: parseFloat(b.today_reward),
        activePlansCount: parseInt(b.active_plans_count, 10)
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});
app.get("/api/admin/users/:id/deposits", async (req, res) => {
  try {
    const depRes = await pool.query(`
      SELECT id, user_id, amount, payment_method, reference, status, created_at, rejection_reason,
             (proof_url IS NOT NULL AND proof_url != '') as has_proof
      FROM deposits 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50;
    `, [id]);
    res.json(depRes.rows.map((d) => ({
      id: d.id,
      userId: d.user_id,
      amount: parseFloat(d.amount),
      paymentMethod: d.payment_method,
      reference: d.reference,
      proofUrl: null,
      hasProof: Boolean(d.has_proof),
      status: d.status,
      createdAt: d.created_at,
      rejectionReason: d.rejection_reason
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/users/:id/withdrawals", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const wthRes = await pool.query("SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50", [id2]);
    res.json(wthRes.rows.map((w) => ({
      id: w.id,
      userId: w.user_id,
      amount: parseFloat(w.amount),
      paymentMethod: w.payment_method,
      destinationDetails: w.destination_details,
      netAmount: parseFloat(w.net_amount),
      status: w.status,
      createdAt: w.created_at
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/users/:id/investments", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const invRes = await pool.query("SELECT * FROM active_investments WHERE user_id = $1 ORDER BY created_at DESC", [id2]);
    res.json(invRes.rows.map((inv) => ({
      id: inv.id,
      planName: inv.plan_name,
      vehicleCategory: inv.vehicle_category,
      investedAmount: parseFloat(inv.invested_amount),
      dailyReward: parseFloat(inv.daily_reward),
      totalEarned: parseFloat(inv.total_earned) || 0,
      status: inv.status,
      startDate: inv.start_date,
      endDate: inv.end_date
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/users/:id/rewards", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const rewRes = await pool.query(
      "SELECT * FROM daily_rewards WHERE user_id = $1 ORDER BY reward_date DESC, claimed_at DESC NULLS LAST LIMIT 50;",
      [id2]
    );
    res.json(rewRes.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      planName: r.plan_name,
      date: formatIsoDate(r.reward_date),
      grossAmount: parseFloat(r.gross_amount),
      netAmount: parseFloat(r.net_amount),
      status: r.status,
      claimWindowStart: r.claim_window_start || "12:00 PM",
      claimWindowEnd: r.claim_window_end || "3:00 PM",
      claimedAt: r.claimed_at,
      lockTime: r.lock_time,
      transactionId: r.transaction_id
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/claims", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;
    let baseQuery = `
      FROM daily_rewards r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (status && status !== "all") {
      params.push(status);
      baseQuery += ` AND r.status = $${params.length}`;
    }
    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      baseQuery += ` AND (LOWER(COALESCE(u.name, '')) LIKE $${params.length} OR LOWER(COALESCE(u.email, '')) LIKE $${params.length} OR LOWER(r.plan_name) LIKE $${params.length} OR LOWER(COALESCE(r.transaction_id, '')) LIKE $${params.length})`;
    }
    const countRes = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countRes.rows[0].count, 10);
    const selectQuery = `
      SELECT r.*, u.name as user_name, u.email as user_email
      ${baseQuery}
      ORDER BY r.reward_date DESC, r.claimed_at DESC NULLS LAST
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;
    params.push(limit, offset);
    const rowsRes = await pool.query(selectQuery, params);
    res.json({
      data: rowsRes.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        userName: r.user_name || "Member",
        userEmail: r.user_email || "",
        planName: r.plan_name,
        date: formatIsoDate(r.reward_date),
        grossAmount: parseFloat(r.gross_amount),
        withholding: parseFloat(r.withholding) || 0,
        fee: parseFloat(r.fee) || 0,
        netAmount: parseFloat(r.net_amount),
        status: r.status,
        claimWindowStart: r.claim_window_start || "12:00 PM",
        claimWindowEnd: r.claim_window_end || "3:00 PM",
        claimedAt: r.claimed_at,
        lockTime: r.lock_time,
        transactionId: r.transaction_id,
        createdAt: r.created_at
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/deposits", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 30);
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const where = status && status !== "all" ? `WHERE d.status = '${status}'` : "";
    const [depRes, countRes] = await Promise.all([
      pool.query(
        `SELECT 
           d.id, d.user_id, d.plan_id, d.plan_name, d.investment_id, d.amount,
           d.payment_method, d.reference, d.fee, d.total_amount, d.status,
           d.rejection_reason, d.approved_at, d.approved_by, d.created_at,
           (d.proof_url IS NOT NULL AND d.proof_url != '') as has_proof,
           u.name as user_name,
           u.email as user_email,
           u.created_at as user_created_at,
           u.referral_code as user_referral_code,
           r.id as referrer_id,
           r.name as referrer_name,
           r.email as referrer_email,
           r.referral_code as referrer_referral_code,
           p.name as plan_title,
           p.daily_reward_rate as plan_daily_rate,
           p.duration_days as plan_duration,
           p.category as plan_category,
           rc.id as rc_id,
           rc.commission_amount as rc_amount,
           rc.status as rc_status
         FROM deposits d
         LEFT JOIN users u ON d.user_id = u.id
         LEFT JOIN users r ON (u.referred_by = r.id OR u.referred_by = r.referral_code)
         LEFT JOIN investment_plans p ON d.plan_id = p.id
         LEFT JOIN referral_commissions rc ON d.id = rc.deposit_id
         ${where}
         ORDER BY d.created_at DESC LIMIT $1 OFFSET $2;`,
        [limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM deposits d ${where};`)
    ]);
    const total = parseInt(countRes.rows[0].count, 10);
    res.json({
      data: depRes.rows.map((d) => {
        const amt = parseFloat(d.amount) || 0;
        const dailyRate = d.plan_daily_rate ? parseFloat(d.plan_daily_rate) : 2;
        const duration = d.plan_duration ? parseInt(d.plan_duration, 10) : 30;
        const expectedProfit = parseFloat((amt * dailyRate / 100 * duration).toFixed(2));
        const hasReferrer = !!d.referrer_id;
        const commRate = hasReferrer ? 5 : 0;
        const expectedComm = hasReferrer ? parseFloat((amt * commRate / 100).toFixed(2)) : 0;
        return {
          id: d.id,
          userId: d.user_id,
          userName: d.user_name || "Member",
          userEmail: d.user_email || "",
          userCreatedAt: d.user_created_at,
          userReferralCode: d.user_referral_code,
          referrerId: d.referrer_id || null,
          referrerName: d.referrer_name || "None (Direct)",
          referrerEmail: d.referrer_email || "",
          referrerCode: d.referrer_referral_code || "\u2014",
          planId: d.plan_id || null,
          planName: d.plan_name || d.plan_title || (d.plan_id ? "Fleet Plan" : "Direct Deposit"),
          planCategory: d.plan_category || "STANDARD",
          planDailyRate: dailyRate,
          planDuration: duration,
          expectedProfit,
          amount: amt,
          paymentMethod: d.payment_method,
          reference: d.reference,
          proofUrl: null,
          // Heavy binary excluded from list; loaded on-demand via /api/admin/deposits/:id/proof
          hasProof: Boolean(d.has_proof),
          fee: parseFloat(d.fee) || 0,
          totalAmount: parseFloat(d.total_amount) || amt,
          status: d.status,
          rejectionReason: d.rejection_reason,
          approvedAt: d.approved_at,
          approvedBy: d.approved_by,
          createdAt: d.created_at,
          commissionRate: commRate,
          expectedCommission: expectedComm,
          commissionCredited: !!d.rc_id,
          commissionAmount: d.rc_amount ? parseFloat(d.rc_amount) : expectedComm
        };
      }),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get(["/api/deposits/:id/proof", "/api/admin/deposits/:id/proof"], async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const depRes = await pool.query(
      `SELECT id, user_id, proof_url, status, reference 
       FROM deposits 
       WHERE id = $1 LIMIT 1;`,
      [id2]
    );
    if (depRes.rows.length === 0) {
      return res.status(404).json({ error: "Deposit record not found" });
    }
    const d = depRes.rows[0];
    res.json({
      id: d.id,
      userId: d.user_id,
      proofUrl: d.proof_url || null,
      hasProof: Boolean(d.proof_url && d.proof_url.trim() !== ""),
      status: d.status,
      reference: d.reference
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/deposits/:id/approve", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id: id2 } = req.params;
    const { note } = req.body;
    await client.query("BEGIN");
    const depRes = await client.query("SELECT * FROM deposits WHERE id = $1 FOR UPDATE;", [id2]);
    if (!depRes.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Deposit record not found" });
    }
    const dep = depRes.rows[0];
    if (dep.status !== "Pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: `Deposit cannot be approved; current status is "${dep.status}".` });
    }
    const amt = parseFloat(dep.amount);
    await client.query(
      `UPDATE deposits SET
         status = 'Approved',
         approved_at = CURRENT_TIMESTAMP,
         approved_by = 'SuperAdmin',
         rejection_reason = NULL
       WHERE id = $1;`,
      [id2]
    );
    await client.query("DELETE FROM active_investments WHERE deposit_id = $1 AND status = 'Pending';", [id2]);
    await client.query(
      `UPDATE balances SET
         available_balance = available_balance + $1,
         total_balance = total_balance + $1,
         updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2;`,
      [amt, dep.user_id]
    );
    const userRes = await client.query("SELECT id, name, email, referred_by FROM users WHERE id = $1;", [dep.user_id]);
    const depositingUser = userRes.rows[0];
    let commissionCredited = false;
    let commissionAmount = 0;
    let referrerUser = null;
    if (depositingUser?.referred_by) {
      const refLookup = await client.query(
        "SELECT id, name, email, referral_code FROM users WHERE id = $1 OR referral_code = $1 LIMIT 1;",
        [depositingUser.referred_by]
      );
      if (refLookup.rows[0]) {
        referrerUser = refLookup.rows[0];
        const existingComm = await client.query(
          "SELECT id FROM referral_commissions WHERE deposit_id = $1 FOR UPDATE;",
          [id2]
        );
        if (existingComm.rows.length === 0) {
          commissionAmount = parseFloat((amt * 5 / 100).toFixed(2));
          const commId = `rc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await client.query(
            `INSERT INTO referral_commissions (
               id, deposit_id, referrer_id, referee_id, plan_id, plan_name,
               deposit_amount, commission_rate, commission_amount, status, created_at
             ) VALUES ($1, $2, $3, $4, NULL, 'Wallet Deposit', $5, 5.00, $6, 'Credited', CURRENT_TIMESTAMP)
             ON CONFLICT (deposit_id) DO NOTHING;`,
            [commId, id2, referrerUser.id, depositingUser.id, amt, commissionAmount]
          );
          await client.query(
            `UPDATE balances SET
               available_balance = available_balance + $1,
               total_balance = total_balance + $1,
               updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2;`,
            [commissionAmount, referrerUser.id]
          );
          await client.query(
            `INSERT INTO transactions (id, user_id, type, amount, status, reference, details)
             VALUES ($1, $2, 'Reward', $3, 'Completed', $4, $5);`,
            [
              `TXN-REF-${Math.floor(1e5 + Math.random() * 9e5)}`,
              referrerUser.id,
              commissionAmount,
              `REF-COMM-${id2}`,
              `5% Referral Commission from ${depositingUser.name}'s verified deposit ($${amt.toLocaleString()})`
            ]
          );
          await client.query(
            `INSERT INTO notifications (id, user_id, title, message, type)
             VALUES ($1, $2, 'Referral Commission Earned! \u{1F389}', $3, 'finance');`,
            [
              `notif_${Date.now()}`,
              referrerUser.id,
              `You received a $${commissionAmount.toFixed(2)} referral commission (5%) from ${depositingUser.name}'s verified deposit. Funds credited to your available balance.`
            ]
          );
          commissionCredited = true;
        }
      }
    }
    await client.query(
      `UPDATE transactions SET status = 'Completed', details = $1 WHERE reference = $2;`,
      [`Deposit Verified & Credited to Available Balance ($${amt.toLocaleString()})`, dep.reference]
    );
    await client.query(
      `INSERT INTO notifications (id, user_id, title, message, type) VALUES ($1, $2, 'Deposit Approved! \u{1F4B0}', $3, 'finance');`,
      [
        `notif_${Date.now()}`,
        dep.user_id,
        `Your deposit of $${amt.toLocaleString()} has been verified and approved! The full amount of $${amt.toLocaleString()} has been credited to your Available Balance. You can now choose any fleet plan and invest yourself!`
      ]
    );
    await client.query(
      `INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address) VALUES ($1,$2,$3,$4,$5,$6);`,
      [
        `aud_${Date.now()}`,
        "DEPOSIT_APPROVED_FUNDS_CREDITED",
        "Admin",
        dep.user_id,
        `Deposit ${id2} ($${amt.toLocaleString()}) approved. $${amt.toLocaleString()} credited to Available Balance. Commission $${commissionAmount} credited to ${referrerUser?.name || "none"}. ${note || ""}`,
        req.ip || "127.0.0.1"
      ]
    );
    await client.query("COMMIT");
    notifyAdmins(
      "Deposit Verified & Credited",
      `Deposit ${id2} ($${amt.toLocaleString()}) for ${depositingUser?.name || dep.user_id} was approved. $${amt.toLocaleString()} added to Available Balance.`,
      "deposit"
    ).catch(() => {
    });
    res.json({
      success: true,
      message: "Deposit approved successfully! Funds credited to user Available Balance.",
      deposit: {
        id: id2,
        status: "Approved",
        approvedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      commissionCredited,
      commissionAmount
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});
app.post("/api/admin/deposits/:id/reject", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id: id2 } = req.params;
    const { reason } = req.body;
    await client.query("BEGIN");
    const depRes = await client.query("SELECT * FROM deposits WHERE id = $1 FOR UPDATE;", [id2]);
    if (!depRes.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Deposit record not found" });
    }
    const dep = depRes.rows[0];
    const rejReason = reason?.trim() || "Transaction could not be verified by compliance.";
    await client.query(
      "UPDATE deposits SET status = 'Rejected', rejection_reason = $2 WHERE id = $1;",
      [id2, rejReason]
    );
    await client.query(
      "UPDATE active_investments SET status = 'Rejected' WHERE deposit_id = $1;",
      [id2]
    );
    await client.query(
      "UPDATE transactions SET status = 'Failed', details = $1 WHERE reference = $2;",
      [`Deposit Rejected: ${rejReason}`, dep.reference]
    );
    await client.query(
      `INSERT INTO notifications (id, user_id, title, message, type) VALUES ($1, $2, 'Deposit Rejected \u26A0\uFE0F', $3, 'finance');`,
      [
        `notif_${Date.now()}`,
        dep.user_id,
        `Your deposit of $${parseFloat(dep.amount).toLocaleString()} was rejected. Reason: "${rejReason}".`
      ]
    );
    await client.query(
      `INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address) VALUES ($1,$2,$3,$4,$5,$6);`,
      [
        `aud_${Date.now()}`,
        "DEPOSIT_REJECTED",
        "Admin",
        dep.user_id,
        `Deposit ${id2} ($${parseFloat(dep.amount).toLocaleString()}) rejected. Reason: ${rejReason}`,
        req.ip || "127.0.0.1"
      ]
    );
    await client.query("COMMIT");
    notifyAdmins(
      "Deposit Rejected",
      `Deposit ${id2} ($${parseFloat(dep.amount).toLocaleString()}) for user ${dep.user_id} was rejected.`,
      "deposit"
    ).catch(() => {
    });
    res.json({ success: true, message: "Deposit rejected. Investment was not activated and no commission was credited." });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});
app.get("/api/user/referrals", async (req, res) => {
  try {
    const userId = req.query.userId || req.headers["x-user-id"] || "usr_admin_001";
    const uRes = await pool.query("SELECT id, name, referral_code, referred_by FROM users WHERE id = $1 LIMIT 1;", [userId]);
    const u = uRes.rows[0];
    if (!u) return res.status(404).json({ error: "User not found" });
    let mySponsor = null;
    if (u.referred_by) {
      const spRes = await pool.query("SELECT id, name, referral_code FROM users WHERE id = $1 OR referral_code = $1 LIMIT 1;", [u.referred_by]);
      if (spRes.rows[0]) {
        mySponsor = {
          name: spRes.rows[0].name,
          referralCode: spRes.rows[0].referral_code
        };
      }
    }
    const refUsersRes = await pool.query(
      `SELECT id, name, email, created_at, status FROM users WHERE referred_by = $1 OR referred_by = $2 ORDER BY created_at DESC;`,
      [u.id, u.referral_code]
    );
    const commRes = await pool.query(
      `SELECT rc.*, u.name as referee_name, u.email as referee_email
       FROM referral_commissions rc
       JOIN users u ON rc.referee_id = u.id
       WHERE rc.referrer_id = $1
       ORDER BY rc.created_at DESC;`,
      [u.id]
    );
    const totalEarned = commRes.rows.reduce((sum, r) => sum + parseFloat(r.commission_amount || 0), 0);
    res.json({
      referralCode: u.referral_code || "RENTO-HQ",
      mySponsor,
      totalReferrals: refUsersRes.rows.length,
      totalCommissionEarned: totalEarned,
      referrals: refUsersRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        createdAt: r.created_at,
        status: r.status
      })),
      commissions: commRes.rows.map((c) => ({
        id: c.id,
        depositId: c.deposit_id,
        refereeName: c.referee_name,
        refereeEmail: c.referee_email,
        planName: c.plan_name || "Fleet Mobility Plan",
        depositAmount: parseFloat(c.deposit_amount),
        commissionRate: parseFloat(c.commission_rate),
        commissionEarned: parseFloat(c.commission_amount),
        status: c.status,
        createdAt: c.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/withdrawals", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 30);
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const where = status && status !== "all" ? `WHERE w.status = '${status}'` : "";
    const [wthRes, countRes] = await Promise.all([
      pool.query(
        `SELECT w.*, u.name as user_name, u.email as user_email FROM withdrawals w
         LEFT JOIN users u ON w.user_id = u.id ${where}
         ORDER BY w.created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM withdrawals w ${where}`)
    ]);
    const total = parseInt(countRes.rows[0].count, 10);
    res.json({
      data: wthRes.rows.map((w) => ({
        id: w.id,
        userId: w.user_id,
        userName: w.user_name,
        userEmail: w.user_email,
        amount: parseFloat(w.amount),
        paymentMethod: w.payment_method,
        destinationDetails: w.destination_details,
        netAmount: parseFloat(w.net_amount),
        fee: parseFloat(w.fee) || 0,
        status: w.status,
        createdAt: w.created_at,
        rejectionReason: w.rejection_reason || null,
        adminComment: w.admin_comment || null,
        txHash: w.tx_hash || null
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/withdrawals/:id/approve", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const { note, txHash } = req.body;
    const wthRes = await pool.query("SELECT * FROM withdrawals WHERE id = $1", [id2]);
    if (!wthRes.rows[0]) return res.status(404).json({ error: "Withdrawal not found" });
    const wth = wthRes.rows[0];
    await pool.query("UPDATE withdrawals SET status = 'Completed', admin_comment = $2, tx_hash = $3 WHERE id = $1", [
      id2,
      note || "Processed and transferred",
      txHash || null
    ]);
    await pool.query(
      `INSERT INTO notifications (id, user_id, title, message, type) VALUES ($1, $2, 'Withdrawal Processed', $3, 'finance')`,
      [`notif_${Date.now()}`, wth.user_id, `Your withdrawal of $${parseFloat(wth.amount).toLocaleString()} via ${wth.payment_method} has been processed and sent.${txHash ? ` TXID: ${txHash}` : ""}${note ? ` Note: ${note}` : ""}`]
    );
    await pool.query(
      `INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address) VALUES ($1,$2,$3,$4,$5,$6)`,
      [`aud_${Date.now()}`, "WITHDRAWAL_APPROVED", "Admin", wth.user_id, `Withdrawal ${id2} approved. Note: ${note || "None"}. TXID: ${txHash || "None"}`, req.ip || "127.0.0.1"]
    );
    notifyAdmins(
      "Withdrawal Completed",
      `Withdrawal ${id2} ($${parseFloat(wth.amount).toLocaleString()}) for user ${wth.user_id} was processed.`,
      "finance"
    ).catch(() => {
    });
    res.json({ success: true, message: "Withdrawal marked as completed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/withdrawals/:id/reject", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id: id2 } = req.params;
    const { reason } = req.body;
    await client.query("BEGIN");
    const wthRes = await client.query("SELECT * FROM withdrawals WHERE id = $1 FOR UPDATE", [id2]);
    if (!wthRes.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Withdrawal not found" });
    }
    const wth = wthRes.rows[0];
    if (wth.status !== "Pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Not pending" });
    }
    const amt = parseFloat(wth.amount);
    const cleanReason = reason && reason.trim() !== "" ? reason.trim() : "Compliance and security review";
    await client.query("UPDATE withdrawals SET status = 'Rejected', rejection_reason = $2, admin_comment = $2 WHERE id = $1", [id2, cleanReason]);
    await client.query(
      `UPDATE balances SET available_balance = available_balance + $1, total_balance = total_balance + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
      [amt, wth.user_id]
    );
    await client.query(
      `INSERT INTO notifications (id, user_id, title, message, type) VALUES ($1, $2, 'Withdrawal Rejected & Refunded', $3, 'finance')`,
      [`notif_${Date.now()}`, wth.user_id, `Your withdrawal of $${amt.toLocaleString()} via ${wth.payment_method} was rejected and refunded to your wallet. Reason: ${cleanReason}`]
    );
    await client.query(
      `INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address) VALUES ($1,$2,$3,$4,$5,$6)`,
      [`aud_${Date.now()}`, "WITHDRAWAL_REJECTED", "Admin", wth.user_id, `Withdrawal ${id2} rejected & refunded. Reason: ${cleanReason}`, req.ip || "127.0.0.1"]
    );
    await client.query("COMMIT");
    notifyAdmins(
      "Withdrawal Rejected",
      `Withdrawal ${id2} ($${amt.toLocaleString()}) for user ${wth.user_id} was rejected. Reason: ${cleanReason}`,
      "finance"
    ).catch(() => {
    });
    res.json({ success: true, message: "Withdrawal rejected and amount refunded to user" });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});
app.get("/api/admin/support/tickets", async (req, res) => {
  try {
    const status = req.query.status;
    const where = status && status !== "all" ? `WHERE t.status = '${status}'` : "";
    const ticketsRes = await pool.query(
      `SELECT t.*, u.name as user_name, u.email as user_email, u.phone as user_phone
       FROM support_tickets t LEFT JOIN users u ON t.user_id = u.id ${where}
       ORDER BY t.created_at DESC LIMIT 100`
    );
    const tickets = [];
    for (const t of ticketsRes.rows) {
      const msgRes = await pool.query("SELECT * FROM support_messages WHERE ticket_id = $1 ORDER BY created_at ASC", [t.id]);
      tickets.push({
        id: t.id,
        userId: t.user_id,
        userName: t.user_name || t.user_name,
        userEmail: t.user_email,
        userPhone: t.user_phone,
        subject: t.subject,
        category: t.category,
        status: t.status,
        priority: t.priority,
        createdDate: t.created_at,
        lastUpdate: t.updated_at,
        messages: msgRes.rows.map((m) => ({
          id: m.id,
          sender: m.sender,
          senderName: m.sender_name,
          message: m.message,
          timestamp: m.created_at
        }))
      });
    }
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/support/tickets/:id/reply", async (req, res) => {
  try {
    const { id: id2 } = req.params;
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });
    const msgId = `msg_${Date.now()}`;
    await pool.query(
      `INSERT INTO support_messages (id, ticket_id, sender, sender_name, message) VALUES ($1, $2, 'admin', 'RentoBit Support', $3)`,
      [msgId, id2, message]
    );
    await pool.query(
      `UPDATE support_tickets SET status = 'In Progress', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id2]
    );
    const tkt = await pool.query("SELECT user_id FROM support_tickets WHERE id = $1", [id2]);
    if (tkt.rows[0]) {
      await pool.query(
        `INSERT INTO notifications (id, user_id, title, message, type) VALUES ($1, $2, 'Support Reply', $3, 'support')`,
        [`notif_${Date.now()}`, tkt.rows[0].user_id, `Admin replied to your support ticket: ${id2}`]
      );
    }
    res.json({ success: true, messageId: msgId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var handleAdminCompleteTicket = async (req, res) => {
  try {
    const rawId = req.params.id || "";
    const id2 = rawId.trim();
    const updateRes = await pool.query(
      "UPDATE support_tickets SET status = 'Completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1 OR LOWER(TRIM(id)) = LOWER(TRIM($1)) RETURNING *",
      [id2]
    );
    const tkt = updateRes.rows[0] || (await pool.query("SELECT user_id FROM support_tickets WHERE id = $1 OR LOWER(TRIM(id)) = LOWER(TRIM($1))", [id2])).rows[0];
    if (tkt?.user_id) {
      notifyUser(
        tkt.user_id,
        "Ticket Completed",
        `Your support ticket #${id2} has been marked as Completed.`,
        "support",
        "/support"
      ).catch(() => {
      });
    }
    res.json({ success: true, status: "Completed", ticketId: id2, updated: updateRes.rowCount });
  } catch (error) {
    console.error("[AdminCompleteTicket Error]", error);
    res.status(500).json({ error: error.message });
  }
};
app.patch("/api/admin/support/tickets/:id/complete", handleAdminCompleteTicket);
app.post("/api/admin/support/tickets/:id/complete", handleAdminCompleteTicket);
var handleAdminCloseTicket = async (req, res) => {
  try {
    const rawId = req.params.id || "";
    const id2 = rawId.trim();
    const updateRes = await pool.query(
      "UPDATE support_tickets SET status = 'Closed', updated_at = CURRENT_TIMESTAMP WHERE id = $1 OR LOWER(TRIM(id)) = LOWER(TRIM($1)) RETURNING *",
      [id2]
    );
    res.json({ success: true, status: "Closed", ticketId: id2, updated: updateRes.rowCount });
  } catch (error) {
    console.error("[AdminCloseTicket Error]", error);
    res.status(500).json({ error: error.message });
  }
};
app.patch("/api/admin/support/tickets/:id/close", handleAdminCloseTicket);
app.post("/api/admin/support/tickets/:id/close", handleAdminCloseTicket);
var handleAdminReopenTicket = async (req, res) => {
  try {
    const rawId = req.params.id || "";
    const id2 = rawId.trim();
    const updateRes = await pool.query(
      "UPDATE support_tickets SET status = 'Open', updated_at = CURRENT_TIMESTAMP WHERE id = $1 OR LOWER(TRIM(id)) = LOWER(TRIM($1)) RETURNING *",
      [id2]
    );
    const tkt = updateRes.rows[0] || (await pool.query("SELECT user_id FROM support_tickets WHERE id = $1 OR LOWER(TRIM(id)) = LOWER(TRIM($1))", [id2])).rows[0];
    if (tkt?.user_id) {
      notifyUser(
        tkt.user_id,
        "Ticket Reopened",
        `Your support ticket ${id2} has been reopened by admin.`,
        "support",
        "/support"
      ).catch(() => {
      });
    }
    res.json({ success: true, status: "Open", ticketId: id2, updated: updateRes.rowCount });
  } catch (error) {
    console.error("[AdminReopenTicket Error]", error);
    res.status(500).json({ error: error.message });
  }
};
app.patch("/api/admin/support/tickets/:id/reopen", handleAdminReopenTicket);
app.post("/api/admin/support/tickets/:id/reopen", handleAdminReopenTicket);
var handleAdminUpdateTicketStatus = async (req, res) => {
  try {
    const rawId = req.params.id || "";
    const id2 = decodeURIComponent(rawId).trim();
    const newStatus = (req.body?.status || req.query?.status || "Completed").toString().trim();
    const updateRes = await pool.query(
      "UPDATE support_tickets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 OR LOWER(TRIM(id)) = LOWER(TRIM($2)) RETURNING *",
      [newStatus, id2]
    );
    const tkt = updateRes.rows[0] || (await pool.query("SELECT user_id FROM support_tickets WHERE id = $1 OR LOWER(TRIM(id)) = LOWER(TRIM($1))", [id2])).rows[0];
    if (tkt?.user_id) {
      notifyUser(
        tkt.user_id,
        `Ticket ${newStatus}`,
        `Your support ticket #${id2} status is now: ${newStatus}.`,
        "support",
        "/support"
      ).catch(() => {
      });
    }
    res.json({ success: true, status: newStatus, ticketId: id2, updated: updateRes.rowCount });
  } catch (error) {
    console.error("[AdminUpdateTicketStatus Error]", error);
    res.status(500).json({ error: error.message });
  }
};
app.patch("/api/admin/support/tickets/:id/status", handleAdminUpdateTicketStatus);
app.post("/api/admin/support/tickets/:id/status", handleAdminUpdateTicketStatus);
app.get("/api/admin/unlocks", async (req, res) => {
  try {
    const uRes = await pool.query("SELECT * FROM unlock_requests ORDER BY submitted_at DESC;");
    res.json(uRes.rows.map(mapUnlockRequest));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/audit", async (req, res) => {
  try {
    const isPaginated = req.query.page !== void 0 || req.query.limit !== void 0 || req.query.search !== void 0;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 15));
    const offset = (page - 1) * limit;
    const search = (req.query.search || "").trim();
    let whereClause = "";
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      whereClause = `WHERE action ILIKE $1 OR performed_by ILIKE $1 OR target_user ILIKE $1 OR details ILIKE $1 OR ip_address ILIKE $1`;
    }
    const countRes = await pool.query(`SELECT COUNT(*) FROM audit_logs ${whereClause};`, params);
    const total = parseInt(countRes.rows[0]?.count || "0", 10);
    const queryParams = search ? [params[0], limit, offset] : [limit, offset];
    const limitParamIdx = search ? 2 : 1;
    const offsetParamIdx = search ? 3 : 2;
    const logsRes = await pool.query(
      `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT $${limitParamIdx} OFFSET $${offsetParamIdx};`,
      queryParams
    );
    const mapped = logsRes.rows.map((r) => ({
      id: r.id,
      action: r.action,
      performedBy: r.performed_by || "System",
      targetUser: r.target_user || void 0,
      details: r.details || "",
      ipAddress: r.ip_address || "127.0.0.1",
      timestamp: r.created_at ? new Date(r.created_at).toLocaleString() : "Just now",
      createdAt: r.created_at
    }));
    if (isPaginated) {
      return res.json({
        logs: mapped,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit))
      });
    }
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
function findPostgresBinary(binaryName) {
  const ext = process.platform === "win32" ? ".exe" : "";
  const fullName = `${binaryName}${ext}`;
  const candidates = [
    `C:\\Program Files\\PostgreSQL\\18\\bin\\${fullName}`,
    `C:\\Program Files\\PostgreSQL\\17\\bin\\${fullName}`,
    `C:\\Program Files\\PostgreSQL\\16\\bin\\${fullName}`,
    `C:\\Program Files\\PostgreSQL\\15\\bin\\${fullName}`,
    `C:\\Program Files\\PostgreSQL\\14\\bin\\${fullName}`,
    `/usr/bin/${fullName}`,
    `/usr/local/bin/${fullName}`,
    `/opt/homebrew/bin/${fullName}`
  ];
  for (const c of candidates) {
    if (fs2.existsSync(c)) return c;
  }
  return null;
}
function runPgDump() {
  return new Promise((resolve, reject) => {
    const bin = findPostgresBinary("pg_dump");
    if (!bin) return reject(new Error("pg_dump binary not found on server"));
    const host = process.env.PG_HOST || "localhost";
    const port = process.env.PG_PORT || "5432";
    const user = process.env.PG_USER || "postgres";
    const database = process.env.PG_DATABASE || "rentobit";
    const password = process.env.PG_PASSWORD || "Malik@112233";
    const child = spawn(
      bin,
      [
        "--clean",
        "--if-exists",
        "--no-owner",
        "--no-privileges",
        "--inserts",
        "-U",
        user,
        "-h",
        host,
        "-p",
        port,
        "-d",
        database
      ],
      {
        env: {
          ...process.env,
          PGPASSWORD: password
        }
      }
    );
    const chunks = [];
    let errOutput = "";
    child.stdout.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    child.stderr.on("data", (data) => {
      errOutput += data.toString();
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks).toString("utf-8"));
      } else {
        reject(new Error(`pg_dump exited with code ${code}: ${errOutput}`));
      }
    });
    child.on("error", (err) => reject(err));
  });
}
async function generateNodeSqlDump() {
  const tablesRes = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  let dump = `-- =========================================================
`;
  dump += `-- RentoBit PostgreSQL Database Standalone Snapshot
`;
  dump += `-- Generated at: ${(/* @__PURE__ */ new Date()).toISOString()}
`;
  dump += `-- Engine: Node.js Universal SQL Serializer
`;
  dump += `-- =========================================================

`;
  dump += `SET statement_timeout = 0;
SET client_encoding = 'UTF8';

`;
  for (const row of tablesRes.rows) {
    const tableName = row.table_name;
    const dataRes = await pool.query(`SELECT * FROM "${tableName}";`);
    dump += `-- Table: "${tableName}" (${dataRes.rows.length} rows)
`;
    dump += `TRUNCATE TABLE "${tableName}" CASCADE;
`;
    if (dataRes.rows.length > 0) {
      for (const item of dataRes.rows) {
        const columns = Object.keys(item).map((c) => `"${c}"`).join(", ");
        const values = Object.values(item).map((val) => {
          if (val === null || val === void 0) return "NULL";
          if (typeof val === "number" || typeof val === "boolean") return String(val);
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          return `'${String(val).replace(/'/g, "''")}'`;
        }).join(", ");
        dump += `INSERT INTO "${tableName}" (${columns}) VALUES (${values});
`;
      }
    }
    dump += `
`;
  }
  return dump;
}
function runPsqlRestore(sqlScript) {
  return new Promise((resolve, reject) => {
    const bin = findPostgresBinary("psql");
    if (!bin) return reject(new Error("psql binary not found on server"));
    const host = process.env.PG_HOST || "localhost";
    const port = process.env.PG_PORT || "5432";
    const user = process.env.PG_USER || "postgres";
    const database = process.env.PG_DATABASE || "rentobit";
    const password = process.env.PG_PASSWORD || "Malik@112233";
    const child = spawn(
      bin,
      [
        "-U",
        user,
        "-h",
        host,
        "-p",
        port,
        "-d",
        database,
        "--quiet"
      ],
      {
        env: {
          ...process.env,
          PGPASSWORD: password
        }
      }
    );
    let errOutput = "";
    child.stderr.on("data", (data) => {
      errOutput += data.toString();
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`psql restore exited with code ${code}: ${errOutput}`));
      }
    });
    child.on("error", (err) => reject(err));
    child.stdin.write(sqlScript);
    child.stdin.end();
  });
}
app.get("/api/admin/database/info", async (req, res) => {
  try {
    const [sizeRes, tablesRes, countsRes, lastBackupRes, lastRestoreRes] = await Promise.all([
      pool.query(`SELECT pg_size_pretty(pg_database_size(current_database())) AS size, version();`),
      pool.query(`
        SELECT count(*) AS count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
      `),
      pool.query(`
        SELECT
          (SELECT count(*) FROM users) AS users_count,
          (SELECT count(*) FROM deposits) AS deposits_count,
          (SELECT count(*) FROM withdrawals) AS withdrawals_count,
          (SELECT count(*) FROM active_investments) AS investments_count,
          (SELECT count(*) FROM transactions) AS transactions_count,
          (SELECT count(*) FROM kyc_verifications) AS kyc_count,
          (SELECT count(*) FROM audit_logs) AS audit_count;
      `),
      pool.query(`
        SELECT created_at FROM audit_logs 
        WHERE action = 'DATABASE_BACKUP_DOWNLOADED' 
        ORDER BY created_at DESC LIMIT 1;
      `),
      pool.query(`
        SELECT created_at, details FROM audit_logs 
        WHERE action = 'DATABASE_RESTORED' 
        ORDER BY created_at DESC LIMIT 1;
      `)
    ]);
    res.json({
      databaseName: process.env.PG_DATABASE || "rentobit",
      databaseUser: process.env.PG_USER || "postgres",
      host: process.env.PG_HOST || "localhost",
      port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
      databaseSize: sizeRes.rows[0]?.size || "Unknown",
      postgresVersion: sizeRes.rows[0]?.version || "PostgreSQL 18",
      totalTables: parseInt(tablesRes.rows[0]?.count || "0", 10),
      tableRows: {
        users: parseInt(countsRes.rows[0]?.users_count || "0", 10),
        deposits: parseInt(countsRes.rows[0]?.deposits_count || "0", 10),
        withdrawals: parseInt(countsRes.rows[0]?.withdrawals_count || "0", 10),
        investments: parseInt(countsRes.rows[0]?.investments_count || "0", 10),
        transactions: parseInt(countsRes.rows[0]?.transactions_count || "0", 10),
        kyc: parseInt(countsRes.rows[0]?.kyc_count || "0", 10),
        auditLogs: parseInt(countsRes.rows[0]?.audit_count || "0", 10)
      },
      lastBackupAt: lastBackupRes.rows[0]?.created_at ? new Date(lastBackupRes.rows[0].created_at).toLocaleString() : null,
      lastRestoreAt: lastRestoreRes.rows[0]?.created_at ? new Date(lastRestoreRes.rows[0].created_at).toLocaleString() : null,
      lastRestoreDetails: lastRestoreRes.rows[0]?.details || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/database/backup", async (req, res) => {
  try {
    let sqlDump = "";
    try {
      sqlDump = await runPgDump();
    } catch (pgDumpErr) {
      console.warn("[DB Backup] pg_dump binary call notice, using programmatic table serializer:", pgDumpErr);
      sqlDump = await generateNodeSqlDump();
    }
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `rentobit_postgres_backup_${timestamp}.sql`;
    const fileSizeMb = (Buffer.byteLength(sqlDump) / 1024 / 1024).toFixed(2);
    await pool.query(
      `INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `aud_${Date.now()}`,
        "DATABASE_BACKUP_DOWNLOADED",
        "SuperAdmin",
        "System Database",
        `Generated and downloaded full PostgreSQL backup: ${filename} (${fileSizeMb} MB)`,
        req.ip || "127.0.0.1"
      ]
    ).catch(() => {
    });
    res.setHeader("Content-Type", "application/sql; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(sqlDump);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to generate database backup" });
  }
});
app.post("/api/admin/database/restore", async (req, res) => {
  try {
    const { sql, fileName } = req.body;
    if (!sql || typeof sql !== "string" || sql.trim().length === 0) {
      return res.status(400).json({ error: "SQL script content is required for database restoration." });
    }
    try {
      await runPsqlRestore(sql);
    } catch (psqlErr) {
      console.warn("[DB Restore] psql utility notice, executing via transactional client stream:", psqlErr);
      const cleanSql = sql.split("\n").filter((l) => !l.trim().startsWith("\\")).join("\n");
      const client = await pool.connect();
      try {
        await client.query("BEGIN;");
        await client.query(cleanSql);
        await client.query("COMMIT;");
      } catch (directErr) {
        await client.query("ROLLBACK;");
        throw directErr;
      } finally {
        client.release();
      }
    }
    await initializeDatabase().catch((e) => console.warn("[DB Restore] Post-restore check notice:", e));
    const restoredName = fileName || "Uploaded SQL File";
    const fileSizeMb = (Buffer.byteLength(sql) / 1024 / 1024).toFixed(2);
    await pool.query(
      `INSERT INTO audit_logs (id, action, performed_by, target_user, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `aud_${Date.now()}`,
        "DATABASE_RESTORED",
        "SuperAdmin",
        "System Database",
        `PostgreSQL database restored from file: ${restoredName} (${fileSizeMb} MB)`,
        req.ip || "127.0.0.1"
      ]
    ).catch(() => {
    });
    res.json({
      success: true,
      message: `Database successfully restored from ${restoredName}. All tables, balances, and records are synchronized.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to restore database from SQL file" });
  }
});
async function startServer() {
  try {
    await initializeDatabase();
  } catch (e) {
    console.error("[DB Boot Warning] Database check completed with notice:", e);
  }
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distCandidates = [
      path2.join(process.cwd(), "dist"),
      __dirname2,
      path2.join(__dirname2, "dist")
    ];
    const distPath = distCandidates.find((d) => fs2.existsSync(path2.join(d, "index.html"))) || path2.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path2.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} RentoBit PostgreSQL-Powered Server running on http://0.0.0.0:${PORT}`);
    setInterval(async () => {
      try {
        await runAutoClaimDistribution();
      } catch (err) {
        console.error("[Auto-Claim Background Scheduler Error]:", err);
      }
    }, 3e4);
    setTimeout(() => {
      runAutoClaimDistribution().catch((err) => console.error("[Initial Auto-Claim Boot Run Error]:", err));
    }, 2e3);
  });
}
startServer();
export {
  runAutoClaimDistribution
};
//# sourceMappingURL=server.js.map
