// components/dashboard/RecentInvoices.jsx
import Link from 'next/link';

export default function RecentInvoices({ invoices }) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-white shadow p-6 rounded-xl">
        <h3 className="font-medium text-gray-900 text-lg">Recent Invoices</h3>
        <div className="mt-4 text-center">
          <p className="text-gray-500">No invoices found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow p-6 rounded-xl">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-900 text-lg">Recent Invoices</h3>
        <Link 
          href="/dashboard/billing" 
          className="font-medium text-blue-600 hover:text-blue-800 text-sm"
        >
          View All
        </Link>
      </div>
      
      <div className="space-y-4 mt-6">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="flex justify-between items-center py-2">
            <div className="flex items-center space-x-3">
              <div className={`h-2 w-2 rounded-full ${
                invoice.status === 'paid' ? 'bg-green-500' :
                invoice.status === 'overdue' ? 'bg-red-500' :
                invoice.status === 'partial' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`}></div>
              <div>
                <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                <p className="text-gray-500 text-sm">
                  {new Date(invoice.issuedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
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
        ))}
      </div>
    </div>
  );
}