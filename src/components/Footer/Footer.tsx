'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface FooterProps {
  simplified?: boolean;
  transparent?: boolean;
}

export const Footer = ({ simplified = false, transparent = false }: FooterProps) => {
  const [isHovering, setIsHovering] = useState('');

  // Current year for copyright
  const currentYear = new Date().getFullYear();

  // Background styles based on transparent prop
  const bgStyle = transparent ? 'bg-transparent border-gray-100/30' : 'bg-white border-gray-100';

  // Simplified footer just shows copyright and logo
  if (simplified) {
    return (
      <footer className={`py-6 ${bgStyle} border-t relative z-10`}>
        <div className="container max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Flock Logo"
                width={32}
                height={32}
                className="h-5 w-5 transition-transform hover:scale-110 duration-300 cursor-pointer"
              />
              <span className="text-sm font-medium text-[#F28B82]">Flock</span>
            </div>
            <div className="text-xs text-[#333333]/60">
              © {currentYear} Flock. Made with 🦩 for BC Eagles.
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`${bgStyle} border-t relative z-10 py-4`}>
      <div className="container max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-2.5">
            <div
              className="relative h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-300 hover:scale-110 cursor-pointer"
              onMouseEnter={() => setIsHovering('logo')}
              onMouseLeave={() => setIsHovering('')}
            >
              <Image src="/logo.svg" alt="Flock Logo" fill className="object-contain" />
              {isHovering === 'logo' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#F28B82] rounded-full animate-ping" />
              )}
            </div>
            <span className="text-lg font-medium text-[#F28B82]">Flock</span>
          </div>

          {/* Copyright */}
          <div className="text-xs text-[#333333]/60 order-3 sm:order-2">
            © {currentYear} Flock. Made with 🦩 for BC Eagles.
          </div>

          {/* Links */}
          <div className="flex gap-4 order-2 sm:order-3">
            <Link
              href="/privacy"
              className="text-xs text-[#333333]/70 hover:text-[#F28B82] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/tos"
              className="text-xs text-[#333333]/70 hover:text-[#F28B82] transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-xs text-[#333333]/70 hover:text-[#F28B82] transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
