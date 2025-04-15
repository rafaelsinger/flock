'use client';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  transparent?: boolean;
}

export const Header = ({ transparent = false }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle sign in
  const handleSignIn = () => {
    signIn('google');
  };

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    // Trigger initial scroll check to handle page refreshes at scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navBackground =
    isScrolled || !transparent ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent';

  const navPadding = isScrolled ? 'py-3' : 'py-4 sm:py-6';

  // Logo animation classes
  const logoAnimationClass = isScrolled ? 'scale-90 rotate-0' : 'scale-100 rotate-0 hover:rotate-3';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBackground} ${navPadding}`}
    >
      <div className="container max-w-6xl mx-auto px-4 md:px-6 flex justify-between items-center">
        {/* Logo with enhanced animation */}
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className={`relative h-8 w-8 transition-all duration-500 ${logoAnimationClass}`}>
              <Image src="/logo.svg" alt="Flock Logo" fill className="object-contain" />
              {/* Animated ring on hover */}
              <div className="absolute inset-0 rounded-full border-2 border-[#F28B82]/0 group-hover:border-[#F28B82]/30 group-hover:scale-125 transition-all duration-500"></div>
            </div>
            <span className="text-xl font-medium bg-gradient-to-r from-[#F28B82] to-[#F9C5D1] bg-clip-text text-transparent transition-all duration-300 group-hover:opacity-80">
              Flock
            </span>
          </Link>
        </div>

        {/* Sign In Button - Visible on both mobile and desktop */}
        <div>
          <Button
            onClick={handleSignIn}
            size="small"
            className="bg-gradient-to-r from-[#F28B82] to-[#F9C5D1] hover:from-[#F28B82]/90 hover:to-[#F9C5D1]/90 text-white shadow-sm hover:shadow-md hover:translate-y-[-1px] flex items-center gap-2 group transition-all duration-300 overflow-hidden relative"
          >
            {/* Background animation */}
            <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out transform skew-x-12 z-0"></div>
            <span className="relative z-10">Continue with BC Email</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
          </Button>
        </div>
      </div>
    </nav>
  );
};
