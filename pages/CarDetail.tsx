
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCars, fetchDealership } from '../services/dataService';
import { Car, Dealership } from '../types';
import { FEATURES_LIST } from '../constants';
import { 
  MapPin, CheckCircle, Phone, MessageCircle, 
  Calendar, Gauge, Settings, Fuel, Zap, Palette, 
  FileDigit, Box, Activity, ShieldCheck, Fan, 
  Armchair, Sun, CarFront, Info, ChevronRight
} from 'lucide-react';

export const CarDetail: React.FC = () => {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [dealer, setDealer] = useState<Dealership | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Fetch specific car logic could be optimized in production
      const cars = await fetchCars();
      const found = cars.find(c => c.id === id);
      if (found) {
        setCar(found);
        const dealerData = await fetchDealership(found.dealerId);
        setDealer(dealerData);
        
        // Track Recently Viewed
        try {
            const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            // Remove current ID if exists to move it to top
            const filtered = viewed.filter((v: string) => v !== found.id);
            const updated = [found.id, ...filtered].slice(0, 5); // Keep max 5
            localStorage.setItem('recentlyViewed', JSON.stringify(updated));
        } catch (e) {
            console.error("Local storage error", e);
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Loading...</div>;
  if (!car) return <div className="min-h-screen flex items-center justify-center">Car not found</div>;

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GYD',
    maximumFractionDigits: 0
  });

  const categorizedFeatures = {
    safety: car.features?.filter(f => FEATURES_LIST.safety.includes(f)) || [],
    comfort: car.features?.filter(f => FEATURES_LIST.comfort.includes(f)) || [],
    interior: car.features?.filter(f => FEATURES_LIST.interior.includes(f)) || [],
    exterior: car.features?.filter(f => FEATURES_LIST.exterior.includes(f)) || [],
    other: car.features?.filter(f => 
        !FEATURES_LIST.safety.includes(f) && 
        !FEATURES_LIST.comfort.includes(f) && 
        !FEATURES_LIST.interior.includes(f) && 
        !FEATURES_LIST.exterior.includes(f)
    ) || []
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              <img 
                src={car.images[activeImage]} 
                alt={car.model} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-125 cursor-zoom-in" 
                style={{transformOrigin: 'center center'}}
                onMouseMove={(e) => {
                  const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - left) / width * 100;
                  const y = (e.clientY - top) / height * 100;
                  e.currentTarget.style.transformOrigin = `${x}% ${y}%`;
                }}
              />
              {car.status === 'sold' && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <div className="border-8 border-white/50 px-12 py-4 -rotate-12 bg-red-600/90 backdrop-blur-md shadow-2xl">
                          <span className="text-white font-black text-6xl tracking-widest uppercase">SOLD</span>
                      </div>
                  </div>
              )}
            </div>
            {car.images.length > 1 && (
              <div className="p-4 flex gap-4 overflow-x-auto">
                {car.images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-blue-500 opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                    <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specifications */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
               <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><CarFront size={24} /></div>
               <h2 className="text-2xl font-bold text-slate-900">Vehicle Specifications</h2>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
                <SpecItem icon={<CarFront />} label="Make" value={car.make} />
                <SpecItem icon={<Info />} label="Model" value={car.model} />
                <SpecItem icon={<Calendar />} label="Year" value={car.year.toString()} />
                <SpecItem icon={<Gauge />} label="Mileage" value={`${car.mileage.toLocaleString()} km`} />
                <SpecItem icon={<Settings />} label="Transmission" value={car.transmission} />
                <SpecItem icon={<Fuel />} label="Fuel Type" value={car.fuelType} />
                <SpecItem icon={<Zap />} label="Engine" value={car.engineSize || '-'} />
                <SpecItem icon={<Palette />} label="Color" value={car.color || '-'} />
                <SpecItem icon={<Box />} label="Body Type" value={car.bodyType} />
                <SpecItem icon={<Activity />} label="Steering" value={car.steering} />
                <SpecItem icon={<CheckCircle />} label="Condition" value={car.condition} />
                {car.vin && <SpecItem icon={<FileDigit />} label="VIN" value={car.vin} />}
             </div>
          </div>

          {/* Features */}
          {(car.features && car.features.length > 0) && (
             <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                 <h2 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Features & Equipment</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {categorizedFeatures.safety.length > 0 && <FeatureGroup title="Safety" icon={<ShieldCheck className="text-blue-500" />} features={categorizedFeatures.safety} />}
                     {categorizedFeatures.comfort.length > 0 && <FeatureGroup title="Comfort" icon={<Fan className="text-blue-500" />} features={categorizedFeatures.comfort} />}
                     {categorizedFeatures.interior.length > 0 && <FeatureGroup title="Interior" icon={<Armchair className="text-blue-500" />} features={categorizedFeatures.interior} />}
                     {categorizedFeatures.exterior.length > 0 && <FeatureGroup title="Exterior" icon={<Sun className="text-blue-500" />} features={categorizedFeatures.exterior} />}
                     {categorizedFeatures.other.length > 0 && <FeatureGroup title="Other" icon={<CheckCircle className="text-blue-500" />} features={categorizedFeatures.other} />}
                 </div>
             </div>
          )}

          {/* Description */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Vehicle Description</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">{car.description}</p>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg sticky top-24">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{car.listingTitle || `${car.year} ${car.make} ${car.model}`}</h1>
              <div className="flex items-center text-slate-500 gap-2 mb-4"><MapPin className="h-4 w-4 text-red-500" /> {car.region}</div>
              <div className="text-4xl font-extrabold text-blue-700">{formatter.format(car.price)}</div>
              {car.hirePurchase && <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">Available for Hire Purchase</div>}
            </div>
            
            <div className="border-t border-slate-100 py-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Sold By</h3>
              {dealer ? (
                <Link to={`/dealership/${dealer.uid}`} className="flex items-start gap-4 mb-6 hover:bg-slate-50 p-3 -mx-3 rounded-xl transition-colors group">
                   <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 overflow-hidden group-hover:scale-105 transition-transform">
                     {dealer.logoUrl ? <img src={dealer.logoUrl} className="w-full h-full object-cover" /> : dealer.businessName[0]}
                   </div>
                   <div className="flex-grow">
                     <p className="font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-1">
                        {dealer.businessName} <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                     </p>
                     <p className="text-sm text-slate-500">{dealer.address}</p>
                     <div className="flex items-center gap-1 text-green-600 text-xs mt-1 font-semibold"><CheckCircle className="h-3 w-3" /> Verified Dealer</div>
                   </div>
                </Link>
              ) : <div className="mb-6 text-slate-500">Dealer information unavailable</div>}
              
              <div className="space-y-3">
                 {dealer?.whatsapp && (
                    <a href={`https://wa.me/${dealer.whatsapp.replace(/\D/g,'')}?text=I'm interested in the ${car.year} ${car.make} ${car.model}`} target="_blank" rel="noreferrer" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm">
                      <MessageCircle className="h-5 w-5" /> WhatsApp Dealer
                    </a>
                 )}
                 <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm">
                   <Phone className="h-5 w-5" /> Show Phone Number
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpecItem: React.FC<{icon: React.ReactNode, label: string, value: string}> = ({icon, label, value}) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
    <div className="text-slate-400 mt-0.5 scale-90">{icon}</div>
    <div>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">{label}</p>
      <p className="font-semibold text-slate-900 text-sm">{value}</p>
    </div>
  </div>
);

const FeatureGroup: React.FC<{title: string, icon: React.ReactNode, features: string[]}> = ({title, icon, features}) => (
    <div>
        <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">{icon} {title}</h3>
        <ul className="space-y-2">{features.map((f, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>{f}</li>)}</ul>
    </div>
);
