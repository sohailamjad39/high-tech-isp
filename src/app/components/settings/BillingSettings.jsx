// app/components/settings/BillingSettings.jsx
import { useState, useEffect, useRef } from 'react';

export function BillingSettings() {
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'card', last4: '4242', brand: 'Visa', expMonth: 12, expYear: 2025, isPrimary: true },
    { id: 2, type: 'card', last4: '5555', brand: 'Mastercard', expMonth: 6, expYear: 2024, isPrimary: false }
  ]);
  
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  const handleToggleAutoPay = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAutoPayEnabled(!autoPayEnabled);
      setSuccessMessage(autoPayEnabled ? 'Auto-pay disabled' : 'Auto-pay enabled');
      
    } catch (error) {
      setErrorMessage('Failed to update auto-pay settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePaymentMethod = async (id) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (paymentMethods.find(pm => pm.id === id)?.isPrimary) {
        setErrorMessage('Cannot remove primary payment method. Please set another method as primary first.');
      } else {
        setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
        setSuccessMessage('Payment method removed');
      }
      
      // Close the dropdown after action
      setOpenDropdownId(null);
      
    } catch (error) {
      setErrorMessage('Failed to remove payment method. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPrimary = async (id) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPaymentMethods(paymentMethods.map(pm => ({
        ...pm,
        isPrimary: pm.id === id
      })));
      setSuccessMessage('Primary payment method updated');
      
      // Close the dropdown after action
      setOpenDropdownId(null);
      
    } catch (error) {
      setErrorMessage('Failed to update primary payment method. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const closeSuccessMessage = () => setSuccessMessage('');
  const closeErrorMessage = () => setErrorMessage('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-6" ref={dropdownRef}>
      <div className="mb-6">
        <h2 className="font-semibold text-gray-900 text-lg">Billing</h2>
        <p className="mt-1 text-gray-600 text-sm">
          Manage your payment methods and billing preferences.
        </p>
      </div>
      
      {successMessage && (
        <div className="bg-green-50 mb-6 p-4 border border-green-200 rounded-lg">
          <div className="flex">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="font-medium text-green-800 text-sm">{successMessage}</p>
            </div>
            <button
              onClick={closeSuccessMessage}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 mb-6 p-4 border border-red-200 rounded-lg">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11.414 10l-1.293-1.293a1 1 0 00-1.414 0z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="font-medium text-red-800 text-sm">{errorMessage}</p>
            </div>
            <button
              onClick={closeErrorMessage}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="mb-6 pb-6 border-gray-200 border-b">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Auto-pay</h3>
          <div className="flex items-center">
            <span className="mr-3 text-gray-600 text-sm">
              {autoPayEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={handleToggleAutoPay}
              disabled={isLoading}
              className={`${
                autoPayEnabled 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-200 hover:bg-gray-300'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  autoPayEnabled ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          When enabled, your monthly bills will be automatically charged to your primary payment method.
        </p>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Payment Methods</h3>
          <button className="font-medium text-blue-600 hover:text-blue-800 text-sm">
            Add Payment Method
          </button>
        </div>
        
        {paymentMethods.length === 0 ? (
          <div className="py-8 text-center">
            <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="mt-4 text-gray-500">No payment methods added</p>
            <button className="mt-2 font-medium text-blue-600 hover:text-blue-800">
              Add Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1h12z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">
                      {method.brand} •••• {method.last4}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Expires {method.expMonth}/{method.expYear}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {method.isPrimary && (
                    <span className="inline-flex items-center bg-blue-100 px-2.5 py-0.5 rounded-full font-medium text-blue-800 text-xs">
                      Primary
                    </span>
                  )}
                  
                  <div className="relative">
                    <button 
                      onClick={() => toggleDropdown(method.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>
                    
                    {openDropdownId === method.id && (
                      <div className="right-0 z-10 absolute bg-white shadow-lg mt-2 py-1 border border-gray-200 rounded-md w-48">
                        {!method.isPrimary && (
                          <button
                            onClick={() => handleSetPrimary(method.id)}
                            className="block hover:bg-gray-100 px-4 py-2 w-full text-gray-700 text-sm text-left"
                          >
                            Set as Primary
                          </button>
                        )}
                        <button
                          onClick={() => handleRemovePaymentMethod(method.id)}
                          className="block hover:bg-gray-100 px-4 py-2 w-full text-red-600 text-sm text-left"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}