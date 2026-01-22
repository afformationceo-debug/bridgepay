// src/app/merchant/page.tsx
// 가맹점 유치 랜딩페이지 - 3D 블록체인 UI 적용

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  Wallet,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  CheckCircle,
  Building,
  Phone,
  Mail,
  FileText,
  ArrowRight,
  Globe,
  Users,
  TrendingUp
} from 'lucide-react';

// 3D 컴포넌트 동적 임포트 (SSR 비활성화)
const HeroSection3D = dynamic(
  () => import('@/components/3d/landing/HeroSection3D').then((mod) => mod.HeroSection3D),
  { ssr: false }
);

const FeatureCard3D = dynamic(
  () => import('@/components/3d/shared/FeatureCard3D').then((mod) => mod.FeatureCard3D),
  { ssr: false, loading: () => <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/50 animate-pulse h-48" /> }
);

// PaymentFlowDemo3D 동적 임포트
const PaymentFlowDemo3D = dynamic(
  () => import('@/components/3d/landing/PaymentFlowDemo3D').then((mod) => mod.PaymentFlowDemo3D),
  { ssr: false, loading: () => (
    <div className="h-[500px] w-full rounded-2xl bg-slate-800/50 animate-pulse flex items-center justify-center">
      <div className="text-slate-500">결제 플로우 로딩 중...</div>
    </div>
  )}
);

// PaymentFlowDemo2D 폴백
const PaymentFlowDemo2D = dynamic(
  () => import('@/components/3d/landing/PaymentFlowDemo3D').then((mod) => mod.PaymentFlowDemo2D),
  { ssr: false }
);

// ============================================
// Landing Page Component
// ============================================

export default function MerchantLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Comparison Section */}
      <ComparisonSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Application Form */}
      <ApplicationSection />

      {/* FAQ Section */}
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
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Unify Pay</span>
          </div>

          {/* CTA */}
          <a
            href="#apply"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            가맹점 신청
          </a>
        </div>
      </div>
    </header>
  );
}

// ============================================
// Hero Section with 3D Background
// ============================================

function HeroSection() {
  return (
    <section className="relative min-h-screen pt-16 overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 w-full h-full">
        <HeroSection3D className="w-full h-full" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full text-blue-400 text-sm mb-8"
          >
            <Zap className="w-4 h-4" />
            <span>LINE Unify 공식 파트너</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg px-2"
          >
            수수료{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              0%
            </span>
            ,{' '}
            정산{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
              1일
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 sm:mb-10 max-w-3xl mx-auto drop-shadow px-4"
          >
            LINE 유니파이로 일본・대만 관광객 결제를 혁신하세요.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            기존 PG 수수료 2.5~3.5%를 절감하고, 실시간 정산을 경험하세요.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.a
              href="#apply"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              지금 신청하기
              <ArrowRight className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="#how-it-works"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700/80 text-white font-medium rounded-xl transition-colors border border-slate-600"
            >
              자세히 알아보기
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 sm:mt-16 grid grid-cols-3 gap-3 sm:gap-8 max-w-2xl mx-auto px-2"
          >
            {[
              { value: '53+', label: '파트너 병원' },
              { value: '30억+', label: '연간 거래액' },
              { value: '1만+', label: '해외 고객' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-slate-700/50"
              >
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-slate-400 text-xs sm:text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-slate-400"
        >
          <span className="text-xs">스크롤하여 더 알아보기</span>
          <ChevronRight className="w-5 h-5 rotate-90" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================
// Benefits Section
// ============================================

function BenefitsSection() {
  const benefits = [
    {
      icon: <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: '수수료 최소화',
      description: '기존 카드결제 2.5~3.5% → 0.5% 이하로 대폭 절감',
      color: 'blue',
    },
    {
      icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: '실시간 정산',
      description: '기존 D+3~7일 → 즉시 정산으로 현금 흐름 개선',
      color: 'green',
    },
    {
      icon: <Globe className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: '글로벌 결제',
      description: '일본, 대만, 영미권 관광객 원클릭 결제',
      color: 'purple',
    },
    {
      icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: '안전한 거래',
      description: '블록체인 기반 투명하고 안전한 결제',
      color: 'orange',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  };

  return (
    <section className="py-16 sm:py-20 px-4 bg-slate-800/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">왜 Unify Pay인가요?</h2>
          <p className="text-slate-400 text-sm sm:text-base">해외 환자 결제의 모든 불편함을 해결합니다</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <FeatureCard3D className="h-full">
                <div className="p-4 sm:p-6 bg-slate-800/80 rounded-2xl border border-slate-700/50 h-full">
                  <motion.div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 border ${colorClasses[benefit.color as keyof typeof colorClasses]}`}
                    whileHover={{ y: -4, scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {benefit.icon}
                  </motion.div>
                  <h3 className="text-sm sm:text-lg font-semibold text-white mb-1 sm:mb-2">{benefit.title}</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">{benefit.description}</p>
                </div>
              </FeatureCard3D>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// Comparison Section
// ============================================

function ComparisonSection() {
  return (
    <section className="py-16 sm:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">기존 결제 vs Unify Pay</h2>
          <p className="text-slate-400 text-sm sm:text-base">한눈에 비교하세요</p>
        </div>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-x-auto">
          <table className="w-full min-w-[320px]">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="p-3 sm:p-4 text-left text-slate-400 font-medium text-xs sm:text-sm">항목</th>
                <th className="p-3 sm:p-4 text-center text-slate-400 font-medium text-xs sm:text-sm">기존 PG</th>
                <th className="p-3 sm:p-4 text-center text-blue-400 font-medium bg-blue-500/5 text-xs sm:text-sm">Unify Pay</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/30">
                <td className="p-3 sm:p-4 text-white text-xs sm:text-sm">결제 수수료</td>
                <td className="p-3 sm:p-4 text-center text-slate-400 text-xs sm:text-sm">2.5~3.5%</td>
                <td className="p-3 sm:p-4 text-center text-green-400 font-semibold bg-blue-500/5 text-xs sm:text-sm">0~0.5%</td>
              </tr>
              <tr className="border-b border-slate-700/30">
                <td className="p-3 sm:p-4 text-white text-xs sm:text-sm">정산 주기</td>
                <td className="p-3 sm:p-4 text-center text-slate-400 text-xs sm:text-sm">D+3~7</td>
                <td className="p-3 sm:p-4 text-center text-green-400 font-semibold bg-blue-500/5 text-xs sm:text-sm">즉시(D+0)</td>
              </tr>
              <tr className="border-b border-slate-700/30">
                <td className="p-3 sm:p-4 text-white text-xs sm:text-sm">해외 결제</td>
                <td className="p-3 sm:p-4 text-center text-slate-400 text-xs sm:text-sm">추가 수수료</td>
                <td className="p-3 sm:p-4 text-center text-green-400 font-semibold bg-blue-500/5 text-xs sm:text-sm">동일</td>
              </tr>
              <tr className="border-b border-slate-700/30">
                <td className="p-3 sm:p-4 text-white text-xs sm:text-sm">환율</td>
                <td className="p-3 sm:p-4 text-center text-slate-400 text-xs sm:text-sm">불리한 환율</td>
                <td className="p-3 sm:p-4 text-center text-green-400 font-semibold bg-blue-500/5 text-xs sm:text-sm">실시간 최적</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 text-white text-xs sm:text-sm">가입 난이도</td>
                <td className="p-3 sm:p-4 text-center text-slate-400 text-xs sm:text-sm">복잡(2-4주)</td>
                <td className="p-3 sm:p-4 text-center text-green-400 font-semibold bg-blue-500/5 text-xs sm:text-sm">간편(3일)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
          <p className="text-green-400 text-sm sm:text-base">
            월 매출 1억원 기준, <strong>연간 3,000만원 이상</strong> 수수료 절감 효과!
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================
// How It Works Section with 3D Payment Flow Demo
// ============================================

function HowItWorksSection() {
  const [use3D, setUse3D] = useState(true);

  const onboardingSteps = [
    {
      step: 1,
      title: '가맹점 신청',
      description: '온라인으로 간단히 신청\n사업자등록증, 통장사본만 준비',
    },
    {
      step: 2,
      title: '심사 & 승인',
      description: '영업일 기준 1-3일 내 심사\n승인 시 QR코드 즉시 발급',
    },
    {
      step: 3,
      title: 'QR 결제 시작',
      description: '고객이 LINE으로 QR 스캔\n원클릭으로 결제 완료',
    },
    {
      step: 4,
      title: '실시간 정산',
      description: '결제 즉시 지갑에 입금\n원할 때 출금',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 px-4 bg-slate-800/50 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">결제는 이렇게 진행됩니다</h2>
          <p className="text-slate-400 text-sm sm:text-base mb-4 sm:mb-6 px-2">고객의 QR 스캔부터 정산까지, 블록체인 기반 실시간 결제 플로우</p>

          {/* 3D/2D 토글 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-full">
            <span className={`text-sm ${use3D ? 'text-blue-400' : 'text-slate-400'}`}>3D 뷰</span>
            <button
              onClick={() => setUse3D(!use3D)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                use3D ? 'bg-blue-600' : 'bg-slate-600'
              }`}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full"
                animate={{ left: use3D ? '4px' : '28px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm ${!use3D ? 'text-blue-400' : 'text-slate-400'}`}>2D 뷰</span>
          </div>
        </motion.div>

        {/* 3D 결제 플로우 데모 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 sm:mb-20"
        >
          {use3D ? (
            <PaymentFlowDemo3D autoPlay={true} className="max-w-4xl mx-auto w-full" />
          ) : (
            <PaymentFlowDemo2D autoPlay={true} className="max-w-4xl mx-auto w-full" />
          )}
        </motion.div>

        {/* 가맹점 온보딩 단계 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">가맹점 등록 절차</h3>
          <p className="text-slate-400 text-sm sm:text-base">4단계로 간편하게 시작하세요</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {onboardingSteps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line - only on desktop */}
              {index < onboardingSteps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
              )}

              <div className="relative bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-700/50 text-center hover:border-blue-500/50 transition-colors h-full">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg shadow-blue-500/25"
                >
                  {item.step}
                </motion.div>
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm whitespace-pre-line">{item.description}</p>
              </div>
            </motion.div>
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
    businessName: '',
    businessNumber: '',
    representativeName: '',
    category: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 시뮬레이션
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
            영업일 기준 1-3일 내로 담당자가 연락드리겠습니다.
            <br />
            문의사항은 contact@unifypay.kr로 연락주세요.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            추가 신청하기
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="apply" className="py-16 sm:py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">가맹점 신청</h2>
          <p className="text-slate-400 text-sm sm:text-base">아래 정보를 입력하시면 담당자가 연락드립니다</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                상호명 *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="강남피부과"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                사업자등록번호 *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="123-45-67890"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  value={formData.businessNumber}
                  onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                대표자명 *
              </label>
              <input
                type="text"
                required
                placeholder="홍길동"
                className="w-full px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                value={formData.representativeName}
                onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                업종 *
              </label>
              <select
                required
                className="w-full px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">선택하세요</option>
                <option value="hospital">병원/의원</option>
                <option value="beauty">뷰티/피부과</option>
                <option value="plastic">성형외과</option>
                <option value="dental">치과</option>
                <option value="retail">소매/리테일</option>
                <option value="other">기타</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                연락처 *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                <input
                  type="tel"
                  required
                  placeholder="010-1234-5678"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                이메일 *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="info@example.com"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 sm:pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  가맹점 신청하기
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-slate-500 text-xs sm:text-sm">
            신청 후 영업일 기준 1-3일 내 담당자가 연락드립니다.
          </p>
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
      question: 'Unify Pay는 어떤 서비스인가요?',
      answer: 'Unify Pay는 LINE 유니파이 기반의 스테이블코인 결제 서비스입니다. 일본, 대만 등 해외 관광객이 LINE 앱으로 간편하게 결제할 수 있으며, 가맹점은 낮은 수수료와 빠른 정산 혜택을 받을 수 있습니다.',
    },
    {
      question: '기존 PG사와 함께 사용할 수 있나요?',
      answer: '네, 기존 PG사와 병행 사용이 가능합니다. Unify Pay는 해외 고객 결제를 위한 추가 결제 수단으로 도입하실 수 있습니다.',
    },
    {
      question: '정산은 어떻게 받나요?',
      answer: '결제 즉시 가맹점 지갑에 스테이블코인(USDT)이 입금됩니다. LINE 유니파이 앱에서 원화로 환전 후 본인 계좌로 출금하실 수 있습니다.',
    },
    {
      question: '수수료는 정확히 얼마인가요?',
      answer: '현재 프로모션 기간으로 결제 수수료 0%를 적용하고 있습니다. 프로모션 종료 후에도 기존 PG사 대비 최대 80% 저렴한 수수료를 유지할 예정입니다.',
    },
    {
      question: '어떤 업종이 가입할 수 있나요?',
      answer: '병원, 피부과, 성형외과, 치과, 뷰티샵, 소매점 등 해외 고객 결제가 필요한 모든 업종에서 가입 가능합니다. 일부 업종은 심사가 필요할 수 있습니다.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-slate-800/50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">자주 묻는 질문</h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-3"
              >
                <span className="font-medium text-white text-sm sm:text-base">{faq.question}</span>
                <ChevronRight
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 transition-transform flex-shrink-0 ${
                    openIndex === index ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                  <p className="text-slate-400 text-sm sm:text-base">{faq.answer}</p>
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
    <footer className="py-8 sm:py-12 px-4 border-t border-slate-700/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-4 sm:gap-6 text-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">Unify Pay</span>
          </div>

          <div className="text-slate-400 text-xs sm:text-sm">
            <p>주식회사 어포메이션 | 서울시 강남구</p>
            <p className="mt-1">contact@afformation.io | 02-1234-5678</p>
          </div>

          <div className="text-slate-500 text-xs sm:text-sm">
            &copy; 2026 Afformation. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
