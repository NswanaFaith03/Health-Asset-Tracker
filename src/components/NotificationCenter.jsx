import { useEffect, useMemo, useState } from 'react'
import { Bell, CheckCheck, X, Clock, FileText, FlaskConical, Stethoscope } from 'lucide-react'
import { collection, doc, getDoc, onSnapshot, orderBy, query, updateDoc, deleteDoc, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { generateLabMedicalReportPDF } from '../utils/labReportGenerator'

const typeMeta = {
    lab_request: { label: 'Lab request', icon: FlaskConical, tone: 'bg-teal-100 text-teal-700' },
    lab_report: { label: 'Lab report', icon: FileText, tone: 'bg-emerald-100 text-emerald-700' },
    prescription: { label: 'Prescription', icon: Stethoscope, tone: 'bg-violet-100 text-violet-700' },
    information_request: { label: 'Update requested', icon: Bell, tone: 'bg-amber-100 text-amber-700' },
    default: { label: 'Notice', icon: Clock, tone: 'bg-slate-100 text-slate-700' }
}

export default function NotificationCenter({ open = false, onClose = () => { } }) {
    const { currentUser } = useAuth()
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [notificationError, setNotificationError] = useState('')

    useEffect(() => {
        if (!currentUser?.uid || !open) return

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            setNotifications(items)
            setNotificationError('')
            setLoading(false)
        }, (error) => {
            console.error('Error fetching notifications:', error)
            setNotifications([])
            setNotificationError(`Unable to load notifications: ${error?.message || 'Unknown error'}`)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [currentUser, open])

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

    const markAllAsRead = async () => {
        const unread = notifications.filter((item) => !item.read)
        for (const notification of unread) {
            try {
                await updateDoc(doc(db, 'notifications', notification.id), {
                    read: true,
                    readAt: new Date().toISOString()
                })
            } catch (error) {
                console.error('Error marking notification as read:', error)
            }
        }
    }

    const deleteNotification = async (notificationId) => {
        if (!notificationId) return

        try {
            await deleteDoc(doc(db, 'notifications', notificationId))
        } catch (error) {
            console.error('Error deleting notification:', error)
        }
    }

    const handleOpenNotification = async (notification) => {
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
                onClose()
                return
            }

            if (notification.type === 'lab_request' || notification.type === 'prescription' || notification.type === 'information_request') {
                navigate('/student/lab-requests')
                return
            }

            onClose()
        } catch (error) {
            console.error('Error opening notification:', error)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm">
            <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-teal-100 p-2 text-teal-700">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{unreadCount} unread</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 text-xs"
                                aria-label="Mark all as read"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100"
                            aria-label="Close notifications"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                            Loading notifications...
                        </div>
                    ) : notificationError ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                            {notificationError}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                            No notifications yet. New clinic updates will appear here.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification) => {
                                const meta = typeMeta[notification.type] || typeMeta.default

                                return (
                                    <div
                                        key={notification.id}
                                        className={`rounded-2xl border p-4 ${notification.read ? 'border-slate-200 bg-white' : 'border-teal-200 bg-teal-50/80'}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className={`rounded-xl p-2 ${meta.tone}`}>
                                                    <meta.icon className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-slate-900">{notification.title || meta.label}</p>
                                                        {!notification.read && (
                                                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-red-700">
                                                                New
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-sm leading-6 text-slate-700">{notification.message}</p>
                                                    <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                                        {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {!notification.read && (
                                                    <button
                                                        type="button"
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                                                    >
                                                        <CheckCheck className="h-3.5 w-3.5" />
                                                        Mark read
                                                    </button>
                                                )}
                                                {(notification.type === 'lab_report' || notification.type === 'lab_request' || notification.type === 'prescription' || notification.type === 'information_request') && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenNotification(notification)}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                                    >
                                                        {notification.type === 'lab_report' ? 'Open PDF' : 'Open'}
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
