import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, IndianRupee, Share2, Heart, Calendar, Check } from 'lucide-react';

export default function PropertyCard({
  property,
  onScheduleVisit,
  onAddToCart,
  isShortlisted = false,
  onShare,
  className = '',
}) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!property) return null;

  const {
    _id,
    id,
    title,
    location,
    city = 'Mumbai',
    price,
    rent,
    deposit,
    bhk,
    type,
    furnishing,
    photos = [],
    images = [],
    availabilityStatus,
  } = property;

  const propId = _id || id;
  const displayPrice = price || rent;
  const imageSrc = !imgError && (photos?.[0] || images?.[0]);

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(property);
    } else {
      const shareUrl = `${window.location.origin}/properties/${propId}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`group bg-white rounded-md border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${className}`}
    >
      {/* Property Thumbnail & Overlay Badges */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title || 'Property thumbnail'}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 p-4 text-center">
            <span className="font-serif text-sm font-medium text-slate-500">EloraEstate Curated</span>
            <span className="text-xs text-slate-400">Photo verification in progress</span>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="bg-slate-950/80 backdrop-blur text-amber-300 font-mono text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded">
            {type || 'Rental'}
          </span>
          {bhk && (
            <span className="bg-white/95 text-slate-800 font-mono text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm">
              {bhk} BHK
            </span>
          )}
        </div>

        {/* Quick Action Overlay (Shortlist / Share) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleShareClick}
            className="p-1.5 rounded-full bg-white/90 text-slate-700 hover:text-amber-700 shadow-sm transition-colors"
            title="Share property link"
            aria-label="Share property"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
          {onAddToCart && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart(property);
              }}
              className={`p-1.5 rounded-full shadow-sm transition-colors ${
                isShortlisted ? 'bg-rose-50 text-rose-600' : 'bg-white/90 text-slate-700 hover:text-rose-600'
              }`}
              title="Shortlist property"
              aria-label="Shortlist property"
            >
              <Heart className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <div className="flex items-center text-amber-800 font-mono text-lg font-bold">
              <IndianRupee className="w-4 h-4 inline stroke-[2.5]" />
              <span>{displayPrice ? Number(displayPrice).toLocaleString('en-IN') : 'Contact'}</span>
              <span className="text-xs font-normal text-slate-500 ml-1">/ month</span>
            </div>
            {deposit && (
              <span className="text-[11px] text-slate-500 font-mono">
                Dep: ₹{Number(deposit).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 mb-1 group-hover:text-amber-800 transition-colors">
            {title || `${bhk ? `${bhk} BHK ` : ''}${type || 'Apartment'}`}
          </h3>

          <p className="text-xs text-slate-600 flex items-center gap-1 line-clamp-1 mb-3">
            <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
            <span>{location ? `${location}, ${city}` : city}</span>
          </p>

          {/* Characteristic Chips */}
          <div className="flex flex-wrap gap-1.5 py-2 border-t border-slate-100 text-[11px] text-slate-600 font-mono">
            {furnishing && (
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                {furnishing}
              </span>
            )}
            {availabilityStatus && (
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                {availabilityStatus}
              </span>
            )}
          </div>
        </div>

        {/* Primary Card CTAs */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <Link
            to={`/properties/${propId}`}
            className="flex-1 text-center py-2 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          >
            View Details
          </Link>
          {onScheduleVisit && (
            <button
              type="button"
              onClick={() => onScheduleVisit(property)}
              className="flex-1 inline-flex items-center justify-center gap-1 py-2 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-800 text-amber-400 transition-colors shadow-sm"
            >
              <Calendar className="w-3 h-3" />
              <span>Visit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}