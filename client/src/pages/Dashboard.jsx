import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, logout } from '../features/auth/authSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Welcome, {user?.name}</h1>
        <button onClick={() => dispatch(logout())} className="text-sm text-red-600 hover:underline">
          Log out
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Business: {user?.businessName}</p>
        <p className="text-gray-600">
          Public booking link: <code className="bg-gray-100 px-1 rounded">/book/{user?.businessSlug}</code>
        </p>
        <p className="mt-4 text-sm text-gray-400">Services and calendar management arrive in the next phases.</p>
      </div>
    </div>
  );
}
