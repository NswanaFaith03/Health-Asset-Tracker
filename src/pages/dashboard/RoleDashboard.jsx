import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getRoleMeta, getRoleRoute } from '../../config/roles'
import { collection, query, where, onSnapshot, doc, setDoc, orderBy, limit } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db } from '../../firebase/config'
import { FaUsers, FaUserCheck, FaClipboardList, FaFilePdf, FaShieldHalved, FaArrowRight, FaChartLine, FaBell, FaPhone, FaLocationDot, FaClock } from 'react-icons/fa6'

const overviewStats = {
    student: ['Active consultations', 'Pending prescriptions', 'Unread notifications'],
    doctor: ['Today’s consultations', 'Pending reviews', 'Queue size'],
    pharmacist: ['Pending prescriptions', 'Dispensed today', 'Fulfillment rate'],
    labTechnician: ['Pending tests', 'Completed tests', 'Result uploads'],
    nurse: ['Queue activity', 'Consultations created', 'Patient search'],
    mentalHealthCounselor: ['Session requests', 'Assigned patients', 'New messages'],
    hivProfessional: ['HIV sessions', 'Accepted cases', 'Resources accessed'],
    receptionist: ['Frontend queue', 'Appointments', 'Billing activity'],
    admin: ['Total users', 'Consultations', 'Audit activity']
}

export default function RoleDashboard() {
    const { currentUser, userRole } = useAuth()
    const activeRole = userRole || 'student'
    const roleMeta = getRoleMeta(activeRole)
    const stats = overviewStats[activeRole] || overviewStats.student

    const [counts, setCounts] = useState([0, 0, 0])
    const [adminStats, setAdminStats] = useState({
        staff: 0,
        pendingApprovals: 0,
        consultations: 0,
        auditLogs: 0,
        queue: 0
    })
    const [emergencyPhone, setEmergencyPhone] = useState('')
    const [emergencyPhoneInput, setEmergencyPhoneInput] = useState('')
    const [emergencySaving, setEmergencySaving] = useState(false)
    const [emergencyError, setEmergencyError] = useState('')
    const [emergencyAlerts, setEmergencyAlerts] = useState([])

    useEffect(() => {
        if (!currentUser) return

        const unsubscribes = []

        const today = new Date().toISOString().split('T')[0]

        const listen = (q, idx, transform) => {
            const unsub = onSnapshot(q, (snap) => {
                const value = typeof transform === 'function' ? transform(snap) : snap.docs.length
                setCounts(prev => {
                    const next = [...prev]
                    next[idx] = value
                    return next
                })
            }, (err) => {
                console.error('Dashboard stat listener error:', err)
            })
            unsubscribes.push(unsub)
        }

        if (activeRole === 'doctor') {
            // Today's appointments (only unresolved: exclude completed/cancelled/rejected)
            listen(query(collection(db, 'appointments'), where('appointmentDate', '==', today), where('doctorId', '==', currentUser.uid)), 0, (snap) => {
                try { console.debug('Doctor today appointments snap:', snap.docs.map(d => ({ id: d.id, status: d.data().status }))) } catch (e) { }
                return snap.docs.filter(d => {
                    const s = (d.data().status || '').toLowerCase()
                    return !['completed', 'cancelled', 'rejected'].includes(s)
                }).length
            })
            // Pending prescriptions for this doctor
            listen(query(collection(db, 'prescriptions'), where('doctorId', '==', currentUser.uid), where('status', '==', 'pending')), 1)
            // Queue count (token_generated or in_progress)
            listen(query(collection(db, 'appointments'), where('appointmentDate', '==', today), where('doctorId', '==', currentUser.uid)), 2, (snap) => {
                // Debug: log appointment ids and statuses counted by dashboard
                try { console.debug('Dashboard queue snap docs:', snap.docs.map(d => ({ id: d.id, status: d.data().status }))) } catch (e) { }
                return snap.docs.filter(d => {
                    const s = (d.data().status || '').toLowerCase()
                    return s === 'token_generated' || s === 'in_progress'
                }).length
            })
        } else if (activeRole === 'receptionist') {
            listen(query(collection(db, 'appointments'), where('appointmentDate', '==', today)), 0, (snap) => snap.docs.filter(d => {
                const s = d.data().status
                return s === 'token_generated' || s === 'in_progress'
            }).length)
            listen(query(collection(db, 'appointments'), where('appointmentDate', '==', today)), 1)
            listen(query(collection(db, 'invoices')), 2)
        } else if (activeRole === 'admin') {
            const staffRef = collection(db, 'staffData')
            const studentRef = collection(db, 'staffData')
            const apptRef = collection(db, 'appointments')
            const auditRef = collection(db, 'auditLogs')
            const emergencyRef = doc(db, 'systemSettings', 'emergencyResponse')
            const emergencyAlertsRef = query(collection(db, 'emergencyAlerts'), orderBy('createdAt', 'desc'), limit(20))

            const settingsUnsub = onSnapshot(emergencyRef, (snap) => {
                const data = snap.data() || {}
                const value = data.emergencyPhone || ''
                setEmergencyPhone(value)
                setEmergencyPhoneInput(value)
            })

            const alertsUnsub = onSnapshot(emergencyAlertsRef, (snap) => {
                const records = snap.docs.map(docSnap => ({
                    id: docSnap.id,
                    ...docSnap.data(),
                    createdAtLabel: docSnap.data().createdAt ? new Date(docSnap.data().createdAt).toLocaleString() : 'Unknown time'
                }))
                setEmergencyAlerts(records)
            }, (err) => {
                // Suppress permission-denied errors in development
                if (err.code !== 'permission-denied') {
                    console.error('Emergency alerts listener error:', err)
                }
            })

            const staffUnsub = onSnapshot(staffRef, (snap) => {
                const staffOnly = snap.docs.filter(d => d.data().role !== 'student').length
                setAdminStats(prev => ({ ...prev, staff: staffOnly }))
            })

            const pendingUnsub = onSnapshot(studentRef, (snap) => {
                const pending = snap.docs.filter(d => d.data().role === 'student' && d.data().approved !== true).length
                setAdminStats(prev => ({ ...prev, pendingApprovals: pending }))
            })

            const consultationUnsub = onSnapshot(apptRef, (snap) => {
                setAdminStats(prev => ({ ...prev, consultations: snap.docs.length }))
            })

            const auditUnsub = onSnapshot(auditRef, (snap) => {
                setAdminStats(prev => ({ ...prev, auditLogs: snap.docs.length }))
            })

            const queueUnsub = onSnapshot(apptRef, (snap) => {
                const queueCount = snap.docs.filter(d => {
                    const s = d.data().status
                    return s === 'token_generated' || s === 'in_progress'
                }).length
                setAdminStats(prev => ({ ...prev, queue: queueCount }))
            })

            unsubscribes.push(settingsUnsub, alertsUnsub, staffUnsub, pendingUnsub, consultationUnsub, auditUnsub, queueUnsub)
        } else if (activeRole === 'labTechnician') {
            listen(query(collection(db, 'labRequests'), where('status', '==', 'pending')), 0)
            listen(query(collection(db, 'labRequests'), where('status', '==', 'completed')), 1)
            listen(query(collection(db, 'labReports')), 2)
        } else {
            listen(query(collection(db, 'appointments'), where('appointmentDate', '==', today)), 0)
            listen(query(collection(db, 'prescriptions'), where('prescriptionDate', '==', today)), 1)
            listen(query(collection(db, 'notifications'), where('userId', '==', currentUser.uid)), 2)
        }

        return () => unsubscribes.forEach(u => u && u())
    }, [activeRole, currentUser])

    const adminMetricCards = [
        { label: 'Staff Accounts', value: adminStats.staff, icon: FaUsers, accent: 'text-slate-900', bg: 'bg-slate-100', href: '/admin/staff' },
        { label: 'Pending Approvals', value: adminStats.pendingApprovals, icon: FaUserCheck, accent: 'text-emerald-700', bg: 'bg-emerald-50', href: '/admin/staff' },
        { label: 'Consultations', value: adminStats.consultations, icon: FaClipboardList, accent: 'text-slate-900', bg: 'bg-slate-100', href: '/doctor/consultations' },
        { label: 'Queue Activity', value: adminStats.queue, icon: FaBell, accent: 'text-emerald-700', bg: 'bg-emerald-50', href: '/receptionist/tokens' }
    ]

    const adminActions = [
        { label: 'Staff management', description: 'Create, review, and deactivate staff accounts.', href: '/admin/staff', icon: FaUsers, iconBg: 'bg-emerald-50', iconTone: 'text-emerald-700' },
        { label: 'Reports', description: 'View and download comprehensive system reports in PDF format.', href: '/admin/reports', icon: FaChartLine, iconBg: 'bg-slate-100', iconTone: 'text-slate-900' },
        { label: 'Audit log', description: 'Review system activity and approval history.', href: '/admin', icon: FaShieldHalved, iconBg: 'bg-emerald-50', iconTone: 'text-emerald-700' },
        { label: 'Operational overview', description: 'Monitor consultations, queue flow, and service activity.', href: '/receptionist', icon: FaChartLine, iconBg: 'bg-slate-100', iconTone: 'text-slate-900' }
    ]

    const handleEmergencyPhoneSave = async (event) => {
        event.preventDefault()
        if (!currentUser || !emergencyPhoneInput.trim()) return

        const cleanPhone = emergencyPhoneInput.replace(/\s+/g, '')

        setEmergencySaving(true)
        setEmergencyError('')
        try {
            await setDoc(doc(db, 'systemSettings', 'emergencyResponse'), {
                emergencyPhone: cleanPhone,
                updatedBy: currentUser.uid,
                updatedByName: currentUser.displayName || currentUser.email || 'Admin',
                updatedAt: new Date().toISOString()
            }, { merge: true })
            setEmergencyPhone(cleanPhone)
            toast.success('Emergency number saved')
        } catch (error) {
            console.error('Error saving emergency phone:', error)
            setEmergencyError(String(error.message || error))
            toast.error('Failed to save emergency number')
        } finally {
            setEmergencySaving(false)
        }
    }

    return (
        <div className="text-slate-900">
            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{activeRole === 'admin' ? 'Admin Dashboard' : `${roleMeta.label} Dashboard`}</h1>
                        <p className="mt-2 max-w-2xl text-slate-600">{activeRole === 'admin' ? 'Monitor all system activity, staff, patient flow, billing, and approval operations from one place.' : roleMeta.description}</p>
                    </div>
                </div>

                {activeRole === 'admin' ? (
                    <>
                        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {adminMetricCards.map(({ label, value, icon: Icon, accent, bg, href }) => (
                                <Link key={label} to={href} className={`${bg} rounded-2xl border border-slate-200 p-5 transition hover:border-emerald-200 hover:bg-emerald-50`}>
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className={`rounded-xl ${bg} p-2`}>
                                            <Icon className={`h-5 w-5 ${accent}`} />
                                        </div>
                                        <FaArrowRight className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900">{value}</div>
                                    <div className="mt-2 text-sm text-slate-600">{label}</div>
                                </Link>
                            ))}
                        </div>

                        <div className="mb-8 grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-sm">
                                <div className="mb-4 flex items-center gap-3 text-teal-700">
                                    <FaPhone className="h-5 w-5" />
                                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">Emergency number</span>
                                </div>
                                <form onSubmit={handleEmergencyPhoneSave} className="space-y-4">
                                    <label className="block text-sm font-medium text-slate-700">
                                        Hotline receiving student emergency calls
                                        <input
                                            type="tel"
                                            value={emergencyPhoneInput}
                                            onChange={(event) => setEmergencyPhoneInput(event.target.value)}
                                            placeholder="e.g. +260977123456"
                                            className="mt-2 w-full rounded-xl border border-teal-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                                        />
                                    </label>
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-sm text-slate-600">Current: {emergencyPhone || 'Not configured yet'}</div>
                                        <button
                                            type="submit"
                                            disabled={emergencySaving || !emergencyPhoneInput.trim()}
                                            className="rounded-xl bg-[#a8d9a3] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7fc792] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {emergencySaving ? 'Saving...' : 'Save number'}
                                        </button>
                                    </div>
                                    {emergencyError && (
                                        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{emergencyError}</div>
                                    )}
                                </form>
                            </div>

                            <Link to="/admin/reports" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer">
                                <div className="mb-3 flex items-center gap-3 text-slate-900">
                                    <FaFilePdf className="h-5 w-5 text-emerald-600" />
                                    <span className="text-sm uppercase tracking-wide text-slate-900">Reports</span>
                                    <FaArrowRight className="h-4 w-4 text-slate-400 ml-auto" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900">Generate</div>
                                <div className="mt-2 text-sm text-slate-500">View and download system reports</div>
                            </Link>
                        </div>

                        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-3 flex items-center gap-3 text-slate-900">
                                    <FaShieldHalved className="h-5 w-5" />
                                    <span className="text-sm uppercase tracking-wide text-slate-900">Audit Activity</span>
                                </div>
                                <div className="text-3xl font-bold text-slate-900">{adminStats.auditLogs}</div>
                                <div className="mt-2 text-sm text-slate-500">Security, approval, and operational events logged</div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-3 flex items-center gap-3 text-emerald-700">
                                    <FaUserCheck className="h-5 w-5" />
                                    <span className="text-sm uppercase tracking-wide text-slate-900">Approvals</span>
                                </div>
                                <div className="text-3xl font-bold text-slate-900">{adminStats.pendingApprovals}</div>
                                <div className="mt-2 text-sm text-slate-500">Student registrations awaiting review</div>
                            </div>
                        </div>

                        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">Emergency call log</h2>
                                    <p className="mt-1 text-sm text-slate-600">Student-triggered emergency calls with location details captured before dialing.</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead>
                                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            <th className="pb-3 pr-4">Student</th>
                                            <th className="pb-3 pr-4">Emergency line</th>
                                            <th className="pb-3 pr-4">Coordinates</th>
                                            <th className="pb-3 pr-4">Time</th>
                                            <th className="pb-3 pr-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {emergencyAlerts.length > 0 ? emergencyAlerts.map((alert) => {
                                            const coords = alert.coordinates || {}
                                            const coordinatesText = coords.latitude !== undefined && coords.longitude !== undefined
                                                ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
                                                : 'Location unavailable'

                                            return (
                                                <tr key={alert.id} className="align-top text-sm text-slate-700">
                                                    <td className="py-3 pr-4">
                                                        <div className="font-semibold text-slate-900">{alert.studentName || alert.studentEmail || 'Unknown student'}</div>
                                                        <div className="text-xs text-slate-500">{alert.studentEmail || 'No email recorded'}</div>
                                                    </td>
                                                    <td className="py-3 pr-4 font-medium text-teal-700">{alert.emergencyPhone || 'Not set'}</td>
                                                    <td className="py-3 pr-4">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <FaLocationDot className="h-3.5 w-3.5 text-slate-900" />
                                                            <span>{coordinatesText}</span>
                                                        </div>
                                                        {coords.accuracy ? <div className="mt-1 text-xs text-slate-500">Accuracy: ±{Math.round(coords.accuracy)}m</div> : null}
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <div className="flex items-center gap-2">
                                                            <FaClock className="h-3.5 w-3.5 text-slate-400" />
                                                            <span>{alert.createdAtLabel || 'Unknown'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-700">{alert.status || 'logged'}</span>
                                                    </td>
                                                </tr>
                                            )
                                        }) : (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-sm text-slate-500">
                                                    No emergency calls have been logged yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-slate-900">Admin use cases</h2>
                                <Link to="/admin/staff" className="rounded-xl bg-[#a8d9a3] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#7fc792]">
                                    Manage staff
                                </Link>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {adminActions.map(({ label, description, href, icon: Icon, iconBg, iconTone }) => (
                                    <Link key={label} to={href} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50">
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className={`rounded-xl ${iconBg} p-2 ${iconTone}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <FaArrowRight className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div className="text-lg font-semibold text-slate-900">{label}</div>
                                        <div className="mt-2 text-sm text-slate-600">{description}</div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            {stats.map((stat, index) => (
                                <div key={stat} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="text-sm text-slate-500">Metric {index + 1}</div>
                                    <div className="mt-3 text-2xl font-bold text-slate-900">{counts[index] ?? '—'}</div>
                                    <div className="mt-2 text-slate-600">{stat}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
