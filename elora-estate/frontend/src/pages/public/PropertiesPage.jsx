import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, RotateCcw } from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import { listPublicProperties } from '../../api/properties';

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');
  const [bhkFilter, setBhkFilter] = useState(searchParams.get('bhk') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [maxBudget, setMaxBudget] = useState(searchParams.get('maxPrice') || '');

useEffect(() => {
  async function fetchListings() {
    try {
      setLoading(true);
      const params = {
        location: searchParams.get('location') || undefined,
        bhk: searchParams.get('bhk') || undefined,
        type: searchParams.get('type') || undefined,
        maxPrice: searchParams.get('maxPrice') || undefined,
      };
      const res = await listPublicProperties(params);
      const list = res?.data?.properties || res?.properties || res?.data || [];
      setProperties(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  }
  fetchListings();
}, [searchParams]);

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    const newParams = new URLSearchParams();
    if (locationInput.trim()) newParams.set('location', locationInput.trim());
    if (bhkFilter) newParams.set('bhk', bhkFilter);
    if (typeFilter) newParams.set('type', typeFilter);
    if (maxBudget) newParams.set('maxPrice', maxBudget);
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setLocationInput('');
    setBhkFilter('');
    setTypeFilter('');
    setMaxBudget('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-slate-900">Browse Properties</h1>
        <p className="text-xs sm:text-sm text-slate-600 font-mono mt-1">
          Explore curated rental inventory across Mumbai neighborhoods
        </p>
      </div>

      {/* Filter Control Bar */}
      <form
        onSubmit={applyFilters}
        className="bg-white p-4 rounded-md border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-mono font-medium text-slate-700 mb-1">Neighborhood</label>
          <input
            type="text"
            placeholder="e.g. Bandra, Powai"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="w-full text-xs p-2 border border-slate-200 rounded focus:border-amber-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-700 mb-1">BHK Configuration</label>
          <select
            value={bhkFilter}
            onChange={(e) => setBhkFilter(e.target.value)}
            className="w-full text-xs p-2 border border-slate-200 rounded focus:border-amber-600 focus:outline-none"
          >
            <option value="">All Configurations</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-700 mb-1">Property Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full text-xs p-2 border border-slate-200 rounded focus:border-amber-600 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="Flat">Flat</option>
            <option value="PG">PG</option>
            <option value="Apartment">Apartment</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-700 mb-1">Max Budget (₹/mo)</label>
          <input
            type="number"
            placeholder="e.g. 50000"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            className="w-full text-xs p-2 border border-slate-200 rounded focus:border-amber-600 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-semibold rounded flex items-center justify-center gap-1 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded text-xs transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between text-xs font-mono text-slate-500">
        <span>Showing {properties.length} available {properties.length === 1 ? 'property' : 'properties'}</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded border border-slate-200 p-4 space-y-3 animate-pulse">
              <div className="aspect-[16/10] bg-slate-200 rounded" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <PropertyCard key={prop._id || prop.id} property={prop} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded border border-slate-200 p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-base">No listings match your current filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your maximum budget or broadening your location query to see available units.
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-slate-900 text-amber-400 text-xs font-semibold rounded hover:bg-slate-800 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}