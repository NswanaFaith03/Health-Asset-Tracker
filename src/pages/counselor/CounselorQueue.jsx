import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'
import { declineCounsellingRequest } from '../../utils/consultationUtils'
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock3,
    FileText,
    HeartHandshake,
    ShieldCheck,
    UserRound,
    XCircle
} from 'lucide-react'

const ROLE_CONFIG = {
    mentalHealthCounselor: {
        label: 'Mental Health Counselor',
        appointmentType: 'mental_buddy',
        description: 'Open a chat to respond to student requests',
        accent: 'rose'
    },
    hivProfessional: {
        label: 'HIV Professional',
        appointmentType: 'hiv_counselling',
        description: 'Open a chat to respond to HIV counselling requests',
        accent: 'emerald'
    }
}

const statusStyles = {
    submitted: 'bg-sky-50 text-sky-700 border border-sky-200',
    in_review: 'bg-amber-50 text-amber-700 border border-amber-200',
    accepted: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    completed: 'bg-violet-50 text-violet-700 border border-violet-200',
    rejected: 'bg-rose-50 text-rose-700 border border-rose-200',
    cancelled: 'bg-slate-100 text-slate-700 border border-slate-200',
    scheduled: 'bg-teal-50 text-teal-700 border border-teal-200'
}

export default function CounselorQueue({ role = 'mentalHealthCounselor', view = 'requests' }) {
    const { currentUser } = useAuth()
    const [requests, setRequests] = useState([])
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState(null)

    const config = ROLE_CONFIG[role] || ROLE_CONFIG.mentalHealthCounselor

    useEffect(() => {
        if (!currentUser?.uid) return

        const q = query(
            collection(db, 'appointments'),
            where('appointmentType', '==', config.appointmentType),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            setRequests(items)
            setLoading(false)
        }, (error) => {
            console.error('Error fetching counselor queue:', error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [config.appointmentType, currentUser])

    const visibleRequests = useMemo(() => {
        let filtered = requests

        // If viewing patients page, show only accepted/in-progress/completed sessions
        if (view === 'patients') {
            filtered = requests.filter((item) => ['accepted', 'in_progress', 'in_review', 'completed'].includes(item.status || ''))
        }

        if (selectedStatus === 'all') return filtered
        return filtered.filter((item) => (item.status || 'submitted') === selectedStatus)
    }, [requests, selectedStatus, view])

    const handleDecline = async (request) => {
        try {
            setUpdatingId(request.id)
            await declineCounsellingRequest({
                appointmentId: request.id,
                sessionId: request.counsellingSessionId || '',
                studentUid: request.createdBy || '',
                counselorName: currentUser.displayName || currentUser.email || 'Counselor',
                appointmentType: request.appointmentType
            })
        } catch (error) {
            console.error('Error declining counselor request:', error)
        } finally {
            setUpdatingId(null)
        }
    }

    const statusOptions = [
        { value: 'all', label: 'All' },
        { value: 'submitted', label: 'Waiting' },
        { value: 'accepted', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'rejected', label: 'Declined' }
    ]

    return (
        <div className="text-slate-900">
            <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{config.label}</h1>
                            <p className="text-sm text-slate-500">{config.description}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">
                <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                            <button
                                key={status.value}
                                type="button"
                                onClick={() => setSelectedStatus(status.value)}
                                className={`rounded-lg px-3.5 py-2 text-xs font-medium capitalize transition ${selectedStatus === status.value
                                    ? 'bg-sky-600 text-white'
                                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-slate-600 text-sm">
                        Loading requests...
                    </div>
                ) : visibleRequests.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="relative w-16 h-16">
                                <HeartHandshake className="w-16 h-16 text-slate-400 animate-pulse" />
                            </div>
                        </div>
                        <div className="text-slate-800 text-lg font-medium mb-2">No Requests Available</div>
                        <div className="text-slate-500 text-sm max-w-md">
                            {selectedStatus === 'all'
                                ? 'No requests at this time. Students will appear here when they request counselling.'
                                : 'No requests match this filter.'}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {visibleRequests.map((request) => {
                            const isAnonymous = !!request.anonymousChat
                            const studentLabel = isAnonymous ? 'Anonymous student' : (request.patientName || 'Student')
                            const hiddenIdentityNote = isAnonymous ? 'Anonymous session' : 'Identity visible'
                            const requestStatus = request.status || 'submitted'
                            const canDecline = requestStatus === 'submitted'
                            const sessionPath = `/${role === 'hivProfessional' ? 'hiv-professional' : 'mental-health-counselor'}/session/${request.id}`

                            return (
                                <div key={request.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                <UserRound className="h-4 w-4 text-sky-500" />
                                                <span className="font-medium">{studentLabel}</span>
                                            </div>
                                            <div className="mt-2 text-lg font-semibold text-slate-900">{request.studentNumber || '—'}</div>
                                        </div>

                                        <div className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize ${statusStyles[request.status || 'submitted'] || statusStyles.submitted}`}>
                                            {request.status === 'in_review' ? <Clock3 className="h-3.5 w-3.5" /> : request.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : request.status === 'rejected' ? <XCircle className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                                            {(request.status || 'submitted').replace('_', ' ')}
                                        </div>
                                    </div>

                                    <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                                <HeartHandshake className="h-3.5 w-3.5 text-rose-500" />
                                                Type
                                            </div>
                                            <div className="text-sm font-medium capitalize text-slate-900">{request.appointmentType === 'mental_buddy' ? 'Mental Buddy' : 'HIV Counselling'}</div>
                                        </div>

                                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                Privacy
                                            </div>
                                            <div className="text-sm text-slate-700">{hiddenIdentityNote}</div>
                                        </div>

                                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                                <FileText className="h-3.5 w-3.5 text-amber-500" />
                                                Contact
                                            </div>
                                            <div className="text-sm text-slate-700">{isAnonymous ? 'Hidden' : (request.patientEmail || 'No email')}</div>
                                        </div>
                                    </div>

                                    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Summary</div>
                                        <p className="text-sm text-slate-700">{request.meta?.counsellingSummary || request.meta?.mentalSummary || request.symptoms || 'No summary provided.'}</p>
                                    </div>

                                    {request.notes && (
                                        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Notes</div>
                                            <p className="text-sm text-slate-700">{request.notes}</p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                        <Link
                                            to={sessionPath}
                                            className="rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition shadow-subtle"
                                        >
                                            Open chat
                                        </Link>
                                        {canDecline && (
                                            <button
                                                type="button"
                                                onClick={() => handleDecline(request)}
                                                disabled={updatingId === request.id}
                                                className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60 transition"
                                            >
                                                Decline
                                            </button>
                                        )}
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
