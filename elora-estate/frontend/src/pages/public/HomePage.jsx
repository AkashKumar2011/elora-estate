import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, CalendarDays, CheckCircle2, ChevronDown, ClipboardList, Heart, Home, MapPin, MessageSquare, Search, ShieldCheck, SlidersHorizontal, UserRound } from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import { listPublicProperties } from '../../api/properties';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1800&q=85';
const localities = [
  ['Worli', 'High-rise homes and strong city connectivity.'],
  ['Lower Parel', 'Modern residential towers near business districts.'],
  ['Prabhadevi', 'Well-connected pockets between Worli and Dadar.'],
  ['Dadar', 'Central access with established residential neighbourhoods.'],
  ['Mahalaxmi', 'Prime towers and South Mumbai connectivity.'],
  ['Byculla', 'Evolving residential pockets with city access.'],
  ['Colaba', 'Classic South Mumbai living and heritage streets.'],
  ['Cuffe Parade', 'Premium residential towers near the sea.'],
  ['Churchgate', 'Central business access and old Mumbai charm.'],
  ['Marine Drive', 'Iconic sea-facing residential neighbourhood.'],
  ['Malabar Hill', 'Quiet premium residential enclaves.'],
];



const clarityGoals = [
  ['What', 'Mumbai homes for rent and flats for sale, with public property discovery built around real search actions.'],
  ['Why', 'Because Mumbai property search gets scattered across portals, WhatsApp, broker calls, photos and visit planning.'],
  ['How', 'Search by location, budget, BHK and type, then shortlist, schedule visits and continue with broker support.'],
  ['Where', 'Focused on Mumbai residential micro-markets including Worli, Lower Parel, Prabhadevi, Dadar and South Mumbai.'],
];
function SelectBox({ label, children, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">{label}</span>
      <select value={value} onChange={onChange} className="h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-[#C55F26] focus:ring-2 focus:ring-[#C55F26]/20">
        {children}
      </select>
    </label>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState('rent');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [bhk, setBhk] = useState('');
  const [type, setType] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await listPublicProperties({ limit: 6, purpose });
        const list = res?.data?.properties || res?.properties || res?.data || [];
        setFeatured(Array.isArray(list) ? list.slice(0, 6) : []);
      } catch (err) {
        console.error('Failed to load home properties', err);
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [purpose]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('purpose', purpose);
    if (location) params.set('location', location);
    if (budget) params.set('maxPrice', budget);
    if (bhk) params.set('bhk', bhk);
    if (type) params.set('type', type);
    navigate(`/properties?${params.toString()}`);
  };

  const faqs = [
    ['How do I schedule a property visit?', 'Open a property, choose Schedule Visit, and share your preferred timing. EloraEstate will help coordinate the next step.'],
    ['Can I search both rental and sale flats?', 'Yes. Use the Rent and Buy tabs to switch between rental homes and flats for sale.'],
    ['Do I need to login to shortlist properties?', 'You may be asked to login so your shortlist and visit requests can be saved properly.'],
    ['How does Agent Login work?', 'Agent Login is for brokers, owners and caretakers. Admin can approve access and assign permissions later.'],
    ['How can owners add properties?', 'Owners or caretakers can login and, after approval, manage property details, availability and visits.'],
    ['What if I cannot find a suitable home?', 'Use Tell Us What You Need or the feedback form to share your requirement.'],
  ];

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[640px] bg-stone-950 text-white">
        <img src={HERO_IMAGE} alt="Premium Mumbai apartment interior" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
        <div className="relative mx-auto flex max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:min-h-[640px] lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#F4C36A] backdrop-blur">Mumbai Homes</p>
            <h1 className="font-display text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              Rent or buy homes in Mumbai — with a clearer search journey.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-stone-200 sm:text-lg">
              Explore rental homes and flats for sale, shortlist suitable options, and schedule visits with broker support.
            </p>
          </div>

          <form onSubmit={handleSearch} className="mt-8 max-w-5xl rounded-xl bg-white p-3 shadow-2xl ring-1 ring-black/5 sm:p-4">
            <div className="mb-3 inline-flex rounded-full bg-stone-100 p-1 text-sm font-semibold text-stone-600">
              {['rent', 'buy'].map((tab) => (
                <button key={tab} type="button" onClick={() => setPurpose(tab)} className={`rounded-full px-5 py-2 capitalize transition ${purpose === tab ? 'bg-[#C55F26] text-white shadow-sm' : 'hover:text-stone-950'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-5">
              <label className="md:col-span-1">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Location</span>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Worli" className="h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-800 outline-none focus:border-[#C55F26] focus:ring-2 focus:ring-[#C55F26]/20" />
              </label>
              <SelectBox label="Budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option value="">Any</option>
                <option value="75000">Up to ₹75k</option>
                <option value="150000">Up to ₹1.5L</option>
                <option value="300000">Up to ₹3L</option>
                <option value="50000000">Up to ₹5Cr</option>
              </SelectBox>
              <SelectBox label="BHK" value={bhk} onChange={(e) => setBhk(e.target.value)}>
                <option value="">Any</option><option value="1">1 BHK</option><option value="2">2 BHK</option><option value="3">3 BHK</option><option value="4">4+ BHK</option>
              </SelectBox>
              <SelectBox label="Property Type" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Any</option><option value="Flat">Flat</option><option value="PG">PG</option><option value="Single">Single Occupancy</option><option value="Shared">Shared Occupancy</option>
              </SelectBox>
              <button type="submit" className="h-11 self-end rounded-md bg-stone-950 px-5 text-sm font-bold text-white transition hover:bg-[#C55F26]">
                <span className="inline-flex items-center justify-center gap-2"><Search className="h-4 w-4" /> Search Homes</span>
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-500">
              <Link to="/feedback" className="font-semibold text-[#C55F26] hover:underline">Tell Us What You Need</Link>
              <span>Search by location, budget, BHK and property type.</span>
            </div>
          </form>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-[#FDFBF7] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#C55F26]">EloraEstate at a glance</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-stone-950">What, why, how and where — clear from the start.</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-stone-600">The website should quickly explain the business goal: discover Mumbai homes, reduce search confusion, and move from shortlist to visit with clarity.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {clarityGoals.map(([label, copy]) => (
              <div key={label} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                <span className="inline-flex rounded-full bg-[#F2E8DB] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#A94719]">{label}</span>
                <p className="mt-4 text-sm leading-6 text-stone-700">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-stone-950">Fresh homes in Mumbai</h2>
            <div className="mt-3 flex gap-2 text-xs font-bold uppercase tracking-wide">
              {['rent', 'buy'].map((tab) => (
                <button key={tab} onClick={() => setPurpose(tab)} className={`${purpose === tab ? 'text-[#C55F26]' : 'text-stone-400'} hover:text-[#C55F26]`}>{tab === 'rent' ? 'For Rent' : 'For Sale'}</button>
              ))}
            </div>
          </div>
          <Link to="/properties" className="hidden text-sm font-semibold text-[#C55F26] hover:underline sm:block">Explore all listings</Link>
        </div>
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">{[1,2,3].map((i)=><div key={i} className="h-96 animate-pulse rounded-xl bg-white shadow-sm" />)}</div>
        ) : featured.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{featured.slice(0,3).map((p)=><PropertyCard key={p._id || p.id} property={p} />)}</div>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
            <Building2 className="mx-auto h-10 w-10 text-[#C55F26]" />
            <h3 className="mt-4 font-display text-2xl font-bold">No properties available right now.</h3>
            <p className="mt-2 text-stone-600">Share your requirement and we’ll help you find suitable options.</p>
            <Link to="/feedback" className="mt-5 inline-flex rounded-md bg-[#C55F26] px-5 py-3 text-sm font-bold text-white">Tell Us What You Need</Link>
          </div>
        )}
      </section>

      <section className="bg-[#EEE8DF] py-10">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            [Home, 'Rent a Home', 'Browse rental flats, PGs, single occupancy and shared options across Mumbai.', 'Browse Rentals', '/properties?purpose=rent'],
            [Building2, 'Buy a Flat', 'Explore available residential flats and resale options in Mumbai.', 'Browse Sale Properties', '/properties?purpose=buy'],
            [UserRound, 'Owner/Caretaker Access', 'Login to manage property details, availability and visits after approval.', 'Owner/Caretaker Login', '/login?mode=agent'],
          ].map(([Icon, title, copy, cta, href]) => (
            <Link key={title} to={href} className="group rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <Icon className="h-6 w-6 text-[#C55F26]" />
              <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{copy}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#C55F26]">{cta}<ArrowRight className="h-3.5 w-3.5" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold">Explore Mumbai by locality</h2>
          <p className="mt-2 text-sm text-stone-600">Start with the neighbourhoods that matter most to your search.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {localities.map(([name, desc]) => (
            <Link key={name} to={`/properties?location=${encodeURIComponent(name)}`} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition hover:border-[#C55F26] hover:shadow-md">
              <h3 className="font-display text-lg font-bold">{name}</h3>
              <p className="mt-1 min-h-[44px] text-sm leading-6 text-stone-600">{desc}</p>
              <span className="mt-3 inline-block text-xs font-bold uppercase tracking-wide text-[#C55F26]">View Properties</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#0E1728] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <div>
            <h2 className="font-display text-4xl font-bold">A property search designed for clarity.</h2>
            <p className="mt-3 max-w-2xl text-stone-300">Designed for how Mumbai property search actually works — across listings, calls, visits, owners, caretakers and broker coordination.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {[
                [CheckCircle2, 'Clear Property Details', 'Useful public information before you schedule a visit.'],
                [Heart, 'Organized Shortlists', 'Save options and return to them with less confusion.'],
                [CalendarDays, 'Broker-assisted Visits', 'Schedule visits with a clearer coordination path.'],
                [SlidersHorizontal, 'Requirement-based Matching', 'Search by location, budget, BHK and type.'],
                [ClipboardList, 'Owner/Caretaker Coordination', 'Keep availability and visit planning organized.'],
                [MapPin, 'Mumbai-focused Discovery', 'Built around Mumbai residential micro-markets.'],
              ].map(([Icon, title, copy]) => (
                <div key={title} className="flex gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#C55F26]/15 text-[#F4C36A]"><Icon className="h-5 w-5" /></div>
                  <div><h3 className="font-bold text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-stone-400">{copy}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3 shadow-2xl">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80" alt="EloraEstate broker support" className="h-full min-h-[360px] w-full rounded-xl object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-3xl font-bold">The EloraEstate journey</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            ['For tenants / buyers', ['Search or share requirement', 'Shortlist suitable homes', 'Schedule visits', 'Move ahead with broker support']],
            ['For owners / caretakers', ['Login as Owner/Caretaker', 'Add or manage property', 'Coordinate visits', 'Track availability']],
          ].map(([title, steps]) => (
            <div key={title} className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="font-display text-xl font-bold">{title}</h3>
              <ol className="mt-5 space-y-4">
                {steps.map((step, idx) => (
                  <li key={step} className="flex gap-3 text-sm text-stone-700"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#C55F26] text-xs font-bold text-white">{idx + 1}</span>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold">Common Questions</h2>
          <div className="mt-8 space-y-3">
            {faqs.map(([q, a], idx) => (
              <div key={q} className="overflow-hidden rounded-lg border border-stone-200 bg-[#FDFBF7]">
                <button type="button" onClick={() => setFaqOpen(faqOpen === idx ? -1 : idx)} className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-stone-900">
                  {q}<ChevronDown className={`h-4 w-4 transition ${faqOpen === idx ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === idx && <p className="border-t border-stone-200 px-5 py-4 text-sm leading-6 text-stone-600">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <h2 className="font-display text-3xl font-bold">Help us improve EloraEstate</h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">Share feedback, a property requirement, or a question about renting or buying in Mumbai.</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-stone-600 shadow-sm"><MessageSquare className="h-4 w-4 text-[#C55F26]" /> feedback@eloraestate.com</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setFeedbackSent(true); }} className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <input required placeholder="Name" className="h-11 rounded-md border border-stone-200 bg-[#FDFBF7] px-3 text-sm outline-none focus:border-[#C55F26]" />
            <input required placeholder="Mobile / Email" className="h-11 rounded-md border border-stone-200 bg-[#FDFBF7] px-3 text-sm outline-none focus:border-[#C55F26]" />
          </div>
          <select className="mt-4 h-11 w-full rounded-md border border-stone-200 bg-[#FDFBF7] px-3 text-sm outline-none focus:border-[#C55F26]">
            {['Website Feedback','Property Requirement','Rent Enquiry','Buy Enquiry','Owner Enquiry','Broker/Caretaker Enquiry','Report an Issue','General Question'].map((o)=><option key={o}>{o}</option>)}
          </select>
          <textarea required rows={5} placeholder="Your message" className="mt-4 w-full rounded-md border border-stone-200 bg-[#FDFBF7] p-3 text-sm outline-none focus:border-[#C55F26]" />
          <button className="mt-4 rounded-md bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-[#C55F26]">Send Feedback</button>
          {feedbackSent && <span className="ml-4 text-sm font-semibold text-emerald-700">Thank you. Your feedback has been received.</span>}
        </form>
      </section>

      <section className="bg-[#C71919] px-4 py-14 text-center text-white">
        <h2 className="font-display text-4xl font-bold">Ready to find your next home in Mumbai?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/85">Start with a search, shortlist suitable options, or tell EloraEstate what you need.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/properties" className="rounded-md bg-white px-6 py-3 text-sm font-bold text-stone-950">Search Homes</Link>
          <Link to="/contact" className="rounded-md border border-white px-6 py-3 text-sm font-bold text-white">Contact EloraEstate</Link>
        </div>
      </section>
    </div>
  );
}
