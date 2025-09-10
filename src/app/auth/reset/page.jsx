// app/auth/reset/page.jsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Alert from '@/app/components/ui/Alert';
import FormField from '@/app/components/ui/FormField';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Password validation
  const validatePassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return re.test(password);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and a number';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!token) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Invalid reset link. Please request a new password reset.' 
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSubmitStatus({ 
          type: 'success', 
          message: 'Your password has been reset successfully. You can now log in with your new password.' 
        });
        // Redirect after successful reset
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
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

  if (!token) {
    return (
      <div className="flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 min-h-screen">
        <div className="bg-white/80 shadow-xl backdrop-blur-sm border border-white/20 rounded-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#2f83aa] to-[#3f88cc] px-6 py-8 text-white">
            <h1 className="font-bold text-xl">Invalid Reset Link</h1>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="space-y-4 text-center">
              <p className="text-gray-600">
                The password reset link is invalid or has expired.
              </p>
              
              <p className="text-gray-500 text-sm">
                Please request a new password reset from the login page.
              </p>
            </div>
            
            <div className="mt-8">
              <button
                onClick={handleBackToLogin}
                className="bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] shadow-md hover:shadow-lg px-6 py-3 rounded-lg w-full font-medium text-white transition-all duration-200"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center mt-10 p-4 min-h-screen">
      <div className="bg-white/80 shadow-xl backdrop-blur-sm border border-white/20 rounded-2xl w-full max-w-md overflow-hidden scale-90">
        <div className="bg-gradient-to-r from-[#2f83aa] to-[#3f88cc] px-6 py-8 text-white">
          <h1 className="font-bold text-xl">Create New Password</h1>
          <p className="opacity-90 mt-2 text-sm">Enter your new password below</p>
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
              label="New Password"
              id="password"
              error={errors.password}
              required
            >
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter new password"
                disabled={isSubmitting}
              />
            </FormField>
            
            <FormField
              label="Confirm Password"
              id="confirmPassword"
              error={errors.confirmPassword}
              required
            >
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirm new password"
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
                    Resetting Password...
                  </span>
                ) : "Reset Password"}
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
            <p className="text-gray-500 text-sm">
              Password must be at least 8 characters and include:
            </p>
            <ul className="space-y-1 mt-2 text-gray-500 text-sm">
              <li>• At least one uppercase letter (A-Z)</li>
              <li>• At least one lowercase letter (a-z)</li>
              <li>• At least one number (0-9)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}