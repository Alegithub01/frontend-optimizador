// Simulación de autenticación - reemplaza con tu sistema real
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'atc';
}

export const getCurrentUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;

  const userData = localStorage.getItem('user');
  if (!userData) return null;

  const parsed = JSON.parse(userData);

  // 🟢 Aquí corregimos el rol
  const normalizedRole = parsed.role === 'adm' ? 'admin' : parsed.role;

  return {
    ...parsed,
    role: normalizedRole,
  };
};

export const hasPermission = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const canAccessAdmin = (userRole: string): boolean => {
  return hasPermission(userRole, ['admin']);
};

export const canAccessSales = (userRole: string): boolean => {
  return hasPermission(userRole, ['admin', 'atc']);
};

export const canAccessEvents = (userRole: string): boolean => {
  return hasPermission(userRole, ['admin', 'atc']);
};