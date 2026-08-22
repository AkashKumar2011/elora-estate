import React from 'react';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Send
} from 'lucide-react';

export default function ContactPage() {
  const contactTouchpoints = [
    {
      title: 'Direct Client Desk',
      description: 'Speak directly with our rental coordination desk for inquiries, visit timings, or requirements.',
      actionText: '+91 (Mumbai Desk)',
      href: 'tel:+919820000000',
      icon: Phone,
      badge: 'Immediate Voice',
    },
    {
      title: 'WhatsApp Fast Track',
      description: 'Send quick criteria or request scheduling links via our authorized messaging channel.',
      actionText: 'Open WhatsApp Chat',
      href: 'https://wa.me/919820000000?text=Hi%20EloraEstate%2C%20I%20am%20looking%20for%20a%20rental%20in%20Mumbai.',
      icon: MessageSquare,
      badge: 'Fast Response',
    },
    {
      title: 'Email Correspondence',
      description: 'Submit detailed property mandates, corporate relocation queries, or owner listing briefs.',
      actionText: 'contact@eloraestate.com',
      href: 'mailto:contact@eloraestate.com',
      icon: Mail,
      badge: 'Official Desk',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      {/* Header */}
      <section className="bg-[#12171A] text-white pt-14 pb-18 px-4 sm:px-6 lg:px-8 border-b border-[#2A3138]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-[#B8860B]/40 bg-[#B8860B]/10 text-[#B8860B] text-xs font-mono tracking-wider uppercase">
            <Phone className="w-3.5 h-3.5" />
            <span>Direct Coordination</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Connect with EloraEstate.
          </h1>

          <p className="max-w-xl mx-auto text-[#A6A49C] text-xs sm:text-sm leading-relaxed">
            Direct communication channels for prospective tenants, landlords, and authorized brokers across Mumbai.
          </p>
        </div>
      </section>

      {/* Main Touchpoint Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactTouchpoints.map((cp) => {
            const Icon = cp.icon;
            return (
              <div
                key={cp.title}
                className="bg-[#FFFFFF] p-6 rounded-sm border border-[#E4E3DD] shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-sm bg-[#F3F2EE] border border-[#E4E3DD] text-[#B8860B] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#B34728] font-semibold bg-[#B34728]/10 px-2 py-0.5 rounded-sm">
                      {cp.badge}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#12171A]">{cp.title}</h3>
                  <p className="text-xs text-[#5C5A52] leading-relaxed">{cp.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F3F2EE]">
                  <a
                    href={cp.href}
                    target={cp.href.startsWith('http') ? '_blank' : undefined}
                    rel={cp.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#B34728] hover:text-[#94381C] transition-colors"
                  >
                    <span>{cp.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Operational Information */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F3F2EE] p-6 sm:p-8 rounded-sm border border-[#E4E3DD] grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-semibold text-[#12171A] uppercase tracking-wider block mb-1">
                Desk Hours
              </span>
              <p className="text-[#5C5A52] leading-relaxed">
                Monday to Saturday<br />
                09:30 AM – 07:30 PM IST
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-semibold text-[#12171A] uppercase tracking-wider block mb-1">
                Regional Hub
              </span>
              <p className="text-[#5C5A52] leading-relaxed">
                South Mumbai & Western Corridors<br />
                Mumbai, Maharashtra, India
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-semibold text-[#12171A] uppercase tracking-wider block mb-1">
                Direct Protocols
              </span>
              <p className="text-[#5C5A52] leading-relaxed">
                All physical property visits are confirmed directly with registered managing brokers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}