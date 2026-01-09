import { GameContextProvider } from '@/contexts/GameContext';
import './globals.css';
import storyData from '../public/storyData.json';

export const metadata = {
  title: storyData.gameInfo.title,
  description: 'Interactive Visual Novel Game',
  viewport: 'width=device-width, initial-scale=1.0',
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
