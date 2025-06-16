import { RouteGuard } from '@/components/admin/RouteGuard';

export default function StatsLayout({
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