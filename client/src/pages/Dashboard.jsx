import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMe } from '../features/auth/authSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Welcome, {user?.name}</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Business: {user?.businessName}</p>
        <p className="text-gray-600">
          Public booking link: <code className="bg-gray-100 px-1 rounded">/book/{user?.businessSlug}</code>
        </p>
        <p className="mt-4">
          <Link to="/services" className="text-indigo-600 hover:underline text-sm">
            Manage your services →
          </Link>
        </p>
      </div>
    </div>
  );
}
