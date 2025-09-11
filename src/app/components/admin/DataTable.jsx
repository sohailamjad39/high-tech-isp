// app/components/admin/DataTable.jsx
export default function DataTable({ headers, children }) {
    return (
      <table className="divide-y divide-gray-200 min-w-full">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {children}
        </tbody>
      </table>
    );
  }