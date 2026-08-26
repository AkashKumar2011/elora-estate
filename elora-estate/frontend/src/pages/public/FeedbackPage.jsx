import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ShieldCheck } from 'lucide-react';

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="bg-[#F7F3EC]">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#C55F26]">Community</p>
          <h1 className="font-display text-6xl font-black leading-tight text-stone-950">Help us improve <span className="italic text-[#C55F26]">EloraEstate</span></h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600">Your insights help us refine the property search journey for everyone in Mumbai. Share a suggestion, report an issue, or tell us about your experience.</p>
        </div>
        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=85" alt="EloraEstate feedback" className="h-full min-h-[340px] rounded-2xl object-cover shadow-xl" />
      </section>

      <section className="bg-[#EEE8DF] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
            {submitted ? <div className="py-12 text-center"><MessageSquare className="mx-auto h-10 w-10 text-[#C55F26]" /><h2 className="mt-4 font-display text-3xl font-bold">Thank you.</h2><p className="mt-2 text-stone-600">Your feedback has been received.</p><button onClick={() => setSubmitted(false)} className="mt-6 text-sm font-bold text-[#C55F26]">Send another response</button></div> : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <h2 className="text-center font-display text-3xl font-bold">Share Your Thoughts</h2>
                <p className="mt-2 text-center text-sm text-stone-600">Share feedback, a property requirement, or a question about renting or buying in Mumbai.</p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2"><input required placeholder="Full Name" className="h-11 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm" /><input required placeholder="Email or Mobile" className="h-11 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm" /></div>
                <select className="mt-4 h-11 w-full rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm">{['Website Feedback','Property Requirement','Rent Enquiry','Buy Enquiry','Owner Enquiry','Broker/Caretaker Enquiry','Report an Issue','General Question'].map((o)=><option key={o}>{o}</option>)}</select>
                <textarea required rows={6} placeholder="How can we help you today?" className="mt-4 w-full rounded-md border border-stone-200 bg-[#F7F3EC] p-3 text-sm" />
                <button className="mt-5 w-full rounded-md bg-[#C55F26] px-5 py-3 text-sm font-bold text-white">Submit Feedback</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
        <div className="rounded-2xl border border-[#C55F26]/30 bg-white p-8"><ShieldCheck className="h-6 w-6 text-[#C55F26]" /><h2 className="mt-4 font-display text-2xl font-bold">Our Commitment</h2><p className="mt-3 leading-7 text-stone-600">We review submissions to improve property discovery, listings and visit coordination. Your contact details are not shared without consent.</p></div>
        <div className="flex flex-col justify-center text-center md:text-left"><h2 className="font-display text-4xl font-bold">Ready to find your next Mumbai home?</h2><div className="mt-6 flex justify-center gap-3 md:justify-start"><Link to="/" className="rounded-md border border-stone-300 px-5 py-3 text-sm font-bold">Back to Home</Link><Link to="/properties" className="rounded-md bg-[#C55F26] px-5 py-3 text-sm font-bold text-white">Explore Properties</Link></div></div>
      </section>
    </div>
  );
}
