export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-600">Gestión de pedidos y ventas</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Próximamente
          </h3>
          <p className="text-gray-600">
            La gestión de pedidos estará disponible pronto.
          </p>
        </div>
      </div>
    </div>
  );
}