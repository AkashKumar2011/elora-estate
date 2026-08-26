import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Bath, BedDouble, Building2, CalendarDays, Car, Check, Heart, Home, MapPin, Maximize2, Share2, ShieldCheck, Sofa, Zap } from 'lucide-react';
import { getPublicProperty, listPublicProperties } from '../../api/properties';
import { useAuth } from '../../context/AuthContext';
import PropertyCard, { formatPrice } from '../../components/PropertyCard';

const fallbackImages = [
  'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
];

function normalizeImages(property) {
  const photos = property?.photos || property?.images || [];
  if (Array.isArray(photos) && photos.length) return photos.map((p) => p?.url || p).filter(Boolean);
  return fallbackImages;
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getPublicProperty(id);
        const data = res?.data?.property || res?.property || res?.data;
        setProperty(data);
        const sim = await listPublicProperties({ limit: 3, location: data?.location || data?.locality });
        const list = sim?.data?.properties || sim?.properties || sim?.data || [];
        setSimilar(Array.isArray(list) ? list.filter((p) => (p._id || p.id) !== id).slice(0, 3) : []);
      } catch (err) {
        console.error('Failed to load property detail', err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const images = useMemo(() => normalizeImages(property), [property]);
  const purpose = String(property?.purpose || property?.listingType || property?.transactionType || '').toLowerCase().includes('sale') ? 'sale' : 'rent';
  const title = property?.title || `${property?.bhk || 3} BHK ${property?.type || property?.propertyType || 'Apartment'} in ${property?.locality || property?.location || 'Mumbai'}`;
  const locality = property?.locality || property?.location || property?.area || 'Mumbai';

  const scheduleVisit = () => navigate(user ? `/dashboard?propertyId=${id}` : `/login?redirect=/properties/${id}`);
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-12"><div className="h-[520px] animate-pulse rounded-2xl bg-white" /></div>;
  if (!property) return <div className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="font-display text-3xl font-bold">Property not available</h1><p className="mt-2 text-stone-600">This listing may have moved or is no longer public.</p><Link to="/properties" className="mt-6 inline-flex rounded-md bg-[#C55F26] px-5 py-3 text-sm font-bold text-white">View Properties</Link></div>;

  const facts = [
    ['BHK Type', `${property?.bhk || 3} BHK`, BedDouble],
    ['Property Type', property?.type || property?.propertyType || 'Apartment', Home],
    ['Area', property?.carpetArea || property?.area || property?.builtUpArea || '1,850 sq.ft.', Maximize2],
    ['Furnishing', property?.furnishing || property?.furnishingStatus || 'Semi-Furnished', Sofa],
    ['Availability', property?.availability || property?.availabilityStatus || 'Immediate', CalendarDays],
    ['Parking', property?.parking || 'As available', Car],
  ];
  const amenities = property?.amenities?.length ? property.amenities : ['Lift', 'Security', 'Parking', 'Power Backup', 'Balcony', 'Pet Friendly'];

  return (
    <div className="bg-[#F7F3EC]">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="relative aspect-[16/10]">
              <img src={images[active]} alt={title} className="h-full w-full object-cover" />
              <span className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white">{active + 1} / {images.length} Photos</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {images.slice(0, 4).map((img, idx) => <button key={img} onClick={() => setActive(idx)} className={`overflow-hidden rounded-lg border ${idx === active ? 'border-[#C55F26]' : 'border-stone-200'}`}><img src={img} alt="Property thumbnail" className="h-24 w-full object-cover" /></button>)}
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold text-stone-950">{title}</h1>
              <p className="mt-2 flex items-center gap-2 text-stone-600"><MapPin className="h-4 w-4 text-[#C55F26]" /> {locality}, Mumbai</p>
              <p className="mt-4 max-w-3xl text-stone-700">{property?.description || 'Public property information with broker-assisted visit scheduling and clear next-step coordination.'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={share} className="grid h-11 w-11 place-items-center rounded-full border border-stone-200 bg-white text-stone-800"><Share2 className="h-5 w-5" /></button>
              <button className="grid h-11 w-11 place-items-center rounded-full border border-stone-200 bg-white text-stone-800"><Heart className="h-5 w-5" /></button>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold">Overview</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {facts.map(([label, value, Icon]) => <div key={label} className="rounded-lg border border-stone-200 bg-white p-4"><Icon className="h-5 w-5 text-[#C55F26]" /><div className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">{label}</div><div className="mt-1 font-semibold text-stone-950">{value}</div></div>)}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold">Amenities</h2>
            <div className="mt-5 flex flex-wrap gap-3">{amenities.map((a) => <span key={a} className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"><Check className="h-4 w-4 text-[#C55F26]" /> {a}</span>)}</div>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold">Description</h2>
            <p className="mt-4 max-w-3xl leading-8 text-stone-700">{property?.description || 'A Mumbai residential property presented with public-safe details. Schedule a visit to review the home in person and coordinate the next step with broker support.'}</p>
          </section>

          <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-bold">Location</h2>
            <p className="mt-3 text-stone-700"><strong>Locality:</strong> {locality}, Mumbai</p>
            <p className="mt-2 text-sm text-stone-600">Exact address will be shared during visit coordination.</p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <span className="rounded-full bg-[#F2E8DB] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#C55F26]">{purpose === 'sale' ? 'For Sale' : 'For Rent'}</span>
            <div className="mt-4 font-display text-4xl font-bold text-stone-950">{formatPrice(property)}</div>
            {purpose === 'rent' && <p className="mt-1 text-sm text-stone-500">Security deposit shared during visit coordination</p>}
            <div className="my-6 border-t border-stone-200" />
            <button onClick={scheduleVisit} className="w-full rounded-md bg-[#C55F26] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#A94719]">Schedule Visit</button>
            <button onClick={() => navigate('/contact')} className="mt-3 w-full rounded-md bg-stone-950 px-5 py-3 text-sm font-bold text-white hover:bg-stone-800">Contact Broker</button>
            <div className="mt-5 rounded-lg bg-[#F7F3EC] p-4 text-sm text-stone-700"><ShieldCheck className="mb-2 h-5 w-5 text-[#C55F26]" /> Broker-assisted visit coordination. Private owner details are protected.</div>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold">Similar homes in Mumbai</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {(similar.length ? similar : [{ title: '2 BHK in Lower Parel', purpose: 'rent', price: 95000, location: 'Lower Parel', bhk: 2 }, { title: '3 BHK in Prabhadevi', purpose: 'sale', price: 47000000, location: 'Prabhadevi', bhk: 3 }, { title: '3 BHK in Dadar', purpose: 'rent', price: 140000, location: 'Dadar', bhk: 3 }]).map((p, i) => <PropertyCard key={p._id || p.id || i} property={p} compact />)}
        </div>
      </section>
    </div>
  );
}
