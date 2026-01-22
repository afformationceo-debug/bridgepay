# 06. Error Handling & Recovery

> 에러 핸들링 정책 및 복구 시나리오

---

## 1. 에러 분류 체계

### 1.1 에러 카테고리

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Error Categories                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Level 1: Client Errors (4xx)                                        │
│  ├── 400 Validation Error     : 입력값 오류                          │
│  ├── 401 Authentication Error : 인증 실패                            │
│  ├── 403 Authorization Error  : 권한 없음                            │
│  ├── 404 Not Found Error      : 리소스 없음                          │
│  └── 429 Rate Limit Error     : 요청 한도 초과                       │
│                                                                      │
│  Level 2: Business Errors (422)                                      │
│  ├── INSUFFICIENT_BALANCE     : 잔액 부족                            │
│  ├── PAYMENT_EXPIRED          : 결제 만료                            │
│  ├── DUPLICATE_PAYMENT        : 중복 결제                            │
│  ├── MERCHANT_SUSPENDED       : 가맹점 정지                          │
│  └── REFUND_LIMIT_EXCEEDED    : 환불 한도 초과                       │
│                                                                      │
│  Level 3: Infrastructure Errors (5xx)                                │
│  ├── DATABASE_ERROR           : DB 연결/쿼리 실패                    │
│  ├── CACHE_ERROR              : Redis 연결 실패                      │
│  ├── BLOCKCHAIN_ERROR         : Kaia 네트워크 오류                   │
│  └── EXTERNAL_SERVICE_ERROR   : 외부 API 실패                        │
│                                                                      │
│  Level 4: Critical Errors (심각)                                     │
│  ├── PAYMENT_STATE_MISMATCH   : 결제 상태 불일치                     │
│  ├── DOUBLE_SPEND_DETECTED    : 이중 지불 감지                       │
│  └── DATA_CORRUPTION          : 데이터 정합성 오류                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 에러 코드 표준

```typescript
// error-codes.ts
export const ERROR_CODES = {
  // Client Errors (4xx)
  INVALID_REQUEST: { code: 'E4001', status: 400, message: '잘못된 요청입니다' },
  VALIDATION_FAILED: { code: 'E4002', status: 400, message: '입력값 검증 실패' },
  UNAUTHORIZED: { code: 'E4011', status: 401, message: '인증이 필요합니다' },
  TOKEN_EXPIRED: { code: 'E4012', status: 401, message: '토큰이 만료되었습니다' },
  FORBIDDEN: { code: 'E4031', status: 403, message: '권한이 없습니다' },
  NOT_FOUND: { code: 'E4041', status: 404, message: '리소스를 찾을 수 없습니다' },
  RATE_LIMITED: { code: 'E4291', status: 429, message: '요청 한도 초과' },

  // Business Errors (422)
  INSUFFICIENT_BALANCE: { code: 'E4221', status: 422, message: '잔액이 부족합니다' },
  PAYMENT_EXPIRED: { code: 'E4222', status: 422, message: '결제가 만료되었습니다' },
  DUPLICATE_PAYMENT: { code: 'E4223', status: 422, message: '중복 결제입니다' },
  MERCHANT_SUSPENDED: { code: 'E4224', status: 422, message: '가맹점이 정지되었습니다' },
  REFUND_EXCEEDS_ORIGINAL: { code: 'E4225', status: 422, message: '환불 금액이 원결제를 초과합니다' },
  SETTLEMENT_MINIMUM: { code: 'E4226', status: 422, message: '최소 정산 금액 미달' },

  // Server Errors (5xx)
  INTERNAL_ERROR: { code: 'E5001', status: 500, message: '서버 오류가 발생했습니다' },
  DATABASE_ERROR: { code: 'E5002', status: 500, message: 'DB 오류' },
  CACHE_ERROR: { code: 'E5003', status: 500, message: '캐시 오류' },
  BLOCKCHAIN_ERROR: { code: 'E5004', status: 500, message: '블록체인 오류' },
  EXTERNAL_API_ERROR: { code: 'E5005', status: 500, message: '외부 서비스 오류' },

  // Critical Errors
  STATE_MISMATCH: { code: 'E9001', status: 500, message: '상태 불일치 감지' },
  DATA_CORRUPTION: { code: 'E9002', status: 500, message: '데이터 정합성 오류' },
} as const;
```

---

## 2. 결제 에러 핸들링

### 2.1 결제 실패 시나리오

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Payment Error Scenarios                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  시나리오 1: 고객 잔액 부족                                           │
│  ────────────────────────────────                                    │
│  시점: 결제 요청 시점                                                 │
│  처리: 즉시 에러 반환, 결제 레코드 미생성                              │
│  사용자: "잔액이 부족합니다. LINE Unify에서 충전해주세요"              │
│                                                                      │
│  시나리오 2: 결제 만료 (10분)                                         │
│  ────────────────────────────                                        │
│  시점: 고객 미승인으로 타임아웃                                       │
│  처리: PENDING → EXPIRED 상태 변경                                   │
│  사용자: "결제 시간이 초과되었습니다. 다시 시도해주세요"               │
│                                                                      │
│  시나리오 3: 블록체인 전송 실패                                       │
│  ─────────────────────────────                                       │
│  시점: 고객 승인 후 Tx 전송 실패                                      │
│  처리:                                                               │
│  ├── 3회 자동 재시도 (2초 간격)                                       │
│  ├── 실패 시 PROCESSING → FAILED                                     │
│  └── 고객 지갑에서 미차감 확인 필수                                   │
│  사용자: "결제 처리 중 오류가 발생했습니다"                            │
│                                                                      │
│  시나리오 4: 트랜잭션 확정 실패 (Revert)                              │
│  ────────────────────────────────────                                │
│  시점: Tx 전송 성공했으나 블록체인에서 실패                           │
│  처리:                                                               │
│  ├── Tx Receipt 확인으로 실패 감지                                   │
│  ├── PROCESSING → FAILED                                             │
│  └── ⚠️ 고객 자금은 돌아가지만 가스비 소모됨                          │
│  사용자: "결제가 처리되지 않았습니다. 다시 시도해주세요"               │
│                                                                      │
│  시나리오 5: 네트워크 혼잡 (Pending 지연)                             │
│  ─────────────────────────────────────                               │
│  시점: Tx 전송 후 10분 이상 미확정                                    │
│  처리:                                                               │
│  ├── 가스비 부스트 재전송 시도                                        │
│  ├── 30분 후에도 미확정 시 FAILED 처리                                │
│  └── 수동 확인 필요 플래그 설정                                       │
│  사용자: "결제 확인 중입니다. 잠시 기다려주세요"                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 결제 상태 복구 로직

```typescript
// payment-recovery.ts

interface RecoveryAction {
  action: 'retry' | 'manual_check' | 'auto_refund' | 'alert_admin';
  delay_ms?: number;
  max_attempts?: number;
}

const RECOVERY_STRATEGIES: Record<string, RecoveryAction> = {
  'BLOCKCHAIN_TX_FAILED': {
    action: 'retry',
    delay_ms: 2000,
    max_attempts: 3,
  },
  'BLOCKCHAIN_TIMEOUT': {
    action: 'manual_check',
  },
  'STATE_MISMATCH': {
    action: 'alert_admin',
  },
};

async function recoverPayment(paymentId: string, errorCode: string) {
  const strategy = RECOVERY_STRATEGIES[errorCode];
  
  switch (strategy.action) {
    case 'retry':
      return await retryWithBackoff(paymentId, strategy);
    
    case 'manual_check':
      await flagForManualReview(paymentId);
      await notifyOperations(paymentId, errorCode);
      break;
    
    case 'alert_admin':
      await sendCriticalAlert(paymentId, errorCode);
      break;
  }
}

async function retryWithBackoff(
  paymentId: string, 
  strategy: RecoveryAction
) {
  let attempt = 0;
  
  while (attempt < (strategy.max_attempts || 3)) {
    attempt++;
    
    try {
      await processPayment(paymentId);
      return { success: true };
    } catch (error) {
      if (attempt < strategy.max_attempts!) {
        await sleep(strategy.delay_ms! * attempt); // 지수 백오프
      }
    }
  }
  
  // 모든 재시도 실패
  await markPaymentFailed(paymentId, 'MAX_RETRIES_EXCEEDED');
  return { success: false };
}
```

### 2.3 최악의 시나리오: 자금 불일치

```typescript
// 고객 지갑에서 빠졌는데 우리 DB에 기록 안 됨
async function handleFundsMismatch(txHash: string) {
  // 1. 블록체인에서 트랜잭션 조회
  const txReceipt = await kaiaClient.getTransactionReceipt(txHash);
  
  if (!txReceipt || txReceipt.status === 0) {
    // Tx 자체가 없거나 실패 - 고객 자금 안전
    return { safe: true, action: 'none' };
  }
  
  // 2. Tx 성공인데 우리 DB에 없음 - 심각
  const payment = await findPaymentByTxHash(txHash);
  
  if (!payment) {
    // 긴급 대응
    await createEmergencyAlert({
      type: 'ORPHAN_TRANSACTION',
      txHash,
      txReceipt,
      priority: 'CRITICAL',
    });
    
    // 수동 복구 레코드 생성
    await createManualRecoveryRecord({
      txHash,
      merchant_wallet: txReceipt.to,
      customer_wallet: txReceipt.from,
      amount: txReceipt.value,
      status: 'PENDING_MANUAL_REVIEW',
    });
    
    return { safe: false, action: 'manual_intervention_required' };
  }
  
  // 3. 레코드 있는데 상태가 다름 - 상태 동기화
  if (payment.status !== 'completed') {
    await syncPaymentStatus(payment.id, txReceipt);
    return { safe: true, action: 'status_synced' };
  }
  
  return { safe: true, action: 'already_synced' };
}
```

---

## 3. 중복 결제 방지

### 3.1 Upstash 락 전략

```typescript
// duplicate-prevention.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const LOCK_TTL_SECONDS = 30; // 30초 락

async function acquirePaymentLock(
  customerId: string,
  merchantId: string
): Promise<{ acquired: boolean; lockId?: string }> {
  const lockKey = `lock:payment:${customerId}:${merchantId}`;
  const lockId = crypto.randomUUID();
  
  // NX: 키가 없을 때만 설정
  const result = await redis.set(lockKey, lockId, {
    nx: true,
    ex: LOCK_TTL_SECONDS,
  });
  
  if (result === 'OK') {
    return { acquired: true, lockId };
  }
  
  return { acquired: false };
}

async function releasePaymentLock(
  customerId: string,
  merchantId: string,
  lockId: string
): Promise<boolean> {
  const lockKey = `lock:payment:${customerId}:${merchantId}`;
  
  // Lua 스크립트로 원자적 삭제 (본인 락만 해제)
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  
  const result = await redis.eval(script, [lockKey], [lockId]);
  return result === 1;
}

// 사용 예시
async function initiatePayment(request: PaymentRequest) {
  const { acquired, lockId } = await acquirePaymentLock(
    request.customerId,
    request.merchantId
  );
  
  if (!acquired) {
    throw new AppError(ERROR_CODES.DUPLICATE_PAYMENT);
  }
  
  try {
    // 결제 처리
    const payment = await processPayment(request);
    return payment;
  } finally {
    // 항상 락 해제
    await releasePaymentLock(
      request.customerId,
      request.merchantId,
      lockId!
    );
  }
}
```

### 3.2 멱등성 키 (Idempotency Key)

```typescript
// idempotency.ts

interface IdempotencyRecord {
  key: string;
  response: any;
  created_at: Date;
  expires_at: Date;
}

async function handleIdempotentRequest<T>(
  idempotencyKey: string,
  handler: () => Promise<T>
): Promise<T> {
  // 1. 기존 결과 확인
  const existing = await redis.get(`idempotency:${idempotencyKey}`);
  
  if (existing) {
    return JSON.parse(existing) as T;
  }
  
  // 2. 새 요청 처리
  const result = await handler();
  
  // 3. 결과 캐시 (24시간)
  await redis.setex(
    `idempotency:${idempotencyKey}`,
    86400,
    JSON.stringify(result)
  );
  
  return result;
}

// API에서 사용
app.post('/api/v1/payments', async (req, res) => {
  const idempotencyKey = req.headers['x-idempotency-key'];
  
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency key required' });
  }
  
  const result = await handleIdempotentRequest(
    idempotencyKey,
    () => createPayment(req.body)
  );
  
  return res.json(result);
});
```

---

## 4. 인프라 에러 핸들링

### 4.1 서킷 브레이커 패턴

```typescript
// circuit-breaker.ts

enum CircuitState {
  CLOSED = 'CLOSED',      // 정상
  OPEN = 'OPEN',          // 차단
  HALF_OPEN = 'HALF_OPEN' // 테스트
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  
  constructor(
    private readonly threshold: number = 5,       // 실패 임계치
    private readonly resetTimeout: number = 30000 // 30초 후 재시도
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }
  
  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }
}

// 외부 서비스별 서킷 브레이커
const circuitBreakers = {
  kaia: new CircuitBreaker(5, 30000),
  exchangeRate: new CircuitBreaker(3, 10000),
};

// 사용 예시
async function getBlockchainBalance(address: string) {
  return circuitBreakers.kaia.execute(async () => {
    return await kaiaClient.getBalance(address);
  });
}
```

### 4.2 Fallback 전략

```typescript
// fallback-strategies.ts

// 환율 조회 폴백
async function getExchangeRateWithFallback(
  from: string,
  to: string
): Promise<number> {
  // 1차: 실시간 API
  try {
    return await fetchLiveExchangeRate(from, to);
  } catch (error) {
    console.warn('Live rate failed, trying cache');
  }
  
  // 2차: 캐시된 환율 (10분 이내)
  const cached = await redis.get(`rate:${from}:${to}`);
  if (cached) {
    const { rate, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    
    if (age < 10 * 60 * 1000) { // 10분 이내
      return rate;
    }
  }
  
  // 3차: DB 저장 환율 (1시간 이내)
  const dbRate = await getLatestRateFromDB(from, to);
  if (dbRate && dbRate.age < 60 * 60 * 1000) {
    return dbRate.rate;
  }
  
  // 모두 실패 - 결제 거부
  throw new AppError(ERROR_CODES.EXCHANGE_RATE_UNAVAILABLE);
}

// DB 연결 실패 시
async function queryWithFallback<T>(
  primaryQuery: () => Promise<T>,
  fallbackQuery?: () => Promise<T>
): Promise<T> {
  try {
    return await primaryQuery();
  } catch (error) {
    if (fallbackQuery) {
      return await fallbackQuery();
    }
    
    // 중요 쿼리는 재시도
    await sleep(1000);
    return await primaryQuery();
  }
}
```

---

## 5. 에러 로깅 & 모니터링

### 5.1 구조화된 로깅

```typescript
// logger.ts
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: {
    service: 'unify-pay',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new transports.Console(),
    // 프로덕션에서는 외부 로그 서비스로
  ],
});

// 결제 에러 로깅
function logPaymentError(
  paymentId: string,
  error: Error,
  context: Record<string, any>
) {
  logger.error('Payment error', {
    payment_id: paymentId,
    error_name: error.name,
    error_message: error.message,
    error_stack: error.stack,
    ...context,
    // 민감 정보 마스킹
    customer_wallet: context.customer_wallet 
      ? maskWallet(context.customer_wallet) 
      : undefined,
  });
}

function maskWallet(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
```

### 5.2 알림 정책

```typescript
// alerts.ts

type AlertSeverity = 'info' | 'warning' | 'critical';

interface AlertConfig {
  severity: AlertSeverity;
  channels: ('slack' | 'email' | 'sms')[];
  throttle_minutes: number; // 동일 알림 제한
}

const ALERT_CONFIGS: Record<string, AlertConfig> = {
  'PAYMENT_FAILURE_RATE_HIGH': {
    severity: 'critical',
    channels: ['slack', 'sms'],
    throttle_minutes: 5,
  },
  'BLOCKCHAIN_CONNECTION_LOST': {
    severity: 'critical',
    channels: ['slack', 'sms'],
    throttle_minutes: 1,
  },
  'STATE_MISMATCH_DETECTED': {
    severity: 'critical',
    channels: ['slack', 'email', 'sms'],
    throttle_minutes: 0, // 항상 알림
  },
  'SETTLEMENT_FAILED': {
    severity: 'warning',
    channels: ['slack', 'email'],
    throttle_minutes: 15,
  },
};

async function sendAlert(alertType: string, details: any) {
  const config = ALERT_CONFIGS[alertType];
  if (!config) return;
  
  // 쓰로틀링 체크
  const throttleKey = `alert:throttle:${alertType}`;
  const throttled = await redis.get(throttleKey);
  
  if (throttled && config.throttle_minutes > 0) {
    return; // 이미 알림 발송됨
  }
  
  // 채널별 발송
  for (const channel of config.channels) {
    await sendToChannel(channel, {
      severity: config.severity,
      type: alertType,
      details,
      timestamp: new Date().toISOString(),
    });
  }
  
  // 쓰로틀 설정
  if (config.throttle_minutes > 0) {
    await redis.setex(throttleKey, config.throttle_minutes * 60, '1');
  }
}
```

---

## 6. 사용자 에러 메시지

### 6.1 친화적 메시지 매핑

```typescript
// user-messages.ts

const USER_MESSAGES: Record<string, {
  ko: string;
  ja: string;
  zh_tw: string;
}> = {
  'INSUFFICIENT_BALANCE': {
    ko: '잔액이 부족합니다. LINE Unify에서 충전 후 다시 시도해주세요.',
    ja: '残高が不足しています。LINE Unifyでチャージしてから再度お試しください。',
    zh_tw: '餘額不足，請在 LINE Unify 儲值後再試。',
  },
  'PAYMENT_EXPIRED': {
    ko: '결제 시간이 초과되었습니다. 다시 시도해주세요.',
    ja: '決済の有効期限が切れました。もう一度お試しください。',
    zh_tw: '付款已逾時，請重新嘗試。',
  },
  'NETWORK_ERROR': {
    ko: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    ja: 'ネットワークエラーが発生しました。しばらくしてから再度お試しください。',
    zh_tw: '網路錯誤，請稍後再試。',
  },
  'MERCHANT_NOT_AVAILABLE': {
    ko: '현재 이 가맹점에서 결제를 처리할 수 없습니다.',
    ja: '現在、この加盟店では決済を処理できません。',
    zh_tw: '目前無法在此商店進行付款。',
  },
};

function getUserMessage(
  errorCode: string,
  locale: 'ko' | 'ja' | 'zh_tw' = 'ko'
): string {
  const messages = USER_MESSAGES[errorCode];
  
  if (!messages) {
    return locale === 'ko' 
      ? '오류가 발생했습니다. 고객센터에 문의해주세요.'
      : locale === 'ja'
      ? 'エラーが発生しました。カスタマーセンターにお問い合わせください。'
      : '發生錯誤，請聯繫客服。';
  }
  
  return messages[locale];
}
```

### 6.2 프론트엔드 에러 표시

```typescript
// ErrorDisplay.tsx (React Component)
import { AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
  onRetry?: () => void;
  locale?: 'ko' | 'ja' | 'zh_tw';
}

export function ErrorDisplay({ error, onRetry, locale = 'ko' }: ErrorDisplayProps) {
  const userMessage = getUserMessage(error.code, locale);
  
  return (
    <div 
      className="p-4 bg-red-50 border border-red-200 rounded-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-800 font-medium">{userMessage}</p>
          
          <div className="mt-3 flex gap-2">
            {error.retryable && onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
              >
                <RefreshCw className="w-4 h-4" />
                다시 시도
              </button>
            )}
            
            <a
              href="/help"
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
            >
              <HelpCircle className="w-4 h-4" />
              도움말
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 7. 테스트 시나리오

### 7.1 에러 케이스 테스트

```typescript
// error-handling.test.ts

describe('Payment Error Handling', () => {
  describe('Duplicate Payment Prevention', () => {
    it('should reject duplicate payment within lock window', async () => {
      const request = createPaymentRequest();
      
      // 첫 번째 요청 성공
      const first = await initiatePayment(request);
      expect(first.success).toBe(true);
      
      // 두 번째 요청 거부
      await expect(initiatePayment(request))
        .rejects.toThrow('DUPLICATE_PAYMENT');
    });
  });
  
  describe('Blockchain Failure Recovery', () => {
    it('should retry 3 times on blockchain error', async () => {
      const mockSend = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ txHash: '0x123' });
      
      kaiaClient.sendTransaction = mockSend;
      
      const result = await processPaymentWithRetry('pay_123');
      
      expect(mockSend).toHaveBeenCalledTimes(3);
      expect(result.success).toBe(true);
    });
    
    it('should fail after max retries', async () => {
      const mockSend = jest.fn()
        .mockRejectedValue(new Error('Network error'));
      
      kaiaClient.sendTransaction = mockSend;
      
      await expect(processPaymentWithRetry('pay_123'))
        .rejects.toThrow('MAX_RETRIES_EXCEEDED');
      
      expect(mockSend).toHaveBeenCalledTimes(3);
    });
  });
  
  describe('State Mismatch Detection', () => {
    it('should detect and alert on state mismatch', async () => {
      // 블록체인에는 성공, DB에는 실패로 기록된 경우
      await createPayment({ id: 'pay_123', status: 'failed' });
      
      const txReceipt = { status: 1, txHash: '0x123' };
      mockGetReceipt.mockResolvedValue(txReceipt);
      
      const result = await syncPaymentState('pay_123');
      
      expect(result.corrected).toBe(true);
      expect(alertSpy).toHaveBeenCalledWith('STATE_MISMATCH_DETECTED');
    });
  });
});
```

---

*문서 버전: 1.0*  
*최종 수정: 2026년 1월*
