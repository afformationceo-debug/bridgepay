# 04. API Specification

> LINE Unify Pay - REST API 명세서

---

## 1. API Overview

### 1.1 Base URL

```
Production:  https://api.unifypay.kr/v1
Staging:     https://staging-api.unifypay.kr/v1
Development: http://localhost:3000/api/v1
```

### 1.2 Authentication

모든 API는 JWT Bearer 토큰 인증 필요 (공개 엔드포인트 제외)

```http
Authorization: Bearer <jwt_token>
```

### 1.3 공통 Response 형식

```typescript
// 성공
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-22T10:00:00Z",
    "request_id": "req_abc123"
  }
}

// 에러
{
  "success": false,
  "error": {
    "code": "PAYMENT_FAILED",
    "message": "결제 처리 중 오류가 발생했습니다",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2026-01-22T10:00:00Z",
    "request_id": "req_abc123"
  }
}
```

### 1.4 에러 코드

| HTTP Status | 코드 | 설명 |
|-------------|------|------|
| 400 | INVALID_REQUEST | 잘못된 요청 파라미터 |
| 401 | UNAUTHORIZED | 인증 실패 |
| 403 | FORBIDDEN | 권한 없음 |
| 404 | NOT_FOUND | 리소스 없음 |
| 409 | CONFLICT | 중복 요청 |
| 422 | VALIDATION_ERROR | 유효성 검사 실패 |
| 429 | RATE_LIMITED | 요청 한도 초과 |
| 500 | INTERNAL_ERROR | 서버 오류 |

---

## 2. Auth API

### 2.1 로그인

```http
POST /auth/login
```

**Request:**
```json
{
  "email": "owner@hospital.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "owner@hospital.com",
      "name": "김원장"
    },
    "merchants": [
      {
        "id": "merchant_xyz",
        "name": "강남피부과",
        "role": "owner"
      }
    ],
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "expires_in": 3600
  }
}
```

### 2.2 토큰 갱신

```http
POST /auth/refresh
```

**Request:**
```json
{
  "refresh_token": "eyJhbG..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbG...",
    "expires_in": 3600
  }
}
```

### 2.3 로그아웃

```http
POST /auth/logout
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "로그아웃되었습니다"
  }
}
```

---

## 3. Merchant API

### 3.1 가맹점 신청

```http
POST /merchants/apply
```

**Request:**
```json
{
  "name": "강남피부과",
  "name_en": "Gangnam Dermatology",
  "business_number": "123-45-67890",
  "representative_name": "김원장",
  "category": "hospital",
  "sub_category": "dermatology",
  "phone": "02-1234-5678",
  "email": "info@gangnam-derm.com",
  "address": "서울시 강남구 테헤란로 123",
  "address_detail": "5층",
  "documents": {
    "business_license": "https://storage.../business_license.pdf",
    "bank_account": "https://storage.../bank_statement.pdf"
  },
  "bank_info": {
    "bank_name": "신한은행",
    "account_number": "110-123-456789",
    "holder_name": "김원장"
  },
  "admin_user": {
    "email": "owner@gangnam-derm.com",
    "name": "김원장",
    "phone": "010-1234-5678",
    "password": "secure_password"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "merchant_id": "merchant_xyz",
    "status": "pending",
    "message": "신청이 접수되었습니다. 심사 후 연락드리겠습니다.",
    "estimated_review_days": 3
  }
}
```

### 3.2 가맹점 정보 조회

```http
GET /merchants/:merchant_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "merchant_xyz",
    "name": "강남피부과",
    "name_en": "Gangnam Dermatology",
    "business_number": "123-45-67890",
    "category": "hospital",
    "status": "approved",
    "wallet_address": "0x1234...5678",
    "fee_rate": 0.005,
    "created_at": "2026-01-15T09:00:00Z",
    "approved_at": "2026-01-17T14:30:00Z"
  }
}
```

### 3.3 가맹점 정보 수정

```http
PATCH /merchants/:merchant_id
```

**Request:**
```json
{
  "phone": "02-1234-9999",
  "address": "서울시 강남구 삼성로 456",
  "settlement_cycle": "daily"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "merchant_xyz",
    "updated_fields": ["phone", "address", "settlement_cycle"],
    "updated_at": "2026-01-22T10:00:00Z"
  }
}
```

### 3.4 가맹점 대시보드

```http
GET /merchants/:merchant_id/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "today": {
      "payment_count": 15,
      "total_amount_krw": 4500000,
      "total_amount_crypto": 3000.5
    },
    "this_month": {
      "payment_count": 380,
      "total_amount_krw": 120000000,
      "total_amount_crypto": 80000.25
    },
    "balance": {
      "available": 15000.5,
      "pending": 3000.0,
      "currency": "USDT"
    },
    "recent_payments": [
      {
        "id": "pay_abc123",
        "amount_krw": 300000,
        "status": "completed",
        "created_at": "2026-01-22T09:45:00Z"
      }
    ]
  }
}
```

---

## 4. Payment API

### 4.1 결제 생성 (QR 스캔 후)

```http
POST /payments/initiate
```

**Request:**
```json
{
  "merchant_id": "merchant_xyz",
  "amount_krw": 150000,
  "customer_wallet": "0xABC...DEF",
  "customer_country": "JP",
  "currency": "USDT",
  "memo": "피부 레이저 시술"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": "pay_abc123",
    "merchant_name": "강남피부과",
    "amount_krw": 150000,
    "amount_crypto": 100.5,
    "currency": "USDT",
    "exchange_rate": 1492.54,
    "fee_amount": 0.5,
    "status": "pending",
    "expires_at": "2026-01-22T10:15:00Z",
    "payment_request": {
      "to_address": "0x1234...5678",
      "amount": "100500000000000000000",
      "chain_id": 8217,
      "token_address": "0xUSDT..."
    }
  }
}
```

### 4.2 결제 상태 조회

```http
GET /payments/:payment_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pay_abc123",
    "merchant_id": "merchant_xyz",
    "amount_krw": 150000,
    "amount_crypto": 100.5,
    "currency": "USDT",
    "exchange_rate": 1492.54,
    "fee_amount": 0.5,
    "net_amount": 100.0,
    "status": "completed",
    "tx_hash": "0x789...abc",
    "block_number": 12345678,
    "customer_wallet": "0xABC...DEF",
    "created_at": "2026-01-22T10:00:00Z",
    "completed_at": "2026-01-22T10:00:03Z"
  }
}
```

### 4.3 결제 내역 조회 (가맹점)

```http
GET /merchants/:merchant_id/payments
```

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| status | string | N | 필터: pending, completed, failed |
| start_date | date | N | 시작일 (YYYY-MM-DD) |
| end_date | date | N | 종료일 |
| page | number | N | 페이지 (기본: 1) |
| limit | number | N | 개수 (기본: 20, 최대: 100) |

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "pay_abc123",
        "amount_krw": 150000,
        "amount_crypto": 100.5,
        "status": "completed",
        "customer_country": "JP",
        "created_at": "2026-01-22T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 15,
      "total_count": 290,
      "has_next": true
    }
  }
}
```

### 4.4 결제 콜백 (Kaia → 우리 서버)

```http
POST /payments/callback
```

**Request (Webhook from Kaia/Unify):**
```json
{
  "event_type": "payment.completed",
  "payment_id": "pay_abc123",
  "tx_hash": "0x789...abc",
  "block_number": 12345678,
  "status": "confirmed",
  "confirmed_at": "2026-01-22T10:00:03Z",
  "signature": "0xSIGNATURE..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "received": true
  }
}
```

---

## 5. Settlement API

### 5.1 정산 가능 금액 조회

```http
GET /merchants/:merchant_id/balance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "available_balance": 15000.5,
    "pending_balance": 3000.0,
    "pending_settlement": 0,
    "currency": "USDT",
    "last_settlement": {
      "id": "settle_xyz",
      "amount": 10000.0,
      "status": "completed",
      "completed_at": "2026-01-20T15:00:00Z"
    }
  }
}
```

### 5.2 정산 요청

```http
POST /merchants/:merchant_id/settlements
```

**Request:**
```json
{
  "amount": 10000.0,
  "currency": "USDT",
  "destination_type": "bank_account",
  "convert_to_krw": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "settlement_id": "settle_abc123",
    "amount_crypto": 10000.0,
    "estimated_amount_krw": 14925000,
    "exchange_rate": 1492.5,
    "fee_amount": 0,
    "status": "pending",
    "estimated_completion": "2026-01-22T18:00:00Z"
  }
}
```

### 5.3 정산 내역 조회

```http
GET /merchants/:merchant_id/settlements
```

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| status | string | N | 필터: pending, completed |
| start_date | date | N | 시작일 |
| end_date | date | N | 종료일 |
| page | number | N | 페이지 |
| limit | number | N | 개수 |

**Response:**
```json
{
  "success": true,
  "data": {
    "settlements": [
      {
        "id": "settle_abc123",
        "amount_crypto": 10000.0,
        "amount_krw": 14925000,
        "status": "completed",
        "completed_at": "2026-01-22T18:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_count": 45
    }
  }
}
```

---

## 6. Refund API

### 6.1 환불 요청

```http
POST /payments/:payment_id/refund
```

**Request:**
```json
{
  "refund_type": "partial",
  "amount_krw": 50000,
  "reason": "customer_request",
  "reason_detail": "시술 일부 취소"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refund_id": "refund_abc123",
    "payment_id": "pay_abc123",
    "amount_krw": 50000,
    "amount_crypto": 33.5,
    "status": "pending",
    "estimated_completion": "2026-01-22T11:00:00Z"
  }
}
```

### 6.2 환불 상태 조회

```http
GET /refunds/:refund_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "refund_abc123",
    "payment_id": "pay_abc123",
    "amount_krw": 50000,
    "amount_crypto": 33.5,
    "status": "completed",
    "tx_hash": "0xREFUND...",
    "created_at": "2026-01-22T10:30:00Z",
    "completed_at": "2026-01-22T10:30:05Z"
  }
}
```

---

## 7. QR Code API

### 7.1 QR 코드 생성

```http
POST /merchants/:merchant_id/qr-codes
```

**Request:**
```json
{
  "name": "카운터 QR",
  "description": "메인 카운터용"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qr_code_id": "qr_abc123",
    "qr_data": "unifypay://pay?m=merchant_xyz&v=1",
    "qr_image_url": "https://cdn.unifypay.kr/qr/qr_abc123.png",
    "is_active": true,
    "created_at": "2026-01-22T10:00:00Z"
  }
}
```

### 7.2 QR 코드 목록 조회

```http
GET /merchants/:merchant_id/qr-codes
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qr_codes": [
      {
        "id": "qr_abc123",
        "name": "카운터 QR",
        "is_active": true,
        "scan_count": 150,
        "last_scanned_at": "2026-01-22T09:45:00Z"
      }
    ]
  }
}
```

### 7.3 QR 코드 비활성화

```http
PATCH /qr-codes/:qr_code_id
```

**Request:**
```json
{
  "is_active": false
}
```

---

## 8. Report API

### 8.1 일별 매출 리포트

```http
GET /merchants/:merchant_id/reports/daily
```

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| start_date | date | Y | 시작일 |
| end_date | date | Y | 종료일 |

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2026-01-01",
      "end": "2026-01-22"
    },
    "daily_data": [
      {
        "date": "2026-01-22",
        "payment_count": 15,
        "total_amount_krw": 4500000,
        "total_amount_crypto": 3000.5,
        "fee_amount": 15.0,
        "net_amount": 2985.5
      }
    ],
    "summary": {
      "total_payment_count": 380,
      "total_amount_krw": 120000000,
      "total_fee": 400.0,
      "total_net": 79600.0
    }
  }
}
```

### 8.2 국가별 매출 리포트

```http
GET /merchants/:merchant_id/reports/by-country
```

**Response:**
```json
{
  "success": true,
  "data": {
    "by_country": [
      {
        "country": "JP",
        "country_name": "일본",
        "payment_count": 250,
        "total_amount_krw": 80000000,
        "percentage": 66.7
      },
      {
        "country": "TW",
        "country_name": "대만",
        "payment_count": 130,
        "total_amount_krw": 40000000,
        "percentage": 33.3
      }
    ]
  }
}
```

### 8.3 엑셀 다운로드

```http
GET /merchants/:merchant_id/reports/export
```

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| type | string | Y | payments, settlements |
| start_date | date | Y | 시작일 |
| end_date | date | Y | 종료일 |
| format | string | N | csv, xlsx (기본: xlsx) |

**Response:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="payments_2026-01.xlsx"
```

---

## 9. Exchange Rate API

### 9.1 현재 환율 조회

```http
GET /exchange-rates
```

**Response:**
```json
{
  "success": true,
  "data": {
    "base_currency": "USDT",
    "rates": {
      "KRW": 1492.54,
      "JPY": 157.82,
      "TWD": 32.15
    },
    "updated_at": "2026-01-22T10:00:00Z"
  }
}
```

---

## 10. Webhook

### 10.1 웹훅 설정

가맹점은 어드민에서 웹훅 URL을 설정할 수 있습니다.

**이벤트 종류:**
| 이벤트 | 설명 |
|--------|------|
| payment.completed | 결제 완료 |
| payment.failed | 결제 실패 |
| refund.completed | 환불 완료 |
| settlement.completed | 정산 완료 |

**웹훅 Payload:**
```json
{
  "event": "payment.completed",
  "created_at": "2026-01-22T10:00:00Z",
  "data": {
    "payment_id": "pay_abc123",
    "merchant_id": "merchant_xyz",
    "amount_krw": 150000,
    "amount_crypto": 100.5,
    "status": "completed"
  },
  "signature": "sha256=..."
}
```

**서명 검증:**
```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return `sha256=${expected}` === signature;
}
```

---

## 11. Rate Limiting

| 엔드포인트 | 제한 |
|-----------|------|
| /auth/* | 10 req/min |
| /payments/* | 100 req/min |
| /merchants/* | 60 req/min |
| /reports/* | 10 req/min |

Rate Limit 초과 시 응답:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "요청 한도를 초과했습니다",
    "retry_after": 45
  }
}
```

---

*문서 버전: 1.0*  
*최종 수정: 2026년 1월*
