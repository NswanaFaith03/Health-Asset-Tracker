import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import HeaderBanner from '../../components/HeaderBanner'
import { db } from '../../firebase/config'
import { collection, doc, onSnapshot, orderBy, query, updateDoc, where, addDoc, getDoc } from 'firebase/firestore'
import { FaUser, FaClipboardList, FaBell, FaArrowRight, FaIdCard, FaBrain, FaHeartPulse, FaPhone, FaLocationDot } from 'react-icons/fa6'

export default function Student() {
    const { currentUser } = useAuth()
    const [studentId, setStudentId] = useState('')
    const [editingId, setEditingId] = useState(false)
    const [savingId, setSavingId] = useState(false)
    const [emergencyNumber, setEmergencyNumber] = useState('')
    const [copiedNumber, setCopiedNumber] = useState(false)
    const [locationStatus, setLocationStatus] = useState('')
    const [geoLoading, setGeoLoading] = useState(false)
    const [stats, setStats] = useState({
        consultations: 0,
        mentalBuddy: 0,
        hivCounselling: 0,
        pending: 0,
        notifications: 0,
        loading: true
    })
    const [recentNotifications, setRecentNotifications] = useState([])
    const [queuePanel, setQueuePanel] = useState({
        loading: true,
        queueNumber: null,
        status: '',
        hasEntry: false
    })

    useEffect(() => {
        if (!currentUser?.uid) return

        const userDocRef = doc(db, 'staffData', currentUser.uid)
        const unsubUser = onSnapshot(userDocRef, (snapshot) => {
            const data = snapshot.data() || {}
            setStudentId((data.studentId || data.studentNumber || '').trim())
        })

        const emergencySettingsRef = doc(db, 'systemSettings', 'emergencyResponse')
        const unsubEmergency = onSnapshot(emergencySettingsRef, (snapshot) => {
            const data = snapshot.data() || {}
            setEmergencyNumber(data.emergencyPhone || '')
        })

        const q = query(
            collection(db, 'appointments'),
            where('createdBy', '==', currentUser.uid)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const appointments = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
                .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
            const pending = appointments.filter((item) => item.status === 'submitted' || item.status === 'pending').length
            const mentalBuddy = appointments.filter((item) => item.appointmentType === 'mental_buddy').length
            const hivCounselling = appointments.filter((item) => item.appointmentType === 'hiv_counselling').length

            setStats({
                consultations: appointments.length,
                mentalBuddy,
                hivCounselling,
                pending,
                notifications: appointments.filter((item) => item.status === 'submitted' || item.status === 'in_progress').length,
                loading: false
            })
        }, (error) => {
            console.error('Error fetching student consultations:', error)
            setStats({ consultations: 0, mentalBuddy: 0, hivCounselling: 0, pending: 0, notifications: 0, loading: false })
        })

        const notificationQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid)
        )

        const unsubscribeNotifications = onSnapshot(notificationQuery, (snapshot) => {
            const notifications = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
                .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
            const unreadCount = notifications.filter((item) => !item.read).length

            setRecentNotifications(notifications.slice(0, 3))
            setStats((prev) => ({
                ...prev,
                notifications: unreadCount,
                loading: false
            }))
        }, (error) => {
            console.error('Error fetching student notifications:', error)
            setRecentNotifications([])
            setStats((prev) => ({ ...prev, notifications: 0, loading: false }))
        })

        return () => {
            unsubUser()
            unsubEmergency()
            unsubscribe()
            unsubscribeNotifications()
        }
    }, [currentUser])

    useEffect(() => {
        if (!studentId) {
            setQueuePanel({ loading: false, queueNumber: null, status: '', hasEntry: false })
            return
        }

        const queueQuery = query(
            collection(db, 'studentQueue'),
            where('studentId', '==', studentId),
            where('status', '!=', 'served'),
            orderBy('createdAt', 'desc')
        )

        const unsubscribeQueue = onSnapshot(queueQuery, (snapshot) => {
            const entries = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            const active = entries
                .filter((entry) => entry.status !== 'served')
                .sort((a, b) => (Number(a.queueNumber) || 99999) - (Number(b.queueNumber) || 99999))[0]

            if (!active) {
                setQueuePanel({ loading: false, queueNumber: null, status: '', hasEntry: false })
                return
            }

            setQueuePanel({
                loading: false,
                queueNumber: Number(active.queueNumber) || null,
                status: active.status || 'waiting',
                hasEntry: true
            })
        }, () => {
            setQueuePanel({ loading: false, queueNumber: null, status: '', hasEntry: false })
        })

        return () => unsubscribeQueue()
    }, [studentId])

    const handleStudentIdSave = async () => {
        if (!currentUser?.uid || !studentId.trim()) return

        setSavingId(true)
        try {
            const trimmed = studentId.trim()
            await updateDoc(doc(db, 'staffData', currentUser.uid), {
                studentId: trimmed,
                studentNumber: trimmed
            })
            setEditingId(false)
        } catch (error) {
            console.error('Error saving student ID:', error)
        } finally {
            setSavingId(false)
        }
    }

    const captureEmergencyLocation = async () => {
        if (!currentUser?.uid) return null

        setGeoLoading(true)
        setLocationStatus('Getting your location...')

        const getLocation = () => new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported in this browser'))
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    })
                },
                (error) => {
                    reject(error)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            )
        })

        try {
            const coords = await getLocation()
            const studentDoc = await getDoc(doc(db, 'staffData', currentUser.uid))
            const studentData = studentDoc.data() || {}

            const record = {
                studentId: currentUser.uid,
                studentName: studentData.fullName || currentUser.displayName || currentUser.email || 'Student',
                studentEmail: currentUser.email || '',
                emergencyPhone: emergencyNumber || '',
                coordinates: coords,
                status: 'logged',
                createdAt: new Date().toISOString(),
                source: 'web_app'
            }

            await addDoc(collection(db, 'emergencyAlerts'), record)
            setLocationStatus('Location shared with emergency desk.')
            return coords
        } catch (error) {
            console.error('Error capturing emergency location:', error)
            setLocationStatus('Location unavailable — emergency call still attempted.')
            return null
        } finally {
            setGeoLoading(false)
        }
    }

    const handleEmergencyCall = async () => {
        if (!emergencyNumber) {
            alert('The emergency number has not been configured by the admin yet.')
            return
        }

        const coordinates = await captureEmergencyLocation()

        const cleanNumber = emergencyNumber.replace(/\s+/g, '')
        const telHref = `tel:${cleanNumber}`

        if (window && typeof window !== 'undefined') {
            try {
                window.location.href = telHref
            } catch (error) {
                console.error('Emergency call failed:', error)
            }
        }

        if (coordinates) {
            console.log('Emergency coordinates captured before call:', coordinates)
        }
    }

    const handleEmergencyCopy = async () => {
        try {
            await navigator.clipboard.writeText(emergencyNumber)
            setCopiedNumber(true)
            setTimeout(() => setCopiedNumber(false), 1800)
        } catch (error) {
            console.error('Could not copy emergency number:', error)
        }
    }

    return (
        <div className="text-slate-900">
            <HeaderBanner title="Student Health Portal" subtitle={`Welcome, ${currentUser?.displayName || currentUser?.email || 'Student'}`} icon={FaUser} image="/images/students.jpg" />

            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-8 rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-teal-700">Emergency Support</p>
                            <h2 className="mt-2 text-xl font-bold text-slate-900">Need urgent help?</h2>
                            <p className="mt-1 text-sm text-slate-700">Call the student emergency desk immediately for medical or crisis support.</p>
                            {locationStatus && (
                                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-teal-700">
                                    <FaLocationDot className="h-3.5 w-3.5" />
                                    {geoLoading ? 'Locating...' : locationStatus}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={handleEmergencyCall}
                                disabled={!emergencyNumber || geoLoading}
                                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-200 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                aria-label="Call student emergency number"
                            >
                                <FaPhone className="mr-2 h-4 w-4" />
                                {geoLoading ? 'Locating...' : emergencyNumber ? `Call ${emergencyNumber}` : 'No number set'}
                            </button>
                            <button
                                type="button"
                                onClick={handleEmergencyCopy}
                                disabled={!emergencyNumber}
                                className="inline-flex items-center justify-center rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {copiedNumber ? 'Copied' : 'Copy number'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-700">Student Account</p>
                            <h2 className="mt-2 text-xl font-bold text-slate-900">Your clinic access</h2>
                        </div>
                        <div className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                            Active Portal
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-3 flex items-center gap-3">
                                <div className="rounded-xl bg-teal-100 p-3 text-teal-700">
                                    <FaIdCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Student ID</p>
                                    <p className="text-sm text-slate-700">Use this ID for clinic access and queue tracking</p>
                                </div>
                            </div>

                            {editingId ? (
                                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                    <input
                                        type="text"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none transition"
                                        placeholder="e.g. STU-2025-001"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleStudentIdSave}
                                        disabled={savingId}
                                        className="rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {savingId ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
                                    <div className="font-semibold text-slate-900">{studentId || 'Not set yet'}</div>
                                    <button
                                        type="button"
                                        onClick={() => setEditingId(true)}
                                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 transition"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quick Summary</p>
                            <div className="mt-4 space-y-3 text-sm text-slate-700">
                                <div className="flex items-center justify-between">
                                    <span>Queue panel</span>
                                    {queuePanel.loading ? (
                                        <span className="font-bold text-slate-900">Loading...</span>
                                    ) : queuePanel.hasEntry ? (
                                        <span className="font-bold text-slate-900">#{queuePanel.queueNumber || '-'} • {queuePanel.status}</span>
                                    ) : (
                                        <span className="font-bold text-slate-900">Not in queue</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Pending requests</span>
                                    <span className="font-bold text-slate-900">{stats.loading ? '...' : stats.pending}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Lab tracking</span>
                                    <span className="font-bold text-slate-900"><Link to="/student/lab-requests" className="text-sky-700 hover:underline">Open</Link></span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Consultation queue</span>
                                    <span className="font-bold text-slate-900"><Link to="/student/queue" className="text-sky-700 hover:underline">View</Link></span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Profile</span>
                                    <span className="font-bold text-slate-900"><Link to="/student/profile" className="text-sky-700 hover:underline">View</Link></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8 grid gap-5 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <FaClipboardList className="h-5 w-5 text-teal-600" />
                            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Consultations</span>
                        </div>
                        <div className="text-4xl font-bold text-slate-900">{stats.loading ? '...' : stats.consultations}</div>
                        <p className="mt-3 text-sm text-slate-600">Total submitted or active requests</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <FaBrain className="h-5 w-5 text-violet-600" />
                            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Mental buddy</span>
                        </div>
                        <div className="text-4xl font-bold text-slate-900">{stats.loading ? '...' : stats.mentalBuddy}</div>
                        <p className="mt-3 text-sm text-slate-600">Sessions started with counselor</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <FaHeartPulse className="h-5 w-5 text-rose-600" />
                            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">HIV</span>
                        </div>
                        <div className="text-4xl font-bold text-slate-900">{stats.loading ? '...' : stats.hivCounselling}</div>
                        <p className="mt-3 text-sm text-slate-600">Support sessions and check-ins</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <FaBell className="h-5 w-5 text-amber-600" />
                            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Alerts</span>
                        </div>
                        <div className="text-4xl font-bold text-slate-900">{stats.loading ? '...' : stats.notifications}</div>
                        <p className="mt-3 text-sm text-slate-600">Active updates and queue statuses</p>
                    </div>
                </div>

                <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-700">Recent alerts</p>
                            <h3 className="mt-2 text-xl font-bold text-slate-900">Latest clinic updates</h3>
                        </div>
                        <Link to="/student/notifications" className="text-sm font-semibold text-sky-700 hover:underline">
                            View all
                        </Link>
                    </div>

                    {recentNotifications.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                            No notifications yet. You will see doctor and lab updates here.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentNotifications.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="mt-0.5 rounded-xl bg-amber-100 p-2 text-amber-700">
                                        <FaBell className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-semibold text-slate-900">{item.title || 'Clinic update'}</p>
                                            {!item.read && (
                                                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just now'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Link to="/student/consultations" className="rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm transition hover:border-sky-300 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Consultation hub</h3>
                            <FaArrowRight className="h-4 w-4 text-sky-700" />
                        </div>
                        <p className="mt-3 text-sm text-slate-600">Schedule visits, track submissions, and review your health records.</p>
                    </Link>

                    <Link to="/student/profile" className="rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm transition hover:border-violet-300 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">My profile</h3>
                            <FaArrowRight className="h-4 w-4 text-violet-700" />
                        </div>
                        <p className="mt-3 text-sm text-slate-600">Manage your details, student ID, and clinic preferences.</p>
                    </Link>
                </div>
            </main>
        </div>
    )
}
