import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export default function PublicBooking() {
  const { businessSlug } = useParams();

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState(todayDateString());
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadBusiness() {
      try {
        const { data } = await api.get(`/services/public/${businessSlug}`);
        if (cancelled) return;
        setBusiness(data.business);
        setServices(data.services);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoadingBusiness(false);
      }
    }
    loadBusiness();
    return () => {
      cancelled = true;
    };
  }, [businessSlug]);

  useEffect(() => {
    if (!selectedService || !date) return;
    let cancelled = false;
    setLoadingSlots(true);
    setSlotsError(null);
    setSelectedSlot(null);
    setSubmitError(null);
    api
      .get('/appointments/available-slots', {
        params: { businessSlug, date, serviceId: selectedService._id },
      })
      .then(({ data }) => {
        if (!cancelled) setSlots(data.slots);
      })
      .catch((err) => {
        if (!cancelled) setSlotsError(err.response?.data?.message || 'Failed to load available times');
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [businessSlug, selectedService, date]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data } = await api.post('/appointments', {
        businessSlug,
        serviceId: selectedService._id,
        date,
        startTime: selectedSlot.startTime,
        ...form,
      });
      setConfirmedAppointment(data.appointment);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create booking');
      if (err.response?.status === 409) {
        setSelectedSlot(null);
        setSlots((prev) => prev.filter((s) => s.startTime !== selectedSlot.startTime));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingBusiness) {
    return <CenteredMessage>Loading...</CenteredMessage>;
  }

  if (notFound) {
    return <CenteredMessage>This booking page doesn&apos;t exist.</CenteredMessage>;
  }

  if (confirmedAppointment) {
    return (
      <CenteredCard>
        <h1 className="text-xl font-semibold mb-2 text-center">Booking requested 🎉</h1>
        <p className="text-sm text-gray-600 text-center mb-4">
          {business.businessName} will confirm your appointment soon.
        </p>
        <div className="bg-gray-50 rounded-md p-4 text-sm text-gray-700 space-y-1">
          <p>Date: {confirmedAppointment.date.slice(0, 10)}</p>
          <p>
            Time: {confirmedAppointment.startTime} - {confirmedAppointment.endTime}
          </p>
          <p>Status: pending confirmation</p>
        </div>
      </CenteredCard>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold text-center mb-1">{business.businessName}</h1>
        <p className="text-sm text-gray-500 text-center mb-8">Book an appointment</p>

        <section className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="font-medium mb-3">1. Choose a service</h2>
          {services.length === 0 ? (
            <p className="text-sm text-gray-500">No services available right now.</p>
          ) : (
            <div className="space-y-2">
              {services.map((service) => (
                <button
                  key={service._id}
                  type="button"
                  onClick={() => setSelectedService(service)}
                  className={`w-full text-left border rounded-md px-4 py-3 transition ${
                    selectedService?._id === service._id
                      ? 'border-indigo-600 ring-1 ring-indigo-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-gray-500">
                    {service.duration} min · ${service.price}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedService && (
          <section className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="font-medium mb-3">2. Choose a date</h2>
            <input
              type="date"
              min={todayDateString()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            />

            <h3 className="font-medium mt-5 mb-3">3. Choose a time</h3>
            {submitError && (
              <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{submitError}</p>
            )}
            {loadingSlots && <p className="text-sm text-gray-500">Loading available times...</p>}
            {slotsError && <p className="text-sm text-red-600">{slotsError}</p>}
            {!loadingSlots && !slotsError && slots.length === 0 && (
              <p className="text-sm text-gray-500">No available times on this date.</p>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.startTime}
                  type="button"
                  onClick={() => {
                    setSubmitError(null);
                    setSelectedSlot(slot);
                  }}
                  className={`text-sm rounded-md px-2 py-2 border ${
                    selectedSlot?.startTime === slot.startTime
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          </section>
        )}

        {selectedSlot && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="font-medium mb-3">4. Your details</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="Full name"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                placeholder="Phone number"
                required
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <textarea
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={2}
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Booking...' : `Confirm booking at ${selectedSlot.startTime}`}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}

function CenteredMessage({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <p className="text-gray-500">{children}</p>
    </div>
  );
}

function CenteredCard({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow">{children}</div>
    </div>
  );
}
