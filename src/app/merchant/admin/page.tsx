// src/app/merchant/admin/page.tsx
// 가맹점 어드민 대시보드 - 3D UI 적용

'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  BarChart3,
  Settings,
  QrCode,
  Users,
  LogOut,
  Bell,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  RefreshCw,
  Download,
  Search,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  Volume2,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

// 3D 컴포넌트 동적 임포트
const TransactionStream3D = dynamic(
  () => import('@/components/3d/dashboard/TransactionStream3D').then((mod) => mod.TransactionStream3D),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full rounded-2xl bg-slate-800/50 animate-pulse flex items-center justify-center">
        <div className="text-slate-500 text-sm">3D 로딩 중...</div>
      </div>
    )
  }
);

const RevenueChart3D = dynamic(
  () => import('@/components/3d/dashboard/RevenueChart3D').then((mod) => mod.RevenueChart3D),
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] w-full rounded-2xl bg-slate-800/50 animate-pulse" />
    )
  }
);

// ============================================
// Types
// ============================================

interface Payment {
  id: string;
  amount_krw: number;
  amount_crypto: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  customer_country: string;
  created_at: string;
}

interface DashboardStats {
  today_revenue: number;
  today_count: number;
  month_revenue: number;
  month_count: number;
  balance: number;
  pending_settlement: number;
}

// ============================================
// Mock Data
// ============================================

const mockStats: DashboardStats = {
  today_revenue: 4500000,
  today_count: 15,
  month_revenue: 120000000,
  month_count: 380,
  balance: 15000.5,
  pending_settlement: 0,
};

const mockPayments: Payment[] = [
  { id: 'PAY001', amount_krw: 350000, amount_crypto: 234.5, currency: 'USDT', status: 'completed', customer_country: 'JP', created_at: '2026-01-22T10:30:00Z' },
  { id: 'PAY002', amount_krw: 1200000, amount_crypto: 804.2, currency: 'USDT', status: 'completed', customer_country: 'TW', created_at: '2026-01-22T10:15:00Z' },
  { id: 'PAY003', amount_krw: 500000, amount_crypto: 335.1, currency: 'USDT', status: 'pending', customer_country: 'JP', created_at: '2026-01-22T10:00:00Z' },
  { id: 'PAY004', amount_krw: 800000, amount_crypto: 536.2, currency: 'USDT', status: 'completed', customer_country: 'JP', created_at: '2026-01-22T09:45:00Z' },
  { id: 'PAY005', amount_krw: 250000, amount_crypto: 167.5, currency: 'USDT', status: 'failed', customer_country: 'TW', created_at: '2026-01-22T09:30:00Z' },
];

// ============================================
// Main Dashboard Component
// ============================================

export default function MerchantAdminDashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [stats] = useState<DashboardStats>(mockStats);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 실시간 결제 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newPayment: Payment = {
          id: `PAY${Date.now()}`,
          amount_krw: Math.floor(Math.random() * 1000000) + 100000,
          amount_crypto: Math.random() * 500 + 50,
          currency: 'USDT',
          status: 'completed',
          customer_country: Math.random() > 0.5 ? 'JP' : 'TW',
          created_at: new Date().toISOString(),
        };

        setPayments(prev => [newPayment, ...prev.slice(0, 9)]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [soundEnabled]);

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
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {activeMenu === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardContent stats={stats} payments={payments} />
              </motion.div>
            )}
            {activeMenu === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PaymentsContent payments={payments} />
              </motion.div>
            )}
            {activeMenu === 'settlements' && (
              <motion.div
                key="settlements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SettlementsContent stats={stats} />
              </motion.div>
            )}
            {activeMenu === 'qr' && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <QRCodeContent />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ============================================
// Sidebar
// ============================================

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ activeMenu, setActiveMenu, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: '대시보드' },
    { id: 'payments', icon: CreditCard, label: '결제 관리' },
    { id: 'settlements', icon: Wallet, label: '정산 관리' },
    { id: 'reports', icon: BarChart3, label: '리포트' },
    { id: 'qr', icon: QrCode, label: 'QR 코드' },
    { id: 'staff', icon: Users, label: '직원 관리' },
    { id: 'settings', icon: Settings, label: '설정' },
  ];

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);
    onClose();
  };

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-50
      w-64 bg-slate-900 border-r border-slate-800 flex flex-col
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm sm:text-base">Unify Pay</div>
            <div className="text-xs text-slate-500">가맹점 어드민</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all ${
              activeMenu === item.id
                ? 'bg-blue-500/10 text-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
            {activeMenu === item.id && (
              <ChevronRight className="w-4 h-4 ml-auto" />
            )}
          </button>
        ))}
      </nav>

      {/* Merchant Info */}
      <div className="p-3 sm:p-4 border-t border-slate-800">
        <div className="p-3 sm:p-4 bg-slate-800/50 rounded-xl">
          <div className="text-sm font-medium text-white mb-1">강남피부과</div>
          <div className="text-xs text-slate-500">owner@gangnam-derm.com</div>
        </div>
        <button className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-white text-sm transition-colors">
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}

// ============================================
// Header
// ============================================

interface HeaderProps {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onMenuClick: () => void;
}

function Header({ soundEnabled, setSoundEnabled, onMenuClick }: HeaderProps) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <header className="h-14 sm:h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-white">대시보드</h1>
          <p className="text-xs text-slate-500 hidden sm:block">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg transition-colors ${
            soundEnabled ? 'bg-blue-500/10 text-blue-400' : 'text-slate-500 hover:text-white'
          }`}
          title={soundEnabled ? '알림 사운드 켜짐' : '알림 사운드 꺼짐'}
        >
          <Volume2 className="w-5 h-5" />
        </button>

        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <button className="p-2 text-slate-400 hover:text-white transition-colors hidden sm:block">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

// ============================================
// Dashboard Content
// ============================================

interface DashboardContentProps {
  stats: DashboardStats;
  payments: Payment[];
}

function DashboardContent({ stats, payments }: DashboardContentProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="오늘 매출"
          value={formatKRW(stats.today_revenue)}
          subValue={`${stats.today_count}건`}
          trend={12.5}
          icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="blue"
        />
        <StatCard
          title="이번 달 매출"
          value={formatKRW(stats.month_revenue)}
          subValue={`${stats.month_count}건`}
          trend={8.2}
          icon={<BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="purple"
        />
        <StatCard
          title="현재 잔액"
          value={`${stats.balance.toLocaleString()}`}
          subValue="USDT"
          icon={<Wallet className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="green"
        />
        <StatCard
          title="출금 가능"
          value={`${(stats.balance - stats.pending_settlement).toLocaleString()}`}
          subValue="USDT"
          icon={<ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="orange"
        />
      </div>

      {/* 3D Transaction Stream */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-white">실시간 거래 스트림</h2>
          <span className="flex items-center gap-2 text-sm text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live
          </span>
        </div>
        <div className="p-4">
          <TransactionStream3D payments={payments} />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Payments */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800">
            <h2 className="text-base sm:text-lg font-semibold text-white">최근 결제</h2>
          </div>

          <div className="divide-y divide-slate-800">
            {payments.slice(0, 5).map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </div>

          <div className="p-3 sm:p-4 border-t border-slate-800">
            <button className="w-full py-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              전체 결제 내역 보기 →
            </button>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800">
            <h2 className="text-base sm:text-lg font-semibold text-white">주간 매출 추이</h2>
          </div>
          <div className="p-4">
            <RevenueChart3D />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <QuickActionCard
          title="정산 요청"
          description="현재 잔액을 출금하세요"
          icon={<Wallet className="w-5 h-5 sm:w-6 sm:h-6" />}
          action="출금하기"
        />
        <QuickActionCard
          title="QR 코드"
          description="결제 QR을 다운로드하세요"
          icon={<QrCode className="w-5 h-5 sm:w-6 sm:h-6" />}
          action="다운로드"
        />
        <QuickActionCard
          title="리포트"
          description="이번 달 매출 리포트"
          icon={<BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />}
          action="보기"
        />
      </div>
    </div>
  );
}

// ============================================
// Payments Content
// ============================================

interface PaymentsContentProps {
  payments: Payment[];
}

function PaymentsContent({ payments }: PaymentsContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPayments = payments.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchTerm && !p.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white">결제 관리</h2>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm">
          <Download className="w-4 h-4" />
          내보내기
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="결제 ID로 검색..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">전체 상태</option>
          <option value="completed">완료</option>
          <option value="pending">대기</option>
          <option value="failed">실패</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="p-3 sm:p-4 text-left text-slate-400 font-medium text-xs sm:text-sm">결제 ID</th>
              <th className="p-3 sm:p-4 text-left text-slate-400 font-medium text-xs sm:text-sm">금액</th>
              <th className="p-3 sm:p-4 text-left text-slate-400 font-medium text-xs sm:text-sm">상태</th>
              <th className="p-3 sm:p-4 text-left text-slate-400 font-medium text-xs sm:text-sm">국가</th>
              <th className="p-3 sm:p-4 text-left text-slate-400 font-medium text-xs sm:text-sm">일시</th>
              <th className="p-3 sm:p-4 text-right text-slate-400 font-medium text-xs sm:text-sm">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-800/50">
                <td className="p-3 sm:p-4">
                  <span className="font-mono text-xs sm:text-sm text-white">{payment.id}</span>
                </td>
                <td className="p-3 sm:p-4">
                  <div className="text-white font-medium text-xs sm:text-sm">{formatKRW(payment.amount_krw)}</div>
                  <div className="text-slate-500 text-xs">{payment.amount_crypto.toFixed(2)} {payment.currency}</div>
                </td>
                <td className="p-3 sm:p-4">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="p-3 sm:p-4">
                  <CountryFlag country={payment.customer_country} />
                </td>
                <td className="p-3 sm:p-4 text-slate-400 text-xs sm:text-sm">
                  {formatDateTime(payment.created_at)}
                </td>
                <td className="p-3 sm:p-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// Settlements Content
// ============================================

interface SettlementsContentProps {
  stats: DashboardStats;
}

function SettlementsContent({ stats }: SettlementsContentProps) {
  const [withdrawAmount, setWithdrawAmount] = useState('');

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold text-white">정산 관리</h2>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-5 sm:p-6"
      >
        <div className="text-blue-100 text-sm mb-2">현재 잔액</div>
        <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
          {stats.balance.toLocaleString()} <span className="text-lg sm:text-xl">USDT</span>
        </div>
        <div className="text-blue-200 text-sm">
          ≈ {formatKRW(stats.balance * 1492)}
        </div>
      </motion.div>

      {/* Withdrawal Form */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">출금 요청</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">출금 금액 (USDT)</label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-lg sm:text-xl font-medium placeholder-slate-600 focus:outline-none focus:border-blue-500"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <button
                onClick={() => setWithdrawAmount(stats.balance.toString())}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-lg hover:bg-blue-500/20 transition-colors"
              >
                전액
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">예상 원화 금액</span>
              <span className="text-white">
                {withdrawAmount ? formatKRW(parseFloat(withdrawAmount) * 1492) : '₩0'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">출금 수수료</span>
              <span className="text-green-400">무료</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">입금 예정 계좌</span>
              <span className="text-white">신한 110-***-456789</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            출금 요청하기
          </motion.button>
        </div>
      </div>

      {/* Recent Settlements */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800">
          <h3 className="font-semibold text-white">정산 내역</h3>
        </div>

        <div className="p-6 text-center text-slate-500">
          아직 정산 내역이 없습니다.
        </div>
      </div>
    </div>
  );
}

// ============================================
// QR Code Content
// ============================================

function QRCodeContent() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold text-white">QR 코드 관리</h2>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* QR Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6"
        >
          <h3 className="font-semibold text-white mb-4">결제 QR 코드</h3>

          <div className="bg-white p-4 sm:p-6 rounded-xl mb-4">
            <div className="w-full aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-24 h-24 sm:w-32 sm:h-32 text-slate-800" />
            </div>
          </div>

          <div className="text-center mb-4">
            <div className="font-medium text-white">강남피부과</div>
            <div className="text-sm text-slate-500">QR 스캔으로 결제</div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              다운로드
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
            >
              인쇄
            </motion.button>
          </div>
        </motion.div>

        {/* QR Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6"
        >
          <h3 className="font-semibold text-white mb-4">QR 설정</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">QR 이름</label>
              <input
                type="text"
                defaultValue="메인 카운터"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">상태</label>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-green-400 text-sm">활성화됨</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">총 스캔 횟수</label>
              <div className="text-xl sm:text-2xl font-bold text-white">1,523회</div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">마지막 스캔</label>
              <div className="text-white text-sm">2026-01-22 10:30:25</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// Shared Components
// ============================================

interface StatCardProps {
  title: string;
  value: string;
  subValue: string;
  trend?: number;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

function StatCard({ title, value, subValue, trend, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs sm:text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-lg sm:text-2xl font-bold text-white mb-1 truncate">{value}</div>
      <div className="text-xs sm:text-sm text-slate-500">{subValue}</div>
      <div className="text-xs text-slate-600 mt-2">{title}</div>
    </motion.div>
  );
}

interface PaymentRowProps {
  payment: Payment;
}

function PaymentRow({ payment }: PaymentRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 sm:p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <CountryFlag country={payment.customer_country} />
        <div>
          <div className="font-medium text-white text-sm sm:text-base">{formatKRW(payment.amount_krw)}</div>
          <div className="text-xs sm:text-sm text-slate-500">{payment.amount_crypto.toFixed(2)} {payment.currency}</div>
        </div>
      </div>
      <div className="text-right">
        <StatusBadge status={payment.status} />
        <div className="text-xs text-slate-500 mt-1">{formatTime(payment.created_at)}</div>
      </div>
    </motion.div>
  );
}

interface StatusBadgeProps {
  status: 'completed' | 'pending' | 'failed';
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    completed: { icon: CheckCircle, text: '완료', className: 'bg-green-500/10 text-green-400' },
    pending: { icon: Clock, text: '대기', className: 'bg-yellow-500/10 text-yellow-400' },
    failed: { icon: XCircle, text: '실패', className: 'bg-red-500/10 text-red-400' },
  };

  const { icon: Icon, text, className } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      {text}
    </span>
  );
}

function CountryFlag({ country }: { country: string }) {
  const flags: Record<string, string> = {
    JP: '🇯🇵',
    TW: '🇹🇼',
    US: '🇺🇸',
  };

  return (
    <span className="text-lg sm:text-xl" title={country}>
      {flags[country] || '🌍'}
    </span>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
}

function QuickActionCard({ title, description, icon, action }: QuickActionCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 flex items-center justify-between"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
          {icon}
        </div>
        <div>
          <div className="font-medium text-white text-sm sm:text-base">{title}</div>
          <div className="text-xs sm:text-sm text-slate-500">{description}</div>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm rounded-lg transition-colors"
      >
        {action}
      </motion.button>
    </motion.div>
  );
}

// ============================================
// Utility Functions
// ============================================

function formatKRW(amount: number): string {
  if (amount >= 100000000) {
    return `₩${(amount / 100000000).toFixed(1)}억`;
  }
  if (amount >= 10000) {
    return `₩${(amount / 10000).toFixed(0)}만`;
  }
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
