import { RouteGuard } from '@/components/admin/RouteGuard';

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredRoles={['admin', 'atc']}>
      {children}
    </RouteGuard>
  );
}