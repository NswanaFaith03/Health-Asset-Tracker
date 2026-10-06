/**
 * ResponsiveCard - A card component that adapts to mobile/desktop
 * 
 * Usage:
 * <ResponsiveCard title="Card Title" icon={Icon}>
 *   <CardContent />
 * </ResponsiveCard>
 * 
 * Props:
 * - title: Card title
 * - icon: Lucide or React icon component
 * - description: Optional description/subtitle
 * - className: Additional CSS classes
 * - children: Card content
 */

export default function ResponsiveCard({ 
  title, 
  icon: Icon, 
  description, 
  className = '', 
  children 
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-4 sm:p-6 ${className}`}>
      {(title || Icon) && (
        <div className="flex items-start gap-3 mb-4">
          {Icon && (
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shrink-0">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          )}
          <div className="min-w-0">
            {title && <h3 className="text-base sm:text-lg font-semibold text-slate-900">{title}</h3>}
            {description && <p className="text-xs sm:text-sm text-slate-600 mt-1">{description}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
