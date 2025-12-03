
import { Car, Dealership } from "./types";

export const GUYANA_REGIONS = [
  "Barima-Waini (Region 1)",
  "Pomeroon-Supenaam (Region 2)",
  "Essequibo Islands-West Demerara (Region 3)",
  "Demerara-Mahaica (Region 4)",
  "Mahaica-Berbice (Region 5)",
  "East Berbice-Corentyne (Region 6)",
  "Cuyuni-Mazaruni (Region 7)",
  "Potaro-Siparuni (Region 8)",
  "Upper Takutu-Upper Essequibo (Region 9)",
  "Upper Demerara-Berbice (Region 10)",
];

export const BODY_TYPES = [
  "Sedan", "SUV", "Pickup", "Hatchback", "Wagon", "Van", "Truck", "Coupe", "Bus"
];

export const CAR_MAKES = [
  "Acura", "Alfa Romeo", "Audi", "Bentley", "BMW", "BYD", "Cadillac", "Chevrolet", 
  "Chrysler", "Citroen", "DAF", "Daihatsu", "Dodge", "Fiat", "Ford", "Foton", 
  "Genesis", "GMC", "Honda", "Hummer", "Hyundai", "Infiniti", "Isuzu", "Jaguar", 
  "Jeep", "JMC", "Kia", "Land Rover", "Lexus", "Mack", "MAN", "Mazda", 
  "Mercedes-Benz", "MG", "Mini", "Mitsubishi", "Nissan", "Peugeot", "Porsche", 
  "Ram", "Renault", "Scion", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", 
  "Volvo", "Yamaha", "Other"
];

export const BRAND_LOGOS = [
  { name: 'Acura', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Acura_logo.png/800px-Acura_logo.png' },
  { name: 'Alfa Romeo', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Alfa_Romeo.svg/1200px-Alfa_Romeo.svg.png' },
  { name: 'Audi', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/1200px-Audi-Logo_2016.svg.png' },
  { name: 'Bentley', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Bentley_logo.svg/1200px-Bentley_logo.svg.png' },
  { name: 'BMW', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/1200px-BMW.svg.png' },
  { name: 'BYD', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/BYD_Auto_2022_logo.svg/1200px-BYD_Auto_2022_logo.svg.png' },
  { name: 'Cadillac', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Cadillac_logo_%282021%29.svg/1200px-Cadillac_logo_%282021%29.svg.png' },
  { name: 'Chevrolet', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Chevrolet_logo.svg/1200px-Chevrolet_logo.svg.png' },
  { name: 'Chrysler', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Chrysler_Wing_Logo_2023.svg/1200px-Chrysler_Wing_Logo_2023.svg.png' },
  { name: 'Citroen', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Citro%C3%ABn_2022.svg/1200px-Citro%C3%ABn_2022.svg.png' },
  { name: 'DAF', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/DAF_logo.png/800px-DAF_logo.png' },
  { name: 'Daihatsu', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Daihatsu_Logo.svg/1200px-Daihatsu_Logo.svg.png' },
  { name: 'Dodge', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Dodge_Logo_2010.svg/1200px-Dodge_Logo_2010.svg.png' },
  { name: 'Fiat', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Fiat_Logo_2020.png/800px-Fiat_Logo_2020.png' },
  { name: 'Ford', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/1200px-Ford_logo_flat.svg.png' },
  { name: 'Foton', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Foton_Motor_Logo.svg/1200px-Foton_Motor_Logo.svg.png' },
  { name: 'Genesis', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Genesis_Motor_logo.svg/1200px-Genesis_Motor_logo.svg.png' },
  { name: 'GMC', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/GMC_logo.svg/1200px-GMC_logo.svg.png' },
  { name: 'Honda', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honda_Logo.svg/1200px-Honda_Logo.svg.png' },
  { name: 'Hummer', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Hummer_logo.svg/1200px-Hummer_logo.svg.png' },
  { name: 'Hyundai', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Hyundai_Motor_Company_logo.svg/1200px-Hyundai_Motor_Company_logo.svg.png' },
  { name: 'Infiniti', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Infiniti_logo.svg/1200px-Infiniti_logo.svg.png' },
  { name: 'Isuzu', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Isuzu_Motors_Logo.svg/1200px-Isuzu_Motors_Logo.svg.png' },
  { name: 'Jaguar', url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/Jaguar_Cars_logo_%282024%29.svg/1200px-Jaguar_Cars_logo_%282024%29.svg.png' },
  { name: 'Jeep', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Jeep_logo.svg/1200px-Jeep_logo.svg.png' },
  { name: 'JMC', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/JMC_Logo.svg/1200px-JMC_Logo.svg.png' },
  { name: 'Kia', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Kia_logo.svg/1200px-Kia_logo.svg.png' },
  { name: 'Land Rover', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Land_Rover_logo_2020.svg/1200px-Land_Rover_logo_2020.svg.png' },
  { name: 'Lexus', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fca/Lexus_logo_2023.svg/800px-Lexus_logo_2023.svg.png' },
  { name: 'Mack', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Mack_Trucks_logo.svg/1200px-Mack_Trucks_logo.svg.png' },
  { name: 'MAN', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Man_Dachmarke.svg/1200px-Man_Dachmarke.svg.png' },
  { name: 'Mazda', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Mazda_logo_2018.svg/1200px-Mazda_logo_2018.svg.png' },
  { name: 'Mercedes-Benz', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/1200px-Mercedes-Logo.svg.png' },
  { name: 'MG', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/MG_Motor_2021_logo.svg/1200px-MG_Motor_2021_logo.svg.png' },
  { name: 'Mini', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/MINI_logo.svg/1200px-MINI_logo.svg.png' },
  { name: 'Mitsubishi', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mitsubishi_logo.svg/1200px-Mitsubishi_logo.svg.png' },
  { name: 'Nissan', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Nissan_2020_logo.svg/800px-Nissan_2020_logo.svg.png' },
  { name: 'Peugeot', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Peugeot_Logo_2021.svg/1200px-Peugeot_Logo_2021.svg.png' },
  { name: 'Porsche', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Porsche_black_logo.svg/1200px-Porsche_black_logo.svg.png' },
  { name: 'Ram', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Ram_logo_2010.svg/1200px-Ram_logo_2010.svg.png' },
  { name: 'Renault', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Renault_2021_Text.svg/1200px-Renault_2021_Text.svg.png' },
  { name: 'Scion', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Scion_logo.svg/1200px-Scion_logo.svg.png' },
  { name: 'Subaru', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Subaru_logo.svg/1200px-Subaru_logo.svg.png' },
  { name: 'Suzuki', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Suzuki_logo_2.svg/1200px-Suzuki_logo_2.svg.png' },
  { name: 'Tesla', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tesla_logo.png/800px-Tesla_logo.png' },
  { name: 'Toyota', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/1200px-Toyota_carlogo.svg.png' },
  { name: 'Volkswagen', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/1200px-Volkswagen_logo_2019.svg.png' },
  { name: 'Volvo', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Volvo-Iron-Mark-Black.svg/1200px-Volvo-Iron-Mark-Black.svg.png' },
  { name: 'Yamaha', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Yamaha_Motor_Logo_%28full%29.svg/1200px-Yamaha_Motor_Logo_%28full%29.svg.png' }
];

export const YEARS = Array.from({ length: 47 }, (_, i) => 1980 + i); // 1980 to 2026

export const FEATURES_LIST = {
  safety: ["Anti-Lock Braking System", "Airbags", "Traction Control", "Stability Control", "Parking Sensors", "Backup Camera", "Blind Spot Monitor", "Lane Departure Warning", "Adaptive Cruise Control"],
  comfort: ["Air Conditioning", "Climate Control", "Heated Seats", "Ventilated Seats", "Power Seats", "Leather Seats", "Sunroof", "Keyless Entry", "Push Button Start", "Cruise Control"],
  interior: ["Premium Sound System", "Navigation System", "Touchscreen Display", "Apple CarPlay", "Android Auto", "Wireless Charging", "USB Ports", "Ambient Lighting", "Power Windows", "Tinted Windows"],
  exterior: ["Alloy Wheels", "LED Headlights", "Fog Lights", "Roof Rack", "Spoiler", "Running Boards", "Power Mirrors", "Heated Mirrors", "Rain Sensing Wipers", "Tow Package"]
};

export const MOCK_DEALERSHIPS: Dealership[] = [
  {
    uid: "mock-dealer-1",
    businessName: "AutoGy Motors",
    region: "Demerara-Mahaica (Region 4)",
    contactPhone: "592-600-1234",
    whatsapp: "592-600-1234",
    logoUrl: "",
    address: "123 Camp Street, Georgetown",
    status: "approved",
    description: "Guyana's #1 trusted dealer for reconditioned vehicles."
  },
  {
    uid: "mock-dealer-2",
    businessName: "Berbice Wheels",
    region: "East Berbice-Corentyne (Region 6)",
    contactPhone: "592-611-5678",
    whatsapp: "592-611-5678",
    logoUrl: "",
    address: "45 Main Road, New Amsterdam",
    status: "approved",
    description: "Best deals in Berbice. We finance!"
  },
  {
    uid: "mock-dealer-3",
    businessName: "Essequibo Imports",
    region: "Pomeroon-Supenaam (Region 2)",
    contactPhone: "592-622-9012",
    whatsapp: "592-622-9012",
    logoUrl: "",
    address: "Anna Regina Public Road",
    status: "approved",
    description: "Direct imports from Japan. Pre-order specialists."
  }
];

export const MOCK_CARS: Car[] = [
  {
    id: "mock-1",
    dealerId: "mock-dealer-1",
    make: "Toyota",
    model: "Premio",
    year: 2018,
    price: 3200000,
    mileage: 45000,
    transmission: "Automatic",
    fuelType: "Petrol",
    steering: "RHD",
    region: "Demerara-Mahaica (Region 4)",
    condition: "Reconditioned",
    bodyType: "Sedan",
    images: ["https://picsum.photos/800/600?random=1", "https://picsum.photos/800/600?random=2"],
    status: "active",
    description: "Immaculate condition Toyota Premio. Fresh import.",
    createdAt: Date.now()
  },
  {
    id: "mock-2",
    dealerId: "mock-dealer-1",
    make: "Honda",
    model: "Vezel",
    year: 2020,
    price: 5500000,
    mileage: 22000,
    transmission: "Automatic",
    fuelType: "Hybrid",
    steering: "RHD",
    region: "Demerara-Mahaica (Region 4)",
    condition: "Used",
    bodyType: "SUV",
    images: ["https://picsum.photos/800/600?random=3", "https://picsum.photos/800/600?random=4"],
    status: "active",
    description: "Sporty Honda Vezel, low mileage, dealer maintained.",
    createdAt: Date.now() - 100000
  },
  {
    id: "mock-3",
    dealerId: "mock-dealer-2",
    make: "Toyota",
    model: "Hilux",
    year: 2022,
    price: 12500000,
    mileage: 15000,
    transmission: "Manual",
    fuelType: "Diesel",
    steering: "RHD",
    region: "East Berbice-Corentyne (Region 6)",
    condition: "Used",
    bodyType: "Pickup",
    images: ["https://picsum.photos/800/600?random=5"],
    status: "active",
    description: "Powerful workhorse. Ready for the interior.",
    createdAt: Date.now() - 200000
  }
];
