'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { 
  Package, 
  Home, 
  Plus, 
  Settings, 
  Menu, 
  X,
  BarChart3,
  Users,
  ShoppingCart,
  DollarSign,
  User,
  LogOut,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const getNavigationForRole = (role: string) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/admin', icon: Home, roles: ['admin'] },
    { name: 'Ventas', href: '/admin/sale', icon: DollarSign, roles: ['admin', 'atc'] },
    { name: 'Ventas Manuales', href: '/admin/ventas-manuales', icon: ShoppingCart, roles: ['admin','atc'] },
  ];

  const sharedNavigation = [
    { name: 'Eventos', href: '/admin/eventos', icon: Calendar, roles: ['admin', 'atc'] },
  ];

  const adminOnlyNavigation = [
    { name: 'Productos', href: '/admin/products', icon: Package, roles: ['admin'] },
    { name: 'Cursos', href: '/admin/cursos', icon: GraduationCap, roles: ['admin'] },
    { name: 'Nuevo Producto', href: '/admin/products/new', icon: Plus, roles: ['admin'] },
    { name: 'Optikids', href: '/admin/optikids', icon: BarChart3, roles: ['admin'] },
    { name: 'Usuarios', href: '/admin/users', icon: Users, roles: ['admin'] },
    { name: 'Configuración', href: '/admin/settings', icon: Settings, roles: ['admin'] },
  ];

  if (role === 'admin') {
    return [...baseNavigation, ...adminOnlyNavigation, ...sharedNavigation];
  }

  if (role === 'atc') {
    return [...baseNavigation, ...sharedNavigation];
  }

  return [];
};


export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const navigation = user ? getNavigationForRole(user.role) : [];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Admin</Badge>;
      case 'atc':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">ATC</Badge>;
      default:
        return <Badge variant="secondary">Usuario</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4">
              <h2 className="text-lg font-semibold text-gray-900">Panel Admin</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* User info mobile */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.picture} alt={user.name} />
                  <AvatarFallback className="text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors',
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Logout button mobile */}
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  // Implementar logout
                  console.log('Logout');
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg">
          <div className="flex h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Panel de Admin</h1>
          </div>

          {/* User info desktop */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Avatar>
              <AvatarImage src={user.picture} alt={user.name} />
              <AvatarFallback>
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {user.email}
              </p>
              <div className="mt-1">
                {getRoleBadge(user.role)}
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                          pathname === item.href
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              
              {/* Logout button desktop */}
              <li className="mt-auto">
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    // Implementar logout
                    console.log('Logout');
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">Panel Admin</h1>
            </div>
            <div className="flex items-center space-x-2 ml-auto">
              {getRoleBadge(user.role)}
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}