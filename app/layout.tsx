import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: (() => {
    const raw = process.env.NEXT_PUBLIC_URL ?? '';
    try { return new URL(raw.startsWith('http') ? raw : `https://${raw}`); }
    catch { return new URL('https://benefitaccess.vercel.app'); }
  })(),
  title: 'BenefitAccess — Discover What Support Is Available to You',
  description: 'A private, conversational guide to public benefits. No accounts, no data stored, no judgment. Tell us about your situation and we\'ll help you understand your options.',
  openGraph: {
    title: 'BenefitAccess — Discover What Support Is Available to You',
    description: 'A private, conversational guide to public benefits. Tell us about your situation.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6b8f71', // Sage green
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
