import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { FaUsers, FaPlus, FaTrash, FaKey, FaUserDoctor, FaPills, FaVial, FaUserNurse, FaHeartPulse, FaShieldHalved, FaBellConcierge, FaUserShield, FaMagnifyingGlass, FaCheck, FaX, FaSpinner } from 'react-icons/fa6'
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore'
import { toast } from 'react-hot-toast'
import { db } from '../../firebase/config'
import { createStaffAccount, isRootAdmin, deactivateStaffAccount, suspendStaffAccount, deleteStaffAccount, logAuditEvent } from '../../utils/adminSetup'

const STAFF_ROLE_OPTIONS = [
    { key: 'doctor', label: 'Doctor', icon: FaUserDoctor },
    { key: 'pharmacist', label: 'Pharmacist', icon: FaPills },
    { key: 'labTechnician', label: 'Lab Technician', icon: FaVial },
    { key: 'nurse', label: 'Nurse', icon: FaUserNurse },
    { key: 'mentalHealthCounselor', label: 'Mental Health Counselor', icon: FaHeartPulse },
    { key: 'hivProfessional', label: 'HIV Professional', icon: FaShieldHalved },
    { key: 'admin', label: 'Admin', icon: FaUserShield }
]

const normalizeStudentApproval = (student) => {
    if (!student || student.role !== 'student') return false
    if (student.approved === true) return false
    if (student.approved === false) return true
    if (student.status === 'pending_approval') return true
    if (student.approvalStatus === 'pending') return true
    if (student.emailVerified === false && student.approved !== true) return true
    return false
}

export default function AdminStaffManagement() {
    const { currentUser } = useAuth()
    const navigate = useNavigate()

    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [staffList, setStaffList] = useState([])
    const [pendingStudents, setPendingStudents] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [creationMessage, setCreationMessage] = useState(null)
    const [auditLogs, setAuditLogs] = useState([])

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'doctor',
        phone: '',
        specialization: '',
        department: '',
        emergencyName: '',
        emergencyPhone: ''
    })

    const [errors, setErrors] = useState({})

    // Check if user is admin on mount
    useEffect(() => {
        const checkAdmin = async () => {
            if (!currentUser) {
                navigate('/login')
                return
            }

            const adminStatus = await isRootAdmin(currentUser.uid)
            if (!adminStatus) {
                navigate('/student')
                return
            }

            setIsAdmin(true)
            await loadStaffList()
            await loadPendingStudents()
            setLoading(false)
        }

        checkAdmin()
    }, [currentUser, navigate])

    useEffect(() => {
        const loadAuditLogs = async () => {
            try {
                const snapshot = await getDocs(query(collection(db, 'auditLogs'), where('createdAt', '!=', null)))
                const logs = snapshot.docs
                    .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
                    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                    .slice(0, 30)
                setAuditLogs(logs)
            } catch (error) {
                console.error('Error loading audit logs:', error)
            }
        }

        if (isAdmin) {
            loadAuditLogs()
        }
    }, [isAdmin])

    const loadStaffList = async () => {
        try {
            const staffQuery = query(
                collection(db, 'staffData'),
                where('role', '!=', 'student')
            )
            const snapshot = await getDocs(staffQuery)
            const staff = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setStaffList(staff)
        } catch (error) {
            console.error('Error loading staff:', error)
        }
    }

    const loadPendingStudents = async () => {
        try {
            // Load ALL pending accounts (students, staff, etc.) - not just students
            const pendingQuery = query(
                collection(db, 'staffData')
            )
            const snapshot = await getDocs(pendingQuery)
            const pending = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(account => normalizeStudentApproval(account))
            setPendingStudents(pending)
        } catch (error) {
            console.error('Error loading pending accounts:', error)
            setPendingStudents([])
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required'
        }

        if (!formData.role) {
            newErrors.role = 'Please select a role'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCreateStaff = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsCreating(true)
        setCreationMessage(null)

        try {
            const result = await createStaffAccount(currentUser.uid, {
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                role: formData.role,
                phone: formData.phone || null,
                specialization: formData.specialization || null,
                department: formData.department || null,
                emergencyContact: {
                    name: formData.emergencyName || null,
                    phone: formData.emergencyPhone || null
                }
            })

            if (result.success) {
                setCreationMessage({
                    type: 'success',
                    message: `Staff account created successfully! ${result.email} has been registered as a ${result.role}.`
                })

                // Reset form
                setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    fullName: '',
                    role: 'doctor',
                    phone: '',
                    specialization: '',
                    department: '',
                    emergencyName: '',
                    emergencyPhone: ''
                })
                setErrors({})

                // Reload staff list
                await loadStaffList()

                // Hide form after 3 seconds
                setTimeout(() => {
                    setShowCreateForm(false)
                    setCreationMessage(null)
                }, 3000)
            } else {
                setCreationMessage({
                    type: 'error',
                    message: result.error || 'Failed to create staff account'
                })
            }
        } catch (error) {
            setCreationMessage({
                type: 'error',
                message: error.message || 'Error creating staff account'
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeactivateStaff = async (staffId) => {
        if (!window.confirm('Are you sure you want to deactivate this staff account?')) return

        try {
            const result = await deactivateStaffAccount(currentUser.uid, staffId)
            if (result.success) {
                await loadStaffList()
            }
        } catch (error) {
            console.error('Error deactivating staff:', error)
        }
    }

    const handleSuspendStaff = async (staffId) => {
        const reason = window.prompt('Reason for suspension?', 'Suspended by administrator')
        if (reason === null) return

        try {
            const result = await suspendStaffAccount(currentUser.uid, staffId, reason || 'Suspended by administrator')
            if (result.success) {
                await loadStaffList()
                toast.success('Account suspended')
            } else {
                toast.error(result.error || 'Failed to suspend account')
            }
        } catch (error) {
            console.error('Error suspending staff:', error)
            toast.error('Failed to suspend staff account')
        }
    }

    const handleDeleteStaff = async (staffId) => {
        const reason = window.prompt('Reason for permanent deletion?', 'Deleted by administrator')
        if (reason === null) return

        const confirmed = window.confirm('This permanently removes the account from the system. Continue?')
        if (!confirmed) return

        try {
            const result = await deleteStaffAccount(currentUser.uid, staffId, reason || 'Deleted by administrator')
            if (result.success) {
                await loadStaffList()
                toast.success('Account permanently deleted')
            } else {
                toast.error(result.error || 'Failed to delete account')
            }
        } catch (error) {
            console.error('Error deleting staff:', error)
            toast.error('Failed to delete staff account')
        }
    }

    const [contactModalOpen, setContactModalOpen] = useState(false)
    const [modalStudent, setModalStudent] = useState(null)
    const [modalForm, setModalForm] = useState({ name: '', phone: '' })
    const [modalSaving, setModalSaving] = useState(false)
    const [modalErrors, setModalErrors] = useState({})
    const modalNameRef = useRef(null)

    const openContactModal = (student) => {
        setModalStudent(student)
        setModalForm({
            name: student?.emergencyContact?.name || '',
            phone: student?.emergencyContact?.phone || ''
        })
        setContactModalOpen(true)
    }

    const closeContactModal = () => {
        setContactModalOpen(false)
        setModalStudent(null)
        setModalForm({ name: '', phone: '' })
        setModalSaving(false)
        setModalErrors({})
    }

    const approveStudentConfirmed = async (studentId, contact) => {
        try {
            const studentRef = doc(db, 'staffData', studentId)
            const updatePayload = {
                approved: true,
                approvedAt: new Date().toISOString(),
                approvedBy: currentUser.uid
            }
            if (contact && (contact.name || contact.phone)) {
                updatePayload.emergencyContact = {
                    name: contact.name || null,
                    phone: contact.phone || null
                }
            }
            await updateDoc(studentRef, updatePayload)
            await loadPendingStudents()
            await loadStaffList()
        } catch (error) {
            console.error('Error approving student:', error)
            throw error
        }
    }

    const handleApproveStudent = async (student) => {
        // If student already has emergency contact, ask for confirmation
        const hasContact = student?.emergencyContact && (student.emergencyContact.name || student.emergencyContact.phone)
        if (hasContact) {
            if (!window.confirm(`Approve student ${student.fullName || student.email}?`)) return
            try {
                await approveStudentConfirmed(student.id, null)
            } catch (e) {
                console.error(e)
            }
        } else {
            // open modal to collect emergency contact
            openContactModal(student)
        }
    }

    const handleModalSaveAndApprove = async () => {
        if (!modalStudent) return
        // Validation: require at least one contact field
        const name = modalForm.name.trim()
        const phone = modalForm.phone.trim()
        if (!name && !phone) {
            setModalErrors({ form: 'Provide a name or phone for emergency contact (or click Cancel to reject).' })
            return
        }

        setModalSaving(true)
        try {
            await approveStudentConfirmed(modalStudent.id, { name: name || null, phone: phone || null })
            closeContactModal()
            toast.success('Student approved')
        } catch (error) {
            console.error('Error saving contact & approving:', error)
            setModalSaving(false)
            toast.error('Failed to approve student')
        }
    }

    const filteredStaff = staffList.filter(staff =>
        staff.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="w-12 h-12 text-teal-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-300">Loading admin panel...</p>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return null
    }

    return (
        <div className="text-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <div
                        className="relative h-36 md:h-28 lg:h-24"
                        style={{ backgroundImage: "url('/images/unzaclinicposter.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                        <div className="absolute inset-0 bg-black/45" />
                        <div className="relative z-10 p-6 flex items-center gap-3 h-full">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                <FaUsers className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Staff Management</h1>
                                <p className="text-slate-200">Create and manage staff accounts</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Account Approvals */}
                {pendingStudents.length > 0 && (
                    <div className="mb-6 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <h3 className="text-lg font-semibold mb-3 text-slate-900">Pending Account Approvals</h3>
                        <div className="space-y-3">
                            {pendingStudents.map(student => (
                                <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div>
                                        <div className="font-semibold text-slate-900">{student.fullName || student.email}</div>
                                        <div className="text-sm text-slate-600">{student.email}</div>
                                        <div className="text-xs text-slate-500 mt-1">Role: <span className="font-medium capitalize">{student.role || 'unknown'}</span></div>
                                        {student.emergencyContact && (student.emergencyContact.name || student.emergencyContact.phone) && (
                                            <div className="text-xs text-slate-600 mt-1">Emergency: {student.emergencyContact.name || ''} {student.emergencyContact.phone ? `• ${student.emergencyContact.phone}` : ''}</div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleApproveStudent(student)} className="px-3 py-2 bg-emerald-500 rounded-md text-slate-900 font-medium">Approve</button>
                                        <button onClick={() => openContactModal(student)} className="px-3 py-2 bg-slate-200 rounded-md text-slate-900">Edit Contact</button>
                                        <button onClick={() => handleDeactivateStaff(student.id)} className="px-3 py-2 bg-red-600 rounded-md text-white">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create Staff Button */}
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 text-white"
                >
                    <FaPlus className="w-5 h-5" />
                    Create New Staff Account
                </button>

                {/* Create Staff Form */}
                {showCreateForm && (
                    <div className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8 mb-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 text-slate-900">Create New Staff Account</h2>

                        {creationMessage && (
                            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${creationMessage.type === 'success'
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700'
                                : 'bg-red-500/10 border border-red-500/30 text-teal-700'
                                }`}>
                                {creationMessage.type === 'success' ? (
                                    <FaCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                ) : (
                                    <FaX className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                )}
                                <p>{creationMessage.message}</p>
                            </div>
                        )}

                        <form onSubmit={handleCreateStaff} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => {
                                            setFormData({ ...formData, email: e.target.value })
                                            if (errors.email) setErrors({ ...errors, email: '' })
                                        }}
                                        placeholder="staff@example.com"
                                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-900 outline-none transition-all duration-300 ${errors.email
                                            ? 'border-red-400 focus:bg-teal-50'
                                            : 'border-slate-200 focus:border-teal-400 focus:bg-white'
                                            }`}
                                    />
                                    {errors.email && <p className="text-teal-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => {
                                            setFormData({ ...formData, fullName: e.target.value })
                                            if (errors.fullName) setErrors({ ...errors, fullName: '' })
                                        }}
                                        placeholder="Dr. John Smith"
                                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-900 outline-none transition-all duration-300 ${errors.fullName
                                            ? 'border-red-400 focus:bg-teal-50'
                                            : 'border-slate-200 focus:border-teal-400 focus:bg-white'
                                            }`}
                                    />
                                    {errors.fullName && <p className="text-teal-500 text-sm mt-1">{errors.fullName}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => {
                                            setFormData({ ...formData, password: e.target.value })
                                            if (errors.password) setErrors({ ...errors, password: '' })
                                        }}
                                        placeholder="••••••"
                                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-900 outline-none transition-all duration-300 ${errors.password
                                            ? 'border-red-400 focus:bg-teal-50'
                                            : 'border-slate-200 focus:border-teal-400 focus:bg-white'
                                            }`}
                                    />
                                    {errors.password && <p className="text-teal-500 text-sm mt-1">{errors.password}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => {
                                            setFormData({ ...formData, confirmPassword: e.target.value })
                                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                                        }}
                                        placeholder="••••••"
                                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-900 outline-none transition-all duration-300 ${errors.confirmPassword
                                            ? 'border-red-400 focus:bg-teal-50'
                                            : 'border-slate-200 focus:border-teal-400 focus:bg-white'
                                            }`}
                                    />
                                    {errors.confirmPassword && <p className="text-teal-500 text-sm mt-1">{errors.confirmPassword}</p>}
                                </div>

                                {/* Emergency Contact Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Emergency Contact Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.emergencyName}
                                        onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                                        placeholder="Full name of next of kin"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 outline-none focus:border-teal-400 focus:bg-white transition-all duration-300"
                                    />
                                </div>

                                {/* Emergency Contact Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Emergency Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.emergencyPhone}
                                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                        placeholder="+260 XXX XXX XXX"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 outline-none focus:border-teal-400 focus:bg-white transition-all duration-300"
                                    />
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Role
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 outline-none focus:border-teal-400 focus:bg-white transition-all duration-300"
                                    >
                                        {STAFF_ROLE_OPTIONS.map(role => (
                                            <option key={role.key} value={role.key} className="bg-white text-slate-900">
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Phone (Optional)
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+260 XXX XXX XXX"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 outline-none focus:border-teal-400 focus:bg-white transition-all duration-300"
                                    />
                                </div>

                                {/* Specialization (for doctors) */}
                                {formData.role === 'doctor' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Specialization
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.specialization}
                                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                            placeholder="e.g., Cardiology"
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 outline-none focus:border-teal-400 focus:bg-white transition-all duration-300"
                                        />
                                    </div>
                                )}

                                {/* Department (for doctors) */}
                                {formData.role === 'doctor' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            placeholder="e.g., Internal Medicine"
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 outline-none focus:border-teal-400 focus:bg-white transition-all duration-300"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-white"
                                >
                                    {isCreating ? (
                                        <>
                                            <FaSpinner className="w-4 h-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus className="w-4 h-4" />
                                            Create Account
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-6 py-3 bg-slate-200 hover:bg-slate-300 rounded-xl font-semibold transition-all duration-300 text-slate-900"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Emergency Contact Modal */}
                {contactModalOpen && modalStudent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
                        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-lg border border-slate-200 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-4 text-slate-900">Emergency Contact for {modalStudent.fullName || modalStudent.email}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                                    <input
                                        ref={modalNameRef}
                                        type="text"
                                        value={modalForm.name}
                                        onChange={(e) => { setModalForm({ ...modalForm, name: e.target.value }); setModalErrors({}) }}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900"
                                        placeholder="Full name"
                                        aria-label="Emergency contact name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={modalForm.phone}
                                        onChange={(e) => { setModalForm({ ...modalForm, phone: e.target.value }); setModalErrors({}) }}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900"
                                        placeholder="e.g., +260 XXX XXX XXX"
                                        aria-label="Emergency contact phone"
                                    />
                                </div>
                                {modalErrors.form && <div className="text-sm text-teal-500">{modalErrors.form}</div>}
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={closeContactModal} className="px-4 py-2 rounded-md bg-slate-200 text-slate-900">Cancel</button>
                                <button onClick={handleModalSaveAndApprove} disabled={modalSaving} className="px-4 py-2 rounded-md bg-emerald-500 text-slate-900">{modalSaving ? 'Saving...' : 'Save & Approve'}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 outline-none focus:border-teal-400 focus:bg-slate-50 transition-all duration-300"
                        />
                    </div>
                </div>

                {/* Staff List */}
                <div className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    {filteredStaff.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-100 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold text-slate-700">Name</th>
                                        <th className="px-6 py-4 text-left font-semibold text-slate-700">Email</th>
                                        <th className="px-6 py-4 text-left font-semibold text-slate-700">Role</th>
                                        <th className="px-6 py-4 text-left font-semibold text-slate-700">Status</th>
                                        <th className="px-6 py-4 text-right font-semibold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStaff.map(staff => (
                                        <tr key={staff.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-300">
                                            <td className="px-6 py-4 text-slate-900">{staff.fullName}</td>
                                            <td className="px-6 py-4 text-slate-600">{staff.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                                                    {STAFF_ROLE_OPTIONS.find(r => r.key === staff.role)?.label || staff.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${staff.isActive === false
                                                    ? 'bg-teal-100 text-teal-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                    {staff.isActive === false ? 'Inactive' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSuspendStaff(staff.id)}
                                                        disabled={staff.isActive === false || staff.suspended === true}
                                                        className="px-3 py-1 text-amber-600 hover:text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                                                        title="Suspend account"
                                                    >
                                                        <FaX className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeactivateStaff(staff.id)}
                                                        disabled={staff.isActive === false}
                                                        className="px-3 py-1 text-teal-500 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                                                        title="Reject / deactivate"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteStaff(staff.id)}
                                                        disabled={staff.isActive === false}
                                                        className="px-3 py-1 text-teal-700 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                                                        title="Permanent delete"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <FaUsers className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50" />
                            <p className="text-slate-500">No staff members found</p>
                        </div>
                    )}
                </div>

                {/* Audit Logs */}
                <div className="mt-8 backdrop-blur-xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                        <h2 className="text-xl font-bold text-slate-900">Audit Log</h2>
                        <p className="text-sm text-slate-600">Recent activity across the platform</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Time</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Actor</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Action</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Category</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Target</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No audit activity recorded yet.</td>
                                    </tr>
                                ) : (
                                    auditLogs.map((log) => (
                                        <tr key={log.id} className="border-b border-slate-200 hover:bg-slate-50">
                                            <td className="px-6 py-4 text-slate-600 text-sm">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</td>
                                            <td className="px-6 py-4 text-slate-700 text-sm">{log.actorName || 'System'}</td>
                                            <td className="px-6 py-4 text-slate-700 text-sm uppercase tracking-wide">{log.action || 'unknown'}</td>
                                            <td className="px-6 py-4 text-slate-700 text-sm">{log.category || 'system'}</td>
                                            <td className="px-6 py-4 text-slate-700 text-sm">{log.targetName || log.targetUid || '—'}</td>
                                            <td className="px-6 py-4 text-slate-600 text-sm max-w-md">{log.details || 'No additional details'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-xl text-slate-800">
                    <p>
                        <strong>Total Staff:</strong> {filteredStaff.length} |
                        <strong className="ml-4">Allowed roles:</strong> Doctor, Pharmacist, Lab Technician, Nurse, Mental Health Counselor, HIV Professional, Receptionist, Admin
                    </p>
                </div>
            </div>
        </div >
    )
}
