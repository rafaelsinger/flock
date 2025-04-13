import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FC, ReactNode } from 'react';
import QueryProvider from '@/providers/QueryProvider';
import { AuthProvider } from '@/components/SessionProvider';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flock',
  description:
    'Connecting graduating students by showing where their classmates are landing postgrad.',
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = async ({ children }) => {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={inter.className}>
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
