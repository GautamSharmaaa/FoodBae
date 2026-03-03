import { api } from './api';
import type { AuthResponse, User } from '@types/user';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', { email, password });
  if (!res.data?.success) {
    throw new Error(res.data?.message ?? 'Login failed');
  }
  return res.data.data as AuthResponse;
};

export const signup = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await api.post('/auth/signup', { name, email, password });
  if (!res.data?.success) {
    throw new Error(res.data?.message ?? 'Signup failed');
  }
  return res.data.data as AuthResponse;
};

export const me = async (): Promise<User> => {
  const res = await api.get('/auth/me');
  if (!res.data?.success) {
    throw new Error(res.data?.message ?? 'Failed to fetch profile');
  }
  return res.data.data as User;
};

