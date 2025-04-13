import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FC, ReactNode } from "react";
import QueryProvider from "@/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flock",
  description: "Connect, collaborate, and create together with your team",
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <QueryProvider>
          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
