/**
 * ResponsiveForm - A form container with responsive layouts
 * 
 * Usage:
 * <ResponsiveForm onSubmit={handleSubmit}>
 *   <ResponsiveInput label="Email" type="email" />
 *   <ResponsiveButton type="submit">Submit</ResponsiveButton>
 * </ResponsiveForm>
 * 
 * Props:
 * - onSubmit: Form submit handler
 * - className: Additional CSS classes
 * - children: Form fields
 */

export default function ResponsiveForm({ onSubmit, className = '', children }) {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 sm:space-y-6 ${className}`}>
      {children}
    </form>
  )
}

/**
 * ResponsiveInput - A responsive input field
 * 
 * Props:
 * - label: Input label
 * - type: Input type (text, email, password, etc.)
 * - placeholder: Placeholder text
 * - value: Input value
 * - onChange: Change handler
 * - required: Whether field is required
 * - error: Error message to display
 * - className: Additional CSS classes
 */

export function ResponsiveInput({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false, 
  error, 
  className = '' 
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full rounded-xl border bg-white py-2.5 sm:py-3 px-4 text-slate-900 placeholder:text-slate-500 focus:border-teal-400 focus:outline-none transition touch-manipulation ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-300'} ${className}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

/**
 * ResponsiveButton - A responsive button
 * 
 * Props:
 * - type: Button type (button, submit)
 * - variant: Button style (primary, secondary, outline)
 * - disabled: Whether button is disabled
 * - loading: Show loading state
 * - onClick: Click handler
 * - className: Additional CSS classes
 * - children: Button content
 */

export function ResponsiveButton({ 
  type = 'button', 
  variant = 'primary', 
  disabled = false, 
  loading = false, 
  onClick, 
  className = '', 
  children 
}) {
  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200/60',
    secondary: 'bg-slate-600 text-white hover:bg-slate-700',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 touch-manipulation ${variants[variant]} ${className}`}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
