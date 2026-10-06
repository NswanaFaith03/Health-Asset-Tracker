import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { ArrowLeft, Download, FileText, FlaskConical, Stethoscope, UserRound } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { db } from '../../firebase/config'
import { generateLabMedicalReportPDF } from '../../utils/labReportGenerator'

export default function DoctorLabResults() {
    const { currentUser } = useAuth()
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!currentUser?.uid) return

        const q = query(
            collection(db, 'labReports'),
            where('doctorId', '==', currentUser.uid),
            orderBy('generatedAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            setReports(items)
            setLoading(false)
        }, (error) => {
            console.error('Error fetching lab reports:', error)
            setReports([])
            setLoading(false)
        })

        return () => unsubscribe()
    }, [currentUser])

    const handleDownload = (report) => {
        const pdf = generateLabMedicalReportPDF(report)
        pdf.save(`${(report.studentName || 'student').replace(/\s+/g, '_')}_medical_report.pdf`)
    }

    return (
        <div className="text-slate-900">
            <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link to="/doctor" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-teal-200 hover:bg-teal-50">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Lab Results</h1>
                            <p className="text-sm text-slate-500">View results for labs you requested and download the report PDF</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">
                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Loading lab results...</div>
                ) : reports.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                        No lab results have been published yet for your patients.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div key={report.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Lab result</div>
                                        <h2 className="mt-2 text-xl font-bold text-slate-900">{report.request?.testName || report.testName || 'Lab test'}</h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDownload(report)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download PDF
                                    </button>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                                            <UserRound className="h-3.5 w-3.5 text-teal-600" />
                                            Student
                                        </div>
                                        <div className="font-semibold text-slate-900">{report.studentName || report.profile?.fullName || 'Student'}</div>
                                        <div className="text-xs text-slate-500">{report.studentId || report.profile?.studentId || 'No ID'}</div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                                            <FlaskConical className="h-3.5 w-3.5 text-violet-600" />
                                            Result status
                                        </div>
                                        <div className="font-semibold text-slate-900">Published</div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                                            <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
                                            Reviewed by
                                        </div>
                                        <div className="font-semibold text-slate-900">{report.createdByName || 'Lab Technician'}</div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                                            <FileText className="h-3.5 w-3.5 text-amber-600" />
                                            Date
                                        </div>
                                        <div className="font-semibold text-slate-900">{report.generatedAt ? new Date(report.generatedAt).toLocaleDateString() : '—'}</div>
                                    </div>
                                </div>

                                {report.summary ? (
                                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">Clinical summary</div>
                                        <p className="text-slate-700">{report.summary}</p>
                                    </div>
                                ) : null}

                                {Array.isArray(report.results) && report.results.length > 0 ? (
                                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold text-slate-700">Parameter</th>
                                                    <th className="px-4 py-3 font-semibold text-slate-700">Result</th>
                                                    <th className="px-4 py-3 font-semibold text-slate-700">Unit</th>
                                                    <th className="px-4 py-3 font-semibold text-slate-700">Reference</th>
                                                    <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 bg-white">
                                                {report.results.map((row, index) => (
                                                    <tr key={`${row.parameter}-${index}`}>
                                                        <td className="px-4 py-3 text-slate-700">{row.parameter || 'N/A'}</td>
                                                        <td className="px-4 py-3 text-slate-700">{row.result || 'N/A'}</td>
                                                        <td className="px-4 py-3 text-slate-700">{row.unit || '—'}</td>
                                                        <td className="px-4 py-3 text-slate-700">{row.referenceRange || '—'}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${row.status === 'High' || row.status === 'Low' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                                {row.status || 'Normal'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
