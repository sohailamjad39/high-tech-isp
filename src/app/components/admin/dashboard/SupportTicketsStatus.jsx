// app/components/admin/dashboard/SupportTicketsStatus.jsx
export default function SupportTicketsStatus({ tickets }) {
    // Count tickets by status
    const statusCounts = tickets?.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {}) || {};
    
    const totalTickets = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-gray-200 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Support Tickets Status</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-gray-600 text-sm capitalize">
                  {status.replace('_', ' ')}
                </span>
                <div className="flex items-center">
                  <div 
                    className={`w-2 h-2 rounded-full mr-2 ${
                      status === 'pending' ? 'bg-yellow-500' :
                      status === 'in_progress' ? 'bg-blue-500' :
                      status === 'resolved' ? 'bg-green-500' :
                      status === 'closed' ? 'bg-gray-500' :
                      'bg-red-500'
                    }`}
                  ></div>
                  <span className="font-medium text-gray-900 text-sm">{count}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-gray-200 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900 text-sm">Total Tickets</span>
              <span className="font-bold text-gray-900 text-sm">{totalTickets}</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 text-right">
          <a
            href="/admin/tickets"
            className="font-medium text-blue-600 hover:text-blue-800 text-sm"
          >
            View all tickets →
          </a>
        </div>
      </div>
    );
  }