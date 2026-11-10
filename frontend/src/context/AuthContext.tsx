import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TokenResponse } from '../types';
import { getCurrentUser, loginUser, registerUser, logoutUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<TokenResponse>;
  register: (email: string, pass: string, name: string, dept: string, role?: string) => Promise<TokenResponse>;
  logout: () => void;
  isFaculty: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('reposcope_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('reposcope_token');
      if (storedToken) {
        try {
          const profile = await getCurrentUser();
          setUser(profile);
          setToken(storedToken);
        } catch {
          logoutUser();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<TokenResponse> => {
    const data = await loginUser(email, pass);
    setUser(data.user);
    setToken(data.access_token);
    return data;
  };

  const register = async (
    email: string,
    pass: string,
    name: string,
    dept: string,
    role: string = 'FACULTY'
  ): Promise<TokenResponse> => {
    const data = await registerUser(email, pass, name, dept, role);
    setUser(data.user);
    setToken(data.access_token);
    return data;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setToken(null);
  };

  const isFaculty = user?.role === 'FACULTY' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isFaculty,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  loading: false,
  login: async () => {
    throw new Error('Auth not initialized');
  },
  register: async () => {
    throw new Error('Auth not initialized');
  },
  logout: () => {},
  isFaculty: false,
  isAdmin: false,
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
};
