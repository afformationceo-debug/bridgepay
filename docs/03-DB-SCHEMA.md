# 03. Database Schema

> Supabase (PostgreSQL) 데이터베이스 설계

---

## 1. ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Database Schema ERD                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐         ┌──────────────────┐                          │
│  │    merchants     │         │   merchant_users │                          │
│  ├──────────────────┤         ├──────────────────┤                          │
│  │ id (PK)          │◄───────┤│ merchant_id (FK) │                          │
│  │ name             │    1:N  │ user_id (FK)     │                          │
│  │ business_number  │         │ role             │                          │
│  │ category         │         │ invited_at       │                          │
│  │ status           │         └──────────────────┘                          │
│  │ wallet_address   │                                                        │
│  │ qr_code_id       │         ┌──────────────────┐                          │
│  │ created_at       │         │      users       │                          │
│  └────────┬─────────┘         ├──────────────────┤                          │
│           │                   │ id (PK)          │                          │
│           │                   │ email            │                          │
│           │                   │ name             │                          │
│           │                   │ phone            │                          │
│           │                   │ auth_id (FK)     │ ──► Supabase Auth        │
│           │                   └──────────────────┘                          │
│           │                                                                  │
│           │ 1:N                                                              │
│           ▼                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐                          │
│  │    payments      │         │   payment_logs   │                          │
│  ├──────────────────┤         ├──────────────────┤                          │
│  │ id (PK)          │◄───────┤│ payment_id (FK)  │                          │
│  │ merchant_id (FK) │    1:N  │ status           │                          │
│  │ amount_krw       │         │ message          │                          │
│  │ amount_crypto    │         │ created_at       │                          │
│  │ currency         │         └──────────────────┘                          │
│  │ exchange_rate    │                                                        │
│  │ tx_hash          │                                                        │
│  │ status           │                                                        │
│  │ customer_wallet  │                                                        │
│  │ created_at       │                                                        │
│  └────────┬─────────┘                                                        │
│           │                                                                  │
│           │ 1:1                                                              │
│           ▼                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐                          │
│  │  ledger_entries  │         │   settlements    │                          │
│  ├──────────────────┤         ├──────────────────┤                          │
│  │ id (PK)          │         │ id (PK)          │                          │
│  │ payment_id (FK)  │         │ merchant_id (FK) │ ◄── merchants            │
│  │ merchant_id (FK) │         │ amount           │                          │
│  │ type             │         │ currency         │                          │
│  │ amount           │         │ status           │                          │
│  │ balance_after    │         │ tx_hash          │                          │
│  │ created_at       │         │ requested_at     │                          │
│  └──────────────────┘         │ completed_at     │                          │
│                               └──────────────────┘                          │
│                                                                              │
│  ┌──────────────────┐         ┌──────────────────┐                          │
│  │    qr_codes      │         │   refunds        │                          │
│  ├──────────────────┤         ├──────────────────┤                          │
│  │ id (PK)          │         │ id (PK)          │                          │
│  │ merchant_id (FK) │         │ payment_id (FK)  │ ◄── payments             │
│  │ type             │         │ amount           │                          │
│  │ data             │         │ reason           │                          │
│  │ is_active        │         │ status           │                          │
│  │ created_at       │         │ tx_hash          │                          │
│  └──────────────────┘         │ created_at       │                          │
│                               └──────────────────┘                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Table Definitions

### 2.1 merchants (가맹점)

```sql
-- 가맹점 기본 정보
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 기본 정보
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  business_number VARCHAR(20) NOT NULL UNIQUE,
  representative_name VARCHAR(50) NOT NULL,
  
  -- 분류
  category VARCHAR(50) NOT NULL, -- 'hospital', 'beauty', 'retail'
  sub_category VARCHAR(50),
  
  -- 연락처
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  address_detail TEXT,
  
  -- 상태
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'under_review', 'approved', 'rejected', 'suspended'
  
  -- 지갑 정보
  wallet_address VARCHAR(66), -- Kaia 주소 (0x + 40자)
  
  -- 정산 정보
  bank_name VARCHAR(50),
  bank_account VARCHAR(50), -- 암호화 저장
  bank_holder VARCHAR(50),
  settlement_cycle VARCHAR(20) DEFAULT 'manual', -- 'manual', 'daily', 'weekly'
  
  -- 수수료 (우리 마진)
  fee_rate DECIMAL(5, 4) DEFAULT 0.005, -- 기본 0.5%
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  
  -- 인덱스용
  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'under_review', 'approved', 'rejected', 'suspended')
  ),
  CONSTRAINT valid_category CHECK (
    category IN ('hospital', 'beauty', 'retail', 'other')
  )
);

-- 인덱스
CREATE INDEX idx_merchants_status ON merchants(status);
CREATE INDEX idx_merchants_category ON merchants(category);
CREATE INDEX idx_merchants_wallet ON merchants(wallet_address);
CREATE INDEX idx_merchants_created ON merchants(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants are viewable by owner" ON merchants
  FOR SELECT USING (
    id IN (
      SELECT merchant_id FROM merchant_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all merchants" ON merchants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 2.2 users (사용자)

```sql
-- 시스템 사용자 (가맹점 관리자, 직원, 어드민)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 정보
  email VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  
  -- 시스템 역할 (전체 시스템 레벨)
  role VARCHAR(20) NOT NULL DEFAULT 'merchant_user',
  -- 'admin', 'merchant_user'
  
  -- 상태
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  -- 'active', 'inactive', 'suspended'
  
  -- 설정
  preferences JSONB DEFAULT '{}',
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth_id = auth.uid());
```

### 2.3 merchant_users (가맹점-사용자 연결)

```sql
-- 가맹점과 사용자의 다대다 관계 (역할 포함)
CREATE TABLE merchant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 가맹점 내 역할
  role VARCHAR(20) NOT NULL DEFAULT 'staff',
  -- 'owner', 'manager', 'staff'
  
  -- 권한 상세 (JSONB로 유연하게)
  permissions JSONB DEFAULT '{
    "view_payments": true,
    "process_refunds": false,
    "request_settlement": false,
    "manage_settings": false,
    "manage_staff": false
  }',
  
  -- 상태
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  -- 'invited', 'active', 'inactive'
  
  -- 타임스탬프
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(merchant_id, user_id)
);

-- 인덱스
CREATE INDEX idx_merchant_users_merchant ON merchant_users(merchant_id);
CREATE INDEX idx_merchant_users_user ON merchant_users(user_id);

-- RLS
ALTER TABLE merchant_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their merchant associations" ON merchant_users
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );
```

### 2.4 payments (결제)

```sql
-- 결제 트랜잭션
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  
  -- 금액 정보
  amount_krw DECIMAL(15, 2) NOT NULL, -- 원화 금액
  amount_crypto DECIMAL(20, 8) NOT NULL, -- 암호화폐 금액
  currency VARCHAR(10) NOT NULL, -- 'USDT', 'JPYT', 'TWDT'
  exchange_rate DECIMAL(20, 8) NOT NULL, -- 적용 환율
  
  -- 수수료
  fee_amount DECIMAL(20, 8) DEFAULT 0, -- 우리 수수료
  fee_rate DECIMAL(5, 4), -- 적용된 수수료율
  net_amount DECIMAL(20, 8), -- 가맹점 수령액
  
  -- 고객 정보 (익명화)
  customer_wallet VARCHAR(66) NOT NULL, -- 고객 지갑 주소
  customer_country VARCHAR(2), -- 'JP', 'TW'
  
  -- 블록체인 정보
  tx_hash VARCHAR(66), -- 트랜잭션 해시
  block_number BIGINT,
  network VARCHAR(20) DEFAULT 'kaia', -- 'kaia', 'kaia_testnet'
  
  -- 상태
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
  
  -- 에러 정보
  error_code VARCHAR(50),
  error_message TEXT,
  
  -- 메모
  memo TEXT,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- 제약조건
  CONSTRAINT valid_payment_status CHECK (
    status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')
  ),
  CONSTRAINT positive_amounts CHECK (
    amount_krw > 0 AND amount_crypto > 0
  )
);

-- 인덱스
CREATE INDEX idx_payments_merchant ON payments(merchant_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created ON payments(created_at DESC);
CREATE INDEX idx_payments_tx_hash ON payments(tx_hash);
CREATE INDEX idx_payments_customer ON payments(customer_wallet);

-- 복합 인덱스 (가맹점별 일자 조회 최적화)
CREATE INDEX idx_payments_merchant_date ON payments(merchant_id, created_at DESC);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their payments" ON payments
  FOR SELECT USING (
    merchant_id IN (
      SELECT merchant_id FROM merchant_users 
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );
```

### 2.5 payment_logs (결제 로그)

```sql
-- 결제 상태 변경 이력
CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  
  -- 상태 변경
  previous_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  
  -- 상세 정보
  message TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- 발생 주체
  triggered_by VARCHAR(50), -- 'system', 'blockchain', 'admin', 'user'
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_payment_logs_payment ON payment_logs(payment_id);
CREATE INDEX idx_payment_logs_created ON payment_logs(created_at DESC);

-- RLS
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Logs viewable by payment owner" ON payment_logs
  FOR SELECT USING (
    payment_id IN (
      SELECT id FROM payments WHERE merchant_id IN (
        SELECT merchant_id FROM merchant_users 
        WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
      )
    )
  );
```

### 2.6 ledger_entries (원장)

```sql
-- 가맹점 잔액 변동 원장
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  
  -- 연결 정보
  payment_id UUID REFERENCES payments(id),
  settlement_id UUID REFERENCES settlements(id),
  refund_id UUID REFERENCES refunds(id),
  
  -- 거래 유형
  type VARCHAR(20) NOT NULL,
  -- 'payment_in', 'fee_out', 'settlement_out', 'refund_out', 'adjustment'
  
  -- 금액
  amount DECIMAL(20, 8) NOT NULL, -- 양수: 입금, 음수: 출금
  currency VARCHAR(10) NOT NULL DEFAULT 'USDT',
  
  -- 잔액 (스냅샷)
  balance_before DECIMAL(20, 8) NOT NULL,
  balance_after DECIMAL(20, 8) NOT NULL,
  
  -- 설명
  description TEXT,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_ledger_merchant ON ledger_entries(merchant_id);
CREATE INDEX idx_ledger_type ON ledger_entries(type);
CREATE INDEX idx_ledger_created ON ledger_entries(created_at DESC);

-- 복합 인덱스 (잔액 조회 최적화)
CREATE INDEX idx_ledger_merchant_date ON ledger_entries(merchant_id, created_at DESC);

-- RLS
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their ledger" ON ledger_entries
  FOR SELECT USING (
    merchant_id IN (
      SELECT merchant_id FROM merchant_users 
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );
```

### 2.7 settlements (정산)

```sql
-- 정산 요청/처리
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  
  -- 금액
  amount_crypto DECIMAL(20, 8) NOT NULL, -- 출금 요청 암호화폐
  amount_krw DECIMAL(15, 2), -- 환전 후 원화 (환전 시)
  currency VARCHAR(10) NOT NULL DEFAULT 'USDT',
  exchange_rate DECIMAL(20, 8), -- 환전 적용 환율
  
  -- 수수료
  fee_amount DECIMAL(20, 8) DEFAULT 0,
  net_amount DECIMAL(20, 8), -- 실제 지급액
  
  -- 정산 방식
  settlement_type VARCHAR(20) NOT NULL DEFAULT 'manual',
  -- 'manual', 'auto_daily', 'auto_weekly'
  
  -- 대상 정보
  destination_type VARCHAR(20) NOT NULL,
  -- 'crypto_wallet', 'bank_account'
  destination_address TEXT, -- 지갑 주소 또는 계좌
  
  -- 블록체인 정보 (crypto 정산 시)
  tx_hash VARCHAR(66),
  block_number BIGINT,
  
  -- 상태
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
  
  -- 에러 정보
  error_code VARCHAR(50),
  error_message TEXT,
  
  -- 타임스탬프
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_settlements_merchant ON settlements(merchant_id);
CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_requested ON settlements(requested_at DESC);

-- RLS
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their settlements" ON settlements
  FOR SELECT USING (
    merchant_id IN (
      SELECT merchant_id FROM merchant_users 
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );
```

### 2.8 refunds (환불)

```sql
-- 환불 처리
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  
  -- 금액
  amount_crypto DECIMAL(20, 8) NOT NULL,
  amount_krw DECIMAL(15, 2) NOT NULL,
  
  -- 환불 유형
  refund_type VARCHAR(20) NOT NULL DEFAULT 'full',
  -- 'full', 'partial'
  
  -- 사유
  reason VARCHAR(100) NOT NULL,
  reason_detail TEXT,
  
  -- 블록체인 정보
  tx_hash VARCHAR(66),
  block_number BIGINT,
  
  -- 상태
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'processing', 'completed', 'failed'
  
  -- 요청자
  requested_by UUID REFERENCES users(id),
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX idx_refunds_payment ON refunds(payment_id);
CREATE INDEX idx_refunds_merchant ON refunds(merchant_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- RLS
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their refunds" ON refunds
  FOR SELECT USING (
    merchant_id IN (
      SELECT merchant_id FROM merchant_users 
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );
```

### 2.9 qr_codes (QR 코드)

```sql
-- QR 코드 관리
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  
  -- QR 타입
  type VARCHAR(20) NOT NULL DEFAULT 'static',
  -- 'static': 고정 QR (금액 미포함)
  -- 'dynamic': 동적 QR (금액 포함) - 향후
  
  -- QR 데이터
  data JSONB NOT NULL,
  -- {
  --   "version": "1.0",
  --   "merchant_id": "...",
  --   "wallet_address": "0x...",
  --   "callback_url": "..."
  -- }
  
  -- 상태
  is_active BOOLEAN DEFAULT true,
  
  -- 이름/설명 (다중 QR 관리용)
  name VARCHAR(100),
  description TEXT,
  
  -- 통계
  scan_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_qr_codes_merchant ON qr_codes(merchant_id);
CREATE INDEX idx_qr_codes_active ON qr_codes(is_active);

-- RLS
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can manage their QR codes" ON qr_codes
  FOR ALL USING (
    merchant_id IN (
      SELECT merchant_id FROM merchant_users 
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );
```

### 2.10 exchange_rates (환율 로그)

```sql
-- 환율 기록 (감사 목적)
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 통화 쌍
  from_currency VARCHAR(10) NOT NULL, -- 'JPY', 'TWD', 'USDT'
  to_currency VARCHAR(10) NOT NULL, -- 'KRW', 'USDT'
  
  -- 환율
  rate DECIMAL(20, 8) NOT NULL,
  
  -- 소스
  source VARCHAR(50) NOT NULL, -- 'kaia', 'binance', 'manual'
  
  -- 타임스탬프
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_exchange_rates_pair ON exchange_rates(from_currency, to_currency);
CREATE INDEX idx_exchange_rates_fetched ON exchange_rates(fetched_at DESC);

-- 파티셔닝 (향후 데이터 증가 시)
-- 월별 파티션 권장
```

---

## 3. Functions & Triggers

### 3.1 잔액 계산 함수

```sql
-- 가맹점 현재 잔액 조회
CREATE OR REPLACE FUNCTION get_merchant_balance(p_merchant_id UUID)
RETURNS DECIMAL(20, 8) AS $$
BEGIN
  RETURN COALESCE(
    (SELECT balance_after 
     FROM ledger_entries 
     WHERE merchant_id = p_merchant_id 
     ORDER BY created_at DESC 
     LIMIT 1),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.2 일일 매출 집계 함수

```sql
-- 일일 매출 집계
CREATE OR REPLACE FUNCTION calculate_daily_revenue(
  p_merchant_id UUID,
  p_date DATE
)
RETURNS TABLE (
  total_count INTEGER,
  total_amount_krw DECIMAL(15, 2),
  total_amount_crypto DECIMAL(20, 8),
  total_fee DECIMAL(20, 8),
  net_amount DECIMAL(20, 8)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_count,
    COALESCE(SUM(amount_krw), 0) as total_amount_krw,
    COALESCE(SUM(amount_crypto), 0) as total_amount_crypto,
    COALESCE(SUM(fee_amount), 0) as total_fee,
    COALESCE(SUM(net_amount), 0) as net_amount
  FROM payments
  WHERE merchant_id = p_merchant_id
    AND status = 'completed'
    AND DATE(created_at) = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.3 updated_at 자동 업데이트 트리거

```sql
-- 공통 updated_at 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER tr_merchants_updated_at
  BEFORE UPDATE ON merchants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 3.4 결제 완료 시 원장 자동 기록

```sql
-- 결제 완료 시 ledger_entries 자동 생성
CREATE OR REPLACE FUNCTION on_payment_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_balance_before DECIMAL(20, 8);
  v_balance_after DECIMAL(20, 8);
BEGIN
  -- 완료 상태로 변경될 때만
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- 현재 잔액 조회
    v_balance_before := get_merchant_balance(NEW.merchant_id);
    v_balance_after := v_balance_before + NEW.net_amount;
    
    -- 입금 기록
    INSERT INTO ledger_entries (
      merchant_id, payment_id, type, amount, currency,
      balance_before, balance_after, description
    ) VALUES (
      NEW.merchant_id, NEW.id, 'payment_in', NEW.net_amount, NEW.currency,
      v_balance_before, v_balance_after,
      '결제 입금: ' || NEW.amount_krw || ' KRW'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_payment_completed
  AFTER UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION on_payment_completed();
```

---

## 4. Views

### 4.1 가맹점 대시보드 뷰

```sql
-- 가맹점 대시보드용 집계 뷰
CREATE VIEW v_merchant_dashboard AS
SELECT 
  m.id as merchant_id,
  m.name as merchant_name,
  
  -- 오늘 매출
  COALESCE(today.count, 0) as today_count,
  COALESCE(today.amount_krw, 0) as today_amount_krw,
  
  -- 이번 달 매출
  COALESCE(month.count, 0) as month_count,
  COALESCE(month.amount_krw, 0) as month_amount_krw,
  
  -- 현재 잔액
  get_merchant_balance(m.id) as current_balance,
  
  -- 대기 중 정산
  COALESCE(pending.amount, 0) as pending_settlement
  
FROM merchants m
LEFT JOIN (
  SELECT merchant_id, COUNT(*) as count, SUM(amount_krw) as amount_krw
  FROM payments
  WHERE status = 'completed' AND DATE(created_at) = CURRENT_DATE
  GROUP BY merchant_id
) today ON m.id = today.merchant_id
LEFT JOIN (
  SELECT merchant_id, COUNT(*) as count, SUM(amount_krw) as amount_krw
  FROM payments
  WHERE status = 'completed' 
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY merchant_id
) month ON m.id = month.merchant_id
LEFT JOIN (
  SELECT merchant_id, SUM(amount_crypto) as amount
  FROM settlements
  WHERE status = 'pending'
  GROUP BY merchant_id
) pending ON m.id = pending.merchant_id;
```

---

## 5. Migration Scripts

### 5.1 Initial Setup

```sql
-- 000_init.sql
-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 타임존 설정
SET timezone = 'Asia/Seoul';
```

### 5.2 마이그레이션 순서

```
migrations/
├── 000_init.sql
├── 001_create_users.sql
├── 002_create_merchants.sql
├── 003_create_merchant_users.sql
├── 004_create_payments.sql
├── 005_create_payment_logs.sql
├── 006_create_ledger_entries.sql
├── 007_create_settlements.sql
├── 008_create_refunds.sql
├── 009_create_qr_codes.sql
├── 010_create_exchange_rates.sql
├── 011_create_functions.sql
├── 012_create_triggers.sql
├── 013_create_views.sql
└── 014_create_rls_policies.sql
```

---

## 6. 데이터 복구 계획

### 6.1 백업 전략

```yaml
backup:
  type: "point-in-time recovery"
  provider: "Supabase (자동)"
  retention: 7 days (Pro plan)
  
  manual_exports:
    schedule: "daily at 3:00 AM KST"
    tables:
      - merchants
      - payments
      - ledger_entries
      - settlements
    format: "CSV + SQL dump"
    storage: "별도 S3 버킷"
```

### 6.2 복구 시나리오

| 시나리오 | RTO | RPO | 방법 |
|----------|-----|-----|------|
| 단일 레코드 삭제 | 30분 | 0 | Point-in-time recovery |
| 테이블 손상 | 1시간 | 1분 | Daily backup restore |
| 전체 DB 손실 | 4시간 | 1일 | Cross-region restore |

---

*문서 버전: 1.0*  
*최종 수정: 2026년 1월*
