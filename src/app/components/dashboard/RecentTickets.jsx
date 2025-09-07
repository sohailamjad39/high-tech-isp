// components/dashboard/RecentTickets.jsx
import Link from 'next/link';

export default function RecentTickets({ tickets }) {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="p-5 border-gray-200 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Recent Support Tickets</h3>
        </div>
        <div className="p-5">
          <div className="py-6 text-center">
            <p className="text-gray-500">No recent tickets</p>
            <Link 
              href="/dashboard/tickets/new" 
              className="inline-block bg-blue-600 hover:bg-blue-700 mt-4 px-6 py-2 rounded-lg w-full sm:w-auto text-white text-sm"
            >
              Create Ticket
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="p-5 border-gray-200 border-b">
        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h3 className="font-medium text-gray-900 text-lg">Recent Support Tickets</h3>
          <Link 
            href="/dashboard/tickets" 
            className="font-medium text-blue-600 hover:text-blue-800 text-sm"
          >
            View All
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="hover:bg-gray-50 p-4 transition-colors">
            <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{ticket.subject}</p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                  <span className="text-gray-500 text-xs">#{ticket.code}</span>
                  <span className="text-gray-400 text-xs">•</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-shrink-0 space-x-2 mt-2 sm:mt-0">
                <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                  ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                  ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {ticket.priority}
                </span>
                <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                  ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  ticket.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {ticket.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}