import React, { useState } from 'react';
import { MessageSquare, Star, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    experienceType: 'tenant_search',
    rating: 5,
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Preserves frontend state and simulates graceful submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* Header */}
      <section className="bg-[#12171A] text-white pt-14 pb-18 px-4 sm:px-6 lg:px-8 border-b border-[#2A3138]">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-[#B8860B]/40 bg-[#B8860B]/10 text-[#B8860B] text-xs font-mono tracking-wider uppercase">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Platform Experience</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Client & Partner Feedback
          </h1>

          <p className="text-xs sm:text-sm text-[#A6A49C] leading-relaxed">
            Your feedback directly guides how we refine property discovery, visit scheduling, and broker coordination.
          </p>
        </div>
      </section>

      {/* Form Container */}
      <section className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-sm border border-[#E4E3DD] shadow-sm">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#12171A]">Thank You for Your Feedback</h3>
              <p className="text-xs text-[#5C5A52] max-w-sm mx-auto">
                We review every client submission to ensure our Mumbai rental discovery and visit operations remain seamless.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', experienceType: 'tenant_search', rating: 5, message: '' });
                }}
                className="mt-4 px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#B34728] hover:underline"
              >
                Submit another response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase text-[#5C5A52] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Anand Mehta"
                  className="w-full text-xs p-2.5 bg-[#FBFBF9] border border-[#E4E3DD] rounded-sm focus:border-[#B34728] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase text-[#5C5A52] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="anand@example.com"
                  className="w-full text-xs p-2.5 bg-[#FBFBF9] border border-[#E4E3DD] rounded-sm focus:border-[#B34728] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase text-[#5C5A52] mb-1">
                  Interaction Context
                </label>
                <select
                  value={formData.experienceType}
                  onChange={(e) => setFormData({ ...formData, experienceType: e.target.value })}
                  className="w-full text-xs p-2.5 bg-[#FBFBF9] border border-[#E4E3DD] rounded-sm focus:border-[#B34728] focus:outline-none"
                >
                  <option value="tenant_search">Tenant Property Search</option>
                  <option value="visit_scheduling">Physical Visit Coordination</option>
                  <option value="owner_listing">Property Owner Listing</option>
                  <option value="broker_portal">Broker Collaboration</option>
                  <option value="general">General Platform Experience</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase text-[#5C5A52] mb-1">
                  Overall Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`p-2 rounded-sm border transition-all text-xs font-mono font-bold ${
                        formData.rating >= star
                          ? 'border-[#B8860B] bg-[#B8860B]/10 text-[#B8860B]'
                          : 'border-[#E4E3DD] bg-[#FBFBF9] text-[#7A7870]'
                      }`}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase text-[#5C5A52] mb-1">
                  Your Observations & Comments
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share details about what worked smoothly or where we can improve..."
                  className="w-full text-xs p-2.5 bg-[#FBFBF9] border border-[#E4E3DD] rounded-sm focus:border-[#B34728] focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#12171A] hover:bg-[#B34728] text-white text-xs font-mono font-semibold uppercase tracking-wider rounded-sm flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>{loading ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}