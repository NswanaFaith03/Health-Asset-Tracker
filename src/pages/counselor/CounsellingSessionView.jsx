import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, onSnapshot, updateDoc, query, where, orderBy, collection } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'
import { ArrowLeft, CheckCheck, SendHorizonal, XCircle } from 'lucide-react'
import {
    ANONYMOUS_STUDENT_LABEL,
    acceptCounsellingSession,
    closeCounsellingSession,
    notifyRecipients,
    resolveCounsellingMessageSenderName,
    resolveCounsellingStudentDisplayName,
    sendCounsellingMessage
} from '../../utils/consultationUtils'

export default function CounsellingSessionView({ role = 'mentalHealthCounselor' }) {
    const { id } = useParams()
    const { currentUser, userRole } = useAuth()
    const [appointment, setAppointment] = useState(null)
    const [session, setSession] = useState(null)
    const [messages, setMessages] = useState([])
    const [draft, setDraft] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return

        const appointmentRef = doc(db, 'appointments', id)
        const unsub = onSnapshot(appointmentRef, (snapshot) => {
            if (!snapshot.exists()) {
                setAppointment(null)
                setLoading(false)
                return
            }

            setAppointment({ id: snapshot.id, ...snapshot.data() })
        })

        return () => unsub()
    }, [id])

    useEffect(() => {
        if (!appointment || !currentUser?.uid) return

        const sessionId = appointment.counsellingSessionId

        if (sessionId) {
            const sessionDocRef = doc(db, 'counsellingSessions', sessionId)
            const unsub = onSnapshot(sessionDocRef, (snapshot) => {
                if (!snapshot.exists()) {
                    setSession(null)
                    setLoading(false)
                    return
                }

                setSession({ id: snapshot.id, ...snapshot.data() })
                setLoading(false)
            }, (error) => {
                console.error('Error fetching counselling session:', error)
                setSession(null)
                setLoading(false)
            })

            return () => unsub()
        }

        const queryConstraints = [where('appointmentId', '==', appointment.id)]
        if (userRole === 'student') {
            queryConstraints.push(where('studentUid', '==', currentUser.uid))
        }

        const q = query(collection(db, 'counsellingSessions'), ...queryConstraints)
        const unsub = onSnapshot(q, (snapshot) => {
            const sessionDoc = snapshot.docs[0]
            if (!sessionDoc) {
                setSession(null)
                setLoading(false)
                return
            }

            setSession({ id: sessionDoc.id, ...sessionDoc.data() })
            setLoading(false)
        }, (error) => {
            console.error('Error fetching counselling session:', error)
            setSession(null)
            setLoading(false)
        })

        return () => unsub()
    }, [appointment, currentUser?.uid, userRole])

    useEffect(() => {
        if (!session?.id) {
            setLoading(false)
            return
        }

        const q = query(
            collection(db, 'counsellingMessages'),
            where('sessionId', '==', session.id),
            orderBy('createdAt', 'asc')
        )

        const unsub = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })))
            setLoading(false)
        }, (error) => {
            console.error('Error fetching counselling messages:', error)
            setLoading(false)
        })

        return () => unsub()
    }, [session])

    const isCounselor = userRole === 'mentalHealthCounselor' || userRole === 'hivProfessional'
    const isAnonymousSession = !!(session?.anonymousChat || appointment?.anonymousChat)

    const effectiveCounselorRole = appointment?.appointmentType === 'hiv_counselling'
        ? 'hivProfessional'
        : 'mentalHealthCounselor'

    const counselorRole = isCounselor
        ? (userRole === 'hivProfessional' ? 'hivProfessional' : 'mentalHealthCounselor')
        : effectiveCounselorRole

    const backPath = userRole === 'student'
        ? (appointment?.appointmentType === 'hiv_counselling'
            ? '/student/hiv-counselling'
            : appointment?.appointmentType === 'mental_buddy'
                ? '/student/mental-buddy'
                : '/student')
        : (counselorRole === 'hivProfessional' ? '/hiv-professional' : '/mental-health-counselor')

    const ensureSessionAccepted = async () => {
        if (!isCounselor || !appointment || !session) return
        if (['accepted', 'completed'].includes(appointment.status || '')) return

        const counselorName = currentUser?.displayName || currentUser?.email || 'Counselor'
        await acceptCounsellingSession({
            appointmentId: appointment.id,
            sessionId: session.id,
            counselorUid: currentUser.uid,
            counselorName,
            counselorRole,
            studentUid: session.studentUid || '',
            appointmentType: appointment.appointmentType
        })
    }

    const handleSend = async () => {
        if (!session || !draft.trim()) return

        if (isCounselor) {
            await ensureSessionAccepted()
        }

        const senderDisplayName = isCounselor
            ? (currentUser.displayName || currentUser.email || 'Counselor')
            : resolveCounsellingStudentDisplayName({
                anonymousChat: isAnonymousSession,
                name: currentUser.displayName || currentUser.email || 'Student'
            })

        await sendCounsellingMessage({
            sessionId: session.id,
            senderType: isCounselor ? 'counselor' : 'student',
            senderId: currentUser.uid,
            senderName: senderDisplayName,
            message: draft
        })

        const otherUserId = isCounselor ? (session.studentUid || '') : (session.counselorUid || '')
        if (otherUserId) {
            await notifyRecipients({
                userIds: [otherUserId],
                title: isCounselor ? 'New message from counsellor' : 'New message from student',
                message: `${senderDisplayName} sent a new message in the counselling chat.`,
                type: 'counselling_message',
                relatedId: session.id
            })
        }

        setDraft('')
    }

    const handleClose = async () => {
        if (!session) return
        const notifierId = currentUser?.uid || ''
        await closeCounsellingSession(session.id, notifierId)
        await updateDoc(doc(db, 'appointments', appointment.id), {
            status: 'completed',
            updatedAt: new Date().toISOString()
        })
    }

    const otherParty = useMemo(() => {
        if (!session) return 'Support team'
        if (isCounselor && isAnonymousSession) {
            return ANONYMOUS_STUDENT_LABEL
        }
        return isCounselor ? (session.studentName || 'Student') : (session.counselorName || 'Counselor')
    }, [isAnonymousSession, isCounselor, session])

    const getMessageSenderLabel = (message) => {
        if (isCounselor && isAnonymousSession) {
            return resolveCounsellingMessageSenderName({
                anonymousChat: true,
                senderType: message.senderType,
                senderName: message.senderName,
                senderId: message.senderId,
                studentUid: session?.studentUid
            })
        }
        return message.senderName || 'User'
    }

    return (
        <div className="text-slate-900">
            <header className="border-b border-slate-200 bg-white/90">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link to={backPath} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-teal-200 hover:bg-teal-50">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{counselorRole === 'hivProfessional' ? 'HIV Counselling' : 'Mental Buddy'} Session</h1>
                            <p className="text-sm text-slate-500">Conversation with {otherParty}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-8">
                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Loading session...</div>
                ) : !appointment || !session ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">No active counselling session found.</div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                                <div className="text-sm font-semibold text-slate-700">{otherParty}</div>
                                <div className="flex gap-2">
                                    {session.status !== 'closed' && appointment.status !== 'completed' && appointment.status !== 'rejected' && (
                                        <button onClick={handleClose} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100">
                                            End session
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl max-h-[480px] overflow-y-auto">
                                {messages.length === 0 ? (
                                    <div className="text-sm text-slate-500">No messages yet. Start the conversation.</div>
                                ) : (
                                    messages.map((message) => {
                                        const isMine = message.senderId === currentUser?.uid
                                        return (
                                            <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${isMine ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
                                                    <div className="mb-1 text-[10px] uppercase tracking-wide opacity-80">{getMessageSenderLabel(message)}</div>
                                                    <div>{message.message}</div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            {session.status !== 'closed' && appointment.status !== 'rejected' && (
                                <div className="mt-4 flex gap-2">
                                    <textarea
                                        rows={2}
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value)}
                                        placeholder={isCounselor
                                            ? (appointment.status === 'accepted' || session.status === 'active'
                                                ? 'Write a supportive, professional response...'
                                                : 'Reply to accept this session and start the conversation...')
                                            : 'Type your message...'}
                                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-teal-400"
                                    />
                                    <button onClick={handleSend} className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-white hover:bg-teal-700">
                                        <SendHorizonal className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Session details</div>
                            <div className="space-y-3 text-sm text-slate-700">
                                <div className="rounded-xl border border-slate-200 bg-white p-3">
                                    <div className="text-xs uppercase tracking-wide text-slate-500">Student</div>
                                    <div className="mt-1 font-medium">
                                        {isAnonymousSession
                                            ? ANONYMOUS_STUDENT_LABEL
                                            : (appointment.patientName || appointment.studentName || 'Student')}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-3">
                                    <div className="text-xs uppercase tracking-wide text-slate-500">Status</div>
                                    <div className="mt-1 font-medium capitalize">{session.status || appointment.status || 'submitted'}</div>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-3">
                                    <div className="text-xs uppercase tracking-wide text-slate-500">Request summary</div>
                                    <div className="mt-1">{appointment.meta?.counsellingSummary || appointment.meta?.mentalSummary || appointment.symptoms || 'No summary provided.'}</div>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    )
}
