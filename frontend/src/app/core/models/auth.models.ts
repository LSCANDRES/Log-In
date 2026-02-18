export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
  provider?: 'LOCAL' | 'GOOGLE';
  avatarUrl?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  regularUsers: number;
  verifiedUsers: number;
  todayLogins: number;
}

export interface LoginHistoryItem {
  id: string;
  userId: string;
  action: string;
  ip?: string;
  userAgent?: string;
  provider?: string;
  details?: string;
  createdAt: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
