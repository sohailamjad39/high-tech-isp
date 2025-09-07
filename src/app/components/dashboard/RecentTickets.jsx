// components/dashboard/RecentTickets.jsx
import Link from 'next/link';

export default function RecentTickets({ tickets }) {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="bg-white shadow p-6 rounded-xl">
        <h3 className="font-medium text-gray-900 text-lg">Recent Support Tickets</h3>
        <div className="mt-4 text-center">
          <p className="text-gray-500">No recent tickets</p>
          <Link 
            href="/dashboard/tickets/new" 
            className="inline-block bg-blue-600 hover:bg-blue-700 mt-4 px-4 py-2 rounded-lg text-white"
          >
            Create Ticket
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow p-6 rounded-xl">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-900 text-lg">Recent Support Tickets</h3>
        <Link 
          href="/dashboard/tickets" 
          className="font-medium text-blue-600 hover:text-blue-800 text-sm"
        >
          View All
        </Link>
      </div>
      
      <div className="space-y-4 mt-6">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="flex justify-between items-center py-2">
            <div className="flex-1">
              <p className="font-medium text-gray-900 truncate">{ticket.subject}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-gray-500 text-sm">#{ticket.code}</span>
                <span className="text-gray-400 text-xs">•</span>
                <span className="text-gray-500 text-sm">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
        ))}
      </div>
    </div>
  );
}