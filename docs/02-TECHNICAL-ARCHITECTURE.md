# 02. Technical Architecture

> LINE Unify Pay - 시스템 아키텍처 설계

---

## 1. 시스템 개요

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LINE Unify Pay Architecture                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │   Customer   │     │  Merchant   │     │   Admin     │                    │
│  │  (LINE App)  │     │   (Web)     │     │   (Web)     │                    │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                    │
│         │                   │                   │                            │
│  ═══════╪═══════════════════╪═══════════════════╪════════════════════════   │
│         │              HTTPS/WSS                │                            │
│  ═══════╪═══════════════════╪═══════════════════╪════════════════════════   │
│         │                   │                   │                            │
│         ▼                   ▼                   ▼                            │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                        API Gateway (Vercel)                      │        │
│  │                    Rate Limiting / Auth / Routing                │        │
│  └───────────────────────────────┬─────────────────────────────────┘        │
│                                  │                                           │
│         ┌────────────────────────┼────────────────────────┐                 │
│         │                        │                        │                 │
│         ▼                        ▼                        ▼                 │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐          │
│  │  Payment    │          │  Merchant   │          │  Settlement │          │
│  │  Service    │          │  Service    │          │  Service    │          │
│  └──────┬──────┘          └──────┬──────┘          └──────┬──────┘          │
│         │                        │                        │                 │
│  ═══════╪════════════════════════╪════════════════════════╪════════════════ │
│         │                   Data Layer                    │                 │
│  ═══════╪════════════════════════╪════════════════════════╪════════════════ │
│         │                        │                        │                 │
│         ▼                        ▼                        ▼                 │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐          │
│  │  Supabase   │          │   Upstash   │          │    Kaia     │          │
│  │ (PostgreSQL)│          │   (Redis)   │          │ (Blockchain)│          │
│  └─────────────┘          └─────────────┘          └─────────────┘          │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                     External Services                            │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │        │
│  │  │  LINE    │  │  Kaia    │  │ Exchange │  │  Push    │        │        │
│  │  │  Unify   │  │  SDK     │  │  Rate    │  │  (FCM)   │        │        │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 기술 스택

| Layer | Technology | 선택 이유 |
|-------|-----------|----------|
| **Frontend** | Next.js 14 (App Router) | 바이브코딩 내재화, SSR/SSG |
| **Backend** | Next.js API Routes | 풀스택 통합, Serverless |
| **Database** | Supabase (PostgreSQL) | RLS, Realtime, Auth 내장 |
| **Cache** | Upstash (Redis) | Serverless Redis, 글로벌 |
| **Blockchain** | Kaia Network | LINE/Kakao 생태계, 1초 블록 |
| **Hosting** | Vercel | Next.js 최적화, Edge Functions |
| **Push** | Firebase Cloud Messaging | 크로스 플랫폼 |

---

## 2. 서비스 아키텍처

### 2.1 서비스 분해

```
┌─────────────────────────────────────────────────────────────────┐
│                        Services Overview                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Payment Service                       │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │
│  │  │  QR Gen  │ │ Tx Create│ │ Tx Verify│ │ Callback │   │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Merchant Service                       │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │
│  │  │ Onboard  │ │  Profile │ │  Wallet  │ │   Staff  │   │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Settlement Service                      │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │
│  │  │  Ledger  │ │   Swap   │ │ Withdraw │ │  Report  │   │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Notification Service                    │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │
│  │  │   Push   │ │   SMS    │ │  Email   │ │ In-App   │   │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Payment Service 상세

```
Payment Flow (내부 처리)
━━━━━━━━━━━━━━━━━━━━━━━━

1. QR 스캔 → 결제 요청
   ┌─────────────────────────────────────────────────────────┐
   │  POST /api/v1/payments/initiate                         │
   │  {                                                       │
   │    "merchant_id": "M_ABC123",                            │
   │    "amount_krw": 150000,                                 │
   │    "currency": "USDT",                                   │
   │    "customer_wallet": "0xABC..."                         │
   │  }                                                       │
   └─────────────────────────────────────────────────────────┘
                           │
                           ▼
   ┌─────────────────────────────────────────────────────────┐
   │  1. 중복 결제 체크 (Upstash Lock)                        │
   │  2. 환율 조회 (Upstash Cache)                            │
   │  3. Payment Record 생성 (Supabase - PENDING)             │
   │  4. 트랜잭션 생성 요청 (Kaia SDK)                         │
   └─────────────────────────────────────────────────────────┘
                           │
                           ▼
2. 블록체인 트랜잭션 전송 (LINE Unify 처리)
   ┌─────────────────────────────────────────────────────────┐
   │  - 고객 지갑 → 가맹점 지갑                               │
   │  - Kaia Network에서 트랜잭션 확정 (1-2초)                 │
   │  - Tx Hash 반환                                          │
   └─────────────────────────────────────────────────────────┘
                           │
                           ▼
3. 콜백 수신 & 상태 업데이트
   ┌─────────────────────────────────────────────────────────┐
   │  POST /api/v1/payments/callback                         │
   │  {                                                       │
   │    "payment_id": "PAY_XYZ",                              │
   │    "tx_hash": "0x123...",                                │
   │    "status": "CONFIRMED",                                │
   │    "block_number": 12345678                              │
   │  }                                                       │
   └─────────────────────────────────────────────────────────┘
                           │
                           ▼
   ┌─────────────────────────────────────────────────────────┐
   │  1. Payment 상태 업데이트 (PENDING → COMPLETED)          │
   │  2. Ledger Entry 생성                                    │
   │  3. 가맹점 알림 발송 (Push)                               │
   │  4. 고객 영수증 발송 (LINE Message)                       │
   └─────────────────────────────────────────────────────────┘
```

---

## 3. 데이터 아키텍처

### 3.1 Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Data Flow                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Write Path                        Read Path                         │
│  ══════════                        ═════════                         │
│                                                                      │
│  [Payment Request]                 [Dashboard Query]                 │
│         │                                │                           │
│         ▼                                ▼                           │
│  ┌─────────────┐                  ┌─────────────┐                   │
│  │   Upstash   │ ◄──── cache ────│   Upstash   │                   │
│  │   (Lock)    │                  │  (Cache)    │                   │
│  └──────┬──────┘                  └──────┬──────┘                   │
│         │                                │ miss                      │
│         ▼                                ▼                           │
│  ┌─────────────┐                  ┌─────────────┐                   │
│  │  Supabase   │ ◄──── write ────│  Supabase   │                   │
│  │ (PostgreSQL)│                  │ (PostgreSQL)│                   │
│  └──────┬──────┘                  └─────────────┘                   │
│         │                                                            │
│         │ webhook                                                    │
│         ▼                                                            │
│  ┌─────────────┐                                                    │
│  │    Kaia     │ ◄──── Source of Truth (Tx Hash)                    │
│  │ (Blockchain)│                                                    │
│  └─────────────┘                                                    │
│                                                                      │
│  Truth Hierarchy:                                                    │
│  1. Kaia Blockchain (최종 확정)                                      │
│  2. Supabase (비즈니스 로직)                                         │
│  3. Upstash (성능 최적화)                                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Caching Strategy (Upstash)

```typescript
// cache-keys.ts
const CACHE_KEYS = {
  // 환율 캐시 (TTL: 30초)
  EXCHANGE_RATE: (currency: string) => `rate:${currency}`,
  
  // 가맹점 정보 캐시 (TTL: 5분)
  MERCHANT: (id: string) => `merchant:${id}`,
  
  // 결제 중복 방지 락 (TTL: 10초)
  PAYMENT_LOCK: (customerId: string, merchantId: string) => 
    `lock:pay:${customerId}:${merchantId}`,
  
  // 일일 매출 집계 (TTL: 1시간)
  DAILY_REVENUE: (merchantId: string, date: string) => 
    `revenue:${merchantId}:${date}`,
  
  // 세션 정보 (TTL: 24시간)
  SESSION: (sessionId: string) => `session:${sessionId}`,
};
```

```typescript
// rate-limiter.ts (Upstash)
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 분당 100회
  analytics: true,
});

// 결제 API Rate Limit
export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  return { success, limit, reset, remaining };
}
```

### 3.3 Realtime Updates (Supabase)

```typescript
// realtime-subscription.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 가맹점 결제 실시간 구독
function subscribeToPayments(merchantId: string) {
  return supabase
    .channel(`payments:${merchantId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'payments',
        filter: `merchant_id=eq.${merchantId}`,
      },
      (payload) => {
        console.log('New payment:', payload.new);
        // 알림 사운드 재생
        // UI 업데이트
      }
    )
    .subscribe();
}
```

---

## 4. 보안 아키텍처

### 4.1 인증/인가 흐름

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [가맹점 로그인]                                                      │
│        │                                                             │
│        ▼                                                             │
│  ┌───────────────┐         ┌───────────────┐                        │
│  │  Login Page   │ ──────► │  Supabase     │                        │
│  │  (Email/PW)   │         │  Auth         │                        │
│  └───────────────┘         └───────┬───────┘                        │
│                                    │                                 │
│                                    ▼                                 │
│                            ┌───────────────┐                        │
│                            │  JWT Token    │                        │
│                            │  + Refresh    │                        │
│                            └───────┬───────┘                        │
│                                    │                                 │
│        ┌───────────────────────────┼───────────────────────────┐    │
│        │                           │                           │    │
│        ▼                           ▼                           ▼    │
│  ┌───────────┐              ┌───────────┐              ┌───────────┐│
│  │  Owner    │              │  Manager  │              │  Staff    ││
│  │  (Full)   │              │ (Limited) │              │  (View)   ││
│  └───────────┘              └───────────┘              └───────────┘│
│                                                                      │
│  Role-Based Access Control (RBAC):                                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Role    │ 결제조회 │ 환불 │ 정산출금 │ 설정변경 │ 직원관리 │   │
│  ├─────────┼─────────┼──────┼──────────┼──────────┼──────────┤   │
│  │ Owner   │    ✓    │  ✓   │    ✓     │    ✓     │    ✓     │   │
│  │ Manager │    ✓    │  ✓   │    ✗     │    ✗     │    ✗     │   │
│  │ Staff   │    ✓    │  ✗   │    ✗     │    ✗     │    ✗     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 API 보안

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // 1. Rate Limiting
  const rateLimitResult = await checkRateLimit(
    request.ip ?? 'anonymous'
  );
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // 2. JWT Verification
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const payload = await verifyJWT(token);
    // 요청에 사용자 정보 추가
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub);
    requestHeaders.set('x-merchant-id', payload.merchant_id);
    requestHeaders.set('x-user-role', payload.role);
    
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: '/api/v1/:path*',
};
```

### 4.3 데이터 암호화

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Encryption Strategy                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  At Rest (저장 시):                                                   │
│  ├── Supabase: AES-256 (PostgreSQL native encryption)               │
│  ├── 민감 필드: pgcrypto 활용 추가 암호화                             │
│  │   - wallet_address (표시용 마스킹)                                 │
│  │   - bank_account (암호화 저장)                                     │
│  └── 백업: 암호화된 상태로 저장                                       │
│                                                                      │
│  In Transit (전송 시):                                                │
│  ├── HTTPS (TLS 1.3)                                                 │
│  ├── WebSocket: WSS                                                  │
│  └── API: Certificate Pinning (모바일)                               │
│                                                                      │
│  Blockchain:                                                         │
│  ├── Private Key: LINE Unify 내부 관리 (우리 측 미보유)              │
│  ├── Tx Signing: Unify SDK 위임                                      │
│  └── Tx Verification: Kaia RPC                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. 인프라 아키텍처

### 5.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Vercel Deployment                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Vercel Edge Network                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │  Seoul   │  │  Tokyo   │  │ Singapore│  │  Taiwan  │    │    │
│  │  │  Edge    │  │  Edge    │  │  Edge    │  │  Edge    │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Vercel Serverless                         │    │
│  │  ┌────────────────┐  ┌────────────────┐                     │    │
│  │  │  API Routes    │  │  SSR Pages     │                     │    │
│  │  │  (Functions)   │  │  (Functions)   │                     │    │
│  │  └────────────────┘  └────────────────┘                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│         ┌────────────────────┼────────────────────┐                 │
│         │                    │                    │                 │
│         ▼                    ▼                    ▼                 │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐         │
│  │  Supabase   │      │   Upstash   │      │    Kaia     │         │
│  │  (AWS ap-   │      │  (Global)   │      │   (Global)  │         │
│  │  northeast) │      │             │      │             │         │
│  └─────────────┘      └─────────────┘      └─────────────┘         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 환경 분리

```
Environments:
├── development (dev.unifypay.kr)
│   ├── Supabase: dev project
│   ├── Kaia: Testnet (Kairos)
│   └── Branch: develop
│
├── staging (staging.unifypay.kr)
│   ├── Supabase: staging project
│   ├── Kaia: Testnet (Kairos)
│   └── Branch: main (preview)
│
└── production (unifypay.kr)
    ├── Supabase: prod project
    ├── Kaia: Mainnet
    └── Branch: main (production)
```

### 5.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  deploy-preview:
    needs: test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 6. 모니터링 & 로깅

### 6.1 Observability Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Observability Architecture                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                        Metrics                               │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │    │
│  │  │  Vercel  │  │ Supabase │  │  Upstash │                   │    │
│  │  │ Analytics│  │  Metrics │  │  Metrics │                   │    │
│  │  └──────────┘  └──────────┘  └──────────┘                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                        Logging                               │    │
│  │  ┌──────────────────────────────────────────────────────┐   │    │
│  │  │                    Vercel Logs                        │   │    │
│  │  │  - Function invocations                               │   │    │
│  │  │  - Error traces                                       │   │    │
│  │  │  - Performance metrics                                │   │    │
│  │  └──────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                       Alerting                               │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │    │
│  │  │  Slack   │  │  Email   │  │  PagerDuty│                  │    │
│  │  │  #alerts │  │  ops@    │  │  (Future) │                  │    │
│  │  └──────────┘  └──────────┘  └──────────┘                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 핵심 메트릭

```typescript
// 비즈니스 메트릭
const BUSINESS_METRICS = {
  // 결제
  'payment.initiated': 'counter',
  'payment.completed': 'counter',
  'payment.failed': 'counter',
  'payment.amount': 'histogram',
  'payment.latency': 'histogram',
  
  // 정산
  'settlement.requested': 'counter',
  'settlement.completed': 'counter',
  'settlement.amount': 'histogram',
  
  // 가맹점
  'merchant.signup': 'counter',
  'merchant.active': 'gauge',
};

// 시스템 메트릭
const SYSTEM_METRICS = {
  'api.latency': 'histogram',
  'api.error_rate': 'counter',
  'db.query_time': 'histogram',
  'cache.hit_rate': 'gauge',
  'blockchain.tx_time': 'histogram',
};
```

### 6.3 Alert Rules

```yaml
# alert-rules.yml
alerts:
  - name: payment_failure_rate_high
    condition: rate(payment.failed) / rate(payment.initiated) > 0.05
    duration: 5m
    severity: critical
    notify: [slack, email, phone]
    
  - name: api_latency_high
    condition: p95(api.latency) > 2000ms
    duration: 10m
    severity: warning
    notify: [slack]
    
  - name: blockchain_tx_slow
    condition: p95(blockchain.tx_time) > 10s
    duration: 5m
    severity: warning
    notify: [slack]
```

---

## 7. 확장성 고려사항

### 7.1 수평 확장

```
현재 (MVP):
├── Vercel Serverless: 자동 확장
├── Supabase: Pro Plan (커넥션 풀링)
└── Upstash: Pay-as-you-go

성장기 (100+ 가맹점):
├── Supabase: Connection Pooling (PgBouncer)
├── Read Replicas 고려
└── Upstash: Regional Replication

확장기 (500+ 가맹점):
├── 마이크로서비스 분리 검토
├── 전용 Kaia 노드 운영 검토
└── CDN 최적화 (Static Assets)
```

### 7.2 성능 최적화 포인트

```typescript
// 1. 환율 캐싱 (Upstash)
const getExchangeRate = async (currency: string) => {
  const cached = await redis.get(`rate:${currency}`);
  if (cached) return JSON.parse(cached);
  
  const rate = await fetchExternalRate(currency);
  await redis.setex(`rate:${currency}`, 30, JSON.stringify(rate)); // 30초 캐시
  return rate;
};

// 2. 가맹점 정보 캐싱
const getMerchant = async (id: string) => {
  const cached = await redis.get(`merchant:${id}`);
  if (cached) return JSON.parse(cached);
  
  const merchant = await supabase
    .from('merchants')
    .select('*')
    .eq('id', id)
    .single();
  
  await redis.setex(`merchant:${id}`, 300, JSON.stringify(merchant.data)); // 5분 캐시
  return merchant.data;
};

// 3. 대시보드 집계 캐싱
const getDailyRevenue = async (merchantId: string, date: string) => {
  const cacheKey = `revenue:${merchantId}:${date}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const result = await supabase.rpc('calculate_daily_revenue', {
    p_merchant_id: merchantId,
    p_date: date,
  });
  
  // 오늘 데이터는 짧게, 과거 데이터는 길게 캐시
  const ttl = date === today() ? 60 : 3600;
  await redis.setex(cacheKey, ttl, JSON.stringify(result.data));
  return result.data;
};
```

---

*문서 버전: 1.0*  
*최종 수정: 2026년 1월*
