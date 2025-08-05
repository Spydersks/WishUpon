
import type {Metadata} from 'next';
import { PT_Sans } from 'next/font/google'
import './globals.css';
import {cn} from '@/lib/utils';
import { ClientProvider } from './client-provider';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
});


export const metadata: Metadata = {
  title: 'WishUpon',
  description: 'A personalized scheduler for heartfelt messages.',
  manifest: '/site.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-body antialiased', ptSans.className)}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
