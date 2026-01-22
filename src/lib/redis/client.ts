// ============================================
// Upstash Redis Client Configuration
// ============================================

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// ============================================
// Redis Client
// ============================================

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ============================================
// Cache Helper Functions
// ============================================

/**
 * 캐시에서 값을 가져오거나, 없으면 fetcher 실행 후 캐시에 저장
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  // 캐시에서 조회
  const cached = await redis.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // 캐시 미스 - fetcher 실행
  const fresh = await fetcher();
  
  // 캐시에 저장
  await redis.setex(key, ttlSeconds, JSON.stringify(fresh));
  
  return fresh;
}

/**
 * 캐시 무효화
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

/**
 * 단일 키 삭제
 */
export async function deleteCache(key: string): Promise<void> {
  await redis.del(key);
}

// ============================================
// Rate Limiting
// ============================================

type RateLimitConfig = {
  requests: number;
  window: Parameters<typeof Ratelimit.slidingWindow>[1];
};

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  'auth:login': { requests: 5, window: '1 m' },
  'auth:register': { requests: 3, window: '1 m' },
  'payment:create': { requests: 100, window: '1 m' },
  'payment:status': { requests: 300, window: '1 m' },
  'settlement:create': { requests: 10, window: '1 m' },
  'report:export': { requests: 5, window: '1 m' },
  default: { requests: 60, window: '1 m' },
};

const rateLimiters: Map<string, Ratelimit> = new Map();

function getRateLimiter(endpoint: string): Ratelimit {
  if (rateLimiters.has(endpoint)) {
    return rateLimiters.get(endpoint)!;
  }

  const config = RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS.default;
  
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    analytics: true,
    prefix: `ratelimit:${endpoint}`,
  });

  rateLimiters.set(endpoint, limiter);
  return limiter;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

/**
 * Rate Limit 체크
 */
export async function checkRateLimit(
  endpoint: string,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = getRateLimiter(endpoint);
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
    limit: result.limit,
  };
}

// ============================================
// Distributed Lock
// ============================================

/**
 * 분산 락 획득
 */
export async function acquireLock(
  key: string,
  ttlSeconds: number = 30
): Promise<boolean> {
  const lockKey = `lock:${key}`;
  const result = await redis.set(lockKey, '1', {
    nx: true,
    ex: ttlSeconds,
  });
  return result === 'OK';
}

/**
 * 분산 락 해제
 */
export async function releaseLock(key: string): Promise<void> {
  const lockKey = `lock:${key}`;
  await redis.del(lockKey);
}

/**
 * 락과 함께 작업 실행
 */
export async function withLock<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 30
): Promise<T | null> {
  const acquired = await acquireLock(key, ttlSeconds);
  
  if (!acquired) {
    return null;
  }

  try {
    return await fn();
  } finally {
    await releaseLock(key);
  }
}

// ============================================
// Cache Key Generators
// ============================================

export const CacheKeys = {
  exchangeRate: (from: string, to: string) => `exchange:${from}:${to}`,
  merchantBalance: (merchantId: string) => `balance:${merchantId}`,
  merchantInfo: (merchantId: string) => `merchant:${merchantId}`,
  paymentStatus: (paymentId: string) => `payment:${paymentId}:status`,
  qrCodeInfo: (code: string) => `qr:${code}`,
  dashboardStats: (merchantId: string) => `dashboard:${merchantId}`,
};

export const CacheTTL = {
  EXCHANGE_RATE: 30,      // 30초
  MERCHANT_INFO: 300,     // 5분
  PAYMENT_STATUS: 10,     // 10초
  DASHBOARD_STATS: 60,    // 1분
  QR_CODE_INFO: 3600,     // 1시간
};
