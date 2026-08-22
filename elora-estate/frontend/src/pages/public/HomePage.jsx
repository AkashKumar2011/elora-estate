import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  CalendarDays, 
  Building2, 
  KeyRound, 
  CheckCircle2, 
  Home, 
  Compass, 
  PhoneCall,
  SlidersHorizontal
} from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import { listPublicProperties } from '../../api/properties';

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationInput, setLocationInput] = useState('');
  const [bhkSelect, setBhkSelect] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFeatured() {
      try {
        setLoading(true);
        const res = await listPublicProperties({ limit: 6 });
        const list = res?.data?.properties || res?.properties || res?.data || [];
        setFeaturedProperties(Array.isArray(list) ? list.slice(0, 6) : []);
      } catch (err) {
        console.error('Failed to load featured inventory:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (locationInput.trim()) params.set('location', locationInput.trim());
    if (bhkSelect) params.set('bhk', bhkSelect);
    navigate(`/properties?${params.toString()}`);
  };

  const mumbaiLocations = [
    { name: 'Worli', tag: 'Sea-facing towers & commercial proximity', query: 'Worli' },
    { name: 'Lower Parel', tag: 'High-rise residential complexes near corporate hubs', query: 'Lower Parel' },
    { name: 'Prabhadevi', tag: 'Central South Mumbai connectivity & quiet lanes', query: 'Prabhadevi' },
    { name: 'Colaba', tag: 'Heritage architecture & South Mumbai lifestyle', query: 'Colaba' },
    { name: 'Bandra West', tag: 'Vibrant residential culture & coastal access', query: 'Bandra' },
    { name: 'Mahalaxmi', tag: 'Racecourse views & modern luxury developments', query: 'Mahalaxmi' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      {/* SECTION 1: HERO & SEARCH-FIRST DISCOVERY */}
      <section className="relative bg-[#12171A] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-[#2A3138]">
        {/* Subtle Architectural Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#B8860B_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-[#B8860B]/40 bg-[#B8860B]/10 text-[#B8860B] text-xs font-mono tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>South Mumbai & Prime Micro-Market Rentals</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
            Find the right Mumbai rental. <br className="hidden sm:inline" />
            <span className="text-[#B8860B] italic font-normal">Without the property search chaos.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-[#A6A49C] text-sm sm:text-base leading-relaxed">
            Curated homes, direct broker coordination, and organized physical visits. Structured around how Mumbai residents actually find homes.
          </p>

          {/* Structured Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto bg-[#FFFFFF] rounded-sm p-2 sm:p-3 shadow-2xl border border-[#D6D4CC] grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-left"
          >
            <div className="sm:col-span-6 flex items-center gap-2.5 px-3 py-2 bg-[#FBFBF9] rounded-sm border border-[#E4E3DD]">
              <MapPin className="w-4 h-4 text-[#B8860B] shrink-0" />
              <input
                type="text"
                placeholder="Neighborhood (e.g. Worli, Lower Parel, Bandra)..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-[#12171A] placeholder:text-[#8A8880] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3 px-3 py-2 bg-[#FBFBF9] rounded-sm border border-[#E4E3DD]">
              <select
                value={bhkSelect}
                onChange={(e) => setBhkSelect(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-[#12171A] focus:outline-none"
              >
                <option value="">All BHKs</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#B34728] hover:bg-[#94381C] text-white text-xs font-mono font-semibold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Homes</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* SECTION 2: RENTAL CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#12171A]">Residential Formats</h2>
            <p className="text-xs font-mono text-[#7A7870] mt-1">Configured for individuals, families, and shared living</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Entire Apartments', desc: '1 to 4+ BHK private homes', query: 'type=Flat' },
            { title: 'Executive PG', desc: 'Managed accommodations with services', query: 'type=PG' },
            { title: 'Single Occupancy', desc: 'Dedicated private rooms in prime clusters', query: 'type=Single' },
            { title: 'Shared Occupancy', desc: 'Cost-effective shared residential units', query: 'type=Shared' },
          ].map((cat) => (
            <Link
              key={cat.title}
              to={`/properties?${cat.query}`}
              className="p-5 bg-[#FFFFFF] rounded-sm border border-[#E4E3DD] hover:border-[#B8860B] hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <h3 className="font-serif font-bold text-base text-[#12171A] group-hover:text-[#B34728] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-[#5C5A52] mt-1 leading-relaxed">{cat.desc}</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-mono font-semibold text-[#B8860B]">
                <span>Browse inventory</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 3: CURATED PROPERTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#12171A]">Featured Mumbai Homes</h2>
            <p className="text-xs font-mono text-[#7A7870] mt-1">Available for physical visit scheduling</p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#B34728] hover:text-[#94381C]"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-[#FFFFFF] rounded-sm border border-[#E4E3DD] p-4 space-y-3 animate-pulse">
                <div className="aspect-[16/10] bg-[#E4E3DD] rounded-sm" />
                <div className="h-4 bg-[#E4E3DD] rounded w-1/3" />
                <div className="h-4 bg-[#E4E3DD] rounded w-2/3" />
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
          <div className="text-center py-16 bg-[#FFFFFF] rounded-sm border border-[#E4E3DD] p-8">
            <Building2 className="w-10 h-10 text-[#8A8880] mx-auto mb-3" />
            <h3 className="font-serif text-base font-bold text-[#12171A]">No active listings available</h3>
            <p className="text-xs text-[#7A7870] mt-1">Check back shortly or explore by micro-market location.</p>
          </div>
        )}
      </section>

      {/* SECTION 4: POPULAR MUMBAI LOCATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#12171A]">Micro-Market Focus</h2>
          <p className="text-xs font-mono text-[#7A7870] mt-1">Direct broker coordination across prime Mumbai neighborhoods</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mumbaiLocations.map((loc) => (
            <Link
              key={loc.name}
              to={`/properties?location=${encodeURIComponent(loc.query)}`}
              className="p-5 bg-[#FFFFFF] rounded-sm border border-[#E4E3DD] hover:border-[#B8860B] hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif font-bold text-lg text-[#12171A] group-hover:text-[#B34728] transition-colors">
                  {loc.name}
                </h3>
                <MapPin className="w-4 h-4 text-[#B8860B]" />
              </div>
              <p className="text-xs text-[#5C5A52] leading-relaxed">{loc.tag}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS */}
      <section className="bg-[#F3F2EE] py-16 px-4 sm:px-6 lg:px-8 border-y border-[#E4E3DD]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#12171A]">The EloraEstate Process</h2>
            <p className="text-xs font-mono text-[#7A7870] mt-1">Structured from initial discovery to lease decision</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Search & Filter', desc: 'Browse curated listings with explicit rent and deposit transparency.' },
              { step: '02', title: 'Shortlist', desc: 'Save matching properties to your private client lineup.' },
              { step: '03', title: 'Schedule Visit', desc: 'Pick suitable physical viewing slots coordinated directly with managing brokers.' },
              { step: '04', title: 'Lease Execution', desc: 'Clear terms and streamlined documentation assistance.' },
            ].map((st) => (
              <div key={st.step} className="bg-[#FFFFFF] p-6 rounded-sm border border-[#E4E3DD] relative">
                <span className="font-mono text-2xl font-bold text-[#B8860B]/40 block mb-2">{st.step}</span>
                <h3 className="font-serif font-bold text-base text-[#12171A] mb-1.5">{st.title}</h3>
                <p className="text-xs text-[#5C5A52] leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: LANDLORD / OWNER CONVERSION CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#12171A] rounded-sm p-8 sm:p-12 text-white border border-[#B8860B]/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#B8860B] font-semibold">
              Property Owners & Landlords
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              List your Mumbai residential property with dedicated broker coordination.
            </h2>
            <p className="text-xs sm:text-sm text-[#A6A49C] leading-relaxed">
              Connect with verified tenants and manage viewing schedules through our structured property operations workflow.
            </p>
          </div>
          <Link
            to="/login"
            className="px-6 py-3.5 bg-[#B34728] hover:bg-[#94381C] text-white text-xs font-mono font-semibold uppercase tracking-wider rounded-sm transition-colors shrink-0 shadow-lg"
          >
            Access Owner Portal
          </Link>
        </div>
      </section>
    </div>
  );
}