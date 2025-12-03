
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { createUserProfile, registerDealership, getUserProfile } from '../services/dataService';
import { GUYANA_REGIONS } from '../constants';
import { Building2, UserCircle2, Check, Lock, Mail, ArrowRight, CheckCircle2, Ban } from 'lucide-react';

const sleekInputClass = "w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm placeholder-slate-400 font-medium";
const labelClass = "block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wide";

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuspended, setIsSuspended] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSuspended(false);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      
      // Check User Profile Status
      const profile = await getUserProfile(userCred.user.uid);
      
      if (profile?.status === 'suspended') {
          await signOut(auth);
          setIsSuspended(true);
          setError('Your account has been suspended. Please contact support.');
          return;
      }

      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
           <div className={`h-12 w-12 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg ${isSuspended ? 'bg-red-500 shadow-red-200' : 'bg-blue-600 shadow-blue-200'}`}>
              {isSuspended ? <Ban className="text-white h-6 w-6" /> : <Lock className="text-white h-6 w-6" />}
           </div>
           <h2 className="text-3xl font-extrabold text-slate-900">{isSuspended ? 'Account Suspended' : 'Welcome Back'}</h2>
           <p className="text-slate-500 mt-2">{isSuspended ? 'Access to this account has been restricted' : 'Sign in to access your account'}</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 border border-red-100"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className={labelClass}>Email Address</label>
            <input type="email" required className={sleekInputClass} value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
               <label className="text-xs font-bold uppercase text-slate-500 tracking-wide">Password</label>
               <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-800">Forgot?</a>
            </div>
            <input type="password" required className={sleekInputClass} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-blue-700 text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group">
            Sign In <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-600 font-medium">
          Don't have an account? <Link to="/register" className="text-blue-700 font-bold hover:underline">Create one now</Link>
        </p>
      </div>
    </div>
  );
};

export const Register: React.FC = () => {
  const [role, setRole] = useState<'user' | 'dealer'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Dealer specific state
  const [bizName, setBizName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState(GUYANA_REGIONS[3]);
  const [address, setAddress] = useState('');
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      
      // 1. Create User Profile
      await createUserProfile(uid, { email, role: role, favorites: [] });
      
      // 2. If Dealer, create Dealership Profile
      if (role === 'dealer') {
        await registerDealership({
          uid,
          businessName: bizName,
          region,
          contactPhone: phone,
          whatsapp: phone,
          address,
          logoUrl: '',
          status: 'approved' // Auto-approved immediately
        });
        navigate('/dealer');
      } else {
        navigate('/');
      }

    } catch (error: any) {
      console.error("Registration Error:", error);
      alert(error.message || "An error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 relative">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-xl border-t-4 border-blue-600">
        <div className="text-center mb-8">
           <h2 className="text-3xl font-extrabold text-slate-900">Join AutoGuyana</h2>
           <p className="text-slate-500 mt-2 font-medium">Create your account today</p>
        </div>

        {/* Role Selector Bar */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex mb-8">
          <button 
            type="button"
            onClick={() => setRole('user')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${role === 'user' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <UserCircle2 className="h-5 w-5" />
            Private
          </button>
          <button 
            type="button"
            onClick={() => setRole('dealer')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${role === 'dealer' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Building2 className="h-5 w-5" />
            Dealership
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-8 px-2 leading-relaxed text-center">
          {role === 'user' 
             ? "Find your dream car, save favorites, and contact sellers directly." 
             : "Expand your business. Manage inventory, track analytics, and reach more buyers."}
        </p>
        
        <form onSubmit={handleRegister} className="space-y-5">
            {role === 'dealer' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-200 pb-2 mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className={labelClass}>Business Name</label>
                        <input type="text" required className={sleekInputClass} value={bizName} onChange={e => setBizName(e.target.value)} placeholder="e.g. Ramjit Motors" />
                    </div>
                    <div>
                        <label className={labelClass}>Contact Phone</label>
                        <input type="tel" required className={sleekInputClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder="592-600-0000" />
                    </div>
                </div>
                
                <div>
                    <label className={labelClass}>Region</label>
                    <div className="relative">
                        <select className={`${sleekInputClass} appearance-none`} value={region} onChange={e => setRegion(e.target.value)}>
                            {GUYANA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                    </div>
                </div>
                 <div>
                    <label className={labelClass}>Business Address</label>
                    <input type="text" required className={sleekInputClass} value={address} onChange={e => setAddress(e.target.value)} placeholder="Lot 123 Street Name, Town" />
                </div>
              </div>
            )}

            <div>
                <label className={labelClass}>Email address</label>
                <input type="email" placeholder="name@example.com" required className={sleekInputClass} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Password</label>
                  <input type="password" placeholder="••••••••" required className={sleekInputClass} value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Confirm</label>
                  <input type="password" placeholder="••••••••" required className={sleekInputClass} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 mt-8 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="h-5 w-5" />
            </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-slate-600 font-medium">
          Already have an account? <Link to="/login" className="text-blue-700 font-bold hover:underline">Sign in instead</Link>
        </p>
      </div>
    </div>
  );
};
