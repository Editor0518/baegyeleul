import { GameContextProvider } from '@/contexts/GameContext';
import './globals.css';

// Next.js에서 public 폴더의 파일은 런타임에 fetch로 로드
export const metadata = {
  title: '한여름밤 사랑의 꿈',
  description: 'Interactive Visual Novel Game',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <GameContextProvider>
          {children}
        </GameContextProvider>
      </body>
    </html>
  );
}
