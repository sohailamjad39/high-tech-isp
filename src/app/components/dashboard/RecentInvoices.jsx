// components/dashboard/RecentInvoices.jsx
import Link from 'next/link';

export default function RecentInvoices({ invoices }) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="p-5 border-gray-200 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Recent Invoices</h3>
        </div>
        <div className="p-5">
          <div className="py-6 text-center">
            <p className="text-gray-500">No invoices found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="p-5 border-gray-200 border-b">
        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h3 className="font-medium text-gray-900 text-lg">Recent Invoices</h3>
          <Link 
            href="/dashboard/billing" 
            className="font-medium text-blue-600 hover:text-blue-800 text-sm"
          >
            View All
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="hover:bg-gray-50 p-4 transition-colors">
            <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div className="flex flex-1 items-center space-x-3 min-w-0">
                <div className={`h-2 w-2 rounded-full ${
                  invoice.status === 'paid' ? 'bg-green-500' :
                  invoice.status === 'overdue' ? 'bg-red-500' :
                  invoice.status === 'partial' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{invoice.invoiceNumber}</p>
                  <p className="text-gray-500 text-sm truncate">
                    {new Date(invoice.issuedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="font-semibold">${invoice.total}</p>
                <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                  invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}