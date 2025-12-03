
import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { fetchCarsByDealer, createCar, deleteCar, uploadImage, updateDealership, updateCar } from '../services/dataService';
import { Car } from '../types';
import { 
  LayoutDashboard, 
  CarFront, 
  PlusCircle, 
  MessageSquare, 
  Settings, 
  Trash2, 
  Edit2, 
  TrendingUp,
  DollarSign,
  CheckCircle,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Lock,
  ImagePlus,
  ShieldCheck,
  Menu,
  ChevronDown,
  Search,
  Archive,
  RefreshCw,
  FileText,
  Upload,
  Camera,
  MapPin,
  Phone,
  Globe,
  BarChart3
} from 'lucide-react';
import { GUYANA_REGIONS, CAR_MAKES, YEARS, FEATURES_LIST } from '../constants';

export const DealerDashboard: React.FC = () => {
  const { user, dealerProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'add' | 'messages' | 'settings'>('overview');
  const [myCars, setMyCars] = useState<Car[]>([]);
  
  // Analytics State
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  // Filter State for Inventory
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form State for Add/Edit Car
  const initialFormState = {
    listingTitle: '',
    make: '', model: '', year: new Date().getFullYear(),
    price: 0,
    mileage: 0, transmission: 'Automatic', fuelType: 'Petrol',
    steering: 'RHD', region: dealerProfile?.region || GUYANA_REGIONS[3],
    condition: 'Used', bodyType: 'Sedan', description: '',
    color: '', vin: '', engineSize: '',
    hirePurchase: false,
    features: [] as string[]
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<Car['status']>('active');
  
  // Image State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    businessName: '',
    contactPhone: '',
    whatsapp: '',
    address: '',
    description: '',
    region: ''
  });
  
  // Settings Image State
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string>('');
  const [previewBanner, setPreviewBanner] = useState<string>('');

  const loadInventory = async () => {
    if (dealerProfile) {
      const cars = await fetchCarsByDealer(dealerProfile.uid);
      setMyCars(cars);
      
      setSettingsForm({
        businessName: dealerProfile.businessName || '',
        contactPhone: dealerProfile.contactPhone || '',
        whatsapp: dealerProfile.whatsapp || '',
        address: dealerProfile.address || '',
        description: dealerProfile.description || '',
        region: dealerProfile.region || ''
      });
      
      setPreviewLogo(dealerProfile.logoUrl || '');
      setPreviewBanner(dealerProfile.bannerUrl || '');
    }
  };

  useEffect(() => {
    loadInventory();
  }, [dealerProfile]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      await deleteCar(id);
      loadInventory();
    }
  };

  const handleEdit = (car: Car) => {
    setEditingId(car.id);
    setEditingStatus(car.status); // Preserve current status (e.g., if sold, keep sold)
    setFormData({
        listingTitle: car.listingTitle || '',
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price,
        mileage: car.mileage,
        transmission: car.transmission,
        fuelType: car.fuelType,
        steering: car.steering,
        region: car.region,
        condition: car.condition,
        bodyType: car.bodyType,
        description: car.description,
        color: car.color || '',
        vin: car.vin || '',
        engineSize: car.engineSize || '',
        hirePurchase: car.hirePurchase || false,
        features: car.features || []
    });
    setExistingImages(car.images || []);
    setImageFiles([]);
    setActiveTab('add');
  };
  
  const resetForm = () => {
    setFormData({
        ...initialFormState, 
        region: dealerProfile?.region || GUYANA_REGIONS[3]
    });
    setEditingId(null);
    setEditingStatus('active');
    setImageFiles([]);
    setExistingImages([]);
  };

  const handleCancelEdit = () => {
      resetForm();
      setActiveTab('inventory');
  };
  
  const handleUpdateStatus = async (carId: string, newStatus: Car['status']) => {
    try {
        const updates: Partial<Car> = { status: newStatus };
        
        // If marking as sold, record timestamp
        if (newStatus === 'sold') {
            updates.soldAt = Date.now();
        } 
        // If reactivating, clear soldAt logic implies removing the timestamp
        else if (newStatus === 'active') {
            updates.soldAt = 0; 
        }

        await updateCar(carId, updates);
        
        // UI Feedback
        if (newStatus === 'sold') {
            alert("Listing moved to Sold category.");
        } else if (newStatus === 'active') {
            alert("Listing restored to Active inventory.");
        } else if (newStatus === 'archived') {
            alert("Listing archived.");
        }

        loadInventory();
    } catch (e) {
        console.error(e);
        alert("Failed to update status");
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => {
        const newFeatures = prev.features.includes(feature)
            ? prev.features.filter(f => f !== feature)
            : [...prev.features, feature];
        return { ...prev, features: newFeatures };
    });
  };

  const addImages = (files: File[]) => {
      const totalCount = existingImages.length + imageFiles.length + files.length;
      if (totalCount > 10) {
          alert("You can only upload a maximum of 10 images per listing.");
          return;
      }
      setImageFiles(prev => [...prev, ...files]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        addImages(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
          addImages(Array.from(e.dataTransfer.files));
      }
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Improved Logic: Explicitly handles 'draft' vs 'active'
  const handleSubmitCar = async (e: React.FormEvent, targetStatus: 'active' | 'draft' = 'active') => {
    e.preventDefault();
    if (!dealerProfile) return;
    setSubmitting(true);

    try {
      const newImageUrls: string[] = [];
      for (const file of imageFiles) {
        try {
            const url = await uploadImage(file, `cars/${dealerProfile.uid}/${Date.now()}_${file.name}`);
            newImageUrls.push(url);
        } catch (err) {
            console.error("Upload failed for file:", file.name, err);
        }
      }

      const finalImages = [...existingImages, ...newImageUrls];
      if (finalImages.length === 0 && targetStatus === 'active') {
          finalImages.push("https://picsum.photos/800/600"); 
      }

      const carData = {
        ...formData,
        price: Number(formData.price),
        mileage: Number(formData.mileage),
        year: Number(formData.year),
        transmission: formData.transmission as any,
        fuelType: formData.fuelType as any,
        steering: formData.steering as any,
        condition: formData.condition as any,
        images: finalImages,
      };

      if (editingId) {
          // Logic for existing listing
          let finalStatus: Car['status'] = targetStatus;
          
          // If the user explicitly clicked "Save as Draft", it becomes a draft regardless of previous status
          if (targetStatus === 'draft') {
              finalStatus = 'draft';
          } 
          // If the user clicked "Submit Listing"
          else {
              // If it was previously sold or archived, keep it that way unless we want to auto-activate.
              // For "Submit Listing" button on an edit form, usually implies updating the live/draft listing.
              // If it was draft, it becomes active. If it was active, it stays active.
              if (editingStatus === 'draft') {
                  finalStatus = 'active';
              } else {
                  finalStatus = editingStatus; // Keep existing status (active/sold/archived)
              }
          }

          await updateCar(editingId, { ...carData, status: finalStatus });
          alert(finalStatus === 'draft' ? "Draft updated successfully." : "Listing updated successfully.");
      } else {
          // New Listing
          await createCar({
            ...carData,
            dealerId: dealerProfile.uid,
            status: targetStatus, // New listings respect the button clicked
            createdAt: Date.now(),
          });
          alert(targetStatus === 'draft' ? "Vehicle saved to Drafts. It is not yet visible to the public." : "Vehicle listed successfully!");
      }
      resetForm();
      setActiveTab('inventory');
      loadInventory();
    } catch (error) {
      console.error(error);
      alert('Error saving listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setPreviewBanner(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerProfile) return;
    setSubmitting(true);
    try {
        let logoUrl = dealerProfile.logoUrl;
        let bannerUrl = dealerProfile.bannerUrl;

        if (logoFile) {
           logoUrl = await uploadImage(logoFile, `dealerships/${dealerProfile.uid}/logo_${Date.now()}`);
        }
        if (bannerFile) {
           bannerUrl = await uploadImage(bannerFile, `dealerships/${dealerProfile.uid}/banner_${Date.now()}`);
        }

        await updateDealership(dealerProfile.uid, {
            ...settingsForm,
            logoUrl,
            bannerUrl
        });
        alert("Profile updated successfully");
    } catch (e) {
        alert("Failed to update profile");
    } finally {
        setSubmitting(false);
    }
  };

  if (!dealerProfile) return <div className="p-20 text-center text-blue-700 font-bold animate-pulse">Loading Dashboard...</div>;

  // Calculate counts for each tab
  const counts = {
    all: myCars.filter(c => c.status !== 'archived').length,
    active: myCars.filter(c => c.status === 'active').length,
    sold: myCars.filter(c => c.status === 'sold').length,
    archived: myCars.filter(c => c.status === 'archived').length,
    draft: myCars.filter(c => c.status === 'draft').length
  };

  const totalListings = myCars.length;
  const soldListings = myCars.filter(c => c.status === 'sold').length;
  const inventoryValue = myCars.filter(c => c.status === 'active').reduce((acc, curr) => acc + curr.price, 0);

  const filteredInventory = myCars.filter(car => {
    const matchesSearch = 
        car.listingTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        `${car.year} ${car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For 'all' tab, show active, sold, drafts (hide archived)
    if (filterStatus === 'all') {
        return matchesSearch && car.status !== 'archived'; 
    }
    
    return matchesSearch && car.status === filterStatus;
  });

  const getAnalytics = () => {
    // Simulated data for demo
    switch(timeRange) {
        case '7d': return { views: 432, clicks: 128, messages: 8, trend: '+12%', data: [45, 62, 38, 70, 55, 82, 90] };
        case '30d': return { views: 1850, clicks: 540, messages: 35, trend: '+8%', data: [65, 59, 80, 81, 56, 55, 40] };
        case 'all': return { views: 12400, clicks: 3200, messages: 210, trend: '', data: [28, 48, 40, 19, 86, 27, 90] };
    }
  };
  const stats = getAnalytics();

  const renderChart = () => {
    const data = stats.data; // Array of numbers
    const max = Math.max(...data);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="flex items-end justify-between h-48 w-full gap-2 pt-4">
            {data.map((val, i) => (
                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                    <div className="w-full max-w-[40px] flex gap-1 items-end h-full relative">
                        {/* Views Bar (Blue) */}
                        <div 
                            style={{ height: `${(val / max) * 100}%` }} 
                            className="w-1/2 bg-blue-600 rounded-t-sm transition-all duration-700 ease-out group-hover:bg-blue-500 relative"
                        ></div>
                        {/* Clicks Bar (Gold) */}
                        <div 
                             style={{ height: `${(val / max) * 60}%` }} 
                             className="w-1/2 bg-yellow-400 rounded-t-sm transition-all duration-700 ease-out group-hover:bg-yellow-300 relative"
                        ></div>
                        
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {val} Views
                        </div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 font-medium">{days[i]}</span>
                </div>
            ))}
        </div>
    );
  };

  const sleekInputClass = "w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm placeholder-slate-400 font-medium";
  const sectionCardClass = "bg-white p-6 md:p-8 rounded-xl border border-slate-100 shadow-sm";
  const sectionHeaderClass = "flex items-center gap-3 mb-6";
  const sectionIconClass = "w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center";
  const sectionTitleClass = "text-lg font-bold text-slate-900";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 md:min-h-screen sticky top-16 md:top-0 z-30 shadow-xl">
        <div className="p-6 border-b border-slate-800 hidden md:block">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
               {dealerProfile.logoUrl ? <img src={dealerProfile.logoUrl} className="w-full h-full object-cover" /> : dealerProfile.businessName[0]}
             </div>
             <div>
               <h2 className="font-bold text-sm truncate w-32">{dealerProfile.businessName}</h2>
               <div className="flex items-center text-xs gap-1 mt-1 text-green-400">
                 <CheckCircle size={12}/> Verified Dealer
               </div>
             </div>
           </div>
        </div>

        <nav className="p-4 space-y-1 flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
           <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
           <SidebarItem icon={<CarFront size={20} />} label="Inventory" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
           <SidebarItem 
             icon={<PlusCircle size={20} />} 
             label="Add / Edit Listing" 
             active={activeTab === 'add'} 
             onClick={() => { 
                resetForm(); 
                setActiveTab('add'); 
             }}
           />
           <SidebarItem icon={<MessageSquare size={20} />} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} badge={stats.messages > 0 ? stats.messages : undefined} />
           <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-8 overflow-y-auto h-screen-minus-nav">
        
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Overview Content */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">Performance metrics for your dealership.</p>
                </div>
                <div className="relative">
                    <select 
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-lg font-bold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="all">All Time</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <StatCard title="Total Listings" value={totalListings} icon={<CarFront className="text-blue-600" />} color="bg-blue-50 border-blue-100" />
               <StatCard title="Inventory Value" value={`$${(inventoryValue / 1000000).toFixed(1)}M`} subtext="GYD" icon={<DollarSign className="text-green-600" />} color="bg-green-50 border-green-100" />
               <StatCard title="Vehicles Sold" value={soldListings} icon={<CheckCircle className="text-orange-600" />} color="bg-orange-50 border-orange-100" />
               <StatCard title="Total Messages" value={stats.messages} subtext="Inquiries" icon={<MessageSquare className="text-indigo-600" />} color="bg-indigo-50 border-indigo-100" />
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="text-blue-600" /> Engagement Analytics
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-bold">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Profile Views</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Car Clicks</div>
                    </div>
                </div>
                
                <div className="w-full bg-slate-50/30 rounded-xl border border-slate-100 px-4 pb-2">
                     {renderChart()}
                </div>
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                 <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                 <p className="text-slate-500">Manage your vehicle listings.</p>
              </div>
              <button 
                onClick={() => { resetForm(); setActiveTab('add'); }} 
                className="px-6 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-lg font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
              >
                <PlusCircle size={18} /> Add New Car
              </button>
            </div>

            {/* Inventory Controls: Tabs & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Horizontal Status Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto w-full md:w-auto">
                    {[
                        { id: 'all', label: 'All', count: counts.all },
                        { id: 'active', label: 'Active', count: counts.active },
                        { id: 'sold', label: 'Sold', count: counts.sold },
                        { id: 'archived', label: 'Archived', count: counts.archived },
                        { id: 'draft', label: 'Drafts', count: counts.draft }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${filterStatus === tab.id ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                        >
                            {tab.label}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filterStatus === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search model, make, or year..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder-slate-400"
                    />
                </div>
            </div>
            
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs border-b border-slate-200">
                   <tr>
                     <th className="px-6 py-4 font-bold">Vehicle Details</th>
                     <th className="px-6 py-4 font-bold">Price</th>
                     <th className="px-6 py-4 font-bold">Status</th>
                     <th className="px-6 py-4 font-bold text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {filteredInventory.length > 0 ? filteredInventory.map(car => (
                     <tr key={car.id} className="hover:bg-blue-50/50 transition-colors group">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-4">
                           <div className="w-20 h-14 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm relative">
                              {car.images[0] ? (
                                <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon size={20} /></div>
                              )}
                              {car.status === 'draft' && <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center"><FileText className="text-white w-6 h-6"/></div>}
                           </div>
                           <div>
                             <div className="font-bold text-slate-900 text-lg">{car.year} {car.make} {car.model}</div>
                             <div className="text-xs text-slate-500 font-medium">{car.mileage.toLocaleString()} km • {car.transmission}</div>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4 font-bold text-blue-700 text-base">${car.price.toLocaleString()}</td>
                       <td className="px-6 py-4">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-block ${
                             car.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                             car.status === 'sold' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                             car.status === 'draft' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                             'bg-red-100 text-red-700 border-red-200'
                         }`}>
                           {car.status.toUpperCase()}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                            {/* Sold Action */}
                            {car.status === 'active' && (
                                <button title="Mark as Sold" onClick={() => handleUpdateStatus(car.id, 'sold')} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"><CheckCircle size={18} /></button>
                            )}
                            {/* Archive Action */}
                            {car.status !== 'archived' && (
                                <button title="Archive Listing" onClick={() => handleUpdateStatus(car.id, 'archived')} className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"><Archive size={18} /></button>
                            )}
                            {/* Restore Action */}
                            {(car.status === 'archived' || car.status === 'sold') && (
                                <button title="Restore to Active" onClick={() => handleUpdateStatus(car.id, 'active')} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><RefreshCw size={18} /></button>
                            )}
                            
                            <button title="Edit Details" onClick={() => handleEdit(car)} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors"><Edit2 size={18} /></button>
                            <button title="Delete" onClick={() => handleDelete(car.id)} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={18} /></button>
                         </div>
                       </td>
                     </tr>
                   )) : (
                       <tr>
                           <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                               <div className="flex flex-col items-center gap-2">
                                   <Search size={32} className="text-slate-300" />
                                   <p className="font-medium">No vehicles found</p>
                               </div>
                           </td>
                       </tr>
                   )}
                 </tbody>
               </table>
               </div>
            </div>
          </div>
        )}

        {/* ADD / EDIT TAB */}
        {activeTab === 'add' && (
           <div className="animate-in fade-in duration-500 pb-16">
              <div className="bg-blue-600 p-8 rounded-t-3xl text-white mb-8 -mx-6 -mt-6 md:-mx-8 md:-mt-8 shadow-md relative z-0">
                  <h1 className="text-3xl font-extrabold">{editingId ? 'Edit Listing' : 'Add New Listing'}</h1>
                  <p className="opacity-90 mt-2 font-medium">Fill in the details below to list your vehicle</p>
                  {editingStatus === 'sold' && <div className="absolute right-8 top-8 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Editing Sold Listing</div>}
              </div>

              <form onSubmit={(e) => handleSubmitCar(e, 'active')} className="space-y-6 max-w-5xl mx-auto relative z-10">
                 {/* 1. Upload Photos */}
                 <div className={sectionCardClass}>
                     <div className={sectionHeaderClass}>
                         <div className={sectionIconClass}><ImagePlus size={20} /></div>
                         <div>
                             <h3 className={sectionTitleClass}>Upload Photos *</h3>
                             <p className="text-xs text-slate-500">Add up to 10 photos. The first image will be the cover photo.</p>
                         </div>
                     </div>
                     
                     <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative bg-slate-50/50 flex flex-col items-center justify-center gap-3 ${isDragging ? 'border-blue-500 bg-blue-50 shadow-inner scale-[0.99]' : 'border-slate-300 hover:bg-slate-50'}`}
                     >
                        <input type="file" multiple onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <ImagePlus size={32} />
                        </div>
                        <div>
                            <span className="font-bold text-blue-600">Click to Upload</span>
                            <span className="text-slate-400 font-medium"> or drag and drop</span>
                        </div>
                        <p className="text-xs text-slate-400">JPG, PNG up to 5MB (Max 10 images)</p>
                     </div>
                     
                     {/* Image Previews */}
                     {(existingImages.length > 0 || imageFiles.length > 0) && (
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-8">
                            {existingImages.map((img, idx) => (
                                <div key={`ex-${idx}`} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 group shadow-sm bg-slate-50">
                                    <img src={img} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt={`Existing ${idx}`} />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                       <button type="button" onClick={() => removeExistingImage(idx)} className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transform hover:scale-110 transition-all"><Trash2 size={16} /></button>
                                    </div>
                                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 rounded">Saved</span>
                                </div>
                            ))}
                            {imageFiles.map((file, idx) => (
                                <div key={`new-${idx}`} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-blue-200 group shadow-sm bg-blue-50/30">
                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt={`New ${idx}`} />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                       <button type="button" onClick={() => removeNewImage(idx)} className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transform hover:scale-110 transition-all"><Trash2 size={16} /></button>
                                    </div>
                                    <span className="absolute bottom-1 right-1 bg-blue-600 text-white text-[10px] px-1.5 rounded">New</span>
                                </div>
                            ))}
                         </div>
                     )}
                 </div>

                 {/* 2. Vehicle Specifications */}
                 <div className={sectionCardClass}>
                     <div className={sectionHeaderClass}>
                         <div className={sectionIconClass}><CarFront size={20} /></div>
                         <h3 className={sectionTitleClass}>Vehicle Specifications</h3>
                     </div>
                     <div className="space-y-6">
                         <div>
                             <label className="label">Listing Title *</label>
                             <input className={sleekInputClass} placeholder="e.g. 2020 Toyota Camry XLE - Low Mileage" value={formData.listingTitle} onChange={e => setFormData({...formData, listingTitle: e.target.value})} required />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                             <div>
                                 <label className="label">Make *</label>
                                 <div className="relative">
                                    <select className={`${sleekInputClass} appearance-none`} value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} required>
                                        <option value="">Select Make</option>
                                        {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                 </div>
                             </div>
                             <div>
                                 <label className="label">Model *</label>
                                 <input className={sleekInputClass} placeholder="e.g. Camry" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
                             </div>
                             <div>
                                 <label className="label">Body Type *</label>
                                 <div className="relative">
                                    <select className={`${sleekInputClass} appearance-none`} value={formData.bodyType} onChange={e => setFormData({...formData, bodyType: e.target.value})} required>
                                        <option value="">Select</option>
                                        {['Sedan', 'SUV', 'Pickup', 'Hatchback', 'Wagon', 'Coupe', 'Van', 'Truck', 'Bus', 'Machinery'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                 </div>
                             </div>
                             <div>
                                 <label className="label">Year *</label>
                                 <div className="relative">
                                    <select className={`${sleekInputClass} appearance-none`} value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})}>
                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                 </div>
                             </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                             <div>
                                 <label className="label">Condition *</label>
                                 <div className="relative">
                                    <select className={`${sleekInputClass} appearance-none`} value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} required>
                                        <option value="Used">Used</option>
                                        <option value="New">New</option>
                                        <option value="Reconditioned">Reconditioned</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                 </div>
                             </div>
                             <div>
                                 <label className="label">Mileage (km)</label>
                                 <input type="number" className={sleekInputClass} placeholder="50000" value={formData.mileage} onChange={e => setFormData({...formData, mileage: Number(e.target.value)})} />
                             </div>
                             <div>
                                 <label className="label">Transmission</label>
                                 <div className="relative">
                                     <select className={`${sleekInputClass} appearance-none`} value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value})}>
                                         <option value="Automatic">Automatic</option>
                                         <option value="Manual">Manual</option>
                                         <option value="CVT">CVT</option>
                                     </select>
                                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                 </div>
                             </div>
                             <div>
                                 <label className="label">Fuel Type</label>
                                 <div className="relative">
                                     <select className={`${sleekInputClass} appearance-none`} value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value})}>
                                         <option value="Petrol">Petrol</option>
                                         <option value="Diesel">Diesel</option>
                                         <option value="Hybrid">Hybrid</option>
                                         <option value="Electric">Electric</option>
                                     </select>
                                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                 </div>
                             </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                 <label className="label">Engine Size (CC)</label>
                                 <input className={sleekInputClass} placeholder="e.g. 1600, 2000, 3500" value={formData.engineSize} onChange={e => setFormData({...formData, engineSize: e.target.value})} />
                             </div>
                             <div>
                                 <label className="label">Color</label>
                                 <input className={sleekInputClass} placeholder="e.g. Silver" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                             </div>
                             <div>
                                 <label className="label">VIN / Chassis No.</label>
                                 <input className={sleekInputClass} placeholder="e.g. JTDB..." value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})} />
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* 3. Pricing */}
                 <div className={sectionCardClass}>
                     <div className={sectionHeaderClass}>
                         <div className={sectionIconClass}><DollarSign size={20} /></div>
                         <h3 className={sectionTitleClass}>Pricing</h3>
                     </div>
                     <div className="flex flex-col md:flex-row gap-6 items-end">
                         <div className="flex-grow">
                             <label className="label">Price (GYD) *</label>
                             <input type="number" className={sleekInputClass} placeholder="4500000" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required />
                         </div>
                         <div 
                           onClick={() => setFormData({...formData, hirePurchase: !formData.hirePurchase})}
                           className={`md:w-1/2 p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center gap-4 ${formData.hirePurchase ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                         >
                             <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${formData.hirePurchase ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                 {formData.hirePurchase && <Check size={16} className="text-white" />}
                             </div>
                             <div>
                                 <span className={`font-bold block ${formData.hirePurchase ? 'text-blue-900' : 'text-slate-900'}`}>Available for Hire Purchase</span>
                                 <span className={`text-xs ${formData.hirePurchase ? 'text-blue-700' : 'text-slate-500'}`}>Check this if you accept installment payments</span>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* 4. Features */}
                 <div className={sectionCardClass}>
                     <div className={sectionHeaderClass}>
                         <div className={sectionIconClass}><CheckCircle size={20} /></div>
                         <h3 className={sectionTitleClass}>Vehicle Features</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="font-bold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100 uppercase tracking-wide">Safety</h4>
                            <div className="space-y-2">
                                {FEATURES_LIST.safety.map(f => (
                                    <div key={f} onClick={() => handleFeatureToggle(f)} className={`cursor-pointer flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 group ${formData.features.includes(f) ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'}`}>
                                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors flex-shrink-0 ${formData.features.includes(f) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>{formData.features.includes(f) && <Check size={12} className="text-white" />}</div>
                                        <span className="text-xs font-semibold leading-tight">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100 uppercase tracking-wide">Comfort</h4>
                            <div className="space-y-2">
                                {FEATURES_LIST.comfort.map(f => (
                                    <div key={f} onClick={() => handleFeatureToggle(f)} className={`cursor-pointer flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 group ${formData.features.includes(f) ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'}`}>
                                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors flex-shrink-0 ${formData.features.includes(f) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>{formData.features.includes(f) && <Check size={12} className="text-white" />}</div>
                                        <span className="text-xs font-semibold leading-tight">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                             <h4 className="font-bold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100 uppercase tracking-wide">Interior</h4>
                             <div className="space-y-2">{FEATURES_LIST.interior.map(f => ( <div key={f} onClick={() => handleFeatureToggle(f)} className={`cursor-pointer flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 group ${formData.features.includes(f) ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'}`}><div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors flex-shrink-0 ${formData.features.includes(f) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>{formData.features.includes(f) && <Check size={12} className="text-white" />}</div><span className="text-xs font-semibold leading-tight">{f}</span></div>))}</div>
                        </div>
                        <div>
                             <h4 className="font-bold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100 uppercase tracking-wide">Exterior</h4>
                             <div className="space-y-2">{FEATURES_LIST.exterior.map(f => ( <div key={f} onClick={() => handleFeatureToggle(f)} className={`cursor-pointer flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 group ${formData.features.includes(f) ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'}`}><div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors flex-shrink-0 ${formData.features.includes(f) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>{formData.features.includes(f) && <Check size={12} className="text-white" />}</div><span className="text-xs font-semibold leading-tight">{f}</span></div>))}</div>
                        </div>
                     </div>
                 </div>

                 {/* 5. Description */}
                 <div className={sectionCardClass}>
                     <div className={sectionHeaderClass}>
                         <div className={sectionIconClass}><Menu size={20} /></div>
                         <h3 className={sectionTitleClass}>Description</h3>
                     </div>
                     <textarea className={`${sleekInputClass} min-h-[150px] resize-y`} placeholder="Provide a detailed description of the vehicle, including any special features, service history, or other important information..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                 </div>

                 {/* Action Bar */}
                 <div className="flex flex-col md:flex-row gap-4 pt-4 sticky bottom-0 bg-slate-100 py-4 border-t border-slate-200 z-20">
                     <button type="button" onClick={handleCancelEdit} className="flex-1 bg-white text-slate-700 border border-slate-300 py-4 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
                     <button type="button" onClick={(e) => handleSubmitCar(e, 'draft')} className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 py-4 font-bold rounded-xl hover:bg-blue-100 transition-colors shadow-sm">Save as Draft</button>
                     <button disabled={submitting} type="submit" className="flex-[2] bg-blue-600 text-white py-4 font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-70">
                         {submitting ? 'Processing...' : 'Submit Listing'}
                     </button>
                 </div>
              </form>
           </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
           <div className="max-w-3xl mx-auto text-center py-20">
               <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                   <MessageSquare size={40} />
               </div>
               <h2 className="text-2xl font-bold text-slate-900">Messages & Inquiries</h2>
               <p className="text-slate-500 mt-2">View and reply to customer inquiries directly from here.</p>
               <span className="bg-blue-100 text-blue-700 font-bold px-4 py-1.5 rounded-full text-sm mt-6 inline-block">Feature Coming Soon</span>
           </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
           <div className="max-w-3xl mx-auto animate-in fade-in">
               <h1 className="text-3xl font-bold mb-8 text-slate-900">Dealership Settings</h1>
               <form onSubmit={handleUpdateProfile} className="space-y-8">
                   {/* Branding Section */}
                   <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                       {/* Banner Upload */}
                       <div className="relative h-48 bg-slate-100 group">
                           {previewBanner ? (
                               <img src={previewBanner} className="w-full h-full object-cover" alt="Banner" />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center text-slate-400">
                                   <ImagePlus size={40} className="opacity-20" />
                               </div>
                           )}
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <label className="cursor-pointer bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all">
                                   <Upload size={18} /> Upload Banner
                                   <input type="file" className="hidden" accept="image/*" onChange={handleBannerChange} />
                               </label>
                           </div>
                       </div>

                       <div className="px-8 pb-8 relative">
                           {/* Logo Upload */}
                           <div className="relative -mt-16 mb-6 inline-block group">
                               <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white overflow-hidden relative">
                                    {previewLogo ? (
                                        <img src={previewLogo} className="w-full h-full object-cover" alt="Logo" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-3xl">
                                            {settingsForm.businessName[0]}
                                        </div>
                                    )}
                               </div>
                               <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 cursor-pointer shadow-lg transition-transform hover:scale-110 border-2 border-white">
                                    <Camera size={16} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                               </label>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="col-span-2">
                                   <label className="label">Business Name</label>
                                   <input className={sleekInputClass} value={settingsForm.businessName} onChange={e => setSettingsForm({...settingsForm, businessName: e.target.value})} />
                               </div>
                               <div>
                                   <label className="label">Contact Phone</label>
                                   <div className="relative">
                                       <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                       <input className={`${sleekInputClass} pl-10`} value={settingsForm.contactPhone} onChange={e => setSettingsForm({...settingsForm, contactPhone: e.target.value})} />
                                   </div>
                               </div>
                               <div>
                                   <label className="label">WhatsApp Number</label>
                                   <div className="relative">
                                       <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                       <input className={`${sleekInputClass} pl-10`} value={settingsForm.whatsapp} onChange={e => setSettingsForm({...settingsForm, whatsapp: e.target.value})} />
                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>

                   {/* Location & Details */}
                   <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                       <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                           <MapPin className="text-blue-600" /> Location Details
                       </h3>
                       <div className="space-y-6">
                           <div>
                               <label className="label">Business Address</label>
                               <input 
                                  className={sleekInputClass} 
                                  placeholder="e.g. Lot 123 Main Street, Georgetown"
                                  value={settingsForm.address} 
                                  onChange={e => setSettingsForm({...settingsForm, address: e.target.value})} 
                               />
                           </div>
                           <div>
                               <label className="label">Region</label>
                               <div className="relative">
                                  <select className={`${sleekInputClass} appearance-none`} value={settingsForm.region} onChange={e => setSettingsForm({...settingsForm, region: e.target.value})}>
                                      <option value="">Select Region</option>
                                      {GUYANA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                  </select>
                                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                               </div>
                           </div>
                           <div>
                               <label className="label">About Dealership</label>
                               <textarea 
                                  className={sleekInputClass} 
                                  rows={4} 
                                  placeholder="Tell customers about your business..."
                                  value={settingsForm.description} 
                                  onChange={e => setSettingsForm({...settingsForm, description: e.target.value})} 
                               />
                           </div>
                       </div>
                   </div>

                   <div className="flex justify-end">
                       <button 
                         type="submit" 
                         disabled={submitting}
                         className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 flex items-center gap-2"
                       >
                           {submitting ? 'Saving Changes...' : 'Save Profile Settings'}
                       </button>
                   </div>
               </form>
           </div>
        )}
      </main>
      <style>{` .h-screen-minus-nav { height: calc(100vh - 64px); } @media (min-width: 768px) { .h-screen-minus-nav { height: 100vh; } } .label { display: block; font-size: 0.75rem; font-weight: 800; color: #475569; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; } `}</style>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick, badge, disabled }: any) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl w-full text-left transition-all relative font-medium ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-slate-400' : ''}`}
  >
    {icon} <span className="hidden md:inline">{label}</span>
    {badge && <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full hidden md:block">{badge}</span>}
  </button>
);

const StatCard = ({ title, value, subtext, icon, color }: any) => (
  <div className={`p-6 rounded-2xl border ${color} bg-white shadow-sm flex items-start justify-between`}>
     <div>
       <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
       <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
       {subtext && <p className="text-xs text-slate-500 font-bold mt-1 bg-slate-100 inline-block px-1.5 py-0.5 rounded">{subtext}</p>}
     </div>
     <div className={`p-3 rounded-xl ${color.split(' ')[0]}`}>{icon}</div>
  </div>
);
