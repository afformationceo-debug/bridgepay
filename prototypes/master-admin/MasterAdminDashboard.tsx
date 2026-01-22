// prototypes/master-admin/MasterAdminDashboard.tsx
// 본사 운영 어드민 대시보드

'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Wallet,
  BarChart3,
  Settings,
  Shield,
  Bell,
  Search,
  Filter,
  Download,
  ChevronDown,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Globe,
  ArrowUpRight,
  MoreHorizontal,
  Eye,
  Edit,
  Pause,
  Trash2,
  Award,
  MapPin,
} from 'lucide-react';

// ============================================
// Types
// ============================================

interface Agency {
  id: string;
  name: string;
  type: 'master' | 'agency';
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  status: 'pending' | 'active' | 'suspended' | 'terminated';
  parentName?: string;
  exclusiveRegion?: string;
  merchantCount: number;
  monthlyGMV: number;
  monthlyCommission: number;
  commissionRate: number;
  createdAt: string;
}

interface SystemStats {
  totalAgencies: number;
  activeAgencies: number;
  pendingAgencies: number;
  totalMerchants: number;
  totalGMV: number;
  totalCommission: number;
  pendingSettlements: number;
}

// ============================================
// Mock Data
// ============================================

const mockStats: SystemStats = {
  totalAgencies: 128,
  activeAgencies: 112,
  pendingAgencies: 16,
  totalMerchants: 1250,
  totalGMV: 85000000000,
  totalCommission: 425000000,
  pendingSettlements: 156000000,
};

const mockAgencies: Agency[] = [
  { 
    id: 'A001', 
    name: '서울총판', 
    type: 'master', 
    tier: 'platinum', 
    status: 'active',
    exclusiveRegion: '서울특별시',
    merchantCount: 245, 
    monthlyGMV: 25000000000, 
    monthlyCommission: 125000000,
    commissionRate: 0.30,
    createdAt: '2025-06-15'
  },
  { 
    id: 'A002', 
    name: '강남영업대행사', 
    type: 'agency', 
    tier: 'gold', 
    status: 'active',
    parentName: '서울총판',
    merchantCount: 45, 
    monthlyGMV: 2450000000, 
    monthlyCommission: 12250000,
    commissionRate: 0.20,
    createdAt: '2025-08-20'
  },
  { 
    id: 'A003', 
    name: '경기총판', 
    type: 'master', 
    tier: 'gold', 
    status: 'active',
    exclusiveRegion: '경기도',
    merchantCount: 180, 
    monthlyGMV: 18000000000, 
    monthlyCommission: 90000000,
    commissionRate: 0.25,
    createdAt: '2025-07-01'
  },
  { 
    id: 'A004', 
    name: '분당영업팀', 
    type: 'agency', 
    tier: 'silver', 
    status: 'pending',
    merchantCount: 0, 
    monthlyGMV: 0, 
    monthlyCommission: 0,
    commissionRate: 0.15,
    createdAt: '2026-01-18'
  },
  { 
    id: 'A005', 
    name: '부산총판', 
    type: 'master', 
    tier: 'silver', 
    status: 'active',
    exclusiveRegion: '부산광역시',
    merchantCount: 85, 
    monthlyGMV: 8500000000, 
    monthlyCommission: 42500000,
    commissionRate: 0.20,
    createdAt: '2025-09-10'
  },
];

// ============================================
// Main Component
// ============================================

export default function MasterAdminDashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [stats] = useState<SystemStats>(mockStats);
  const [agencies] = useState<Agency[]>(mockAgencies);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <MasterSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <MasterHeader />
        
        <main className="flex-1 p-6 overflow-auto">
          {activeMenu === 'dashboard' && (
            <MasterDashboardContent stats={stats} agencies={agencies} />
          )}
          {activeMenu === 'agencies' && (
            <AgenciesManagement agencies={agencies} />
          )}
          {activeMenu === 'merchants' && (
            <MerchantsOverview />
          )}
          {activeMenu === 'settlements' && (
            <SettlementsManagement />
          )}
          {activeMenu === 'analytics' && (
            <AnalyticsContent />
          )}
        </main>
      </div>
    </div>
  );
}

// ============================================
// Sidebar
// ============================================

function MasterSidebar({ activeMenu, setActiveMenu }: { activeMenu: string; setActiveMenu: (m: string) => void }) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: '대시보드' },
    { id: 'agencies', icon: Users, label: '대행사 관리', badge: 16 },
    { id: 'merchants', icon: Building2, label: '가맹점 현황' },
    { id: 'settlements', icon: Wallet, label: '정산 관리', badge: 12 },
    { id: 'analytics', icon: BarChart3, label: '실적 분석' },
    { id: 'policies', icon: Shield, label: '정책 관리' },
    { id: 'settings', icon: Settings, label: '시스템 설정' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
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
      <nav className="flex-1 p-4 space-y-1">
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
            {item.badge && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      
      {/* Admin Info */}
      <div className="p-4 border-t border-slate-800">
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
          <div className="text-sm font-medium text-white mb-1">시스템 관리자</div>
          <div className="text-xs text-slate-500">admin@afformation.io</div>
        </div>
      </div>
    </aside>
  );
}

// ============================================
// Header
// ============================================

function MasterHeader() {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-white">운영 관리</h1>
        <p className="text-xs text-slate-500">Afformation 본사</p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="검색..."
            className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 w-64"
          />
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}

// ============================================
// Dashboard Content
// ============================================

function MasterDashboardContent({ stats, agencies }: { stats: SystemStats; agencies: Agency[] }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="전체 GMV"
          value={formatLargeKRW(stats.totalGMV)}
          subValue="이번 달"
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="대행사 수수료"
          value={formatLargeKRW(stats.totalCommission)}
          subValue="이번 달 지급 예정"
          icon={<Wallet className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="활성 대행사"
          value={`${stats.activeAgencies}개`}
          subValue={`심사대기 ${stats.pendingAgencies}개`}
          icon={<Users className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="전체 가맹점"
          value={`${stats.totalMerchants.toLocaleString()}개`}
          subValue="누적"
          icon={<Building2 className="w-5 h-5" />}
          color="orange"
        />
      </div>
      
      {/* Pending Reviews */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">심사 대기</h2>
          </div>
          <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-sm rounded-full">
            {agencies.filter(a => a.status === 'pending').length}건
          </span>
        </div>
        
        <div className="divide-y divide-slate-800">
          {agencies.filter(a => a.status === 'pending').map((agency) => (
            <div key={agency.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-medium text-white">{agency.name}</div>
                  <div className="text-sm text-slate-500">
                    {agency.type === 'master' ? '총판 신청' : '대행사 신청'} · {agency.createdAt}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg">
                  승인
                </button>
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">
                  검토
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Top Agencies */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Top 대행사 (GMV 기준)</h2>
        </div>
        
        <div className="divide-y divide-slate-800">
          {agencies
            .filter(a => a.status === 'active')
            .sort((a, b) => b.monthlyGMV - a.monthlyGMV)
            .slice(0, 5)
            .map((agency, index) => (
            <div key={agency.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{agency.name}</span>
                    <TierBadge tier={agency.tier} />
                    {agency.type === 'master' && (
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs rounded">
                        총판
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">
                    가맹점 {agency.merchantCount}개 · {agency.exclusiveRegion || agency.parentName}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-white">{formatLargeKRW(agency.monthlyGMV)}</div>
                <div className="text-sm text-green-400">
                  수수료 {formatLargeKRW(agency.monthlyCommission)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Agencies Management
// ============================================

function AgenciesManagement({ agencies }: { agencies: Agency[] }) {
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredAgencies = agencies.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">대행사 관리</h2>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg">
            <Download className="w-4 h-4" />
            내보내기
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
            대행사 추가
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="대행사 검색..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500"
          />
        </div>
        <select
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">전체 유형</option>
          <option value="master">총판</option>
          <option value="agency">대행사</option>
        </select>
        <select
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">전체 상태</option>
          <option value="active">활성</option>
          <option value="pending">심사중</option>
          <option value="suspended">정지</option>
        </select>
      </div>
      
      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="p-4 text-left text-slate-400 font-medium text-sm">대행사</th>
              <th className="p-4 text-left text-slate-400 font-medium text-sm">유형/등급</th>
              <th className="p-4 text-left text-slate-400 font-medium text-sm">지역/상위</th>
              <th className="p-4 text-right text-slate-400 font-medium text-sm">가맹점</th>
              <th className="p-4 text-right text-slate-400 font-medium text-sm">월 GMV</th>
              <th className="p-4 text-right text-slate-400 font-medium text-sm">수수료율</th>
              <th className="p-4 text-center text-slate-400 font-medium text-sm">상태</th>
              <th className="p-4 text-right text-slate-400 font-medium text-sm">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredAgencies.map((agency) => (
              <tr key={agency.id} className="hover:bg-slate-800/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                      {agency.type === 'master' ? (
                        <Globe className="w-5 h-5 text-purple-400" />
                      ) : (
                        <Users className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-white">{agency.name}</span>
                      <div className="text-xs text-slate-500">{agency.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded w-fit ${
                      agency.type === 'master' 
                        ? 'bg-purple-500/10 text-purple-400' 
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {agency.type === 'master' ? '총판' : '대행사'}
                    </span>
                    <TierBadge tier={agency.tier} />
                  </div>
                </td>
                <td className="p-4 text-slate-400">
                  {agency.exclusiveRegion && (
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="w-3 h-3" />
                      {agency.exclusiveRegion}
                    </div>
                  )}
                  {agency.parentName && (
                    <div className="text-sm text-slate-500">
                      └ {agency.parentName}
                    </div>
                  )}
                </td>
                <td className="p-4 text-right text-white">{agency.merchantCount}</td>
                <td className="p-4 text-right text-white">{formatLargeKRW(agency.monthlyGMV)}</td>
                <td className="p-4 text-right text-green-400">{(agency.commissionRate * 100).toFixed(0)}%</td>
                <td className="p-4 text-center">
                  <AgencyStatusBadge status={agency.status} />
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-2 text-slate-400 hover:text-white">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-yellow-400">
                      <Pause className="w-4 h-4" />
                    </button>
                  </div>
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
// Other Content Components
// ============================================

function MerchantsOverview() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">가맹점 현황</h2>
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center">
        <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">전체 가맹점 현황이 여기에 표시됩니다.</p>
      </div>
    </div>
  );
}

function SettlementsManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">정산 관리</h2>
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center">
        <Wallet className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">대행사 정산 관리가 여기에 표시됩니다.</p>
      </div>
    </div>
  );
}

function AnalyticsContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">실적 분석</h2>
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center">
        <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">실적 분석 차트가 여기에 표시됩니다.</p>
      </div>
    </div>
  );
}

// ============================================
// Shared Components
// ============================================

function StatCard({ title, value, subValue, icon, color }: {
  title: string;
  value: string;
  subValue: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-500">{subValue}</div>
      <div className="text-xs text-slate-600 mt-2">{title}</div>
    </div>
  );
}

function TierBadge({ tier }: { tier: 'platinum' | 'gold' | 'silver' | 'bronze' }) {
  const config = {
    platinum: { color: 'bg-purple-500/10 text-purple-400', icon: Award },
    gold: { color: 'bg-yellow-500/10 text-yellow-400', icon: Award },
    silver: { color: 'bg-gray-500/10 text-gray-400', icon: Award },
    bronze: { color: 'bg-orange-500/10 text-orange-400', icon: Award },
  };
  
  const { color, icon: Icon } = config[tier];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${color}`}>
      <Icon className="w-3 h-3" />
      {tier}
    </span>
  );
}

function AgencyStatusBadge({ status }: { status: 'pending' | 'active' | 'suspended' | 'terminated' }) {
  const config = {
    active: { icon: CheckCircle, text: '활성', className: 'bg-green-500/10 text-green-400' },
    pending: { icon: Clock, text: '심사중', className: 'bg-yellow-500/10 text-yellow-400' },
    suspended: { icon: Pause, text: '정지', className: 'bg-orange-500/10 text-orange-400' },
    terminated: { icon: XCircle, text: '해지', className: 'bg-red-500/10 text-red-400' },
  };
  
  const { icon: Icon, text, className } = config[status];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      {text}
    </span>
  );
}

// ============================================
// Utility Functions
// ============================================

function formatLargeKRW(amount: number): string {
  if (amount >= 100000000000) {
    return `${(amount / 100000000000).toFixed(1)}천억`;
  }
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(0)}억`;
  }
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(0)}천만`;
  }
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}
