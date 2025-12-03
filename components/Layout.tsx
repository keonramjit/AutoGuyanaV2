
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Car, ShieldCheck, Briefcase, LogOut, ChevronDown, User, Heart, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts';
import { auth } from '../firebase';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { user, userProfile, dealerProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
    setIsProfileOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        {/* Guyana Flag Accent Strip */}
        <div className="h-1 w-full flex">
          <div className="h-full w-1/3 bg-green-600"></div>
          <div className="h-full w-1/3 bg-yellow-400"></div>
          <div className="h-full w-1/3 bg-red-600"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                {/* Logo with flag colors */}
                <div className="relative mr-2">
                   <Car className="h-8 w-8 text-blue-700" />
                   <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                   </div>
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Auto<span className="text-blue-700">Guyana</span>
                </span>
                <span className="ml-2 text-xl">🇬🇾</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/') ? 'border-blue-600 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/search"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/search') ? 'border-blue-600 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All Vehicles
                </Link>
              </div>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              {user ? (
                <div className="relative ml-3" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-1 pr-2 hover:bg-slate-50 transition-colors"
                  >
                     <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                        {user.email?.charAt(0).toUpperCase()}
                     </div>
                     <span className="hidden md:block text-sm font-medium text-slate-700">{user.email?.split('@')[0]}</span>
                     <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-60 rounded-xl shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        {/* Common for all logged in users */}
                        <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors" onClick={() => setIsProfileOpen(false)}>
                           <User className="mr-3 h-4 w-4 text-slate-400" /> Your Profile
                        </Link>

                        {/* Dealer Dashboard - Only for Dealers */}
                        {userProfile?.role === 'dealer' && (
                           <Link to="/dealer" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors" onClick={() => setIsProfileOpen(false)}>
                             <Briefcase className="mr-3 h-4 w-4 text-slate-400" /> Dealer Dashboard
                           </Link>
                        )}

                        {/* Super Admin Dashboard - Only for Super Admins */}
                        {userProfile?.role === 'superadmin' && (
                           <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-purple-600 transition-colors" onClick={() => setIsProfileOpen(false)}>
                             <ShieldCheck className="mr-3 h-4 w-4 text-slate-400" /> Super Admin
                           </Link>
                        )}

                        {/* My Favorites - Only for Users (Private) */}
                        {userProfile?.role === 'user' && (
                           <Link to="/favorites" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors" onClick={() => setIsProfileOpen(false)}>
                             <Heart className="mr-3 h-4 w-4 text-slate-400" /> My Favorites
                           </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="mr-3 h-4 w-4 text-red-500" /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link to="/login" className="text-slate-500 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Log in
                  </Link>
                  <Link to="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm shadow-blue-200">
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
              >
                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden bg-white border-b border-slate-200">
            <div className="pt-2 pb-3 space-y-1">
              <Link to="/" className="block pl-3 pr-4 py-2 border-l-4 border-blue-600 text-base font-medium text-blue-700 bg-blue-50">
                Home
              </Link>
              <Link to="/search" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800">
                All Vehicles
              </Link>
              
              {!user ? (
                 <>
                   <Link to="/login" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800">
                     Log in
                   </Link>
                   <Link to="/register" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800">
                     Sign up
                   </Link>
                 </>
              ) : (
                <div className="border-t border-slate-200 mt-2 pt-2">
                  <div className="px-4 py-2 flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-slate-800">{user.email}</div>
                      <div className="text-sm font-medium text-slate-500 capitalize">{userProfile?.role}</div>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                     <Link to="/profile" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800">
                       Your Profile
                     </Link>
                     {userProfile?.role === 'dealer' && (
                        <Link to="/dealer" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800">
                          Dealer Dashboard
                        </Link>
                     )}
                     {userProfile?.role === 'superadmin' && (
                        <Link to="/admin" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800">
                          Super Admin Dashboard
                        </Link>
                     )}
                     {userProfile?.role === 'user' && (
                        <Link to="/favorites" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800">
                          My Favorites
                        </Link>
                     )}
                     <button onClick={handleLogout} className="w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-red-50 hover:border-red-300">
                        Sign out
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white relative overflow-hidden">
        {/* Flag Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 flex">
            <div className="h-full w-1/3 bg-green-600"></div>
            <div className="h-full w-1/3 bg-yellow-400"></div>
            <div className="h-full w-1/3 bg-red-600"></div>
        </div>

        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
          <div>
            <div className="flex items-center mb-4">
              <Car className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold">AutoGuyana</span>
              <span className="ml-2 text-xl">🇬🇾</span>
            </div>
            <p className="text-slate-400 text-sm">
              The premier vehicle marketplace in Guyana. Secure, reliable, and built for locals.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-400 tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/search" className="text-base text-slate-300 hover:text-white">Buy a Car</Link></li>
              <li><Link to="/register" className="text-base text-slate-300 hover:text-white">Sell your Car</Link></li>
              <li><Link to="/login" className="text-base text-slate-300 hover:text-white">Dealer Login</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-400 tracking-wider uppercase mb-4">Contact</h3>
            <p className="text-slate-300 text-sm mb-2">Georgetown, Guyana</p>
            <p className="text-slate-300 text-sm">support@autoguyana.gy</p>
          </div>
        </div>
        
        <div className="border-t border-slate-800 py-8 px-4">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-sm text-slate-400 mb-2">
              &copy; 2025 AutoGuyana. All rights reserved to Keon Ramjit.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              Made in <img src="https://flagcdn.com/w40/gy.png" alt="Guyana Flag" className="h-4 w-auto rounded-sm shadow-sm" /> Guyana
            </div>
            <p className="text-xs text-slate-600 mt-2">v1.5</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
