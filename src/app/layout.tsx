import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '교실 마피아 추리 게임',
  description: '초등학교 6학년 교실용 마피아 추리 게임 - 선생님과 학생이 함께 즐기는 교육용 게임',
  keywords: ['마피아', '추리게임', '교실게임', '초등학교', '교육'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white">
        {children}
      </body>
    </html>
  );
}
