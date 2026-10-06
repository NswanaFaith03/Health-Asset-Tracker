import { useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'
import { CheckCircle2, Clock3, FileText, PackageCheck, Pill, Search, UserRound } from 'lucide-react'

const statusStyles = {
    active: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    pending: 'bg-amber-100 text-amber-700 border border-amber-200',
    collected: 'bg-sky-100 text-sky-700 border border-sky-200',
    completed: 'bg-violet-100 text-violet-700 border border-violet-200'
}

export default function Pharmacist() {
    const { currentUser } = useAuth()
    const [prescriptions, setPrescriptions] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const q = query(
            collection(db, 'prescriptions'),
            where('status', '!=', 'discontinued')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            setPrescriptions(items)
            setLoading(false)
        }, (error) => {
            console.error('Error loading prescriptions:', error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const filteredPrescriptions = useMemo(() => {
        const term = searchTerm.trim().toLowerCase()
        if (!term) return prescriptions

        return prescriptions.filter((prescription) => {
            const name = (prescription.patientName || '').toLowerCase()
            const doctor = (prescription.doctorName || '').toLowerCase()
            const diagnosis = (prescription.diagnosis || '').toLowerCase()
            return name.includes(term) || doctor.includes(term) || diagnosis.includes(term)
        })
    }, [prescriptions, searchTerm])

    const markCollected = async (prescriptionId) => {
        try {
            await updateDoc(doc(db, 'prescriptions', prescriptionId), {
                status: 'collected',
                collectedAt: new Date().toISOString(),
                collectedBy: currentUser?.uid || '',
                collectedByName: currentUser?.displayName || currentUser?.email || 'Pharmacist',
                updatedAt: new Date().toISOString()
            })
        } catch (error) {
            console.error('Error marking prescription as collected:', error)
            window.alert('Failed to update prescription status.')
        }
    }

    return (
        <div className="text-slate-900">
            <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Pharmacist</h1>
                        <p className="text-sm text-slate-500">Review doctor prescriptions and confirm collection</p>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">
                <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by patient, doctor, or diagnosis"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-slate-800 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Loading prescriptions...</div>
                ) : filteredPrescriptions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                        No prescriptions are currently ready for fulfillment.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredPrescriptions.map((prescription) => (
                            <div key={prescription.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Prescription</div>
                                        <h2 className="mt-2 text-xl font-bold text-slate-900">{prescription.patientName || 'Student'}</h2>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ${statusStyles[prescription.status] || statusStyles.pending}`}>
                                        {prescription.status === 'collected' ? 'Collected' : prescription.status === 'completed' ? 'Completed' : prescription.status === 'active' ? 'Active' : 'Pending'}
                                    </span>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                                            <FileText className="h-3.5 w-3.5 text-violet-600" />
                                            Patient
                                        </div>
                                        <div className="font-semibold text-slate-900">{prescription.patientName || 'Student'}</div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                                            <FileText className="h-3.5 w-3.5 text-violet-600" />
                                            Doctor
                                        </div>
                                        <div className="font-semibold text-slate-900">{prescription.doctorName || 'Doctor'}</div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                                            <FileText className="h-3.5 w-3.5 text-orange-600" />
                                            Diagnosis
                                        </div>
                                        <div className="font-semibold text-slate-900">{prescription.diagnosis || '—'}</div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                                            <Pill className="h-3.5 w-3.5 text-emerald-600" />
                                            Medicines
                                        </div>
                                        <div className="font-semibold text-slate-900">{Array.isArray(prescription.medicines) ? prescription.medicines.length : (prescription.medicineName ? 1 : 0)}</div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                                            <Clock3 className="h-3.5 w-3.5 text-amber-600" />
                                            Prescription Date
                                        </div>
                                        <div className="font-semibold text-slate-900">{prescription.prescriptionDate || prescription.createdAt?.split('T')[0] || '—'}</div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="text-sm font-medium text-slate-600 mb-2">Prescription details</div>

                                    {Array.isArray(prescription.medicines) && prescription.medicines.length > 0 ? (
                                        <ul className="list-disc ml-6 text-sm text-slate-700">
                                            {prescription.medicines.map((m, idx) => (
                                                <li key={idx} className="py-0.5">
                                                    {typeof m === 'string' ? (
                                                        <>{m}{prescription.dosage ? ` — ${prescription.dosage}` : ''}{prescription.duration ? ` (${prescription.duration})` : ''}</>
                                                    ) : (
                                                        <>
                                                            <span className="font-medium">{m.name || m.label || 'Medicine'}</span>
                                                            {m.dosage && <span>{` — ${m.dosage}`}</span>}
                                                            {m.duration && <span>{` (${m.duration})`}</span>}
                                                            {m.notes && <div className="text-sm text-slate-600">{m.notes}</div>}
                                                        </>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-sm text-slate-700">{prescription.medicineName || '—'}{prescription.dosage ? ` — ${prescription.dosage}` : ''}{prescription.duration ? ` (${prescription.duration})` : ''}</div>
                                    )}

                                    {prescription.notes && <div className="mt-2 text-sm text-slate-600">Notes: {prescription.notes}</div>}

                                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div className="text-sm text-slate-600">
                                            {prescription.patientPhone ? `Contact: ${prescription.patientPhone}` : 'Student contact not provided'}
                                        </div>

                                        {prescription.status !== 'collected' && (
                                            <button
                                                type="button"
                                                onClick={() => markCollected(prescription.id)}
                                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-emerald-700"
                                            >
                                                <PackageCheck className="h-4 w-4" />
                                                Mark collected
                                            </button>
                                        )}
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
