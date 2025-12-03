
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts';
import { updateUserProfile, fetchCarsByIds, deleteUserData } from '../services/dataService';
import { Car } from '../types';
import { CarCard } from '../components/CarCard';
import { User, Mail, Heart, History, Save, Shield, Trash2, AlertTriangle } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'history'>('profile');
  const [favorites, setFavorites] = useState<Car[]>([]);
  const [recentCars, setRecentCars] = useState<Car[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
        setDisplayName(userProfile.displayName || '');
        loadCars();
    }
  }, [userProfile]);

  const loadCars = async () => {
    setLoading(true);
    // Load Favorites
    if (userProfile?.favorites?.length) {
        const favs = await fetchCarsByIds(userProfile.favorites);
        setFavorites(favs);
    } else {
        setFavorites([]);
    }

    // Load Recently Viewed
    const recentIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    if (recentIds.length) {
        const recents = await fetchCarsByIds(recentIds);
        // Sort by index in ID array to keep order
        recents.sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id));
        setRecentCars(recents);
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setSaving(true);
      try {
          await updateUserProfile(user.uid, { displayName });
          alert("Profile updated successfully");
      } catch (e) {
          console.error(e);
          alert("Failed to update profile");
      } finally {
          setSaving(false);
      }
  };

  const handleDeleteAccount = async () => {
      if (!user) return;
      const confirm = window.confirm("Are you sure you want to delete your account? This action cannot be undone and will delete all your data.");
      if (!confirm) return;

      const confirm2 = window.prompt("To confirm deletion, type 'DELETE' in the box below:");
      if (confirm2 !== 'DELETE') {
          if (confirm2 !== null) alert("Incorrect confirmation text. Account not deleted.");
          return;
      }

      setSaving(true);
      try {
          // 1. Delete data from Firestore (Profile, Dealership, Cars)
          await deleteUserData(user.uid);
          
          // 2. Delete Auth User
          await user.delete();
          alert("Your account has been deleted.");
          // Navigation handled by auth state listener in App.tsx
      } catch (error: any) {
          console.error("Delete Account Error:", error);
          if (error.code === 'auth/requires-recent-login') {
              alert("For security, please log out and log back in before deleting your account.");
          } else {
              alert("Failed to delete account. Please contact support.");
          }
      } finally {
          setSaving(false);
      }
  };

  if (!user) return <div className="p-10 text-center">Please log in.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
       <div className="mb-8">
           <h1 className="text-3xl font-extrabold text-slate-900">Your Profile</h1>
           <p className="text-slate-500 mt-2">Manage your account and viewed vehicles.</p>
       </div>

       <div className="flex flex-col md:flex-row gap-8">
           {/* Sidebar */}
           <div className="w-full md:w-64 flex-shrink-0 space-y-2">
               <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
               >
                   <User size={18} /> Profile Settings
               </button>
               <button 
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'favorites' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
               >
                   <Heart size={18} /> My Favorites <span className="ml-auto bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{favorites.length}</span>
               </button>
               <button 
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
               >
                   <History size={18} /> Recently Viewed
               </button>
           </div>

           {/* Content */}
           <div className="flex-grow">
               {activeTab === 'profile' && (
                   <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in fade-in">
                       <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                           <Shield className="text-blue-600" size={20} /> Account Information
                       </h2>
                       <form onSubmit={handleUpdate} className="space-y-6 max-w-lg">
                           <div>
                               <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Email Address</label>
                               <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed">
                                   <Mail size={16} />
                                   {user.email}
                               </div>
                               <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                           </div>
                           <div>
                               <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Display Name</label>
                               <input 
                                  type="text" 
                                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                  placeholder="e.g. John Doe"
                                  value={displayName}
                                  onChange={e => setDisplayName(e.target.value)}
                               />
                           </div>
                           <button disabled={saving} type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70">
                               <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                           </button>
                       </form>

                       {/* Danger Zone */}
                       <div className="mt-12 pt-8 border-t border-slate-200">
                            <h3 className="text-red-600 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <AlertTriangle size={16} /> Danger Zone
                            </h3>
                            <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                                <h4 className="font-bold text-slate-900 mb-2">Delete Account</h4>
                                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                                    Once you delete your account, there is no going back. This action will permanently remove your profile, favorites, and any listings if you are a dealer.
                                </p>
                                <button 
                                    onClick={handleDeleteAccount} 
                                    disabled={saving}
                                    className="bg-white text-red-600 border border-red-200 px-6 py-2.5 rounded-lg font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center gap-2 text-sm disabled:opacity-70"
                                >
                                    <Trash2 size={16} /> {saving ? 'Deleting...' : 'Delete Account'}
                                </button>
                            </div>
                       </div>
                   </div>
               )}

               {activeTab === 'favorites' && (
                   <div className="animate-in fade-in">
                       <h2 className="text-xl font-bold text-slate-900 mb-6">My Favorites</h2>
                       {loading ? (
                           <div className="text-center py-10 text-slate-400">Loading...</div>
                       ) : favorites.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                               {favorites.map(car => <CarCard key={car.id} car={car} />)}
                           </div>
                       ) : (
                           <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center">
                               <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                   <Heart size={32} />
                               </div>
                               <h3 className="text-lg font-bold text-slate-900">No favorites yet</h3>
                               <p className="text-slate-500 mt-2">Heart vehicles you love to save them here.</p>
                           </div>
                       )}
                   </div>
               )}

               {activeTab === 'history' && (
                   <div className="animate-in fade-in">
                       <h2 className="text-xl font-bold text-slate-900 mb-6">Recently Viewed</h2>
                       {loading ? (
                           <div className="text-center py-10 text-slate-400">Loading...</div>
                       ) : recentCars.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                               {recentCars.map(car => <CarCard key={car.id} car={car} />)}
                           </div>
                       ) : (
                           <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center">
                               <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                   <History size={32} />
                               </div>
                               <h3 className="text-lg font-bold text-slate-900">No viewing history</h3>
                               <p className="text-slate-500 mt-2">Vehicles you view will appear here.</p>
                           </div>
                       )}
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};
