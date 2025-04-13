'use client';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/Button';
import { ArrowRight, ChevronDown, GraduationCap, Users } from 'lucide-react';
import { DemoSection } from './Demo/DemoSection';
import { CTASection } from './CTA/CTASection';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  // Handle sign in
  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/onboarding/step1' });
  };

  // Handle mouse move for parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = heroRef.current.getBoundingClientRect();

    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;

    // Limit rotation for better mobile experience
    const limitedX = Math.max(-0.5, Math.min(0.5, x));
    const limitedY = Math.max(-0.5, Math.min(0.5, y));

    setMousePosition({ x: limitedX, y: limitedY });
    setRotation({ x: limitedY * 10, y: limitedX * -10 });
  };

  // Handle scroll to demo
  const scrollToDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    demoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Animation on scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      }
    };

    // Trigger initial scroll check to handle page refreshes at scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll);

    // Trigger animation on initial load after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // Add touch move handler for mobile devices
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!heroRef.current || e.touches.length === 0) return;

      const touch = e.touches[0];
      const { clientX, clientY } = touch;
      const { width, height, left, top } = heroRef.current.getBoundingClientRect();

      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;

      // Limit for better mobile experience
      const limitedX = Math.max(-0.3, Math.min(0.3, x));
      const limitedY = Math.max(-0.3, Math.min(0.3, y));

      setMousePosition({ x: limitedX, y: limitedY });
      setRotation({ x: limitedY * 8, y: limitedX * -8 });
    };

    // Only add touch handlers on touch devices
    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('touchmove', handleTouchMove);
    }

    return () => {
      if (heroElement) {
        heroElement.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, []);

  return (
    <>
      {/* Full page background that extends beyond viewport bounds */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-[#FFF9F8]">
        <div
          className="absolute inset-0 w-[500vw] h-[500vh] left-[-200vw] top-[-200vh]"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(249, 197, 209, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(167, 215, 249, 0.3) 0%, transparent 50%),
              linear-gradient(to bottom, rgba(249, 197, 209, 0.1), rgba(255, 255, 255, 0.5), rgba(167, 215, 249, 0.1))
            `,
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen overflow-x-hidden">
        {/* Global gradient background covering entire page */}
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none will-change-transform">
          {/* Main gradient layer that stretches beyond the viewport */}
          <div
            className="absolute inset-0 w-[400vw] h-[400vh] left-[-150vw] top-[-150vh]"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(249, 197, 209, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(167, 215, 249, 0.3) 0%, transparent 50%),
                linear-gradient(to bottom, rgba(249, 197, 209, 0.1), rgba(255, 255, 255, 0.5), rgba(167, 215, 249, 0.1))
              `,
              transformOrigin: 'center center',
            }}
          />

          {/* Additional subtle gradients for depth */}
          <div className="absolute inset-0 w-[400vw] h-[400vh] left-[-150vw] top-[-150vh] overflow-visible">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(249,197,209,0.05)_0%,_transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(167,215,249,0.05)_0%,_transparent_70%)]" />
          </div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <Header transparent />

          {/* Hero Section with improved gradient coverage */}
          <section
            ref={heroRef}
            onMouseMove={handleMouseMove}
            className="relative h-screen flex items-center pt-16 md:pt-0 container max-w-6xl mx-auto px-4 md:px-6 overflow-visible"
          >
            {/* Hero section gradient overlay with parallax effect */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-visible will-change-transform">
              <div
                className="absolute w-[300%] h-[300%] left-[-100%] top-[-100%]"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(249, 197, 209, 0.2) 0%, transparent 40%),
                    radial-gradient(circle at 70% 70%, rgba(167, 215, 249, 0.2) 0%, transparent 40%)
                  `,
                  transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
                }}
              />
            </div>

            {/* Enhanced floating decorative elements - optimized for all screen sizes */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div
                className="absolute right-[25%] top-[20%] w-8 h-8 md:w-12 md:h-12 rounded-lg bg-[#F9C5D1]/40 animate-float-slow hidden sm:block"
                style={{
                  transform: `translate(${mousePosition.x * 40}px, ${mousePosition.y * 40}px) rotate(${rotation.x}deg)`,
                  willChange: 'transform',
                }}
              />
              <div
                className="absolute right-[35%] bottom-[25%] w-6 h-6 md:w-10 md:h-10 rounded-md bg-[#F28B82]/20 rotate-45 animate-float-fast hidden sm:block"
                style={{
                  transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px) rotate(${45 + rotation.y}deg)`,
                  willChange: 'transform',
                }}
              />
              <div
                className="absolute left-[30%] bottom-[15%] w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-[#F9C5D1]/30 animate-float-medium hidden sm:block"
                style={{
                  transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * 25}px)`,
                  willChange: 'transform',
                }}
              />
            </div>

            <div className="grid gap-8 lg:gap-16 md:grid-cols-2 items-center relative z-10 my-8 md:my-0">
              {/* Content Column - Enhanced with better animations */}
              <div className="flex flex-col space-y-8 max-w-lg">
                <div
                  className={`opacity-0 transform translate-y-8 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div className="px-3 py-1.5 bg-[#F28B82]/10 rounded-full border border-[#F28B82]/20 backdrop-blur-sm">
                      <span className="text-sm font-medium text-[#F28B82] flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        BC Exclusive
                      </span>
                    </div>
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#333333] leading-[1.1]">
                    Find where{' '}
                    <span className="bg-gradient-to-r from-[#F28B82] to-[#F9C5D1] bg-clip-text text-transparent animate-text-shimmer">
                      Eagles
                    </span>{' '}
                    land after graduation.
                  </h1>
                </div>

                <div
                  className={`opacity-0 transform translate-y-8 transition-all duration-700 delay-100 ease-out ${isVisible ? 'opacity-100 translate-y-0' : ''}`}
                >
                  <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-[#333333]/70">
                    Connect with classmates heading to your dream city, discover opportunities, and
                    build your BC network worldwide.
                  </p>
                </div>

                <div
                  className={`flex flex-col sm:flex-row gap-4 pt-4 opacity-0 transform translate-y-8 transition-all duration-700 delay-200 ease-out ${isVisible ? 'opacity-100 translate-y-0' : ''}`}
                >
                  <Button
                    onClick={handleSignIn}
                    size="large"
                    className="w-full sm:w-auto bg-[#F28B82] hover:bg-[#F28B82]/90 hover:translate-y-[-2px] text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group py-4 px-8 text-lg"
                  >
                    <span>Start with BC Email</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <div className="flex items-center justify-center mt-2 sm:mt-0 bg-white/80 backdrop-blur-sm py-2 px-4 rounded-lg border border-gray-100">
                    <Users className="w-4 h-4 mr-1.5 text-[#F28B82]" />
                    <span className="text-sm sm:text-base text-[#333333]/70">
                      <span className="font-medium">200+</span> BC grads joined
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive 3D Illustration - Enhanced with better 3D effects */}
              <div
                className={`relative flex items-center justify-center mx-auto md:mx-0 order-first md:order-last opacity-0 transform translate-x-8 transition-all duration-700 delay-300 ease-out ${isVisible ? 'opacity-100 translate-x-0' : ''}`}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br from-[#F9C5D1]/30 to-[#A7D7F9]/20 rounded-full blur-3xl opacity-60 animate-pulse-slow"
                  style={{
                    transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)`,
                  }}
                />

                {/* 3D Card effect - improved performance with will-change */}
                <div
                  className="relative h-[220px] w-[220px] sm:h-[280px] sm:w-[280px] md:h-[400px] md:w-[400px] transform perspective-1000 transition-transform duration-300 group"
                  style={{
                    transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1, 1, 1)`,
                    willChange: 'transform',
                  }}
                >
                  {/* Add reflection effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <Image
                    src="/logo.svg"
                    alt="Flock Illustration"
                    fill
                    className="object-contain drop-shadow-xl"
                    priority
                  />

                  {/* Add floating UI elements around illustration - hide on very small screens */}
                  <div className="absolute -right-4 top-1/4 p-2 bg-white rounded-lg shadow-lg animate-float-medium hidden sm:block">
                    <Users className="w-6 h-6 text-[#F28B82]" />
                  </div>

                  <div className="absolute -left-4 bottom-1/4 p-2 bg-white rounded-lg shadow-lg animate-float-slow hidden sm:block">
                    <Users className="w-6 h-6 text-[#A7D7F9]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Scroll Indicator - Adjusted position for mobile */}
            <div className="absolute bottom-2 sm:bottom-10 md:bottom-10 left-0 right-0 flex justify-center">
              <button
                onClick={scrollToDemo}
                className={`animate-bounce opacity-0 transition-opacity duration-500 delay-700 hover:text-[#F28B82] bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-md border border-gray-100 group cursor-pointer ${
                  isVisible ? 'opacity-100' : ''
                } relative -bottom-15 xs:top-0 sm:top-0`}
              >
                <ChevronDown className="w-6 h-6 text-[#F28B82]/70 group-hover:text-[#F28B82] transition-colors" />
              </button>
            </div>
          </section>

          {/* Demo Section Component */}
          <DemoSection isVisible={isVisible} handleSignIn={handleSignIn} demoRef={demoRef} />

          {/* CTA Section Component */}
          <CTASection handleSignIn={handleSignIn} />

          {/* Footer Component */}
          <Footer transparent />
        </div>
      </div>
    </>
  );
};
