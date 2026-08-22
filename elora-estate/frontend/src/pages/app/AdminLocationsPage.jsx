import { useEffect, useState, useCallback } from 'react';
import * as locationsApi from '../../api/locations';
import Button from '../../components/Button';

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await locationsApi.listAllLocations();
      setLocations(data.locations);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e) => {
    e.preventDefault();
    setError('');
    if (!newName.trim()) return;
    try {
      await locationsApi.createLocation(newName.trim());
      setNewName('');
      load();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not add location');
    }
  };

  const toggle = async (loc) => {
    await locationsApi.setLocationActive(loc._id, !loc.isActive);
    load();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-display text-2xl mb-6">Locations</h1>

      <form onSubmit={add} className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. Chembur"
          className="flex-1 border border-harbor-200 rounded-sm px-3 py-2"
        />
        <Button type="submit">Add location</Button>
      </form>
      {error && <p className="text-sm text-laterite-700 mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-harbor">Loading…</p>
      ) : (
        <div className="border border-harbor-200 bg-chalk divide-y divide-harbor-200">
          {locations.map((loc) => (
            <div key={loc._id} className="flex items-center justify-between px-4 py-3">
              <span className={loc.isActive ? '' : 'text-harbor line-through'}>{loc.name}</span>
              <Button size="sm" variant={loc.isActive ? 'ghost' : 'outline'} onClick={() => toggle(loc)}>
                {loc.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
