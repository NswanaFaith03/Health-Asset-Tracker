import { useEffect, useRef, useState } from 'react'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { FaCalendarDays, FaCamera, FaEnvelope, FaIdCard, FaUser } from 'react-icons/fa6'
import { useAuth } from '../../hooks/useAuth'
import { db } from '../../firebase/config'

export default function StudentProfile() {
    const { currentUser } = useAuth()
    const fileInputRef = useRef(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        studentId: '',
        dateOfBirth: '',
        profilePhoto: ''
    })

    useEffect(() => {
        if (!currentUser?.uid) return

        const userDocRef = doc(db, 'staffData', currentUser.uid)
        const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
            const data = snapshot.data() || {}
            const studentId = (data.studentId || data.studentNumber || '').trim()

            setForm({
                fullName: data.fullName || currentUser.displayName || '',
                email: data.email || currentUser.email || '',
                studentId,
                dateOfBirth: data.dateOfBirth || '',
                profilePhoto: data.profilePhoto || localStorage.getItem('student_profile_photo') || currentUser.photoURL || ''
            })
            setLoading(false)
        }, (error) => {
            console.error('Error fetching profile data:', error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [currentUser])

    const handleFieldChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const handlePhotoUpload = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            const result = String(reader.result || '')
            setForm((prev) => ({ ...prev, profilePhoto: result }))
            try {
                localStorage.setItem('student_profile_photo', result)
            } catch {
                // ignore storage errors
            }
        }
        reader.readAsDataURL(file)
    }

    const handleSave = async () => {
        if (!currentUser?.uid) return

        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const cleanedName = form.fullName.trim() || currentUser.displayName || 'Student'
            const cleanedStudentId = (form.studentId || '').trim()

            const profileUpdate = {
                fullName: cleanedName,
                email: form.email || currentUser.email || '',
                dateOfBirth: form.dateOfBirth || '',
                profilePhoto: form.profilePhoto || '',
                updatedAt: new Date().toISOString()
            }

            if (cleanedStudentId) {
                profileUpdate.studentId = cleanedStudentId
                profileUpdate.studentNumber = cleanedStudentId
            }

            await updateDoc(doc(db, 'staffData', currentUser.uid), profileUpdate)

            if (form.profilePhoto) {
                try {
                    localStorage.setItem('student_profile_photo', form.profilePhoto)
                } catch {
                    // ignore storage errors
                }
            }

            setMessage({ type: 'success', text: 'Profile saved successfully.' })
        } catch (error) {
            console.error('Error saving student profile:', error)
            setMessage({ type: 'error', text: 'Could not save profile. Please try again.' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="px-6 py-10 text-slate-900">
                <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-600">
                    Loading profile...
                </div>
            </div>
        )
    }

    return (
        <div className="text-slate-900">
            <main className="mx-auto max-w-5xl px-6 py-8">
                <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 bg-slate-50 px-6 py-6">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-teal-200 bg-teal-50 text-teal-600 shadow-sm transition hover:border-teal-300"
                                    title="Upload profile photo"
                                >
                                    {form.profilePhoto ? (
                                        <img src={form.profilePhoto} alt="Student profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <FaUser className="h-12 w-12" />
                                    )}
                                    <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-white shadow-md">
                                        <FaCamera className="h-3.5 w-3.5" />
                                    </span>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                </button>

                                <div>
                                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Student profile</p>
                                    <h1 className="text-2xl font-bold text-slate-900">{form.fullName || 'Student'}</h1>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? 'Saving...' : 'Save profile'}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {message.text ? (
                            <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${message.type === 'success'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-teal-200 bg-teal-50 text-teal-700'}`}>
                                {message.text}
                            </div>
                        ) : null}

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <FaIdCard className="h-4 w-4 text-teal-600" />
                                    Student ID
                                </label>
                                <input
                                    type="text"
                                    value={form.studentId}
                                    onChange={(e) => handleFieldChange('studentId', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400"
                                    placeholder="Set student ID"
                                />
                                <p className="text-xs text-slate-500">Enter the student ID used for queue and lab tracking.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <FaUser className="h-4 w-4 text-teal-600" />
                                    Full name
                                </label>
                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <FaCalendarDays className="h-4 w-4 text-teal-600" />
                                    Date of birth
                                </label>
                                <input
                                    type="date"
                                    value={form.dateOfBirth}
                                    onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <FaEnvelope className="h-4 w-4 text-teal-600" />
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleFieldChange('email', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400"
                                    placeholder="student@email.com"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
