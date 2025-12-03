
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  updateDoc, 
  doc, 
  deleteDoc,
  getDoc,
  orderBy,
  setDoc,
  arrayUnion,
  arrayRemove,
  limit,
  QuerySnapshot,
  DocumentSnapshot,
  DocumentData
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { Car, Dealership, UserProfile } from "../types";
import { MOCK_CARS, MOCK_DEALERSHIPS } from "../constants";

// Helper to handle "Demo Mode" logging
const logDemoMode = (action: string, error: any) => {
  if (error?.code === 'storage/unauthorized' || error?.code === 'permission-denied') {
    console.error(`PERMISSION ERROR: The ${action} failed due to security rules. Please copy the content of 'firestore.rules' and 'storage.rules' to your Firebase Console.`);
  }
  // Suppress the specific "backend didn't respond" error from cluttering logs too much as it's handled
  if (error?.message?.includes("timed out") || error?.code === 'unavailable') {
     console.warn(`[Network] ${action} timed out or unavailable. Switching to offline/demo data.`);
  } else {
     console.warn(`[Demo Mode] ${action} failed. Using mock data/fallback.`);
     console.error(error);
  }
};

// Helper to wrap promises with a timeout
// If Firestore is blocked/slow, this ensures we show Mock Data quickly (e.g. 3s) instead of hanging for 10s+
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error("Request timed out - Backend unreachable")), timeoutMs)
        )
    ]);
};

// Filter for public visibility: Active OR (Sold AND sold < 24 hours ago)
export const isCarVisible = (car: Car) => {
    if (car.status === 'active') return true;
    if (car.status === 'sold') {
        if (!car.soldAt) return false; // Legacy sold cars hidden
        const oneDay = 24 * 60 * 60 * 1000;
        return (Date.now() - car.soldAt) < oneDay;
    }
    return false;
};

// Cars
export const fetchCars = async (): Promise<Car[]> => {
  try {
    const q = query(collection(db, "cars"), orderBy("createdAt", "desc"));
    // Use timeout to fallback quickly if offline
    const querySnapshot = await withTimeout(getDocs(q)) as QuerySnapshot<DocumentData>;
    const cars: Car[] = [];
    querySnapshot.forEach((doc) => {
      cars.push({ id: doc.id, ...doc.data() } as Car);
    });
    
    // Return mock data if database is empty for demo purposes
    if (cars.length === 0) return MOCK_CARS;
    
    return cars;
  } catch (error) {
    logDemoMode("Fetch Cars", error);
    return MOCK_CARS;
  }
};

export const fetchCarsByDealer = async (dealerId: string): Promise<Car[]> => {
  try {
    const q = query(collection(db, "cars"), where("dealerId", "==", dealerId));
    const snapshot = await withTimeout(getDocs(q)) as QuerySnapshot<DocumentData>;
    const cars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
    
    if (cars.length === 0) {
      const mock = MOCK_CARS.filter(c => c.dealerId === dealerId);
      return mock.length > 0 ? mock : [];
    }
    return cars;
  } catch (error) {
    logDemoMode("Fetch Cars By Dealer", error);
    return MOCK_CARS.filter(c => c.dealerId === dealerId);
  }
};

export const fetchCarsByIds = async (ids: string[]): Promise<Car[]> => {
  if (!ids || ids.length === 0) return [];
  try {
      // For simplicity in this demo, we'll fetch all active cars and filter.
      const allCars = await fetchCars();
      return allCars.filter(car => ids.includes(car.id));
  } catch (error) {
      logDemoMode("Fetch Cars By IDs", error);
      return MOCK_CARS.filter(c => ids.includes(c.id));
  }
};

export const createCar = async (carData: Omit<Car, "id">) => {
  try {
    return await addDoc(collection(db, "cars"), carData);
  } catch (error) {
    logDemoMode("Create Car", error);
    throw new Error("Demo Mode: Cannot create listings in live database.");
  }
};

export const updateCar = async (id: string, carData: Partial<Car>) => {
  try {
    const carRef = doc(db, "cars", id);
    return await updateDoc(carRef, carData);
  } catch (error) {
    logDemoMode("Update Car", error);
    throw error;
  }
};

export const deleteCar = async (id: string) => {
  try {
    return await deleteDoc(doc(db, "cars", id));
  } catch (error) {
    logDemoMode("Delete Car", error);
    throw new Error("Demo Mode: Cannot delete listings.");
  }
};

export const archiveListing = async (id: string) => {
    return updateCar(id, { status: 'archived' });
};

// Dealerships
export const fetchDealership = async (uid: string): Promise<Dealership | null> => {
  try {
    const docRef = doc(db, "dealerships", uid);
    const docSnap = await withTimeout(getDoc(docRef)) as DocumentSnapshot<DocumentData>;
    if (docSnap.exists()) {
      return docSnap.data() as Dealership;
    }
    const q = query(collection(db, "dealerships"), where("uid", "==", uid));
    const snapshot = await withTimeout(getDocs(q)) as QuerySnapshot<DocumentData>;
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as Dealership;
    }
    return MOCK_DEALERSHIPS.find(d => d.uid === uid) || null;
  } catch (e) {
    logDemoMode("Fetch Single Dealership", e);
    return MOCK_DEALERSHIPS.find(d => d.uid === uid) || null;
  }
};

export const fetchDealerships = async (): Promise<Dealership[]> => {
  try {
    const q = query(collection(db, "dealerships"), where("status", "==", "approved"));
    const snapshot = await withTimeout(getDocs(q)) as QuerySnapshot<DocumentData>;
    const dealers: Dealership[] = [];
    snapshot.forEach((doc) => {
      dealers.push(doc.data() as Dealership);
    });

    if (dealers.length === 0) return MOCK_DEALERSHIPS;
    return dealers;
  } catch (e) {
    logDemoMode("Fetch All Dealerships", e);
    return MOCK_DEALERSHIPS;
  }
};

export const registerDealership = async (dealerData: Dealership) => {
  try {
    await setDoc(doc(db, "dealerships", dealerData.uid), dealerData);
  } catch (error) {
    logDemoMode("Register Dealership", error);
    throw new Error("Registration failed.");
  }
};

export const updateDealership = async (uid: string, data: Partial<Dealership>) => {
  try {
    const docRef = doc(db, "dealerships", uid);
    await updateDoc(docRef, data);
  } catch (error) {
    logDemoMode("Update Dealership", error);
  }
};

// Users
export const createUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    await setDoc(doc(db, "users", uid), { uid, ...data, status: 'active' });
  } catch (error) {
    logDemoMode("Create User Profile", error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await withTimeout(getDoc(docRef)) as DocumentSnapshot<DocumentData>;
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    logDemoMode("Get User Profile", error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    try {
        const docRef = doc(db, "users", uid);
        await updateDoc(docRef, data);
    } catch (error) {
        logDemoMode("Update User Profile", error);
        throw error;
    }
};

export const updateUserStatus = async (uid: string, status: 'active' | 'suspended') => {
    try {
        const docRef = doc(db, "users", uid);
        await updateDoc(docRef, { status });
    } catch (error) {
        logDemoMode("Update User Status", error);
        throw error;
    }
};

export const deleteUserData = async (uid: string) => {
    try {
        // 1. Delete User Profile
        const userRef = doc(db, "users", uid);
        await deleteDoc(userRef);

        // 2. Check if Dealer Profile exists and delete
        const dealerRef = doc(db, "dealerships", uid);
        const dealerSnap = await getDoc(dealerRef);
        if (dealerSnap.exists()) {
           await deleteDoc(dealerRef);
           
           // 3. Delete Dealer's Cars
           const carsQ = query(collection(db, "cars"), where("dealerId", "==", uid));
           const carsSnap = await getDocs(carsQ);
           // Delete all car docs found
           const deletePromises = carsSnap.docs.map(docSnapshot => deleteDoc(docSnapshot.ref));
           await Promise.all(deletePromises);
        }
    } catch (error) {
        logDemoMode("Delete User Data", error);
        throw error;
    }
};

export const toggleFavorite = async (userId: string, carId: string, isFavorite: boolean) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            favorites: isFavorite ? arrayRemove(carId) : arrayUnion(carId)
        });
    } catch (error) {
        logDemoMode("Toggle Favorite", error);
        throw error;
    }
};

// Admin Functions
export const getAllUsers = async (): Promise<UserProfile[]> => {
    try {
        const q = query(collection(db, "users"));
        const snapshot = await withTimeout(getDocs(q)) as QuerySnapshot<DocumentData>;
        return snapshot.docs.map(d => d.data() as UserProfile);
    } catch (error) {
        logDemoMode("Admin Fetch Users", error);
        return [];
    }
};

export const getAllDealerships = async (): Promise<Dealership[]> => {
    try {
        const q = query(collection(db, "dealerships"));
        const snapshot = await withTimeout(getDocs(q)) as QuerySnapshot<DocumentData>;
        return snapshot.docs.map(d => d.data() as Dealership);
    } catch (error) {
        logDemoMode("Admin Fetch Dealerships", error);
        return MOCK_DEALERSHIPS;
    }
};

// Storage
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    logDemoMode("Upload Image", error);
    return "https://picsum.photos/800/600?random=" + Math.floor(Math.random() * 100);
  }
};