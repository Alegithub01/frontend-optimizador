import { AdminLayout } from '@/components/admin/AdminLayout';
import { RouteGuard } from '@/components/admin/RouteGuard';
import { Toaster } from '@/components/ui/toaster';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredRoles={['admin', 'atc']}>
      <AdminLayout>{children}</AdminLayout>
      <Toaster />
    </RouteGuard>
  );
}