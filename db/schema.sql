-- PostgreSQL Database Schema for RentoBit
-- Generated: 2026-09-04

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(128),
    last_name VARCHAR(128),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(64),
    avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role VARCHAR(32) NOT NULL DEFAULT 'user', -- 'user' | 'admin'
    status VARCHAR(32) NOT NULL DEFAULT 'Active', -- 'Active' | 'Suspended'
    kyc_status VARCHAR(64) NOT NULL DEFAULT 'Not Started',
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    referral_code VARCHAR(64) UNIQUE,
    referred_by VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Balances Table
CREATE TABLE IF NOT EXISTS balances (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_balance NUMERIC(15, 2) DEFAULT 0.00,
    available_balance NUMERIC(15, 2) DEFAULT 0.00,
    total_invested NUMERIC(15, 2) DEFAULT 0.00,
    today_reward NUMERIC(15, 2) DEFAULT 0.00,
    active_plans_count INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Investment Plans Table
CREATE TABLE IF NOT EXISTS investment_plans (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'ECONOMY', 'STANDARD', 'SUV', 'PREMIUM'
    vehicle_examples TEXT[] DEFAULT '{}',
    min_invest NUMERIC(15, 2) NOT NULL,
    max_invest NUMERIC(15, 2) NOT NULL,
    daily_reward_rate NUMERIC(8, 4) NOT NULL, -- percentage e.g. 0.44
    duration_days INT NOT NULL,
    image TEXT,
    accent_color VARCHAR(64) DEFAULT '#155EEF',
    badge_color VARCHAR(64) DEFAULT '#38BDF8',
    is_popular BOOLEAN DEFAULT FALSE,
    description TEXT,
    features TEXT[] DEFAULT '{}',
    payout_frequency VARCHAR(64) DEFAULT 'Daily',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Active Investments Table
CREATE TABLE IF NOT EXISTS active_investments (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(64) REFERENCES investment_plans(id) ON DELETE SET NULL,
    plan_name VARCHAR(255) NOT NULL,
    vehicle_category VARCHAR(64) NOT NULL,
    vehicle_model VARCHAR(255),
    invested_amount NUMERIC(15, 2) NOT NULL,
    daily_reward NUMERIC(15, 2) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    next_reward_time TIMESTAMP WITH TIME ZONE,
    total_earned NUMERIC(15, 2) DEFAULT 0.00,
    progress INT DEFAULT 0,
    status VARCHAR(32) DEFAULT 'Active', -- 'Active', 'Pending', 'Completed'
    agreement_url TEXT,
    deposit_id VARCHAR(64) REFERENCES deposits(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Daily Rewards Table
CREATE TABLE IF NOT EXISTS daily_rewards (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    reward_date DATE NOT NULL,
    gross_amount NUMERIC(15, 2) NOT NULL,
    withholding NUMERIC(15, 2) DEFAULT 0.00,
    fee NUMERIC(15, 2) DEFAULT 0.00,
    net_amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(64) DEFAULT 'Available', -- 'Available', 'Claimed', 'Locked', 'Unlock Requested', 'Unlocked', 'Settled'
    claim_window_start VARCHAR(32) DEFAULT '12:00 PM',
    claim_window_end VARCHAR(32) DEFAULT '3:00 PM',
    claimed_at TIMESTAMP WITH TIME ZONE,
    lock_time TIMESTAMP WITH TIME ZONE,
    unlock_request_id VARCHAR(64),
    transaction_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Unlock Requests Table
CREATE TABLE IF NOT EXISTS unlock_requests (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    reward_id VARCHAR(64) REFERENCES daily_rewards(id) ON DELETE SET NULL,
    plan_name VARCHAR(255),
    gross_reward NUMERIC(15, 2) NOT NULL,
    claim_window VARCHAR(64),
    lock_time TIMESTAMP WITH TIME ZONE,
    reason TEXT NOT NULL,
    status VARCHAR(64) DEFAULT 'Under Support Review', -- 'Under Support Review', 'Approved', 'Rejected'
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(255),
    admin_note TEXT
);

-- 7. Deposit Payment Methods Table
CREATE TABLE IF NOT EXISTS deposit_payment_methods (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'mobile_wallet', 'crypto', 'bank'
    icon_type VARCHAR(64) NOT NULL, -- 'jazzcash', 'easypaisa', 'usdt', 'btc', 'eth', 'bank'
    icon_url TEXT,
    account_title VARCHAR(255) NOT NULL,
    account_number VARCHAR(255),
    till_id VARCHAR(64),
    network_or_bank VARCHAR(128),
    qr_code_url TEXT,
    instructions TEXT,
    min_deposit NUMERIC(15, 2) DEFAULT 10.00,
    max_deposit NUMERIC(15, 2) DEFAULT 50000.00,
    fee_percent NUMERIC(5, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Deposits Table
CREATE TABLE IF NOT EXISTS deposits (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(64) REFERENCES investment_plans(id) ON DELETE SET NULL,
    plan_name VARCHAR(255),
    investment_id VARCHAR(64),
    amount NUMERIC(15, 2) NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    reference VARCHAR(255) NOT NULL,
    proof_url TEXT,
    fee NUMERIC(15, 2) DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(64) DEFAULT 'Pending', -- 'Pending', 'Under Review', 'Approved', 'Rejected'
    rejection_reason TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Withdrawals Table
CREATE TABLE IF NOT EXISTS withdrawals (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    destination_details TEXT NOT NULL,
    fee NUMERIC(15, 2) DEFAULT 0.00,
    net_amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(64) DEFAULT 'Pending', -- 'Pending', 'Review', 'Processing', 'Completed', 'Rejected'
    two_factor_verified BOOLEAN DEFAULT FALSE,
    rejection_reason TEXT,
    admin_comment TEXT,
    tx_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9b. Withdrawal Payment Methods Table (Crypto Wallets)
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

-- 10. KYC Verifications Table
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(128),
    last_name VARCHAR(128),
    dob DATE,
    address TEXT,
    city VARCHAR(128),
    state VARCHAR(128),
    postal_code VARCHAR(32),
    country VARCHAR(128),
    doc_type VARCHAR(64),
    doc_number VARCHAR(128),
    country_of_issue VARCHAR(128),
    issue_date DATE,
    expiry_date DATE,
    document_front_url TEXT,
    document_back_url TEXT,
    selfie_url TEXT,
    liveness_passed BOOLEAN DEFAULT FALSE,
    advance_kyc_allowed BOOLEAN DEFAULT TRUE,
    basic_status VARCHAR(64) DEFAULT 'Not Started', -- 'Not Started', 'Completed', 'Approved'
    advance_status VARCHAR(64) DEFAULT 'Not Started', -- 'Not Started', 'Under Review', 'Approved', 'Rejected'
    status VARCHAR(64) DEFAULT 'Not Started', -- 'Not Started', 'Documents Uploaded', 'Submitted', 'Under Review', 'More Information Required', 'Approved', 'Rejected'
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(255)
);

-- 11. Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'Open', -- 'Open', 'Pending', 'In Progress', 'Resolved', 'Closed'
    priority VARCHAR(32) DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
    attached_reward_id VARCHAR(64),
    attached_investment_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Support Messages Table
CREATE TABLE IF NOT EXISTS support_messages (
    id VARCHAR(64) PRIMARY KEY,
    ticket_id VARCHAR(64) NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender VARCHAR(32) NOT NULL, -- 'user' | 'support'
    sender_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL, -- 'Deposit', 'Withdrawal', 'Investment', 'Reward', 'Daily Reward', 'Fee', 'Withholding', 'Unlock Settle'
    amount NUMERIC(15, 2) NOT NULL,
    fee NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(64) DEFAULT 'Completed',
    reference VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(64) DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    action VARCHAR(128) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    target_user VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Splash Slides Table
CREATE TABLE IF NOT EXISTS splash_slides (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    headline VARCHAR(255) NOT NULL,
    subheadline VARCHAR(255),
    description TEXT,
    badge1 VARCHAR(128),
    badge2 VARCHAR(128),
    daily_reward_rate NUMERIC(8, 4),
    category VARCHAR(64),
    min_invest NUMERIC(15, 2),
    duration_days INT,
    display_order INT DEFAULT 0
);

-- 17. System Settings Table (Global dynamic application settings)
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(64) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Plan Cancellation Requests Table
CREATE TABLE IF NOT EXISTS plan_cancellation_requests (
    id VARCHAR(64) PRIMARY KEY,
    investment_id VARCHAR(64) NOT NULL REFERENCES active_investments(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    plan_name VARCHAR(255) NOT NULL,
    invested_amount NUMERIC(15, 2) NOT NULL,
    today_reward NUMERIC(15, 2) DEFAULT 0.00,
    total_earned NUMERIC(15, 2) DEFAULT 0.00,
    reason TEXT,
    status VARCHAR(64) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    admin_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 19. Referral Commissions Table (Admin Deposit Approval Triggered)
CREATE TABLE IF NOT EXISTS referral_commissions (
    id VARCHAR(64) PRIMARY KEY,
    deposit_id VARCHAR(64) UNIQUE REFERENCES deposits(id) ON DELETE CASCADE,
    referrer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referee_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(64),
    plan_name VARCHAR(255),
    deposit_amount NUMERIC(15, 2) NOT NULL,
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    commission_amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Credited',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

