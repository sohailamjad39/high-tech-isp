// app/contact/page.jsx
"use client";
import React, { useState } from 'react';
import Alert from '../components/ui/Alert';
import FormField from '../components/ui/FormField';
import FileUpload from '../components/ui/FileUpload';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (basic)
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
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
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('message', formData.message);
      if (file) {
        formDataToSend.append('file', file);
      }
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formDataToSend
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Your message has been sent successfully. We will contact you soon.' });
        // Reset form
        setFormData({ email: '', phone: '', subject: '', message: '' });
        setFile(null);
      } else {
        setSubmitStatus({ type: 'error', message: result.error || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">

      {/* Content */}
      <div className="z-10 relative mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-4xl">
        <div className="bg-white/80 shadow-xl backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#2f83aa] to-[#3f88cc] px-6 py-8 text-white">
            <h1 className="font-bold text-3xl">Get in Touch</h1>
            <p className="opacity-90 mt-2">We're here to help with any questions you may have</p>
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
              <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                <FormField
                  label="Email Address"
                  id="email"
                  error={errors.email}
                  required
                >
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                  />
                </FormField>
                
                <FormField
                  label="Phone Number"
                  id="phone"
                  error={errors.phone}
                  required
                >
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                </FormField>
              </div>
              
              <FormField
                label="Subject"
                id="subject"
                error={errors.subject}
                required
              >
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.subject ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="How can we help you?"
                />
              </FormField>
              
              <FormField
                label="Message"
                id="message"
                error={errors.message}
                required
              >
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.message ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Please describe your inquiry in detail..."
                />
              </FormField>
              
              <FileUpload 
                onFileSelect={handleFileSelect} 
                maxSize={1048576} // 1MB
                accept="image/*,.pdf,.doc,.docx"
              />
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] disabled:opacity-50 shadow-md hover:shadow-lg px-8 py-3 rounded-lg w-full font-medium text-white transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex justify-center items-center">
                      <svg className="mr-3 -ml-1 w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : "Send Message"}
                </button>
              </div>
              
              <p className="mt-4 text-gray-500 text-sm text-center">
                We'll respond to your inquiry within 24 hours
              </p>
            </form>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="gap-8 grid grid-cols-1 md:grid-cols-3 mt-12">
          <div className="text-center">
            <div className="flex justify-center items-center bg-blue-100 mx-auto mb-4 rounded-lg w-12 h-12">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-gray-800 text-lg">Email Us</h3>
            <p className="text-gray-600">support@high-tech-isp.com</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center items-center bg-blue-100 mx-auto mb-4 rounded-lg w-12 h-12">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-gray-800 text-lg">Call Us</h3>
            <p className="text-gray-600">1-800-HIGH-TECH</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center items-center bg-blue-100 mx-auto mb-4 rounded-lg w-12 h-12">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-gray-800 text-lg">Visit Us</h3>
            <p className="text-gray-600">123 Tech Avenue<br />Innovation City, IC 12345</p>
          </div>
        </div>
      </div>
    </div>
  );
}