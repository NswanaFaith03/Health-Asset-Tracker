import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import EmergencyWidget from './EmergencyWidget'
import NotificationCenter from './NotificationCenter'
import {
    FaArrowRightFromBracket,
    FaBell,
    FaCalendarCheck,
    FaClipboardList,
    FaFileInvoiceDollar,
    FaGaugeHigh,
    FaHouse,
    FaIdCard,
    FaPills,
    FaShieldHalved,
    FaHeartPulse,
    FaShieldHeart,
    FaUser,
    FaUserDoctor,
    FaUserGear,
    FaUserNurse,
    FaUsers,
    FaHashtag,
    FaChartSimple,
    FaBars,
    FaXmark,
} from 'react-icons/fa6'

const NAV_ITEMS = {
    student: [
        { label: 'Dashboard', to: '/student', icon: FaGaugeHigh },
        { label: 'General Consultation', to: '/student/consultations', icon: FaClipboardList },
        { label: 'Mental Buddy', to: '/student/mental-buddy', icon: FaHeartPulse },
        { label: 'HIV Counselling', to: '/student/hiv-counselling', icon: FaShieldHeart },
        { label: 'Notifications', to: '/student/notifications', icon: FaBell },
        { label: 'Queue', to: '/student/queue', icon: FaBell },
        { label: 'Lab Requests', to: '/student/lab-requests', icon: FaClipboardList },
        { label: 'Profile', to: '/student/profile', icon: FaIdCard, profile: true },
    ],
    doctor: [
        { label: 'Dashboard', to: '/doctor', icon: FaGaugeHigh },
        { label: 'Consultations', to: '/doctor/consultations', icon: FaClipboardList },
        { label: 'Queue', to: '/doctor/tokens', icon: FaHashtag },
        { label: 'Prescriptions', to: '/doctor/prescriptions', icon: FaPills },
        { label: 'Lab Results', to: '/doctor/lab-results', icon: FaClipboardList },
        { label: 'Notifications', to: '#', icon: FaBell },
    ],
    receptionist: [
        { label: 'Dashboard', to: '/receptionist', icon: FaGaugeHigh },
        { label: 'Appointments', to: '/receptionist/appointments', icon: FaCalendarCheck },
        { label: 'Tokens', to: '/receptionist/tokens', icon: FaHashtag },
        { label: 'Billing', to: '/receptionist/billing', icon: FaFileInvoiceDollar },
        { label: 'Reports', to: '/receptionist/billing/reports', icon: FaChartSimple },
        { label: 'Notifications', to: '#', icon: FaBell },
    ],
    nurse: [
        { label: 'Dashboard', to: '/nurse', icon: FaGaugeHigh },
        { label: 'Queue', to: '/nurse/queue', icon: FaBell },
        { label: 'Consultations', to: '/nurse/consultations', icon: FaClipboardList },
        { label: 'Patients', to: '/nurse/patients', icon: FaUsers },
        { label: 'Notifications', to: '#', icon: FaBell },
    ],
    admin: [
        { label: 'Dashboard', to: '/admin', icon: FaGaugeHigh },
        { label: 'Staff', to: '/admin/staff', icon: FaUserGear },
        { label: 'Reports', to: '/admin/reports', icon: FaChartSimple },
        { label: 'Access Logs', to: '/admin/audit-logs', icon: FaShieldHalved },
        { label: 'Notifications', to: '#', icon: FaBell },
    ],
    pharmacist: [
        { label: 'Dashboard', to: '/pharmacist', icon: FaGaugeHigh },
        { label: 'Prescriptions', to: '/pharmacist', icon: FaPills },
        { label: 'Notifications', to: '#', icon: FaBell },
    ],
    labTechnician: [
        { label: 'Dashboard', to: '/lab-technician', icon: FaGaugeHigh },
        { label: 'Notifications', to: '#', icon: FaBell },
    ],
    mentalHealthCounselor: [
        { label: 'Dashboard', to: '/mental-health-counselor', icon: FaGaugeHigh },
        { label: 'Mental Buddy Requests', to: '/mental-health-counselor/requests', icon: FaHeartPulse },
        { label: 'Patients', to: '/mental-health-counselor/patients', icon: FaUsers },
        { label: 'Notifications', to: '#', icon: FaBell },
    ],
    hivProfessional: [
        { label: 'Dashboard', to: '/hiv-professional', icon: FaGaugeHigh },
        { label: 'Counselling Requests', to: '/hiv-professional/requests', icon: FaShieldHeart },
        { label: 'Patients', to: '/hiv-professional/patients', icon: FaUsers },
        { label: 'Notifications', to: '#', icon: FaBell },
    ],
}

export default function AppShell({ children }) {
    const { currentUser, userRole, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [avatar, setAvatar] = useState('')
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    // Load avatar from localStorage when user changes
    useEffect(() => {
        if (!currentUser?.uid) {
            setAvatar('')
            return
        }
        try {
            const saved = localStorage.getItem(`profile_photo_${currentUser.uid}`)
            setAvatar(saved || '')
        } catch {
            setAvatar('')
        }
    }, [currentUser?.uid])

    useEffect(() => {
        if (!currentUser?.uid) {
            setUnreadCount(0)
            return
        }

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            setUnreadCount(notifications.filter((item) => !item.read).length)
        }, (error) => {
            console.error('Error fetching notifications for shell:', error)
            setUnreadCount(0)
        })

        return () => unsubscribe()
    }, [currentUser])

    const safeRole = userRole || 'student'
    const navItems = NAV_ITEMS[safeRole] || NAV_ITEMS.student
    const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const handleAvatar = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            const result = String(reader.result || '')
            setAvatar(result)
            try {
                localStorage.setItem(`profile_photo_${currentUser.uid}`, result)
            } catch {
                // ignore storage issues
            }
        }
        reader.readAsDataURL(file)
    }

    const handleOpenNotifications = () => setNotificationPanelOpen(true)
    const handleCloseNotifications = () => setNotificationPanelOpen(false)

    return (
        <div
            className="relative min-h-screen overflow-hidden bg-white px-4 py-10 text-slate-900"
            style={{
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.82), rgba(255,255,255,0.35)), url("/images/unzaclinicposter.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* App-level diagonal flag-edge overlay (students/staff after login) */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute inset-0 border-[3px] border-transparent" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.45)' }} />
                <div className="absolute inset-2 rounded-[24px] border border-white/40" />
                <div className="absolute inset-x-3 top-3 h-1 rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-sky-500 opacity-80" />
                <div className="absolute inset-x-3 bottom-3 h-1 rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-sky-500 opacity-80" />
                <div className="absolute inset-y-3 left-3 w-1 rounded-full bg-gradient-to-b from-teal-500 via-emerald-400 to-sky-500 opacity-80" />
                <div className="absolute inset-y-3 right-3 w-1 rounded-full bg-gradient-to-b from-teal-500 via-emerald-400 to-sky-500 opacity-80" />
                <div className="absolute left-0 top-0 h-full w-full" style={{ background: 'linear-gradient(135deg, transparent 0%, transparent 18%, rgba(13,148,136,0.5) 18%, rgba(13,148,136,0.5) 21%, transparent 21%, transparent 39%, rgba(16,185,129,0.5) 39%, rgba(16,185,129,0.5) 42%, transparent 42%, transparent 60%, rgba(14,165,233,0.5) 60%, rgba(14,165,233,0.5) 63%, transparent 63%)', opacity: 0.7 }} />
            </div>

            <div className="fixed inset-0 bg-white/10 backdrop-blur-[1px]" />

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Navigation Drawer */}
            <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full bg-white shadow-xl">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-teal-200 bg-teal-50 text-teal-700">
                                {avatar ? (
                                    <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <FaUser className="h-5 w-5" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-slate-900">{displayName}</div>
                                <div className="text-xs text-slate-500">Signed in</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                        >
                            <FaXmark className="h-5 w-5" />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                        {navItems.map(({ label, to, icon: Icon, profile }) => {
                            const active = location.pathname === to || (profile && location.pathname.startsWith('/student'))
                            const isNotifications = to === '#'

                            return (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => {
                                        if (isNotifications) {
                                            handleOpenNotifications()
                                            setMobileMenuOpen(false)
                                            return
                                        }
                                        navigate(to)
                                        setMobileMenuOpen(false)
                                    }}
                                    className={[
                                        'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition text-left',
                                        isNotifications
                                            ? 'border-teal-200 bg-teal-50 text-teal-700'
                                            : active
                                                ? 'border-teal-200 bg-teal-50 text-teal-700'
                                                : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                                    ].join(' ')}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{label}</span>
                                </button>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-200">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-200/80 transition hover:bg-teal-700"
                        >
                            <FaArrowRightFromBracket className="h-4 w-4" />
                            Log out
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative z-10 mx-auto flex max-w-[1600px] gap-6 px-4 py-5">
                <aside className={`sticky top-5 hidden h-[calc(100vh-2.5rem)] shrink-0 flex-col rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-lg shadow-slate-200/60 md:flex relative before:absolute before:inset-y-2 before:left-2 before:w-1 before:rounded-full before:gradient-to-b before:from-teal-500 before:via-emerald-400 before:to-sky-500 before:opacity-70 before:content-[''] transition-all duration-200 backdrop-blur-sm ${sidebarCollapsed ? 'w-24' : 'w-80'}`}>
                    <div className="mb-4 flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={() => setSidebarCollapsed((value) => !value)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {sidebarCollapsed ? '→' : '←'}
                        </button>
                    </div>

                    {!sidebarCollapsed && (
                        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-teal-200 bg-teal-50 text-teal-700">
                                {avatar ? (
                                    <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <FaUser className="h-5 w-5" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-sm text-slate-500">Signed in</div>
                                <div className="truncate text-base font-semibold text-slate-900">{displayName}</div>
                            </div>
                        </div>
                    )}

                    {!sidebarCollapsed && (
                        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Profile</div>
                            <div className="flex items-center gap-3">
                                <label className="group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-teal-200 bg-white text-teal-700 shadow-sm">
                                    {avatar ? (
                                        <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <FaUser className="h-6 w-6" />
                                    )}
                                    <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white shadow-md">+</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                                </label>
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-slate-900">{displayName}</div>
                                    <div className="text-xs text-slate-500">Profile photo</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {sidebarCollapsed ? (
                        <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
                            {navItems.map(({ to, icon: Icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    className={({ isActive }) => [
                                        'flex items-center justify-center rounded-xl border p-3 text-sm font-medium transition',
                                        isActive ? 'border-teal-200 bg-teal-50 text-teal-700' : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                                    ].join(' ')}
                                    title={navItems.find((item) => item.to === to)?.label}
                                >
                                    <Icon className="h-4 w-4" />
                                </NavLink>
                            ))}
                        </nav>
                    ) : (
                        <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
                            {navItems.map(({ label, to, icon: Icon, profile }) => {
                                const active = location.pathname === to || (profile && location.pathname.startsWith('/student'))
                                const isNotifications = to === '#'

                                return (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => {
                                            if (isNotifications) {
                                                handleOpenNotifications()
                                                return
                                            }
                                            navigate(to)
                                        }}
                                        className={[
                                            'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition text-left',
                                            isNotifications
                                                ? 'border-teal-200 bg-teal-50 text-teal-700'
                                                : active
                                                    ? 'border-teal-200 bg-teal-50 text-teal-700'
                                                    : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                                        ].join(' ')}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{label}</span>
                                    </button>
                                )
                            })}
                        </nav>
                    )}

                    <div className="mt-4 border-t border-slate-200 pt-4">
                        <button
                            onClick={handleLogout}
                            className="relative z-10 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-200/80 transition hover:bg-teal-700"
                        >
                            <FaArrowRightFromBracket className="h-4 w-4" />
                            {!sidebarCollapsed && 'Log out'}
                        </button>
                    </div>
                </aside>

                <div className="min-w-0 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 2.5rem)' }}>
                    <div className="relative rounded-[24px] border border-slate-200 bg-white/80 p-2 shadow-sm shadow-slate-200/60 backdrop-blur-sm">
                        <div className="mb-4 flex items-center justify-between md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-medium whitespace-nowrap text-teal-600 shadow-sm"
                            >
                                <FaBars className="h-4 w-4" />
                                Menu
                            </button>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-medium whitespace-nowrap text-teal-600 shadow-sm"
                            >
                                <FaArrowRightFromBracket className="h-3.5 w-3.5" />
                                Log out
                            </button>
                        </div>

                        <div className="mb-2 hidden items-center justify-end md:flex">
                            <button
                                type="button"
                                onClick={handleOpenNotifications}
                                className="relative inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold whitespace-nowrap text-teal-600 shadow-sm transition hover:bg-teal-100"
                            >
                                <FaBell className="h-3.5 w-3.5" />
                                Notifications
                                <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-bold text-white">
                                    {unreadCount}
                                </span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="ml-2 inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold whitespace-nowrap text-teal-600 shadow-sm transition hover:bg-teal-100"
                            >
                                <FaArrowRightFromBracket className="h-3.5 w-3.5" />
                                Log out
                            </button>
                        </div>

                        {children}
                    </div>
                </div>
            </div>

            <NotificationCenter open={notificationPanelOpen} onClose={handleCloseNotifications} />
            {safeRole === 'student' && <EmergencyWidget />}
        </div>
    )
}
