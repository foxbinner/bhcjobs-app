import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile, setAuthToken, clearAuthToken } from "../services/api";

const TOKEN_KEY = "@bhc_token";

export interface PersonalInfo {
  dob?: string | null;
  gender?: string | null;
  passport_number?: string | null;
  passport_expiry?: string | null;
  country?: { name?: string } | null;
  city?: { name?: string } | null;
}

export interface ShortlistedJob {
  id: number;
  job_id: number;
  job_seeker_id: number;
  note?: string | null;
  is_canceled?: number;
  created_at?: string;
}

export interface User {
  id: number;
  unique_id: string;
  name: string;
  email: string;
  phone: string;
  image: string | null;
  j_s_personal_info?: PersonalInfo | null;
  shortlisted_jobs?: ShortlistedJob[];
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await getProfile();
      if (res.data.status) {
        setUser(res.data.data as User);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) await fetchUser();
      setLoading(false);
    })();
  }, []);

  const signIn = async (token: string) => {
    await setAuthToken(token);
    await fetchUser();
  };

  const signOut = async () => {
    await clearAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loading,
        signIn,
        signOut,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
