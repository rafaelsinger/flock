'use client';

import Link from 'next/link';
import { useState } from 'react';
import React from 'react';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';
type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const RECIPIENT_EMAILS = ['scheppat@bc.edu', 'singerrc@bc.edu'];

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setErrorMessage('');

    // Form validation
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage('Please fill out all required fields');
      setFormStatus('error');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setErrorMessage('Please enter a valid email address');
      setFormStatus('error');
      return;
    }

    try {
      // Send the form data to our API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recipients: RECIPIENT_EMAILS,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setFormStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Contact form submission error:', error);
      setFormStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again later.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F8] py-12 md:py-16 px-4 text-[#333333]">
      <div className="max-w-xl mx-auto">
        <div className="flex flex-col items-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-center mb-3">Contact Us</h1>
          <div className="w-16 h-1 bg-[#F28B82] rounded-full"></div>
          <p className="mt-4 text-center text-[#666666] max-w-xl">
            Have a question or feedback about Flock? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="bg-white p-5 md:p-8 lg:p-10 rounded-2xl shadow-sm">
          {formStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F9C5D1]/20 flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-[#F28B82]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-medium mb-3 text-[#333333]">Message Sent!</h2>
              <p className="text-[#666666] max-w-md mb-6">
                Thank you for reaching out. We&apos;ve received your message and will get back to
                you shortly.
              </p>
              <button
                onClick={() => setFormStatus('idle')}
                className="px-6 py-2.5 rounded-lg bg-[#F28B82] hover:bg-[#E67C73] text-white transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-[#333333]">
                  Name <span className="text-[#F28B82]">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring focus:ring-[#F9C5D1]/20 focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-[#333333]">
                  Email <span className="text-[#F28B82]">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring focus:ring-[#F9C5D1]/20 focus:outline-none transition-colors"
                  placeholder="Your email address"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-[#333333]">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring focus:ring-[#F9C5D1]/20 focus:outline-none transition-colors"
                >
                  <option value="">Select a subject</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Account Issues">Account Issues</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-[#333333]">
                  Message <span className="text-[#F28B82]">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring focus:ring-[#F9C5D1]/20 focus:outline-none transition-colors h-32"
                  placeholder="How can we help you?"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className={`w-full px-6 py-3 rounded-lg bg-[#F28B82] hover:bg-[#E67C73] text-white font-medium transition-colors flex items-center justify-center ${
                    formStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {formStatus === 'submitting' ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </div>
            </form>
          )}
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

export default Contact;
