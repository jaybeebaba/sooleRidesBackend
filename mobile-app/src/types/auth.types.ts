export type AuthUser = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  role: 'PASSENGER' | 'DRIVER' | 'ADMIN' | 'SUPER_ADMIN';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  isFaceVerified: boolean;
  isActive: boolean;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};