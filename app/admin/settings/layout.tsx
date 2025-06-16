import { RouteGuard } from '@/components/admin/RouteGuard';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredRoles={['admin']}>
      {children}
    </RouteGuard>
  );
}