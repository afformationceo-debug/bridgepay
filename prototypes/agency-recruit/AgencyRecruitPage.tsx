// prototypes/agency-recruit/AgencyRecruitPage.tsx
// 영업대행사 모집 랜딩페이지

'use client';

import { useState } from 'react';
import {
  Users,
  Wallet,
  TrendingUp,
  Award,
  MapPin,
  Building2,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Phone,
  Mail,
  FileText,
  Globe,
  Zap,
  Shield,
  Clock,
  DollarSign,
} from 'lucide-react';

export default function AgencyRecruitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Benefits Section */}
      <BenefitsSection />
      
      {/* Commission Structure */}
      <CommissionSection />
      
      {/* Tier System */}
      <TierSection />
      
      {/* How to Join */}
      <HowToJoinSection />
      
      {/* Application Form */}
      <ApplicationSection />
      
      {/* FAQ */}
      <FAQSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

// ============================================
// Header
// ============================================

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Unify Pay Partner</span>
          </div>
          
          <a 
            href="#apply"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            파트너 신청
          </a>
        </div>
      </div>
    </header>
  );
}

// ============================================
// Hero Section
// ============================================

function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm mb-8">
          <Users className="w-4 h-4" />
          <span>영업대행사 파트너 모집</span>
        </div>
        
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          함께 성장할{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
            영업 파트너
          </span>를<br />
          찾습니다
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-3xl mx-auto">
          LINE Unify Pay의 공식 영업대행사가 되어
          <br />
          급성장하는 스테이블코인 결제 시장에서 새로운 수익을 창출하세요.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="#apply"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
          >
            지금 신청하기
            <ArrowRight className="w-5 h-5" />
          </a>
          <a 
            href="#benefits"
            className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors border border-slate-600"
          >
            혜택 알아보기
          </a>
        </div>
        
        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div>
            <div className="text-3xl font-bold text-white">최대 30%</div>
            <div className="text-slate-400 text-sm">수수료 쉐어</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">월 1회</div>
            <div className="text-slate-400 text-sm">정기 정산</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">전국</div>
            <div className="text-slate-400 text-sm">모집 지역</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// Benefits Section
// ============================================

function BenefitsSection() {
  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: '높은 수수료 쉐어',
      description: '가맹점 수수료의 최대 30%를 정산받으세요. 등급에 따라 차등 적용됩니다.',
      color: 'green',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: '성장하는 시장',
      description: '스테이블코인 결제는 연 300% 성장 중인 블루오션 시장입니다.',
      color: 'blue',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '독점 영업권',
      description: '총판 계약 시 지역 또는 업종별 독점 영업권을 부여합니다.',
      color: 'purple',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: '전담 지원',
      description: '영업 자료, 교육, 기술 지원을 전담 매니저가 제공합니다.',
      color: 'orange',
    },
  ];

  const colorClasses = {
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  };

  return (
    <section id="benefits" className="py-20 px-4 bg-slate-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">파트너 혜택</h2>
          <p className="text-slate-400">Unify Pay 파트너만의 특별한 혜택</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${colorClasses[benefit.color as keyof typeof colorClasses]}`}>
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
              <p className="text-slate-400 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// Commission Section
// ============================================

function CommissionSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">수익 구조</h2>
          <p className="text-slate-400">투명한 수수료 분배 시스템</p>
        </div>
        
        {/* Commission Flow */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 mb-8">
          <h3 className="text-lg font-semibold text-white mb-6 text-center">수수료 분배 예시</h3>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="text-center p-4 bg-slate-800 rounded-xl flex-1">
              <div className="text-2xl font-bold text-white">₩100만</div>
              <div className="text-sm text-slate-500">고객 결제</div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-500 rotate-90 md:rotate-0" />
            <div className="text-center p-4 bg-slate-800 rounded-xl flex-1">
              <div className="text-2xl font-bold text-blue-400">₩5,000</div>
              <div className="text-sm text-slate-500">가맹점 수수료 (0.5%)</div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-500 rotate-90 md:rotate-0" />
            <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex-1">
              <div className="text-2xl font-bold text-green-400">₩1,000</div>
              <div className="text-sm text-green-400/80">대행사 수익 (20%)</div>
            </div>
          </div>
          
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
            <p className="text-green-400">
              💰 가맹점 10개 유치, 월 GMV 10억 기준 = <strong>월 1,000만원</strong> 수익!
            </p>
          </div>
        </div>
        
        {/* Support Items */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="font-medium text-white mb-1">영업 자료 제공</div>
            <div className="text-sm text-slate-500">홍보물, 제안서, 계약서</div>
          </div>
          <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="font-medium text-white mb-1">전담 매니저</div>
            <div className="text-sm text-slate-500">1:1 영업 지원</div>
          </div>
          <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
            <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="font-medium text-white mb-1">정기 교육</div>
            <div className="text-sm text-slate-500">온/오프라인 교육</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// Tier Section
// ============================================

function TierSection() {
  const tiers = [
    {
      name: '총판 (Master)',
      rate: '30%',
      requirements: '보증금 1억+, 지역 계약',
      benefits: ['지역 독점권', '하위 대행사 모집권', '전담 매니저', 'VIP 지원'],
      color: 'from-purple-500 to-pink-500',
      badge: '🏆',
    },
    {
      name: '플래티넘',
      rate: '25%',
      requirements: '월 GMV 50억+',
      benefits: ['우선 지원', '마케팅 비용 지원', '분기 인센티브', '전담 매니저'],
      color: 'from-purple-400 to-purple-600',
      badge: '💎',
    },
    {
      name: '골드',
      rate: '20%',
      requirements: '월 GMV 20억+',
      benefits: ['홍보물 지원', '교육 우선 참여', '월간 리포트'],
      color: 'from-yellow-400 to-orange-500',
      badge: '🥇',
    },
    {
      name: '실버',
      rate: '15%',
      requirements: '월 GMV 5억+',
      benefits: ['기본 영업 자료', '온라인 교육', '그룹 지원'],
      color: 'from-gray-400 to-gray-500',
      badge: '🥈',
    },
    {
      name: '브론즈',
      rate: '10%',
      requirements: '신규 가입',
      benefits: ['온라인 교육', '기본 자료', '커뮤니티 참여'],
      color: 'from-orange-600 to-orange-700',
      badge: '🥉',
    },
  ];

  return (
    <section className="py-20 px-4 bg-slate-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">파트너 등급</h2>
          <p className="text-slate-400">실적에 따라 등급이 올라가고, 더 높은 수수료를 받습니다</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiers.slice(0, 3).map((tier, index) => (
            <div 
              key={index}
              className={`relative p-6 bg-slate-800/80 rounded-2xl border border-slate-700/50 ${
                index === 0 ? 'lg:col-span-1 border-purple-500/50' : ''
              }`}
            >
              {index === 0 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 text-white text-xs rounded-full">
                  최고 등급
                </div>
              )}
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{tier.badge}</div>
                <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                <div className={`text-3xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mt-2`}>
                  {tier.rate}
                </div>
                <div className="text-sm text-slate-500 mt-1">{tier.requirements}</div>
              </div>
              <ul className="space-y-2">
                {tier.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {tiers.slice(3).map((tier, index) => (
            <div 
              key={index}
              className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/50"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{tier.badge}</div>
                <div>
                  <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                  <div className={`text-xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                    {tier.rate}
                  </div>
                </div>
                <div className="ml-auto text-sm text-slate-500">{tier.requirements}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// How to Join Section
// ============================================

function HowToJoinSection() {
  const steps = [
    {
      step: 1,
      title: '파트너 신청',
      description: '온라인 신청서 작성\n사업자등록증 제출',
    },
    {
      step: 2,
      title: '심사 & 계약',
      description: '영업일 기준 3-5일\n계약서 작성',
    },
    {
      step: 3,
      title: '교육 이수',
      description: '온라인 교육 수강\n영업 자료 수령',
    },
    {
      step: 4,
      title: '영업 시작',
      description: '가맹점 유치 시작\n수수료 정산',
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">가입 절차</h2>
          <p className="text-slate-400">간단한 4단계로 파트너가 되세요</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-green-500 to-emerald-500" />
              )}
              
              <div className="relative bg-slate-800 p-6 rounded-2xl border border-slate-700/50 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm whitespace-pre-line">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// Application Section
// ============================================

function ApplicationSection() {
  const [formData, setFormData] = useState({
    companyName: '',
    businessNumber: '',
    representativeName: '',
    type: '',
    region: '',
    phone: '',
    email: '',
    experience: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section id="apply" className="py-20 px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">신청이 완료되었습니다!</h2>
          <p className="text-slate-400 mb-8">
            영업일 기준 3-5일 내로 담당자가 연락드리겠습니다.
            <br />
            문의: partner@unifypay.kr
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="apply" className="py-20 px-4 bg-slate-800/50">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">파트너 신청</h2>
          <p className="text-slate-400">아래 정보를 입력해 주세요</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                회사명 *
              </label>
              <input
                type="text"
                required
                placeholder="OO영업대행"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                사업자등록번호 *
              </label>
              <input
                type="text"
                required
                placeholder="123-45-67890"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                value={formData.businessNumber}
                onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                대표자명 *
              </label>
              <input
                type="text"
                required
                placeholder="홍길동"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                value={formData.representativeName}
                onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                신청 유형 *
              </label>
              <select
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="">선택하세요</option>
                <option value="master">총판 (지역 독점)</option>
                <option value="agency">일반 대행사</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              희망 영업 지역 *
            </label>
            <input
              type="text"
              required
              placeholder="서울 강남구, 경기 성남시 등"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                연락처 *
              </label>
              <input
                type="tel"
                required
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                이메일 *
              </label>
              <input
                type="email"
                required
                placeholder="partner@example.com"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              관련 경험 (선택)
            </label>
            <textarea
              rows={3}
              placeholder="PG, 결제, 영업 관련 경험이 있다면 알려주세요"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 resize-none"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                파트너 신청하기
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

// ============================================
// FAQ Section
// ============================================

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    {
      question: '개인사업자도 신청할 수 있나요?',
      answer: '네, 개인사업자도 신청 가능합니다. 다만 사업자등록증이 필수이며, 영업 관련 경험이 있으면 심사에 유리합니다.',
    },
    {
      question: '총판과 일반 대행사의 차이는 무엇인가요?',
      answer: '총판은 특정 지역에 대한 독점 영업권을 가지며, 해당 지역의 하위 대행사를 모집/관리할 수 있습니다. 일반 대행사는 본사 직영으로 운영되며 지역 제한 없이 영업할 수 있습니다.',
    },
    {
      question: '수수료 정산은 어떻게 받나요?',
      answer: '매월 1일~말일 발생한 수수료를 집계하여, 익월 15일에 등록된 계좌로 입금됩니다. 전용 파트너 포털에서 실시간으로 수수료를 확인할 수 있습니다.',
    },
    {
      question: '최소 유치 목표가 있나요?',
      answer: '신규 가입 시 최소 목표는 없습니다. 다만 등급 유지를 위해서는 일정 GMV가 필요하며, 6개월 이상 실적이 없으면 자동 해지될 수 있습니다.',
    },
    {
      question: '기존 PG 영업 경험이 있으면 우대하나요?',
      answer: '네, PG, VAN, 결제 관련 영업 경험이 있으면 심사에서 우대합니다. 또한 시작 등급을 실버 이상으로 부여받을 수 있습니다.',
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">자주 묻는 질문</h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <span className="font-medium text-white">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5">
                  <p className="text-slate-400">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// Footer
// ============================================

function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-slate-700/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Unify Pay Partner</span>
          </div>
          
          <div className="text-slate-400 text-sm text-center">
            <p>주식회사 어포메이션 | 서울시 강남구</p>
            <p>partner@afformation.io | 02-1234-5678</p>
          </div>
          
          <div className="text-slate-500 text-sm">
            © 2026 Afformation. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
