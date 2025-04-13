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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle sign in
  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/onboarding/step1' });
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
    isScrolled || !transparent || isMenuOpen
      ? 'bg-white/95 backdrop-blur-sm shadow-sm'
      : 'bg-transparent';

  const navPadding = isScrolled ? 'py-3' : 'py-4 sm:py-6';

  // Logo animation classes
  const logoAnimationClass = isScrolled ? 'scale-90 rotate-0' : 'scale-100 rotate-0 hover:rotate-3';

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
  };

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

        {/* Desktop Sign In Enhanced */}
        <div className="hidden md:block">
          <Button
            onClick={handleSignIn}
            size="small"
            className="bg-gradient-to-r from-[#F28B82] to-[#F9C5D1] hover:from-[#F28B82]/90 hover:to-[#F9C5D1]/90 text-white shadow-sm hover:shadow-md hover:translate-y-[-1px] flex items-center gap-2 group transition-all duration-300 overflow-hidden relative"
          >
            {/* Background animation */}
            <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out transform skew-x-12 z-0"></div>
            <span className="relative z-10">Sign in with BC Email</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
          </Button>
        </div>

        {/* Enhanced Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 hover:bg-white transition-all duration-300 group cursor-pointer"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <div className="relative w-6 h-6 flex items-center justify-center overflow-hidden">
            {/* Animated hamburger to X transition */}
            <span
              className={`absolute h-0.5 bg-[#333333] rounded-full transition-all duration-300 ${isMenuOpen ? 'w-0' : 'w-4'}`}
            ></span>
            <span
              className={`absolute h-0.5 bg-[#333333] rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 w-5' : 'w-4'}`}
            ></span>
            <span
              className={`absolute h-0.5 bg-[#333333] rounded-full transition-all duration-300 ${isMenuOpen ? '-rotate-45 w-5' : 'w-4'}`}
            ></span>
          </div>
          {/* Ripple effect on hover */}
          <span className="absolute inset-0 rounded-full bg-[#F9C5D1]/10 scale-0 group-hover:scale-100 transition-transform duration-300"></span>
        </button>

        {/* Enhanced Mobile Menu with animations - Fixed positioning issues */}
        {isMenuOpen && (
          <div
            className="md:hidden fixed inset-0 top-[60px] bg-white z-40 shadow-lg"
            style={{
              overflowY: 'auto',
              height: 'calc(100vh - 60px)',
            }}
          >
            <div className="container max-w-6xl mx-auto px-4 py-8 flex flex-col min-h-[calc(100vh-60px)]">
              {/* Enhanced mobile sign in button */}
              <div
                className="mt-auto py-6 transform transition-all duration-500"
                style={{
                  animation: 'fadeInUp 0.5s forwards',
                  animationDelay: '300ms',
                }}
              >
                <Button
                  onClick={handleSignIn}
                  size="large"
                  className="w-full bg-gradient-to-r from-[#F28B82] to-[#F9C5D1] hover:from-[#F28B82]/90 hover:to-[#F9C5D1]/90 text-white shadow-md flex items-center justify-center gap-2 group transition-all duration-200 py-4 overflow-hidden relative"
                >
                  {/* Background animation */}
                  <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out transform skew-x-12"></div>
                  <span className="relative z-10">Sign in with BC Email</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                </Button>

                {/* Additional help text */}
                <p className="text-center text-[#333333]/60 text-sm mt-4">
                  Boston College students only
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
