export type UserRole = 'FARMER' | 'EXPERT' | 'ADMIN' | 'SELLER' | 'SUPER_ADMIN' | 'MANAGER' | 'EDITOR' | 'VIEWER';

export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  profilePhoto?: string;
  bio?: string;
  preferredLanguage: string;
  latitude?: number;
  longitude?: number;
  state?: string;
  district?: string;
  village?: string;
  verified: boolean;
  reputationScore?: number;
  currentCrops?: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
