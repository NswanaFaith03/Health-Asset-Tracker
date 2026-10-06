import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const ThemeContext = createContext()

// Roles considered staff for which we always force the light theme
const STAFF_ROLES = ['doctor', 'pharmacist', 'labTechnician', 'nurse', 'mentalHealthCounselor', 'hivProfessional', 'receptionist', 'admin']

export function ThemeProvider({ children }) {
    const { userRole } = useAuth() || {}

    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('app-theme') || 'light'
        } catch (e) {
            return 'light'
        }
    })

    // Enforce light theme for staff accounts to avoid role-driven dark backgrounds
    useEffect(() => {
        if (userRole && STAFF_ROLES.includes(userRole)) {
            if (theme !== 'light') setTheme('light')
        }
        // intentional: only react when userRole changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userRole])

    useEffect(() => {
        const root = typeof document !== 'undefined' ? document.documentElement : null
        if (!root) return

        // Tailwind uses the `dark` class by default. Our app previously used theme-dark/theme-light,
        // keep compatibility by ensuring both class sets are managed. We force the `dark` class
        // only when theme === 'dark'. Staff roles are constrained above to light.
        if (theme === 'light') {
            root.classList.remove('dark')
            root.classList.add('theme-light')
            root.classList.remove('theme-dark')
        } else {
            root.classList.add('dark')
            root.classList.remove('theme-light')
            root.classList.add('theme-dark')
        }

        try { localStorage.setItem('app-theme', theme) } catch (e) { }
    }, [theme])

    const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext)
}

export default ThemeContext
