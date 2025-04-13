import Link from 'next/link';

export const Terms = () => {
  return (
    <div className="min-h-screen bg-[#FFF9F8] py-12 md:py-16 px-4 text-[#333333]">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-center mb-3">Terms of Service</h1>
          <div className="w-16 h-1 bg-[#F28B82] rounded-full"></div>
        </div>

        <div className="bg-white p-5 md:p-8 lg:p-10 rounded-2xl shadow-sm space-y-8 md:space-y-10">
          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">1.</span> Introduction
            </h2>
            <p className="mb-3 leading-relaxed">
              Welcome to Flock (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). Flock is a web
              application that connects graduating Boston College students by showing where their
              classmates are moving after graduation.
            </p>
            <p className="mb-3 leading-relaxed">
              By accessing or using our services, you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). Please read them carefully. If you don&apos;t agree with these
              Terms, please do not use Flock.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">2.</span> Eligibility
            </h2>
            <p className="mb-3 leading-relaxed">To use Flock, you must:</p>
            <ul className="list-none pl-0 mb-3 space-y-2.5">
              {[
                'Be a Boston College student or alumnus with a valid @bc.edu email address',
                'Be at least 18 years of age',
                'Complete the registration and onboarding process',
                'Comply with these Terms and all applicable laws',
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="inline-block text-[#F28B82] mr-2.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">3.</span> Account Registration
            </h2>
            <p className="mb-3 leading-relaxed">
              To access Flock, you must sign in with your Boston College (@bc.edu) email address
              through our Google authentication system. By registering, you agree to:
            </p>
            <ul className="list-none pl-0 mb-3 space-y-2.5">
              {[
                'Provide accurate and complete information during onboarding',
                'Maintain the security of your account',
                'Accept responsibility for all activities that occur under your account',
                'Notify us immediately of any unauthorized use of your account',
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="inline-block text-[#F28B82] mr-2.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">4.</span> User Content and Conduct
            </h2>
            <p className="mb-3 leading-relaxed">When using Flock, you agree to:</p>
            <ul className="list-none pl-0 mb-3 space-y-2.5">
              {[
                'Provide truthful information about your post-graduation plans',
                'Respect the privacy and rights of other users',
                'Not use the platform to harass, bully, or discriminate against others',
                'Not use Flock for any illegal, harmful, or unauthorized purposes',
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="inline-block text-[#F28B82] mr-2.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="leading-relaxed">
              We reserve the right to remove any content or suspend accounts that violate these
              guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">5.</span> Privacy
            </h2>
            <p className="mb-3 leading-relaxed">
              Your privacy is important to us. Our collection and use of your information is
              governed by our{' '}
              <Link href="/privacy" className="text-[#F28B82] hover:underline font-medium">
                Privacy Policy
              </Link>
              .
            </p>
            <p className="mb-3 leading-relaxed">
              You control what information is visible to other users through our visibility
              settings. By default, your name, city, state, and country will be visible to all
              users. You can choose whether to display additional information like your company,
              school, role, or program.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">6.</span> Data Usage and Security
            </h2>
            <p className="mb-3 leading-relaxed">
              We implement reasonable security measures to protect your information, but no system
              is completely secure. By using Flock, you understand:
            </p>
            <ul className="list-none pl-0 mb-3 space-y-2.5">
              {[
                'We store your profile information in our secure database',
                'Your information may be visible to other Boston College students and alumni',
                'We may use anonymized data for improving our services',
                'We do not sell your personal information to third parties',
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="inline-block text-[#F28B82] mr-2.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">7.</span> Modifications to Service
            </h2>
            <p className="mb-3 leading-relaxed">
              We reserve the right to modify or discontinue Flock temporarily or permanently, with
              or without notice. We will not be liable to you or any third party for any
              modification, suspension, or discontinuation of our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">8.</span> Changes to Terms
            </h2>
            <p className="mb-3 leading-relaxed">
              We may update these Terms from time to time. If we make significant changes,
              we&apos;ll notify you through the service or by email. Your continued use of Flock
              after such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">9.</span> Termination
            </h2>
            <p className="mb-3 leading-relaxed">
              We may suspend or terminate your access to Flock at any time for violations of these
              Terms or for any other reason at our discretion.
            </p>
            <p className="mb-3 leading-relaxed">
              You may request deletion of your account by using our{' '}
              <Link href="/contact" className="text-[#F28B82] hover:underline font-medium">
                contact form
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">10.</span> Disclaimer of Warranties
            </h2>
            <p className="mb-3 leading-relaxed">
              Flock is provided &quot;as is&quot; without any warranties, express or implied. We do
              not guarantee that our services will be error-free or uninterrupted.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">11.</span> Limitation of Liability
            </h2>
            <p className="mb-3 leading-relaxed">
              To the fullest extent permitted by law, Flock shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages resulting from your use or
              inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">12.</span> Contact Information
            </h2>
            <p className="mb-3 leading-relaxed">
              If you have any questions about these Terms, please{' '}
              <Link href="/contact" className="text-[#F28B82] hover:underline font-medium">
                contact us via our form
              </Link>
              .
            </p>
          </section>

          <div className="pt-6 text-sm text-gray-500 flex justify-between items-center">
            <p>Last Updated: April 13, 2025</p>
            <div className="flex items-center">
              <span className="mr-2">Made with</span>
              <span className="text-[#F28B82]">🦩</span>
              <span className="ml-2">for BC Eagles</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-[#333333]/70 hover:text-[#F28B82] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
