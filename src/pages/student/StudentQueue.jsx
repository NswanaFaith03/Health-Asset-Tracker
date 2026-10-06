import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'
import { ArrowLeft, Clock3, Hash, UserRound, CheckCircle2 } from 'lucide-react'

export default function StudentQueue() {
    const { currentUser } = useAuth()
    const [studentId, setStudentId] = useState('')
    const [queueEntry, setQueueEntry] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!currentUser?.uid) return

        const userDocRef = doc(db, 'staffData', currentUser.uid)
        const unsubUser = onSnapshot(userDocRef, (snapshot) => {
            const data = snapshot.data() || {}
            const resolvedStudentId = (data.studentId || data.studentNumber || '').trim()
            setStudentId(resolvedStudentId)
            if (!resolvedStudentId) {
                setQueueEntry(null)
                setLoading(false)
            }
        })

        return () => unsubUser()
    }, [currentUser])

    useEffect(() => {
        if (!studentId) return

        const q = query(
            collection(db, 'studentQueue'),
            where('studentId', '==', studentId)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
                .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
            const latest = entries[0] || null
            setQueueEntry(latest)
            setLoading(false)
        }, (error) => {
            console.error('Error fetching student queue:', error)
            setQueueEntry(null)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [studentId])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
            <header className="border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-sm">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link to="/student" className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-3.5 py-2 text-sm text-slate-300 hover:border-slate-600 hover:bg-slate-900 transition">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white">Consultation Queue</h1>
                            <p className="text-sm text-slate-400">Your position and status</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-8">
                {loading ? (
                    <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-8 text-center text-slate-400 text-sm">Loading your queue status...</div>
                ) : !studentId ? (
                    <div className="rounded-lg border border-amber-600/40 bg-amber-600/15 p-6 text-amber-200 text-sm">
                        <div className="font-semibold mb-2">Student ID Not Set</div>
                        Add your student ID in your profile so the nurse can place you in the queue.
                    </div>
                ) : !queueEntry ? (
                    <div className="rounded-lg border border-dashed border-slate-600 bg-slate-950/30 p-12 text-center">
                        <div className="mb-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-700/40 mb-4 animate-pulse">
                                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-200 mb-2">Not in Queue</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                You are not currently in the consultation queue.
                            </p>
                            <p className="text-slate-500 text-xs">
                                Check back later or contact the reception desk to join the queue.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="rounded-xl border border-sky-600/40 bg-sky-600/15 p-6 shadow-subtle">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-widest text-sky-300">Position</div>
                                    <div className="mt-3 text-5xl font-bold text-white">#{queueEntry.queueNumber || 0}</div>
                                </div>
                                <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4 text-right">
                                    <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Student ID</div>
                                    <div className="mt-2 font-semibold text-sky-200">{studentId}</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-5 shadow-subtle">
                                <div className="mb-3 flex items-center gap-2">
                                    <div className="rounded-lg bg-sky-500/20 p-2">
                                        <Hash className="h-4 w-4 text-sky-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Status</div>
                                        <div className="text-sm font-medium text-slate-100 capitalize mt-1">{queueEntry.status || 'waiting'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-5 shadow-subtle">
                                <div className="mb-3 flex items-center gap-2">
                                    <div className="rounded-lg bg-amber-500/20 p-2">
                                        <Clock3 className="h-4 w-4 text-amber-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Added</div>
                                        <div className="text-sm font-medium text-slate-100 mt-1">{queueEntry.createdAt ? new Date(queueEntry.createdAt).toLocaleTimeString() : '—'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-5 shadow-subtle">
                                <div className="mb-3 flex items-center gap-2">
                                    <div className="rounded-lg bg-emerald-500/20 p-2">
                                        <UserRound className="h-4 w-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Type</div>
                                        <div className="text-sm font-medium text-slate-100 capitalize mt-1">{queueEntry.sessionType || 'Consultation'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {queueEntry.status === 'served' && (
                            <div className="rounded-lg border border-emerald-600/40 bg-emerald-600/15 p-5 text-emerald-100">
                                <div className="flex items-center gap-3 font-semibold text-sm">
                                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                                    Your consultation has been completed.
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
