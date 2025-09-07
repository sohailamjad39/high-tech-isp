// components/dashboard/NextAppointment.jsx
import Link from 'next/link';

export default function NextAppointment({ appointment }) {
  if (!appointment) {
    return (
      <div className="bg-white shadow p-6 rounded-xl">
        <h3 className="font-medium text-gray-900 text-lg">Next Appointment</h3>
        <div className="mt-4 text-center">
          <p className="text-gray-500">No upcoming appointments</p>
          <p className="mt-2 text-gray-500 text-sm">
            Your service is active and no appointments are scheduled.
          </p>
        </div>
      </div>
    );
  }

  const startDate = new Date(appointment.scheduledStart);
  const endDate = new Date(appointment.scheduledEnd);
  
  return (
    <div className="bg-white shadow p-6 rounded-xl">
      <h3 className="font-medium text-gray-900 text-lg">Next Appointment</h3>
      
      <div className="mt-6">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-500 rounded-full w-2 h-2"></div>
          <span className="font-medium text-blue-800 text-sm">{appointment.type}</span>
        </div>
        
        <h4 className="mt-3 font-semibold text-gray-900 text-lg">
          {startDate.toLocaleDateString(undefined, { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h4>
        
        <p className="mt-1 text-gray-600">
          {startDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })} - {endDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
        
        <p className="mt-3 text-gray-500 text-sm">
          Technician: <span className="font-medium">{appointment.technicianName}</span>
        </p>
        
        <div className="mt-4">
          <span className={`inline-block rounded-full px-2 py-1 text-xs ${
            appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
            appointment.status === 'enroute' ? 'bg-green-100 text-green-800' :
            appointment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {appointment.status}
          </span>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t">
        <Link 
          href="/dashboard/appointments" 
          className="font-medium text-blue-600 hover:text-blue-800 text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}