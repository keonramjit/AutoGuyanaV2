
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CAR_MAKES, BRAND_LOGOS } from '../constants';
import { Search, CarFront } from 'lucide-react';

export const BrandsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBrands = CAR_MAKES.filter(make => 
    make.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBrandLogo = (makeName: string) => {
    const found = BRAND_LOGOS.find(b => b.name.toLowerCase() === makeName.toLowerCase());
    return found ? found.url : null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">All Vehicle Brands</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Browse our comprehensive list of manufacturers available on AutoGuyana.</p>
        
        <div className="relative max-w-md mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
                type="text" 
                placeholder="Find a make..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-full shadow-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {filteredBrands.map((make, index) => {
            const logoUrl = getBrandLogo(make);
            
            return (
                <Link 
                    key={index}
                    to={`/search?make=${make}`}
                    className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col items-center justify-center text-center hover:shadow-lg hover:border-blue-500 transition-all duration-300 group aspect-square"
                >
                    <div className="w-16 h-16 mb-4 flex items-center justify-center">
                        {logoUrl ? (
                            <img 
                                src={logoUrl} 
                                alt={make} 
                                className="max-w-full max-h-full object-contain" 
                            />
                        ) : (
                            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <span className="font-bold text-xl">{make.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{make}</span>
                </Link>
            );
        })}
      </div>

      {filteredBrands.length === 0 && (
          <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CarFront size={32} />
              </div>
              <p className="text-slate-500 font-medium">No brands found matching "{searchTerm}"</p>
          </div>
      )}
    </div>
  );
};
