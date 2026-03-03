import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '@services/auth.service';
import { setAuthToken } from '@services/api';
import type { User } from '@types/user';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = async (value: string | null) => {
    setTokenState(value);
    setAuthToken(value);
    if (value) {
      await AsyncStorage.setItem('auth_token', value);
    } else {
      await AsyncStorage.removeItem('auth_token');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        if (storedToken) {
          setAuthToken(storedToken);
          const me = await authApi.me();
          setUser(me);
          setTokenState(storedToken);
        }
      } catch {
        await setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const { token: jwt, user: u } = await authApi.login(email, password);
    await setToken(jwt);
    setUser(u);
  };

  const signup = async (name: string, email: string, password: string) => {
    const { token: jwt, user: u } = await authApi.signup(name, email, password);
    await setToken(jwt);
    setUser(u);
  };

  const logout = async () => {
    await setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

