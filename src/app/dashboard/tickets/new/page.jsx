// app/dashboard/tickets/new/page.jsx
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionProvider, useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Form components
function FormField({ label, children, error, required = false }) {
  return (
    <div className="space-y-2">
      <label className="font-medium text-gray-700 text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-red-500 text-xs">{error}</p>}
    </div>
  );
}

function Select({ value, onChange, children, ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="block shadow-sm px-4 py-3 border border-gray-300 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
      {...props}
    >
      {children}
    </select>
  );
}

function Textarea({ value, onChange, placeholder, rows = 6, ...props }) {
  return (
    <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="block shadow-sm px-4 py-3 border border-gray-300 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
    {...props}
    />
    );
    }
    
    function Input({ value, onChange, type = "text", placeholder, ...props }) {
      return (
        <input
          value={value}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
          className="block shadow-sm px-4 py-3 border border-gray-300 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          {...props}
        />
      );
    }
    
    // File upload component
    function FileUpload({ files, setFiles, maxFiles = 5, maxSize = 5 }) {
      const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        
        // Validate file count
        if (files.length + selectedFiles.length > maxFiles) {
          alert(`You can upload a maximum of ${maxFiles} files`);
          return;
        }
        
        // Validate file size
        const oversizedFiles = selectedFiles.filter(file => file.size > maxSize * 1024 * 1024);
        if (oversizedFiles.length > 0) {
          alert(`Files must be smaller than ${maxSize}MB`);
          return;
        }
        
        // Add valid files
        setFiles(prev => [...prev, ...selectedFiles]);
      };
      
      const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
      };
      
      return (
        <div className="space-y-4">
          <div className="p-6 border-2 border-gray-300 border-dashed rounded-lg text-center">
            <svg className="mx-auto w-12 h-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4 4v8m-12 4h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-gray-600 text-sm">
              <label htmlFor="file-upload" className="relative bg-white rounded-md focus-within:outline-none font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                <span>Upload files</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple accept="image/*,.pdf,.doc,.docx" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-gray-500 text-xs">PNG, JPG, GIF, PDF, DOC up to {maxSize}MB</p>
          </div>
          
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium text-gray-700 text-sm">Uploaded files ({files.length}/{maxFiles}):</p>
              <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                {files.map((file, index) => (
                  <li key={index} className="flex justify-between items-center p-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        {file.type.startsWith('image/') ? (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 4l-4 4-4-4-4 4V6a1 1 0 011-1h10a1 1 0 011 1v2z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                        <p className="text-gray-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    
    // Success message component
    function SuccessMessage({ ticketCode, onClose }) {
      return (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-75">
          <div className="bg-white shadow-xl mx-4 p-6 rounded-lg w-full max-w-md">
            <div className="text-center">
              <div className="flex justify-center items-center bg-green-100 mx-auto rounded-full w-12 h-12">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 font-medium text-gray-900 text-lg">Ticket Submitted Successfully</h3>
              <p className="mt-2 text-gray-600">Your support ticket has been created with the following reference number:</p>
              <div className="bg-gray-50 mt-4 p-3 rounded-lg">
                <p className="font-mono font-bold text-blue-600 text-lg">{ticketCode}</p>
              </div>
              <p className="mt-2 text-gray-500 text-sm">Our support team will respond within 24 hours.</p>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center bg-blue-600 hover:bg-blue-700 shadow-sm px-4 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full font-medium text-white sm:text-sm text-base"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Validation function
    function validateForm(formData, files) {
      const errors = {};
      
      if (!formData.subject.trim()) {
        errors.subject = 'Subject is required';
      } else if (formData.subject.length > 100) {
        errors.subject = 'Subject must be less than 100 characters';
      }
      
      if (!formData.description.trim()) {
        errors.description = 'Description is required';
      } else if (formData.description.length > 2000) {
        errors.description = 'Description must be less than 2000 characters';
      }
      
      if (!formData.category) {
        errors.category = 'Please select a category';
      }
      
      if (files.length === 0) {
        errors.files = 'Please upload at least one file (optional but recommended)';
      }
      
      return errors;
    }
    
    // Create ticket API function
    async function createTicket(data) {
      const formData = new FormData();
      formData.append('subject', data.subject);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('priority', data.priority);
      
      // Append files
      data.files.forEach(file => {
        formData.append('attachments', file);
      });
      
      const response = await fetch('/api/dashboard/tickets', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create ticket');
      }
      
      return response.json();
    }
    
    // Main content component
    function NewTicketContent() {
      const { data: session, status } = useSession();
      const router = useRouter();
      const queryClient = useQueryClient();
      
      const [formData, setFormData] = useState({
        subject: '',
        description: '',
        category: '',
        priority: 'medium'
      });
      
      const [files, setFiles] = useState([]);
      const [errors, setErrors] = useState({});
      const [isSuccess, setIsSuccess] = useState(false);
      const [ticketCode, setTicketCode] = useState('');
      
      const mutation = useMutation({
        mutationFn: createTicket,
        onSuccess: (data) => {
          setTicketCode(data.ticket.code);
          setIsSuccess(true);
          
          // Invalidate and refetch tickets list
          queryClient.invalidateQueries(['tickets']);
        },
        onError: (error) => {
          alert(`Error: ${error.message}`);
        }
      });
      
      const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const formErrors = validateForm(formData, files);
        setErrors(formErrors);
        
        if (Object.keys(formErrors).length === 0) {
          // Submit form
          mutation.mutate({
            ...formData,
            files
          });
        }
      };
      
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
      };
      
      const handleSuccessClose = () => {
        setIsSuccess(false);
        router.push('/dashboard/tickets');
      };
      
      if (status === 'loading') {
        return (
          <div className="flex justify-center items-center min-h-screen">
            <div className="border-t-2 border-b-2 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        );
      }
      
      if (status === 'unauthenticated') {
        router.push('/auth/login');
        return null;
      }
      
      return (
        <div className="bg-gray-50 py-8 min-h-screen">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <div className="mb-6">
              <h1 className="font-bold text-gray-900 text-2xl">Create Support Ticket</h1>
              <p className="mt-1 text-gray-600">
                Please fill out the form below to submit a support request. Our team will respond within 24 hours.
              </p>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-gray-200 border-b">
                <h2 className="font-medium text-gray-900 text-lg">Ticket Information</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6 p-6">
                <FormField label="Subject" error={errors.subject} required>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Briefly describe your issue"
                  />
                </FormField>
                
                <FormField label="Category" error={errors.category} required>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Select a category</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing Inquiry</option>
                    <option value="installation">Installation Problem</option>
                    <option value="service">Service Request</option>
                    <option value="other">Other</option>
                  </Select>
                </FormField>
                
                <FormField label="Priority" required>
                  <div className="gap-4 grid grid-cols-2">
                    <div>
                      <Select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </Select>
                      <p className="mt-1 text-gray-500 text-xs">Select based on impact to your service</p>
                    </div>
                  </div>
                </FormField>
                
                <FormField label="Description" error={errors.description} required>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please provide detailed information about your issue, including any error messages, when it started, and steps to reproduce."
                  />
                </FormField>
                
                <div>
                  <h3 className="mb-2 font-medium text-gray-700 text-sm">Attachments (Optional)</h3>
                  <FileUpload files={files} setFiles={setFiles} />
                  {errors.files && <p className="mt-1 text-red-500 text-xs">{errors.files}</p>}
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-gray-200 border-t">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-white hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium text-white text-sm disabled:cursor-not-allowed"
                  >
                    {mutation.isPending ? (
                      <>
                        <svg className="inline mr-2 -ml-1 w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : "Submit Ticket"}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Success Modal */}
          {isSuccess && (
            <SuccessMessage ticketCode={ticketCode} onClose={handleSuccessClose} />
          )}
        </div>
      );
    }

    // Main Page Component
    export default function NewTicketPage() {
      return (
        <SessionProvider>
          <NewTicketContent />
        </SessionProvider>
      );
    }