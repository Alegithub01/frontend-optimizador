'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, canAccessAdmin, canAccessSales, canAccessEvents } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRoles?: ('admin' | 'atc' | 'user')[];
}

export function RouteGuard({ children, requiredRoles = ['admin'] }: RouteGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
        setIsAuthorized(false);
        router.push('/login'); // 👈 redirige aquí
        return;
        }

        setUser(currentUser);

        // Verificar permisos específicos según la ruta
        let hasAccess = false;

        if (pathname.startsWith('/admin/sale')) {
        hasAccess = canAccessSales(currentUser.role);
        } else if(pathname.startsWith('/admin/eventos')){
        hasAccess = canAccessEvents(currentUser.role);
        } else if (pathname.startsWith('/admin')) {
        hasAccess = canAccessAdmin(currentUser.role);
        } else {
        hasAccess = requiredRoles.includes(currentUser.role as any);
        }


        setIsAuthorized(hasAccess);
    };

    checkAuth();
    }, [pathname, requiredRoles]);


  // Mostrar loading mientras verificamos
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no está autorizado
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Acceso Denegado
              </h3>
              <div className="space-y-2 mb-6">
                <p className="text-sm text-gray-600">
                  No tienes permisos para acceder a esta página.
                </p>
                {user && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800">
                          Usuario actual: {user.name}
                        </p>
                        <p className="text-yellow-700">
                          Rol: {user.role.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Contacta al administrador si crees que esto es un error.
                </p>
              </div>
              <Button
                onClick={() => router.push('/')}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}