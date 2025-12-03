
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Car } from '../types';
import { fetchCars, isCarVisible } from '../services/dataService';
import { CarCard } from '../components/CarCard';
import { GUYANA_REGIONS, CAR_MAKES, BODY_TYPES } from '../constants';
import { 
  Filter, X, RefreshCw, ChevronDown, 
  MapPin, CarFront, DollarSign, Sparkles, 
  Box, Settings, Fuel, MoveHorizontal 
} from 'lucide-react';

const SelectWrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
     <div className="relative group">
        {children}
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors pointer-events-none" />
     </div>
);

const FilterLabel: React.FC<{ icon: React.ElementType, label: string }> = ({ icon: Icon, label }) => (
  <h3 className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
    <Icon size={14} className="text-blue-600" />
    {label}
  </h3>
);

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter States
  const [make, setMake] = useState(searchParams.get('make') || '');
  const [region, setRegion] = useState(searchParams.get('region') || '');
  const [bodyType, setBodyType] = useState(searchParams.get('bodyType') || '');
  const [condition, setCondition] = useState('');
  
  // Advanced Filters
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [steering, setSteering] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');

  const sleekSelectClass = "w-full bg-slate-50 text-slate-700 font-medium border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm appearance-none cursor-pointer hover:bg-white hover:border-blue-200";

  useEffect(() => {
    const loadCars = async () => {
      setLoading(true);
      const data = await fetchCars();
      // Only show Active cars OR recently Sold cars
      const visibleData = data.filter(isCarVisible);
      setCars(visibleData);
      setLoading(false);
    };
    loadCars();
  }, []);

  useEffect(() => {
    let result = cars;

    if (make) {
      result = result.filter(c => c.make.toLowerCase().includes(make.toLowerCase()) || c.model.toLowerCase().includes(make.toLowerCase()));
    }
    if (region) {
      result = result.filter(c => c.region === region);
    }
    if (bodyType) {
      result = result.filter(c => c.bodyType === bodyType);
    }
    if (condition) {
      result = result.filter(c => c.condition === condition);
    }
    
    // Advanced Filters Logic
    if (minPrice) {
        result = result.filter(c => c.price >= Number(minPrice));
    }
    if (maxPrice) {
        result = result.filter(c => c.price <= Number(maxPrice));
    }
    if (steering) {
        result = result.filter(c => c.steering === steering);
    }
    if (fuelType) {
        result = result.filter(c => c.fuelType === fuelType);
    }
    if (transmission) {
        result = result.filter(c => c.transmission === transmission);
    }

    setFilteredCars(result);
  }, [cars, make, region, bodyType, condition, minPrice, maxPrice, steering, fuelType, transmission]);

  const clearFilters = () => {
    setMake('');
    setRegion('');
    setBodyType('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setSteering('');
    setFuelType('');
    setTransmission('');
  };

  const priceOptions = [
    { value: 500000, label: "$500k" },
    { value: 1000000, label: "$1M" },
    { value: 2000000, label: "$2M" },
    { value: 3000000, label: "$3M" },
    { value: 5000000, label: "$5M" },
    { value: 8000000, label: "$8M" },
    { value: 10000000, label: "$10M" },
    { value: 15000000, label: "$15M" },
    { value: 20000000, label: "$20M+" },
  ];

  const renderFilters = () => (
    <div className="space-y-8">
      {/* Header with Clear Button */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 md:hidden">
          <span className="font-bold text-lg">Filters</span>
          <button onClick={clearFilters} className="text-sm text-blue-600 font-medium">Reset All</button>
      </div>

      <div className="space-y-6">
        <div>
          <FilterLabel icon={MapPin} label="Location" />
          <SelectWrapper>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className={sleekSelectClass}>
              <option value="">All Locations</option>
              {GUYANA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
          </SelectWrapper>
        </div>

        <div>
          <FilterLabel icon={CarFront} label="Make & Model" />
          <SelectWrapper>
              <select value={make} onChange={(e) => setMake(e.target.value)} className={sleekSelectClass}>
              <option value="">All Makes</option>
              {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
          </SelectWrapper>
        </div>

        <div>
          <FilterLabel icon={DollarSign} label="Price Range (GYD)" />
          <div className="flex gap-3">
              <div className="w-1/2 relative">
                  <SelectWrapper>
                    <select value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={sleekSelectClass}>
                        <option value="">Min</option>
                        {priceOptions.map(p => <option key={`min-${p.value}`} value={p.value}>{p.label}</option>)}
                    </select>
                  </SelectWrapper>
              </div>
              <div className="w-1/2 relative">
                  <SelectWrapper>
                    <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={sleekSelectClass}>
                        <option value="">Max</option>
                        {priceOptions.map(p => <option key={`max-${p.value}`} value={p.value}>{p.label}</option>)}
                    </select>
                  </SelectWrapper>
              </div>
          </div>
        </div>

        <div>
          <FilterLabel icon={Sparkles} label="Condition" />
          <SelectWrapper>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className={sleekSelectClass}>
              <option value="">Any Condition</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Reconditioned">Reconditioned</option>
              </select>
          </SelectWrapper>
        </div>

        <div>
          <FilterLabel icon={Box} label="Body Type" />
          <SelectWrapper>
              <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className={sleekSelectClass}>
              <option value="">Any Body Type</option>
              {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
          </SelectWrapper>
        </div>

        <div>
          <FilterLabel icon={Settings} label="Transmission" />
          <SelectWrapper>
              <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className={sleekSelectClass}>
              <option value="">Any Transmission</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="CVT">CVT</option>
              </select>
          </SelectWrapper>
        </div>

        <div>
          <FilterLabel icon={Fuel} label="Fuel Type" />
          <SelectWrapper>
              <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className={sleekSelectClass}>
              <option value="">Any Fuel Type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
              </select>
          </SelectWrapper>
        </div>

        <div>
          <FilterLabel icon={MoveHorizontal} label="Steering" />
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              {['', 'RHD', 'LHD'].map((s) => (
                  <button
                      key={s}
                      onClick={() => setSteering(s)}
                      className={`flex-1 py-2.5 text-xs font-extrabold rounded-lg transition-all ${
                          steering === s ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                      {s || 'Any'}
                  </button>
              ))}
          </div>
        </div>
      </div>

      <button 
        onClick={clearFilters}
        className="w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold border border-transparent hover:border-red-100"
      >
          <RefreshCw className="h-4 w-4" /> Reset Filters
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
             Inventory 
             <span className="text-lg font-medium text-slate-500 ml-2">({filteredCars.length} vehicles)</span>
        </h1>
        <button 
          className="md:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm"
          onClick={() => setShowMobileFilters(true)}
        >
          <Filter className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-72 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 sticky top-24 shadow-sm/50">
            <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-100">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Filter className="h-5 w-5" />
                </div>
                <h2 className="font-extrabold text-lg text-slate-900">Filters</h2>
            </div>
            {renderFilters()}
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden" onClick={() => setShowMobileFilters(false)}>
            <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              {renderFilters()}
              <div className="mt-6 pt-4 border-t border-slate-100">
                  <button 
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-200"
                  >
                      Show {filteredCars.length} Vehicles
                  </button>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="flex-grow">
          {loading ? (
             <div className="flex justify-center py-20">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
             </div>
          ) : filteredCars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map(car => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Filter className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No vehicles found</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">We couldn't find any vehicles matching your exact criteria. Try adjusting your price range or removing some filters.</p>
              <button 
                onClick={clearFilters}
                className="mt-6 px-6 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};