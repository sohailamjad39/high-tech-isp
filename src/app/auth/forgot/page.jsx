// app/auth/forgot/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@/app/components/ui/Alert';
import FormField from '@/app/components/ui/FormField';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const router = useRouter();

  // Email validation
  const validateEmail = (email) => {
    const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSubmitStatus({ 
          type: 'success', 
          message: `We've sent password reset instructions to ${email}. Please check your inbox.` 
        });
      } else {
        setSubmitStatus({ 
          type: 'error', 
          message: result.error || 'Something went wrong. Please try again.' 
        });
      }
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 min-h-screen">
      <div className="bg-white/80 shadow-xl backdrop-blur-sm border border-white/20 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#2f83aa] to-[#3f88cc] px-6 py-8 text-white">
          <h1 className="font-bold text-xl">Reset Your Password</h1>
          <p className="opacity-90 mt-2 text-sm">Enter your email to receive a reset link</p>
        </div>
        
        <div className="p-6 md:p-8">
          {submitStatus && (
            <Alert 
              type={submitStatus.type} 
              onClose={() => setSubmitStatus(null)}
            >
              {submitStatus.message}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Email Address"
              id="email"
              error={errors.email}
              required
            >
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
            </FormField>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] disabled:opacity-50 shadow-md hover:shadow-lg px-6 py-3 rounded-lg w-full font-medium text-white transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex justify-center items-center">
                    <svg className="mr-3 -ml-1 w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Reset Link...
                  </span>
                ) : "Send Reset Link"}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="font-medium text-blue-600 hover:text-blue-800 text-sm"
              >
                Back to Login
              </button>
            </div>
          </form>
          
          <div className="mt-6 pt-6 border-gray-200 border-t">
            <p className="text-gray-500 text-sm text-center">
              We'll send a password reset link to your email. 
              The link will expire in 1 hour for security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}