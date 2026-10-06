import { FaSun, FaMoon } from 'react-icons/fa6'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
    const { theme, toggle } = useTheme()

    return (
        <button
            aria-label="Toggle theme"
            onClick={toggle}
            className={`fixed top-4 right-4 z-50 p-2.5 rounded-lg border shadow-md hover:scale-105 transition-transform ${theme === 'light'
                    ? 'bg-slate-900 text-amber-400 border-slate-700 hover:bg-slate-800'
                    : 'bg-white/90 text-slate-900 border-slate-200 hover:bg-white'
                }`}
        >
            {theme === 'light' ? <FaMoon className="w-5 h-5" /> : <FaSun className="w-5 h-5" />}
        </button>
    )
}
