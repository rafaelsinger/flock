'use client';
import { useState, RefObject } from 'react';
import { Map } from '@/components/Map';
import { Button } from '@/components/Button';
import { MapPin, Building, Users, Lock, Search } from 'lucide-react';

interface DemoSectionProps {
  isVisible: boolean;
  handleSignIn: () => void;
  demoRef: RefObject<HTMLDivElement | null>;
}

export const DemoSection = ({ isVisible, handleSignIn, demoRef }: DemoSectionProps) => {
  const [activeTab, setActiveTab] = useState('map');

  return (
    <section ref={demoRef} className="relative py-16 md:py-24 bg-transparent">
      <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        <div
          className={`text-center mb-12 opacity-0 transform translate-y-8 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : ''}`}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-[#333333] mb-6 max-w-2xl mx-auto">
            See where Eagles are landing after graduation
          </h2>
          <p className="text-lg md:text-xl text-[#333333]/70 max-w-2xl mx-auto">
            Our interactive map shows you where BC grads are heading. Browse by location, company,
            or field of study.
          </p>
        </div>

        {/* Enhanced Tab Navigation with animation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-[#F9F9F9] p-1.5 rounded-xl shadow-sm">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-white shadow-sm text-[#F28B82] scale-105'
                  : 'text-[#333333]/70 hover:text-[#333333]'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Map View
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'companies'
                  ? 'bg-white shadow-sm text-[#F28B82] scale-105'
                  : 'text-[#333333]/70 hover:text-[#333333]'
              }`}
            >
              <Building className="w-4 h-4" />
              Companies
            </button>
            <button
              onClick={() => setActiveTab('classmates')}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'classmates'
                  ? 'bg-white shadow-sm text-[#F28B82] scale-105'
                  : 'text-[#333333]/70 hover:text-[#333333]'
              }`}
            >
              <Users className="w-4 h-4" />
              Classmates
            </button>
          </div>
        </div>

        {/* Enhanced Interactive Demo Content with glass morphism - consistent height */}
        <div className="bg-white/70 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-gray-100">
          {/* All tab contents have consistent height of 500px instead of 600px */}
          {activeTab === 'map' && (
            <div className="h-[500px] relative">
              <Map display={true} />
              {/* Enhanced blur overlay with interactive elements */}
              <div className="absolute inset-0 backdrop-blur-[6px] bg-white/30 flex flex-col items-center justify-center z-10">
                <div className="max-w-md mx-auto text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-[#F9C5D1]/20 rounded-full flex items-center justify-center mx-auto">
                      <Lock className="w-10 h-10 text-[#F28B82]" />
                    </div>
                    {/* Animated circles around lock */}
                    <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-[#F9C5D1]/30 animate-ping-slow"></div>
                  </div>
                  <h3 className="text-3xl font-bold mb-3 text-[#333333]">Unlock Full Map Access</h3>
                  <p className="text-lg text-[#333333]/70 mb-6 max-w-md mx-auto">
                    Sign in with your BC email to see exactly where your classmates are heading
                    after graduation.
                  </p>

                  {/* Interactive map stats with blur/hidden data */}
                  <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
                    <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-[#F28B82]">
                        <span className="blur-sm">00+</span>
                      </div>
                      <div className="text-sm text-[#333333]/70">U.S. States</div>
                    </div>
                    <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-[#A7D7F9]">
                        <span className="blur-sm">000+</span>
                      </div>
                      <div className="text-sm text-[#333333]/70">Companies</div>
                    </div>
                    <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-[#F9C5D1]">
                        <span className="blur-sm">000</span>
                      </div>
                      <div className="text-sm text-[#333333]/70">BC Grads</div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSignIn}
                    size="large"
                    className="bg-[#F28B82] hover:bg-[#F28B82]/90 text-white shadow-md w-full sm:w-auto px-10 py-4 text-lg hover:translate-y-[-2px] transition-all"
                  >
                    Sign in to unlock
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="h-[500px] flex items-center justify-center bg-[#F9F9F9]/50 p-8">
              <div className="text-center max-w-md relative">
                <Building className="w-16 h-16 text-[#F9C5D1] mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3 text-[#333333]">Top Companies</h3>
                <p className="text-lg text-[#333333]/70 mb-10">
                  See where BC grads are working at top companies after graduation.
                </p>

                {/* Floating horizontal bar of blurred logos with animation */}
                <div className="relative h-20 mb-10">
                  {/* First row of logos with animation */}
                  <div className="absolute w-full overflow-hidden h-20">
                    <div className="flex gap-6 items-center animate-scroll-slow blur-sm">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={`logo-1-${i}`}
                          className="flex-shrink-0 w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        >
                          <div className="w-10 h-10 bg-gray-200 rounded">
                            {i % 2 === 0 ? (
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded"></div>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 rounded"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSignIn}
                  size="large"
                  className="bg-[#F28B82] hover:bg-[#F28B82]/90 text-white shadow-md px-10 py-4 text-lg hover:translate-y-[-2px] transition-all"
                >
                  Sign in to explore
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'classmates' && (
            <div className="h-[500px] flex items-center justify-center bg-[#F9F9F9]/50 p-8">
              <div className="text-center max-w-md">
                <Users className="w-16 h-16 text-[#A7D7F9] mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3 text-[#333333]">Find Classmates</h3>
                <p className="text-lg text-[#333333]/70 mb-5">
                  Sign in to browse the directory of BC grads and connect with classmates in your
                  new city.
                </p>

                {/* Search bar mockup - slightly smaller */}
                <div className="relative mx-auto max-w-sm mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg shadow-sm bg-white/70 backdrop-blur-sm text-gray-500 cursor-not-allowed"
                    placeholder="Search for classmates..."
                    disabled
                  />
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] rounded-lg"></div>
                </div>

                {/* Blurred user cards - simplified to take less vertical space */}
                <div className="flex justify-center gap-3 max-w-xs mx-auto mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg p-2 shadow-sm blur-sm w-14 h-14 flex items-center justify-center"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSignIn}
                  size="large"
                  className="bg-[#F28B82] hover:bg-[#F28B82]/90 text-white shadow-md px-10 py-4 text-lg hover:translate-y-[-2px] transition-all"
                >
                  Sign in to connect
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
