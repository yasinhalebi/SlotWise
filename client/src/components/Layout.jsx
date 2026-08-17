import { Outlet, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

export default function Layout() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  function navLinkClass(to) {
    const base = 'px-3 py-2 rounded-md text-sm font-medium';
    return location.pathname === to
      ? `${base} bg-indigo-600 text-white`
      : `${base} text-gray-600 hover:bg-gray-100`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-indigo-600 mr-2">SlotWise</span>
            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
              Dashboard
            </Link>
            <Link to="/services" className={navLinkClass('/services')}>
              Services
            </Link>
            <Link to="/calendar" className={navLinkClass('/calendar')}>
              Calendar
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.businessName}</span>
            <button
              type="button"
              onClick={() => dispatch(logout())}
              className="text-sm text-red-600 hover:underline"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
