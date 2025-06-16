export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600">Configuración general del sistema</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Próximamente
          </h3>
          <p className="text-gray-600">
            La configuración del sistema estará disponible pronto.
          </p>
        </div>
      </div>
    </div>
  );
}