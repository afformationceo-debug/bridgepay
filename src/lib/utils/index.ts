// ============================================
// Utility Functions
// ============================================

// ============================================
// Number Formatting
// ============================================

/**
 * 원화 포맷팅
 */
export function formatKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}

/**
 * 암호화폐 금액 포맷팅
 */
export function formatCrypto(amount: number, decimals: number = 2): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 숫자 축약 (예: 1.2억, 15.3만)
 */
export function formatCompact(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억`;
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}만`;
  }
  return amount.toLocaleString();
}

/**
 * 퍼센트 포맷팅
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// ============================================
// Date Formatting
// ============================================

/**
 * 날짜/시간 포맷팅 (한국어)
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * 날짜만 포맷팅
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

/**
 * 시간만 포맷팅
 */
export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(date));
}

/**
 * 상대 시간 (예: 3분 전, 2시간 전)
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  
  return formatDate(date);
}

// ============================================
// String Formatting
// ============================================

/**
 * 마스킹 (계좌번호, 전화번호 등)
 */
export function maskString(
  value: string,
  start: number = 4,
  end: number = 4
): string {
  if (value.length <= start + end) {
    return '*'.repeat(value.length);
  }
  
  const prefix = value.slice(0, start);
  const suffix = value.slice(-end);
  const maskLength = value.length - start - end;
  
  return `${prefix}${'*'.repeat(maskLength)}${suffix}`;
}

/**
 * 전화번호 포맷팅
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  
  return phone;
}

/**
 * 사업자등록번호 포맷팅
 */
export function formatBusinessNumber(num: string): string {
  const cleaned = num.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
}

/**
 * 지갑 주소 축약
 */
export function truncateWallet(address: string, chars: number = 6): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// ============================================
// Data Masking (for logs)
// ============================================

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'bank_account',
  'card_number',
  'private_key',
  'api_key',
];

/**
 * 로그용 데이터 마스킹
 */
export function sanitizeForLogging(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeForLogging);
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// ============================================
// Validation Helpers
// ============================================

/**
 * 이메일 유효성 검사
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * 지갑 주소 유효성 검사
 */
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * 트랜잭션 해시 유효성 검사
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

// ============================================
// Async Utilities
// ============================================

/**
 * 지연 함수
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 재시도 래퍼
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, backoff = 2 } = options;
  
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        await sleep(delay * Math.pow(backoff, i));
      }
    }
  }
  
  throw lastError;
}

// ============================================
// Country & Currency Helpers
// ============================================

export const COUNTRY_FLAGS: Record<string, string> = {
  JP: '🇯🇵',
  TW: '🇹🇼',
  US: '🇺🇸',
  KR: '🇰🇷',
};

export const COUNTRY_NAMES: Record<string, string> = {
  JP: '일본',
  TW: '대만',
  US: '미국',
  KR: '한국',
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USDT: '$',
  JPYT: '¥',
  TWDT: 'NT$',
  KRW: '₩',
};

export function getCountryFlag(code: string): string {
  return COUNTRY_FLAGS[code] || '🌍';
}

export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || code;
}

// ============================================
// ID Generation
// ============================================

/**
 * 간단한 랜덤 ID 생성
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 결제 참조 ID 생성
 */
export function generatePaymentRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = generateId(4).toUpperCase();
  return `PAY-${timestamp}-${random}`;
}
