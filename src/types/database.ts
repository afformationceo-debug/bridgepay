// ============================================
// LINE Unify Pay - TypeScript Type Definitions
// Generated from Supabase Schema
// ============================================

// ============================================
// Enum Types
// ============================================

export type MerchantStatus = 
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type MerchantRole = 
  | 'owner'
  | 'manager'
  | 'staff';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired'
  | 'refunded'
  | 'partial_refunded';

export type SettlementStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export type RefundStatus = 
  | 'pending'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected';

export type LedgerType = 
  | 'payment'
  | 'refund'
  | 'settlement'
  | 'fee'
  | 'adjustment';

export type Currency = 'USDT' | 'JPYT' | 'TWDT';

export type Country = 'JP' | 'TW' | 'US' | 'KR';

// ============================================
// Database Tables
// ============================================

export interface Merchant {
  id: string;
  business_name: string;
  business_number: string;
  representative_name: string;
  category: string;
  phone: string;
  email: string;
  address: string | null;
  bank_name: string | null;
  bank_account_encrypted: string | null;
  account_holder: string | null;
  wallet_address: string | null;
  fee_rate: number;
  settlement_cycle: string;
  status: MerchantStatus;
  status_reason: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
}

export interface User {
  id: string;
  auth_id: string | null;
  email: string;
  name: string;
  phone: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MerchantUser {
  id: string;
  merchant_id: string;
  user_id: string;
  role: MerchantRole;
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  merchant_id: string;
  qr_code_id: string | null;
  amount_krw: number;
  amount_crypto: number;
  currency: Currency;
  exchange_rate: number;
  fee_rate: number;
  fee_amount: number;
  net_amount: number;
  customer_wallet: string | null;
  customer_country: Country | null;
  tx_hash: string | null;
  block_number: number | null;
  status: PaymentStatus;
  status_message: string | null;
  expires_at: string;
  memo: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface PaymentLog {
  id: string;
  payment_id: string;
  previous_status: PaymentStatus | null;
  new_status: PaymentStatus;
  message: string | null;
  error_code: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface LedgerEntry {
  id: string;
  merchant_id: string;
  payment_id: string | null;
  settlement_id: string | null;
  refund_id: string | null;
  type: LedgerType;
  amount: number;
  currency: Currency;
  balance_before: number;
  balance_after: number;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Settlement {
  id: string;
  merchant_id: string;
  requested_by: string;
  amount: number;
  currency: Currency;
  amount_krw: number | null;
  exchange_rate: number | null;
  fee_amount: number;
  net_amount: number;
  bank_name: string;
  bank_account_masked: string;
  account_holder: string;
  tx_hash: string | null;
  status: SettlementStatus;
  status_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Refund {
  id: string;
  payment_id: string;
  merchant_id: string;
  requested_by: string;
  amount_krw: number;
  amount_crypto: number;
  currency: Currency;
  reason: string;
  reason_detail: string | null;
  tx_hash: string | null;
  status: RefundStatus;
  status_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface QRCode {
  id: string;
  merchant_id: string;
  name: string;
  code: string;
  scan_count: number;
  last_scanned_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  source: string;
  created_at: string;
}

// ============================================
// API Request/Response Types
// ============================================

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  merchant: Merchant | null;
}

// Merchant Application
export interface MerchantApplicationRequest {
  business_name: string;
  business_number: string;
  representative_name: string;
  category: string;
  phone: string;
  email: string;
  address?: string;
  bank_name?: string;
  bank_account?: string;
  account_holder?: string;
}

// Payment
export interface CreatePaymentRequest {
  amount_krw: number;
  currency?: Currency;
  memo?: string;
}

export interface PaymentResponse {
  payment: Payment;
  qr_data?: string;
  expires_in: number;
}

// Settlement
export interface CreateSettlementRequest {
  amount: number;
  currency?: Currency;
}

// Refund
export interface CreateRefundRequest {
  payment_id: string;
  amount_krw?: number;  // 부분 환불 시
  reason: 'customer_request' | 'duplicate_payment' | 'service_cancelled' | 'other';
  reason_detail?: string;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  today_revenue_krw: number;
  today_payment_count: number;
  month_revenue_krw: number;
  month_payment_count: number;
  current_balance: number;
  pending_settlement: number;
}

export interface DailyRevenue {
  date: string;
  revenue_krw: number;
  payment_count: number;
  average_payment: number;
}

export interface CountryStats {
  country: Country;
  payment_count: number;
  revenue_krw: number;
  percentage: number;
}

// ============================================
// Webhook Types
// ============================================

export interface KaiaWebhookPayload {
  event_type: 'payment.completed' | 'payment.failed' | 'refund.completed' | 'settlement.completed';
  payment_id?: string;
  tx_hash: string;
  block_number: number;
  timestamp: string;
  data: Record<string, unknown>;
}

// ============================================
// Utility Types
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    request_id: string;
    timestamp: string;
  };
}

export interface DateRangeFilter {
  start_date: string;
  end_date: string;
}

// ============================================
// Supabase Database Type (for client)
// ============================================

export interface Database {
  public: {
    Tables: {
      merchants: {
        Row: Merchant;
        Insert: Omit<Merchant, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Merchant, 'id' | 'created_at'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      merchant_users: {
        Row: MerchantUser;
        Insert: Omit<MerchantUser, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MerchantUser, 'id' | 'created_at'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>;
      };
      payment_logs: {
        Row: PaymentLog;
        Insert: Omit<PaymentLog, 'id' | 'created_at'>;
        Update: never;
      };
      ledger_entries: {
        Row: LedgerEntry;
        Insert: Omit<LedgerEntry, 'id' | 'created_at'>;
        Update: never;
      };
      settlements: {
        Row: Settlement;
        Insert: Omit<Settlement, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Settlement, 'id' | 'created_at'>>;
      };
      refunds: {
        Row: Refund;
        Insert: Omit<Refund, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Refund, 'id' | 'created_at'>>;
      };
      qr_codes: {
        Row: QRCode;
        Insert: Omit<QRCode, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<QRCode, 'id' | 'created_at'>>;
      };
      exchange_rates: {
        Row: ExchangeRate;
        Insert: Omit<ExchangeRate, 'id' | 'created_at'>;
        Update: never;
      };
    };
    Views: {
      v_merchant_dashboard: {
        Row: {
          merchant_id: string;
          business_name: string;
          status: MerchantStatus;
          current_balance: number;
          today_payment_count: number;
          today_revenue_krw: number;
          month_payment_count: number;
          month_revenue_krw: number;
        };
      };
    };
    Functions: {
      get_merchant_balance: {
        Args: { p_merchant_id: string };
        Returns: number;
      };
      calculate_daily_revenue: {
        Args: { p_merchant_id: string; p_date: string };
        Returns: {
          total_count: number;
          total_krw: number;
          total_crypto: number;
          total_fee: number;
        }[];
      };
    };
    Enums: {
      merchant_status: MerchantStatus;
      merchant_role: MerchantRole;
      payment_status: PaymentStatus;
      settlement_status: SettlementStatus;
      refund_status: RefundStatus;
      ledger_type: LedgerType;
    };
  };
}
