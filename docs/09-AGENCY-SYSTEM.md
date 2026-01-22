# 09. Agency System Design

> 영업대행사(Agency) 시스템 설계 - PG사 BM 분석 기반

---

## 1. PG사 영업대행사 BM 분석

### 1.1 주요 PG사 대행사 구조

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PG사 영업대행사 수익 구조                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                  │
│  │   가맹점     │ ───► │    PG사     │ ───► │  카드사/은행 │                  │
│  │  (결제요청)  │      │  (중개)      │      │  (승인)      │                  │
│  └──────┬──────┘      └──────┬──────┘      └─────────────┘                  │
│         │                    │                                               │
│         │ 수수료 2.5%        │ 분배                                          │
│         ▼                    ▼                                               │
│  ┌────────────────────────────────────────┐                                  │
│  │              수수료 분배 구조           │                                  │
│  ├────────────────────────────────────────┤                                  │
│  │  카드사/은행    1.5% ~ 2.0%            │                                  │
│  │  PG사 마진     0.3% ~ 0.5%            │                                  │
│  │  영업대행사    0.1% ~ 0.3%  ◄── 핵심   │                                  │
│  └────────────────────────────────────────┘                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 토스페이먼츠 대행사 구조

| 구분 | 내용 |
|------|------|
| **대행사 등급** | 브론즈 → 실버 → 골드 → 플래티넘 |
| **수수료 쉐어** | 가맹점 수수료의 3~10% (등급별 차등) |
| **정산 주기** | 월 1회 (익월 15일) |
| **최소 요건** | 월 유치 가맹점 5개 이상 |
| **인센티브** | 분기 목표 달성 시 추가 보너스 |

### 1.3 나이스페이먼츠 대행사 구조

| 구분 | 내용 |
|------|------|
| **대행사 유형** | 직영 / 위탁 / 제휴 |
| **수수료 쉐어** | 기본 0.1% + 실적 인센티브 |
| **정산 주기** | 월 2회 (1일, 15일) |
| **관리 시스템** | 전용 파트너 포털 제공 |
| **교육** | 온/오프라인 교육 프로그램 |

### 1.4 KG이니시스 대행사 구조

| 구분 | 내용 |
|------|------|
| **대행사 모집** | 상시 모집 (심사 통과 시) |
| **수익 모델** | 가맹점 월 매출의 0.05~0.15% |
| **지원** | 영업 자료, 계약서, 기술지원 |
| **독점권** | 지역/업종별 독점권 계약 가능 |

---

## 2. Unify Pay 영업대행사 시스템 설계

### 2.1 대행사 계층 구조

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Unify Pay Agency 계층 구조                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                      ┌───────────────────┐                                   │
│                      │  Afformation 본사  │                                   │
│                      │   (Master Admin)   │                                   │
│                      └─────────┬─────────┘                                   │
│                                │                                             │
│          ┌─────────────────────┼─────────────────────┐                       │
│          ▼                     ▼                     ▼                       │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐                │
│  │ 총판 (Master)  │    │ 총판 (Master)  │    │ 총판 (Master)  │                │
│  │   서울권       │    │   경기권       │    │   부산권       │                │
│  └───────┬───────┘    └───────┬───────┘    └───────────────┘                │
│          │                    │                                              │
│    ┌─────┴─────┐        ┌─────┴─────┐                                       │
│    ▼           ▼        ▼           ▼                                       │
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                                     │
│ │ 대행사│  │ 대행사│  │ 대행사│  │ 대행사│                                     │
│ │강남팀 │  │서초팀 │  │분당팀 │  │수원팀 │                                     │
│ └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘                                     │
│    │         │         │         │                                          │
│    ▼         ▼         ▼         ▼                                          │
│ ┌──────────────────────────────────────┐                                    │
│ │           가맹점 (Merchants)          │                                    │
│ │  강남피부과, 압구정성형외과, ...       │                                    │
│ └──────────────────────────────────────┘                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 대행사 등급 체계

| 등급 | 조건 | 수수료 쉐어 | 혜택 |
|------|------|------------|------|
| **총판 (Master)** | 보증금 1억+ / 지역 독점 계약 | 30% | 하위 대행사 모집권, 지역 독점 |
| **플래티넘** | 월 GMV 50억+ | 25% | 전담 매니저, 마케팅 지원 |
| **골드** | 월 GMV 20억+ | 20% | 홍보물 지원, 교육 우선 |
| **실버** | 월 GMV 5억+ | 15% | 기본 영업 자료 |
| **브론즈** | 신규 가입 | 10% | 온라인 교육 |

### 2.3 수수료 분배 구조

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       수수료 분배 예시 (0.5% 기준)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   고객 결제: 100만원                                                         │
│   가맹점 수수료: 0.5% = 5,000원                                              │
│                                                                              │
│   ┌─────────────────────────────────────────┐                                │
│   │                분배                      │                                │
│   ├─────────────────────────────────────────┤                                │
│   │  Afformation 본사   70%   →  3,500원    │                                │
│   │  총판 (있는 경우)    10%   →    500원    │                                │
│   │  영업대행사         20%   →  1,000원    │                                │
│   └─────────────────────────────────────────┘                                │
│                                                                              │
│   ※ 총판 없이 본사 직영 대행사인 경우                                         │
│   ┌─────────────────────────────────────────┐                                │
│   │  Afformation 본사   80%   →  4,000원    │                                │
│   │  영업대행사         20%   →  1,000원    │                                │
│   └─────────────────────────────────────────┘                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 시스템 구성

### 3.1 서비스 구조

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Agency System Architecture                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        Frontend Services                             │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ 가맹점 랜딩   │  │ 가맹점 어드민 │  │  대행사 포털  │               │    │
│  │  │ Landing      │  │ Merchant     │  │  Agency      │  ← NEW        │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  │                                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐                                  │    │
│  │  │ 대행사 모집   │  │ 운영 어드민   │                                  │    │
│  │  │ Agency Apply │  │ Master Admin │  ← NEW                          │    │
│  │  └──────────────┘  └──────────────┘                                  │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        Backend Services                              │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ Payment API  │  │ Merchant API │  │  Agency API  │  ← NEW        │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  │                                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ Settlement   │  │ Commission   │  │  Report API  │  ← NEW        │    │
│  │  │     API      │  │     API      │  │              │               │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 대행사 포털 기능

```yaml
대행사_포털:
  대시보드:
    - 유치 가맹점 현황
    - 이번 달 GMV / 수수료 예상
    - 정산 예정 금액
    - 실시간 결제 알림

  가맹점_관리:
    - 신규 가맹점 등록/신청
    - 가맹점 상태 조회
    - 가맹점별 매출 현황
    - 가맹점 계약 관리

  정산_관리:
    - 수수료 정산 내역
    - 정산 예정 조회
    - 정산 히스토리
    - 세금계산서 발행

  리포트:
    - 월별 실적 리포트
    - 가맹점별 분석
    - 수수료 분석
    - Excel 다운로드

  설정:
    - 프로필 관리
    - 계좌 정보
    - 알림 설정
    - 직원 관리 (서브계정)
```

### 3.3 운영 어드민 기능 (본사용)

```yaml
운영_어드민:
  대행사_관리:
    - 대행사 신청 심사
    - 대행사 등급 관리
    - 대행사 계약 관리
    - 대행사 정지/해지

  총판_관리:
    - 총판 계약 관리
    - 지역 독점권 설정
    - 총판-대행사 연결

  정산_관리:
    - 전체 정산 현황
    - 대행사별 정산 승인
    - 자동 정산 설정
    - 정산 일괄 처리

  실적_분석:
    - 전체 GMV 현황
    - 대행사별 실적
    - 지역별 분석
    - 업종별 분석

  정책_관리:
    - 수수료율 설정
    - 등급 기준 설정
    - 인센티브 정책
```

---

## 4. 데이터베이스 스키마 확장

### 4.1 ERD 확장

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Agency System ERD Extension                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [신규 테이블]                                                                │
│                                                                              │
│  ┌──────────────────┐         ┌──────────────────┐                          │
│  │    agencies      │◄───────┤│  agency_users    │                          │
│  ├──────────────────┤    1:N  ├──────────────────┤                          │
│  │ id (PK)          │         │ agency_id (FK)   │                          │
│  │ parent_id (FK)   │←┐       │ user_id (FK)     │                          │
│  │ type             │ │       │ role             │                          │
│  │ tier             │ │       └──────────────────┘                          │
│  │ name             │ │                                                      │
│  │ commission_rate  │ │ self-ref (총판→대행사)                               │
│  │ status           │─┘                                                      │
│  │ contract_start   │                                                        │
│  │ contract_end     │         ┌──────────────────┐                          │
│  └────────┬─────────┘         │ agency_commissions│                          │
│           │                   ├──────────────────┤                          │
│           │ 1:N               │ id (PK)          │                          │
│           ▼                   │ agency_id (FK)   │◄── agencies              │
│  ┌──────────────────┐         │ merchant_id (FK) │◄── merchants             │
│  │    merchants     │         │ payment_id (FK)  │◄── payments              │
│  ├──────────────────┤         │ amount           │                          │
│  │ ...              │         │ status           │                          │
│  │ agency_id (FK) ◄─┼─────────│ settled_at       │                          │
│  │ ...              │         └──────────────────┘                          │
│  └──────────────────┘                                                        │
│                               ┌──────────────────┐                          │
│                               │agency_settlements│                          │
│                               ├──────────────────┤                          │
│                               │ id (PK)          │                          │
│                               │ agency_id (FK)   │◄── agencies              │
│                               │ period_start     │                          │
│                               │ period_end       │                          │
│                               │ total_gmv        │                          │
│                               │ commission_amount│                          │
│                               │ status           │                          │
│                               │ paid_at          │                          │
│                               └──────────────────┘                          │
│                                                                              │
│  [기존 테이블 수정]                                                           │
│  - merchants: agency_id 컬럼 추가                                            │
│  - users: role에 'agency_user' 추가                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 신규 테이블 정의

#### agencies (영업대행사)

```sql
-- 영업대행사 정보
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 계층 구조 (총판 → 대행사)
  parent_id UUID REFERENCES agencies(id), -- NULL이면 본사 직영
  
  -- 분류
  type VARCHAR(20) NOT NULL DEFAULT 'agency',
  -- 'master' (총판), 'agency' (일반 대행사)
  
  tier VARCHAR(20) NOT NULL DEFAULT 'bronze',
  -- 'platinum', 'gold', 'silver', 'bronze'
  
  -- 기본 정보
  name VARCHAR(100) NOT NULL,
  business_number VARCHAR(20) NOT NULL UNIQUE,
  representative_name VARCHAR(50) NOT NULL,
  
  -- 연락처
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  address TEXT,
  
  -- 계약 정보
  contract_start DATE NOT NULL,
  contract_end DATE,
  deposit_amount DECIMAL(15, 0) DEFAULT 0, -- 보증금
  
  -- 수수료 설정
  commission_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.10, -- 기본 10%
  -- 가맹점 수수료 중 대행사 몫 비율
  
  -- 독점권 (총판용)
  exclusive_region VARCHAR(50), -- '서울 강남구', '경기 성남시' 등
  exclusive_category VARCHAR(50), -- 'hospital', 'beauty' 등
  
  -- 정산 정보
  bank_name VARCHAR(50),
  bank_account VARCHAR(50), -- 암호화
  bank_holder VARCHAR(50),
  settlement_cycle VARCHAR(20) DEFAULT 'monthly', -- 'weekly', 'biweekly', 'monthly'
  
  -- 상태
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'active', 'suspended', 'terminated'
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  
  -- 제약조건
  CONSTRAINT valid_agency_type CHECK (type IN ('master', 'agency')),
  CONSTRAINT valid_agency_tier CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze')),
  CONSTRAINT valid_agency_status CHECK (status IN ('pending', 'active', 'suspended', 'terminated'))
);

-- 인덱스
CREATE INDEX idx_agencies_parent ON agencies(parent_id);
CREATE INDEX idx_agencies_type ON agencies(type);
CREATE INDEX idx_agencies_tier ON agencies(tier);
CREATE INDEX idx_agencies_status ON agencies(status);
CREATE INDEX idx_agencies_region ON agencies(exclusive_region);

-- RLS
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- 대행사 사용자는 자신의 대행사만 조회 가능
CREATE POLICY "Agency users can view own agency" ON agencies
  FOR SELECT USING (
    id IN (
      SELECT agency_id FROM agency_users 
      WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- 마스터 어드민은 모든 대행사 관리 가능
CREATE POLICY "Admins can manage all agencies" ON agencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );
```

#### agency_users (대행사-사용자 연결)

```sql
-- 대행사와 사용자의 연결
CREATE TABLE agency_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 대행사 내 역할
  role VARCHAR(20) NOT NULL DEFAULT 'staff',
  -- 'owner', 'manager', 'sales', 'staff'
  
  -- 권한
  permissions JSONB DEFAULT '{
    "view_dashboard": true,
    "manage_merchants": false,
    "view_commissions": false,
    "request_settlement": false,
    "manage_staff": false
  }',
  
  -- 상태
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agency_id, user_id)
);

-- 인덱스
CREATE INDEX idx_agency_users_agency ON agency_users(agency_id);
CREATE INDEX idx_agency_users_user ON agency_users(user_id);

-- RLS
ALTER TABLE agency_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their agency associations" ON agency_users
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );
```

#### agency_commissions (대행사 수수료)

```sql
-- 대행사 수수료 (결제별 발생)
CREATE TABLE agency_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 연결 정보
  agency_id UUID NOT NULL REFERENCES agencies(id),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  payment_id UUID NOT NULL REFERENCES payments(id),
  
  -- 금액 정보
  payment_amount_krw DECIMAL(15, 2) NOT NULL, -- 원래 결제 금액
  merchant_fee_amount DECIMAL(15, 2) NOT NULL, -- 가맹점 수수료
  commission_rate DECIMAL(5, 4) NOT NULL, -- 적용된 수수료율
  commission_amount DECIMAL(15, 2) NOT NULL, -- 대행사 수수료 (계산값)
  
  -- 상위 대행사 (총판) 수수료
  parent_agency_id UUID REFERENCES agencies(id),
  parent_commission_amount DECIMAL(15, 2) DEFAULT 0,
  
  -- 정산 상태
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'confirmed', 'settled', 'cancelled'
  
  settlement_id UUID REFERENCES agency_settlements(id),
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  
  -- 유니크 제약 (결제당 하나의 수수료)
  UNIQUE(payment_id, agency_id)
);

-- 인덱스
CREATE INDEX idx_agency_commissions_agency ON agency_commissions(agency_id);
CREATE INDEX idx_agency_commissions_merchant ON agency_commissions(merchant_id);
CREATE INDEX idx_agency_commissions_payment ON agency_commissions(payment_id);
CREATE INDEX idx_agency_commissions_status ON agency_commissions(status);
CREATE INDEX idx_agency_commissions_created ON agency_commissions(created_at DESC);

-- RLS
ALTER TABLE agency_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies can view own commissions" ON agency_commissions
  FOR SELECT USING (
    agency_id IN (
      SELECT agency_id FROM agency_users 
      WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );
```

#### agency_settlements (대행사 정산)

```sql
-- 대행사 정산 (기간별 일괄 정산)
CREATE TABLE agency_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id),
  
  -- 정산 기간
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- 집계 정보
  total_payments_count INTEGER NOT NULL DEFAULT 0,
  total_gmv DECIMAL(18, 2) NOT NULL DEFAULT 0, -- 총 거래액
  total_merchant_fee DECIMAL(18, 2) NOT NULL DEFAULT 0, -- 총 가맹점 수수료
  total_commission DECIMAL(18, 2) NOT NULL DEFAULT 0, -- 총 대행사 수수료
  
  -- 차감 항목
  deduction_amount DECIMAL(15, 2) DEFAULT 0, -- 차감액 (패널티 등)
  deduction_reason TEXT,
  
  -- 최종 정산액
  net_amount DECIMAL(18, 2) NOT NULL, -- 실 지급액
  
  -- 상태
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'confirmed', 'processing', 'completed', 'failed'
  
  -- 은행 이체 정보
  bank_name VARCHAR(50),
  bank_account VARCHAR(50),
  bank_holder VARCHAR(50),
  transfer_ref VARCHAR(100), -- 이체 확인 번호
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  -- 처리자
  processed_by UUID REFERENCES users(id)
);

-- 인덱스
CREATE INDEX idx_agency_settlements_agency ON agency_settlements(agency_id);
CREATE INDEX idx_agency_settlements_period ON agency_settlements(period_start, period_end);
CREATE INDEX idx_agency_settlements_status ON agency_settlements(status);

-- RLS
ALTER TABLE agency_settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies can view own settlements" ON agency_settlements
  FOR SELECT USING (
    agency_id IN (
      SELECT agency_id FROM agency_users 
      WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );
```

### 4.3 기존 테이블 수정

```sql
-- merchants 테이블에 agency_id 추가
ALTER TABLE merchants 
ADD COLUMN agency_id UUID REFERENCES agencies(id);

-- 인덱스 추가
CREATE INDEX idx_merchants_agency ON merchants(agency_id);

-- users 테이블 role 업데이트
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users 
ADD CONSTRAINT users_role_check CHECK (
  role IN ('admin', 'merchant_user', 'agency_user')
);
```

---

## 5. API 명세

### 5.1 대행사 API

```yaml
# Agency API Endpoints

# === 대행사 신청 ===
POST /api/v1/agencies/apply:
  description: 대행사 신청
  auth: public
  body:
    name: string
    business_number: string
    representative_name: string
    phone: string
    email: string
    address: string
    bank_name: string
    bank_account: string
    bank_holder: string
  response:
    agency_id: string
    status: "pending"

# === 대행사 정보 조회 ===
GET /api/v1/agencies/me:
  description: 내 대행사 정보
  auth: agency_user
  response:
    id: string
    name: string
    type: string
    tier: string
    commission_rate: number
    status: string
    stats:
      total_merchants: number
      active_merchants: number
      monthly_gmv: number
      pending_commission: number

# === 대행사 가맹점 목록 ===
GET /api/v1/agencies/merchants:
  description: 대행사가 유치한 가맹점 목록
  auth: agency_user
  query:
    status: string (optional)
    page: number
    limit: number
  response:
    merchants: Merchant[]
    pagination: { total, page, limit }

# === 가맹점 등록 (대행사용) ===
POST /api/v1/agencies/merchants:
  description: 대행사가 가맹점 등록
  auth: agency_user
  body:
    name: string
    business_number: string
    representative_name: string
    category: string
    phone: string
    email: string
    address: string
  response:
    merchant_id: string
    status: "pending"

# === 수수료 내역 조회 ===
GET /api/v1/agencies/commissions:
  description: 수수료 발생 내역
  auth: agency_user
  query:
    start_date: date
    end_date: date
    status: string
    merchant_id: string (optional)
  response:
    commissions: Commission[]
    summary:
      total_count: number
      total_gmv: number
      total_commission: number

# === 정산 내역 조회 ===
GET /api/v1/agencies/settlements:
  description: 정산 히스토리
  auth: agency_user
  response:
    settlements: Settlement[]
    next_settlement:
      period_start: date
      period_end: date
      estimated_amount: number

# === 정산 상세 조회 ===
GET /api/v1/agencies/settlements/{id}:
  description: 정산 상세 정보
  auth: agency_user
  response:
    id: string
    period_start: date
    period_end: date
    total_gmv: number
    total_commission: number
    net_amount: number
    status: string
    commissions: Commission[]
```

### 5.2 운영 어드민 API

```yaml
# Master Admin API Endpoints

# === 대행사 목록 (어드민) ===
GET /api/v1/admin/agencies:
  description: 전체 대행사 목록
  auth: admin
  query:
    type: string (master/agency)
    tier: string
    status: string
    search: string
  response:
    agencies: Agency[]

# === 대행사 상세 (어드민) ===
GET /api/v1/admin/agencies/{id}:
  description: 대행사 상세 정보
  auth: admin
  response:
    agency: Agency
    merchants: Merchant[]
    commissions_summary: object
    settlements: Settlement[]

# === 대행사 심사 ===
POST /api/v1/admin/agencies/{id}/review:
  description: 대행사 신청 심사
  auth: admin
  body:
    action: "approve" | "reject"
    tier: string (approve시)
    commission_rate: number (approve시)
    reject_reason: string (reject시)
  response:
    agency: Agency

# === 대행사 등급 변경 ===
PATCH /api/v1/admin/agencies/{id}/tier:
  description: 대행사 등급 변경
  auth: admin
  body:
    tier: string
    commission_rate: number
    reason: string
  response:
    agency: Agency

# === 대행사 정산 승인 ===
POST /api/v1/admin/agencies/settlements/{id}/approve:
  description: 정산 승인 및 처리
  auth: admin
  body:
    deduction_amount: number (optional)
    deduction_reason: string (optional)
  response:
    settlement: Settlement

# === 일괄 정산 생성 ===
POST /api/v1/admin/agencies/settlements/batch:
  description: 기간별 일괄 정산 생성
  auth: admin
  body:
    period_start: date
    period_end: date
    agency_ids: string[] (optional, 없으면 전체)
  response:
    created_count: number
    settlements: Settlement[]

# === 전체 실적 분석 ===
GET /api/v1/admin/analytics/agencies:
  description: 대행사 실적 분석
  auth: admin
  query:
    period: "daily" | "weekly" | "monthly"
    start_date: date
    end_date: date
  response:
    summary:
      total_agencies: number
      total_merchants: number
      total_gmv: number
      total_commission: number
    by_tier: object[]
    by_region: object[]
    top_agencies: object[]
```

---

*다음 파일에서 계속: 10-AGENCY-UI-PROTOTYPE.md*

---

*문서 버전: 1.0*  
*최종 수정: 2026년 1월*
