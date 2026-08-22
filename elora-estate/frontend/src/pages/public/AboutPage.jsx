import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Compass, 
  ShieldCheck, 
  CalendarDays, 
  KeyRound, 
  MapPin, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      title: 'Scattered Search Solved',
      desc: 'Mumbai rentals are notorious for splintering across multiple WhatsApp chats, random phone calls, and redundant listings. We consolidate the entire discovery-to-visit workflow under one clear platform.',
      icon: Compass,
    },
    {
      title: 'Direct Broker Coordination',
      desc: 'We connect prospective tenants directly to the authorized managing broker for each listing. No multi-tier intermediation or unverified third-party calls.',
      icon: KeyRound,
    },
    {
      title: 'Transparent Terms Upfront',
      desc: 'Monthly rent, security deposit terms, furnishing state, and availability timelines are clearly stated before you ever take time out to visit.',
      icon: ShieldCheck,
    },
    {
      title: 'Structured Site Viewings',
      desc: 'Book single visits or organize batch neighborhood lineups directly through your portal without endless coordination friction.',
      icon: CalendarDays,
    },
  ];

  const microMarkets = [
    'Worli & Lower Parel (High-Rise Corridors)',
    'Prabhadevi & Dadar (Central Coastal Belt)',
    'Colaba, Cuffe Parade & Churchgate (Heritage South)',
    'Mahalaxmi & Byculla (Emerging Luxury Clusters)',
    'Bandra West & Khar (Prime Western Suburbs)',
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Editorial Hero */}
      <section className="relative bg-[#12171A] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#2A3138]">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-[#B8860B]/40 bg-[#B8860B]/10 text-[#B8860B] text-xs font-mono tracking-wider uppercase">
            <Building2 className="w-3.5 h-3.5" />
            <span>The EloraEstate Standard</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Built for how Mumbai actually <br className="hidden sm:inline" />
            <span className="text-[#B8860B] italic font-normal">searches for residential homes.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-[#A6A49C] text-sm sm:text-base leading-relaxed">
            EloraEstate was created around a simple reality: finding a home in Mumbai is exciting, but navigating scattered broker networks and fragmented listings shouldn’t be chaotic.
          </p>
        </div>
      </section>

      {/* Narrative & Focus */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#B8860B] font-semibold">
              Our Positioning
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#12171A]">
              Curated Discovery Meets Structured Coordination.
            </h2>
            <p className="text-xs font-mono text-[#7A7870]">
              Focusing on South Mumbai and prime micro-markets.
            </p>
          </div>

          <div className="md:col-span-7 space-y-4 text-xs sm:text-sm text-[#5C5A52] leading-relaxed">
            <p>
              Traditional real estate portals are built as noisy advertisement boards where stale inventory competes for attention. EloraEstate operates differently: as a dedicated residential discovery and visit coordination layer.
            </p>
            <p>
              Whether you are an executive relocating near Mumbai’s central business districts or a family seeking an established neighborhood in South Mumbai, our focus is giving you verified property parameters, predictable schedules, and respectful broker communication.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#12171A]">Core Platform Commitments</h2>
          <p className="text-xs font-mono text-[#7A7870] mt-1">Practical value engineered into every step of your search</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="bg-[#FFFFFF] p-6 rounded-sm border border-[#E4E3DD] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-sm bg-[#F3F2EE] border border-[#E4E3DD] text-[#B8860B] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#12171A] mb-2">{v.title}</h3>
                  <p className="text-xs text-[#5C5A52] leading-relaxed">{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Micro-Markets Covered */}
      <section className="bg-[#F3F2EE] py-14 px-4 sm:px-6 lg:px-8 border-y border-[#E4E3DD]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl font-bold text-[#12171A]">Active Micro-Markets</h2>
            <p className="text-xs font-mono text-[#7A7870] mt-1">Core coverage across Greater Mumbai and South Mumbai</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {microMarkets.map((market, idx) => (
              <div
                key={idx}
                className="bg-[#FFFFFF] p-3.5 rounded-sm border border-[#E4E3DD] flex items-center gap-2.5 text-xs text-[#3B3A36]"
              >
                <MapPin className="w-4 h-4 text-[#B8860B] shrink-0" />
                <span className="font-medium">{market}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#12171A] rounded-sm p-8 sm:p-10 text-white border border-[#B8860B]/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2">
            <h3 className="font-serif text-xl sm:text-2xl font-bold">Ready to discover your next home?</h3>
            <p className="text-xs text-[#A6A49C]">Explore curated rental properties or get in touch with our desk.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/properties"
              className="px-5 py-2.5 bg-[#B34728] hover:bg-[#94381C] text-white text-xs font-mono font-semibold uppercase tracking-wider rounded-sm transition-colors"
            >
              Browse Listings
            </Link>
            <Link
              to="/contact"
              className="px-5 py-2.5 bg-[#F3F2EE] hover:bg-[#E4E3DD] text-[#12171A] text-xs font-mono font-semibold uppercase tracking-wider rounded-sm transition-colors"
            >
              Contact Desk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}