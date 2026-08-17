import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fetchAppointments } from '../features/appointments/appointmentsSlice';
import AppointmentModal from '../components/AppointmentModal';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#4f46e5',
  cancelled: '#9ca3af',
  completed: '#16a34a',
};

export default function CalendarPage() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.appointments);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const events = useMemo(
    () =>
      list.map((appt) => {
        const dateStr = appt.date.slice(0, 10);
        return {
          id: appt._id,
          title: `${appt.customerName} — ${appt.service?.name || 'Service'}`,
          start: new Date(`${dateStr}T${appt.startTime}:00`),
          end: new Date(`${dateStr}T${appt.endTime}:00`),
          resource: appt,
        };
      }),
    [list]
  );

  function eventPropGetter(event) {
    return {
      style: {
        backgroundColor: STATUS_COLORS[event.resource.status] || '#6366f1',
        borderRadius: '4px',
        border: 'none',
      },
    };
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Calendar</h1>
      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
      {loading && <p className="text-gray-500 text-sm mb-4">Loading...</p>}
      <div className="bg-white rounded-lg shadow p-4" style={{ height: 650 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventPropGetter}
          onSelectEvent={(event) => setSelected(event.resource)}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="week"
        />
      </div>
      {selected && <AppointmentModal appointment={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
