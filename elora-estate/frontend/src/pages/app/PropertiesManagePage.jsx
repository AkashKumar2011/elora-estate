import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as propertiesApi from '../../api/properties';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { PROPERTY_STATUS_LABEL } from '../../utils/constants';

function formatPrice(price) {
  return price ? `₹${new Intl.NumberFormat('en-IN').format(price)}` : '—';
}

export default function PropertiesManagePage() {
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await propertiesApi.listInternalProperties(status ? { status } : {});
      setProperties(data.properties);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePublish = async (id) => {
    await propertiesApi.publishProperty(id);
    load();
  };
  const handleHide = async (id) => {
    await propertiesApi.hideProperty(id);
    load();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl">{user.role === 'owner_caretaker' ? 'My Properties' : 'Properties'}</h1>
        <Button as={Link} to="/properties/manage/new">
          + Add property
        </Button>
      </div>

      <div className="flex gap-2 mb-5">
        <Chip size="sm" selected={status === ''} onClick={() => setStatus('')}>All</Chip>
        {Object.entries(PROPERTY_STATUS_LABEL).map(([value, label]) => (
          <Chip key={value} size="sm" selected={status === value} onClick={() => setStatus(value)}>
            {label}
          </Chip>
        ))}
      </div>

      {isLoading ? (
        <p className="text-harbor">Loading…</p>
      ) : properties.length === 0 ? (
        <div className="border border-harbor-200 bg-chalk p-10 text-center">
          <p className="font-display text-lg mb-1">No properties yet</p>
          <p className="text-harbor text-sm mb-4">Add your first property — you only need the essentials to start.</p>
          <Button as={Link} to="/properties/manage/new">+ Add property</Button>
        </div>
      ) : (
        <div className="border border-harbor-200 bg-chalk divide-y divide-harbor-200">
          {properties.map((p) => (
            <div key={p._id} className="flex items-center justify-between gap-4 px-4 py-3 flex-wrap">
              <div className="min-w-0">
                <Link to={`/properties/manage/${p._id}`} className="font-medium hover:underline">
                  {p.public?.title || p.public?.locationArea || 'Untitled property'}
                </Link>
                <p className="text-harbor text-xs mt-0.5">
                  {p.propertyType?.replace('_', ' ')} · {p.public?.locationArea} · {formatPrice(p.public?.price)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs px-2 py-1 rounded-full border border-harbor-200 capitalize">{p.status}</span>
                {p.status === 'draft' && (
                  <Button size="sm" onClick={() => handlePublish(p._id)}>Publish</Button>
                )}
                {p.status === 'published' && (
                  <Button size="sm" variant="outline" onClick={() => handleHide(p._id)}>Hide</Button>
                )}
                <Button as={Link} to={`/properties/manage/${p._id}`} size="sm" variant="ghost">Edit</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
