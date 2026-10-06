import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, doc, onSnapshot, orderBy, query, where, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'
import { ArrowLeft, ClipboardCheck, Clock3, Download, FileCheck2, FlaskConical, MapPin, Stethoscope } from 'lucide-react'
import { generateLabMedicalReportPDF } from '../../utils/labReportGenerator'

const statusMeta = {
    pending: { label: 'Pending', tone: 'bg-slate-100 text-slate-700 border border-slate-200' },
    accepted: { label: 'Accepted', tone: 'bg-teal-100 text-teal-700 border border-teal-200' },
    assigned: { label: 'Assigned to lab', tone: 'bg-amber-100 text-amber-700 border border-amber-200' },
    in_lab: { label: 'In lab processing', tone: 'bg-violet-100 text-violet-700 border border-violet-200' },
    results_ready: { label: 'Results ready', tone: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    completed: { label: 'Completed', tone: 'bg-emerald-100 text-emerald-700 border border-emerald-200' }
}

export default function StudentLabRequests() {
    const { currentUser } = useAuth()
    const [studentId, setStudentId] = useState('')
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!currentUser?.uid) return

        const userDocRef = doc(db, 'staffData', currentUser.uid)
        const unsubUser = onSnapshot(userDocRef, (snapshot) => {
            const data = snapshot.data() || {}
            setStudentId((data.studentId || data.studentNumber || '').trim())
        })

        return () => unsubUser()
    }, [currentUser])

    useEffect(() => {
        if (!studentId) {
            setRequests([])
            setLoading(false)
            return
        }

        const q = query(
            collection(db, 'labRequests'),
            where('studentId', '==', studentId),
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
    }, [studentId])

    const latestRequest = useMemo(() => requests[0] || null, [requests])

    const handleDownloadReport = async (request) => {
        if (!request?.reportId) return

        try {
            const reportSnapshot = await getDoc(doc(db, 'labReports', request.reportId))
            if (!reportSnapshot.exists()) {
                window.alert('Medical report not found. Please try again later.')
                return
            }

            const reportData = reportSnapshot.data()
            const pdf = await generateLabMedicalReportPDF(reportData)
            const fileName = `${(request.studentName || 'student').replace(/\s+/g, '_')}_medical_report.pdf`

            try {
                const pdfBlob = pdf.output('blob')
                const pdfUrl = URL.createObjectURL(pdfBlob)
                window.open(pdfUrl, '_blank', 'noopener,noreferrer')
                setTimeout(() => URL.revokeObjectURL(pdfUrl), 15000)
            } catch (openError) {
                console.warn('Open in new tab failed, falling back to download:', openError)
                pdf.save(fileName)
            }
        } catch (error) {
            console.error('Error downloading lab report:', error)
            window.alert('Could not download the report at this time.')
        }
    }

    return (
        <div className="text-slate-900">
            <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link to="/student" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-teal-200 hover:bg-teal-50">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Lab Requests</h1>
                            <p className="text-sm text-slate-500">Track accepted requests, assigned tests, and results status</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">
                {!studentId ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
                        Add your student ID in your profile before lab requests can be linked to you.
                    </div>
                ) : null}

                {latestRequest && (
                    <div className="mb-8 rounded-3xl border border-teal-200 bg-teal-50 p-5 shadow-sm">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-[0.2em] text-teal-700">Current status</div>
                                <div className="mt-2 text-2xl font-bold text-slate-900">{statusMeta[latestRequest.status]?.label || 'Submitted'}</div>
                            </div>
                            <div className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ${statusMeta[latestRequest.status]?.tone || statusMeta.pending.tone}`}>
                                {latestRequest.priority ? `${latestRequest.priority} priority` : 'Normal priority'}
                            </div>
                        </div>

                        {(latestRequest.status === 'accepted' || latestRequest.status === 'assigned' || latestRequest.status === 'in_lab' || latestRequest.status === 'results_ready') && (
                            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                Physical attendance is required before the lab result is released to you.
                            </div>
                        )}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Loading your lab requests...</div>
                ) : requests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                        No lab requests yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div key={request.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Lab test</div>
                                        <h2 className="mt-2 text-xl font-bold text-slate-900">{request.testName || 'Lab test'}</h2>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ${statusMeta[request.status]?.tone || statusMeta.pending.tone}`}>
                                        {statusMeta[request.status]?.label || 'Submitted'}
                                    </span>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                                            <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
                                            Requested by
                                        </div>
                                        <div className="font-semibold text-slate-900">{request.doctorName || 'Doctor'}</div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                                            <Clock3 className="h-3.5 w-3.5 text-amber-600" />
                                            Status
                                        </div>
                                        <div className="font-semibold text-slate-900">{statusMeta[request.status]?.label || 'Submitted'}</div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                                            <FlaskConical className="h-3.5 w-3.5 text-violet-600" />
                                            Priority
                                        </div>
                                        <div className="font-semibold capitalize text-slate-900">{request.priority || 'normal'}</div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                                            <ClipboardCheck className="h-3.5 w-3.5 text-emerald-600" />
                                            Date
                                        </div>
                                        <div className="font-semibold text-slate-900">{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '—'}</div>
                                    </div>
                                </div>

                                {request.notes ? (
                                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                                            <FileCheck2 className="h-3.5 w-3.5 text-sky-600" />
                                            Clinical notes
                                        </div>
                                        <p className="text-slate-700">{request.notes}</p>
                                    </div>
                                ) : null}

                                {request.reportId ? (
                                    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <div className="text-sm font-semibold text-emerald-800">Medical report ready</div>
                                            <div className="text-xs text-emerald-700">A full PDF has been generated and is available for download.</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDownloadReport(request)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-emerald-700"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download PDF
                                        </button>
                                    </div>
                                ) : null}

                                {(request.status === 'results_ready' || request.status === 'completed') && (
                                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                        Results are ready. Please visit the lab desk in person to collect them.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
