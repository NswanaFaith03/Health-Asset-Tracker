/**
 * ResponsiveTable - A table component with horizontal scroll on mobile
 * 
 * Usage:
 * <ResponsiveTable
 *   headers={['Name', 'Date', 'Status']}
 *   data={[
 *     { name: 'John', date: '2024-01-01', status: 'Active' },
 *     { name: 'Jane', date: '2024-01-02', status: 'Pending' }
 *   ]}
 *   renderRow={(row) => (
 *     <>
 *       <td>{row.name}</td>
 *       <td>{row.date}</td>
 *       <td>{row.status}</td>
 *     </>
 *   )}
 * />
 * 
 * Props:
 * - headers: Array of column headers
 * - data: Array of data objects
 * - renderRow: Function to render table row cells
 * - className: Additional CSS classes
 */

export default function ResponsiveTable({ 
  headers, 
  data, 
  renderRow, 
  className = '' 
}) {
  return (
    <div className={`overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 ${className}`}>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-slate-200">
            {headers.map((header, index) => (
              <th 
                key={index} 
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition">
              {renderRow(row, index)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
