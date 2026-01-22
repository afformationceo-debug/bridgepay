// src/app/admin/page.tsx
// 마스터 어드민 대시보드 - 본사 운영 관리 시스템

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  TrendingUp,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Menu,
  X,
  Shield,
  Globe,
  Activity,
  FileText,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

// 3D 컴포넌트 동적 임포트
const SystemStats3D = dynamic(
  () => import('@/components/3d/admin/SystemStats3D').then((mod) => mod.SystemStats3D),
  { ssr: false, loading: () => <div className="h-[200px] bg-slate-800/50 rounded-2xl animate-pulse" /> }
);

// Types
interface SystemStats {
  totalGMV: number;
  todayGMV: number;
  totalMerchants: number;
  activeMerchants: number;
  pendingMerchants: number;
  totalAgencies: number;
  activeAgencies: number;
  totalPayments: number;
  todayPayments: number;
  pendingSettlements: number;
}

interface Agency {
  id: string;
  name: string;
  type: 'master' | 'agency';
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  status: 'active' | 'pending' | 'suspended';
  merchantCount: number;
  monthlyGMV: number;
  commission: number;
  createdAt: string;
}

interface MerchantApplication {
  id: string;
  name: string;
  category: string;
  agencyName: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  documents: string[];
}

// Mock Data
const mockStats: SystemStats = {
  totalGMV: 125000000000,
  todayGMV: 850000000,
  totalMerchants: 523,
  activeMerchants: 485,
  pendingMerchants: 38,
  totalAgencies: 45,
  activeAgencies: 42,
  totalPayments: 15820,
  todayPayments: 342,
  pendingSettlements: 8,
};

const mockAgencies: Agency[] = [
  { id: 'A001', name: '서울총판', type: 'master', tier: 'platinum', status: 'active', merchantCount: 125, monthlyGMV: 45000000000, commission: 225000000, createdAt: '2025-06-01' },
  { id: 'A002', name: '강남영업대행사', type: 'agency', tier: 'gold', status: 'active', merchantCount: 45, monthlyGMV: 12500000000, commission: 62500000, createdAt: '2025-08-15' },
  { id: 'A003', name: '부산지역총판', type: 'master', tier: 'gold', status: 'active', merchantCount: 85, monthlyGMV: 28000000000, commission: 140000000, createdAt: '2025-07-01' },
  { id: 'A004', name: '경기영업대행사', type: 'agency', tier: 'silver', status: 'pending', merchantCount: 0, monthlyGMV: 0, commission: 0, createdAt: '2026-01-20' },
  { id: 'A005', name: '인천영업대행사', type: 'agency', tier: 'bronze', status: 'active', merchantCount: 12, monthlyGMV: 2800000000, commission: 14000000, createdAt: '2025-11-10' },
];

const mockApplications: MerchantApplication[] = [
  { id: 'APP001', name: '청담뷰티클리닉', category: '뷰티', agencyName: '강남영업대행사', status: 'pending', appliedAt: '2026-01-22', documents: ['사업자등록증', '통장사본'] },
  { id: 'APP002', name: '역삼피부과', category: '병원', agencyName: '강남영업대행사', status: 'pending', appliedAt: '2026-01-21', documents: ['사업자등록증', '통장사본', '의료기관개설허가증'] },
  { id: 'APP003', name: '분당성형외과', category: '병원', agencyName: '경기영업대행사', status: 'pending', appliedAt: '2026-01-20', documents: ['사업자등록증'] },
];

// Main Component
export default function MasterAdminDashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats] = useState<SystemStats>(mockStats);
  const [agencies] = useState<Agency[]>(mockAgencies);
  const [applications] = useState<MerchantApplication[]>(mockApplications);

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
      <AdminSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingCount={stats.pendingMerchants}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {activeMenu === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminDashboardContent stats={stats} agencies={agencies} applications={applications} />
              </motion.div>
            )}
            {activeMenu === 'agencies' && (
              <motion.div
                key="agencies"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AgenciesContent agencies={agencies} />
              </motion.div>
            )}
            {activeMenu === 'merchants' && (
              <motion.div
                key="merchants"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <MerchantsReviewContent applications={applications} />
              </motion.div>
            )}
            {activeMenu === 'settlements' && (
              <motion.div
                key="settlements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SettlementsAdminContent />
              </motion.div>
            )}
            {activeMenu === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AnalyticsContent stats={stats} />
              </motion.div>
            )}
            {activeMenu === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminSettingsContent />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Sidebar Component
function AdminSidebar({
  activeMenu,
  setActiveMenu,
  isOpen,
  onClose,
  pendingCount,
}: {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isOpen: boolean;
  onClose: () => void;
  pendingCount: number;
}) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: '대시보드' },
    { id: 'agencies', icon: Users, label: '에이전시 관리' },
    { id: 'merchants', icon: Building2, label: '가맹점 심사', badge: pendingCount },
    { id: 'settlements', icon: Wallet, label: '정산 관리' },
    { id: 'analytics', icon: BarChart3, label: '분석/리포트' },
    { id: 'settings', icon: Settings, label: '시스템 설정' },
  ];

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 border-r border-slate-800 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white lg:hidden"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-white">Master Admin</div>
            <div className="text-xs text-slate-500">Unify Pay 운영</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveMenu(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeMenu === item.id
                ? 'bg-red-500/10 text-red-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              {item.label}
            </div>
            {item.badge && item.badge > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Admin Info */}
      <div className="p-4 border-t border-slate-800">
        <div className="p-4 bg-slate-800/50 rounded-xl">
          <div className="text-sm font-medium text-white mb-1">관리자</div>
          <div className="text-xs text-slate-500">admin@afformation.io</div>
        </div>
      </div>
    </aside>
  );
}

// Header Component
function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
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
          <h1 className="text-lg font-semibold text-white">운영 대시보드</h1>
          <p className="text-xs text-slate-500">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="p-2 text-slate-400 hover:text-white">
          <Activity className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

// Dashboard Content
function AdminDashboardContent({
  stats,
  agencies,
  applications,
}: {
  stats: SystemStats;
  agencies: Agency[];
  applications: MerchantApplication[];
}) {
  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="총 GMV"
          value={formatKRW(stats.totalGMV)}
          subValue={`오늘 ${formatKRW(stats.todayGMV)}`}
          trend={18.5}
          icon={<TrendingUp className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          title="전체 가맹점"
          value={`${stats.totalMerchants}개`}
          subValue={`활성 ${stats.activeMerchants}개 / 심사중 ${stats.pendingMerchants}개`}
          icon={<Building2 className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="에이전시"
          value={`${stats.totalAgencies}개`}
          subValue={`활성 ${stats.activeAgencies}개`}
          icon={<Users className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="오늘 결제"
          value={`${stats.todayPayments}건`}
          subValue={`미정산 ${stats.pendingSettlements}건`}
          trend={12.3}
          icon={<CreditCard className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/* 3D Stats Visualization */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">시스템 현황</h3>
        <SystemStats3D stats={stats} />
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Applications */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">심사 대기 가맹점</h3>
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                {applications.filter(a => a.status === 'pending').length}
              </span>
            </div>
            <button className="text-sm text-red-400 hover:text-red-300">전체 보기 →</button>
          </div>
          <div className="divide-y divide-slate-800">
            {applications.slice(0, 3).map((app) => (
              <div key={app.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{app.name}</div>
                    <div className="text-sm text-slate-500">{app.agencyName} · {app.appliedAt}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-sm hover:bg-green-500/20">
                    승인
                  </button>
                  <button className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20">
                    반려
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Agencies */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Top 에이전시</h3>
            <button className="text-sm text-red-400 hover:text-red-300">전체 보기 →</button>
          </div>
          <div className="divide-y divide-slate-800">
            {agencies.slice(0, 4).map((agency, index) => (
              <div key={agency.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-400/20 text-gray-400' :
                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-white">{agency.name}</div>
                    <div className="text-sm text-slate-500">
                      가맹점 {agency.merchantCount}개
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{formatKRW(agency.monthlyGMV)}</div>
                  <TierBadge tier={agency.tier} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">시스템 알림</h3>
        <div className="space-y-3">
          <AlertItem
            type="warning"
            message="에이전시 '경기영업대행사' 심사 대기 중 (3일 경과)"
            time="2시간 전"
          />
          <AlertItem
            type="info"
            message="1월 정산 일괄 처리 예정 (2026-02-15)"
            time="오늘"
          />
          <AlertItem
            type="success"
            message="서울총판 등급 플래티넘 달성"
            time="어제"
          />
        </div>
      </div>
    </div>
  );
}

// Agencies Content
function AgenciesContent({ agencies }: { agencies: Agency[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredAgencies = agencies.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">에이전시 관리</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
          <Users className="w-4 h-4" />
          에이전시 등록
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="에이전시 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-500"
        >
          <option value="all">전체 유형</option>
          <option value="master">총판</option>
          <option value="agency">대행사</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="p-4 text-left text-slate-400 font-medium text-sm">에이전시</th>
              <th className="p-4 text-left text-slate-400 font-medium text-sm">유형</th>
              <th className="p-4 text-left text-slate-400 font-medium text-sm">등급</th>
              <th className="p-4 text-left text-slate-400 font-medium text-sm">상태</th>
              <th className="p-4 text-right text-slate-400 font-medium text-sm">가맹점</th>
              <th className="p-4 text-right text-slate-400 font-medium text-sm">월 GMV</th>
              <th className="p-4 text-right text-slate-400 font-medium text-sm">수수료</th>
              <th className="p-4 text-center text-slate-400 font-medium text-sm">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredAgencies.map((agency) => (
              <tr key={agency.id} className="hover:bg-slate-800/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      agency.type === 'master' ? 'bg-purple-500/10' : 'bg-blue-500/10'
                    }`}>
                      <Users className={`w-4 h-4 ${
                        agency.type === 'master' ? 'text-purple-400' : 'text-blue-400'
                      }`} />
                    </div>
                    <span className="font-medium text-white">{agency.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    agency.type === 'master'
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {agency.type === 'master' ? '총판' : '대행사'}
                  </span>
                </td>
                <td className="p-4"><TierBadge tier={agency.tier} /></td>
                <td className="p-4"><AgencyStatusBadge status={agency.status} /></td>
                <td className="p-4 text-right text-white">{agency.merchantCount}개</td>
                <td className="p-4 text-right text-white">{formatKRW(agency.monthlyGMV)}</td>
                <td className="p-4 text-right text-green-400">{formatKRW(agency.commission)}</td>
                <td className="p-4 text-center">
                  <button className="p-2 text-slate-400 hover:text-white">
                    <Settings className="w-4 h-4" />
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

// Merchants Review Content
function MerchantsReviewContent({ applications }: { applications: MerchantApplication[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">가맹점 심사</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{applications.filter(a => a.status === 'pending').length}</div>
              <div className="text-sm text-slate-400">심사 대기</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">485</div>
              <div className="text-sm text-slate-400">이번 달 승인</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-sm text-slate-400">이번 달 반려</div>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">심사 대기 목록</h3>
        </div>
        <div className="divide-y divide-slate-800">
          {applications.map((app) => (
            <div key={app.id} className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white text-lg">{app.name}</div>
                    <div className="text-sm text-slate-400">{app.category} · {app.agencyName}</div>
                    <div className="flex items-center gap-2 mt-2">
                      {app.documents.map((doc, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">{app.appliedAt}</span>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                    승인
                  </button>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                    반려
                  </button>
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
                    상세
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Settlements Admin Content
function SettlementsAdminContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">정산 관리</h2>

      {/* Pending Settlements */}
      <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-red-100 text-sm mb-2">이번 달 총 정산 예정</div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">₩4.85억</div>
            <div className="text-red-200 text-sm">에이전시 45개 · 가맹점 523개</div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm">
              정산 내역 확인
            </button>
            <button className="px-4 py-2 bg-white text-red-600 rounded-lg font-medium text-sm hover:bg-red-50 transition-colors">
              일괄 정산 실행
            </button>
          </div>
        </div>
      </div>

      {/* Settlement Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="text-lg font-medium text-white mb-4">정산 일정</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">가맹점 정산</span>
              <span className="text-white font-medium">D+0 (실시간)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">에이전시 정산</span>
              <span className="text-white font-medium">월 1회 (15일)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">총판 정산</span>
              <span className="text-white font-medium">월 1회 (20일)</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="text-lg font-medium text-white mb-4">수수료율 설정</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">기본 가맹점 수수료</span>
              <span className="text-white font-medium">0.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Platinum 에이전시</span>
              <span className="text-white font-medium">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Gold 에이전시</span>
              <span className="text-white font-medium">20%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Analytics Content
function AnalyticsContent({ stats }: { stats: SystemStats }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">분석/리포트</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-red-500/50 transition-colors text-left">
          <BarChart3 className="w-8 h-8 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">GMV 분석</h3>
          <p className="text-sm text-slate-400">일별/월별 거래액 추이</p>
        </button>

        <button className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors text-left">
          <Globe className="w-8 h-8 text-blue-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">지역별 분석</h3>
          <p className="text-sm text-slate-400">에이전시/가맹점 지역 분포</p>
        </button>

        <button className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-colors text-left">
          <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">성장률 분석</h3>
          <p className="text-sm text-slate-400">가맹점/거래액 성장 추이</p>
        </button>

        <button className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-green-500/50 transition-colors text-left">
          <Users className="w-8 h-8 text-green-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">에이전시 실적</h3>
          <p className="text-sm text-slate-400">에이전시별 성과 비교</p>
        </button>

        <button className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-orange-500/50 transition-colors text-left">
          <FileText className="w-8 h-8 text-orange-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">월간 보고서</h3>
          <p className="text-sm text-slate-400">종합 월간 리포트 생성</p>
        </button>

        <button className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-colors text-left">
          <Activity className="w-8 h-8 text-cyan-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">실시간 모니터링</h3>
          <p className="text-sm text-slate-400">트랜잭션 실시간 현황</p>
        </button>
      </div>
    </div>
  );
}

// Admin Settings Content
function AdminSettingsContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">시스템 설정</h2>

      <div className="space-y-4">
        {/* Fee Settings */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="text-lg font-medium text-white mb-4">수수료 정책</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">기본 가맹점 수수료</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue="0.5"
                  step="0.1"
                  className="w-24 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
                <span className="text-slate-400">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">최소 수수료</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue="100"
                  className="w-24 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
                <span className="text-slate-400">원</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Settings */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="text-lg font-medium text-white mb-4">등급 기준</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <span className="text-slate-400">등급</span>
              <span className="text-slate-400">월 GMV 기준</span>
              <span className="text-slate-400">수수료 배분</span>
            </div>
            {[
              { tier: 'Platinum', gmv: '50억+', rate: '25%' },
              { tier: 'Gold', gmv: '20억+', rate: '20%' },
              { tier: 'Silver', gmv: '5억+', rate: '15%' },
              { tier: 'Bronze', gmv: '신규', rate: '10%' },
            ].map((item) => (
              <div key={item.tier} className="grid grid-cols-3 gap-4 items-center">
                <span className="text-white font-medium">{item.tier}</span>
                <input
                  type="text"
                  defaultValue={item.gmv}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                />
                <input
                  type="text"
                  defaultValue={item.rate}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors">
          설정 저장
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
  color: 'red' | 'blue' | 'purple' | 'green';
}) {
  const colorClasses = {
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
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

function TierBadge({ tier }: { tier: 'platinum' | 'gold' | 'silver' | 'bronze' }) {
  const config = {
    platinum: { label: 'Platinum', className: 'bg-purple-500/10 text-purple-400' },
    gold: { label: 'Gold', className: 'bg-yellow-500/10 text-yellow-400' },
    silver: { label: 'Silver', className: 'bg-gray-400/10 text-gray-400' },
    bronze: { label: 'Bronze', className: 'bg-orange-500/10 text-orange-400' },
  };

  const { label, className } = config[tier];

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function AgencyStatusBadge({ status }: { status: 'active' | 'pending' | 'suspended' }) {
  const config = {
    active: { icon: CheckCircle, text: '활성', className: 'bg-green-500/10 text-green-400' },
    pending: { icon: Clock, text: '심사중', className: 'bg-yellow-500/10 text-yellow-400' },
    suspended: { icon: XCircle, text: '정지', className: 'bg-red-500/10 text-red-400' },
  };

  const { icon: Icon, text, className } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      {text}
    </span>
  );
}

function AlertItem({
  type,
  message,
  time,
}: {
  type: 'warning' | 'info' | 'success';
  message: string;
  time: string;
}) {
  const config = {
    warning: { icon: AlertTriangle, className: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
    info: { icon: Activity, className: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
    success: { icon: CheckCircle, className: 'bg-green-500/10 border-green-500/30 text-green-400' },
  };

  const { icon: Icon, className } = config[type];

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${className}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-white text-sm">{message}</p>
      </div>
      <span className="text-xs text-slate-500">{time}</span>
    </div>
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
