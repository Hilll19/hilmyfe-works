import type { Metadata } from 'next';
import Experience from '@/components/Experience';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hilmy Febrian — Engineering the connected factory',
  description: 'Fullstack developer and industrial digitalization engineer. Connecting factory floors, enterprise systems, and the people behind them.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Experience />{children}</body></html>;
}
