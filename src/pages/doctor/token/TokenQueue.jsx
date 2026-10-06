import { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import LogoutButton from '../../../components/LogoutButton'
import HeaderBanner from '../../../components/HeaderBanner'
import {
  Hash,
  Calendar,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  ArrowLeft,
  Search,
  Play,
  Check
} from 'lucide-react'
import { collection, onSnapshot, query, where, updateDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '../../../firebase/config'

export default function TokenQueue() {
  const { currentUser } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])


  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(false)
  const [doctorName, setDoctorName] = useState('')
  const [currentToken, setCurrentToken] = useState(null)
  const [error, setError] = useState('')

  // No need to fetch doctorName for querying; use currentUser.uid (doctorId) for reliable queries
  useEffect(() => {
    if (!currentUser) return
    setDoctorName(currentUser.displayName || '')
  }, [currentUser])

  // Fetch appointments for the selected date and doctor
  useEffect(() => {
    if (!selectedDate || !currentUser) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const appointmentsRef = collection(db, 'appointments')
      const q = query(
        appointmentsRef,
        where('appointmentDate', '==', selectedDate),
        where('doctorId', '==', currentUser?.uid || '')
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const appointmentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Filter out student-portal appointments (they should only show in Consultation Queue)
        const regularAppointments = appointmentsData.filter(apt => apt.source !== 'student-portal')

        // Debug: log appointments returned for this doctor/date
        try { console.debug('TokenQueue onSnapshot docs:', regularAppointments.map(a => ({ id: a.id, status: a.status, tokenNumber: a.tokenNumber }))) } catch (e) { }

        // Sort by token number if available, otherwise by creation time
        const sortedAppointments = regularAppointments.sort((a, b) => {
          if (a.tokenNumber && b.tokenNumber) {
            return a.tokenNumber - b.tokenNumber
          }
          if (a.tokenNumber) return -1
          if (b.tokenNumber) return 1
          // Parse dates for comparison
          const dateA = new Date(a.createdAt || 0)
          const dateB = new Date(b.createdAt || 0)
          return dateA - dateB
        })

        setAppointments(sortedAppointments)
        setFilteredAppointments(sortedAppointments)

        // Set current token (first token_generated or in_progress)
        const current = sortedAppointments.find(apt =>
          apt.status === 'token_generated' || apt.status === 'in_progress'
        )
        setCurrentToken(current)

        setLoading(false)
      }, (error) => {
        console.error('Error fetching appointments:', error)
        setError('Error loading appointments')
        setLoading(false)
        toast.error('Error loading appointments')
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setError('Error loading appointments')
      setLoading(false)
      toast.error('Error loading appointments')
    }
  }, [selectedDate, currentUser])



  // Filter appointments based on search and status
  useEffect(() => {
    let filtered = appointments

    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.patientPhone.includes(searchTerm) ||
        (appointment.tokenNumber && appointment.tokenNumber.toString().includes(searchTerm))
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === filterStatus)
    }

    setFilteredAppointments(filtered)
  }, [appointments, searchTerm, filterStatus])

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId)
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })

      toast.success(`Appointment status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating appointment status:', error)
      toast.error('Error updating appointment status')
    }
  }

  // Call next patient
  const callNextPatient = async () => {
    const nextPatient = appointments.find(apt => apt.status === 'token_generated')
    if (nextPatient) {
      await updateAppointmentStatus(nextPatient.id, 'in_progress')
      toast.success(`Calling patient ${nextPatient.patientName} with token ${nextPatient.tokenNumber}`)
    } else {
      toast.info('No more patients waiting')
    }
  }

  // Complete current consultation
  const completeConsultation = async () => {
    if (currentToken && currentToken.status === 'in_progress') {
      await updateAppointmentStatus(currentToken.id, 'completed')
      toast.success(`Consultation completed for ${currentToken.patientName}`)
    }
  }

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'scheduled':
        return { color: 'text-teal-400 bg-blue-400/10', icon: ClockIcon }
      case 'token_generated':
        return { color: 'text-emerald-400 bg-emerald-400/10', icon: CheckCircle }
      case 'in_progress':
        return { color: 'text-amber-400 bg-amber-400/10', icon: AlertCircle }
      case 'completed':
        return { color: 'text-emerald-600 bg-emerald-600/10', icon: CheckCircle }
      case 'cancelled':
        return { color: 'text-teal-400 bg-red-400/10', icon: AlertCircle }
      default:
        return { color: 'text-gray-400 bg-gray-400/10', icon: ClockIcon }
    }
  }

  // Get today's date in readable format
  const getTodayDisplay = () => {
    const today = new Date()
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get queue statistics
  const getQueueStats = () => {
    const waiting = appointments.filter(apt => apt.status === 'token_generated').length
    const inProgress = appointments.filter(apt => apt.status === 'in_progress').length
    const completed = appointments.filter(apt => apt.status === 'completed').length
    const total = appointments.filter(apt => apt.tokenNumber).length

    return { waiting, inProgress, completed, total }
  }

  const queueStats = getQueueStats()



  return (
    <div className="text-slate-900">
      <HeaderBanner title="Patient Queue" subtitle={`View and manage patient tokens for today — ${getTodayDisplay()}`} icon={Hash} image="/images/doctor.jpg" />
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center mb-4">
        <Link
          to="/doctor"
          className="flex items-center space-x-2 px-3 py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>
        <LogoutButton />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4 backdrop-blur-xl mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-teal-400" />
              <span className="text-teal-300">{error}</span>
            </div>
          </div>
        )}





        {/* Current Token Display */}
        {currentToken && (
          <div className="bg-gradient-to-r from-blue-500/20 to-green-500/20 border border-teal-400/30 rounded-2xl p-6 backdrop-blur-xl mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-teal-600/30 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl font-bold text-teal-400">{currentToken.tokenNumber}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Current Patient</h2>
                  <p className="text-lg text-teal-200">{currentToken.patientName}</p>
                  <p className="text-slate-300">
                    {currentToken.patientAge} years, {currentToken.patientGender} • {currentToken.appointmentTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {currentToken.status === 'in_progress' && (
                  <button
                    onClick={completeConsultation}
                    className="flex items-center space-x-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Complete Consultation</span>
                  </button>
                )}

                <button
                  onClick={callNextPatient}
                  disabled={queueStats.waiting === 0}
                  className="flex items-center space-x-2 px-6 py-3 bg-teal-600 hover:bg-teal-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Call Next Patient</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Date Selection and Stats */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h2 className="text-lg font-semibold mb-2">Today's Queue</h2>
              <p className="text-slate-400">{getTodayDisplay()}</p>
            </div>

            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:border-teal-400 focus:outline-none"
              />

              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400">{queueStats.total}</div>
                <div className="text-sm text-slate-400">Total Tokens</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{queueStats.waiting}</div>
                <div className="text-sm text-slate-400">Waiting</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{queueStats.inProgress}</div>
                <div className="text-sm text-slate-400">In Progress</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{queueStats.completed}</div>
                <div className="text-sm text-slate-400">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, phone, or token number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:border-teal-400 focus:outline-none"
                />
              </div>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:border-teal-400 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="token_generated">Waiting</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Queue List */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading queue...</p>
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="relative w-16 h-16">
                  <AlertCircle className="w-16 h-16 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div className="text-slate-900 text-lg font-medium mb-2">No Patients in Queue</div>
              <div className="text-slate-600 text-sm max-w-sm">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No appointments scheduled for the selected date. Waiting for patients to check in...'}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Token</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Patient</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Appointment</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredAppointments.map((appointment) => {
                    const statusInfo = getStatusInfo(appointment.status)
                    const StatusIcon = statusInfo.icon
                    const isCurrentPatient = currentToken && currentToken.id === appointment.id

                    return (
                      <tr
                        key={appointment.id}
                        className={`hover:bg-white/5 transition-colors ${isCurrentPatient ? 'bg-teal-600/10 border-l-4 border-l-blue-400' : ''
                          }`}
                      >
                        <td className="px-6 py-4">
                          {appointment.tokenNumber ? (
                            <div className="flex items-center space-x-2">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isCurrentPatient ? 'bg-teal-600/30' : 'bg-teal-600/20'
                                }`}>
                                <span className="text-xl font-bold text-teal-400">{appointment.tokenNumber}</span>
                              </div>
                              {isCurrentPatient && (
                                <span className="text-xs bg-teal-600 text-white px-2 py-1 rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-slate-400">-</div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">{appointment.patientName}</div>
                            <div className="text-sm text-slate-400">
                              {appointment.patientAge} years, {appointment.patientGender}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{appointment.patientPhone}</span>
                            </div>
                            {appointment.patientEmail && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-400">{appointment.patientEmail}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{appointment.appointmentDate}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-400">{appointment.appointmentTime}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {appointment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {appointment.status === 'token_generated' && (
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}
                                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs rounded-lg transition-colors"
                                title="Start Consultation"
                              >
                                Start
                              </button>
                            )}

                            {appointment.status === 'in_progress' && (
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-900 text-xs rounded-lg transition-colors"
                                title="Complete Consultation"
                              >
                                Complete
                              </button>
                            )}

                            <Link
                              to={`/doctor/prescriptions/create/${appointment.id}`}
                              className="px-3 py-1 bg-teal-600 hover:bg-teal-600 text-white text-xs rounded-lg transition-colors"
                              title="Create Prescription"
                            >
                              Prescription
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
