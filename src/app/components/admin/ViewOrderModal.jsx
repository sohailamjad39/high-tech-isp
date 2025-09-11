// app/components/admin/ViewOrderModal.jsx
'use client';

import { useCustomer } from '@/app/context/CustomerContext';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function ViewOrderModal() {
  const { currentOrder, viewMode, closeCustomer } = useCustomer();

  // Only show modal when in view mode and an order is selected
  const isOpen = viewMode === 'view' && currentOrder !== null;

  // Status badge component with color coding
  const StatusBadge = ({ status }) => {
    const colors = {
      initiated: "bg-gray-100 text-gray-800",
      awaiting_payment: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      scheduled: "bg-purple-100 text-purple-800",
      installed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      failed: "bg-red-100 text-red-800"
    };

    // Format status string (replace underscores with spaces and capitalize)
    const formatStatus = (status) => {
      if (!status) return 'Unknown';
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {formatStatus(status)}
      </span>
    );
  };

  // Payment status badge
  const PaymentStatusBadge = ({ status }) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      succeeded: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-orange-100 text-orange-800"
    };

    if (!status) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="z-50 relative" onClose={closeCustomer}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex justify-center items-center p-4 min-h-full text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white shadow-xl p-6 rounded-2xl w-full max-w-4xl overflow-hidden text-left align-middle transition-all transform">
                <Dialog.Title
                  as="h3"
                  className="mb-6 font-medium text-gray-900 text-lg leading-6"
                >
                  Order Details #{currentOrder?.orderId || 'Loading...'}
                </Dialog.Title>
                
                {!currentOrder ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="border-indigo-600 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Order Overview */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="mb-4 font-medium text-gray-900">Order Overview</h4>
                      <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Order ID</label>
                          <p className="mt-1 text-gray-900">{currentOrder.id}</p>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Status</label>
                          <div className="mt-1">
                            <StatusBadge status={currentOrder.status} />
                          </div>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Payment Status</label>
                          <div className="mt-1">
                            <PaymentStatusBadge status={currentOrder.paymentStatus} />
                          </div>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Created At</label>
                          <p className="mt-1 text-gray-900">{currentOrder.createdAt ? new Date(currentOrder.createdAt).toLocaleString() : 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Updated At</label>
                          <p className="mt-1 text-gray-900">{currentOrder.updatedAt ? new Date(currentOrder.updatedAt).toLocaleString() : 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Gateway</label>
                          <p className="mt-1 text-gray-900">{currentOrder.gateway || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="mb-4 font-medium text-gray-900">Customer Information</h4>
                      <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Name</label>
                          <p className="mt-1 text-gray-900">{currentOrder.customerName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Email</label>
                          <p className="mt-1 text-gray-900">{currentOrder.customerEmail || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Customer ID</label>
                          <p className="mt-1 text-gray-900">{currentOrder.customerId || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Last Login</label>
                          <p className="mt-1 text-gray-900">{currentOrder.customerLastLogin ? new Date(currentOrder.customerLastLogin).toLocaleString() : 'Never'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Service Plan */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="mb-4 font-medium text-gray-900">Service Plan</h4>
                      <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Plan Name</label>
                          <p className="mt-1 text-gray-900">{currentOrder.planName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Speed</label>
                          <p className="mt-1 text-gray-900">
                            {currentOrder.downloadSpeed} Mbps ↓ / {currentOrder.uploadSpeed} Mbps ↑
                          </p>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Monthly Price</label>
                          <p className="mt-1 text-gray-900">
                            {currentOrder.currency} {currentOrder.monthlyPrice?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Yearly Price</label>
                          <p className="mt-1 text-gray-900">
                            {currentOrder.currency} {currentOrder.yearlyPrice?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    {currentOrder.address && (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="mb-4 font-medium text-gray-900">Installation Address</h4>
                        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                          <div>
                            <label className="block font-medium text-gray-500 text-sm">Full Address</label>
                            <p className="mt-1 text-gray-900">{currentOrder.address}</p>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-500 text-sm">Coverage Area</label>
                            <p className="mt-1 text-gray-900">{currentOrder.coverageAreaName || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Installation Schedule */}
                    {currentOrder.installationSlot?.start && (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="mb-4 font-medium text-gray-900">Installation Schedule</h4>
                        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                          <div>
                            <label className="block font-medium text-gray-500 text-sm">Scheduled Start</label>
                            <p className="mt-1 text-gray-900">
                              {new Date(currentOrder.installationSlot.start).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-500 text-sm">Scheduled End</label>
                            <p className="mt-1 text-gray-900">
                              {new Date(currentOrder.installationSlot.end).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Addons */}
                    {currentOrder.addons && currentOrder.addons.length > 0 && (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="mb-4 font-medium text-gray-900">Add-ons</h4>
                        <div className="overflow-x-auto">
                          <table className="divide-y divide-gray-200 min-w-full">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Price at Purchase</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {currentOrder.addons.map((addon, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">{addon.name}</td>
                                  <td className="px-6 py-4 text-gray-900 text-sm">{addon.description || 'No description'}</td>
                                  <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                                    {currentOrder.currency} {addon.priceAtPurchase.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Totals */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="mb-4 font-medium text-gray-900">Order Totals</h4>
                      <div className="gap-6 grid grid-cols-1 md:grid-cols-4">
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Subtotal</label>
                          <p className="mt-1 text-gray-900">
                            {currentOrder.currency} {currentOrder.totals?.subtotal?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Tax</label>
                          <p className="mt-1 text-gray-900">
                            {currentOrder.currency} {currentOrder.totals?.tax?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Discount</label>
                          <p className="mt-1 text-gray-900">
                            {currentOrder.currency} {currentOrder.totals?.discount?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-500 text-sm">Grand Total</label>
                          <p className="mt-1 font-bold text-gray-900">
                            {currentOrder.currency} {currentOrder.totals?.grandTotal?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    className="inline-flex justify-center bg-blue-100 hover:bg-blue-200 px-4 py-2 border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 font-medium text-blue-900 text-sm"
                    onClick={closeCustomer}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}