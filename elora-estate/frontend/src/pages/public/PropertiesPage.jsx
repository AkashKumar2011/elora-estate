import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import { listPublicProperties } from '../../api/properties';

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [purpose, setPurpose] = useState(searchParams.get('purpose') || 'rent');
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bhk: searchParams.get('bhk') || '',
    type: searchParams.get('type') || '',
    furnishing: searchParams.get('furnishing') || '',
    availability: searchParams.get('availability') || '',
    tenantPreference: searchParams.get('tenantPreference') || '',
    area: searchParams.get('area') || '',
    possession: searchParams.get('possession') || '',
  });

  const loadListings = async () => {
    try {
      setLoading(true);
      setError(false);
      const params = { purpose, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await listPublicProperties(params);
      const list = res?.data?.properties || res?.properties || res?.data || [];
      const arr = Array.isArray(list) ? list : [];
      setProperties(arr.filter((p) => {
        const raw = String(p?.purpose || p?.listingType || p?.transactionType || '').toLowerCase();
        if (!raw) return true;
        return purpose === 'buy' ? raw.includes('sale') || raw.includes('buy') : !raw.includes('sale') && !raw.includes('buy');
      }));
    } catch (err) {
      console.error('Failed to load listings:', err);
      setError(true);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadListings(); }, [searchParams]);

  const applyFilters = (e) => {
    e?.preventDefault();
    const next = new URLSearchParams();
    next.set('purpose', purpose);
    Object.entries(filters).forEach(([k, v]) => { if (v) next.set(k, v); });
    setSearchParams(next);
  };

  const clearFilters = () => {
    setPurpose('rent');
    setFilters({ location: '', maxPrice: '', bhk: '', type: '', furnishing: '', availability: '', tenantPreference: '', area: '', possession: '' });
    setSearchParams(new URLSearchParams({ purpose: 'rent' }));
  };

  const update = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));
  const activeChips = Object.entries(filters).filter(([, v]) => Boolean(v));

  return (
    <div className="bg-[#F7F3EC]">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-stone-950">Explore Mumbai Properties</h1>
          <p className="mt-2 text-stone-600">Search rental homes and flats for sale across Mumbai localities.</p>
        </div>

        <form onSubmit={applyFilters} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mx-auto mb-6 flex w-full max-w-xs rounded-full bg-[#EEE8DF] p-1 text-sm font-bold">
            {['rent', 'buy'].map((tab) => (
              <button key={tab} type="button" onClick={() => setPurpose(tab)} className={`flex-1 rounded-full px-4 py-2 capitalize transition ${purpose === tab ? 'bg-white text-[#C55F26] shadow-sm' : 'text-stone-400 hover:text-stone-900'}`}>{tab}</button>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            <input value={filters.location} onChange={update('location')} placeholder="Location" className="h-12 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm outline-none focus:border-[#C55F26]" />
            <select value={filters.maxPrice} onChange={update('maxPrice')} className="h-12 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm outline-none focus:border-[#C55F26]"><option value="">Budget</option><option value="75000">Up to ₹75k</option><option value="150000">Up to ₹1.5L</option><option value="300000">Up to ₹3L</option><option value="50000000">Up to ₹5Cr</option></select>
            <select value={filters.bhk} onChange={update('bhk')} className="h-12 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm outline-none focus:border-[#C55F26]"><option value="">BHK</option><option value="1">1 BHK</option><option value="2">2 BHK</option><option value="3">3 BHK</option><option value="4">4+ BHK</option></select>
            <select value={filters.type} onChange={update('type')} className="h-12 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm outline-none focus:border-[#C55F26]"><option value="">Property Type</option><option value="Flat">Apartment</option><option value="PG">PG</option><option value="Single">Single Occupancy</option><option value="Shared">Shared Occupancy</option></select>
            <select value={filters.furnishing} onChange={update('furnishing')} className="h-12 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm outline-none focus:border-[#C55F26]"><option value="">Furnishing</option><option>Semi-Furnished</option><option>Fully Furnished</option><option>Unfurnished</option></select>
            <button className="h-12 rounded-md bg-stone-950 px-4 text-sm font-bold text-white transition hover:bg-[#C55F26]"><span className="inline-flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Apply</span></button>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <select value={filters.availability} onChange={update('availability')} className="h-11 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm outline-none focus:border-[#C55F26]"><option value="">Availability</option><option>Immediate</option><option>Ready to move</option><option>Next month</option></select>
            {purpose === 'rent' ? <select value={filters.tenantPreference} onChange={update('tenantPreference')} className="h-11 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm outline-none focus:border-[#C55F26]"><option value="">Tenant Preference</option><option>Family</option><option>Working Professionals</option><option>Bachelors</option></select> : <select value={filters.area} onChange={update('area')} className="h-11 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm outline-none focus:border-[#C55F26]"><option value="">Area / Size</option><option>1000+ sq.ft.</option><option>2000+ sq.ft.</option><option>3000+ sq.ft.</option></select>}
            {purpose === 'buy' && <select value={filters.possession} onChange={update('possession')} className="h-11 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm outline-none focus:border-[#C55F26]"><option value="">Possession</option><option>Ready to move</option><option>Under construction</option></select>}
          </div>
        </form>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <strong className="mr-2 text-stone-950">{loading ? 'Loading' : properties.length} results</strong>
            <span className="rounded-full bg-white px-3 py-1 text-stone-600">{purpose === 'rent' ? 'For Rent' : 'For Sale'}</span>
            {activeChips.map(([k, v]) => <span key={k} className="rounded-full bg-white px-3 py-1 text-stone-600">{v}</span>)}
            {activeChips.length > 0 && <button onClick={clearFilters} className="text-xs font-bold uppercase tracking-wide text-[#C55F26]">Clear all</button>}
          </div>
          <span className="text-sm text-stone-500">Sort by: <strong className="text-stone-900">Recommended</strong></span>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((i)=><div key={i} className="h-[520px] animate-pulse rounded-xl bg-white" />)}</div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-sm"><h3 className="font-display text-2xl font-bold">We couldn’t load properties right now.</h3><button onClick={loadListings} className="mt-5 rounded-md bg-stone-950 px-5 py-3 text-sm font-bold text-white">Try Again</button></div>
        ) : properties.length ? (
          <div className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">{properties.map((p)=><PropertyCard key={p._id || p.id} property={p} />)}</div>
        ) : (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-sm"><Search className="mx-auto h-10 w-10 text-[#C55F26]" /><h3 className="mt-4 font-display text-2xl font-bold">No properties match your search right now.</h3><p className="mt-2 text-stone-600">Clear filters or tell us what you need.</p><div className="mt-6 flex justify-center gap-3"><button onClick={clearFilters} className="rounded-md border border-stone-300 px-5 py-3 text-sm font-bold">Clear Filters</button><Link to="/feedback" className="rounded-md bg-[#C55F26] px-5 py-3 text-sm font-bold text-white">Tell Us What You Need</Link></div></div>
        )}
      </section>
    </div>
  );
}
