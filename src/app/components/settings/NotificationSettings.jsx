// app/components/settings/NotificationSettings.jsx
import { useState } from 'react';

export function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: {
      account: true,
      billing: true,
      support: true,
      marketing: false
    },
    sms: {
      account: false,
      billing: true,
      support: true,
      marketing: false
    },
    push: {
      account: true,
      billing: true,
      support: true,
      marketing: false
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleToggle = (type, category) => {
    setNotifications(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [category]: !prev[type][category]
      }
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Notification preferences saved');
      
    } catch (error) {
      setErrorMessage('Failed to save notification preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeSuccessMessage = () => setSuccessMessage('');
  const closeErrorMessage = () => setErrorMessage('');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="font-semibold text-gray-900 text-lg">Notifications</h2>
        <p className="mt-1 text-gray-600 text-sm">
          Choose how you want to be notified about important events.
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
        <h3 className="mb-4 font-medium text-gray-900">Email notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications.email).map(([category, enabled]) => (
            <div key={category} className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 capitalize">{category}</p>
                <p className="text-gray-600 text-sm">
                  {category === 'account' && 'Account changes, security alerts'}
                  {category === 'billing' && 'Invoices, payment confirmations'}
                  {category === 'support' && 'Ticket updates, support responses'}
                  {category === 'marketing' && 'Product updates, promotions'}
                </p>
              </div>
              <button
                onClick={() => handleToggle('email', category)}
                className={`${
                  enabled 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-200 hover:bg-gray-300'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6 pb-6 border-gray-200 border-b">
        <h3 className="mb-4 font-medium text-gray-900">SMS notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications.sms).map(([category, enabled]) => (
            <div key={category} className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 capitalize">{category}</p>
                <p className="text-gray-600 text-sm">
                  {category === 'account' && 'Account changes, security alerts'}
                  {category === 'billing' && 'Invoices, payment confirmations'}
                  {category === 'support' && 'Ticket updates, support responses'}
                  {category === 'marketing' && 'Product updates, promotions'}
                </p>
              </div>
              <button
                onClick={() => handleToggle('sms', category)}
                className={`${
                  enabled 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-200 hover:bg-gray-300'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6 pb-6 border-gray-200 border-b">
        <h3 className="mb-4 font-medium text-gray-900">Push notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications.push).map(([category, enabled]) => (
            <div key={category} className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 capitalize">{category}</p>
                <p className="text-gray-600 text-sm">
                  {category === 'account' && 'Account changes, security alerts'}
                  {category === 'billing' && 'Invoices, payment confirmations'}
                  {category === 'support' && 'Ticket updates, support responses'}
                  {category === 'marketing' && 'Product updates, promotions'}
                </p>
              </div>
              <button
                onClick={() => handleToggle('push', category)}
                className={`${
                  enabled 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-200 hover:bg-gray-300'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex pt-6">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 shadow-sm px-4 py-3 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-white text-sm transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="mr-2 -ml-1 w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : "Save Changes"}
        </button>
      </div>
    </div>
  );
}