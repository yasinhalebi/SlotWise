import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DEMO_EMAIL = 'frontend.test@example.com';
const DEMO_PASSWORD = 'testpass123';
const DEMO_BOOKING_SLUG = 'salon-noor-frontend-test';

export default function Landing() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="font-semibold text-indigo-600 text-lg">SlotWise</span>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/login" className="text-gray-600 hover:text-gray-900">
              Log in
            </Link>
            <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Appointment booking, without the back-and-forth.</h1>
          <p className="text-lg text-gray-600 mb-8">
            SlotWise gives small businesses — salons, clinics, studios, personal trainers — a dashboard to manage
            their services and calendar, plus a public booking link they can share with customers. No more juggling
            appointments over WhatsApp, no double-bookings.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/login?demo=1"
              className="bg-indigo-600 text-white px-5 py-3 rounded-md font-medium hover:bg-indigo-700"
            >
              Try the owner dashboard
            </Link>
            <Link
              to={`/book/${DEMO_BOOKING_SLUG}`}
              className="bg-white border border-gray-300 px-5 py-3 rounded-md font-medium hover:border-gray-400"
            >
              See a customer booking page
            </Link>
          </div>
        </div>

        <div className="mt-10 max-w-2xl bg-indigo-50 border border-indigo-100 rounded-lg p-5">
          <p className="text-sm font-medium text-indigo-900 mb-1">Demo account — explore freely, no signup needed</p>
          <p className="text-sm text-indigo-800">
            Email: <code className="bg-white px-1.5 py-0.5 rounded">{DEMO_EMAIL}</code>
            {' · '}
            Password: <code className="bg-white px-1.5 py-0.5 rounded">{DEMO_PASSWORD}</code>
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-3 gap-6">
          <Feature
            title="Real availability, calculated live"
            body="Customers only ever see time slots that actually fit the business's working hours and don't collide with an existing booking."
          />
          <Feature
            title="One link to share"
            body="Every business gets a public booking page — no account required for customers to book an appointment."
          />
          <Feature
            title="A calendar that just works"
            body="Confirm, cancel, or complete appointments from a week/month calendar view, color-coded by status."
          />
        </div>
      </main>
    </div>
  );
}

function Feature({ title, body }) {
  return (
    <div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{body}</p>
    </div>
  );
}
