import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, RotateCcw, Building2 } from 'lucide-react';
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
        console.error('Failed to load listings:', err);
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
        <h1 className="font-serif text-3xl font-bold text-[#12171A]">Mumbai Property Directory</h1>
        <p className="text-xs font-mono text-[#7A7870] mt-1">
          Explore curated residential rentals across South Mumbai and prime micro-markets
        </p>
      </div>

      {/* Filter Control Bar */}
      <form
        onSubmit={applyFilters}
        className="bg-[#FFFFFF] p-4 rounded-sm border border-[#E4E3DD] shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
      >
        <div>
          <label className="block text-[11px] font-mono font-semibold uppercase text-[#5C5A52] mb-1">
            Neighborhood
          </label>
          <input
            type="text"
            placeholder="e.g. Worli, Bandra"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="w-full text-xs p-2.5 bg-[#FBFBF9] border border-[#E4E3DD] rounded-sm focus:border-[#B34728] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono font-semibold uppercase text-[#5C5A52] mb-1">
            Configuration
          </label>
          <select
            value={bhkFilter}
            onChange={(e) => setBhkFilter(e.target.value)}
            className="w-full text-xs p-2.5 bg-[#FBFBF9] border border-[#E4E3DD] rounded-sm focus:border-[#B34728] focus:outline-none"
          >
            <option value="">All Configurations</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono font-semibold uppercase text-[#5C5A52] mb-1">
            Property Format
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full text-xs p-2.5 bg-[#FBFBF9] border border-[#E4E3DD] rounded-sm focus:border-[#B34728] focus:outline-none"
          >
            <option value="">All Formats</option>
            <option value="Flat">Flat / Apartment</option>
            <option value="PG">Executive PG</option>
            <option value="Single">Single Occupancy</option>
            <option value="Shared">Shared Home</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono font-semibold uppercase text-[#5C5A52] mb-1">
            Max Budget (₹/mo)
          </label>
          <input
            type="number"
            placeholder="e.g. 75000"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            className="w-full text-xs p-2.5 bg-[#FBFBF9] border border-[#E4E3DD] rounded-sm focus:border-[#B34728] focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-[#12171A] hover:bg-[#B34728] text-white text-xs font-mono font-semibold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Filter className="w-3.5 h-3.5 text-[#B8860B]" />
            <span>Apply</span>
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="p-2.5 bg-[#F3F2EE] hover:bg-[#E4E3DD] text-[#5C5A52] rounded-sm text-xs transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-mono text-[#7A7870]">
        <span>Showing {properties.length} available {properties.length === 1 ? 'property' : 'properties'}</span>
      </div>

      {/* Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-[#FFFFFF] rounded-sm border border-[#E4E3DD] p-4 space-y-3 animate-pulse">
              <div className="aspect-[16/10] bg-[#E4E3DD] rounded-sm" />
              <div className="h-4 bg-[#E4E3DD] rounded w-1/3" />
              <div className="h-4 bg-[#E4E3DD] rounded w-2/3" />
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
        <div className="text-center py-20 bg-[#FFFFFF] rounded-sm border border-[#E4E3DD] p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F3F2EE] text-[#B8860B] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#12171A]">No properties match these criteria</h3>
            <p className="text-xs text-[#7A7870] mt-1 max-w-sm mx-auto">
              Adjust your budget threshold or broaden your location query to see available Mumbai inventory.
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            className="px-5 py-2.5 bg-[#12171A] hover:bg-[#B34728] text-white text-xs font-mono font-semibold uppercase tracking-wider rounded-sm transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}