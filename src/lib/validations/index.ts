// ============================================
// Validation Schemas (Zod)
// ============================================

import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================

export const UUIDSchema = z.string().uuid('유효한 UUID가 아닙니다');

export const WalletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, '유효한 지갑 주소가 아닙니다');

export const TxHashSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, '유효한 트랜잭션 해시가 아닙니다');

export const PhoneSchema = z
  .string()
  .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, '유효한 전화번호가 아닙니다');

export const BusinessNumberSchema = z
  .string()
  .regex(/^\d{3}-?\d{2}-?\d{5}$/, '유효한 사업자등록번호가 아닙니다');

export const EmailSchema = z
  .string()
  .email('유효한 이메일 주소가 아닙니다');

// ============================================
// Merchant Schemas
// ============================================

export const MerchantCategorySchema = z.enum([
  'hospital',
  'beauty',
  'plastic',
  'dental',
  'retail',
  'other',
]);

export const MerchantStatusSchema = z.enum([
  'pending',
  'reviewing',
  'approved',
  'rejected',
  'suspended',
]);

export const MerchantRoleSchema = z.enum(['owner', 'manager', 'staff']);

export const MerchantApplicationSchema = z.object({
  business_name: z
    .string()
    .min(2, '상호명은 2자 이상이어야 합니다')
    .max(100, '상호명은 100자 이하여야 합니다'),
  business_number: BusinessNumberSchema,
  representative_name: z
    .string()
    .min(2, '대표자명은 2자 이상이어야 합니다')
    .max(50, '대표자명은 50자 이하여야 합니다'),
  category: MerchantCategorySchema,
  phone: PhoneSchema,
  email: EmailSchema,
  address: z.string().max(200).optional(),
  bank_name: z.string().max(50).optional(),
  bank_account: z
    .string()
    .regex(/^\d{10,14}$/, '유효한 계좌번호가 아닙니다')
    .optional(),
  account_holder: z.string().max(50).optional(),
});

export type MerchantApplication = z.infer<typeof MerchantApplicationSchema>;

// ============================================
// Payment Schemas
// ============================================

export const CurrencySchema = z.enum(['USDT', 'JPYT', 'TWDT']);

export const PaymentStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'expired',
  'refunded',
  'partial_refunded',
]);

export const CreatePaymentSchema = z.object({
  amount_krw: z
    .number()
    .positive('금액은 0보다 커야 합니다')
    .max(100000000, '1억원 이하만 가능합니다'),
  currency: CurrencySchema.default('USDT'),
  memo: z.string().max(200).optional(),
});

export type CreatePayment = z.infer<typeof CreatePaymentSchema>;

export const PaymentCallbackSchema = z.object({
  payment_id: UUIDSchema,
  tx_hash: TxHashSchema,
  block_number: z.number().int().positive(),
  status: z.enum(['completed', 'failed']),
  customer_wallet: WalletAddressSchema,
  timestamp: z.string().datetime(),
});

export type PaymentCallback = z.infer<typeof PaymentCallbackSchema>;

// ============================================
// Settlement Schemas
// ============================================

export const SettlementStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
]);

export const CreateSettlementSchema = z.object({
  amount: z
    .number()
    .positive('출금 금액은 0보다 커야 합니다'),
  currency: CurrencySchema.default('USDT'),
});

export type CreateSettlement = z.infer<typeof CreateSettlementSchema>;

// ============================================
// Refund Schemas
// ============================================

export const RefundReasonSchema = z.enum([
  'customer_request',
  'duplicate_payment',
  'service_cancelled',
  'other',
]);

export const RefundStatusSchema = z.enum([
  'pending',
  'approved',
  'processing',
  'completed',
  'rejected',
]);

export const CreateRefundSchema = z.object({
  payment_id: UUIDSchema,
  amount_krw: z.number().positive().optional(),
  reason: RefundReasonSchema,
  reason_detail: z.string().max(500).optional(),
});

export type CreateRefund = z.infer<typeof CreateRefundSchema>;

// ============================================
// Auth Schemas
// ============================================

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: EmailSchema,
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다'
    ),
  name: z
    .string()
    .min(2, '이름은 2자 이상이어야 합니다')
    .max(50, '이름은 50자 이하여야 합니다'),
  phone: PhoneSchema.optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

// ============================================
// Report Schemas
// ============================================

export const DateRangeSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD'),
}).refine(
  (data) => new Date(data.start_date) <= new Date(data.end_date),
  { message: '시작일은 종료일보다 이전이어야 합니다' }
);

export type DateRange = z.infer<typeof DateRangeSchema>;

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// ============================================
// Webhook Schemas
// ============================================

export const KaiaWebhookSchema = z.object({
  event_type: z.enum([
    'payment.completed',
    'payment.failed',
    'refund.completed',
    'settlement.completed',
  ]),
  payment_id: UUIDSchema.optional(),
  tx_hash: TxHashSchema,
  block_number: z.number().int().positive(),
  timestamp: z.string().datetime(),
  data: z.record(z.unknown()).optional(),
});

export type KaiaWebhook = z.infer<typeof KaiaWebhookSchema>;
