
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { getUserProfile, fetchDealership } from './services/dataService';
import { UserProfile, Dealership } from './types';
import { Scale, X } from 'lucide-react';
import { AuthContext, CompareContext } from './contexts';

// Pages
import { Home } from './pages/Home';
import { SearchPage } from './pages/Search';
import { BrandsPage } from './pages/Brands';
import { CarDetail } from './pages/CarDetail';
import { DealerProfilePage } from './pages/DealerProfile';
import { DealerDashboard } from './pages/DealerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserProfilePage } from './pages/UserProfile';
import { ComparePage } from './pages/Compare';
import { Login, Register } from './pages/Auth';
import { Layout } from './components/Layout';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dealerProfile, setDealerProfile] = useState<Dealership | null>(null);
  const [loading, setLoading] = useState(true);

  // Compare State
  const [compareList, setCompareList] = useState<string[]>([]);

  const addToCompare = (id: string) => {
      if (compareList.length >= 4) {
          alert("You can compare up to 4 vehicles.");
          return;
      }
      if (!compareList.includes(id)) setCompareList([...compareList, id]);
  };
  const removeFromCompare = (id: string) => setCompareList(compareList.filter(c => c !== id));
  const isInCompare = (id: string) => compareList.includes(id);

  useEffect(() => {
    let mounted = true;

    // Safety Timeout: If Firebase Auth takes too long (e.g. backend unreachable),
    // stop loading so the user can at least see the public pages.
    const safetyTimeout = setTimeout(() => {
        if (mounted && loading) {
            console.warn("Authentication timed out. Defaulting to Guest mode.");
            setLoading(false);
        }
    }, 4000); // 4 seconds timeout

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Clear safety timeout as we got a response
      clearTimeout(safetyTimeout);
      
      if (!mounted) return;

      setUser(currentUser);
      if (currentUser) {
        try {
            const profile = await getUserProfile(currentUser.uid);
            if(mounted) setUserProfile(profile);
            
            if (profile?.role === 'dealer') {
              const dealer = await fetchDealership(currentUser.uid);
              if(mounted) setDealerProfile(dealer);
            }
        } catch (e) {
            console.error("Error fetching user details", e);
        }
      } else {
        if(mounted) {
            setUserProfile(null);
            setDealerProfile(null);
        }
      }
      if(mounted) setLoading(false);
    });

    return () => {
        mounted = false;
        unsubscribe();
        clearTimeout(safetyTimeout);
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-blue-600 font-bold animate-pulse text-xl">Loading AutoGuyana...</div></div>;
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, dealerProfile, loading }}>
      <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, isInCompare }}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/brands" element={<BrandsPage />} />
              <Route path="/car/:id" element={<CarDetail />} />
              <Route path="/dealership/:id" element={<DealerProfilePage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route 
                path="/profile" 
                element={user ? <UserProfilePage /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/favorites" 
                element={user ? <UserProfilePage /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/dealer" 
                element={
                  user && userProfile?.role === 'dealer' ? <DealerDashboard /> : <Navigate to="/login" />
                } 
              />
              <Route 
                path="/admin" 
                element={
                  // STRICT CHECK: Only allow if role is 'superadmin'
                  user && userProfile?.role === 'superadmin' ? <AdminDashboard /> : <Navigate to="/" />
                } 
              />
            </Routes>

            {/* Floating Compare Bar */}
            {compareList.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 z-50 flex justify-center animate-in slide-in-from-bottom-5">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 max-w-lg w-full border border-slate-700">
                        <div className="flex items-center gap-2">
                            <Scale className="text-blue-400" />
                            <span className="font-bold">{compareList.length} Vehicles Selected</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <Link to="/compare" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">Compare Now</Link>
                            <button onClick={() => setCompareList([])} className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
                        </div>
                    </div>
                </div>
            )}
          </Layout>
        </Router>
      </CompareContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;
