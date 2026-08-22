import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  IndianRupee, 
  MapPin, 
  Eye, 
  Calendar, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { getOwnerProperties, togglePropertyStatus } from '../../api/ownerApi';

export default function OwnerPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const res = await getOwnerProperties();
        const list = res?.data?.properties || res?.properties || res?.data || [];
        setProperties(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load owner properties:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  const handleToggle = async (propId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'rented' : 'active';
    try {
      await togglePropertyStatus(propId, { status: nextStatus });
      setProperties((prev) =>
        prev.map((p) => ((p._id === propId || p.id === propId) ? { ...p, availabilityStatus: nextStatus } : p))
      );
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update property status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-amber-700 font-semibold">
            Owner Portfolio Portal
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            Listed Mumbai Residences
          </h1>
        </div>
        <Link
          to="/owner/new-property"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-amber-400 text-xs font-mono font-semibold rounded shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Listing</span>
        </Link>
      </div>

      {/* Inventory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="h-40 bg-white rounded border border-slate-200" />
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((prop) => {
            const pId = prop._id || prop.id;
            const isActive = prop.availabilityStatus === 'active' || !prop.availabilityStatus;
            return (
              <div
                key={pId}
                className="bg-white p-5 rounded border border-slate-200/90 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded uppercase ${
                        isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {prop.availabilityStatus || 'Active'}
                    </span>
                    <div className="flex items-center font-mono font-bold text-sm text-slate-900">
                      <IndianRupee className="w-3.5 h-3.5 inline" />
                      <span>{Number(prop.price || prop.rent || 0).toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-slate-500 font-normal ml-0.5">/mo</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{prop.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-mono">
                    <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>{prop.location || 'Mumbai'}, {prop.bhk ? `${prop.bhk} BHK` : 'Flat'}</span>
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <Link
                    to={`/properties/${pId}`}
                    className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Public View</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleToggle(pId, prop.availabilityStatus)}
                    className="text-amber-800 font-semibold hover:underline"
                  >
                    {isActive ? 'Mark as Rented' : 'Reactivate Listing'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-8 text-center rounded border border-slate-200 text-xs text-slate-500 font-mono space-y-2">
          <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
          <p>No real estate listings registered under your account yet.</p>
        </div>
      )}
    </div>
  );
}