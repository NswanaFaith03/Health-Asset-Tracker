import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { db } from '../../../firebase/config'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import {
    createStudentConsultation,
    getCounsellingFlowConfig,
    isCounsellingAppointmentType,
    resolveCounsellingStudentDisplayName
} from '../../../utils/consultationUtils'
import { FaArrowLeft, FaClock, FaUserDoctor, FaShieldHeart, FaFileMedical, FaBrain, FaHeartPulse, FaRobot } from 'react-icons/fa6'
import AICompanionChat from '../../../components/AICompanionChat'

const severityOptions = ['low', 'moderate', 'high', 'critical']
const typeMeta = {
    consultation: {
        label: 'General Consultation',
        description: 'Submit a general clinical consultation request.',
        accent: 'text-sky-700',
        accentBg: 'bg-sky-100',
        icon: FaFileMedical,
        targetRole: 'doctor'
    },
    hiv_counselling: {
        label: 'HIV Counselling',
        description: 'Request a confidential HIV counselling session with the HIV professional.',
        accent: 'text-emerald-700',
        accentBg: 'bg-emerald-100',
        icon: FaHeartPulse,
        targetRole: 'hivProfessional'
    },
    mental_buddy: {
        label: 'Mental Buddy / Counseling',
        description: 'Start a private mental wellbeing chat with the mental health counselor.',
        accent: 'text-violet-700',
        accentBg: 'bg-violet-100',
        icon: FaBrain,
        targetRole: 'mentalHealthCounselor'
    }
}

export default function StudentConsultations({ type: routeType }) {
    const { currentUser } = useAuth()
    const navigate = useNavigate()
    const { type } = useParams()
    const requestedType = routeType || type || 'consultation'
    const isCounsellingFlow = isCounsellingAppointmentType(requestedType)
    const isGeneralConsultation = requestedType === 'consultation'
    const [appointments, setAppointments] = useState([])
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [loadError, setLoadError] = useState('')
    const [useAI, setUseAI] = useState(false)
    const [showRequests, setShowRequests] = useState(true)
    const [form, setForm] = useState({
        patientName: currentUser?.displayName || '',
        patientPhone: '',
        patientEmail: currentUser?.email || '',
        studentNumber: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '09:00',
        doctorName: '',
        doctorId: '',
        appointmentType: requestedType,
        anonymousChat: false,
        // service-specific fields
        hivStatus: '',
        hivConsent: false,
        mentalSummary: '',
        preferredBuddy: '',
        severity: 'moderate',
        symptoms: '',
        notes: '',
        attachments: '',
        chatMessage: ''
    })

    useEffect(() => {
        if (!requestedType || !typeMeta[requestedType]) return

        setForm((prev) => ({
            ...prev,
            appointmentType: requestedType,
            anonymousChat: !!prev.anonymousChat && ['mental_buddy', 'hiv_counselling'].includes(requestedType)
        }))
    }, [requestedType])

    useEffect(() => {
        if (!currentUser?.uid) return

        const appointmentsQuery = query(
            collection(db, 'appointments'),
            where('createdBy', '==', currentUser.uid)
        )

        const unsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
            const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            // sort client-side by createdAt desc to avoid composite-index requirement
            items.sort((a, b) => {
                const ta = a.createdAt || ''
                const tb = b.createdAt || ''
                return tb.localeCompare(ta)
            })
            setAppointments(items)
            setLoadError('')
            setLoading(false)
        }, (error) => {
            console.error('Error fetching student consultations:', error)
            setLoadError(`Failed to load consultations: ${error?.message || 'Unknown error'}`)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [currentUser])

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        console.log('StudentConsultations.handleSubmit called', { currentUser: currentUser ? { uid: currentUser.uid, email: currentUser.email, emailVerified: currentUser.emailVerified } : null, form })

        if (!currentUser?.uid) {
            console.warn('Submit blocked: no authenticated user uid available')
            setSaving(false)
            return
        }

        // Ensure the client's ID token/emailVerified flag is fresh (important after verification)
        try {
            if (typeof currentUser.reload === 'function') {
                await currentUser.reload()
            }
            if (typeof currentUser.getIdToken === 'function') {
                // force refresh
                await currentUser.getIdToken(true)
            }
            console.log('Post-reload emailVerified:', currentUser.emailVerified)
            try {
                if (typeof currentUser.getIdTokenResult === 'function') {
                    const idTokenResult = await currentUser.getIdTokenResult(true)
                    console.log('ID token claims:', idTokenResult.claims)
                }
            } catch (tokenErr) {
                console.warn('Error fetching id token result:', tokenErr)
            }
        } catch (e) {
            console.warn('Error refreshing user token/state before submit:', e)
        }

        setSaving(true)

        try {
            if (isCounsellingFlow) {
                const trimmedMessage = (form.chatMessage || '').trim()
                if (!trimmedMessage) {
                    setSaving(false)
                    return
                }

                const counsellingConfig = getCounsellingFlowConfig(form.appointmentType)
                const payload = {
                    patientName: resolveCounsellingStudentDisplayName({
                        anonymousChat: !!form.anonymousChat,
                        name: form.patientName || currentUser.displayName || 'Student'
                    }),
                    patientPhone: '',
                    patientEmail: form.anonymousChat ? '' : (form.patientEmail || currentUser.email),
                    studentNumber: form.studentNumber || 'chat-session',
                    appointmentDate: form.appointmentDate,
                    appointmentTime: form.appointmentTime,
                    doctorName: '',
                    doctorId: '',
                    symptoms: trimmedMessage,
                    severity: 'moderate',
                    notes: form.notes || counsellingConfig?.sessionStartNote || 'Counselling chat session started by student.',
                    attachments: [],
                    appointmentType: form.appointmentType,
                    anonymousChat: !!form.anonymousChat,
                    meta: {
                        counsellingSummary: trimmedMessage,
                        mentalSummary: trimmedMessage,
                        hivStatus: form.hivStatus || null,
                        hivConsent: !!form.hivConsent,
                        preferredBuddy: form.preferredBuddy || null,
                        sessionMode: 'chat',
                        isCounsellingChat: true
                    },
                    createdBy: currentUser.uid,
                    status: 'submitted'
                }

                const created = await createStudentConsultation(payload)
                if (created?.id) {
                    navigate(`/student/session/${created.id}`)
                }

                setForm((prev) => ({
                    ...prev,
                    patientName: currentUser?.displayName || '',
                    patientEmail: currentUser?.email || '',
                    studentNumber: '',
                    appointmentDate: new Date().toISOString().split('T')[0],
                    appointmentTime: '09:00',
                    appointmentType: requestedType,
                    anonymousChat: false,
                    notes: '',
                    chatMessage: '',
                    hivStatus: '',
                    hivConsent: false,
                    mentalSummary: '',
                    preferredBuddy: ''
                }))
                return
            }

            const payload = {
                patientName: form.patientName || currentUser.displayName || 'Student',
                patientPhone: form.patientPhone,
                patientEmail: form.patientEmail || currentUser.email,
                studentNumber: form.studentNumber,
                appointmentDate: form.appointmentDate,
                appointmentTime: form.appointmentTime,
                doctorName: form.doctorName,
                doctorId: form.doctorId,
                symptoms: form.symptoms,
                severity: form.severity,
                notes: form.notes,
                attachments: form.attachments ? form.attachments.split(',').map((item) => item.trim()).filter(Boolean) : [],
                appointmentType: form.appointmentType,
                anonymousChat: !!form.anonymousChat && ['mental_buddy', 'hiv_counselling'].includes(form.appointmentType),
                meta: {
                    hivStatus: form.hivStatus || null,
                    hivConsent: !!form.hivConsent,
                    mentalSummary: form.mentalSummary || null,
                    preferredBuddy: form.preferredBuddy || null
                },
                createdBy: currentUser.uid
            }

            console.log('Creating consultation payload:', payload)
            await createStudentConsultation(payload)

            setForm({
                patientName: currentUser?.displayName || '',
                patientPhone: '',
                patientEmail: currentUser?.email || '',
                studentNumber: '',
                appointmentDate: new Date().toISOString().split('T')[0],
                appointmentTime: '09:00',
                doctorName: '',
                doctorId: '',
                appointmentType: requestedType,
                anonymousChat: false,
                severity: 'moderate',
                symptoms: '',
                notes: '',
                attachments: '',
                hivStatus: '',
                hivConsent: false,
                mentalSummary: '',
                preferredBuddy: '',
                chatMessage: ''
            })
        } catch (error) {
            console.error('Error creating consultation:', error)
        } finally {
            setSaving(false)
        }
    }

    const selectedMeta = typeMeta[form.appointmentType] || typeMeta.consultation
    const SelectedIcon = selectedMeta.icon

    const visibleAppointments = appointments.filter((item) => (
        isCounsellingFlow ? item.appointmentType === requestedType : true
    ))

    return (
        <div className="text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link to="/student" className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                            <FaArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Student Consultation</h1>
                            <p className="text-sm text-slate-600">Submit a new case and track its status</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">
                {loadError && (
                    <div className="mb-6 rounded-lg border border-teal-200 bg-teal-50 p-4">
                        <p className="text-sm font-medium text-red-800">{loadError}</p>
                        <button
                            type="button"
                            onClick={() => setLoadError('')}
                            className="mt-2 text-xs font-medium text-teal-600 hover:text-teal-700"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${selectedMeta.accentBg}`}>
                            <SelectedIcon className={`h-5 w-5 ${selectedMeta.accent}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">{selectedMeta.label}</h2>
                            <p className="text-sm text-slate-600">{selectedMeta.description}</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-3">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${selectedMeta.accentBg}`}>
                                <SelectedIcon className={`h-5 w-5 ${selectedMeta.accent}`} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">{isCounsellingFlow ? 'Secure Chat Session' : 'New Request'}</h2>
                                <p className="text-sm text-slate-600">
                                    {isCounsellingFlow
                                        ? `Start a private chat with the ${selectedMeta.targetRole === 'mentalHealthCounselor' ? 'Mental Health Counselor' : 'HIV Professional'}.`
                                        : 'This request is saved in the general consultation flow.'}
                                </p>
                            </div>
                        </div>

                        {isCounsellingFlow ? (
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Session start</div>
                                    <div className="text-sm text-slate-700">
                                        This is a live counselling conversation, not a clinical consultation form. Share what you want to talk about and the appropriate professional will join the session.
                                    </div>
                                </div>

                                {!routeType && !type && (
                                    <label className="space-y-2 text-sm text-slate-700">
                                        <span>Chat Type</span>
                                        <select value={form.appointmentType} onChange={(e) => updateField('appointmentType', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-teal-400">
                                            <option value="hiv_counselling">HIV Counselling</option>
                                            <option value="mental_buddy">Mental Buddy / Counseling</option>
                                        </select>
                                    </label>
                                )}

                                {/* AI Toggle */}
                                <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                                                <FaRobot className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">AI Companion</div>
                                                <div className="text-xs text-slate-600">Chat with DiGi instead of a human counselor</div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setUseAI(!useAI)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useAI ? 'bg-teal-600' : 'bg-slate-300'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useAI ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>

                                {useAI ? (
                                    <div className="fixed inset-0 z-50 bg-white h-screen">
                                        <AICompanionChat
                                            conversationType={form.appointmentType}
                                            onClose={() => setUseAI(false)}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <label className="space-y-2 text-sm text-slate-700">
                                            <span>Message to the professional</span>
                                            <textarea
                                                value={form.chatMessage}
                                                onChange={(e) => updateField('chatMessage', e.target.value)}
                                                rows={6}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-teal-400"
                                                placeholder={form.appointmentType === 'mental_buddy' ? 'I would like to talk about...' : 'I would like to discuss...'}
                                            />
                                        </label>

                                        <label className="space-y-2 text-sm text-slate-700">
                                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={form.anonymousChat}
                                                    onChange={(e) => updateField('anonymousChat', e.target.checked)}
                                                    className="h-4 w-4 rounded border-slate-300 bg-white text-teal-600"
                                                />
                                                <span>{selectedMeta.targetRole === 'mentalHealthCounselor' ? 'Keep this chat private and anonymous.' : 'Keep this HIV counselling chat confidential.'}</span>
                                            </div>
                                        </label>

                                        <button type="submit" disabled={saving} className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70">
                                            {saving ? 'Starting chat...' : `Start ${selectedMeta.label}`}
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {!routeType && !type && (
                                        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
                                            <span>Request Type</span>
                                            <select value={form.appointmentType} onChange={(e) => updateField('appointmentType', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-teal-400">
                                                <option value="consultation">General Consultation</option>
                                                <option value="hiv_counselling">HIV Counselling</option>
                                                <option value="mental_buddy">Mental Buddy / Counseling</option>
                                            </select>
                                        </label>
                                    )}

                                    {isGeneralConsultation && (
                                        <>
                                            <label className="space-y-2 text-sm text-slate-700">
                                                <span>Name</span>
                                                <input value={form.patientName} onChange={(e) => updateField('patientName', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-teal-400" required />
                                            </label>

                                            <label className="space-y-2 text-sm text-slate-700">
                                                <span>Student Number</span>
                                                <input value={form.studentNumber} onChange={(e) => updateField('studentNumber', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-teal-400" placeholder="e.g. STU-2024-001" required />
                                            </label>

                                            <label className="space-y-2 text-sm text-slate-700">
                                                <span>Email</span>
                                                <input type="email" value={form.patientEmail} onChange={(e) => updateField('patientEmail', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-teal-400" required />
                                            </label>

                                            <label className="space-y-2 text-sm text-slate-700">
                                                <span>Phone</span>
                                                <input value={form.patientPhone} onChange={(e) => updateField('patientPhone', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-teal-400" required />
                                            </label>

                                            <label className="space-y-2 text-sm text-slate-700">
                                                <span>Preferred Date</span>
                                                <input type="date" value={form.appointmentDate} onChange={(e) => updateField('appointmentDate', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-teal-400" required />
                                            </label>

                                            <label className="space-y-2 text-sm text-slate-700">
                                                <span>Preferred Time</span>
                                                <input type="time" value={form.appointmentTime} onChange={(e) => updateField('appointmentTime', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-teal-400" required />
                                            </label>

                                            {/* Doctor selection removed: students should not choose a doctor. Assignment handled by staff queue. */}

                                            <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
                                                <span>Severity</span>
                                                <select value={form.severity} onChange={(e) => updateField('severity', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-teal-400">
                                                    {severityOptions.map((item) => (
                                                        <option key={item} value={item}>{item}</option>
                                                    ))}
                                                </select>
                                            </label>

                                            <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
                                                <span>Symptoms</span>
                                                <textarea value={form.symptoms} onChange={(e) => updateField('symptoms', e.target.value)} rows={4} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-teal-400" placeholder="Describe your symptoms in detail" required />
                                            </label>
                                        </>
                                    )}

                                    <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
                                        <span>Notes</span>
                                        <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-teal-400" placeholder="Any additional history or context" />
                                    </label>
                                </div>

                                <button type="submit" disabled={saving} className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70">
                                    {saving ? 'Submitting...' : 'Submit Consultation Request'}
                                </button>
                            </>
                        )}
                    </form>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <FaShieldHeart className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">My Requests</h2>
                                <p className="text-sm text-slate-600">Live status from the backend</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Loading your consultations...</div>
                        ) : visibleAppointments.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">No consultation requests yet.</div>
                        ) : (
                            <div className="space-y-4">
                                {visibleAppointments.map((appointment) => {
                                    const isCounsellingRequest = isCounsellingAppointmentType(appointment.appointmentType)

                                    return (
                                    <div key={appointment.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-sm text-slate-500">{appointment.appointmentDate}</div>
                                                <div className="font-semibold text-slate-900">{appointment.symptoms || appointment.meta?.mentalSummary || 'Consultation request'}</div>
                                            </div>
                                            <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold capitalize text-teal-700">{appointment.status || 'submitted'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <FaUserDoctor className="h-4 w-4 text-teal-600" />
                                            <span>{appointment.acceptedByName || appointment.doctorName || (appointment.appointmentType === 'mental_buddy' ? 'Mental Health Counselor' : appointment.appointmentType === 'hiv_counselling' ? 'HIV Professional' : 'Doctor pending')}</span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                                            <FaClock className="h-4 w-4 text-amber-600" />
                                            <span>{appointment.appointmentTime || '09:00'}</span>
                                        </div>
                                        {isCounsellingRequest && (
                                            <Link
                                                to={`/student/session/${appointment.id}`}
                                                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"
                                            >
                                                Open chat
                                            </Link>
                                        )}
                                    </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
