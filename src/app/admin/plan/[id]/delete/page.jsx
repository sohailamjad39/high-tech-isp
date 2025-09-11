'use client'

import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from '@/app/components/admin/dashboard/Sidebar';

function DeletePlanContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [error, setError] = useState('');

  const planId =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : null;

  // Redirect if not authenticated or not admin/ops
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (
      status === 'authenticated' &&
      !['admin', 'ops'].includes(session?.user?.role)
    ) {
      router.push('/');
    }
  }, [status, session, router]);

  const handleCancel = () => {
    router.back();
  };

  const handleDelete = async () => {
    if (!planId) {
      setError('Plan ID is missing');
      return;
    }

    try {
      const response = await fetch(`/api/admin/plan/${planId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Service plan deleted successfully!');
        router.push('/admin/plans');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete service plan');
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError('Unexpected error occurred');
    }
  };

  if (status === 'loading') {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="flex mt-15">
      <Sidebar />
      <div className="flex flex-1 justify-center items-center min-h-screen">
        <div className="bg-white shadow-lg mt-[-200] p-8 rounded-xl w-full max-w-md">
          <h3 className="mb-4 font-bold text-gray-800 text-xl">
            Delete Service Plan
          </h3>
          <p className="mb-6 text-gray-600">
            Are you sure you want to delete this plan? This action cannot be
            undone.
          </p>
          {error && (
            <div className="bg-red-100 mb-4 p-3 rounded text-red-700">
              {error}
            </div>
          )}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white cursor-pointer"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeletePlanPage() {
  return (
    <SessionProvider>
      <DeletePlanContent />
    </SessionProvider>
  );
}
