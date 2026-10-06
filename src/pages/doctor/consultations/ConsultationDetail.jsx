import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc, updateDoc, addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { useAuth } from '../../../hooks/useAuth'
import { ArrowLeft, Send, Plus, FileText, Pill, Beaker, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react'

const statusStyles = {
    submitted: 'bg-sky-500/15 text-sky-700 border border-sky-500/30',
    in_review: 'bg-amber-500/15 text-amber-700 border border-amber-500/30',
    accepted: 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30',
    completed: 'bg-violet-500/15 text-violet-700 border border-violet-500/30',
    rejected: 'bg-rose-500/15 text-rose-700 border border-rose-500/30',
    cancelled: 'bg-slate-500/15 text-slate-700 border border-slate-500/30',
    in_progress: 'bg-teal-600/15 text-teal-700 border border-teal-500/30'
}

export default function ConsultationDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const [consultation, setConsultation] = useState(null)
    const [doctorName, setDoctorName] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [response, setResponse] = useState('')
    const [prescriptionModal, setPrescriptionModal] = useState({ open: false, medicine: '', dosage: '', duration: '', notes: '', diagnosis: '', medicines: [] })
    const [labModal, setLabModal] = useState({ open: false, testName: '', notes: '', priority: 'normal' })
    const [infoRequestModal, setInfoRequestModal] = useState({ open: false, title: '', description: '' })
    const [submitting, setSubmitting] = useState(false)

    // Fetch doctor name
    useEffect(() => {
        if (!currentUser?.uid) return
        const fetchDoctorName = async () => {
            try {
                const userDocRef = doc(db, 'staffData', currentUser.uid)
                const userDoc = await getDoc(userDocRef)
                setDoctorName(userDoc.exists() ? (userDoc.data().fullName || currentUser.displayName || '') : (currentUser.displayName || ''))
            } catch (err) {
                console.error('Error fetching doctor name:', err)
                setDoctorName(currentUser.displayName || '')
            }
        }
        fetchDoctorName()
    }, [currentUser])

    // Fetch consultation details
    useEffect(() => {
        if (!id || !currentUser?.uid) return

        const fetchConsultation = async () => {
            try {
                setLoading(true)
                const docRef = doc(db, 'appointments', id)
                const docSnap = await getDoc(docRef)

                if (!docSnap.exists()) {
                    setError('Consultation not found')
                    setLoading(false)
                    return
                }

                const data = docSnap.data()
                setConsultation({ id: docSnap.id, ...data })
                setLoading(false)
            } catch (err) {
                console.error('Error fetching consultation:', err)
                setError(err.message)
                setLoading(false)
            }
        }

        fetchConsultation()
    }, [id, currentUser])

    const handleAccept = async () => {
        if (!consultation) return
        try {
            setSubmitting(true)
            const docRef = doc(db, 'appointments', id)
            await updateDoc(docRef, {
                status: 'accepted',
                doctorName: doctorName || currentUser?.displayName || 'Doctor',
                doctorId: currentUser?.uid || '',
                updatedAt: new Date().toISOString()
            })
            setConsultation(prev => ({ ...prev, status: 'accepted' }))
        } catch (err) {
            console.error('Error accepting consultation:', err)
            setError('Failed to accept consultation')
        } finally {
            setSubmitting(false)
        }
    }

    const handleAddResponse = async () => {
        if (!response.trim() || !consultation) return
        try {
            setSubmitting(true)
            const docRef = doc(db, 'appointments', id)
            await updateDoc(docRef, {
                doctorResponse: (consultation.doctorResponse || '') + '\n' + response,
                status: 'in_progress',
                updatedAt: new Date().toISOString()
            })
            setConsultation(prev => ({ ...prev, doctorResponse: (prev.doctorResponse || '') + '\n' + response, status: 'in_progress' }))
            setResponse('')
        } catch (err) {
            console.error('Error adding response:', err)
            setError('Failed to add response')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCreatePrescription = async () => {
        if (!consultation) return

        // Validate required fields
        if (!prescriptionModal.diagnosis.trim()) {
            alert('Please provide a diagnosis')
            return
        }
        if (!prescriptionModal.medicine.trim()) {
            alert('Please provide at least one medicine')
            return
        }
        if (!prescriptionModal.dosage.trim()) {
            alert('Please provide dosage information')
            return
        }
        if (!prescriptionModal.duration.trim()) {
            alert('Please provide duration information')
            return
        }
        try {
            setSubmitting(true)
            const prescriptionData = {
                consultationId: id,
                studentId: consultation.studentNumber || consultation.studentId || '',
                patientId: consultation.createdBy || '',
                patientName: consultation.patientName || 'Student',
                doctorId: currentUser?.uid || '',
                doctorName: doctorName || currentUser?.displayName || 'Doctor',
                diagnosis: prescriptionModal.diagnosis || 'Not provided',
                // Save medicines as structured objects for clarity in the pharmacist UI
                medicines: [
                    {
                        name: prescriptionModal.medicine.trim(),
                        dosage: prescriptionModal.dosage || '',
                        duration: prescriptionModal.duration || '',
                        notes: prescriptionModal.notes || ''
                    }
                ],
                // keep legacy top-level fields for compatibility
                medicineName: prescriptionModal.medicine,
                dosage: prescriptionModal.dosage,
                duration: prescriptionModal.duration,
                notes: prescriptionModal.notes,
                status: 'pending',
                prescriptionDate: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            const prescriptionRef = await addDoc(collection(db, 'prescriptions'), prescriptionData)

            const studentUid = consultation.createdBy || consultation.studentUid || ''
            const pharmacistIds = await getStaffUserIdsByRole(['pharmacist'])
            const recipients = [studentUid, ...pharmacistIds]

            await notifyRecipients({
                userIds: recipients,
                title: 'Prescription created',
                message: `${prescriptionData.doctorName} created a prescription for ${prescriptionData.patientName || 'you'}: ${prescriptionData.medicineName}.`,
                type: 'prescription',
                relatedId: prescriptionRef.id
            })

            setPrescriptionModal({ open: false, medicine: '', dosage: '', duration: '', notes: '', diagnosis: '', medicines: [] })
            alert('Prescription created successfully')
        } catch (err) {
            console.error('Error creating prescription:', err)
            alert('Failed to create prescription')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCreateLabRequest = async () => {
        if (!labModal.testName.trim() || !consultation) {
            alert('Please fill in all required fields')
            return
        }
        try {
            setSubmitting(true)
            const labData = {
                consultationId: id,
                studentId: consultation.studentNumber || consultation.studentId || '',
                studentUid: consultation.createdBy || '',
                studentName: consultation.patientName || 'Student',
                patientEmail: consultation.patientEmail || '',
                patientPhone: consultation.patientPhone || '',
                doctorId: currentUser?.uid || '',
                doctorName: doctorName || currentUser?.displayName || 'Doctor',
                testName: labModal.testName,
                notes: labModal.notes,
                priority: labModal.priority,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            const labRequestRef = await addDoc(collection(db, 'labRequests'), labData)

            const studentUid = consultation.createdBy || consultation.studentUid || ''
            const staffIds = await getStaffUserIdsByRole(['nurse', 'labTechnician'])
            const recipients = [studentUid, ...staffIds]

            await notifyRecipients({
                userIds: recipients,
                title: 'Lab request ordered',
                message: `${labData.doctorName} ordered a lab test for ${labData.studentName || 'you'}: ${labData.testName}.`,
                type: 'lab_request',
                relatedId: labRequestRef.id
            })

            setLabModal({ open: false, testName: '', notes: '', priority: 'normal' })
            alert('Lab request created successfully')
        } catch (err) {
            console.error('Error creating lab request:', err)
            alert('Failed to create lab request')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCompleteConsultation = async () => {
        if (!consultation) return
        try {
            setSubmitting(true)
            const docRef = doc(db, 'appointments', id)
            await updateDoc(docRef, {
                status: 'completed',
                updatedAt: new Date().toISOString()
            })
            setConsultation(prev => ({ ...prev, status: 'completed' }))

            // Mark student queue as served
            const studentId = consultation.studentNumber || consultation.studentId || consultation.createdBy
            if (studentId) {
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
        } catch (err) {
            console.error('Error completing consultation:', err)
            setError('Failed to complete consultation')
        } finally {
            setSubmitting(false)
        }
    }

    const handleRequestMoreInfo = async () => {
        if (!infoRequestModal.title.trim() || !consultation) {
            alert('Please fill in all required fields')
            return
        }
        try {
            setSubmitting(true)
            const infoRequest = {
                consultationId: id,
                studentId: consultation.studentNumber || consultation.studentId || '',
                studentUid: consultation.createdBy || '',
                studentName: consultation.patientName || 'Student',
                patientEmail: consultation.patientEmail || '',
                doctorId: currentUser?.uid || '',
                doctorName: doctorName || currentUser?.displayName || 'Doctor',
                requestTitle: infoRequestModal.title,
                requestDescription: infoRequestModal.description,
                status: 'pending',
                response: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            const infoRequestRef = await addDoc(collection(db, 'informationRequests'), infoRequest)

            const studentUid = consultation.createdBy || consultation.studentUid || ''
            await notifyRecipients({
                userIds: [studentUid],
                title: 'Additional information requested',
                message: `${infoRequest.doctorName} requested more information: ${infoRequest.requestTitle}.`,
                type: 'information_request',
                relatedId: infoRequestRef.id
            })

            // Also update consultation to mark that info is being requested
            const docRef = doc(db, 'appointments', id)
            const currentRequests = consultation.informationRequests || []
            await updateDoc(docRef, {
                informationRequests: [...currentRequests, infoRequestModal.title],
                updatedAt: new Date().toISOString()
            })

            setConsultation(prev => ({
                ...prev,
                informationRequests: [...(prev.informationRequests || []), infoRequestModal.title]
            }))
            setInfoRequestModal({ open: false, title: '', description: '' })
            alert('Information request sent to patient')
        } catch (err) {
            console.error('Error requesting more information:', err)
            alert('Failed to send information request')
        } finally {
            setSubmitting(false)
        }
    }

    const createNotification = async ({ userId, title, message, type, relatedId = '' }) => {
        if (!userId) return

        await addDoc(collection(db, 'notifications'), {
            userId,
            title,
            message,
            type,
            relatedId,
            createdAt: new Date().toISOString(),
            read: false,
            readAt: null
        })
    }

    const notifyRecipients = async ({ userIds, title, message, type, relatedId = '' }) => {
        const uniqueUserIds = [...new Set((userIds || []).filter(Boolean))]

        await Promise.all(uniqueUserIds.map((userId) =>
            createNotification({ userId, title, message, type, relatedId })
        ))
    }

    const getStaffUserIdsByRole = async (roles) => {
        if (!roles || roles.length === 0) return []

        try {
            const q = query(collection(db, 'staffData'), where('role', 'in', roles))
            const snapshot = await getDocs(q)
            return snapshot.docs
                .map((docSnap) => docSnap.id)
                .filter(Boolean)
        } catch (err) {
            console.error('Error fetching staff notification recipients:', err)
            return []
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center">
                <div className="text-slate-600">Loading consultation details...</div>
            </div>
        )
    }

    if (error || !consultation) {
        return (
            <div>
                <header className="border-b border-slate-200 bg-white/90">
                    <div className="mx-auto max-w-4xl px-6 py-4">
                        <Link to="/doctor/consultations" className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 w-fit">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                    </div>
                </header>
                <main className="mx-auto max-w-4xl px-6 py-8">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-rose-700">
                        {error || 'Consultation not found'}
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div>
            <header className="border-b border-slate-200 bg-white/90">
                <div className="mx-auto max-w-4xl px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link to="/doctor/consultations" className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Consultation Details</h1>
                            <p className="text-sm text-slate-600">Patient: {consultation.patientName || 'Student'}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-6 py-8">
                {/* Status Section */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">Status</h2>
                            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[consultation.status] || 'bg-slate-100 text-slate-700'}`}>
                                {consultation.status || 'submitted'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {consultation.status !== 'accepted' && consultation.status !== 'completed' && (
                                <button
                                    onClick={handleAccept}
                                    disabled={submitting}
                                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 flex items-center gap-2"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Accept
                                </button>
                            )}
                            {consultation.status === 'accepted' && (
                                <button
                                    onClick={handleCompleteConsultation}
                                    disabled={submitting}
                                    className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-60 flex items-center gap-2"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Complete
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Patient Information */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Patient Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-600">Patient Name</p>
                            <p className="text-slate-900 font-medium">{consultation.patientName || 'Student'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Student ID</p>
                            <p className="text-slate-900 font-medium">{consultation.studentNumber || consultation.studentId || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Email</p>
                            <p className="text-slate-900 font-medium">{consultation.patientEmail || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Phone</p>
                            <p className="text-slate-900 font-medium">{consultation.patientPhone || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Chief Complaint / Symptoms */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Chief Complaint</h2>
                    <div className="bg-slate-50 rounded-lg p-4 text-slate-700">
                        {consultation.symptoms || 'No symptoms recorded'}
                    </div>
                </div>

                {/* Additional Notes */}
                {consultation.notes && (
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Additional Notes</h2>
                        <div className="bg-slate-50 rounded-lg p-4 text-slate-700">
                            {consultation.notes}
                        </div>
                    </div>
                )}

                {/* Severity */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Severity</h2>
                    <p className="text-slate-700 capitalize">
                        <span className="inline-flex rounded-full px-3 py-1 bg-slate-100 text-slate-700">
                            {consultation.severity || 'moderate'}
                        </span>
                    </p>
                </div>

                {/* Doctor Response */}
                {consultation.status === 'accepted' || consultation.status === 'in_progress' || consultation.status === 'completed' ? (
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Doctor Response</h2>
                        {consultation.doctorResponse ? (
                            <div className="bg-teal-50 rounded-lg p-4 text-slate-700 mb-4 border border-teal-200">
                                {consultation.doctorResponse}
                            </div>
                        ) : (
                            <p className="text-slate-600 mb-4">No response yet</p>
                        )}

                        <div className="flex flex-col gap-3">
                            <textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Add your response to the patient's consultation..."
                                className="w-full border border-slate-300 rounded-lg p-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            />
                            <button
                                onClick={handleAddResponse}
                                disabled={submitting || !response.trim()}
                                className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100 disabled:opacity-60"
                            >
                                <Send className="h-4 w-4" />
                                Add Response
                            </button>
                        </div>
                    </div>
                ) : null}

                {/* Actions */}
                {consultation.status === 'accepted' || consultation.status === 'in_progress' ? (
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button
                                onClick={() => setPrescriptionModal({ ...prescriptionModal, open: true })}
                                disabled={submitting}
                                className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-60"
                            >
                                <Pill className="h-5 w-5" />
                                Create Prescription
                            </button>
                            <button
                                onClick={() => setLabModal({ ...labModal, open: true })}
                                disabled={submitting}
                                className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-60"
                            >
                                <Beaker className="h-5 w-5" />
                                Order Lab Request
                            </button>
                            <button
                                onClick={() => setInfoRequestModal({ ...infoRequestModal, open: true })}
                                disabled={submitting}
                                className="flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-700 hover:bg-cyan-100 disabled:opacity-60"
                            >
                                <MessageSquare className="h-5 w-5" />
                                Request Info
                            </button>
                        </div>
                    </div>
                ) : null}

                {/* Pending Information Requests */}
                {consultation.informationRequests && consultation.informationRequests.length > 0 && (
                    <div className="mb-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Pending Information Requests</h2>
                        <div className="space-y-2">
                            {consultation.informationRequests.map((req, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-cyan-200">
                                    <MessageSquare className="h-5 w-5 text-cyan-600 flex-shrink-0" />
                                    <span className="text-slate-700">{req}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Prescription Modal */}
                {prescriptionModal.open && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Create Prescription</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis *</label>
                                    <input
                                        type="text"
                                        value={prescriptionModal.diagnosis}
                                        onChange={(e) => setPrescriptionModal({ ...prescriptionModal, diagnosis: e.target.value })}
                                        placeholder="e.g., Bacterial infection"
                                        className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name *</label>
                                    <input
                                        type="text"
                                        value={prescriptionModal.medicine}
                                        onChange={(e) => setPrescriptionModal({ ...prescriptionModal, medicine: e.target.value })}
                                        placeholder="e.g., Amoxicillin"
                                        className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Dosage *</label>
                                    <input
                                        type="text"
                                        value={prescriptionModal.dosage}
                                        onChange={(e) => setPrescriptionModal({ ...prescriptionModal, dosage: e.target.value })}
                                        placeholder="e.g., 500mg, 2 tablets"
                                        className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration *</label>
                                    <input
                                        type="text"
                                        value={prescriptionModal.duration}
                                        onChange={(e) => setPrescriptionModal({ ...prescriptionModal, duration: e.target.value })}
                                        placeholder="e.g., 7 days, twice daily"
                                        className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                    <textarea
                                        value={prescriptionModal.notes}
                                        onChange={(e) => setPrescriptionModal({ ...prescriptionModal, notes: e.target.value })}
                                        placeholder="Additional notes for patient..."
                                        className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        rows="2"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setPrescriptionModal({ open: false, medicine: '', dosage: '', duration: '', notes: '', diagnosis: '', medicines: [] })}
                                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreatePrescription}
                                        disabled={submitting}
                                        className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lab Request Modal */}
                {labModal.open && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Order Lab Request</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Test Name *</label>
                                    <input
                                        type="text"
                                        value={labModal.testName}
                                        onChange={(e) => setLabModal({ ...labModal, testName: e.target.value })}
                                        placeholder="e.g., Full Blood Count"
                                        className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                                    <select
                                        value={labModal.priority}
                                        onChange={(e) => setLabModal({ ...labModal, priority: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                    <textarea
                                        value={labModal.notes}
                                        onChange={(e) => setLabModal({ ...labModal, notes: e.target.value })}
                                        placeholder="Additional instructions for lab technician..."
                                        className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        rows="2"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setLabModal({ open: false, testName: '', notes: '', priority: 'normal' })}
                                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateLabRequest}
                                        disabled={submitting}
                                        className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
                                    >
                                        Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Information Request Modal */}
                {infoRequestModal.open && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Request More Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Request Title *</label>
                                    <input
                                        type="text"
                                        value={infoRequestModal.title}
                                        onChange={(e) => setInfoRequestModal({ ...infoRequestModal, title: e.target.value })}
                                        placeholder="e.g., Recent Medical History, Allergy Information"
                                        className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea
                                        value={infoRequestModal.description}
                                        onChange={(e) => setInfoRequestModal({ ...infoRequestModal, description: e.target.value })}
                                        placeholder="Provide details about what information you need..."
                                        className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        rows="3"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setInfoRequestModal({ open: false, title: '', description: '' })}
                                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRequestMoreInfo}
                                        disabled={submitting}
                                        className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-60"
                                    >
                                        Send Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
