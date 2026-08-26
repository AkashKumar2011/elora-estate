import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, CalendarDays, CheckCircle2, Compass, Heart, Home, MapPin, UsersRound } from 'lucide-react';

const services = [
  ['Residential Rentals', 'Curated rental options across Mumbai residential pockets.', Home],
  ['Flats for Sale / Resale', 'Available residential flats and resale opportunities.', Building2],
  ['Property Discovery', 'Search by location, budget, BHK and property type.', Compass],
  ['Shortlisting', 'Keep suitable options organized in one place.', Heart],
  ['Visit Coordination', 'Plan visits with clearer broker coordination.', CalendarDays],
  ['Broker Support', 'Human support for property questions and next steps.', UsersRound],
  ['Owner/Caretaker Coordination', 'Support availability and visit planning.', CheckCircle2],
  ['Clear Property Information', 'Useful public details before scheduling visits.', MapPin],
];

export default function AboutPage() {
  return (
    <div className="bg-[#F7F3EC]">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#C55F26]">About EloraEstate</p>
          <h1 className="font-display text-5xl font-black leading-tight text-stone-950">Built for how Mumbai property search actually works.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600">EloraEstate helps bring property discovery, shortlisting and visit coordination into one clearer flow.</p>
          <div className="mt-7 flex gap-3"><Link to="/properties" className="rounded-md bg-[#C55F26] px-5 py-3 text-sm font-bold text-white">Start Your Search</Link><Link to="/contact" className="rounded-md border border-stone-300 px-5 py-3 text-sm font-bold text-stone-900">Contact</Link></div>
        </div>
        <img src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85" alt="Mumbai residential apartment" className="h-full min-h-[420px] rounded-2xl object-cover shadow-xl" />
      </section>

      <section className="bg-[#EEE8DF] py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.7fr_1fr] lg:px-8">
          <h2 className="font-display text-3xl font-bold">Why EloraEstate exists</h2>
          <p className="text-lg leading-9 text-stone-700">Mumbai property search becomes messy when listings, calls, WhatsApp messages, photos, shortlists and visits all happen separately. EloraEstate was created to make that journey more organized — from discovery to visit coordination.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center"><h2 className="font-display text-3xl font-bold">What EloraEstate helps with</h2><p className="mt-2 text-stone-600">Practical support for renters, buyers, owners, caretakers and brokers.</p></div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{services.map(([title, copy, Icon]) => <div key={title} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"><Icon className="h-5 w-5 text-[#C55F26]" /><h3 className="mt-4 font-bold text-stone-950">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-600">{copy}</p></div>)}</div>
      </section>

      <section className="bg-[#111111] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div><h2 className="font-display text-4xl font-bold">Our principled approach to your next home.</h2><div className="mt-8 grid gap-5 sm:grid-cols-2">{['Clear information','Mumbai locality focus','Human assistance','Organized shortlists','Practical visits','Zero confusion'].map((v, i) => <div key={v} className="flex gap-3"><span className="text-[#D8A95A]">0{i+1}</span><p className="text-stone-300">{v}</p></div>)}</div></div>
          <blockquote className="rounded-2xl border border-white/10 bg-white/5 p-8 font-display text-2xl italic leading-10 text-stone-200">Real estate in Mumbai is not about finding a listing. It is about finding your place in the city.</blockquote>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-3xl font-bold">Who EloraEstate serves</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-5">{['Tenants','Buyers','Owners','Caretakers','Brokers'].map((role) => <div key={role} className="rounded-xl border border-stone-200 bg-white p-5 text-center font-semibold shadow-sm">{role}</div>)}</div>
      </section>

      <section className="bg-[#FFFDF8] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between gap-6"><div><h2 className="font-display text-3xl font-bold">Mumbai focus</h2><p className="mt-2 text-stone-600">Worli, Lower Parel, Prabhadevi, Dadar, Mahalaxmi, Byculla, Colaba, Cuffe Parade, Churchgate, Marine Drive and Malabar Hill.</p></div><Link to="/properties" className="hidden rounded-md bg-[#C55F26] px-5 py-3 text-sm font-bold text-white sm:inline-flex">View Properties</Link></div></div>
      </section>
    </div>
  );
}
