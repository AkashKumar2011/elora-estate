import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="bg-[#F7F3EC]">
      <section className="relative bg-white py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C55F26]">Connect with us</p>
        <h1 className="mt-4 font-display text-5xl font-black text-stone-950">Talk to EloraEstate</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-stone-600">Looking to rent, buy, sell or list a property in Mumbai? Share your requirement and our team will help you with the next step.</p>
      </section>
      <section className="mx-auto -mt-4 grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        {[[Phone,'Call','Phone number'],[MessageCircle,'WhatsApp','WhatsApp'],[Mail,'Email','Email'],[MapPin,'Location','Mumbai, Maharashtra']].map(([Icon,t,c]) => <div key={t} className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"><Icon className="h-6 w-6 text-[#C55F26]" /><h3 className="mt-4 font-bold">{t}</h3><p className="mt-2 text-sm text-stone-600">{c}</p></div>)}
      </section>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div><h2 className="font-display text-3xl font-bold">Send an Enquiry</h2><p className="mt-3 leading-7 text-stone-600">Share location, budget, BHK, move-in timeline or property details so EloraEstate can guide the next step clearly.</p></div>
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2"><input required placeholder="Name" className="h-11 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm" /><input required placeholder="Mobile Number" className="h-11 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm" /><input placeholder="Email optional" className="h-11 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm" /><select className="h-11 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm"><option>Rent a home</option><option>Buy a flat</option><option>List property for rent</option><option>Sell property</option><option>General enquiry</option></select><input placeholder="Preferred location" className="h-11 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm" /><input placeholder="Budget" className="h-11 rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm" /></div>
          <textarea rows={5} placeholder="Message" className="mt-4 w-full rounded-md border border-stone-200 bg-[#F7F3EC] p-3 text-sm" />
          <button className="mt-4 rounded-md bg-[#C55F26] px-5 py-3 text-sm font-bold text-white">Send Enquiry</button>{sent && <span className="ml-3 text-sm text-emerald-700">Enquiry received.</span>}
        </form>
      </section>
      <section className="bg-[#EEE8DF] py-16 text-center"><h2 className="font-display text-3xl font-bold">Ready to start your Mumbai property journey?</h2><div className="mt-6 flex justify-center gap-3"><Link to="/properties" className="rounded-md bg-[#C55F26] px-5 py-3 text-sm font-bold text-white">View Properties</Link><a href="#top" className="rounded-md border border-stone-300 px-5 py-3 text-sm font-bold">Send Enquiry</a></div></section>
    </div>
  );
}
