// app/components/settings/SecuritySettings.jsx
import { useState } from 'react';

export function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleToggleTwoFactor = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!twoFactorEnabled) {
        // Generate backup codes when enabling 2FA
        const codes = Array(10).fill().map(() => 
          Math.random().toString(36).substring(2, 8).toUpperCase()
        );
        setBackupCodes(codes);
        setShowBackupCodes(true);
      }
      
      setTwoFactorEnabled(!twoFactorEnabled);
      setSuccessMessage(twoFactorEnabled ? 'Two-factor authentication disabled' : 'Two-factor authentication enabled');
      
    } catch (error) {
      setErrorMessage('Failed to update security settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const codes = Array(10).fill().map(() => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setBackupCodes(codes);
      setSuccessMessage('Backup codes regenerated');
      
    } catch (error) {
      setErrorMessage('Failed to regenerate backup codes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeSuccessMessage = () => setSuccessMessage('');
  const closeErrorMessage = () => setErrorMessage('');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="font-semibold text-gray-900 text-lg">Security</h2>
        <p className="mt-1 text-gray-600 text-sm">
          Manage your account security settings.
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
      
      <div className="space-y-6">
        {/* Two-Factor Authentication */}
        <div className="pb-6 border-gray-200 border-b">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Two-factor authentication</h3>
              <p className="mt-1 text-gray-600 text-sm">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={handleToggleTwoFactor}
                disabled={isLoading}
                className={`${
                  twoFactorEnabled 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-200 hover:bg-gray-300'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>
          
          {twoFactorEnabled && (
            <div className="bg-blue-50 mt-4 p-4 rounded-lg">
              <div className="flex">
                <svg className="mt-0.5 w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-blue-800 text-sm">
                    <strong>Backup codes:</strong> Store these codes in a safe place. They can be used to access your account if you lose your phone.
                  </p>
                </div>
              </div>
              
              {showBackupCodes && (
                <div className="mt-3">
                  <div className="gap-2 grid grid-cols-2 mb-3">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="bg-white px-3 py-2 border border-gray-200 rounded font-mono text-sm">
                        {code}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleRegenerateBackupCodes}
                    disabled={isLoading}
                    className="font-medium text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Regenerate backup codes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Active Sessions */}
        <div>
          <h3 className="mb-4 font-medium text-gray-900">Active sessions</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium text-gray-900">Current session</p>
                <p className="text-gray-600 text-sm">This device • {new Date().toLocaleString()}</p>
              </div>
              <span className="inline-flex items-center bg-green-100 px-2.5 py-0.5 rounded-full font-medium text-green-800 text-xs">
                Active
              </span>
            </div>
            <div className="mt-2 pt-2 border-gray-200 border-t">
              <button className="font-medium text-blue-600 hover:text-blue-800 text-sm">
                Sign out of all other sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}