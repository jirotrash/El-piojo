import React from 'react';
import TableRegisters from '../components/TableRegisters';
import useUsuarioApi from '../hooks/useUsuarioApi';

export default function DashboardIndex() {
  const { data, loading, error, refetch } = useUsuarioApi();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Resumen</h2>
      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : (
        <TableRegisters title="Usuarios" data={data} onRefresh={refetch} />
      )}
    </div>
  );
}
