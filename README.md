# LINE Unify Pay - 한국 가맹점 결제 시스템

> **Afformation x Kaia Foundation x LINE NEXT**  
> 한국 병원/뷰티 매장 독점 스테이블코인 결제 인프라

---

## 📋 프로젝트 개요

### 비전
"PG 수수료 없는 국경 없는 결제" - LINE Unify 기반 스테이블코인 결제로 기존 PG 수수료(2.5~3.5%)를 혁신적으로 절감

### 핵심 가치
- **가맹점**: 즉시 정산 + 수수료 절감
- **고객(일본/대만 관광객)**: LINE 앱 하나로 원클릭 결제
- **Afformation**: 가맹점 네트워크 확보 → 플랫폼 수수료 BM

### 사업 구조
```
┌─────────────────────────────────────────────────────────────────┐
│                    LINE Unify 생태계                              │
├─────────────────────────────────────────────────────────────────┤
│  [고객 - 일본/대만]          [인프라]              [가맹점 - 한국]   │
│                                                                  │
│  LINE Messenger    ──→   Kaia Blockchain   ──→   병원/뷰티매장    │
│       ↓                       ↓                       ↓         │
│  Unify Wallet          스테이블코인            Merchant Admin      │
│  (JPY/TWD→USDT)         전송/정산            (Afformation 제공)   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  환전 수수료: Kaia 부담  │  정산: 실시간  │  BM: Afformation 자유 설계 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 문서 구조

```
line-unify-pay/
├── README.md                          # 이 파일
├── docs/
│   ├── 01-PRD.md                      # 제품 요구사항 정의서
│   ├── 02-TECHNICAL-ARCHITECTURE.md   # 기술 아키텍처
│   ├── 03-DB-SCHEMA.md                # Supabase DB 스키마
│   ├── 04-API-SPECIFICATION.md        # API 명세서
│   ├── 05-KAIA-SDK-REQUEST.md         # 카이아재단 SDK/API 요청서
│   ├── 06-ERROR-HANDLING.md           # 에러 핸들링 정책
│   ├── 07-SECURITY-SPEC.md            # 보안 명세
│   └── 08-DEVELOPMENT-GUIDE.md        # 개발 가이드
├── prototypes/
│   ├── merchant-landing/              # 가맹점 유치 랜딩페이지
│   ├── merchant-admin/                # 가맹점 어드민 대시보드
│   └── payment-flow/                  # 결제 플로우 프로토타입
└── assets/
    └── qr-designs/                    # QR 디자인 시안
```

---

## 🎯 MVP 범위 (2026년 3월 런칭)

### Phase 1: Core (3월)
- [ ] 가맹점 온보딩 랜딩페이지
- [ ] 가맹점 어드민 (기본 기능)
- [ ] QR 코드 결제 (MPM 방식)
- [ ] 실시간 결제 알림

### Phase 2: Scale (4~5월)
- [ ] 정산 자동화
- [ ] 매출 리포트/분석
- [ ] 다중 지점 관리

### Phase 3: Expand (6월~)
- [ ] 올리브영 등 뷰티 매장 확대
- [ ] 마케팅 연동 (인플레오스)

---

## 🔗 관련 링크

- [토스페이먼츠](https://www.tosspayments.com/) - 가맹점 UX 벤치마크
- [WalletConnect Pay](https://walletconnect.com/) - 기술 레퍼런스
- [Kaia Docs](https://docs.kaia.io/) - 블록체인 인프라
- [LINE Developers](https://developers.line.biz/) - LINE 연동

---

## 👥 담당

| 역할 | 담당자 | 비고 |
|------|--------|------|
| 기획/사업 | 지현근 대표 | 가맹점 영업, 카이아 협력 |
| 개발 | 지웅근 대표 | 풀스택 개발 |
| AI 설계 | Claude | 문서화, 아키텍처 |

---

*최종 업데이트: 2026년 1월*
