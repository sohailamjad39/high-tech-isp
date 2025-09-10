// app/components/admin/dashboard/OverviewCard.jsx
'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';

// Function to fetch admin icon metadata
const fetchAdminIcon = (iconName) => {
  return async () => {
    // In production, you might fetch actual image dimensions from an API
    // For now, return static data for all icons
    return {
      src: `/admin/${iconName}.svg`,
      alt: "",
      width: 24,
      height: 24
    };
  };
};

export default function OverviewCard({ title, value, change, icon }) {
  // Map icon names to their corresponding SVG file names
  const iconMap = {
    users: 'customers',
    subscription: 'subscription',
    revenue: 'billing',
    tickets: 'tickets',
    orders: 'orders',
    installations: 'installation'
  };
  
  // Get the correct icon name or default to dashboard
  const iconName = iconMap[icon] || 'dashboard';
  
  // Fetch the icon metadata
  const { data: iconData } = useQuery({
    queryKey: ['admin-icon', iconName],
    queryFn: fetchAdminIcon(iconName),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return (
    <div className="bg-white shadow p-6 rounded-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0 p-3 rounded-md">
          {iconData && (
            <Image
              src={iconData.src}
              alt={iconData.alt}
              width={iconData.width}
              height={iconData.height}
              className="w-6 h-6"
              priority={true}
            />
          )}
        </div>
        <div className="flex-1 ml-5 w-0">
          <dl>
            <dt className="font-medium text-gray-500 text-sm truncate">{title}</dt>
            <dd>
              <div className="flex items-baseline">
                <div className="font-semibold text-gray-900 text-2xl">{value}</div>
                {change !== undefined && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
                  </div>
                )}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}