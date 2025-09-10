// app/components/admin/dashboard/RecentOrders.jsx
import Link from 'next/link';

export default function RecentOrders({ orders }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white shadow p-6 rounded-lg">
        <h3 className="mb-4 font-medium text-gray-900 text-lg">Recent Orders</h3>
        <div className="py-8 text-gray-500 text-center">
          <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-2">No recent orders</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-gray-200 border-b">
        <h3 className="font-medium text-gray-900 text-lg">Recent Orders</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="divide-y divide-gray-200 min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Plan
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.slice(0, 5).map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-blue-600 text-sm whitespace-nowrap">
                  <Link href={`/admin/orders/${order.id}`}>
                    {order.code}
                  </Link>
                </td>
                <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                  {order.customerName}
                </td>
                <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                  {order.planName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'paid' ? 'bg-green-100 text-green-800' :
                    order.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'installed' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 px-6 py-4 text-right">
        <Link
          href="/admin/orders"
          className="font-medium text-blue-600 hover:text-blue-800 text-sm"
        >
          View all orders →
        </Link>
      </div>
    </div>
  );
}