
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, CheckCircle2, Car as CarIcon, MapPin, Store, ChevronLeft, History, Truck, Bus, Container, CarFront } from 'lucide-react';
import { BODY_TYPES, GUYANA_REGIONS, BRAND_LOGOS } from '../constants';
import { CarCard } from '../components/CarCard';
import { fetchCars, fetchDealerships, fetchCarsByIds, isCarVisible } from '../services/dataService';
import { Car, Dealership } from '../types';

export const Home: React.FC = () => {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [featuredDealers, setFeaturedDealers] = useState<Dealership[]>([]);
  const [recentCars, setRecentCars] = useState<Car[]>([]);
  const navigate = useNavigate();
  const [searchMake, setSearchMake] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Explicitly requested brands for the Home Page carousel
  const POPULAR_BRANDS_LIST = ["Toyota", "Nissan", "Honda", "Mercedes-Benz", "BMW", "Audi", "Lexus", "Mazda"];
  
  // Robust filtering for popular brands
  const popularBrands = POPULAR_BRANDS_LIST.map(name => {
      const found = BRAND_LOGOS.find(brand => brand.name.toLowerCase() === name.toLowerCase());
      return found || { name, url: '' }; 
  }).filter(b => b.url !== '');

  useEffect(() => {
    const loadData = async () => {
      const carsData = await fetchCars();
      // Filter visible cars FIRST, then slice
      const visibleCars = carsData.filter(isCarVisible);
      setFeaturedCars(visibleCars.slice(0, 3));

      const dealersData = await fetchDealerships();
      setFeaturedDealers(dealersData.slice(0, 3));

      // Load Recent
      const recentIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      if (recentIds.length) {
          const recents = await fetchCarsByIds(recentIds);
          // Maintain localStorage order
          recents.sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id));
          setRecentCars(recents);
      }
    };
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?make=${searchMake}`);
  };

  const scrollBrands = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getBodyTypeIcon = (type: string) => {
    switch (type) {
      case 'Pickup': return <Truck className="h-8 w-8" />;
      case 'Truck': return <Truck className="h-8 w-8" />;
      case 'Bus': return <Bus className="h-8 w-8" />;
      case 'Van': return <Bus className="h-8 w-8" />;
      case 'Wagon': return <Container className="h-8 w-8" />;
      case 'SUV': return <CarFront className="h-8 w-8" />;
      default: return <CarIcon className="h-8 w-8" />;
    }
  };

  return (
    <div className="flex flex-col gap-16 pb-16 bg-white">
      {/* Hero Section */}
      <section className="relative h-[650px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-blue-950">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-900/90 to-blue-800/50 z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
              alt="Guyana Drives Hero" 
              className="w-full h-full object-cover opacity-40 mix-blend-overlay animate-slow-zoom"
            />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 max-w-5xl leading-tight">
            Guyana's Premier Car Marketplace
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl font-medium leading-relaxed">
            Browse confidently. We connect you directly with trusted local dealerships and their verified inventory.
          </p>

          <form onSubmit={handleSearch} className="guyana-search-glow bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl max-w-3xl flex flex-col md:flex-row gap-4 border border-white/20">
            <div className="flex-grow">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Make/Model</label>
              <input type="text" placeholder="e.g. Toyota Axio" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder-slate-400 font-medium shadow-sm" value={searchMake} onChange={(e) => setSearchMake(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-105">
                <Search className="h-5 w-5" /> Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Brands Carousel */}
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative group">
            <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-bold text-slate-900">Popular Brands</h2>
                 <Link to="/brands" className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    View All <ChevronRight className="h-4 w-4" />
                 </Link>
            </div>
            
            <div className="relative">
                {/* Left Arrow */}
                <button 
                    onClick={() => scrollBrands('left')} 
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 shadow-lg p-3 rounded-full text-slate-600 hover:text-blue-600 hover:border-blue-400 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Right Arrow */}
                <button 
                    onClick={() => scrollBrands('right')} 
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 shadow-lg p-3 rounded-full text-slate-600 hover:text-blue-600 hover:border-blue-400 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>

                <div ref={scrollContainerRef} className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory px-1" style={{ scrollBehavior: 'smooth' }}>
                    {popularBrands.map((brand, index) => (
                        <Link 
                            to={`/search?make=${brand.name}`} 
                            key={`${brand.name}-${index}`} 
                            className="snap-start flex-shrink-0 w-40 h-28 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center p-4 hover:border-blue-500 hover:shadow-lg transition-all group cursor-pointer"
                        >
                            <div className="h-12 w-full flex items-center justify-center mb-3">
                                <img 
                                    src={brand.url} 
                                    alt={brand.name} 
                                    className="max-h-full max-w-full object-contain" 
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{brand.name}</span>
                        </Link>
                    ))}
                    
                    {/* Mobile View All Link card if desired */}
                    <Link to="/brands" className="snap-start flex-shrink-0 w-40 h-28 bg-blue-50 border border-blue-100 rounded-xl flex flex-col items-center justify-center p-4 hover:bg-blue-100 transition-all group cursor-pointer sm:hidden">
                        <span className="text-blue-600 font-bold flex items-center gap-1">View All <ChevronRight size={16} /></span>
                    </Link>
                </div>
            </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-end mb-8 pl-4 border-l-4 border-blue-600">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Featured Vehicles</h2>
            <p className="text-slate-500 mt-2 font-medium">Latest additions from our verified partners</p>
          </div>
          <Link to="/search" className="hidden md:flex text-blue-600 font-bold hover:text-blue-800 items-center gap-1 transition-colors bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 ml-auto">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {/* Changed grid to 3 columns to match the limit of 3 featured items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {featuredCars.map(car => <CarCard key={car.id} car={car} />)}
        </div>
        <div className="text-center">
            <Link to="/search" className="inline-flex items-center gap-2 bg-white border-2 border-slate-100 text-slate-700 font-bold py-3 px-8 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm">
                View Featured Listings <ChevronRight className="h-4 w-4" />
            </Link>
        </div>
      </section>

      {/* Featured Dealerships */}
      <section className="bg-slate-50 py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Featured Dealerships</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 mx-auto mt-4 rounded-full"></div>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Our network of verified partners across Guyana ensures you get quality vehicles and legitimate titles.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDealers.map(dealer => (
              <div key={dealer.uid} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-lg flex items-center justify-center text-blue-700 text-3xl font-bold mb-6 overflow-hidden group-hover:scale-105 transition-transform">
                   {dealer.logoUrl ? <img src={dealer.logoUrl} alt={dealer.businessName} className="w-full h-full object-cover" /> : <Store className="h-10 w-10 text-blue-600" />}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{dealer.businessName}</h3>
                <div className="flex items-center text-slate-500 text-sm mb-4 bg-slate-100 px-3 py-1 rounded-full"><MapPin className="h-3 w-3 mr-1 text-red-500" /> {dealer.region.split('(')[0].trim()}</div>
                <p className="text-slate-600 text-sm mb-8 line-clamp-2 leading-relaxed">{dealer.description || `Visit ${dealer.businessName} for the best deals in the region.`}</p>
                <Link to="/search" className="mt-auto w-full py-3 border-2 border-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">View Inventory</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Recently Viewed */}
      {recentCars.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex items-center gap-2 mb-8 pl-4 border-l-4 border-purple-500">
               <History className="text-purple-500" />
               <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentCars.slice(0, 4).map(car => <CarCard key={car.id} car={car} />)}
            </div>
          </section>
      )}

      {/* Body Types Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">Browse by Body Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {BODY_TYPES.map(type => (
              <Link to={`/search?bodyType=${type}`} key={type} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:ring-2 hover:ring-blue-500 border border-slate-100 transition-all text-center group">
                 <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    {getBodyTypeIcon(type)}
                 </div>
                 <span className="font-bold text-slate-700 text-lg">{type}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; } 
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes guyanaGlow {
          0% { box-shadow: 0 0 20px -5px #009E49; border-color: #009E49; } /* Green */
          33% { box-shadow: 0 0 20px -5px #FCD116; border-color: #FCD116; } /* Yellow */
          66% { box-shadow: 0 0 20px -5px #CE1126; border-color: #CE1126; } /* Red */
          100% { box-shadow: 0 0 20px -5px #009E49; border-color: #009E49; }
        }
        
        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        
        .guyana-search-glow {
          animation: guyanaGlow 4s infinite linear;
          transition: all 0.5s ease;
        }
        
        .animate-slow-zoom {
          animation: slowZoom 20s infinite alternate linear;
        }
      `}</style>
    </div>
  );
};
