// app/settings/page.jsx
'use client'

import Link from 'next/link';
import { SessionProvider, useSession } from 'next-auth/react';
import { useState } from 'react';
import { SettingsLayout } from '@/app/components/settings/SettingsLayout';
import { ChangePassword } from '@/app/components/settings/ChangePassword';
import { SecuritySettings } from '@/app/components/settings/SecuritySettings';
import { NotificationSettings } from '@/app/components/settings/NotificationSettings';
import { BillingSettings } from '@/app/components/settings/BillingSettings';

export default function SettingsPage() {
  return (
    <SessionProvider>
      <SettingsContent />
    </SessionProvider>
  );
}

function SettingsContent() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('change-password');

  if (!session) {
    return (
      <div className="flex justify-center items-center bg-gray-50 min-h-screen">
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'change-password':
        return <ChangePassword />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'billing':
        return <BillingSettings />;
      default:
        return <ChangePassword />;
    }
  };

  return (
    <SettingsLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </SettingsLayout>
  );
}