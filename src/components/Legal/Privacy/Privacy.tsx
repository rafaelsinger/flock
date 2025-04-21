import Link from 'next/link';

export const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#FFF9F8] py-12 md:py-16 px-4 text-[#333333]">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-center mb-3">Privacy Policy</h1>
          <div className="w-16 h-1 bg-[#F28B82] rounded-full"></div>
        </div>

        <div className="bg-white p-5 md:p-8 lg:p-10 rounded-2xl shadow-sm space-y-8 md:space-y-10">
          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">1.</span> Introduction
            </h2>
            <p className="mb-3 leading-relaxed">
              We&apos;re committed to protecting your privacy and ensuring you understand how your
              information is handled. This Privacy Policy explains what information we collect, how
              we use it, and your choices regarding your data.
            </p>
            <p className="mb-3 leading-relaxed">
              By using Flock, you agree to the collection and use of information as described in
              this policy. If you don&apos;t agree with our practices, please don&apos;t use our
              service.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">2.</span> Information We Collect
            </h2>
            <p className="mb-3 leading-relaxed">We collect the following types of information:</p>
            <ul className="list-none pl-0 mb-3 space-y-2.5">
              {[
                'Authentication information (Boston College email through Google authentication)',
                'Profile details (name, graduation year, post-graduation plans or internship details)',
                'Location information (city, state, country, and optionally borough)',
                'Career or education information (company/school, role/program)',
                'User preferences and settings (visibility preferences)',
                'Usage data (how you interact with our platform)',
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
              <span className="text-[#F9C5D1] mr-2">3.</span> How We Use Your Information
            </h2>
            <p className="mb-3 leading-relaxed">We use your information to:</p>
            <ul className="list-none pl-0 mb-3 space-y-2.5">
              {[
                'Provide our core service of connecting BC graduates and interns based on location',
                'Customize and improve your user experience',
                'Ensure only BC students and alumni can access the platform',
                'Understand how users interact with Flock to improve our service',
                'Send important updates about Flock features or your account',
                'Maintain the security and integrity of our platform',
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
              <span className="text-[#F9C5D1] mr-2">4.</span> Visibility and Sharing
            </h2>
            <p className="mb-3 leading-relaxed">
              Flock is designed to help BC students connect with each other. By default:
            </p>
            <ul className="list-none pl-0 mb-3 space-y-2.5">
              {[
                'Your name, city, state, and country are visible to all Flock users',
                'Your company/school and role/program visibility is controlled by your preferences',
                'Only authenticated BC community members can see your information',
                'Your email address is not shared with other users',
                'We do not share your personal information with third parties for marketing purposes',
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="inline-block text-[#F28B82] mr-2.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="leading-relaxed">
              You have control over what career or education details are visible through your
              visibility settings in your profile.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">5.</span> Data Storage and Security
            </h2>
            <p className="mb-3 leading-relaxed">
              We take the security of your data seriously and implement reasonable measures to
              protect it:
            </p>
            <ul className="list-none pl-0 mb-3 space-y-2.5">
              {[
                'Your information is stored in secure databases',
                'We use industry-standard security protocols and practices',
                'Access to personal data is restricted to authorized personnel',
                'We regularly review our security practices to ensure your data remains protected',
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="inline-block text-[#F28B82] mr-2.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="leading-relaxed">
              However, no method of transmission over the internet or electronic storage is 100%
              secure. While we strive to protect your personal information, we cannot guarantee its
              absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">6.</span> Your Rights and Choices
            </h2>
            <p className="mb-3 leading-relaxed">You have several rights regarding your data:</p>
            <ul className="list-none pl-0 mb-3 space-y-2.5">
              {[
                'Access and view personal information we have about you',
                'Update or correct your personal information',
                'Control visibility settings through your profile options',
                'Request deletion of your account and associated data',
                'Opt out of non-essential communications',
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="inline-block text-[#F28B82] mr-2.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="leading-relaxed">
              To exercise these rights, update your profile settings or{' '}
              <Link href="/contact" className="text-[#F28B82] hover:underline font-medium">
                contact us via our form
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">7.</span> Cookies and Analytics
            </h2>
            <p className="mb-3 leading-relaxed">
              Flock uses cookies and similar technologies to enhance your experience and collect
              usage data:
            </p>
            <ul className="list-none pl-0 mb-3 space-y-2.5">
              {[
                'Essential cookies that enable core functionality like authentication and security',
                'Analytics tools to understand how users interact with our platform',
                'Session information to remember your preferences',
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="inline-block text-[#F28B82] mr-2.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="leading-relaxed">
              Most web browsers allow you to control cookies through their settings preferences.
              However, limiting cookies may affect your experience using Flock.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">8.</span> Third-Party Services
            </h2>
            <p className="mb-3 leading-relaxed">
              We use a limited number of third-party services to support our platform:
            </p>
            <ul className="list-none pl-0 mb-3 space-y-2.5">
              {[
                'Google authentication for secure BC email verification',
                'Cloud hosting and database providers',
                'Analytics tools to improve our service',
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="inline-block text-[#F28B82] mr-2.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="leading-relaxed">
              These service providers have access to your personal information only to perform
              specific tasks on our behalf and are obligated not to disclose or use it for other
              purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">9.</span> Account Deletion
            </h2>
            <p className="mb-3 leading-relaxed">
              You can request deletion of your account at any time by visiting your profile page or
              using our{' '}
              <Link href="/contact" className="text-[#F28B82] hover:underline font-medium">
                contact form
              </Link>
              . Upon deletion:
            </p>
            <ul className="list-none pl-0 mb-3 space-y-2.5">
              {[
                'Your profile will be removed from the platform',
                'Your personal information will be deleted from our active databases',
                'Some information may remain in our backups for a limited time',
                'We may retain certain data in anonymized form for analytics',
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
              <span className="text-[#F9C5D1] mr-2">10.</span> Changes to This Policy
            </h2>
            <p className="mb-3 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of significant
              changes by posting the new Privacy Policy on this page and, if appropriate, by email.
            </p>
            <p className="leading-relaxed">
              Your continued use of Flock after we post any modifications to the Privacy Policy will
              constitute your acknowledgment of the modifications and your consent to abide by them.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-[#333333] flex items-center">
              <span className="text-[#F9C5D1] mr-2">11.</span> Contact Us
            </h2>
            <p className="mb-3 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please{' '}
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
