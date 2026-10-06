import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { db } from '../../firebase/config'
import { collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where, addDoc, getDoc, writeBatch } from 'firebase/firestore'
import { Heart, ClipboardList, Users, Clock, Search, Plus, AlertCircle, CheckCircle, Pill, TrendingUp, Phone, Mail, Calendar } from 'lucide-react'
import HeaderBanner from '../../components/HeaderBanner'
import LogoutButton from '../../components/LogoutButton'

const LAB_TEST_OPTIONS = [
    'Full Blood Count (FBC)',
    'Malaria Test',
    'Urinalysis',
    'HIV Test',
    'Blood Glucose',
    'Liver Function Test',
    'Kidney Function Test',
    'X-Ray',
    'Stool Analysis'
]

export default function Nurse() {
    const { currentUser } = useAuth()
    const [activeTab, setActiveTab] = useState('queue')
    const [searchTerm, setSearchTerm] = useState('')
    const [studentMatches, setStudentMatches] = useState([])
    const [queueEntries, setQueueEntries] = useState([])
    const [loadingMatches, setLoadingMatches] = useState(false)
    const [labDraftByStudent, setLabDraftByStudent] = useState({})
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [vitalSigns, setVitalSigns] = useState({
        temperature: '',
        bloodPressure: '',
        pulse: '',
        respirationRate: '',
        oxygenSaturation: '',
        weight: '',
        height: '',
        notes: ''
    })
    const [careNotes, setCareNotes] = useState('')

    // Load queue
    useEffect(() => {
        const queueQuery = query(
            collection(db, 'studentQueue'),
            orderBy('queueNumber', 'asc')
        )

        const unsubscribe = onSnapshot(queueQuery, (snapshot) => {
            const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            setQueueEntries(items)
        }, (error) => {
            console.error('Error loading student queue:', error)
        })

        return () => unsubscribe()
    }, [])

    // Search students
    useEffect(() => {
        const runSearch = async () => {
            if (!searchTerm.trim()) {
                setStudentMatches([])
                return
            }

            setLoadingMatches(true)
            try {
                const studentQuery = query(
                    collection(db, 'staffData'),
                    where('role', '==', 'student')
                )
                const snapshot = await getDocs(studentQuery)
                const items = snapshot.docs
                    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
                    .filter((student) => {
                        const term = searchTerm.trim().toLowerCase()
                        const studentId = (student.studentId || student.studentNumber || '').toString().trim().toLowerCase()
                        const fullName = (student.fullName || '').toLowerCase()
                        const email = (student.email || '').toLowerCase()
                        const alternateIds = [student.id, student.uid, student.studentNumber || student.studentId]
                            .map((value) => (value || '').toString().trim().toLowerCase())
                            .filter(Boolean)

                        return alternateIds.some((value) => value.includes(term))
                            || studentId.includes(term)
                            || fullName.includes(term)
                            || email.includes(term)
                    })

                setStudentMatches(items)
            } catch (error) {
                console.error('Error searching students:', error)
                setStudentMatches([])
            } finally {
                setLoadingMatches(false)
            }
        }

        runSearch()
    }, [searchTerm])

    const nextQueueNumber = useMemo(() => {
        const waitingEntries = queueEntries.filter((entry) => entry.status !== 'served')
        return waitingEntries.length ? Math.max(...waitingEntries.map((entry) => Number(entry.queueNumber) || 0)) + 1 : 1
    }, [queueEntries])

    const addStudentToQueue = async (student) => {
        const studentId = (student.studentId || student.studentNumber || '').trim()
        if (!studentId) {
            window.alert('This student does not have a student ID yet. Ask the student to add one to their profile first.')
            return
        }

        // Validate student is active
        if (student.isActive === false) {
            window.alert('This student account is inactive. Please contact an administrator.')
            return
        }

        try {
            const latestQueueSnap = await getDocs(query(collection(db, 'studentQueue')))
            const latestQueue = latestQueueSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            const existingQueue = latestQueue.filter((entry) => entry.studentId === studentId && (entry.status || '') !== 'served')
            if (existingQueue.length > 0) {
                window.alert(`${student.fullName || 'Student'} is already in the queue as #${existingQueue[0].queueNumber}.`)
                return
            }

            const nextQueueNumberValue = latestQueue.length
                ? Math.max(...latestQueue.map((entry) => Number(entry.queueNumber) || 0), 0) + 1
                : 1

            const batch = writeBatch(db)
            const queueRef = doc(collection(db, 'studentQueue'))
            batch.set(queueRef, {
                studentId,
                studentName: student.fullName || student.email || 'Student',
                email: student.email || '',
                sessionType: 'general-consultation',
                status: 'waiting',
                queueNumber: nextQueueNumberValue,
                addedBy: currentUser?.uid || '',
                addedByName: currentUser?.displayName || 'Nurse',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            await batch.commit()

            setSearchTerm('')
            setStudentMatches([])
        } catch (error) {
            console.error('Error adding student to queue:', error)
            window.alert('Failed to add student to the queue.')
        }
    }

    const updateLabDraft = (studentDocId, field, value) => {
        setLabDraftByStudent((prev) => ({
            ...prev,
            [studentDocId]: {
                testName: '',
                notes: '',
                priority: 'normal',
                ...(prev[studentDocId] || {}),
                [field]: value
            }
        }))
    }

    const requestLabForStudent = async (student) => {
        const studentId = (student.studentId || student.studentNumber || '').trim()
        if (!studentId) {
            window.alert('This student does not have a student ID yet. Ask the student to add one to their profile first.')
            return
        }

        // Validate student is active
        if (student.isActive === false) {
            window.alert('This student account is inactive. Please contact an administrator.')
            return
        }

        // Validate nurse ID is set
        if (!currentUser?.uid) {
            window.alert('Unable to identify nurse. Please try again.')
            return
        }

        const draft = labDraftByStudent[student.id] || {}
        const testName = (draft.testName || '').trim()
        if (!testName) {
            window.alert('Please select or enter a lab test before sending the request.')
            return
        }

        try {
            await addDoc(collection(db, 'labRequests'), {
                consultationId: '',
                studentId,
                studentUid: student.uid || student.id,
                studentName: student.fullName || student.email || 'Student',
                patientEmail: student.email || '',
                doctorId: '',
                doctorName: 'Pending doctor review',
                nurseId: currentUser?.uid || '',
                nurseName: currentUser?.displayName || 'Nurse',
                testName,
                notes: (draft.notes || '').trim(),
                priority: draft.priority || 'normal',
                status: 'pending',
                source: 'nurse-referral',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })

            window.alert(`Lab request created for ${student.fullName || student.email}.`)
            setLabDraftByStudent((prev) => ({
                ...prev,
                [student.id]: { testName: '', notes: '', priority: 'normal' }
            }))
        } catch (error) {
            console.error('Error creating lab request from nurse dashboard:', error)
            window.alert('Failed to create lab request.')
        }
    }

    const serveQueueEntry = async (entry) => {
        setSelectedPatient(entry)
        setActiveTab('vital-signs')
        try {
            await updateDoc(doc(db, 'studentQueue', entry.id), {
                status: 'being-served',
                updatedAt: new Date().toISOString()
            })
        } catch (error) {
            console.error('Error updating queue entry:', error)
        }
    }

    const saveVitalSigns = async () => {
        if (!selectedPatient) return

        try {
            await addDoc(collection(db, 'vitalSigns'), {
                studentId: selectedPatient.studentId,
                studentName: selectedPatient.studentName,
                nurseId: currentUser?.uid || '',
                nurseName: currentUser?.displayName || 'Nurse',
                ...vitalSigns,
                recordedAt: new Date().toISOString()
            })

            window.alert('Vital signs recorded successfully')
            setVitalSigns({
                temperature: '',
                bloodPressure: '',
                pulse: '',
                respirationRate: '',
                oxygenSaturation: '',
                weight: '',
                height: '',
                notes: ''
            })
        } catch (error) {
            console.error('Error saving vital signs:', error)
            window.alert('Failed to save vital signs')
        }
    }

    const saveCareNotes = async () => {
        if (!selectedPatient || !careNotes.trim()) return

        try {
            await addDoc(collection(db, 'careNotes'), {
                studentId: selectedPatient.studentId,
                studentName: selectedPatient.studentName,
                nurseId: currentUser?.uid || '',
                nurseName: currentUser?.displayName || 'Nurse',
                note: careNotes,
                createdAt: new Date().toISOString()
            })

            window.alert('Care note recorded successfully')
            setCareNotes('')
        } catch (error) {
            console.error('Error saving care note:', error)
            window.alert('Failed to save care note')
        }
    }

    const createReferral = async (referralType) => {
        if (!selectedPatient) return

        try {
            await addDoc(collection(db, 'referrals'), {
                studentId: selectedPatient.studentId,
                studentName: selectedPatient.studentName,
                referredBy: currentUser?.displayName || 'Nurse',
                referredById: currentUser?.uid || '',
                referralType, // doctor, pharmacist, lab, counselor, mentalhealth, hiv
                reason: careNotes,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })

            window.alert(`Referral to ${referralType} created successfully`)
            setCareNotes('')
        } catch (error) {
            console.error('Error creating referral:', error)
            window.alert('Failed to create referral')
        }
    }

    return (
        <div>
            <HeaderBanner
                title="Nurse Dashboard"
                subtitle={`Welcome, ${currentUser?.displayName || 'Nurse'}`}
                icon={Heart}
                color="emerald"
            />

            <main className="mx-auto max-w-7xl px-6 py-8">
                {/* Metrics */}
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs uppercase tracking-wide text-slate-600 font-semibold">In Queue</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900">{queueEntries.filter((e) => e.status !== 'served').length}</div>
                        <p className="text-sm text-slate-600 mt-1">Patients waiting</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-4 w-4 text-teal-600" />
                            <span className="text-xs uppercase tracking-wide text-slate-600 font-semibold">Vitals Recorded</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900">12</div>
                        <p className="text-sm text-slate-600 mt-1">Today</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Pill className="h-4 w-4 text-teal-600" />
                            <span className="text-xs uppercase tracking-wide text-slate-600 font-semibold">Medications</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900">8</div>
                        <p className="text-sm text-slate-600 mt-1">Administered</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-violet-600" />
                            <span className="text-xs uppercase tracking-wide text-slate-600 font-semibold">Referrals</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900">3</div>
                        <p className="text-sm text-slate-600 mt-1">Pending</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-slate-200">
                    <div className="flex flex-wrap gap-1">
                        {[
                            { id: 'queue', label: 'Queue', icon: Clock },
                            { id: 'patient-lookup', label: 'Find Patient', icon: Search },
                            { id: 'vital-signs', label: 'Vital Signs', icon: Heart },
                            { id: 'care-notes', label: 'Care Notes', icon: ClipboardList },
                            { id: 'referrals', label: 'Referrals', icon: TrendingUp }
                        ].map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === tab.id
                                        ? 'border-emerald-600 text-emerald-600'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {/* Queue Tab */}
                    {activeTab === 'queue' && (
                        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-emerald-600" />
                                    <h2 className="text-lg font-bold text-slate-900">Add Patient to Queue</h2>
                                </div>

                                <div className="mb-4">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by ID, name, or email"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                                    />
                                </div>

                                {loadingMatches ? (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-slate-600 text-sm">Searching...</div>
                                ) : studentMatches.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-slate-600 text-sm">
                                        {searchTerm ? 'No patients found' : 'Search to find patients'}
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-80 overflow-y-auto">
                                        {studentMatches.map((student) => (
                                            <div key={student.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-slate-900 text-sm">{student.fullName || student.email}</div>
                                                    <div className="text-xs text-slate-500">{student.studentId || student.studentNumber}</div>

                                                    <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto]">
                                                        <input
                                                            list={`lab-tests-${student.id}`}
                                                            value={(labDraftByStudent[student.id]?.testName) || ''}
                                                            onChange={(e) => updateLabDraft(student.id, 'testName', e.target.value)}
                                                            placeholder="Specify lab test"
                                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                                                        />
                                                        <datalist id={`lab-tests-${student.id}`}>
                                                            {LAB_TEST_OPTIONS.map((test) => (
                                                                <option key={test} value={test} />
                                                            ))}
                                                        </datalist>

                                                        <select
                                                            value={(labDraftByStudent[student.id]?.priority) || 'normal'}
                                                            onChange={(e) => updateLabDraft(student.id, 'priority', e.target.value)}
                                                            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-900 focus:border-emerald-400 focus:outline-none"
                                                        >
                                                            <option value="normal">Normal</option>
                                                            <option value="urgent">Urgent</option>
                                                            <option value="high">High</option>
                                                        </select>

                                                        <button
                                                            onClick={() => requestLabForStudent(student)}
                                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                                                        >
                                                            Request Lab
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center self-start">
                                                    <button
                                                        onClick={() => addStudentToQueue(student)}
                                                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-emerald-700"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Add to consultation queue
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-emerald-600" />
                                        <h2 className="text-lg font-bold text-slate-900">Current Queue</h2>
                                    </div>
                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        {queueEntries.filter((e) => e.status !== 'served').length}
                                    </span>
                                </div>

                                {queueEntries.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-slate-600 text-sm">Queue is empty</div>
                                ) : (
                                    <div className="space-y-2 max-h-80 overflow-y-auto">
                                        {queueEntries.filter((e) => e.status !== 'served').map((entry) => (
                                            <div key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Position #{entry.queueNumber}</div>
                                                        <div className="mt-1 font-semibold text-slate-900 text-sm">{entry.studentName}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5">{entry.studentId}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => serveQueueEntry(entry)}
                                                        className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-slate-900 hover:bg-emerald-700 whitespace-nowrap"
                                                    >
                                                        Serve
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Patient Lookup */}
                    {activeTab === 'patient-lookup' && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                                <Search className="h-5 w-5 text-emerald-600" />
                                Patient Lookup
                            </h2>
                            {selectedPatient ? (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900">{selectedPatient.studentName}</h3>
                                            <p className="text-slate-600">ID: {selectedPatient.studentId}</p>
                                            {selectedPatient.email && (
                                                <p className="flex items-center gap-2 text-slate-600 mt-2">
                                                    <Mail className="h-4 w-4" />
                                                    {selectedPatient.email}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setSelectedPatient(null)}
                                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                                    Search a patient from the queue to view their details
                                </div>
                            )}
                        </div>
                    )}

                    {/* Vital Signs Tab */}
                    {activeTab === 'vital-signs' && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
                                <Heart className="h-5 w-5 text-teal-600" />
                                Record Vital Signs
                            </h2>

                            {selectedPatient ? (
                                <div className="space-y-6">
                                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                                        <p className="font-semibold text-emerald-900">Patient: {selectedPatient.studentName}</p>
                                        <p className="text-sm text-emerald-800">ID: {selectedPatient.studentId}</p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Temperature (°C)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={vitalSigns.temperature}
                                                onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                                                placeholder="36.5"
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Blood Pressure (mmHg)</label>
                                            <input
                                                type="text"
                                                value={vitalSigns.bloodPressure}
                                                onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                                                placeholder="120/80"
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Pulse (bpm)</label>
                                            <input
                                                type="number"
                                                value={vitalSigns.pulse}
                                                onChange={(e) => setVitalSigns({ ...vitalSigns, pulse: e.target.value })}
                                                placeholder="72"
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">O₂ Saturation (%)</label>
                                            <input
                                                type="number"
                                                value={vitalSigns.oxygenSaturation}
                                                onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSaturation: e.target.value })}
                                                placeholder="98"
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Respiration Rate</label>
                                            <input
                                                type="number"
                                                value={vitalSigns.respirationRate}
                                                onChange={(e) => setVitalSigns({ ...vitalSigns, respirationRate: e.target.value })}
                                                placeholder="16"
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Weight (kg)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={vitalSigns.weight}
                                                onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                                                placeholder="70"
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Height (cm)</label>
                                            <input
                                                type="number"
                                                value={vitalSigns.height}
                                                onChange={(e) => setVitalSigns({ ...vitalSigns, height: e.target.value })}
                                                placeholder="170"
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                                        <textarea
                                            value={vitalSigns.notes}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, notes: e.target.value })}
                                            placeholder="Any additional observations..."
                                            rows="3"
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                                        />
                                    </div>

                                    <button
                                        onClick={saveVitalSigns}
                                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-slate-900 hover:bg-emerald-700"
                                    >
                                        <CheckCircle className="h-5 w-5" />
                                        Save Vital Signs
                                    </button>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                                    Serve a patient from the queue to record vital signs
                                </div>
                            )}
                        </div>
                    )}

                    {/* Care Notes Tab */}
                    {activeTab === 'care-notes' && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
                                <ClipboardList className="h-5 w-5 text-teal-600" />
                                Care Notes & Observations
                            </h2>

                            {selectedPatient ? (
                                <div className="space-y-6">
                                    <div className="rounded-xl bg-teal-50 border border-teal-200 p-4">
                                        <p className="font-semibold text-blue-900">Patient: {selectedPatient.studentName}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Care Note</label>
                                        <textarea
                                            value={careNotes}
                                            onChange={(e) => setCareNotes(e.target.value)}
                                            placeholder="Document observations, interventions, and patient response..."
                                            rows="6"
                                            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={saveCareNotes}
                                            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2.5 font-semibold text-white hover:bg-teal-700"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Save Note
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                                    Select a patient to add care notes
                                </div>
                            )}
                        </div>
                    )}

                    {/* Referrals Tab */}
                    {activeTab === 'referrals' && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
                                <TrendingUp className="h-5 w-5 text-violet-600" />
                                Create Referral
                            </h2>

                            {selectedPatient ? (
                                <div className="space-y-6">
                                    <div className="rounded-xl bg-violet-50 border border-violet-200 p-4">
                                        <p className="font-semibold text-violet-900">Patient: {selectedPatient.studentName}</p>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2">
                                        {[
                                            { type: 'doctor', label: 'Refer to Doctor', color: 'emerald' },
                                            { type: 'pharmacist', label: 'Refer to Pharmacist', color: 'blue' },
                                            { type: 'lab', label: 'Refer to Lab', color: 'orange' },
                                            { type: 'counselor', label: 'Mental Health Counselor', color: 'purple' },
                                            { type: 'hiv', label: 'HIV Professional', color: 'red' },
                                            { type: 'specialist', label: 'Specialist', color: 'pink' }
                                        ].map((referral) => (
                                            <button
                                                key={referral.type}
                                                onClick={() => createReferral(referral.type)}
                                                className={`rounded-lg border border-${referral.color}-200 bg-${referral.color}-50 px-4 py-3 font-semibold text-${referral.color}-700 hover:bg-${referral.color}-100 transition text-sm`}
                                            >
                                                {referral.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Referral Reason</label>
                                        <textarea
                                            value={careNotes}
                                            onChange={(e) => setCareNotes(e.target.value)}
                                            placeholder="Reason for referral..."
                                            rows="4"
                                            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                                    Select a patient to create a referral
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <LogoutButton />
                </div>
            </main>
        </div>
    )
}
