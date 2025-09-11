// app/auth/login/page.jsx
'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get redirect URL from query parameters
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      });
      
      if (result?.error) {
        setErrors({ submit: 'Invalid credentials' });
      } else {
        // Login successful, now check user role and redirect accordingly
        try {
          // Fetch the session to get user role
          const sessionResponse = await fetch('/api/auth/session');
          const sessionData = await sessionResponse.json();
          
          let redirectUrl = '/';
          
          if (sessionData.user) {
            const userRole = sessionData.user.role;
            
            // Redirect based on user role
            if (userRole === 'visitor') {
              redirectUrl = '/plans';
            } else if (userRole === 'customer') {
              redirectUrl = '/dashboard/overview';
            } else if (userRole === 'admin') {
              redirectUrl = '/admin/dashboard';
            } else if (userRole === 'tech') {
              redirectUrl = '/tech';
            } else if (userRole === 'support') {
              redirectUrl = '/support';
            } else if (userRole === 'ops') {
              redirectUrl = '/ops';
            } else {
              // Default fallback
              redirectUrl = '/';
            }
          }
          
          // Use the callbackUrl if it's provided and valid, otherwise use role-based redirect
          const finalRedirect = callbackUrl && callbackUrl !== '/' ? callbackUrl : redirectUrl;
          
          // Redirect to the appropriate dashboard
          router.replace(finalRedirect);
          // Refresh to ensure all components update
          router.refresh();
        } catch (sessionError) {
          console.error('Error fetching session:', sessionError);
          // If we can't get the session, use the callbackUrl or default to home
          router.replace(callbackUrl || '/');
          router.refresh();
        }
      }
    } catch (error) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-md">
        <div className="bg-white shadow-xl mt-20 border border-gray-200 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <h1 className="mb-2 font-bold text-gray-900 text-2xl">Welcome Back</h1>
            <p className="text-gray-600 text-xs">Log in to your HIGH TECH account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            {errors.submit && (
              <div className="bg-red-50 mb-6 p-3 border border-red-200 rounded-lg text-red-700 text-sm">
                {errors.submit}
              </div>
            )}
            
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block mb-1 font-medium text-gray-700 text-sm">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-red-600 text-xs">{errors.email}</p>
                )}
              </div>
              
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block mb-1 font-medium text-gray-700 text-sm">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-red-600 text-xs">{errors.password}</p>
                )}
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] disabled:opacity-70 mt-6 px-4 py-2 rounded-lg w-full font-medium text-white text-sm transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
            
            {/* Register Link */}
            <div className="mt-6 text-gray-600 text-sm text-center">
              Don't have an account?{' '}
              <a
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Create one
              </a>
            </div>
            
            {/* Forgot Password */}
            <div className="mt-4 text-center">
              <a
                href="/auth/forgot"
                className="font-medium text-blue-600 hover:text-blue-800 text-sm transition-colors"
              >
                Forgot password?
              </a>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}