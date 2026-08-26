import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Heart, Share2, MapPin, Home, Maximize2, Check, Sofa } from 'lucide-react';

const fallbackImages = [
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
];

function getImage(property) {
  const photos = property?.photos || property?.images || [];
  if (Array.isArray(photos) && photos.length) return photos[0]?.url || photos[0];
  return fallbackImages[Math.abs(String(property?._id || property?.id || property?.title || '').length) % fallbackImages.length];
}

function getId(property) {
  return property?._id || property?.id || property?.slug || 'demo-property';
}

function getPurpose(property) {
  const raw = String(property?.purpose || property?.listingType || property?.transactionType || property?.category || '').toLowerCase();
  if (raw.includes('sale') || raw.includes('buy')) return 'sale';
  return 'rent';
}

export function formatPrice(property) {
  const purpose = getPurpose(property);
  const price = property?.rent || property?.price || property?.monthlyRent || property?.expectedRent || property?.salePrice;
  if (!price) return purpose === 'sale' ? 'Price on request' : 'Rent on request';
  const n = Number(price);
  if (Number.isNaN(n)) return String(price);
  if (purpose === 'sale') {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(n % 10000000 ? 1 : 0)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)} L`;
    return `₹${n.toLocaleString('en-IN')}`;
  }
  return `₹${n.toLocaleString('en-IN')}/mo`;
}

export default function PropertyCard({ property = {}, onScheduleVisit, onAddToCart, isShortlisted = false, compact = false }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const id = getId(property);
  const purpose = getPurpose(property);
  const title = property?.title || `${property?.bhk || 3} BHK ${property?.type || property?.propertyType || 'Apartment'}`;
  const locality = property?.locality || property?.location || property?.area || 'Mumbai';
  const city = property?.city || 'Mumbai';
  const bhk = property?.bhk || property?.bedrooms || '3';
  const type = property?.type || property?.propertyType || 'Apartment';
  const furnishing = property?.furnishing || property?.furnishingStatus || 'Semi-Furnished';
  const area = property?.carpetArea || property?.area || property?.builtUpArea || '1,850 sq.ft.';
  const availability = property?.availabilityStatus || property?.availability || (purpose === 'rent' ? 'Immediate' : 'Ready to move');

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const url = `${window.location.origin}${import.meta.env.BASE_URL || '/'}properties/${id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleSchedule = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onScheduleVisit) onScheduleVisit(property);
    else navigate(`/login?redirect=/properties/${id}`);
  };

  return (
    <article className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/properties/${id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          <img
            src={getImage(property)}
            alt={`${title} in ${locality}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
          <div className="absolute left-3 top-3 rounded-sm bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#C55F26] shadow-sm">
            {purpose === 'sale' ? 'For Sale' : 'For Rent'}
          </div>
          <div className="absolute bottom-3 left-3 rounded-md bg-black/65 px-3 py-2 text-white backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-[0.18em] text-stone-300">{purpose === 'sale' ? 'Market Price' : 'Monthly Rent'}</div>
            <div className="font-display text-xl font-bold">{formatPrice(property)}</div>
          </div>
          <div className="absolute right-3 top-3 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onAddToCart) onAddToCart(property);
              }}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-stone-900 shadow-sm transition hover:text-[#C55F26]"
              aria-label="Shortlist property"
            >
              <Heart className={`h-4 w-4 ${isShortlisted ? 'fill-current text-[#C55F26]' : ''}`} />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-bold leading-snug text-stone-950 group-hover:text-[#C55F26]">{title}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-600">
                <MapPin className="h-4 w-4 text-[#C55F26]" />
                {locality}{city && !String(locality).includes(city) ? `, ${city}` : ''}
              </p>
            </div>
            <button type="button" onClick={handleShare} className="mt-1 text-[#C55F26]" aria-label="Share property">
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 divide-x divide-stone-200 border-y border-stone-200 py-3 text-center text-xs text-stone-600">
            <div className="px-2">
              <Home className="mx-auto mb-1 h-4 w-4 text-[#C55F26]" />
              <span className="font-semibold text-stone-900">{bhk} BHK</span>
            </div>
            <div className="px-2">
              <Sofa className="mx-auto mb-1 h-4 w-4 text-[#C55F26]" />
              <span className="font-semibold text-stone-900">{furnishing}</span>
            </div>
            <div className="px-2">
              <Maximize2 className="mx-auto mb-1 h-4 w-4 text-[#C55F26]" />
              <span className="font-semibold text-stone-900">{area}</span>
            </div>
          </div>

          {!compact && (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">
              {property?.description || `${type} in ${locality} with ${availability} availability and broker-assisted visit scheduling.`}
            </p>
          )}
        </div>
      </Link>

      <div className="flex gap-2 px-4 pb-4 sm:px-5">
        <Link to={`/properties/${id}`} className="flex-1 rounded-md bg-stone-950 px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#C55F26]">
          View Details
        </Link>
        <button type="button" onClick={handleSchedule} className="flex-1 rounded-md border border-[#C55F26] px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-[#C55F26] transition hover:bg-[#C55F26] hover:text-white">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Schedule Visit</span>
        </button>
      </div>
    </article>
  );
}
