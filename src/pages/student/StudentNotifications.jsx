import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, doc, getDoc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'
import { ArrowLeft, Bell, CheckCheck, FileText, FlaskConical, Stethoscope } from 'lucide-react'
import { generateLabMedicalReportPDF } from '../../utils/labReportGenerator'

const typeMeta = {
    lab_request: { label: 'Lab request', icon: FlaskConical, tone: 'bg-teal-100 text-teal-700' },
    lab_report: { label: 'Lab report', icon: FileText, tone: 'bg-emerald-100 text-emerald-700' },
    prescription: { label: 'Prescription', icon: Stethoscope, tone: 'bg-violet-100 text-violet-700' },
    information_request: { label: 'Update requested', icon: Bell, tone: 'bg-amber-100 text-amber-700' },
    counselling_request: { label: 'Counselling', icon: Bell, tone: 'bg-violet-100 text-violet-700' },
    counselling_accepted: { label: 'Counselling', icon: Bell, tone: 'bg-emerald-100 text-emerald-700' },
    counselling_message: { label: 'Counselling chat', icon: Bell, tone: 'bg-sky-100 text-sky-700' },
    counselling_closed: { label: 'Counselling', icon: Bell, tone: 'bg-slate-100 text-slate-700' },
    default: { label: 'Notice', icon: Bell, tone: 'bg-slate-100 text-slate-700' }
}

export default function StudentNotifications() {
    const { currentUser } = useAuth()
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!currentUser?.uid) return

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            setNotifications(items)
            setLoading(false)
        }, (error) => {
            console.error('Error fetching notifications:', error)
            setNotifications([])
            setLoading(false)
        })

        return () => unsubscribe()
    }, [currentUser])

    const unreadCount = useMemo(
        () => notifications.filter((item) => !item.read).length,
        [notifications]
    )

    const markAsRead = async (notificationId) => {
        if (!notificationId) return

        try {
            await updateDoc(doc(db, 'notifications', notificationId), {
                read: true,
                readAt: new Date().toISOString()
            })
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const handleNotificationAction = async (notification) => {
        if (!notification) return

        try {
            await updateDoc(doc(db, 'notifications', notification.id), {
                read: true,
                readAt: new Date().toISOString()
            })

            if (notification.type === 'lab_report' && notification.reportId) {
                const reportSnapshot = await getDoc(doc(db, 'labReports', notification.reportId))
                if (!reportSnapshot.exists()) {
                    window.alert('Medical report not found. Please try again later.')
                    return
                }

                const reportData = reportSnapshot.data()
                const pdf = await generateLabMedicalReportPDF(reportData)
                const fileName = `${(reportData?.request?.studentName || reportData?.studentName || 'student').replace(/\s+/g, '_')}_medical_report.pdf`

                try {
                    const pdfBlob = pdf.output('blob')
                    const pdfUrl = URL.createObjectURL(pdfBlob)
                    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
                    setTimeout(() => URL.revokeObjectURL(pdfUrl), 15000)
                } catch (openError) {
                    console.warn('Notification PDF open failed, fallback to save:', openError)
                    pdf.save(fileName)
                }
                return
            }

            if (notification.type === 'lab_request' || notification.type === 'prescription' || notification.type === 'information_request') {
                window.location.href = '/student/lab-requests'
                return
            }

            const counsellingTypes = ['counselling_request', 'counselling_accepted', 'counselling_message', 'counselling_closed']
            if (counsellingTypes.includes(notification.type) && notification.relatedId) {
                const sessionSnap = await getDoc(doc(db, 'counsellingSessions', notification.relatedId))
                if (sessionSnap.exists()) {
                    const appointmentId = sessionSnap.data()?.appointmentId
                    if (appointmentId) {
                        navigate(`/student/session/${appointmentId}`)
                        return
                    }
                }

                navigate(`/student/session/${notification.relatedId}`)
            }
        } catch (error) {
            console.error('Error handling notification action:', error)
        }
    }

    return (
        <div className="text-slate-900">
            <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link to="/student" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-teal-200 hover:bg-teal-50">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
                            <p className="text-sm text-slate-500">Your latest updates from the clinic</p>
                        </div>
                    </div>
                    <div className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                        {unreadCount} unread
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-8">
                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                        Loading your notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                        No notifications yet. New clinic updates will appear here.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => {
                            const meta = typeMeta[notification.type] || typeMeta.default
                            const Icon = meta.icon

                            return (
                                <div
                                    key={notification.id}
                                    className={`rounded-3xl border p-5 shadow-sm ${notification.read ? 'border-slate-200 bg-white' : 'border-teal-200 bg-teal-50/80'}`}
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className={`rounded-2xl p-2.5 ${meta.tone}`}>
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-base font-bold text-slate-900">{notification.title || meta.label}</h2>
                                                    {!notification.read && (
                                                        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-2 text-sm leading-6 text-slate-700">{notification.message}</p>
                                                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                                                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Recent'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 md:flex-row">
                                            {!notification.read && (
                                                <button
                                                    type="button"
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50"
                                                >
                                                    <CheckCheck className="h-4 w-4" />
                                                    Mark read
                                                </button>
                                            )}
                                            {(notification.type === 'lab_report' || notification.type === 'lab_request' || notification.type === 'prescription' || notification.type === 'information_request' || ['counselling_request', 'counselling_accepted', 'counselling_message', 'counselling_closed'].includes(notification.type)) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleNotificationAction(notification)}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                                                >
                                                    {notification.type === 'lab_report' ? 'Open PDF' : notification.type?.startsWith('counselling') ? 'Open chat' : 'Open'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
