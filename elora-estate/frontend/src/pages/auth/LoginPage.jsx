import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Loader2, UserRound, UsersRound } from 'lucide-react';
import logo from '../../assets/eloraestate-logo.png';
import { requestClientOtp, verifyClientOtp, registerInternalUser } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const LOGIN_IMAGE = 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1300&q=85';
const genders = ['Male', 'Female', 'Other'];
const agentRoles = [
  { label: 'Broker / Agent', role: 'broker', helper: 'For brokers managing clients, matches, visits and follow-ups.' },
  { label: 'Owner', role: 'owner_caretaker', helper: 'For owners who want to manage property details and availability.' },
  { label: 'Caretaker', role: 'owner_caretaker', helper: 'For caretakers coordinating property access, availability and visits.' },
];

function PublicHeader() {
  return (
    <header className="border-b border-stone-200 bg-[#FDFBF7]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" aria-label="EloraEstate home">
          <img src={logo} alt="EloraEstate" className="h-9 w-9 object-contain" />
          <span className="font-display text-xl font-bold text-stone-950">EloraEstate</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-stone-700 md:flex">
          <Link to="/" className="hover:text-[#C55F26]">Home</Link>
          <Link to="/properties" className="hover:text-[#C55F26]">Properties</Link>
          <Link to="/about" className="hover:text-[#C55F26]">About</Link>
          <Link to="/contact" className="hover:text-[#C55F26]">Contact</Link>
          <Link to="/login" className="rounded-md bg-[#C55F26] px-5 py-2.5 font-bold text-white shadow-sm hover:bg-[#A94719]">Login</Link>
        </nav>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="bg-[#0E1728] text-stone-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="EloraEstate" className="h-9 w-9 rounded-sm object-contain" />
            <span className="font-display text-xl font-bold text-white">EloraEstate</span>
          </Link>
          <p className="max-w-xs text-sm leading-6 text-stone-400">Mumbai residential rentals and flats for sale, organized around a clearer property search journey.</p>
          <p className="text-xs uppercase tracking-[0.24em] text-[#D8A95A]">Mumbai, Maharashtra</p>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white">Explore</h4>
          <ul className="space-y-3 text-sm text-stone-400">
            <li><Link to="/properties" className="hover:text-white">Properties</Link></li>
            <li><Link to="/properties?purpose=rent" className="hover:text-white">Rent</Link></li>
            <li><Link to="/properties?purpose=buy" className="hover:text-white">Buy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white">Company</h4>
          <ul className="space-y-3 text-sm text-stone-400">
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/feedback" className="hover:text-white">Feedback</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white">Account</h4>
          <ul className="space-y-3 text-sm text-stone-400">
            <li><Link to="/login?mode=user" className="hover:text-white">User Login</Link></li>
            <li><Link to="/login?mode=agent" className="hover:text-white">Agent Login</Link></li>
            <li><Link to="/login?mode=agent" className="hover:text-white">Owner/Caretaker Login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-xs text-stone-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <span>© EloraEstate. All rights reserved.</span>
          <span>Public property details only. Private owner data is protected.</span>
        </div>
      </div>
    </footer>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-stone-900">{label}</span>
      {children}
    </label>
  );
}

function OptionButtons({ label, options, value, onChange }) {
  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-stone-900">{label}</span>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const optionLabel = typeof option === 'string' ? option : option.label;
          const optionValue = typeof option === 'string' ? option : option.label;
          const selected = value === optionValue;
          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-md border px-3 py-3 text-sm font-semibold transition ${selected ? 'border-[#C55F26] bg-[#C55F26] text-white shadow-sm' : 'border-stone-200 bg-[#F7F3EC] text-stone-700 hover:border-[#C55F26]/60 hover:bg-white'}`}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const inputClass = 'h-12 w-full rounded-md border border-stone-200 bg-[#F7F3EC] px-3 text-sm outline-none transition focus:border-[#C55F26] focus:ring-2 focus:ring-[#C55F26]/15';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initial = searchParams.get('mode') === 'agent' ? 'agent' : searchParams.get('mode') === 'user' ? 'user' : 'choice';
  const redirectUrl = searchParams.get('redirect') || null;
  const navigate = useNavigate();
  const { applySession } = useAuth();
  const [screen, setScreen] = useState(initial);
  const [step, setStep] = useState('details');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', gender: '', mobile: '', role: 'broker', agentType: 'Broker / Agent' });
  const [otp, setOtp] = useState('');

  const clearMessages = () => { setError(''); setMessage(''); };

  const redirectAfterLogin = (user) => {
    if (redirectUrl) return navigate(redirectUrl);
    navigate(user?.role === 'admin' ? '/admin/users' : '/dashboard');
  };

  const sendUserOtp = async (e) => {
    e.preventDefault(); clearMessages();
    if (!form.name || !form.gender || !form.mobile) return setError('Please fill name, gender and mobile number.');
    try {
      setLoading(true);
      await requestClientOtp({ name: form.name, gender: form.gender, mobile: form.mobile, phone: form.mobile });
      setStep('otp');
      setMessage('OTP sent. Check your mobile number.');
    } catch (err) { setError(err?.response?.data?.message || 'Could not send OTP. Please try again.'); }
    finally { setLoading(false); }
  };

  const verifyUserOtp = async (e) => {
    e.preventDefault(); setError('');
    if (!otp) return setError('Enter OTP to continue.');
    try {
      setLoading(true);
      const { data } = await verifyClientOtp({ mobile: form.mobile, phone: form.mobile, otp, name: form.name, gender: form.gender });
      applySession(data.accessToken, data.user);
      redirectAfterLogin(data.user);
    } catch (err) { setError(err?.response?.data?.message || 'Invalid or expired OTP.'); }
    finally { setLoading(false); }
  };

  const submitAgent = async (e) => {
    e.preventDefault(); clearMessages();
    if (!form.name || !form.gender || !form.mobile || !form.role || !form.agentType) return setError('Please fill all agent details.');
    try {
      setLoading(true);
      await registerInternalUser({ name: form.name, gender: form.gender, mobile: form.mobile, phone: form.mobile, role: form.role, agentType: form.agentType });
      setMessage('Agent-side request received. Admin will review and assign permissions before dashboard access.');
      setStep('done');
    } catch (err) { setError(err?.response?.data?.message || 'Could not submit agent request. Please try again.'); }
    finally { setLoading(false); }
  };

  const resetTo = (nextScreen) => {
    setScreen(nextScreen);
    setStep('details');
    setOtp('');
    clearMessages();
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-stone-950">
      <PublicHeader />
      {screen === 'choice' ? (
        <main className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <section className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#C55F26]">Simple access</p>
            <h1 className="mt-3 font-display text-4xl font-black leading-tight sm:text-5xl">Continue to <span className="italic text-[#C55F26]">EloraEstate</span></h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600">Access your property search, shortlist, visits or agent-side workspace. Choose one path; the rest stays clear.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-stone-200 bg-white p-4"><span className="text-xs font-bold uppercase tracking-wide text-[#C55F26]">User</span><p className="mt-2 text-sm text-stone-600">Tenants, buyers and clients.</p></div>
              <div className="rounded-xl border border-stone-200 bg-white p-4"><span className="text-xs font-bold uppercase tracking-wide text-[#C55F26]">Agent</span><p className="mt-2 text-sm text-stone-600">Brokers, owners and caretakers.</p></div>
            </div>
            <img src={LOGIN_IMAGE} alt="Mumbai residential access" className="mt-8 h-72 rounded-2xl object-cover shadow-xl" />
          </section>
          <section className="space-y-6 self-center">
            <button onClick={() => resetTo('user')} className="w-full rounded-2xl border border-stone-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <UserRound className="h-10 w-10 rounded-xl bg-[#F2E8DB] p-2 text-[#C55F26]" />
              <h2 className="mt-5 font-display text-3xl font-bold">User Login</h2>
              <p className="mt-3 text-lg leading-8 text-stone-600">For tenants, buyers and clients searching, shortlisting or scheduling visits.</p>
              <span className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[#C55F26] px-5 py-3 font-bold text-white">Continue as User <ArrowRight className="ml-2 h-4 w-4" /></span>
            </button>
            <button onClick={() => resetTo('agent')} className="w-full rounded-2xl border border-stone-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <UsersRound className="h-10 w-10 rounded-xl bg-stone-100 p-2 text-stone-700" />
              <h2 className="mt-5 font-display text-3xl font-bold">Agent Login</h2>
              <p className="mt-3 text-lg leading-8 text-stone-600">For brokers, owners and caretakers working with EloraEstate.</p>
              <span className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-stone-800 px-5 py-3 font-bold text-white">Continue as Agent <ArrowRight className="ml-2 h-4 w-4" /></span>
            </button>
          </section>
        </main>
      ) : (
        <main className="mx-auto grid max-w-6xl gap-0 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
          <section className="relative hidden overflow-hidden rounded-l-2xl lg:block">
            <img src={LOGIN_IMAGE} alt="EloraEstate login" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute bottom-10 left-10 max-w-sm text-white">
              <h2 className="font-display text-4xl font-bold">Continue your Mumbai property journey.</h2>
              <p className="mt-4 text-lg leading-8 text-white/85">Search, shortlist and schedule visits with a clearer EloraEstate account experience.</p>
            </div>
          </section>
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl lg:rounded-l-none sm:p-10">
            <button onClick={() => resetTo('choice')} className="mb-6 text-sm font-bold text-[#C55F26]">← Back to login options</button>
            <h1 className="font-display text-4xl font-bold">{screen === 'user' ? 'User Login' : 'Agent Login'}</h1>
            <p className="mt-2 text-stone-600">{screen === 'user' ? 'Enter your details to continue your property search.' : 'Enter your details and choose how you work with EloraEstate.'}</p>
            {error && <div className="mt-5 flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" /> {error}</div>}
            {message && <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}

            {step === 'done' ? (
              <div className="mt-8 space-y-4">
                <p className="text-sm leading-6 text-stone-600">Your request is submitted. Admin will decide access user-wise using permissions in the admin area.</p>
                <Link to="/" className="inline-flex rounded-md bg-stone-950 px-5 py-3 text-sm font-bold text-white">Return Home</Link>
              </div>
            ) : step === 'otp' ? (
              <form onSubmit={verifyUserOtp} className="mt-8 space-y-5">
                <Field label="OTP"><input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className={`${inputClass} text-center text-xl tracking-[0.35em]`} placeholder="000000" /></Field>
                <button disabled={loading} className="w-full rounded-md bg-[#C55F26] px-5 py-3 font-bold text-white disabled:opacity-60">{loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Verify & Continue'}</button>
                <p className="text-sm text-stone-500">Your shortlist and visit requests will be linked to this mobile number.</p>
              </form>
            ) : (
              <form onSubmit={screen === 'user' ? sendUserOtp : submitAgent} className="mt-8 space-y-5">
                <Field label="Full Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Your full name" /></Field>
                <OptionButtons label="Gender" options={genders} value={form.gender} onChange={(option) => setForm({ ...form, gender: option })} />
                <Field label="Mobile Number"><div className="grid grid-cols-[70px_1fr] gap-2"><span className="grid h-12 place-items-center rounded-md border border-stone-200 bg-[#F7F3EC] text-sm">+91</span><input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className={inputClass} placeholder="98765 43210" /></div></Field>
                {screen === 'agent' && (
                  <div>
                    <OptionButtons
                      label="Choose your work type"
                      options={agentRoles}
                      value={form.agentType}
                      onChange={(option) => setForm({ ...form, agentType: option.label, role: option.role })}
                    />
                    <p className="mt-2 text-xs leading-5 text-stone-500">Role is only a starting profile. Final access is approved person-wise by Admin.</p>
                  </div>
                )}
                <button disabled={loading} className="w-full rounded-md bg-[#C55F26] px-5 py-3 font-bold text-white disabled:opacity-60">{loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : screen === 'user' ? 'Send OTP' : 'Submit for Admin Approval'}</button>
                {screen === 'agent' && <p className="rounded-md bg-[#F7F3EC] p-3 text-sm text-stone-600">Agent-side access may require admin approval. Admin will approve the person and assign permissions using checkboxes later.</p>}
              </form>
            )}
          </section>
        </main>
      )}
      <PublicFooter />
    </div>
  );
}
