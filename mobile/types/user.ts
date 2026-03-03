export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

