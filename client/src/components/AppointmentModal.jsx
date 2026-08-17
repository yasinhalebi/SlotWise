import { useDispatch } from 'react-redux';
import { updateAppointmentStatus, deleteAppointment } from '../features/appointments/appointmentsSlice';

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled', 'completed'];

export default function AppointmentModal({ appointment, onClose }) {
  const dispatch = useDispatch();

  function handleStatusChange(status) {
    dispatch(updateAppointmentStatus({ id: appointment._id, status }));
    onClose();
  }

  function handleDelete() {
    if (window.confirm('Delete this appointment?')) {
      dispatch(deleteAppointment(appointment._id));
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">{appointment.customerName}</h2>
        <div className="space-y-1 text-sm text-gray-600 mb-4">
          <p>Service: {appointment.service?.name}</p>
          <p>Date: {appointment.date.slice(0, 10)}</p>
          <p>
            Time: {appointment.startTime} - {appointment.endTime}
          </p>
          <p>Phone: {appointment.customerPhone}</p>
          {appointment.customerEmail && <p>Email: {appointment.customerEmail}</p>}
          {appointment.notes && <p>Notes: {appointment.notes}</p>}
          <p>
            Status: <span className="font-medium capitalize">{appointment.status}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {STATUS_OPTIONS.filter((s) => s !== appointment.status).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusChange(status)}
              className="text-xs px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 capitalize"
            >
              Mark as {status}
            </button>
          ))}
        </div>
        <div className="flex justify-between">
          <button type="button" onClick={handleDelete} className="text-sm text-red-600 hover:underline">
            Delete
          </button>
          <button type="button" onClick={onClose} className="text-sm text-gray-600 hover:underline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
