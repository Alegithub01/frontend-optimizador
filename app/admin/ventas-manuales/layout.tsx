import { RouteGuard } from '@/components/admin/RouteGuard';

export default function VentasManualesLayout({
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