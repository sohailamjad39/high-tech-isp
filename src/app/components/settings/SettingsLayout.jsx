// app/components/settings/SettingsLayout.jsx
import Link from 'next/link';

export function SettingsLayout({ children, activeTab, setActiveTab }) {
  const navItems = [
    { id: 'change-password', label: 'Change Password', icon: 'lock' },
    { id: 'security', label: 'Security', icon: 'shield' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'billing', label: 'Billing', icon: 'credit-card' }
  ];

  return (
    <div className="bg-gray-50 mt-15 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="font-bold text-gray-900 text-2xl">Settings</h1>
          <p className="mt-1 text-gray-600">Manage your account settings and preferences</p>
        </div>
        
        <div className="flex md:flex-row flex-col gap-8">
          {/* Left Navigation Sidebar */}
          <div className="flex-shrink-0 md:w-64">
            <nav className="bg-white shadow-sm p-4 border border-gray-200 rounded-xl">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <SettingsIcon icon={item.icon} />
                    <span className="ml-3 font-medium">{item.label}</span>
                  </button>
                ))}
                
                {/* Edit Profile Link */}
                <Link
                  href="/profile/edit"
                  className="flex items-center hover:bg-gray-50 px-4 py-3 rounded-lg text-gray-700 text-left transition-colors"
                >
                  <SettingsIcon icon="user" />
                  <span className="ml-3 font-medium">Edit Profile</span>
                </Link>
              </div>
            </nav>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsIcon({ icon }) {
  const icons = {
    'lock': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    'shield': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    'bell': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    'credit-card': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    'user': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  };

  return icons[icon] || icons['user'];
}