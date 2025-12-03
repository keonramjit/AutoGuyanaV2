
import { createContext, useContext } from 'react';
import { User } from 'firebase/auth';
import { UserProfile, Dealership } from './types';

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  dealerProfile: Dealership | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null, dealerProfile: null, loading: true });
export const useAuth = () => useContext(AuthContext);

export interface CompareContextType {
    compareList: string[];
    addToCompare: (id: string) => void;
    removeFromCompare: (id: string) => void;
    isInCompare: (id: string) => boolean;
}
export const CompareContext = createContext<CompareContextType>({ compareList: [], addToCompare: () => {}, removeFromCompare: () => {}, isInCompare: () => false });
export const useCompare = () => useContext(CompareContext);
