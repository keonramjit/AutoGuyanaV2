
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDealership, fetchCarsByDealer, isCarVisible } from '../services/dataService';
import { Dealership, Car } from '../types';
import { CarCard } from '../components/CarCard';
import { MapPin, Phone, MessageCircle, Search, Filter, Store, X } from 'lucide-react';
import { GUYANA_REGIONS } from '../constants';

export const DealerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dealer, setDealer] = useState<Dealership | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [bodyTypeFilter, setBodyTypeFilter] = useState('');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | ''>('');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      
      const dealerData = await fetchDealership(id);
      setDealer(dealerData);

      if (dealerData) {
        const carData = await fetchCarsByDealer(id);
        const visibleCars = carData.filter(isCarVisible);
        setCars(visibleCars);
        setFilteredCars(visibleCars);
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  useEffect(() => {
    let result = [...cars];

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.make.toLowerCase().includes(lower) || 
        c.model.toLowerCase().includes(lower) || 
        c.year.toString().includes(lower)
      );
    }

    // Filter
    if (bodyTypeFilter) {
      result = result.filter(c => c.bodyType === bodyTypeFilter);
    }

    // Sort
    if (priceSort === 'asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'desc') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredCars(result);
  }, [cars, searchTerm, bodyTypeFilter, priceSort]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Loading Dealership...</div>;
  if (!dealer) return <div className="min-h-screen flex items-center justify-center">Dealership not found</div>;

  const uniqueBodyTypes = Array.from(new Set(cars.map(c => c.bodyType)));

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Banner Section */}
      <div className="h-64 md:h-80 w-full relative bg-slate-900 overflow-hidden">
        {dealer.bannerUrl ? (
          <img src={dealer.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-slate-900 opacity-90"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-32 z-10">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col md:flex-row items-start md:items-end gap-6 mb-12">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl border-4 border-white shadow-lg overflow-hidden flex-shrink-0 -mt-20 md:-mt-24">
             {dealer.logoUrl ? (
               <img src={dealer.logoUrl} alt={dealer.businessName} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-slate-100 text-blue-600">
                 <Store size={48} />
               </div>
             )}
          </div>
          
          <div className="flex-grow">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{dealer.businessName}</h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 mb-4">
              <span className="flex items-center gap-1"><MapPin size={16} className="text-red-500" /> {dealer.address}</span>
              <span className="hidden md:inline">•</span>
              <span>{dealer.region}</span>
            </div>
            {dealer.description && <p className="text-slate-600 max-w-2xl">{dealer.description}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             {dealer.whatsapp && (
               <a href={`https://wa.me/${dealer.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-green-200">
                 <MessageCircle size={20} /> WhatsApp
               </a>
             )}
             <a href={`tel:${dealer.contactPhone}`} className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg">
                 <Phone size={20} /> Call Now
             </a>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Current Inventory</h2>
              <p className="text-slate-500 mt-1">{filteredCars.length} vehicles available</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Search inventory..." 
                   className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none shadow-sm"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
               </div>
               
               <div className="flex gap-2">
                 <select 
                   className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none shadow-sm cursor-pointer"
                   value={bodyTypeFilter}
                   onChange={e => setBodyTypeFilter(e.target.value)}
                 >
                   <option value="">All Types</option>
                   {uniqueBodyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                 </select>

                 <select 
                   className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none shadow-sm cursor-pointer"
                   value={priceSort}
                   onChange={e => setPriceSort(e.target.value as any)}
                 >
                   <option value="">Sort: Default</option>
                   <option value="asc">Price: Low to High</option>
                   <option value="desc">Price: High to Low</option>
                 </select>
               </div>
            </div>
        </div>

        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map(car => <CarCard key={car.id} car={car} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
             <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
               <Filter size={32} />
             </div>
             <h3 className="text-lg font-bold text-slate-900">No vehicles found</h3>
             <p className="text-slate-500 mt-2">Try adjusting your search filters.</p>
             <button onClick={() => { setSearchTerm(''); setBodyTypeFilter(''); }} className="mt-4 text-blue-600 font-bold hover:underline">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
};
