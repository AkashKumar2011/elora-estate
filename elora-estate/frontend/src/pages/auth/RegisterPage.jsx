import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { registerUser } from '../../api/authApi';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'client', // Default to client
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setLoading(true);
      await registerUser(formData);
      navigate('/login?registered=true');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join EloraEstate to shortlist listings and coordinate property visits"
    >
      {errorMsg && (
        <div className="mb-5 p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Rahul Sharma"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:border-amber-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="rahul@example.com"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:border-amber-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-700 mb-1">Mobile Number</label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="98200XXXXX"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:border-amber-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:border-amber-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-700 mb-1">Account Purpose</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-amber-600 focus:outline-none bg-white"
          >
            <option value="client">Renting a Property (Tenant / Client)</option>
            <option value="owner">Listing a Property (Property Owner)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-xs rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-amber-800 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}