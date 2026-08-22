import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Calendar, Key } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 sm:px-6 lg:px-8 font-sans selection:bg-amber-100 selection:text-amber-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-sm bg-slate-950 flex items-center justify-center text-amber-400 font-serif text-2xl font-bold shadow-inner">
            E
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-slate-950 group-hover:text-amber-700 transition-colors">
            Elora<span className="text-amber-600 font-normal">Estate</span>
          </span>
        </Link>
        <h2 className="mt-4 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 font-mono">
            {subtitle}
          </p>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-md border border-slate-200/90 shadow-sm">
          {children}
        </div>

        {/* Security & Assistance Note */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Verified Access
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-amber-600" />
            Encrypted Session
          </span>
        </div>
      </div>
    </div>
  );
}