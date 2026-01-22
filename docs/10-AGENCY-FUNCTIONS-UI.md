# 10. Agency System - Functions, Triggers & UI

> 영업대행사 시스템 함수, 트리거, 뷰 및 UI 프로토타입

---

## 1. Database Functions

### 1.1 대행사 수수료 계산 함수

```sql
-- 결제 발생 시 대행사 수수료 자동 계산
CREATE OR REPLACE FUNCTION calculate_agency_commission(
  p_payment_id UUID
)
RETURNS TABLE (
  agency_id UUID,
  commission_amount DECIMAL(15, 2),
  parent_agency_id UUID,
  parent_commission_amount DECIMAL(15, 2)
) AS $$
DECLARE
  v_merchant_id UUID;
  v_agency_id UUID;
  v_parent_agency_id UUID;
  v_payment_amount DECIMAL(15, 2);
  v_merchant_fee DECIMAL(15, 2);
  v_agency_commission_rate DECIMAL(5, 4);
  v_parent_commission_rate DECIMAL(5, 4);
  v_agency_commission DECIMAL(15, 2);
  v_parent_commission DECIMAL(15, 2);
BEGIN
  -- 결제 정보 조회
  SELECT 
    p.merchant_id,
    p.amount_krw,
    p.fee_amount
  INTO v_merchant_id, v_payment_amount, v_merchant_fee
  FROM payments p
  WHERE p.id = p_payment_id;
  
  -- 가맹점의 대행사 조회
  SELECT m.agency_id INTO v_agency_id
  FROM merchants m
  WHERE m.id = v_merchant_id;
  
  -- 대행사 없으면 종료
  IF v_agency_id IS NULL THEN
    RETURN;
  END IF;
  
  -- 대행사 정보 조회
  SELECT 
    a.commission_rate,
    a.parent_id
  INTO v_agency_commission_rate, v_parent_agency_id
  FROM agencies a
  WHERE a.id = v_agency_id;
  
  -- 대행사 수수료 계산 (가맹점 수수료의 일정 비율)
  v_agency_commission := v_merchant_fee * v_agency_commission_rate;
  
  -- 상위 대행사(총판)가 있는 경우
  IF v_parent_agency_id IS NOT NULL THEN
    SELECT commission_rate INTO v_parent_commission_rate
    FROM agencies
    WHERE id = v_parent_agency_id;
    
    -- 총판 수수료 (대행사 수수료의 일부)
    v_parent_commission := v_agency_commission * v_parent_commission_rate;
    v_agency_commission := v_agency_commission - v_parent_commission;
  ELSE
    v_parent_commission := 0;
  END IF;
  
  -- 결과 반환
  RETURN QUERY SELECT 
    v_agency_id,
    v_agency_commission,
    v_parent_agency_id,
    v_parent_commission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 1.2 대행사 월간 실적 조회 함수

```sql
-- 대행사 월간 실적 조회
CREATE OR REPLACE FUNCTION get_agency_monthly_stats(
  p_agency_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)
)
RETURNS TABLE (
  total_merchants INTEGER,
  active_merchants INTEGER,
  new_merchants INTEGER,
  total_payments INTEGER,
  total_gmv DECIMAL(18, 2),
  total_commission DECIMAL(18, 2),
  avg_payment_amount DECIMAL(15, 2)
) AS $$
BEGIN
  RETURN QUERY
  WITH period AS (
    SELECT 
      DATE_TRUNC('month', MAKE_DATE(p_year, p_month, 1))::DATE as start_date,
      (DATE_TRUNC('month', MAKE_DATE(p_year, p_month, 1)) + INTERVAL '1 month' - INTERVAL '1 day')::DATE as end_date
  )
  SELECT 
    -- 전체 가맹점 수
    COUNT(DISTINCT m.id)::INTEGER as total_merchants,
    
    -- 활성 가맹점 수
    COUNT(DISTINCT CASE WHEN m.status = 'approved' THEN m.id END)::INTEGER as active_merchants,
    
    -- 이번 달 신규 가맹점
    COUNT(DISTINCT CASE 
      WHEN DATE(m.created_at) BETWEEN (SELECT start_date FROM period) AND (SELECT end_date FROM period)
      THEN m.id 
    END)::INTEGER as new_merchants,
    
    -- 총 결제 건수
    COALESCE(COUNT(p.id), 0)::INTEGER as total_payments,
    
    -- 총 거래액 (GMV)
    COALESCE(SUM(p.amount_krw), 0) as total_gmv,
    
    -- 총 수수료
    COALESCE(SUM(ac.commission_amount), 0) as total_commission,
    
    -- 평균 결제 금액
    COALESCE(AVG(p.amount_krw), 0) as avg_payment_amount
    
  FROM merchants m
  LEFT JOIN payments p ON m.id = p.merchant_id 
    AND p.status = 'completed'
    AND DATE(p.created_at) BETWEEN (SELECT start_date FROM period) AND (SELECT end_date FROM period)
  LEFT JOIN agency_commissions ac ON p.id = ac.payment_id AND ac.agency_id = p_agency_id
  WHERE m.agency_id = p_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 1.3 대행사 등급 자동 조정 함수

```sql
-- 월간 GMV 기준 등급 자동 조정
CREATE OR REPLACE FUNCTION evaluate_agency_tier(p_agency_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  v_monthly_gmv DECIMAL(18, 2);
  v_current_tier VARCHAR(20);
  v_new_tier VARCHAR(20);
BEGIN
  -- 최근 3개월 평균 GMV 계산
  SELECT AVG(monthly_gmv) INTO v_monthly_gmv
  FROM (
    SELECT SUM(p.amount_krw) as monthly_gmv
    FROM payments p
    JOIN merchants m ON p.merchant_id = m.id
    WHERE m.agency_id = p_agency_id
      AND p.status = 'completed'
      AND p.created_at >= CURRENT_DATE - INTERVAL '3 months'
    GROUP BY DATE_TRUNC('month', p.created_at)
  ) monthly;
  
  -- 현재 등급 조회
  SELECT tier INTO v_current_tier
  FROM agencies
  WHERE id = p_agency_id;
  
  -- 등급 판정 (GMV 기준)
  v_new_tier := CASE
    WHEN v_monthly_gmv >= 5000000000 THEN 'platinum'  -- 50억+
    WHEN v_monthly_gmv >= 2000000000 THEN 'gold'      -- 20억+
    WHEN v_monthly_gmv >= 500000000 THEN 'silver'     -- 5억+
    ELSE 'bronze'
  END;
  
  -- 등급 변경이 필요하면 업데이트
  IF v_new_tier != v_current_tier THEN
    UPDATE agencies
    SET 
      tier = v_new_tier,
      commission_rate = CASE v_new_tier
        WHEN 'platinum' THEN 0.25
        WHEN 'gold' THEN 0.20
        WHEN 'silver' THEN 0.15
        ELSE 0.10
      END,
      updated_at = NOW()
    WHERE id = p_agency_id;
  END IF;
  
  RETURN v_new_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 2. Triggers

### 2.1 결제 완료 시 대행사 수수료 자동 생성

```sql
-- 결제 완료 시 대행사 수수료 자동 기록
CREATE OR REPLACE FUNCTION on_payment_completed_agency_commission()
RETURNS TRIGGER AS $$
DECLARE
  v_agency_data RECORD;
BEGIN
  -- 완료 상태로 변경될 때만
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- 대행사 수수료 계산
    FOR v_agency_data IN 
      SELECT * FROM calculate_agency_commission(NEW.id)
    LOOP
      -- 수수료 레코드 생성
      INSERT INTO agency_commissions (
        agency_id,
        merchant_id,
        payment_id,
        payment_amount_krw,
        merchant_fee_amount,
        commission_rate,
        commission_amount,
        parent_agency_id,
        parent_commission_amount,
        status
      ) VALUES (
        v_agency_data.agency_id,
        NEW.merchant_id,
        NEW.id,
        NEW.amount_krw,
        NEW.fee_amount,
        (SELECT commission_rate FROM agencies WHERE id = v_agency_data.agency_id),
        v_agency_data.commission_amount,
        v_agency_data.parent_agency_id,
        v_agency_data.parent_commission_amount,
        'pending'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_payment_agency_commission
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION on_payment_completed_agency_commission();
```

### 2.2 가맹점 승인 시 대행사 통계 업데이트

```sql
-- 가맹점 승인 시 대행사 알림 (메타데이터에 기록)
CREATE OR REPLACE FUNCTION on_merchant_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.agency_id IS NOT NULL THEN
    -- 대행사 메타데이터에 알림 추가
    UPDATE agencies
    SET metadata = jsonb_set(
      COALESCE(metadata, '{}'),
      '{notifications}',
      COALESCE(metadata->'notifications', '[]') || 
        jsonb_build_object(
          'type', 'merchant_approved',
          'merchant_id', NEW.id,
          'merchant_name', NEW.name,
          'timestamp', NOW()
        )
    )
    WHERE id = NEW.agency_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_merchant_approved_agency_notify
  AFTER UPDATE ON merchants
  FOR EACH ROW EXECUTE FUNCTION on_merchant_approved();
```

---

## 3. Views

### 3.1 대행사 대시보드 뷰

```sql
-- 대행사 대시보드용 집계 뷰
CREATE VIEW v_agency_dashboard AS
SELECT 
  a.id as agency_id,
  a.name as agency_name,
  a.type,
  a.tier,
  a.commission_rate,
  
  -- 가맹점 통계
  COALESCE(merchant_stats.total, 0) as total_merchants,
  COALESCE(merchant_stats.active, 0) as active_merchants,
  COALESCE(merchant_stats.pending, 0) as pending_merchants,
  
  -- 오늘 실적
  COALESCE(today_stats.count, 0) as today_payments,
  COALESCE(today_stats.gmv, 0) as today_gmv,
  COALESCE(today_stats.commission, 0) as today_commission,
  
  -- 이번 달 실적
  COALESCE(month_stats.count, 0) as month_payments,
  COALESCE(month_stats.gmv, 0) as month_gmv,
  COALESCE(month_stats.commission, 0) as month_commission,
  
  -- 미정산 수수료
  COALESCE(pending_commission.amount, 0) as pending_commission
  
FROM agencies a

-- 가맹점 통계
LEFT JOIN (
  SELECT 
    agency_id,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as active,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
  FROM merchants
  GROUP BY agency_id
) merchant_stats ON a.id = merchant_stats.agency_id

-- 오늘 실적
LEFT JOIN (
  SELECT 
    ac.agency_id,
    COUNT(*) as count,
    SUM(ac.payment_amount_krw) as gmv,
    SUM(ac.commission_amount) as commission
  FROM agency_commissions ac
  WHERE DATE(ac.created_at) = CURRENT_DATE
    AND ac.status != 'cancelled'
  GROUP BY ac.agency_id
) today_stats ON a.id = today_stats.agency_id

-- 이번 달 실적
LEFT JOIN (
  SELECT 
    ac.agency_id,
    COUNT(*) as count,
    SUM(ac.payment_amount_krw) as gmv,
    SUM(ac.commission_amount) as commission
  FROM agency_commissions ac
  WHERE DATE_TRUNC('month', ac.created_at) = DATE_TRUNC('month', CURRENT_DATE)
    AND ac.status != 'cancelled'
  GROUP BY ac.agency_id
) month_stats ON a.id = month_stats.agency_id

-- 미정산 수수료
LEFT JOIN (
  SELECT 
    agency_id,
    SUM(commission_amount) as amount
  FROM agency_commissions
  WHERE status = 'pending'
  GROUP BY agency_id
) pending_commission ON a.id = pending_commission.agency_id

WHERE a.status = 'active';
```

### 3.2 운영 어드민용 전체 현황 뷰

```sql
-- 운영 어드민용 전체 대행사 현황
CREATE VIEW v_admin_agency_overview AS
SELECT 
  a.id,
  a.name,
  a.type,
  a.tier,
  a.status,
  a.commission_rate,
  a.exclusive_region,
  a.contract_start,
  a.contract_end,
  
  -- 상위 대행사 정보
  pa.name as parent_agency_name,
  
  -- 가맹점 수
  COALESCE(m_count.total, 0) as merchant_count,
  
  -- 이번 달 GMV
  COALESCE(monthly.gmv, 0) as monthly_gmv,
  
  -- 이번 달 수수료
  COALESCE(monthly.commission, 0) as monthly_commission,
  
  -- 누적 GMV
  COALESCE(total.gmv, 0) as total_gmv,
  
  a.created_at,
  a.approved_at

FROM agencies a
LEFT JOIN agencies pa ON a.parent_id = pa.id

LEFT JOIN (
  SELECT agency_id, COUNT(*) as total
  FROM merchants
  GROUP BY agency_id
) m_count ON a.id = m_count.agency_id

LEFT JOIN (
  SELECT 
    agency_id,
    SUM(payment_amount_krw) as gmv,
    SUM(commission_amount) as commission
  FROM agency_commissions
  WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY agency_id
) monthly ON a.id = monthly.agency_id

LEFT JOIN (
  SELECT 
    agency_id,
    SUM(payment_amount_krw) as gmv
  FROM agency_commissions
  GROUP BY agency_id
) total ON a.id = total.agency_id

ORDER BY a.type DESC, monthly.gmv DESC NULLS LAST;
```

---

## 4. 마이그레이션 스크립트

### 4.1 전체 마이그레이션 순서

```sql
-- 015_create_agencies.sql
-- 016_create_agency_users.sql
-- 017_create_agency_commissions.sql
-- 018_create_agency_settlements.sql
-- 019_alter_merchants_add_agency.sql
-- 020_alter_users_add_agency_role.sql
-- 021_create_agency_functions.sql
-- 022_create_agency_triggers.sql
-- 023_create_agency_views.sql
-- 024_create_agency_rls_policies.sql
```

### 4.2 롤백 스크립트

```sql
-- rollback_agency_system.sql

-- 트리거 삭제
DROP TRIGGER IF EXISTS tr_payment_agency_commission ON payments;
DROP TRIGGER IF EXISTS tr_merchant_approved_agency_notify ON merchants;

-- 함수 삭제
DROP FUNCTION IF EXISTS calculate_agency_commission;
DROP FUNCTION IF EXISTS get_agency_monthly_stats;
DROP FUNCTION IF EXISTS evaluate_agency_tier;
DROP FUNCTION IF EXISTS on_payment_completed_agency_commission;
DROP FUNCTION IF EXISTS on_merchant_approved;

-- 뷰 삭제
DROP VIEW IF EXISTS v_agency_dashboard;
DROP VIEW IF EXISTS v_admin_agency_overview;

-- 테이블 삭제 (역순)
DROP TABLE IF EXISTS agency_settlements;
DROP TABLE IF EXISTS agency_commissions;
DROP TABLE IF EXISTS agency_users;
DROP TABLE IF EXISTS agencies;

-- 기존 테이블 수정 복원
ALTER TABLE merchants DROP COLUMN IF EXISTS agency_id;
```

---

## 5. UI 프로토타입

### 5.1 대행사 포털 대시보드

```tsx
// prototypes/agency-portal/AgencyDashboard.tsx

'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building2,
  Wallet,
  TrendingUp,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

// Types
interface AgencyStats {
  totalMerchants: number;
  activeMerchants: number;
  pendingMerchants: number;
  todayGMV: number;
  monthGMV: number;
  todayCommission: number;
  monthCommission: number;
  pendingCommission: number;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
}

interface Merchant {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  monthlyGMV: number;
  commission: number;
  createdAt: string;
}

// Mock Data
const mockStats: AgencyStats = {
  totalMerchants: 45,
  activeMerchants: 38,
  pendingMerchants: 7,
  todayGMV: 85000000,
  monthGMV: 2450000000,
  todayCommission: 425000,
  monthCommission: 12250000,
  pendingCommission: 8500000,
  tier: 'gold',
};

const mockMerchants: Merchant[] = [
  { id: 'M001', name: '강남피부과', category: 'hospital', status: 'approved', monthlyGMV: 450000000, commission: 2250000, createdAt: '2025-12-15' },
  { id: 'M002', name: '압구정성형외과', category: 'hospital', status: 'approved', monthlyGMV: 380000000, commission: 1900000, createdAt: '2025-11-20' },
  { id: 'M003', name: '서초뷰티클리닉', category: 'beauty', status: 'pending', monthlyGMV: 0, commission: 0, createdAt: '2026-01-20' },
  { id: 'M004', name: '삼성치과', category: 'hospital', status: 'approved', monthlyGMV: 280000000, commission: 1400000, createdAt: '2025-10-05' },
];

export default function AgencyDashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [stats] = useState<AgencyStats>(mockStats);
  const [merchants] = useState<Merchant[]>(mockMerchants);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <AgencySidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} tier={stats.tier} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <AgencyHeader />
        
        <main className="flex-1 p-6 overflow-auto">
          {activeMenu === 'dashboard' && (
            <DashboardContent stats={stats} merchants={merchants} />
          )}
          {activeMenu === 'merchants' && (
            <MerchantsContent merchants={merchants} />
          )}
          {activeMenu === 'commissions' && (
            <CommissionsContent />
          )}
          {activeMenu === 'settlements' && (
            <SettlementsContent />
          )}
        </main>
      </div>
    </div>
  );
}

// Sidebar Component
function AgencySidebar({ 
  activeMenu, 
  setActiveMenu, 
  tier 
}: { 
  activeMenu: string; 
  setActiveMenu: (menu: string) => void;
  tier: string;
}) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: '대시보드' },
    { id: 'merchants', icon: Building2, label: '가맹점 관리' },
    { id: 'commissions', icon: CreditCard, label: '수수료 내역' },
    { id: 'settlements', icon: Wallet, label: '정산 관리' },
    { id: 'reports', icon: BarChart3, label: '리포트' },
    { id: 'settings', icon: Settings, label: '설정' },
  ];

  const tierColors = {
    platinum: 'from-purple-500 to-pink-500',
    gold: 'from-yellow-500 to-orange-500',
    silver: 'from-gray-400 to-gray-500',
    bronze: 'from-orange-700 to-orange-800',
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo & Agency Info */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-white">Agency Portal</div>
            <div className="text-xs text-slate-500">Unify Pay 파트너</div>
          </div>
        </div>
        
        {/* Tier Badge */}
        <div className={`px-3 py-2 rounded-lg bg-gradient-to-r ${tierColors[tier as keyof typeof tierColors]} bg-opacity-20`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white capitalize">{tier} Partner</span>
            <span className="text-xs text-white/80">수수료 20%</span>
          </div>
        </div>
      </div>
      
      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveMenu(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeMenu === item.id
                ? 'bg-green-500/10 text-green-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>
      
      {/* Agency Info */}
      <div className="p-4 border-t border-slate-800">
        <div className="p-4 bg-slate-800/50 rounded-xl">
          <div className="text-sm font-medium text-white mb-1">강남영업대행사</div>
          <div className="text-xs text-slate-500">agency@gangnam.com</div>
        </div>
      </div>
    </aside>
  );
}

// Header Component
function AgencyHeader() {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-white">대행사 대시보드</h1>
        <p className="text-xs text-slate-500">2026년 1월 22일</p>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}

// Dashboard Content
function DashboardContent({ stats, merchants }: { stats: AgencyStats; merchants: Merchant[] }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="이번 달 GMV"
          value={formatKRW(stats.monthGMV)}
          subValue={`오늘 ${formatKRW(stats.todayGMV)}`}
          trend={15.2}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="이번 달 수수료"
          value={formatKRW(stats.monthCommission)}
          subValue={`오늘 ${formatKRW(stats.todayCommission)}`}
          trend={12.8}
          icon={<Wallet className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="활성 가맹점"
          value={`${stats.activeMerchants}개`}
          subValue={`심사중 ${stats.pendingMerchants}개`}
          icon={<Building2 className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="미정산 수수료"
          value={formatKRW(stats.pendingCommission)}
          subValue="익월 15일 정산 예정"
          icon={<CreditCard className="w-5 h-5" />}
          color="orange"
        />
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-5 bg-slate-900 rounded-2xl border border-slate-800 hover:border-green-500/50 transition-colors flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-left">
            <div className="font-medium text-white">가맹점 등록</div>
            <div className="text-sm text-slate-500">새 가맹점 신청하기</div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 ml-auto" />
        </button>
        
        <button className="p-5 bg-slate-900 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-left">
            <div className="font-medium text-white">실적 리포트</div>
            <div className="text-sm text-slate-500">월간 리포트 확인</div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 ml-auto" />
        </button>
        
        <button className="p-5 bg-slate-900 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-colors flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-left">
            <div className="font-medium text-white">영업 자료</div>
            <div className="text-sm text-slate-500">홍보물 다운로드</div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 ml-auto" />
        </button>
      </div>
      
      {/* Recent Merchants */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">최근 등록 가맹점</h2>
          <button className="text-sm text-green-400 hover:text-green-300">
            전체 보기 →
          </button>
        </div>
        
        <div className="divide-y divide-slate-800">
          {merchants.slice(0, 4).map((merchant) => (
            <div key={merchant.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-medium text-white">{merchant.name}</div>
                  <div className="text-sm text-slate-500">{merchant.category}</div>
                </div>
              </div>
              <div className="text-right">
                <MerchantStatusBadge status={merchant.status} />
                <div className="text-sm text-slate-500 mt-1">
                  {merchant.status === 'approved' 
                    ? `GMV ${formatKRW(merchant.monthlyGMV)}`
                    : merchant.createdAt
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Merchants Content
function MerchantsContent({ merchants }: { merchants: Merchant[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">가맹점 관리</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          가맹점 등록
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="가맹점 검색..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500"
          />
        </div>
        <select className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white">
          <option value="all">전체 상태</option>
          <option value="approved">승인됨</option>
          <option value="pending">심사중</option>
          <option value="rejected">반려됨</option>
        </select>
      </div>
      
      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="p-4 text-left text-slate-400 font-medium text-sm">가맹점</th>
              <th className="p-4 text-left text-slate-400 font-medium text-sm">업종</th>
              <th className="p-4 text-left text-slate-400 font-medium text-sm">상태</th>
              <th className="p-4 text-right text-slate-400 font-medium text-sm">월 GMV</th>
              <th className="p-4 text-right text-slate-400 font-medium text-sm">내 수수료</th>
              <th className="p-4 text-right text-slate-400 font-medium text-sm">등록일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {merchants.map((merchant) => (
              <tr key={merchant.id} className="hover:bg-slate-800/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="font-medium text-white">{merchant.name}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-400">{merchant.category}</td>
                <td className="p-4"><MerchantStatusBadge status={merchant.status} /></td>
                <td className="p-4 text-right text-white">{formatKRW(merchant.monthlyGMV)}</td>
                <td className="p-4 text-right text-green-400">{formatKRW(merchant.commission)}</td>
                <td className="p-4 text-right text-slate-400">{merchant.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Commissions Content
function CommissionsContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">수수료 내역</h2>
      
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-center">
        <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">수수료 내역이 여기에 표시됩니다.</p>
      </div>
    </div>
  );
}

// Settlements Content
function SettlementsContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">정산 관리</h2>
      
      {/* Next Settlement Card */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6">
        <div className="text-green-100 text-sm mb-2">다음 정산 예정</div>
        <div className="text-3xl font-bold text-white mb-1">₩8,500,000</div>
        <div className="text-green-200 text-sm">2026년 2월 15일 예정</div>
      </div>
      
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-center">
        <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">정산 히스토리가 여기에 표시됩니다.</p>
      </div>
    </div>
  );
}

// Shared Components
function StatCard({ title, value, subValue, trend, icon, color }: {
  title: string;
  value: string;
  subValue: string;
  trend?: number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'purple' | 'orange';
}) {
  const colorClasses = {
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-500">{subValue}</div>
      <div className="text-xs text-slate-600 mt-2">{title}</div>
    </div>
  );
}

function MerchantStatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const config = {
    approved: { icon: CheckCircle, text: '승인', className: 'bg-green-500/10 text-green-400' },
    pending: { icon: Clock, text: '심사중', className: 'bg-yellow-500/10 text-yellow-400' },
    rejected: { icon: AlertCircle, text: '반려', className: 'bg-red-500/10 text-red-400' },
  };
  
  const { icon: Icon, text, className } = config[status];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      {text}
    </span>
  );
}

// Utility Functions
function formatKRW(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억`;
  }
  if (amount >= 10000000) {
    return `${(amount / 10000).toFixed(0)}만`;
  }
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}
```

---

*문서 버전: 1.0*  
*최종 수정: 2026년 1월*
