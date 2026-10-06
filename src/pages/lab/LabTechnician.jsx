import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { db } from '../../firebase/config'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore'
import { generateLabMedicalReportPDF } from '../../utils/labReportGenerator'
import { AlertCircle, ArrowLeft, ClipboardCheck, Download, FileText, FlaskConical, Plus, Save, Search, Stethoscope, Trash2, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

const statusMeta = {
    pending: { label: 'Pending', tone: 'bg-slate-100 text-slate-700 border border-slate-200' },
    accepted: { label: 'Accepted', tone: 'bg-teal-100 text-teal-700 border border-teal-200' },
    assigned: { label: 'Assigned to lab', tone: 'bg-amber-100 text-amber-700 border border-amber-200' },
    in_lab: { label: 'In lab processing', tone: 'bg-violet-100 text-violet-700 border border-violet-200' },
    results_ready: { label: 'Results ready', tone: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    completed: { label: 'Completed', tone: 'bg-emerald-100 text-emerald-700 border border-emerald-200' }
}

const EMPTY_RESULT_ROW = { parameter: '', result: '', unit: '', referenceRange: '', status: 'Normal' }

export default function LabTechnician() {
    const { currentUser } = useAuth()
    const [requests, setRequests] = useState([])
    const [selectedRequestId, setSelectedRequestId] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [activeTab, setActiveTab] = useState('info') // info, intake, results, summary

    const [manualRequest, setManualRequest] = useState({
        studentName: '',
        studentId: '',
        patientEmail: '',
        testName: '',
        notes: '',
        priority: 'normal'
    })

    const [intake, setIntake] = useState({
        age: '',
        gender: '',
        weight: '',
        height: '',
        temperature: '',
        bloodPressure: '',
        pulseRate: '',
        respirationRate: '',
        bloodType: '',
        allergies: '',
        medications: '',
        medicalHistory: ''
    })

    const [resultRows, setResultRows] = useState([EMPTY_RESULT_ROW])
    const [summary, setSummary] = useState('')
    const [recommendations, setRecommendations] = useState('')

    // Metrics
    const metrics = useMemo(() => {
        const total = requests.length
        const pending = requests.filter(r => r.status === 'pending').length
        const inLab = requests.filter(r => r.status === 'in_lab' || r.status === 'accepted' || r.status === 'assigned').length
        const completed = requests.filter(r => r.status === 'results_ready' || r.status === 'completed').length
        return { total, pending, inLab, completed }
    }, [requests])

    const filteredRequests = useMemo(() => {
        return requests
            .filter(request => {
                if (statusFilter !== 'all' && request.status !== statusFilter) return false
                if (searchTerm.trim() === '') return true
                const term = searchTerm.toLowerCase()
                return (
                    request.studentName?.toLowerCase().includes(term) ||
                    request.studentId?.toLowerCase().includes(term) ||
                    request.testName?.toLowerCase().includes(term) ||
                    request.doctorName?.toLowerCase().includes(term)
                )
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }, [requests, searchTerm, statusFilter])

    const selectedRequest = useMemo(() => {
        return requests.find(r => r.id === selectedRequestId) || null
    }, [requests, selectedRequestId])

    useEffect(() => {
        if (!currentUser?.uid) return

        const q = query(
            collection(db, 'labRequests'),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            setRequests(items)
            setLoading(false)
        }, (error) => {
            console.error('Error fetching lab requests:', error)
            setRequests([])
            setLoading(false)
        })

        return () => unsubscribe()
    }, [currentUser])

    const handleFieldChange = (field, value) => {
        setIntake(prev => ({ ...prev, [field]: value }))
    }

    const handleCreateManualRequest = async (e) => {
        e.preventDefault()
        if (!manualRequest.studentName || !manualRequest.testName) return

        try {
            await addDoc(collection(db, 'labRequests'), {
                ...manualRequest,
                studentId: manualRequest.studentId || '',
                patientEmail: manualRequest.patientEmail || '',
                notes: manualRequest.notes || '',
                status: 'pending',
                createdAt: new Date().toISOString(),
                userId: currentUser.uid
            })
            setManualRequest({
                studentName: '',
                studentId: '',
                patientEmail: '',
                testName: '',
                notes: '',
                priority: 'normal'
            })
            setShowCreateForm(false)
        } catch (error) {
            console.error('Error creating manual request:', error)
            setMessage('Failed to create lab order')
        }
    }

    const handleStatusUpdate = async (newStatus) => {
        if (!selectedRequestId) return
        try {
            await updateDoc(doc(db, 'labRequests', selectedRequestId), {
                status: newStatus,
                updatedAt: new Date().toISOString()
            })
            // Update local state
            setRequests(prev => prev.map(req =>
                req.id === selectedRequestId ? { ...req, status: newStatus, updatedAt: new Date().toISOString() } : req
            ))
        } catch (error) {
            console.error('Error updating status:', error)
            setMessage('Failed to update status')
        }
    }

    const handleDeleteRequest = async (requestId) => {
        if (!requestId) return
        if (!window.confirm('Are you sure you want to delete this lab request?')) return
        try {
            await deleteDoc(doc(db, 'labRequests', requestId))
            setRequests(prev => prev.filter(req => req.id !== requestId))
            if (selectedRequestId === requestId) {
                setSelectedRequestId('')
            }
        } catch (error) {
            console.error('Error deleting request:', error)
            setMessage('Failed to delete request')
        }
    }

    const addResultRow = () => {
        setResultRows(prev => [...prev, EMPTY_RESULT_ROW])
    }

    const updateResultRow = (index, field, value) => {
        setResultRows(prev => {
            const newRows = [...prev]
            newRows[index] = { ...newRows[index], [field]: value }
            return newRows
        })
    }

    const removeResultRow = (index) => {
        setResultRows(prev => prev.filter((_, i) => i !== index))
    }

    const handleGenerateReport = async () => {
        if (!selectedRequest) return
        setSaving(true)
        try {
            const cleanedResults = resultRows
                .filter((row) => row.parameter || row.result || row.unit || row.referenceRange || row.status)
                .map((row) => ({
                    parameter: row.parameter || 'N/A',
                    result: row.result || 'N/A',
                    unit: row.unit || '—',
                    referenceRange: row.referenceRange || '—',
                    status: row.status || 'Normal'
                }))

            const reportPayload = {
                request: {
                    ...selectedRequest,
                    studentName: selectedRequest.studentName || 'Student',
                    studentId: selectedRequest.studentId || '',
                    patientEmail: selectedRequest.patientEmail || '',
                    doctorName: selectedRequest.doctorName || 'Doctor',
                    testName: selectedRequest.testName || 'Lab test',
                    notes: selectedRequest.notes || '',
                    priority: selectedRequest.priority || 'normal'
                },
                profile: {
                    fullName: selectedRequest.studentName || 'Student',
                    studentId: selectedRequest.studentId || '',
                    email: selectedRequest.patientEmail || '',
                    phone: selectedRequest.patientPhone || '',
                    age: intake.age || '',
                    bloodType: intake.bloodType || '',
                    height: intake.height || '',
                    weight: intake.weight || '',
                    bmi: '',
                    temperature: intake.temperature || '',
                    bloodPressure: intake.bloodPressure || '',
                    pulse: intake.pulseRate || '',
                    allergies: intake.allergies || '',
                    medications: intake.medications || '',
                    medicalHistory: intake.medicalHistory || ''
                },
                results: cleanedResults,
                summary: summary || 'Lab report generated from submitted specimen analysis.',
                recommendations: recommendations || 'Continue routine monitoring and review with the attending clinician.',
                generatedAt: new Date().toISOString(),
                doctorId: selectedRequest.doctorId || currentUser?.uid || '',
                doctorName: selectedRequest.doctorName || currentUser?.displayName || 'Doctor',
                studentUid: selectedRequest.studentUid || selectedRequest.userId || selectedRequest.createdBy || '',
                studentId: selectedRequest.studentId || '',
                studentName: selectedRequest.studentName || 'Student',
                status: 'completed'
            }

            const reportDoc = await addDoc(collection(db, 'labReports'), reportPayload)

            await updateDoc(doc(db, 'labRequests', selectedRequest.id), {
                reportId: reportDoc.id,
                status: 'results_ready',
                updatedAt: new Date().toISOString()
            })

            const sendNotification = async (userId, title, message) => {
                if (!userId) return
                await addDoc(collection(db, 'notifications'), {
                    userId,
                    title,
                    message,
                    type: 'lab_report',
                    reportId: reportDoc.id,
                    relatedId: selectedRequest.id,
                    createdAt: new Date().toISOString(),
                    read: false,
                    readAt: null
                })
            }

            const studentUserId = selectedRequest.studentUid || selectedRequest.userId || selectedRequest.createdBy || ''
            const doctorRequesterId = selectedRequest.doctorId || ''
            const nurseRequesterId = selectedRequest.nurseId || ''
            const labName = selectedRequest.testName || 'lab test'
            const requesterLabel = nurseRequesterId ? 'nurse' : 'doctor'

            // Student always receives result-ready notification
            await sendNotification(
                studentUserId,
                'Lab report ready',
                `Your ${labName} report is ready to view and download.`
            )

            // If nurse initiated the request, notify nurse and student.
            // If doctor initiated the request, notify doctor and student.
            const requesterRecipientId = nurseRequesterId || doctorRequesterId
            const requesterMessage = nurseRequesterId
                ? `Lab results are ready for ${selectedRequest.studentName || 'the student'} (${labName}).`
                : `Lab results are ready for your patient ${selectedRequest.studentName || 'student'} (${labName}).`

            if (requesterRecipientId && requesterRecipientId !== studentUserId) {
                await sendNotification(
                    requesterRecipientId,
                    'Lab report ready',
                    requesterMessage
                )
            }

            const pdf = await generateLabMedicalReportPDF(reportPayload)
            pdf.save(`${(selectedRequest.studentName || 'student').replace(/\s+/g, '_')}_medical_report.pdf`)

            setMessage(`Lab report generated and notifications sent to student and ${requesterLabel}.`)
        } catch (error) {
            console.error('Error generating report:', error)
            setMessage('Failed to generate lab report')
        } finally {
            setSaving(false)
        }
    }

    if (!loading && selectedRequestId && !selectedRequest) {
        setSelectedRequestId('')
    }

    return (
        <div className="text-slate-900">
            <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-teal-200 hover:bg-teal-50">
                            <ArrowLeft className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Lab Technician</h1>
                            <p className="text-sm text-slate-500">Manage every lab order, process results, and update patient workflow</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateForm((prev) => !prev)}
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                    >
                        <Plus className="h-4 w-4" />
                        {showCreateForm ? 'Close form' : 'New lab order'}
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</div>
                        <div className="mt-3 text-3xl font-bold text-slate-900">{metrics.total}</div>
                        <div className="mt-1 text-sm text-slate-600">Lab orders</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Pending</div>
                        <div className="mt-3 text-3xl font-bold text-slate-900">{metrics.pending}</div>
                        <div className="mt-1 text-sm text-slate-600">Awaiting action</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">In lab</div>
                        <div className="mt-3 text-3xl font-bold text-slate-900">{metrics.inLab}</div>
                        <div className="mt-1 text-sm text-slate-600">Currently processing</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Completed</div>
                        <div className="mt-3 text-3xl font-bold text-slate-900">{metrics.completed}</div>
                        <div className="mt-1 text-sm text-slate-600">Results ready</div>
                    </div>
                </div>

                {showCreateForm && (
                    <form onSubmit={handleCreateManualRequest} className="mb-6 rounded-3xl border border-teal-200 bg-teal-50 p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-slate-900">Create manual lab order</h2>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-700">All system requests</span>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <label className="block text-sm font-medium text-slate-700">
                                Student name
                                <input value={manualRequest.studentName} onChange={(event) => setManualRequest((prev) => ({ ...prev, studentName: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" placeholder="Student full name" required />
                            </label>
                            <label className="block text-sm font-medium text-slate-700">
                                Student ID
                                <input value={manualRequest.studentId} onChange={(event) => setManualRequest((prev) => ({ ...prev, studentId: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" placeholder="Student ID" required />
                            </label>
                            <label className="block text-sm font-medium text-slate-700">
                                Email
                                <input value={manualRequest.patientEmail} onChange={(event) => setManualRequest((prev) => ({ ...prev, patientEmail: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" placeholder="student@school.com" />
                            </label>
                            <label className="block text-sm font-medium text-slate-700 md:col-span-2 xl:col-span-2">
                                Test name
                                <input value={manualRequest.testName} onChange={(event) => setManualRequest((prev) => ({ ...prev, testName: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" placeholder="e.g. Full blood count" required />
                            </label>
                            <label className="block text-sm font-medium text-slate-700">
                                Priority
                                <select value={manualRequest.priority} onChange={(event) => setManualRequest((prev) => ({ ...prev, priority: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                                    <option value="normal">Normal</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="stat">Stat</option>
                                </select>
                            </label>
                            <label className="block text-sm font-medium text-slate-700 md:col-span-2 xl:col-span-3">
                                Clinical notes
                                <textarea value={manualRequest.notes} onChange={(event) => setManualRequest((prev) => ({ ...prev, notes: event.target.value }))} rows="3" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" placeholder="Why this test was requested" />
                            </label>
                        </div>
                        <div className="mt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowCreateForm(false)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>
                            <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-emerald-700">Save lab order</button>
                        </div>
                    </form>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Loading all lab requests...</div>
                ) : (
                    <>
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <div style={{ flex: '0 0 35%', minHeight: '500px', border: '2px solid red', padding: '16px', borderRadius: '12px' }}>
                                <h3 style={{ color: 'red', fontWeight: 'bold', marginBottom: '12px' }}>LAB QUEUE ({filteredRequests.length} items)</h3>
                                <div className="flex flex-col gap-3">
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <input
                                            value={searchTerm}
                                            onChange={(event) => setSearchTerm(event.target.value)}
                                            placeholder="Search patient, test or status"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm focus:border-teal-400 focus:outline-none"
                                        />
                                    </div>
                                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-400 focus:outline-none">
                                        <option value="all">All statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="assigned">Assigned to lab</option>
                                        <option value="in_lab">In lab processing</option>
                                        <option value="results_ready">Results ready</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>

                                <div className="space-y-3 mt-4" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                                    {filteredRequests.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">No matching lab requests found.</div>
                                    ) : (
                                        filteredRequests.map((request) => (
                                            <button
                                                key={request.id}
                                                type="button"
                                                onClick={() => {
                                                    console.log('[LabTech] Clicked request:', request.id)
                                                    setSelectedRequestId(request.id)
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    border: selectedRequest?.id === request.id ? '2px solid blue' : '1px solid #ddd',
                                                    backgroundColor: selectedRequest?.id === request.id ? '#eff6ff' : 'white',
                                                    borderRadius: '12px',
                                                    textAlign: 'left',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{request.studentName || 'Student'}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{request.testName || 'Lab test'}</div>
                                                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '2px 6px',
                                                        backgroundColor: '#e0e7ff',
                                                        color: '#3730a3',
                                                        borderRadius: '4px',
                                                        fontSize: '10px'
                                                    }}>
                                                        {statusMeta[request.status]?.label || 'Pending'}
                                                    </span>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div style={{ flex: '1', minHeight: '500px', border: '2px solid green', padding: '16px', borderRadius: '12px', overflowY: 'auto' }}>
                                <h3 style={{ color: 'green', fontWeight: 'bold', marginBottom: '12px' }}>REQUEST DETAILS</h3>
                                {!selectedRequest ? (
                                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                                        <p>Select a lab request from the queue to see details</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Lab request</div>
                                                <h2 className="mt-2 text-2xl font-bold text-slate-900">{selectedRequest.testName || 'Lab Test'}</h2>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ${statusMeta[selectedRequest.status]?.tone || statusMeta.pending.tone}`}>
                                                    {statusMeta[selectedRequest.status]?.label || 'Pending'}
                                                </span>
                                                <button type="button" onClick={() => handleStatusUpdate('pending')} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">Pending</button>
                                                <button type="button" onClick={() => handleStatusUpdate('in_lab')} className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">In lab</button>
                                                <button type="button" onClick={() => handleStatusUpdate('results_ready')} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">Results ready</button>
                                                <button type="button" onClick={() => handleDeleteRequest(selectedRequest.id)} className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">
                                                    <Trash2 className="mr-1 inline h-3.5 w-3.5" />Delete
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tab bar */}
                                        <div className="border-b border-slate-200 mb-4">
                                            <div className="flex flex-wrap border-b bg-slate-50">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('info')}
                                                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'info' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Request Info
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('intake')}
                                                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'intake' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Medical Intake
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('results')}
                                                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'results' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Lab Results
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('summary')}
                                                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'summary' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Summary & Recommendations
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tab content */}
                                        <div className="space-y-4">
                                            {activeTab === 'info' && (
                                                <>
                                                    <div className="grid gap-4 md:grid-cols-3">
                                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500"><UserRound className="h-3.5 w-3.5 text-teal-600" />Student</div>
                                                            <div className="font-semibold text-slate-900">{selectedRequest.studentName || 'Student'}</div>
                                                            <div className="text-sm text-slate-600">{selectedRequest.studentId || 'No student ID'}</div>
                                                        </div>

                                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500"><ClipboardCheck className="h-3.5 w-3.5 text-emerald-600" />Doctor</div>
                                                            <div className="font-semibold text-slate-900">{selectedRequest.doctorName || 'Doctor'}</div>
                                                            <div className="text-sm text-slate-600">Priority: {selectedRequest.priority || 'normal'}</div>
                                                        </div>

                                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500"><FileText className="h-3.5 w-3.5 text-violet-600" />Notes</div>
                                                            <div className="text-sm text-slate-700">{selectedRequest.notes || 'No clinical notes provided.'}</div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {activeTab === 'intake' && (
                                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700"><Stethoscope className="h-4 w-4 text-cyan-600" />Medical intake</div>
                                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                        {Object.entries(intake).map(([key, value]) => (
                                                            <label key={key} className="block text-sm font-medium text-slate-700">
                                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase())}
                                                                <input
                                                                    type="text"
                                                                    value={value}
                                                                    onChange={(event) => handleFieldChange(key, event.target.value)}
                                                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none"
                                                                    placeholder={key === 'bloodType' ? 'A+' : 'Enter value'}
                                                                />
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {activeTab === 'results' && (
                                                <>
                                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">Lab results</div>
                                                            <button type="button" onClick={addResultRow} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-teal-200 hover:bg-teal-50">Add row</button>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {resultRows.map((row, index) => (
                                                                <div key={`${row.parameter || 'row'}-${index}`} className="rounded-xl border border-slate-200 bg-white p-4">
                                                                    <div className="grid gap-3 md:grid-cols-2">
                                                                        <div>
                                                                            <label className="block text-xs font-medium text-slate-600 mb-1">Parameter</label>
                                                                            <input value={row.parameter} onChange={(event) => updateResultRow(index, 'parameter', event.target.value)} placeholder="e.g. Hemoglobin" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs font-medium text-slate-600 mb-1">Result</label>
                                                                            <input value={row.result} onChange={(event) => updateResultRow(index, 'result', event.target.value)} placeholder="e.g. 12.5" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
                                                                            <input value={row.unit} onChange={(event) => updateResultRow(index, 'unit', event.target.value)} placeholder="e.g. g/dL" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs font-medium text-slate-600 mb-1">Reference Range</label>
                                                                            <input value={row.referenceRange} onChange={(event) => updateResultRow(index, 'referenceRange', event.target.value)} placeholder="e.g. 12-16" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none" />
                                                                        </div>
                                                                        <div className="md:col-span-2 flex items-center justify-between gap-3">
                                                                            <div className="flex-1">
                                                                                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                                                                                <select value={row.status || 'Normal'} onChange={(event) => updateResultRow(index, 'status', event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none">
                                                                                    <option>Normal</option>
                                                                                    <option>High</option>
                                                                                    <option>Low</option>
                                                                                    <option>Abnormal</option>
                                                                                </select>
                                                                            </div>
                                                                            <button type="button" onClick={() => removeResultRow(index)} className="mt-5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100">Remove</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {activeTab === 'summary' && (
                                                <>
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <label className="block text-sm font-medium text-slate-700">
                                                            Clinical summary
                                                            <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows="4" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none" placeholder="Summarize findings and significance" />
                                                        </label>

                                                        <label className="block text-sm font-medium text-slate-700">
                                                            Recommendations
                                                            <textarea value={recommendations} onChange={(event) => setRecommendations(event.target.value)} rows="4" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none" placeholder="Give follow-up and treatment advice" />
                                                        </label>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {message ? (
                                            <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                                {message}
                                            </div>
                                        ) : null}

                                        <div className="flex items-center justify-end">
                                            <button type="button" onClick={handleGenerateReport} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
                                                <Save className="h-4 w-4" />
                                                {saving ? 'Generating...' : 'Generate PDF & notify student'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
