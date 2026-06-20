export type UserRole = 'PASSENGER' | 'DRIVER' | 'ADMIN' | 'SUPER_ADMIN';

export type AuthUser = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
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

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};