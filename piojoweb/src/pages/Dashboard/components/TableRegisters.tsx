import React from 'react';

interface Props {
  title?: string;
  data: any[];
  onRefresh?: () => void;
}

export default function TableRegisters({ title = 'Registros', data = [], onRefresh }: Props) {
  const columns = data.length ? Object.keys(data[0]) : [];
  return (
    <div className="bg-white shadow rounded overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div>
          <button
            onClick={onRefresh}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500"
          >
            Refrescar
          </button>
        </div>
      </div>
      <div className="p-4 overflow-auto">
        {data.length === 0 ? (
          <div className="text-sm text-gray-600">No hay registros</div>
        ) : (
          <table className="w-full text-sm table-auto">
            <thead>
              <tr className="text-left text-gray-600">
                {columns.map((c) => (
                  <th key={c} className="px-2 py-1 font-medium">{c}</th>
                ))}
                <th className="px-2 py-1 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any) => (
                <tr key={row.id} className="border-t">
                  {columns.map((c) => (
                    <td key={c} className="px-2 py-2">{String(row[c])}</td>
                  ))}
                  <td className="px-2 py-2">
                    <button className="text-indigo-600 hover:underline mr-2">Editar</button>
                    <button className="text-red-600 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
