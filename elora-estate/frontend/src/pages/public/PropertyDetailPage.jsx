import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  IndianRupee,
  Bed,
  CheckCircle2,
  Calendar,
  Heart,
  Share2,
  ArrowLeft,
  ShieldCheck,
  Check,
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
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="aspect-[16/9] max-h-[450px] bg-slate-200 rounded" />
        <div className="h-8 bg-slate-200 rounded w-1/2" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded border border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Property Listing Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">The property listing may have been rented or removed.</p>
        <Link to="/properties" className="text-xs font-semibold text-amber-700 hover:underline">
          Return to all properties
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
      {/* Back Navigation */}
      <Link
        to="/properties"
        className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to listings</span>
      </Link>

      {/* Gallery Section */}
      <div className="space-y-3">
        <div className="relative aspect-[16/9] max-h-[480px] bg-slate-900 rounded overflow-hidden">
          {displayPhotos.length > 0 ? (
            <img
              src={displayPhotos[activeImageIndex]}
              alt={title || 'Property view'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <span className="font-serif text-lg font-medium text-slate-300">EloraEstate Verified Listing</span>
              <span className="text-xs text-slate-400 mt-1">Photographs available during broker physical visit</span>
            </div>
          )}
        </div>

        {/* Thumbnail Selector */}
        {displayPhotos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {displayPhotos.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 h-14 rounded overflow-hidden shrink-0 border-2 transition-all ${
                  activeImageIndex === idx ? 'border-amber-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-slate-900 text-amber-400 text-xs font-mono uppercase px-2.5 py-0.5 rounded font-semibold">
                {type || 'Rental Property'}
              </span>
              {bhk && (
                <span className="bg-amber-100 text-amber-900 text-xs font-mono font-semibold px-2 py-0.5 rounded">
                  {bhk} BHK
                </span>
              )}
              {availabilityStatus && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-mono px-2 py-0.5 rounded">
                  {availabilityStatus}
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-1.5">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>{location ? `${location}, ${city}` : city}</span>
            </p>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Configuration</span>
              <span className="font-semibold text-slate-800">{bhk ? `${bhk} BHK` : 'Studio / 1 RK'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Furnishing</span>
              <span className="font-semibold text-slate-800">{furnishing || 'Not Specified'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Location</span>
              <span className="font-semibold text-slate-800">{location || 'Mumbai'}</span>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-slate-900">Property Overview</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{description}</p>
            </div>
          )}

          {/* Amenities */}
          {amenities && amenities.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-serif text-lg font-bold text-slate-900">Features & Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {amenities.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Action Card */}
        <div>
          <div className="sticky top-24 bg-white p-6 rounded border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-xs text-slate-500 font-mono block">Monthly Rent</span>
              <div className="flex items-baseline text-slate-900 font-mono text-2xl font-bold mt-1">
                <IndianRupee className="w-5 h-5 inline stroke-[2.5]" />
                <span>{displayPrice ? Number(displayPrice).toLocaleString('en-IN') : 'Contact'}</span>
                <span className="text-xs text-slate-500 font-normal ml-1">/ mo</span>
              </div>
              {deposit && (
                <div className="text-xs text-slate-500 font-mono mt-1">
                  Security Deposit: ₹{Number(deposit).toLocaleString('en-IN')}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleScheduleVisit}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-xs rounded flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule a Physical Visit</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Link Copied' : 'Share Property'}</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Direct visit scheduling connects you with the dedicated managing broker for this listing.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}