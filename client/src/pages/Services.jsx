import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServices, createService, updateService, deleteService } from '../features/services/servicesSlice';

const emptyForm = { name: '', duration: 30, price: 0, description: '' };

export default function Services() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.services);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  function handleCreateSubmit(e) {
    e.preventDefault();
    dispatch(createService({ ...form, duration: Number(form.duration), price: Number(form.price) }));
    setForm(emptyForm);
  }

  function startEdit(service) {
    setEditingId(service._id);
    setEditForm({
      name: service.name,
      duration: service.duration,
      price: service.price,
      description: service.description || '',
    });
  }

  function saveEdit(id) {
    dispatch(updateService({ id, ...editForm, duration: Number(editForm.duration), price: Number(editForm.price) }));
    setEditingId(null);
  }

  function toggleActive(service) {
    dispatch(updateService({ id: service._id, isActive: !service.isActive }));
  }

  function handleDelete(id) {
    if (window.confirm('Delete this service?')) {
      dispatch(deleteService(id));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Services</h1>

      <form
        onSubmit={handleCreateSubmit}
        className="bg-white rounded-lg shadow p-6 mb-8 grid grid-cols-1 sm:grid-cols-4 gap-4"
      >
        <input
          placeholder="Service name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 sm:col-span-2"
        />
        <input
          type="number"
          min={5}
          placeholder="Duration (min)"
          required
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2"
        />
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="Price"
          required
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2"
        />
        <input
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 sm:col-span-3"
        />
        <button type="submit" className="bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700">
          Add service
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
      {loading && <p className="text-gray-500 text-sm mb-4">Loading...</p>}

      <div className="bg-white rounded-lg shadow divide-y">
        {list.length === 0 && !loading && (
          <p className="p-6 text-gray-500 text-sm">No services yet. Add your first one above.</p>
        )}
        {list.map((service) =>
          editingId === service._id ? (
            <div key={service._id} className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 sm:col-span-2"
              />
              <input
                type="number"
                value={editForm.duration}
                onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="number"
                step="0.01"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <div className="sm:col-span-4 flex gap-2 justify-end">
                <button
                  onClick={() => saveEdit(service._id)}
                  className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md"
                >
                  Save
                </button>
                <button onClick={() => setEditingId(null)} className="text-sm text-gray-600 px-3 py-1.5">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div key={service._id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">
                  {service.name} {!service.isActive && <span className="text-xs text-gray-400">(inactive)</span>}
                </p>
                <p className="text-sm text-gray-500">
                  {service.duration} min · ${service.price}
                  {service.description ? ` · ${service.description}` : ''}
                </p>
              </div>
              <div className="flex gap-3 text-sm shrink-0">
                <button onClick={() => toggleActive(service)} className="text-gray-600 hover:underline">
                  {service.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => startEdit(service)} className="text-indigo-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(service._id)} className="text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
