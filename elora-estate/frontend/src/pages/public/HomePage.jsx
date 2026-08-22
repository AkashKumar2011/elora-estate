import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Building2, MapPin, CheckCircle2, ArrowRight, ShieldCheck, Clock, Key } from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import { listPublicProperties } from '../../api/properties';

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const navigate = useNavigate();

 useEffect(() => {
  async function loadData() {
    try {
      setLoading(true);
      const res = await listPublicProperties({ limit: 6 });
      const list = res?.data?.properties || res?.properties || res?.data || [];
      setFeaturedProperties(Array.isArray(list) ? list.slice(0, 6) : []);
    } catch (err) {
      console.error('Error fetching featured listings:', err);
    } finally {
      setLoading(false);
    }
  }
  loadData();
}, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      navigate(`/properties?location=${encodeURIComponent(searchLocation.trim())}`);
    } else {
      navigate('/properties');
    }
  };

  const categories = [
    { title: '1 BHK Flats', query: 'bhk=1', desc: 'Compact urban homes' },
    { title: '2 BHK Apartments', query: 'bhk=2', desc: 'Spacious family spaces' },
    { title: '3+ BHK Luxury', query: 'bhk=3', desc: 'Premium residences' },
    { title: 'PG & Shared', query: 'type=PG', desc: 'Co-living options' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* SECTION 1: HERO */}
      <section className="relative bg-slate-950 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono tracking-wide uppercase">
            Curated Mumbai Rental Discovery
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Refined Living Spaces Across <span className="text-amber-400 italic">Mumbai</span>.
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            Direct coordination with authorized brokers. Verified listing details, zero guesswork, and structured physical visits.
          </p>

          {/* Quick Search Box */}
          <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto flex items-center bg-white rounded p-1.5 shadow-2xl">
            <div className="flex items-center gap-2 pl-3 flex-1 text-slate-600">
              <MapPin className="w-5 h-5 text-amber-600 shrink-0" />
              <input
                type="text"
                placeholder="Search neighborhood (e.g. Bandra, Andheri, Powai)..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>
        </div>
      </section>

      {/* SECTION 2: CATEGORY NAVIGATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Explore by Property Type</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-mono">Tailored layouts suited for every living configuration</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              to={`/properties?${cat.query}`}
              className="p-5 rounded border border-slate-200 bg-white hover:border-amber-600 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">{cat.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{cat.desc}</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-mono font-medium text-amber-700">
                <span>View listings</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 3: FEATURED LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Featured Properties</h2>
            <p className="text-xs sm:text-sm text-slate-600 font-mono mt-1">Available for immediate scheduling</p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:text-amber-900 font-mono"
          >
            <span>Browse all listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded border border-slate-200 p-4 space-y-3 animate-pulse">
                <div className="aspect-[16/10] bg-slate-200 rounded" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop._id || prop.id} property={prop} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded border border-slate-200 p-6">
            <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600">No properties available in this category at the moment.</p>
          </div>
        )}
      </section>

      {/* SECTION 4: WHY ELORAESTATE */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">The EloraEstate Standard</h2>
            <p className="text-xs sm:text-sm text-slate-600 font-mono mt-1">Engineered for clean, direct rental discovery</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded border border-slate-200/80">
              <ShieldCheck className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">Direct Broker Coordination</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect directly with the registered broker handling the unit. No multi-tier intermediation or redundant calls.
              </p>
            </div>
            <div className="bg-white p-6 rounded border border-slate-200/80">
              <Key className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">Clear Financial Terms</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upfront monthly rent, security deposit terms, and furnishing state visible immediately on every listing.
              </p>
            </div>
            <div className="bg-white p-6 rounded border border-slate-200/80">
              <Clock className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">Efficient Visit Scheduling</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Shortlist properties and schedule single or batch visits smoothly through your portal without back-and-forth friction.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}