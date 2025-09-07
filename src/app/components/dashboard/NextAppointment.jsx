// components/dashboard/NextAppointment.jsx
import Link from 'next/link';

export default function NextAppointment({ appointment }) {
  if (!appointment) {
    return (
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="p-5 border-gray-200 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Next Appointment</h3>
        </div>
        <div className="p-5">
          <div className="py-6 text-center">
            <p className="text-gray-500">No upcoming appointments</p>
            <p className="mt-2 text-gray-500 text-sm">
              Your service is active and no appointments are scheduled.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const startDate = new Date(appointment.scheduledStart);
  const endDate = new Date(appointment.scheduledEnd);
  
  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="p-5 border-gray-200 border-b">
        <h3 className="font-medium text-gray-900 text-lg">Next Appointment</h3>
      </div>
      
      <div className="p-5">
        <div className="flex items-center space-x-2 mb-4">
          <div className="bg-blue-500 rounded-full w-2 h-2"></div>
          <span className="font-medium text-blue-800 text-sm">{appointment.type}</span>
        </div>
        
        <h4 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight">
          {startDate.toLocaleDateString(undefined, { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h4>
        
        <p className="mt-2 text-gray-600 text-sm">
          {startDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })} - {endDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
        
        <div className="mt-4 pt-4 border-gray-200 border-t">
          <p className="text-gray-500 text-sm">
            Technician: <span className="font-medium">{appointment.technicianName}</span>
          </p>
        </div>
        
        <div className="mt-4">
          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
            appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
            appointment.status === 'enroute' ? 'bg-green-100 text-green-800' :
            appointment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {appointment.status}
          </span>
        </div>
      </div>
      
      <div className="bg-gray-50 p-5 border-gray-200 border-t">
        <Link 
          href="/dashboard/appointments" 
          className="block font-medium text-blue-600 hover:text-blue-800 text-sm text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}