import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LINE Unify Pay - 가맹점 결제 시스템',
  description: '일본/대만 관광객 대상 블록체인 기반 스테이블코인 결제 인프라',
  keywords: ['결제', '블록체인', 'LINE', 'Unify', '가맹점', '스테이블코인', 'USDT'],
  authors: [{ name: 'Afformation' }],
  openGraph: {
    title: 'LINE Unify Pay',
    description: '수수료 0%, 정산 1일 - 해외 고객 결제의 혁신',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
