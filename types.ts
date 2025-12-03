
export type UserRole = 'user' | 'dealer' | 'admin' | 'superadmin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  favorites: string[];
  displayName?: string;
  status?: 'active' | 'suspended';
}

export interface Dealership {
  uid: string;
  businessName: string;
  region: string;
  contactPhone: string;
  whatsapp: string;
  logoUrl: string;
  bannerUrl?: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  description?: string;
}

export interface Car {
  id: string;
  dealerId: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: 'Automatic' | 'Manual' | 'CVT';
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  steering: 'LHD' | 'RHD';
  region: string;
  condition: 'New' | 'Used' | 'Reconditioned';
  bodyType: string;
  images: string[];
  status: 'active' | 'sold' | 'reserved' | 'archived' | 'draft';
  description: string;
  createdAt: number;
  soldAt?: number; // Timestamp when marked as sold
  
  // New Fields
  listingTitle?: string;
  color?: string;
  vin?: string;
  engineSize?: string; // e.g. "2000cc"
  features?: string[];
  hirePurchase?: boolean;
}

export interface FilterState {
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  region?: string;
  condition?: string;
  bodyType?: string;
}
