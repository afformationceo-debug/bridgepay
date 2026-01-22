-- ============================================
-- LINE Unify Pay - Supabase Migration
-- Version: 001_initial_schema
-- Date: 2026-01-22
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM Types
-- ============================================

CREATE TYPE merchant_status AS ENUM (
  'pending',      -- 신청 대기
  'reviewing',    -- 심사 중
  'approved',     -- 승인
  'rejected',     -- 거절
  'suspended'     -- 정지
);

CREATE TYPE merchant_role AS ENUM (
  'owner',        -- 대표
  'manager',      -- 관리자
  'staff'         -- 직원
);

CREATE TYPE payment_status AS ENUM (
  'pending',      -- 결제 대기
  'processing',   -- 처리 중
  'completed',    -- 완료
  'failed',       -- 실패
  'expired',      -- 만료
  'refunded',     -- 환불됨
  'partial_refunded' -- 부분 환불
);

CREATE TYPE settlement_status AS ENUM (
  'pending',      -- 요청됨
  'processing',   -- 처리 중
  'completed',    -- 완료
  'failed'        -- 실패
);

CREATE TYPE refund_status AS ENUM (
  'pending',
  'approved',
  'processing',
  'completed',
  'rejected'
);

CREATE TYPE ledger_type AS ENUM (
  'payment',      -- 결제 입금
  'refund',       -- 환불 출금
  'settlement',   -- 정산 출금
  'fee',          -- 수수료
  'adjustment'    -- 조정
);

-- ============================================
-- 1. Merchants (가맹점)
-- ============================================

CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 기본 정보
  business_name VARCHAR(100) NOT NULL,
  business_number VARCHAR(20) NOT NULL UNIQUE,
  representative_name VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  
  -- 연락처
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  address TEXT,
  
  -- 정산 정보
  bank_name VARCHAR(50),
  bank_account_encrypted TEXT,  -- AES-256 암호화
  account_holder VARCHAR(50),
  
  -- 블록체인 지갑
  wallet_address VARCHAR(42),
  
  -- 수수료 및 설정
  fee_rate DECIMAL(5,4) DEFAULT 0.0050,  -- 기본 0.5%
  settlement_cycle VARCHAR(20) DEFAULT 'instant',
  
  -- 상태
  status merchant_status DEFAULT 'pending',
  status_reason TEXT,
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  
  -- 인덱스용
  CONSTRAINT valid_wallet CHECK (wallet_address IS NULL OR wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- 인덱스
CREATE INDEX idx_merchants_status ON merchants(status);
CREATE INDEX idx_merchants_business_number ON merchants(business_number);
CREATE INDEX idx_merchants_email ON merchants(email);
CREATE INDEX idx_merchants_created_at ON merchants(created_at DESC);

-- ============================================
-- 2. Users (사용자)
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 인증 정보 (Supabase Auth 연동)
  auth_id UUID UNIQUE,  -- Supabase auth.users.id
  
  -- 기본 정보
  email VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  
  -- 상태
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- ============================================
-- 3. Merchant Users (가맹점-사용자 연결)
-- ============================================

CREATE TABLE merchant_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  role merchant_role NOT NULL DEFAULT 'staff',
  
  -- 초대 정보
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  
  -- 상태
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(merchant_id, user_id)
);

CREATE INDEX idx_merchant_users_merchant ON merchant_users(merchant_id);
CREATE INDEX idx_merchant_users_user ON merchant_users(user_id);

-- ============================================
-- 4. Payments (결제)
-- ============================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 관계
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  qr_code_id UUID,  -- QR 코드 참조 (나중에 FK 추가)
  
  -- 결제 금액
  amount_krw DECIMAL(15,2) NOT NULL,
  amount_crypto DECIMAL(18,8) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USDT',
  exchange_rate DECIMAL(18,8) NOT NULL,
  
  -- 수수료
  fee_rate DECIMAL(5,4) NOT NULL,
  fee_amount DECIMAL(18,8) NOT NULL,
  net_amount DECIMAL(18,8) NOT NULL,  -- 수수료 제외 금액
  
  -- 고객 정보 (익명화)
  customer_wallet VARCHAR(42),
  customer_country VARCHAR(2),  -- ISO 3166-1 alpha-2
  
  -- 블록체인 정보
  tx_hash VARCHAR(66),
  block_number BIGINT,
  
  -- 상태
  status payment_status DEFAULT 'pending',
  status_message TEXT,
  
  -- 만료
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- 메타데이터
  memo TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_tx_hash CHECK (tx_hash IS NULL OR tx_hash ~ '^0x[a-fA-F0-9]{64}$')
);

-- 인덱스
CREATE INDEX idx_payments_merchant ON payments(merchant_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_tx_hash ON payments(tx_hash) WHERE tx_hash IS NOT NULL;
CREATE INDEX idx_payments_merchant_date ON payments(merchant_id, created_at DESC);

-- ============================================
-- 5. Payment Logs (결제 로그)
-- ============================================

CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  
  -- 상태 변경
  previous_status payment_status,
  new_status payment_status NOT NULL,
  
  -- 로그 정보
  message TEXT,
  error_code VARCHAR(20),
  metadata JSONB DEFAULT '{}',
  
  -- IP/User Agent (디버깅용)
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_logs_payment ON payment_logs(payment_id);
CREATE INDEX idx_payment_logs_created_at ON payment_logs(created_at DESC);

-- ============================================
-- 6. Ledger Entries (원장)
-- ============================================

CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  
  -- 연결된 트랜잭션
  payment_id UUID REFERENCES payments(id),
  settlement_id UUID,  -- FK 나중에 추가
  refund_id UUID,      -- FK 나중에 추가
  
  -- 금액
  type ledger_type NOT NULL,
  amount DECIMAL(18,8) NOT NULL,  -- 양수: 입금, 음수: 출금
  currency VARCHAR(10) NOT NULL DEFAULT 'USDT',
  
  -- 잔액 스냅샷
  balance_before DECIMAL(18,8) NOT NULL,
  balance_after DECIMAL(18,8) NOT NULL,
  
  -- 메타데이터
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ledger_merchant ON ledger_entries(merchant_id);
CREATE INDEX idx_ledger_type ON ledger_entries(type);
CREATE INDEX idx_ledger_created_at ON ledger_entries(created_at DESC);
CREATE INDEX idx_ledger_payment ON ledger_entries(payment_id) WHERE payment_id IS NOT NULL;

-- ============================================
-- 7. Settlements (정산)
-- ============================================

CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  requested_by UUID NOT NULL REFERENCES users(id),
  
  -- 금액
  amount DECIMAL(18,8) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USDT',
  amount_krw DECIMAL(15,2),  -- 환전 후 원화
  exchange_rate DECIMAL(18,8),
  
  -- 수수료
  fee_amount DECIMAL(18,8) DEFAULT 0,
  net_amount DECIMAL(18,8) NOT NULL,
  
  -- 정산 계좌
  bank_name VARCHAR(50) NOT NULL,
  bank_account_masked VARCHAR(20) NOT NULL,  -- 마스킹된 계좌번호
  account_holder VARCHAR(50) NOT NULL,
  
  -- 블록체인 정보
  tx_hash VARCHAR(66),
  
  -- 상태
  status settlement_status DEFAULT 'pending',
  status_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_settlements_merchant ON settlements(merchant_id);
CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_created_at ON settlements(created_at DESC);

-- FK 추가
ALTER TABLE ledger_entries 
ADD CONSTRAINT fk_ledger_settlement 
FOREIGN KEY (settlement_id) REFERENCES settlements(id);

-- ============================================
-- 8. Refunds (환불)
-- ============================================

CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  payment_id UUID NOT NULL REFERENCES payments(id),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  requested_by UUID NOT NULL REFERENCES users(id),
  
  -- 금액
  amount_krw DECIMAL(15,2) NOT NULL,
  amount_crypto DECIMAL(18,8) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USDT',
  
  -- 사유
  reason VARCHAR(50) NOT NULL,
  reason_detail TEXT,
  
  -- 블록체인 정보
  tx_hash VARCHAR(66),
  
  -- 상태
  status refund_status DEFAULT 'pending',
  status_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_refunds_payment ON refunds(payment_id);
CREATE INDEX idx_refunds_merchant ON refunds(merchant_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- FK 추가
ALTER TABLE ledger_entries 
ADD CONSTRAINT fk_ledger_refund 
FOREIGN KEY (refund_id) REFERENCES refunds(id);

-- ============================================
-- 9. QR Codes (QR 코드)
-- ============================================

CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  -- QR 정보
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,  -- 고유 코드
  
  -- 통계
  scan_count INT DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  
  -- 상태
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qr_codes_merchant ON qr_codes(merchant_id);
CREATE INDEX idx_qr_codes_code ON qr_codes(code);

-- payments에 FK 추가
ALTER TABLE payments 
ADD CONSTRAINT fk_payments_qr_code 
FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id);

-- ============================================
-- 10. Exchange Rates (환율)
-- ============================================

CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  from_currency VARCHAR(10) NOT NULL,
  to_currency VARCHAR(10) NOT NULL,
  rate DECIMAL(18,8) NOT NULL,
  
  source VARCHAR(50) NOT NULL,  -- 'kaia', 'binance', etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(from_currency, to_currency, created_at)
);

CREATE INDEX idx_exchange_rates_pair ON exchange_rates(from_currency, to_currency);
CREATE INDEX idx_exchange_rates_created_at ON exchange_rates(created_at DESC);

-- ============================================
-- Functions
-- ============================================

-- 가맹점 잔액 조회
CREATE OR REPLACE FUNCTION get_merchant_balance(p_merchant_id UUID)
RETURNS DECIMAL(18,8) AS $$
DECLARE
  v_balance DECIMAL(18,8);
BEGIN
  SELECT COALESCE(
    (SELECT balance_after 
     FROM ledger_entries 
     WHERE merchant_id = p_merchant_id 
     ORDER BY created_at DESC 
     LIMIT 1),
    0
  ) INTO v_balance;
  
  RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- 일별 매출 집계
CREATE OR REPLACE FUNCTION calculate_daily_revenue(
  p_merchant_id UUID,
  p_date DATE
)
RETURNS TABLE(
  total_count INT,
  total_krw DECIMAL(15,2),
  total_crypto DECIMAL(18,8),
  total_fee DECIMAL(18,8)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INT as total_count,
    COALESCE(SUM(amount_krw), 0) as total_krw,
    COALESCE(SUM(net_amount), 0) as total_crypto,
    COALESCE(SUM(fee_amount), 0) as total_fee
  FROM payments
  WHERE merchant_id = p_merchant_id
    AND status = 'completed'
    AND DATE(created_at) = p_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers
-- ============================================

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER trg_merchants_updated_at
  BEFORE UPDATE ON merchants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_merchant_users_updated_at
  BEFORE UPDATE ON merchant_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_settlements_updated_at
  BEFORE UPDATE ON settlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_refunds_updated_at
  BEFORE UPDATE ON refunds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_qr_codes_updated_at
  BEFORE UPDATE ON qr_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 결제 완료 시 원장 자동 기록
CREATE OR REPLACE FUNCTION create_ledger_on_payment_complete()
RETURNS TRIGGER AS $$
DECLARE
  v_balance DECIMAL(18,8);
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_balance := get_merchant_balance(NEW.merchant_id);
    
    INSERT INTO ledger_entries (
      merchant_id,
      payment_id,
      type,
      amount,
      currency,
      balance_before,
      balance_after,
      description
    ) VALUES (
      NEW.merchant_id,
      NEW.id,
      'payment',
      NEW.net_amount,
      NEW.currency,
      v_balance,
      v_balance + NEW.net_amount,
      '결제 입금'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_complete_ledger
  AFTER UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION create_ledger_on_payment_complete();

-- ============================================
-- Views
-- ============================================

-- 가맹점 대시보드 뷰
CREATE OR REPLACE VIEW v_merchant_dashboard AS
SELECT 
  m.id as merchant_id,
  m.business_name,
  m.status,
  get_merchant_balance(m.id) as current_balance,
  (
    SELECT COUNT(*) FROM payments p 
    WHERE p.merchant_id = m.id 
    AND p.status = 'completed'
    AND DATE(p.created_at) = CURRENT_DATE
  ) as today_payment_count,
  (
    SELECT COALESCE(SUM(amount_krw), 0) FROM payments p 
    WHERE p.merchant_id = m.id 
    AND p.status = 'completed'
    AND DATE(p.created_at) = CURRENT_DATE
  ) as today_revenue_krw,
  (
    SELECT COUNT(*) FROM payments p 
    WHERE p.merchant_id = m.id 
    AND p.status = 'completed'
    AND DATE_TRUNC('month', p.created_at) = DATE_TRUNC('month', CURRENT_DATE)
  ) as month_payment_count,
  (
    SELECT COALESCE(SUM(amount_krw), 0) FROM payments p 
    WHERE p.merchant_id = m.id 
    AND p.status = 'completed'
    AND DATE_TRUNC('month', p.created_at) = DATE_TRUNC('month', CURRENT_DATE)
  ) as month_revenue_krw
FROM merchants m
WHERE m.status = 'approved';

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- RLS 활성화
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신이 속한 가맹점 데이터만 접근 가능
CREATE POLICY "Users can access their merchant data"
ON merchants FOR ALL
USING (
  id IN (
    SELECT merchant_id FROM merchant_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can access their merchant payments"
ON payments FOR ALL
USING (
  merchant_id IN (
    SELECT merchant_id FROM merchant_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can access their merchant settlements"
ON settlements FOR ALL
USING (
  merchant_id IN (
    SELECT merchant_id FROM merchant_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can access their merchant ledger"
ON ledger_entries FOR SELECT
USING (
  merchant_id IN (
    SELECT merchant_id FROM merchant_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can access their merchant QR codes"
ON qr_codes FOR ALL
USING (
  merchant_id IN (
    SELECT merchant_id FROM merchant_users 
    WHERE user_id = auth.uid()
  )
);

-- ============================================
-- Initial Data (테스트용)
-- ============================================

-- 환율 초기 데이터
INSERT INTO exchange_rates (from_currency, to_currency, rate, source) VALUES
('KRW', 'USDT', 0.000670, 'initial'),
('USDT', 'KRW', 1492.00, 'initial'),
('JPY', 'USDT', 0.0067, 'initial'),
('TWD', 'USDT', 0.031, 'initial');

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE merchants IS '가맹점 정보';
COMMENT ON TABLE users IS '사용자 (가맹점 관리자/직원)';
COMMENT ON TABLE merchant_users IS '가맹점-사용자 연결 및 권한';
COMMENT ON TABLE payments IS '결제 트랜잭션';
COMMENT ON TABLE payment_logs IS '결제 상태 변경 로그';
COMMENT ON TABLE ledger_entries IS '원장 (가맹점 잔액 추적)';
COMMENT ON TABLE settlements IS '정산 (출금) 요청';
COMMENT ON TABLE refunds IS '환불 요청';
COMMENT ON TABLE qr_codes IS '가맹점 결제 QR 코드';
COMMENT ON TABLE exchange_rates IS '환율 캐시';

COMMENT ON FUNCTION get_merchant_balance IS '가맹점 현재 잔액 조회';
COMMENT ON FUNCTION calculate_daily_revenue IS '일별 매출 집계';
