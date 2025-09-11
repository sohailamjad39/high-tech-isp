// app/components/admin/SkeletonTable.jsx
export default function SkeletonTable({ columns = 5, rows = 10 }) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="divide-y divide-gray-200 min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider"
                  >
                    <div className="bg-gray-200 rounded h-4 animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      <div className="bg-gray-200 rounded h-4 animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }