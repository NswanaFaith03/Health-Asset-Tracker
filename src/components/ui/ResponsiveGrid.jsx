/**
 * ResponsiveGrid - A flexible grid layout component that adapts to screen sizes
 * 
 * Usage:
 * <ResponsiveGrid cols={1} sm={2} md={3} lg={4} gap={4}>
 *   {children}
 * </ResponsiveGrid>
 * 
 * Props:
 * - cols: Number of columns on mobile (default: 1)
 * - sm: Number of columns on small screens (default: 2)
 * - md: Number of columns on medium screens (default: 3)
 * - lg: Number of columns on large screens (default: 4)
 * - gap: Gap between items in rem (default: 1)
 * - className: Additional CSS classes
 */

export default function ResponsiveGrid({ 
  children, 
  cols = 1, 
  sm = 2, 
  md = 3, 
  lg = 4, 
  gap = 1,
  className = '' 
}) {
  const gridCols = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-2',
    '3': 'grid-cols-3',
    '4': 'grid-cols-4',
    '5': 'grid-cols-5',
    '6': 'grid-cols-6',
  }

  const baseClasses = `grid ${gridCols[cols] || 'grid-cols-1'} gap-${gap}`
  const responsiveClasses = `sm:${gridCols[sm] || 'grid-cols-2'} md:${gridCols[md] || 'grid-cols-3'} lg:${gridCols[lg] || 'grid-cols-4'}`

  return (
    <div className={`${baseClasses} ${responsiveClasses} ${className}`}>
      {children}
    </div>
  )
}
