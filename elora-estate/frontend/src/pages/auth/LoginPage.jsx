import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, Lock, ArrowRight, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || null;
  const navigate = useNavigate();
  const { login, sendOtp, verifyOtp } = useAuth();

  // Mode: 'credentials' | 'otp-request' | 'otp-verify'
  const [authMode, setAuthMode] = useState('credentials');
  const [identifier, setIdentifier] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRedirect = (role) => {
    if (redirectUrl) {
      navigate(redirectUrl);
      return;
    }
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'broker':
        navigate('/broker');
        break;
      case 'owner':
        navigate('/owner');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier || !password) {
      setErrorMsg('Please provide both your account identifier and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login({ identifier, password });
      const userRole = res?.user?.role || 'client';
      handleRedirect(userRole);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier) {
      setErrorMsg('Please enter your registered phone number or email.');
      return;
    }

    try {
      setLoading(true);
      if (sendOtp) {
        await sendOtp({ identifier });
      }
      setAuthMode('otp-verify');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to dispatch one-time passcode.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otpCode || otpCode.length < 4) {
      setErrorMsg('Please enter a valid verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp({ identifier, otp: otpCode });
      const userRole = res?.user?.role || 'client';
      handleRedirect(userRole);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={authMode === 'otp-verify' ? 'Enter Passcode' : 'Sign in to EloraEstate'}
      subtitle={
        authMode === 'otp-verify'
          ? `Code dispatched to ${identifier}`
          : 'Access your shortlists, visits, and direct broker channels'
      }
    >
      {errorMsg && (
        <div className="mb-5 p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Mode 1: Credentials Login */}
      {authMode === 'credentials' && (
        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
              Email or Mobile Number
            </label>
            <div className="relative">
              <input
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or 98XXXXXXXX"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:border-amber-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono font-medium text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-mono text-amber-700 hover:text-amber-800"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:border-amber-600 focus:outline-none"
              />
            </div>
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
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-mono">
              <span className="bg-white px-2 text-slate-400">Or alternate method</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAuthMode('otp-request')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono text-xs font-medium rounded border border-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-amber-700" />
            <span>Sign in via One-Time Passcode (OTP)</span>
          </button>
        </form>
      )}

      {/* Mode 2: Request OTP */}
      {authMode === 'otp-request' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
              Registered Phone or Email
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 98200XXXXX"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:border-amber-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-xs rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send OTP Code</span>}
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('credentials')}
            className="w-full text-center text-xs font-mono text-slate-600 hover:text-slate-900 pt-1"
          >
            Return to Password Sign In
          </button>
        </form>
      )}

      {/* Mode 3: Verify OTP */}
      {authMode === 'otp-verify' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              autoFocus
              required
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="6-digit code"
              className="w-full px-3 py-2 text-center text-lg tracking-widest font-mono border border-slate-200 rounded focus:border-amber-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-xs rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify & Continue</span>}
          </button>

          <div className="flex justify-between items-center text-xs font-mono pt-2">
            <button
              type="button"
              onClick={handleSendOtp}
              className="text-amber-700 hover:underline"
            >
              Resend Code
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('credentials')}
              className="text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Register Link Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-600">
          Looking for a new rental account?{' '}
          <Link to="/register" className="font-semibold text-amber-800 hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}