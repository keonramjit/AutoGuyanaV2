import React, { useEffect, useState } from 'react';
import { 
  getAllUsers, 
  getAllDealerships, 
  fetchCars,
  deleteCar,
  archiveListing,
  updateUserStatus
} from '../services/dataService';
import { Dealership, UserProfile, Car } from '../types';
import { 
  Users, CarFront, Building2, 
  Eye, Archive, Trash2, LayoutDashboard, ShieldCheck, Loader2, TrendingUp, Edit
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'users' | 'dealerships'>('overview');
  
  const [stats, setStats] = useState({
    users: 0,
    listings: 0,
    dealers: 0
  });
  
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allListings, setAllListings] = useState<Car[]>([]);
  const [allDealerships, setAllDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const users = await getAllUsers();
    const dealers = await getAllDealerships();
    const cars = await fetchCars();

    setAllUsers(users);
    setAllListings(cars);
    setAllDealerships(dealers);

    setStats({
      users: users.length,
      listings: cars.length,
      dealers: dealers.filter(d => d.status === 'approved').length
    });

    setLoading(false);
  };

  const handleDeleteListing = async (id: string) => {
    if(window.confirm("Permanently delete this listing?")) {
      await deleteCar(id);
      loadData();
    }
  };

  const handleArchiveListing = async (id: string) => {
    if(window.confirm("Archive this listing?")) {
      await archiveListing(id);
      loadData();
    }
  };

  const handleUserStatusChange = async (uid: string, newStatus: 'active' | 'suspended') => {
     if(window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'suspend'} this user?`)) {
       await updateUserStatus(uid, newStatus);
       loadData();
     }
  };
  
  const getDealerName = (dealerId: string) => {
      const dealer = allDealerships.find(d => d.uid === dealerId);
      return dealer ? dealer.businessName : 'Unknown Dealer';
  };

  if (loading) return <div className="p-20 text-center font-bold text-blue-600 flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Loading Super Admin...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between py-6">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="text-purple-600" /> Super Admin Dashboard
                  </h1>
                  <p className="text-slate-500 mt-1">Platform management and oversight.</p>
                </div>
                {/* Horizontal Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl mt-4 md:mt-0 overflow-x-auto">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={16}/>} label="Overview" />
                    <TabButton active={activeTab === 'listings'} onClick={() => setActiveTab('listings')} icon={<CarFront size={16}/>} label="Listings" />
                    <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={16}/>} label="Users" />
                    <TabButton active={activeTab === 'dealerships'} onClick={() => setActiveTab('dealerships')} icon={<Building2 size={16}/>} label="Dealerships" />
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <AdminStatCard 
                    title="Total Listings" 
                    value={stats.listings} 
                    icon={<CarFront className="text-blue-600" />} 
                    color="bg-blue-50" 
                    onClick={() => setActiveTab('listings')}
                 />
                 <AdminStatCard 
                    title="Total Users" 
                    value={stats.users} 
                    icon={<Users className="text-purple-600" />} 
                    color="bg-purple-50" 
                    onClick={() => setActiveTab('users')}
                 />
                 <AdminStatCard 
                    title="Active Dealers" 
                    value={stats.dealers} 
                    icon={<Building2 className="text-green-600" />} 
                    color="bg-green-50" 
                    onClick={() => setActiveTab('dealerships')}
                 />
             </div>

             {/* Platform Growth Placeholder */}
             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                 <div className="flex items-center justify-center gap-2 mb-4">
                     <TrendingUp className="text-slate-300" size={32} />
                     <h3 className="text-xl font-bold text-slate-900">Platform Growth</h3>
                 </div>
                 <span className="bg-blue-100 text-blue-700 font-bold px-4 py-1.5 rounded-full text-sm">Coming Soon</span>
                 <p className="text-slate-500 mt-4 max-w-md mx-auto">Advanced analytics for user registration trends and listing velocity will be available in the next update.</p>
             </div>

             {/* Recent Activity Section */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900">Recent Listings</h3>
                        <button onClick={() => setActiveTab('listings')} className="text-xs font-bold text-blue-600 hover:text-blue-800">View All</button>
                    </div>
                    <div className="space-y-4">
                        {allListings.slice(0, 5).map(car => (
                            <div key={car.id} className="flex items-center gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                                   {car.images[0] ? <img src={car.images[0]} className="w-full h-full object-cover" /> : <CarFront className="m-auto text-slate-400" />}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900">{car.year} {car.make} {car.model}</p>
                                    <p className="text-xs text-slate-500">${car.price.toLocaleString()}</p>
                                </div>
                                <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full uppercase ${car.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'}`}>{car.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900">Recent Users</h3>
                        <button onClick={() => setActiveTab('users')} className="text-xs font-bold text-blue-600 hover:text-blue-800">View All</button>
                    </div>
                    <div className="space-y-4">
                        {allUsers.filter(u => u.role !== 'dealer').slice(0, 5).map(user => (
                            <div key={user.uid} className="flex items-center gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">{user.email[0].toUpperCase()}</div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900">{user.email}</p>
                                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
          </div>
        )}

        {/* LISTINGS MANAGEMENT TAB */}
        {activeTab === 'listings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h2 className="text-lg font-bold text-slate-900">Listing Management</h2>
                 <span className="text-sm text-slate-500">Total: {allListings.length}</span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                    <tr>
                        <th className="px-6 py-4">Vehicle</th>
                        <th className="px-6 py-4">Dealer</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {allListings.map(car => (
                        <tr key={car.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-md bg-slate-100 overflow-hidden flex-shrink-0">
                                       {car.images[0] ? <img src={car.images[0]} className="w-full h-full object-cover" /> : <CarFront className="m-auto text-slate-400" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">{car.year} {car.make} {car.model}</p>
                                        <p className="text-xs text-slate-400 font-mono">ID: {car.id}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-700">{getDealerName(car.dealerId)}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-700">${car.price.toLocaleString()}</td>
                            <td className="px-6 py-4"><span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${car.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{car.status}</span></td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => window.open(`#/car/${car.id}`, '_blank')} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="View Listing"><Eye size={16}/></button>
                                    <button onClick={() => alert("Edit functionality for Super Admin coming soon")} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit Listing"><Edit size={16}/></button>
                                    <button onClick={() => handleArchiveListing(car.id)} className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg" title="Archive Listing"><Archive size={16}/></button>
                                    <button onClick={() => handleDeleteListing(car.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete Listing"><Trash2 size={16}/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* USER MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h2 className="text-lg font-bold text-slate-900">User Management</h2>
                 <span className="text-sm text-slate-500">Total: {allUsers.filter(u => u.role !== 'dealer').length}</span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                    <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {allUsers.filter(user => user.role !== 'dealer').map(user => (
                        <tr key={user.uid} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">{user.email[0].toUpperCase()}</div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">{user.email}</p>
                                        <p className="text-xs text-slate-400">{user.uid}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-600 capitalize">{user.role}</td>
                            <td className="px-6 py-4">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${user.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {user.status || 'active'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {user.role !== 'superadmin' && (
                                    <div className="flex justify-end gap-2">
                                        {user.status === 'suspended' ? (
                                            <button onClick={() => handleUserStatusChange(user.uid, 'active')} className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-lg hover:bg-green-100 border border-green-200">Activate</button>
                                        ) : (
                                            <button onClick={() => handleUserStatusChange(user.uid, 'suspended')} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 border border-red-200">Suspend</button>
                                        )}
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* DEALERSHIP MANAGEMENT TAB */}
        {activeTab === 'dealerships' && (
          <div className="space-y-8 animate-in fade-in">
             {/* Active Dealers */}
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Active Dealerships</h2>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                     <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">Business Name</th>
                            <th className="px-6 py-4">Region</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {allDealerships.filter(d => d.status !== 'pending').map(dealer => (
                            <tr key={dealer.uid} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-slate-900">{dealer.businessName}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{dealer.region}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{dealer.contactPhone}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${dealer.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {dealer.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label, count }: any) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${active ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
    >
        {icon} {label}
        {count !== undefined && count > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{count}</span>}
    </button>
);

const AdminStatCard = ({ title, value, icon, color, isAlert, onClick }: any) => (
    <div 
        onClick={onClick}
        className={`p-6 rounded-2xl border bg-white shadow-sm flex items-center justify-between ${isAlert ? 'ring-2 ring-orange-200' : ''} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
       <div>
         <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
         <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
       </div>
       <div className={`p-3 rounded-xl ${color}`}>
         {icon}
       </div>
    </div>
);