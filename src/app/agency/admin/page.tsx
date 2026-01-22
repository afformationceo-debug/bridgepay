// src/app/agency/admin/page.tsx
// 에이전시 포털 대시보드 - 영업대행사 관리 시스템

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
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
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Menu,
  X,
  Star,
  Trophy,
  Target,
  Percent,
} from 'lucide-react';

// 3D 컴포넌트 동적 임포트
const TierPyramid3D = dynamic(
  () => import('@/components/3d/agency/TierPyramid3D').then((mod) => mod.TierPyramid3D),
  { ssr: false, loading: () => <div className="h-[300px] bg-slate-800/50 rounded-2xl animate-pulse" /> }
);

const CommissionFlow3D = dynamic(
  () => import('@/components/3d/agency/CommissionFlow3D').then((mod) => mod.CommissionFlow3D),
  { ssr: false, loading: () => <div className="h-[250px] bg-slate-800/50 rounded-2xl animate-pulse" /> }
);

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
  commissionRate: number;
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

interface Commission {
  id: string;
  merchantName: string;
  paymentAmount: number;
  commissionAmount: number;
  status: 'pending' | 'confirmed' | 'settled';
  createdAt: string;
}

interface Settlement {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalGMV: number;
  totalCommission: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed';
  paidAt?: string;
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
  commissionRate: 0.20,
};

const mockMerchants: Merchant[] = [
  { id: 'M001', name: '강남피부과', category: '병원', status: 'approved', monthlyGMV: 450000000, commission: 2250000, createdAt: '2025-12-15' },
  { id: 'M002', name: '압구정성형외과', category: '병원', status: 'approved', monthlyGMV: 380000000, commission: 1900000, createdAt: '2025-11-20' },
  { id: 'M003', name: '서초뷰티클리닉', category: '뷰티', status: 'pending', monthlyGMV: 0, commission: 0, createdAt: '2026-01-20' },
  { id: 'M004', name: '삼성치과', category: '병원', status: 'approved', monthlyGMV: 280000000, commission: 1400000, createdAt: '2025-10-05' },
  { id: 'M005', name: '청담에스테틱', category: '뷰티', status: 'approved', monthlyGMV: 220000000, commission: 1100000, createdAt: '2025-09-15' },
];

const mockCommissions: Commission[] = [
  { id: 'C001', merchantName: '강남피부과', paymentAmount: 1500000, commissionAmount: 7500, status: 'pending', createdAt: '2026-01-22 14:30' },
  { id: 'C002', merchantName: '압구정성형외과', paymentAmount: 3200000, commissionAmount: 16000, status: 'confirmed', createdAt: '2026-01-22 13:15' },
  { id: 'C003', merchantName: '삼성치과', paymentAmount: 850000, commissionAmount: 4250, status: 'settled', createdAt: '2026-01-21 16:45' },
  { id: 'C004', merchantName: '청담에스테틱', paymentAmount: 1200000, commissionAmount: 6000, status: 'pending', createdAt: '2026-01-22 11:20' },
];

const mockSettlements: Settlement[] = [
  { id: 'S001', periodStart: '2026-01-01', periodEnd: '2026-01-31', totalGMV: 2450000000, totalCommission: 12250000, netAmount: 11637500, status: 'pending' },
  { id: 'S002', periodStart: '2025-12-01', periodEnd: '2025-12-31', totalGMV: 1980000000, totalCommission: 9900000, netAmount: 9405000, status: 'completed', paidAt: '2026-01-15' },
  { id: 'S003', periodStart: '2025-11-01', periodEnd: '2025-11-30', totalGMV: 1650000000, totalCommission: 8250000, netAmount: 7837500, status: 'completed', paidAt: '2025-12-15' },
];

// Main Component
export default function AgencyDashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats] = useState<AgencyStats>(mockStats);
  const [merchants] = useState<Merchant[]>(mockMerchants);
  const [commissions] = useState<Commission[]>(mockCommissions);
  const [settlements] = useState<Settlement[]>(mockSettlements);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeMenu]);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AgencySidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        tier={stats.tier}
        commissionRate={stats.commissionRate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AgencyHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {activeMenu === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <DashboardContent stats={stats} merchants={merchants} />
              </motion.div>
            )}
            {activeMenu === 'merchants' && (
              <motion.div
                key="merchants"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <MerchantsContent merchants={merchants} />
              </motion.div>
            )}
            {activeMenu === 'commissions' && (
              <motion.div
                key="commissions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CommissionsContent commissions={commissions} />
              </motion.div>
            )}
            {activeMenu === 'settlements' && (
              <motion.div
                key="settlements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SettlementsContent settlements={settlements} stats={stats} />
              </motion.div>
            )}
            {activeMenu === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ReportsContent />
              </motion.div>
            )}
            {activeMenu === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SettingsContent />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Sidebar Component
function AgencySidebar({
  activeMenu,
  setActiveMenu,
  tier,
  commissionRate,
  isOpen,
  onClose,
}: {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  tier: string;
  commissionRate: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: '대시보드' },
    { id: 'merchants', icon: Building2, label: '가맹점 관리' },
    { id: 'commissions', icon: CreditCard, label: '수수료 내역' },
    { id: 'settlements', icon: Wallet, label: '정산 관리' },
    { id: 'reports', icon: BarChart3, label: '리포트' },
    { id: 'settings', icon: Settings, label: '설정' },
  ];

  const tierConfig = {
    platinum: { color: 'from-purple-500 to-pink-500', label: 'Platinum', icon: Star },
    gold: { color: 'from-yellow-500 to-orange-500', label: 'Gold', icon: Trophy },
    silver: { color: 'from-gray-400 to-gray-500', label: 'Silver', icon: Target },
    bronze: { color: 'from-orange-700 to-orange-800', label: 'Bronze', icon: Target },
  };

  const currentTier = tierConfig[tier as keyof typeof tierConfig];
  const TierIcon = currentTier.icon;

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 border-r border-slate-800 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Close button (mobile) */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white lg:hidden"
      >
        <X className="w-5 h-5" />
      </button>

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
        <div className={`px-3 py-2 rounded-lg bg-gradient-to-r ${currentTier.color} bg-opacity-20 border border-white/10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TierIcon className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">{currentTier.label} Partner</span>
            </div>
            <span className="text-xs text-white/80">{(commissionRate * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
function AgencyHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-400 hover:text-white lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-white">에이전시 대시보드</h1>
          <p className="text-xs text-slate-500">{today}</p>
        </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* 3D Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Pyramid */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">등급 현황</h3>
          <TierPyramid3D currentTier={stats.tier} />
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-400">
              다음 등급까지 <span className="text-green-400 font-medium">₩25.5억</span> 남음
            </p>
          </div>
        </div>

        {/* Commission Flow */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">수수료 흐름</h3>
          <CommissionFlow3D commissionRate={stats.commissionRate} />
        </div>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">가맹점 관리</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          가맹점 등록
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="가맹점 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-green-500"
        >
          <option value="all">전체 상태</option>
          <option value="approved">승인됨</option>
          <option value="pending">심사중</option>
          <option value="rejected">반려됨</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[600px]">
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
            {filteredMerchants.map((merchant) => (
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
function CommissionsContent({ commissions }: { commissions: Commission[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">수수료 내역</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Excel 다운로드
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="text-sm text-slate-400 mb-1">오늘 발생</div>
          <div className="text-2xl font-bold text-white">₩33,750</div>
          <div className="text-xs text-green-400 mt-1">+12.5% vs 어제</div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="text-sm text-slate-400 mb-1">이번 주</div>
          <div className="text-2xl font-bold text-white">₩2,847,500</div>
          <div className="text-xs text-green-400 mt-1">+8.3% vs 지난주</div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="text-sm text-slate-400 mb-1">이번 달</div>
          <div className="text-2xl font-bold text-white">₩12,250,000</div>
          <div className="text-xs text-green-400 mt-1">+15.2% vs 지난달</div>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="p-4 text-left text-slate-400 font-medium text-sm">가맹점</th>
              <th className="p-4 text-right text-slate-400 font-medium text-sm">결제 금액</th>
              <th className="p-4 text-right text-slate-400 font-medium text-sm">수수료</th>
              <th className="p-4 text-left text-slate-400 font-medium text-sm">상태</th>
              <th className="p-4 text-right text-slate-400 font-medium text-sm">발생일시</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {commissions.map((commission) => (
              <tr key={commission.id} className="hover:bg-slate-800/50">
                <td className="p-4 font-medium text-white">{commission.merchantName}</td>
                <td className="p-4 text-right text-slate-300">{formatKRW(commission.paymentAmount)}</td>
                <td className="p-4 text-right text-green-400 font-medium">{formatKRW(commission.commissionAmount)}</td>
                <td className="p-4"><CommissionStatusBadge status={commission.status} /></td>
                <td className="p-4 text-right text-slate-400">{commission.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Settlements Content
function SettlementsContent({ settlements, stats }: { settlements: Settlement[]; stats: AgencyStats }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">정산 관리</h2>

      {/* Next Settlement Card */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-green-100 text-sm mb-2">다음 정산 예정</div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">
              {formatKRW(stats.pendingCommission)}
            </div>
            <div className="text-green-200 text-sm">2026년 2월 15일 예정</div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm">
              상세 보기
            </button>
            <button className="px-4 py-2 bg-white text-green-600 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors">
              조기 정산 요청
            </button>
          </div>
        </div>
      </div>

      {/* Settlement History */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">정산 히스토리</h3>
        </div>
        <div className="divide-y divide-slate-800">
          {settlements.map((settlement) => (
            <div key={settlement.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  settlement.status === 'completed' ? 'bg-green-500/10' : 'bg-yellow-500/10'
                }`}>
                  {settlement.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-white">
                    {settlement.periodStart} ~ {settlement.periodEnd}
                  </div>
                  <div className="text-sm text-slate-500">
                    GMV {formatKRW(settlement.totalGMV)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 md:gap-8">
                <div className="text-right">
                  <div className="text-sm text-slate-400">정산액</div>
                  <div className="font-medium text-white">{formatKRW(settlement.netAmount)}</div>
                </div>
                <SettlementStatusBadge status={settlement.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Reports Content
function ReportsContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">리포트</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-green-500/50 transition-colors text-left">
          <BarChart3 className="w-8 h-8 text-green-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">월간 실적 리포트</h3>
          <p className="text-sm text-slate-400">가맹점별 GMV, 수수료 분석</p>
        </button>

        <button className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors text-left">
          <TrendingUp className="w-8 h-8 text-blue-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">성장 분석 리포트</h3>
          <p className="text-sm text-slate-400">월별 추이, 성장률 분석</p>
        </button>

        <button className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-colors text-left">
          <Building2 className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">가맹점 분석 리포트</h3>
          <p className="text-sm text-slate-400">업종별, 지역별 분석</p>
        </button>

        <button className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-orange-500/50 transition-colors text-left">
          <Download className="w-8 h-8 text-orange-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">데이터 다운로드</h3>
          <p className="text-sm text-slate-400">Excel, CSV 형식 내보내기</p>
        </button>
      </div>
    </div>
  );
}

// Settings Content
function SettingsContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">설정</h2>

      <div className="space-y-4">
        {/* Profile Section */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="text-lg font-medium text-white mb-4">프로필 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">대행사명</label>
              <input
                type="text"
                defaultValue="강남영업대행사"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">대표자명</label>
              <input
                type="text"
                defaultValue="홍길동"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">연락처</label>
              <input
                type="text"
                defaultValue="010-1234-5678"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">이메일</label>
              <input
                type="email"
                defaultValue="agency@gangnam.com"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Bank Account Section */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="text-lg font-medium text-white mb-4">정산 계좌 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">은행</label>
              <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
                <option>신한은행</option>
                <option>국민은행</option>
                <option>우리은행</option>
                <option>하나은행</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">계좌번호</label>
              <input
                type="text"
                defaultValue="110-123-456789"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">예금주</label>
              <input
                type="text"
                defaultValue="(주)강남영업대행사"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="text-lg font-medium text-white mb-4">알림 설정</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white">결제 알림</div>
                <div className="text-sm text-slate-400">가맹점 결제 발생 시 알림</div>
              </div>
              <ToggleSwitch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white">정산 알림</div>
                <div className="text-sm text-slate-400">정산 완료 시 알림</div>
              </div>
              <ToggleSwitch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white">가맹점 승인 알림</div>
                <div className="text-sm text-slate-400">가맹점 심사 결과 알림</div>
              </div>
              <ToggleSwitch defaultChecked />
            </div>
          </div>
        </div>

        <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors">
          변경사항 저장
        </button>
      </div>
    </div>
  );
}

// Shared Components
function StatCard({
  title,
  value,
  subValue,
  trend,
  icon,
  color,
}: {
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

function CommissionStatusBadge({ status }: { status: 'pending' | 'confirmed' | 'settled' }) {
  const config = {
    pending: { text: '대기', className: 'bg-yellow-500/10 text-yellow-400' },
    confirmed: { text: '확정', className: 'bg-blue-500/10 text-blue-400' },
    settled: { text: '정산완료', className: 'bg-green-500/10 text-green-400' },
  };

  const { text, className } = config[status];

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${className}`}>
      {text}
    </span>
  );
}

function SettlementStatusBadge({ status }: { status: 'pending' | 'processing' | 'completed' }) {
  const config = {
    pending: { text: '예정', className: 'bg-yellow-500/10 text-yellow-400' },
    processing: { text: '처리중', className: 'bg-blue-500/10 text-blue-400' },
    completed: { text: '완료', className: 'bg-green-500/10 text-green-400' },
  };

  const { text, className } = config[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${className}`}>
      {text}
    </span>
  );
}

function ToggleSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <button
      onClick={() => setChecked(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        checked ? 'bg-green-500' : 'bg-slate-700'
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
          checked ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// Utility Functions
function formatKRW(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억`;
  }
  if (amount >= 10000) {
    return `₩${(amount / 10000).toFixed(0)}만`;
  }
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}
