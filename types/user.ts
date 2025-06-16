export type UserRole = 'user' | 'admin' | 'atc';

export interface User {
  id: number;
  email: string;
  password?: string;
  name: string;
  surname?: string;
  picture?: string;
  googleId?: string;
  role: UserRole;
}

export interface UserStats {
  totalUsers: number;
  adminUsers: number;
  atcUsers: number;
  regularUsers: number;
  newUsersThisMonth: number;
}