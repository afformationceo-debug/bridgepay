# 05. Kaia SDK/API Request

> 카이아재단에 요청할 SDK/API 명세서

---

## 1. 요청 개요

### 1.1 프로젝트 소개

**회사명:** Afformation (어포메이션)  
**프로젝트:** LINE Unify Pay - 한국 가맹점 결제 시스템  
**역할:** 한국 병원/뷰티 매장 독점 파트너  

### 1.2 비즈니스 컨텍스트

```
┌─────────────────────────────────────────────────────────────────┐
│                    우리의 역할 및 요청 배경                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LINE Unify 생태계                                               │
│  ├── Kaia Foundation: 블록체인 인프라 + SDK                      │
│  ├── LINE NEXT: Unify 앱 + 고객 지갑                            │
│  └── Afformation (우리): 한국 가맹점 온보딩 + 어드민 시스템        │
│                                                                  │
│  우리가 개발해야 할 것:                                           │
│  1. 가맹점 유치 랜딩페이지                                        │
│  2. 가맹점 어드민 대시보드                                        │
│  3. QR 코드 결제 연동                                            │
│  4. 정산 관리 시스템                                              │
│                                                                  │
│  카이아에게 필요한 것:                                            │
│  - 결제 트랜잭션 생성/조회 SDK                                    │
│  - 지갑 주소 생성/관리 API                                        │
│  - 실시간 이벤트 웹훅                                             │
│  - 환율 조회 API                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 필요 SDK/API 목록

### 2.1 우선순위 매트릭스

| 우선순위 | 기능 | 필수 여부 | MVP 포함 |
|---------|------|----------|----------|
| P0 | 결제 트랜잭션 생성 | 필수 | ✅ |
| P0 | 트랜잭션 상태 조회 | 필수 | ✅ |
| P0 | 결제 완료 웹훅 | 필수 | ✅ |
| P0 | 가맹점 지갑 주소 생성 | 필수 | ✅ |
| P1 | 환율 조회 | 필수 | ✅ |
| P1 | 잔액 조회 | 필수 | ✅ |
| P2 | 환불 트랜잭션 | 필수 | Phase 2 |
| P2 | 정산(출금) 트랜잭션 | 필수 | Phase 2 |
| P3 | 고객 결제 QR 스캔 SDK | 선택 | - |

---

## 3. 상세 API 요청 명세

### 3.1 [P0] 결제 트랜잭션 생성

**목적:** 고객이 QR 스캔 후 결제를 실행할 때, 블록체인 트랜잭션을 생성

**우리 시스템 → Kaia/Unify**

```typescript
// 요청 인터페이스 (우리가 보내는 것)
interface CreatePaymentRequest {
  // 가맹점 정보
  merchant_id: string;           // 우리 시스템의 가맹점 ID
  merchant_wallet: string;       // 가맹점 지갑 주소 (0x...)
  
  // 결제 정보
  amount: string;                // 금액 (wei 단위)
  currency: 'USDT' | 'JPYT' | 'TWDT';  // 토큰 종류
  
  // 고객 정보
  customer_wallet: string;       // 고객 지갑 주소
  
  // 메타데이터
  reference_id: string;          // 우리 시스템의 결제 ID (콜백용)
  memo?: string;                 // 결제 메모
  
  // 콜백
  callback_url: string;          // 완료 시 호출할 URL
}

// 응답 인터페이스 (카이아에서 받는 것)
interface CreatePaymentResponse {
  success: boolean;
  data: {
    transaction_id: string;      // Kaia 트랜잭션 ID
    payment_url?: string;        // 결제 딥링크 (LINE 앱 연동)
    qr_data?: string;            // 결제 QR 데이터
    expires_at: string;          // 만료 시간
    status: 'pending' | 'awaiting_signature';
  };
}
```

**질문:**
1. LINE Unify 앱에서 결제 승인하는 플로우는 어떻게 되나요?
2. 결제 요청 후 고객에게 푸시 알림이 가나요, 아니면 딥링크로 연결해야 하나요?
3. `payment_url`이 제공된다면 웹뷰로 열어야 하나요?

---

### 3.2 [P0] 트랜잭션 상태 조회

**목적:** 결제 진행 상태를 폴링하거나 대시보드에 표시

```typescript
// 요청
interface GetTransactionRequest {
  transaction_id: string;        // Kaia 트랜잭션 ID
  // 또는
  reference_id: string;          // 우리 결제 ID
}

// 응답
interface GetTransactionResponse {
  success: boolean;
  data: {
    transaction_id: string;
    reference_id: string;
    status: TransactionStatus;
    tx_hash?: string;            // 블록체인 Tx Hash (확정 후)
    block_number?: number;
    confirmed_at?: string;
    error?: {
      code: string;
      message: string;
    };
  };
}

type TransactionStatus = 
  | 'pending'           // 생성됨, 고객 승인 대기
  | 'processing'        // 고객 승인 완료, 블록체인 전송 중
  | 'confirming'        // 블록체인 전송 완료, 컨펌 대기
  | 'completed'         // 완료
  | 'failed'            // 실패
  | 'expired'           // 만료
  | 'cancelled';        // 취소
```

**질문:**
1. 상태 폴링 권장 주기는 얼마인가요?
2. `confirming` 상태에서 몇 블록 확인 후 `completed`가 되나요?

---

### 3.3 [P0] 결제 완료 웹훅

**목적:** 결제 완료 시 우리 서버로 즉시 알림

**Kaia/Unify → 우리 시스템**

```typescript
// 웹훅 페이로드 (카이아에서 보내주는 것)
interface PaymentWebhookPayload {
  event_type: 'payment.completed' | 'payment.failed' | 'payment.expired';
  timestamp: string;
  data: {
    transaction_id: string;
    reference_id: string;        // 우리 결제 ID
    tx_hash: string;
    block_number: number;
    status: 'completed' | 'failed';
    amount: string;
    currency: string;
    merchant_wallet: string;
    customer_wallet: string;
    fee_paid?: string;           // 가스비 (누가 부담?)
  };
  signature: string;             // 검증용 서명
}
```

**요청사항:**
1. 웹훅 서명 검증 방법 문서화
2. 웹훅 재시도 정책 (몇 번, 어떤 간격으로?)
3. 테스트넷에서 웹훅 테스트 도구

---

### 3.4 [P0] 가맹점 지갑 주소 생성

**목적:** 가맹점 가입 시 전용 수신 지갑 생성

```typescript
// 요청
interface CreateMerchantWalletRequest {
  merchant_id: string;           // 우리 시스템의 가맹점 ID
  merchant_name: string;
  callback_url: string;          // 입금 알림용
}

// 응답
interface CreateMerchantWalletResponse {
  success: boolean;
  data: {
    wallet_address: string;      // 0x...
    wallet_id: string;           // Kaia 지갑 ID
    network: 'kaia' | 'kaia_testnet';
  };
}
```

**질문:**
1. 지갑은 EOA인가요, Contract Wallet인가요?
2. Private Key는 어디서 관리되나요? (Unify 내부? MPC?)
3. 가맹점이 직접 지갑을 출금하려면 어떻게 해야 하나요?

---

### 3.5 [P1] 환율 조회

**목적:** 결제 시 실시간 환율 표시

```typescript
// 요청
interface GetExchangeRateRequest {
  from_currency: 'JPY' | 'TWD' | 'USD';
  to_currency: 'USDT' | 'KRW';
}

// 응답
interface GetExchangeRateResponse {
  success: boolean;
  data: {
    from_currency: string;
    to_currency: string;
    rate: string;                // "0.0067" (1 JPY = 0.0067 USDT)
    inverse_rate: string;        // "149.25" (1 USDT = 149.25 JPY)
    source: string;              // 환율 소스
    updated_at: string;
    valid_until: string;         // 이 환율 유효 기간
  };
}
```

**질문:**
1. 환율 갱신 주기는 얼마인가요?
2. 환율 슬리피지 허용 범위는?
3. 환율이 변동해도 결제가 보장되나요?

---

### 3.6 [P1] 잔액 조회

**목적:** 가맹점 대시보드에서 현재 잔액 표시

```typescript
// 요청
interface GetBalanceRequest {
  wallet_address: string;
}

// 응답
interface GetBalanceResponse {
  success: boolean;
  data: {
    balances: Array<{
      currency: string;          // 'USDT', 'KAIA', etc.
      amount: string;            // wei 단위
      amount_display: string;    // "1500.50"
    }>;
    updated_at: string;
  };
}
```

---

### 3.7 [P2] 환불 트랜잭션

**목적:** 결제 환불 처리

```typescript
// 요청
interface CreateRefundRequest {
  original_transaction_id: string;
  reference_id: string;          // 우리 환불 ID
  amount: string;                // 환불 금액 (부분 환불 가능?)
  reason: string;
  callback_url: string;
}

// 응답
interface CreateRefundResponse {
  success: boolean;
  data: {
    refund_transaction_id: string;
    status: 'pending' | 'processing';
  };
}
```

**질문:**
1. 부분 환불이 가능한가요?
2. 환불 시 가스비는 누가 부담하나요?
3. 환불 가능 기간 제한이 있나요?

---

### 3.8 [P2] 정산(출금) 트랜잭션

**목적:** 가맹점이 잔액을 출금 (원화 또는 USDT)

```typescript
// 요청
interface CreateWithdrawalRequest {
  wallet_address: string;        // 출금 원본 지갑
  amount: string;
  currency: string;
  destination_type: 'external_wallet' | 'bank_account';
  destination: {
    // external_wallet인 경우
    wallet_address?: string;
    // bank_account인 경우
    bank_code?: string;
    account_number?: string;
    holder_name?: string;
  };
  reference_id: string;
  callback_url: string;
}

// 응답
interface CreateWithdrawalResponse {
  success: boolean;
  data: {
    withdrawal_id: string;
    estimated_amount_krw?: string;  // 원화 출금 시
    exchange_rate?: string;
    fee_amount: string;
    status: 'pending';
    estimated_completion: string;
  };
}
```

**질문:**
1. 원화 출금 시 환전은 Unify 내부에서 처리되나요?
2. 은행 이체 지원 은행 목록은?
3. 최소/최대 출금 금액 제한은?

---

## 4. 테스트 환경 요청

### 4.1 테스트넷 접근

```yaml
요청 항목:
  - 테스트넷(Kairos) RPC 엔드포인트
  - 테스트넷 Explorer URL
  - 테스트 토큰(USDT) Faucet
  - 테스트 지갑 생성 방법
```

### 4.2 샌드박스 API

```yaml
요청 항목:
  - 샌드박스 API 엔드포인트
  - 테스트용 API Key
  - 웹훅 테스트 도구 (시뮬레이터)
  - 테스트 결제 시나리오 문서
```

### 4.3 개발 문서

```yaml
요청 항목:
  - SDK 설치 및 초기화 가이드
  - API 레퍼런스 문서
  - 에러 코드 목록
  - 베스트 프랙티스 가이드
  - 샘플 코드 (TypeScript/JavaScript)
```

---

## 5. 기술 질문 목록

### 5.1 아키텍처 관련

| # | 질문 | 답변 대기 |
|---|------|----------|
| 1 | LINE Unify SDK는 별도인가요, WalletConnect 기반인가요? | |
| 2 | 가맹점 지갑의 Private Key 관리 방식은? | |
| 3 | 트랜잭션 서명은 어디서 발생하나요? | |
| 4 | 멀티시그 또는 MPC 지원 여부? | |

### 5.2 결제 플로우 관련

| # | 질문 | 답변 대기 |
|---|------|----------|
| 5 | 고객이 결제 승인하는 UX는 어떻게 되나요? | |
| 6 | 결제 금액은 고객이 입력 vs 우리가 지정? | |
| 7 | 결제 만료 시간 기본값 및 커스텀 가능 여부? | |
| 8 | 동일 고객의 동시 다중 결제 처리 방식? | |

### 5.3 정산 관련

| # | 질문 | 답변 대기 |
|---|------|----------|
| 9 | 가맹점 잔액의 Source of Truth는 어디인가요? | |
| 10 | 원화 환전 → 계좌 이체 전체 플로우? | |
| 11 | 정산 수수료 구조는? | |
| 12 | 자동 정산 설정 API 지원 여부? | |

### 5.4 보안 관련

| # | 질문 | 답변 대기 |
|---|------|----------|
| 13 | 웹훅 서명 알고리즘 및 검증 방법? | |
| 14 | API Key 발급 및 관리 방법? | |
| 15 | Rate Limiting 정책? | |
| 16 | IP Whitelist 설정 가능 여부? | |

---

## 6. 일정 및 마일스톤

### 6.1 우리 개발 일정

```
2026년 1월 4주: 설계 완료 & SDK 연동 테스트
2026년 2월 2주: MVP 개발 (결제 기본 플로우)
2026년 2월 4주: 파트너 병원 파일럿
2026년 3월 1주: 정식 런칭
```

### 6.2 카이아 협조 요청 일정

| 요청 항목 | 희망 제공 일자 | 우선순위 |
|----------|--------------|----------|
| 테스트넷 접근 정보 | 2026-01-25 | P0 |
| SDK 문서 & 샘플 코드 | 2026-01-27 | P0 |
| 결제 API 명세 확정 | 2026-01-30 | P0 |
| 웹훅 테스트 환경 | 2026-02-03 | P0 |
| 환불/정산 API 명세 | 2026-02-10 | P2 |

---

## 7. 연락처

### Afformation 담당자

| 역할 | 이름 | 연락처 |
|------|------|--------|
| 사업 총괄 | 지현근 대표 | ceo@afformation.io |
| 개발 총괄 | 지웅근 대표 | tech@afformation.io |

### 회의 일정

- **킥오프 미팅 요청:** 2026년 1월 24일 (금) 오후
- **정기 싱크업:** 주 1회 (화요일 오후 권장)

---

*문서 버전: 1.0*  
*최종 수정: 2026년 1월 22일*  
*작성자: Afformation 팀*
