import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, updateDoc, where, addDoc } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { useAuth } from '../../../hooks/useAuth'
import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    ShieldCheck,
    Stethoscope,
    UserRound,
    XCircle
} from 'lucide-react'

const statusStyles = {
    submitted: 'bg-sky-500/15 text-sky-200 border border-sky-500/30',
    in_review: 'bg-amber-500/15 text-amber-200 border border-amber-500/30',
    accepted: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30',
    completed: 'bg-violet-500/15 text-violet-200 border border-violet-500/30',
    rejected: 'bg-rose-500/15 text-rose-200 border border-rose-500/30',
    cancelled: 'bg-slate-500/15 text-slate-200 border border-slate-500/30',
    scheduled: 'bg-teal-600/15 text-teal-200 border border-teal-500/30'
}

export default function DoctorConsultationQueue() {
    const { currentUser } = useAuth()
    const [doctorName, setDoctorName] = useState('')
    const [consultations, setConsultations] = useState([])
    const [studentQueueEntries, setStudentQueueEntries] = useState([])
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [updatingId, setUpdatingId] = useState(null)
    const [labRequest, setLabRequest] = useState({
        consultationId: '',
        testName: '',
        notes: '',
        priority: 'normal'
    })
    const [requestingLab, setRequestingLab] = useState(false)

    useEffect(() => {
        if (!currentUser?.uid) return

        const fetchDoctorName = async () => {
            try {
                const userDocRef = doc(db, 'staffData', currentUser.uid)
                const userDoc = await getDoc(userDocRef)

                setDoctorName(userDoc.exists() ? (userDoc.data().fullName || currentUser.displayName || '') : (currentUser.displayName || ''))
            } catch (error) {
                console.error('Error fetching doctor name:', error)
                setDoctorName(currentUser.displayName || '')
            }
        }

        fetchDoctorName()
    }, [currentUser])

    useEffect(() => {
        // load appointments as soon as we have an auth user.
        if (!currentUser) return

        const q = query(collection(db, 'appointments'))

        // probe once to surface permission errors quickly
        getDocs(q).catch((err) => {
            console.error('Initial consultation probe failed:', err)
            setLoadError(err.message || String(err))
            setLoading(false)
        })

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs
                .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
                .filter((item) => {
                    const isStudentPortal = item.source === 'student-portal'
                    const isConsultation = item.appointmentType === 'consultation' || item.appointmentType === 'mental_buddy' || item.appointmentType === 'hiv_counselling'
                    // match if unassigned or explicitly assigned to current doctor
                    const matchesDoctor = !item.doctorId || item.doctorId === '' || item.doctorId === currentUser?.uid
                    return isStudentPortal && isConsultation && matchesDoctor
                })
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

            setConsultations(items)
            setLoading(false)
        }, (error) => {
            console.error('Error fetching consultation queue:', error)
            setLoadError(error.message || String(error))
            setLoading(false)
        })

        return () => unsubscribe()
    }, [currentUser])

    // Listen to studentQueue entries so doctor can process in chronological order
    useEffect(() => {
        const qQueue = query(
            collection(db, 'studentQueue'),
            where('sessionType', '==', 'consultation')
        )

        const unsub = onSnapshot(qQueue, (snap) => {
            const items = snap.docs.map(ds => ({ id: ds.id, ...ds.data() })).sort((a, b) => {
                const aNum = Number(a.queueNumber) || Number.MAX_SAFE_INTEGER
                const bNum = Number(b.queueNumber) || Number.MAX_SAFE_INTEGER
                return aNum - bNum
            })
            setStudentQueueEntries(items)
        }, (err) => {
            console.error('Error loading student queue for doctor:', err)
        })

        return () => unsub()
    }, [])

    const visibleConsultations = useMemo(() => {
        // attach queueNumber where available
        const queueMap = new Map()
        studentQueueEntries.forEach((entry) => {
            const key = (entry.studentId || '').toString().trim()
            if (key) {
                // only keep first (lowest) queueNumber per student
                if (!queueMap.has(key)) queueMap.set(key, entry.queueNumber)
            }
        })

        const annotated = consultations.map((c) => {
            const studentKey = ((c.studentNumber || c.studentId || c.createdBy) || '').toString().trim()
            return { ...c, __queueNumber: queueMap.get(studentKey) }
        }).filter((item) => selectedStatus === 'all' ? true : ((item.status || 'submitted') === selectedStatus))

        // Sort by queueNumber (ascending) when present, otherwise by createdAt desc
        annotated.sort((a, b) => {
            const aq = a.__queueNumber
            const bq = b.__queueNumber
            if (aq !== undefined && bq !== undefined) return Number(aq) - Number(bq)
            if (aq !== undefined) return -1
            if (bq !== undefined) return 1
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        })

        return annotated
    }, [consultations, selectedStatus, studentQueueEntries])

    const handleUpdateStatus = async (id, status) => {
        try {
            setUpdatingId(id)
            const appointmentRef = doc(db, 'appointments', id)
            await updateDoc(appointmentRef, {
                status,
                doctorName: doctorName || currentUser?.displayName || 'Doctor',
                doctorId: currentUser?.uid || '',
                updatedAt: new Date().toISOString()
            })

            const consultationSnap = await getDoc(appointmentRef)
            const consultationData = consultationSnap.data() || {}
            const studentId = (consultationData.studentNumber || consultationData.studentId || consultationData.createdBy || '').trim()

            if (studentId && (status === 'accepted' || status === 'in_progress')) {
                // mark queue entry as in_progress
                const queueQuery = query(
                    collection(db, 'studentQueue'),
                    where('studentId', '==', studentId),
                    where('status', '!=', 'served')
                )
                const queueSnap = await getDocs(queueQuery)
                if (!queueSnap.empty) {
                    const queueEntryId = queueSnap.docs[0].id
                    await updateDoc(doc(db, 'studentQueue', queueEntryId), {
                        status: 'in_progress',
                        assignedDoctor: currentUser?.uid || '',
                        assignedDoctorName: doctorName || currentUser?.displayName || '',
                        updatedAt: new Date().toISOString()
                    })
                }
            }

            if (studentId && status === 'completed') {
                const queueQuery = query(
                    collection(db, 'studentQueue'),
                    where('studentId', '==', studentId),
                    where('status', '!=', 'served')
                )
                const queueSnap = await getDocs(queueQuery)
                if (!queueSnap.empty) {
                    const queueEntryId = queueSnap.docs[0].id
                    await updateDoc(doc(db, 'studentQueue', queueEntryId), {
                        status: 'served',
                        updatedAt: new Date().toISOString()
                    })
                }
            }
        } catch (error) {
            console.error('Error updating consultation status:', error)
        } finally {
            setUpdatingId(null)
        }
    }

    const handleCreateLabRequest = async (consultation) => {
        try {
            if ((consultation.status || 'submitted') !== 'accepted') {
                window.alert('This consultation must be accepted before a lab request can be created.')
                return
            }

            const trimmedTest = (labRequest.testName || '').trim()
            if (!trimmedTest) {
                window.alert('Please enter a lab test name before sending the request.')
                return
            }

            setRequestingLab(true)

            const requestDoc = {
                consultationId: consultation.id,
                studentId: consultation.studentNumber || consultation.studentId || '',
                studentUid: consultation.createdBy || consultation.userId || consultation.studentUid || '',
                studentName: consultation.patientName || consultation.studentName || 'Student',
                patientEmail: consultation.patientEmail || '',
                patientPhone: consultation.patientPhone || '',
                doctorId: currentUser?.uid || '',
                doctorName: doctorName || currentUser?.displayName || 'Doctor',
                testName: trimmedTest,
                notes: (labRequest.notes || '').trim(),
                priority: labRequest.priority || 'normal',
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            await addDoc(collection(db, 'labRequests'), requestDoc)

            setLabRequest({ consultationId: '', testName: '', notes: '', priority: 'normal' })
            window.alert('Lab request created successfully.')
        } catch (error) {
            console.error('Error creating lab request:', error)
            window.alert('Failed to create lab request. Please try again.')
        } finally {
            setRequestingLab(false)
        }
    }

    const statusOptions = ['all', 'submitted', 'in_review', 'accepted', 'completed', 'rejected', 'cancelled']

    return (
        <div className="text-slate-900">
            <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link to="/doctor" className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Consultation Queue</h1>
                            <p className="text-sm text-slate-600">Student cases assigned to {doctorName || 'your clinic'}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">
                <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => setSelectedStatus(status)}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${selectedStatus === status
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
                            >
                                {status === 'all' ? 'All cases' : status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">Loading consultation queue...</div>
                ) : loadError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-rose-700">Error loading consultations: {loadError}</div>
                ) : visibleConsultations.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">No consultation requests match the current filter.</div>
                ) : (
                    <div className="space-y-4">
                        {visibleConsultations.map((consultation) => (
                            <div key={consultation.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[consultation.status] || 'bg-slate-100 text-slate-700'}`}>{consultation.status || 'submitted'}</span>
                                            {consultation.__queueNumber !== undefined && (
                                                <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">Queue #{consultation.__queueNumber}</span>
                                            )}
                                        </div>
                                        <div className="text-xl font-bold text-slate-900">{consultation.patientName || 'Student patient'}</div>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                            <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {consultation.appointmentDate || 'N/A'}</span>
                                            <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" /> {consultation.appointmentTime || 'N/A'}</span>
                                            <span className="inline-flex items-center gap-1"><UserRound className="h-4 w-4" /> {consultation.studentNumber || consultation.studentId || consultation.createdBy || 'Student'}</span>
                                        </div>
                                        <div className="max-w-2xl text-sm text-slate-600">{consultation.symptoms || 'No symptoms entered'}</div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Link to={`/doctor/consultations/${consultation.id}`} className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100">
                                            View Details
                                        </Link>
                                        {consultation.status !== 'completed' && consultation.status !== 'rejected' && consultation.status !== 'cancelled' && (
                                            <>
                                                <button type="button" disabled={updatingId === consultation.id} onClick={() => handleUpdateStatus(consultation.id, 'accepted')} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60">Accept</button>
                                                <button type="button" disabled={updatingId === consultation.id} onClick={() => handleUpdateStatus(consultation.id, 'rejected')} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60">Reject</button>
                                            </>
                                        )}
                                        {consultation.status === 'accepted' && (
                                            <button type="button" disabled={updatingId === consultation.id} onClick={() => handleUpdateStatus(consultation.id, 'completed')} className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-60">Complete</button>
                                        )}
                                        <button type="button" onClick={() => setLabRequest({ consultationId: consultation.id, testName: '', notes: '', priority: 'normal' })} className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100">Lab Request</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
