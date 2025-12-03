
import React, { useState, useEffect } from 'react';
import { Car } from '../types';
import { MapPin, Gauge, Settings, Fuel, Car as CarIcon, Heart, Scale, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth, useCompare } from '../App';
import { toggleFavorite } from '../services/dataService';

interface CarCardProps {
  car: Car;
}

export const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const { user, userProfile } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  useEffect(() => {
    if (userProfile?.favorites?.includes(car.id)) {
      setIsFavorite(true);
    } else {
      setIsFavorite(false);
    }
  }, [userProfile, car.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    if (!user) {
        alert("Please log in to save favorites.");
        return;
    }
    if (loadingFav) return;

    setLoadingFav(true);
    // Optimistic Update
    const previousState = isFavorite;
    setIsFavorite(!isFavorite);

    try {
        await toggleFavorite(user.uid, car.id, previousState);
    } catch (error) {
        // Revert if failed
        setIsFavorite(previousState);
        console.error("Failed to toggle favorite");
    } finally {
        setLoadingFav(false);
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (isInCompare(car.id)) {
          removeFromCompare(car.id);
      } else {
          addToCompare(car.id);
      }
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GYD',
    maximumFractionDigits: 0
  });

  const isSold = car.status === 'sold';
  const inCompare = isInCompare(car.id);

  return (
    <Link to={`/car/${car.id}`} className="group block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:-translate-y-1 relative">
      <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
        {car.images[0] ? (
          <img 
            src={car.images[0]} 
            alt={`${car.make} ${car.model}`} 
            className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${isSold ? 'grayscale' : 'group-hover:scale-110'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <CarIcon className="h-12 w-12" />
          </div>
        )}
        
        {/* SOLD Overlay */}
        {isSold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="border-4 border-white px-6 py-2 -rotate-12 bg-red-600/90 backdrop-blur-sm">
                    <span className="text-white font-black text-2xl tracking-widest uppercase">SOLD</span>
                </div>
            </div>
        )}

        <div className="absolute top-3 right-3 flex gap-2 z-20">
            <button 
                onClick={handleFavoriteClick}
                className={`p-2 rounded-full shadow-sm backdrop-blur-md border border-white/20 transition-all ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-400 hover:text-red-500'}`}
                title="Add to Favorites"
            >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
        </div>
        
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
            <div className={`bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm border border-slate-100 ${isSold ? 'text-red-600' : 'text-slate-900'}`}>
               {isSold ? 'SOLD' : car.condition}
            </div>
            {/* Compare Checkbox */}
            <button 
                onClick={handleCompareClick}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold shadow-sm backdrop-blur-sm border transition-all ${inCompare ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/90 text-slate-600 border-white/20 hover:bg-white'}`}
            >
                {inCompare ? <Check size={12} /> : <Scale size={12} />} Compare
            </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
            {car.year} {car.make} {car.model}
          </h3>
          <p className="text-blue-700 font-extrabold text-xl">
            {formatter.format(car.price)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <Gauge className="h-3 w-3" />
            {car.mileage.toLocaleString()} km
          </div>
          <div className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            {car.transmission}
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="h-3 w-3" />
            {car.fuelType}
          </div>
          <div className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{car.region.split('(')[0].trim()}</span>
          </div>
        </div>

        <button className="w-full py-2 bg-slate-50 text-slate-700 font-medium text-sm rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors border border-slate-100">
          View Details
        </button>
      </div>
    </Link>
  );
};