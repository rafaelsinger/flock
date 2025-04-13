import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FC, ReactNode } from 'react';
import QueryProvider from '@/providers/QueryProvider';
import { AuthProvider } from '@/components/SessionProvider';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#F28B82',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Flock',
  description:
    'Connecting graduating students by showing where their classmates are landing postgrad.',
  keywords: ['boston college', 'graduates', 'networking', 'alumni', 'bc eagles'],
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://getflock.app',
    title: 'Flock',
    description: 'See where BC grads are landing after graduation',
    siteName: 'Flock',
    images: [
      {
        url: '/web-app-manifest-512x512.png',
        width: 512,
        height: 512,
        alt: 'Flock Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flock',
    description: 'See where BC grads are landing after graduation',
    images: ['/web-app-manifest-512x512.png'],
  },
  appleWebApp: {
    title: 'Flock',
    statusBarStyle: 'default',
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = async ({ children }) => {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <AuthProvider session={session}>
          <QueryProvider>
            <main>{children}</main>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
