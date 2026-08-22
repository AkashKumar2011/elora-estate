import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  IndianRupee,
  Calendar,
  Heart,
  Share2,
  ArrowLeft,
  ShieldCheck,
  Check,
  CheckCircle2,
  Compass
} from 'lucide-react';
import { getPublicProperty } from '../../api/properties';
import { useAuth } from '../../context/AuthContext';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      try {
        setLoading(true);
        const res = await getPublicProperty(id);
        const data = res?.data?.property || res?.property || res?.data;
        setProperty(data);
      } catch (err) {
        console.error('Failed to load property details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProperty();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScheduleVisit = () => {
    if (!user) {
      navigate(`/login?redirect=/properties/${id}`);
    } else {
      navigate(`/dashboard/schedule-visit?propertyId=${id}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-[#E4E3DD] rounded w-1/4" />
        <div className="aspect-[16/9] max-h-[480px] bg-[#E4E3DD] rounded-sm" />
        <div className="h-8 bg-[#E4E3DD] rounded w-1/2" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-md mx-auto my-20 text-center bg-[#FFFFFF] p-8 rounded-sm border border-[#E4E3DD]">
        <h2 className="font-serif text-lg font-bold text-[#12171A]">Property Listing Not Found</h2>
        <p className="text-xs text-[#7A7870] mt-1 mb-4">This listing may have been leased or moved to private archive.</p>
        <Link to="/properties" className="text-xs font-mono font-semibold text-[#B34728] hover:underline">
          Return to all listings
        </Link>
      </div>
    );
  }

  const {
    title,
    location,
    city = 'Mumbai',
    price,
    rent,
    deposit,
    bhk,
    type,
    furnishing,
    description,
    amenities = [],
    photos = [],
    images = [],
    availabilityStatus,
  } = property;

  const displayPhotos = (photos && photos.length > 0) ? photos : images;
  const displayPrice = price || rent;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <Link
        to="/properties"
        className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#5C5A52] hover:text-[#12171A] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to listings</span>
      </Link>

      {/* Visual Showcase / Gallery */}
      <div className="space-y-3">
        <div className="relative aspect-[16/9] max-h-[480px] bg-[#12171A] rounded-sm overflow-hidden border border-[#E4E3DD]">
          {displayPhotos.length > 0 ? (
            <img
              src={displayPhotos[activeImageIndex]}
              alt={title || 'Property perspective'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#8A8880]">
              <Compass className="w-8 h-8 text-[#B8860B] mb-2" />
              <span className="font-serif text-base font-semibold text-[#FFFFFF]">EloraEstate Curated Listing</span>
              <span className="text-xs font-mono text-[#A6A49C] mt-1">Photographs presented on direct physical viewing</span>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {displayPhotos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {displayPhotos.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-24 h-16 rounded-sm overflow-hidden shrink-0 border-2 transition-all ${
                  activeImageIndex === idx ? 'border-[#B8860B] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Structural Layout: Left Details, Right Action Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#12171A] text-[#B8860B] text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-sm font-semibold">
                {type || 'Residential'}
              </span>
              {bhk && (
                <span className="bg-[#F3F2EE] text-[#12171A] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-sm">
                  {bhk} BHK
                </span>
              )}
              {availabilityStatus && (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono px-2.5 py-0.5 rounded-sm">
                  {availabilityStatus}
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#12171A]">{title}</h1>
            <p className="text-sm text-[#5C5A52] flex items-center gap-1.5 mt-1.5">
              <MapPin className="w-4 h-4 text-[#B8860B]" />
              <span>{location ? `${location}, ${city}` : city}</span>
            </p>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#FFFFFF] rounded-sm border border-[#E4E3DD] text-xs font-mono">
            <div>
              <span className="text-[#7A7870] block">Configuration</span>
              <span className="font-semibold text-[#12171A]">{bhk ? `${bhk} BHK` : 'Studio'}</span>
            </div>
            <div>
              <span className="text-[#7A7870] block">Furnishing State</span>
              <span className="font-semibold text-[#12171A]">{furnishing || 'Not Specified'}</span>
            </div>
            <div>
              <span className="text-[#7A7870] block">Micro-Market</span>
              <span className="font-semibold text-[#12171A]">{location || 'Mumbai'}</span>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-[#12171A]">Overview</h2>
              <p className="text-xs sm:text-sm text-[#5C5A52] leading-relaxed whitespace-pre-line bg-[#FFFFFF] p-4 rounded-sm border border-[#E4E3DD]">
                {description}
              </p>
            </div>
          )}

          {/* Amenities Grid */}
          {amenities && amenities.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-serif text-lg font-bold text-[#12171A]">Features & Highlights</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {amenities.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[#3B3A36] bg-[#FFFFFF] p-2.5 rounded-sm border border-[#E4E3DD]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing Desk & Visit Action */}
        <div>
          <div className="sticky top-24 bg-[#FFFFFF] p-6 rounded-sm border border-[#E4E3DD] shadow-sm space-y-6">
            <div>
              <span className="text-[11px] text-[#7A7870] font-mono uppercase tracking-wider block">Monthly Rental</span>
              <div className="flex items-baseline text-[#12171A] font-mono text-3xl font-bold mt-1">
                <IndianRupee className="w-6 h-6 inline stroke-[2.5]" />
                <span>{displayPrice ? Number(displayPrice).toLocaleString('en-IN') : 'Contact Desk'}</span>
                <span className="text-xs font-normal text-[#7A7870] ml-1.5">/ month</span>
              </div>
              {deposit && (
                <div className="text-xs text-[#7A7870] font-mono mt-1">
                  Security Deposit: ₹{Number(deposit).toLocaleString('en-IN')}
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleScheduleVisit}
                className="w-full py-3 bg-[#B34728] hover:bg-[#94381C] text-white font-mono text-xs uppercase tracking-wider font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule a Physical Visit</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="w-full py-2.5 bg-[#F3F2EE] hover:bg-[#E4E3DD] text-[#12171A] font-mono text-xs uppercase tracking-wider font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Link Copied' : 'Share Property'}</span>
              </button>
            </div>

            <div className="pt-4 border-t border-[#E4E3DD] flex items-start gap-2.5 text-xs text-[#7A7870]">
              <ShieldCheck className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
              <span>Direct visit scheduling connects you with the dedicated managing broker for this listing.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}