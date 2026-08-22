import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, IndianRupee, Share2, Heart, Calendar, Check, Compass, Sparkles } from 'lucide-react';

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
      className={`group bg-[#FFFFFF] rounded-sm border border-[#E4E3DD] hover:border-[#B8860B]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between overflow-hidden ${className}`}
    >
      <div>
        {/* Visual Container */}
        <div className="relative aspect-[16/10] bg-[#F3F2EE] overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={title || 'Property thumbnail'}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            /* Tasteful Architectural Fallback */
            <div className="w-full h-full flex flex-col items-center justify-center text-[#8A8880] p-6 text-center bg-gradient-to-b from-[#F3F2EE] to-[#E9E8E2]">
              <div className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#D6D4CC] flex items-center justify-center mb-2 text-[#B8860B]">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-serif text-sm font-semibold text-[#12171A]">EloraEstate Curated</span>
              <span className="text-[11px] font-mono text-[#7A7870] mt-0.5">Photographs on physical visit</span>
            </div>
          )}

          {/* Type & BHK Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="bg-[#12171A]/90 backdrop-blur-md text-[#B8860B] font-mono text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-sm">
              {type || 'Rental'}
            </span>
            {bhk && (
              <span className="bg-[#FFFFFF]/95 backdrop-blur-md text-[#12171A] font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm">
                {bhk} BHK
              </span>
            )}
          </div>

          {/* Action Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShareClick}
              className="p-1.5 rounded-sm bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#3B3A36] hover:text-[#B34728] shadow-sm transition-colors"
              title="Share listing link"
              aria-label="Share property"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            {onAddToCart && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToCart(property);
                }}
                className={`p-1.5 rounded-sm shadow-sm transition-colors ${
                  isShortlisted 
                    ? 'bg-[#B34728] text-white' 
                    : 'bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#3B3A36] hover:text-[#B34728]'
                }`}
                title="Shortlist property"
                aria-label="Shortlist property"
              >
                <Heart className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {/* Price Header */}
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <div className="flex items-baseline text-[#12171A] font-mono text-xl font-bold tracking-tight">
              <IndianRupee className="w-4 h-4 inline stroke-[2.5]" />
              <span>{displayPrice ? Number(displayPrice).toLocaleString('en-IN') : 'Contact Desk'}</span>
              <span className="text-xs font-normal text-[#7A7870] ml-1">/ mo</span>
            </div>
            {deposit && (
              <span className="text-[11px] text-[#7A7870] font-mono">
                Dep: ₹{Number(deposit).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Title & Micro-Location */}
          <h3 className="font-serif text-base font-bold text-[#12171A] line-clamp-1 group-hover:text-[#B34728] transition-colors">
            {title || `${bhk ? `${bhk} BHK ` : ''}${type || 'Residence'}`}
          </h3>

          <p className="text-xs text-[#5C5A52] flex items-center gap-1.5 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
            <span>{location ? `${location}, ${city}` : city}</span>
          </p>

          {/* Quick Specifications */}
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#F3F2EE] text-[11px] font-mono text-[#5C5A52]">
            {furnishing && (
              <span className="bg-[#F3F2EE] px-2 py-0.5 rounded-sm text-[#3B3A36]">
                {furnishing}
              </span>
            )}
            {availabilityStatus && (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded-sm">
                {availabilityStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Conversion Actions */}
      <div className="px-4 sm:px-5 pb-4 pt-2 flex items-center gap-2">
        <Link
          to={`/properties/${propId}`}
          className="flex-1 text-center py-2 text-xs font-mono font-semibold uppercase tracking-wider rounded-sm bg-[#F3F2EE] hover:bg-[#E4E3DD] text-[#12171A] transition-colors"
        >
          View Details
        </Link>
        {onScheduleVisit && (
          <button
            type="button"
            onClick={() => onScheduleVisit(property)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-mono font-semibold uppercase tracking-wider rounded-sm bg-[#12171A] hover:bg-[#B34728] text-white transition-colors shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-[#B8860B]" />
            <span>Visit</span>
          </button>
        )}
      </div>
    </div>
  );
}