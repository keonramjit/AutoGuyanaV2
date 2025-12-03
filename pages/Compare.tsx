
import React, { useEffect, useState } from 'react';
import { useCompare } from '../contexts';
import { fetchCarsByIds } from '../services/dataService';
import { Car } from '../types';
import { Link } from 'react-router-dom';
import { X, CarFront, CheckCircle, AlertTriangle } from 'lucide-react';
import { FEATURES_LIST } from '../constants';

export const ComparePage: React.FC = () => {
  const { compareList, removeFromCompare } = useCompare();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (compareList.length > 0) {
        const data = await fetchCarsByIds(compareList);
        setCars(data);
      } else {
        setCars([]);
      }
      setLoading(false);
    };
    loadData();
  }, [compareList]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">Loading Comparison...</div>;

  if (cars.length === 0) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                  <CarFront size={40} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">No Vehicles Selected</h1>
              <p className="text-slate-500 mb-8 max-w-md">Browse our inventory and select up to 4 vehicles to compare specs, features, and pricing side-by-side.</p>
              <Link to="/search" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                  Browse Vehicles
              </Link>
          </div>
      );
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GYD',
    maximumFractionDigits: 0
  });

  const getCommonFeatures = () => {
      // Get all features from all selected cars
      const allFeatures = new Set<string>();
      cars.forEach(c => c.features?.forEach(f => allFeatures.add(f)));
      
      // Categorize them
      const categorized: Record<string, string[]> = {
          'Safety': [], 'Comfort': [], 'Interior': [], 'Exterior': []
      };

      Array.from(allFeatures).forEach(f => {
          if (FEATURES_LIST.safety.includes(f)) categorized['Safety'].push(f);
          else if (FEATURES_LIST.comfort.includes(f)) categorized['Comfort'].push(f);
          else if (FEATURES_LIST.interior.includes(f)) categorized['Interior'].push(f);
          else if (FEATURES_LIST.exterior.includes(f)) categorized['Exterior'].push(f);
      });
      return categorized;
  };

  const categorizedFeatures = getCommonFeatures();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Vehicle Comparison</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
              <thead>
                  <tr>
                      <th className="p-6 w-48 bg-slate-50 border-b border-r border-slate-200 font-bold text-slate-500 uppercase text-xs tracking-wider sticky left-0 z-10">
                          Specs
                      </th>
                      {cars.map(car => (
                          <th key={car.id} className="p-6 border-b border-slate-100 min-w-[250px] relative group bg-white">
                              <button 
                                onClick={() => removeFromCompare(car.id)}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                              >
                                  <X size={16} />
                              </button>
                              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 mb-4">
                                  {car.images[0] ? <img src={car.images[0]} className="w-full h-full object-cover" /> : <CarFront className="m-auto text-slate-300" />}
                              </div>
                              <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">
                                  {car.year} {car.make} {car.model}
                              </h3>
                              <p className="text-blue-600 font-extrabold text-xl">{formatter.format(car.price)}</p>
                              {car.status === 'sold' && <span className="inline-block mt-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">SOLD</span>}
                              <Link to={`/car/${car.id}`} className="mt-4 block w-full py-2 text-center text-sm font-bold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors">View Details</Link>
                          </th>
                      ))}
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  <CompareRow label="Condition" values={cars.map(c => c.condition)} />
                  <CompareRow label="Mileage" values={cars.map(c => `${c.mileage.toLocaleString()} km`)} />
                  <CompareRow label="Transmission" values={cars.map(c => c.transmission)} />
                  <CompareRow label="Engine" values={cars.map(c => c.engineSize || '-')} />
                  <CompareRow label="Fuel Type" values={cars.map(c => c.fuelType)} />
                  <CompareRow label="Steering" values={cars.map(c => c.steering)} />
                  <CompareRow label="Body Type" values={cars.map(c => c.bodyType)} />
                  <CompareRow label="Color" values={cars.map(c => c.color || '-')} />
                  <CompareRow label="Region" values={cars.map(c => c.region.split('(')[0])} />

                  {/* Feature Sections */}
                  {Object.entries(categorizedFeatures).map(([category, features]) => features.length > 0 && (
                      <React.Fragment key={category}>
                          <tr className="bg-slate-50">
                              <td colSpan={cars.length + 1} className="p-3 px-6 text-xs font-black uppercase text-slate-400 tracking-wider">
                                  {category} Features
                              </td>
                          </tr>
                          {features.map(f => (
                              <tr key={f} className="hover:bg-slate-50/50">
                                  <td className="p-4 px-6 border-r border-slate-100 text-sm font-medium text-slate-600 sticky left-0 bg-white md:bg-transparent">
                                      {f}
                                  </td>
                                  {cars.map(c => (
                                      <td key={`${c.id}-${f}`} className="p-4 px-6 text-center">
                                          {c.features?.includes(f) 
                                              ? <CheckCircle size={18} className="mx-auto text-green-500 fill-green-50" />
                                              : <span className="text-slate-200">-</span>
                                          }
                                      </td>
                                  ))}
                              </tr>
                          ))}
                      </React.Fragment>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
};

const CompareRow: React.FC<{label: string, values: string[]}> = ({label, values}) => (
    <tr className="hover:bg-slate-50/50">
        <td className="p-4 px-6 border-r border-slate-100 text-sm font-bold text-slate-700 sticky left-0 bg-white md:bg-transparent">
            {label}
        </td>
        {values.map((v, i) => (
            <td key={i} className="p-4 px-6 text-sm text-slate-600 font-medium">
                {v}
            </td>
        ))}
    </tr>
);
