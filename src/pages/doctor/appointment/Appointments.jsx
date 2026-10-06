import { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import LogoutButton from '../../../components/LogoutButton'
import {
  User,
  Calendar,
  Clock,
  Phone,
  Mail,
  Check,
  X,
  AlertTriangle,
  Search,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  ArrowLeft
} from 'lucide-react'
import { collection, onSnapshot, query, orderBy, updateDoc, doc, getDoc, where } from 'firebase/firestore'
import { db } from '../../../firebase/config'

export default function DoctorAppointments() {
  const { currentUser } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState('today') // today, week, month
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showPatientDetails, setShowPatientDetails] = useState(false)

  const [doctorName, setDoctorName] = useState('')

  // Fetch doctor's name from staffData collection to match appointments
  useEffect(() => {
    if (!currentUser) return

    const fetchDoctorName = async () => {
      try {
        const userDocRef = doc(db, 'staffData', currentUser.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setDoctorName(userData.fullName || currentUser.displayName || '')
        } else {
          setDoctorName(currentUser.displayName || '')
        }
      } catch (error) {
        console.error('Error fetching doctor name:', error)
        setDoctorName(currentUser.displayName || '')
      }
    }

    fetchDoctorName()
  }, [currentUser])

  // Fetch appointments for the logged-in doctor
  useEffect(() => {
    if (!currentUser) return

    toast.success('Loading your appointments...')

    // Fetch only appointments for this doctor using doctorId
    const appointmentsRef = collection(db, 'appointments')
    const q = query(
      appointmentsRef,
      where('doctorId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doctorAppointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setAppointments(doctorAppointments)

      const regularAppointments = doctorAppointments.filter(apt => apt.source !== 'student-portal')
      if (regularAppointments.length > 0) {
        toast.success(`Loaded ${regularAppointments.length} appointments`)
      } else {
        toast.success('No appointments found for you')
      }
    }, (error) => {
      console.error('Error fetching appointments:', error)
      toast.error('Error loading appointments')
    })

    return () => unsubscribe()
  }, [currentUser])

  useEffect(() => {
    let filtered = appointments

    // Filter out student-portal appointments (they should only show in Consultation Queue)
    filtered = filtered.filter(apt => apt.source !== 'student-portal')

    // Filter by date based on view mode
    if (viewMode === 'today') {
      filtered = filtered.filter(apt => apt.appointmentDate === selectedDate)
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(selectedDate)
      const endOfWeek = new Date(selectedDate)
      endOfWeek.setDate(endOfWeek.getDate() + 7)
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate >= startOfWeek && aptDate < endOfWeek
      })
    } else if (viewMode === 'month') {
      const startOfMonth = new Date(selectedDate)
      const endOfMonth = new Date(selectedDate)
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate >= startOfMonth && aptDate < endOfMonth
      })
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.appointmentType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredAppointments(filtered)
  }, [appointments, selectedDate, viewMode, searchTerm])

  const handleViewPatientDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setShowPatientDetails(true)
    toast.success('Patient details opened!')
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value.trim()) {
      toast.success(`Searching for: "${value}"`)
    }
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    toast.success(`Viewing appointments: ${mode}`)
  }

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId)
      await updateDoc(appointmentRef, {
        status: 'completed',
        updatedAt: new Date().toISOString()
      })
      toast.success('Appointment marked as completed!')
    } catch (error) {
      console.error('Error completing appointment:', error)
      toast.error(`Error completing appointment: ${error.message}`)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId)
      await updateDoc(appointmentRef, {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      })
      toast.success('Appointment cancelled successfully!')
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error(`Error cancelling appointment: ${error.message}`)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-teal-400 bg-blue-400/10'
      case 'completed': return 'text-emerald-400 bg-emerald-400/10'
      case 'cancelled': return 'text-teal-400 bg-red-400/10'
      case 'rescheduled': return 'text-amber-400 bg-amber-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'completed': return <Check className="w-4 h-4" />
      case 'cancelled': return <X className="w-4 h-4" />
      case 'rescheduled': return <Calendar className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getAppointmentTypeColor = (type) => {
    switch (type) {
      case 'consultation': return 'text-violet-400 bg-purple-400/10'
      case 'checkup': return 'text-emerald-400 bg-emerald-400/10'
      case 'emergency': return 'text-teal-400 bg-red-400/10'
      case 'followup': return 'text-teal-400 bg-blue-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const todayAppointments = filteredAppointments.filter(apt => apt.appointmentDate === selectedDate)
  const upcomingAppointments = filteredAppointments.filter(apt =>
    apt.appointmentDate > selectedDate && apt.status === 'scheduled'
  )

  return (
    <div className="text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link
              to="/doctor"
              className="flex items-center space-x-2 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-colors border border-teal-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Patient Appointments</h1>
              <p className="text-sm text-slate-600">Welcome, {doctorName || 'Doctor'}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleViewModeChange('today')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${viewMode === 'today'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Today</span>
              </button>
              <button
                onClick={() => handleViewModeChange('week')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${viewMode === 'week'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                <CalendarRange className="w-4 h-4" />
                <span>Week</span>
              </button>
              <button
                onClick={() => handleViewModeChange('month')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${viewMode === 'month'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Month</span>
              </button>
            </div>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Today's Appointments */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 text-slate-900">
            <Calendar className="w-5 h-5 text-teal-600" />
            <span>Today's Appointments ({todayAppointments.length})</span>
          </h2>

          {todayAppointments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{appointment.patientName}</h3>
                      <p className="text-slate-600">{appointment.patientAge || 'N/A'} years old, {appointment.patientGender || 'N/A'}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="capitalize">{appointment.status}</span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAppointmentTypeColor(appointment.appointmentType)}`}>
                        {appointment.appointmentType}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>{appointment.appointmentTime}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span>{appointment.patientPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span>{appointment.patientEmail}</span>
                    </div>
                  </div>

                  {appointment.symptoms && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-1">Symptoms:</h4>
                      <p className="text-sm text-slate-600">{appointment.symptoms}</p>
                    </div>
                  )}

                  {appointment.notes && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-1">Notes:</h4>
                      <p className="text-sm text-slate-600">{appointment.notes}</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewPatientDetails(appointment)}
                      className="flex-1 px-3 py-2 bg-teal-600 hover:bg-teal-600 text-white rounded-lg text-sm transition-colors"
                    >
                      View Details
                    </button>
                    {appointment.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleCompleteAppointment(appointment.id)}
                          className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-lg text-sm transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 text-slate-900">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Upcoming Appointments ({upcomingAppointments.length})</span>
            </h2>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <h3 className="font-semibold text-slate-900">{appointment.patientName}</h3>
                      <p className="text-sm text-slate-600">
                        {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAppointmentTypeColor(appointment.appointmentType)}`}>
                        {appointment.appointmentType}
                      </span>
                      <button
                        onClick={() => handleViewPatientDetails(appointment)}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-600 text-white rounded text-sm transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Patient Details Modal */}
      {showPatientDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-slate-900">Patient Details</h2>
              <button
                onClick={() => setShowPatientDetails(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h3 className="text-lg font-semibold mb-3 text-slate-900">Patient Information</h3>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between"><span className="text-slate-500">Name:</span><span className="font-medium">{selectedAppointment.patientName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Age:</span><span>{selectedAppointment.patientAge || 'N/A'} years old</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Gender:</span><span>{selectedAppointment.patientGender || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Phone:</span><span>{selectedAppointment.patientPhone}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Email:</span><span>{selectedAppointment.patientEmail}</span></div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h3 className="text-lg font-semibold mb-3 text-slate-900">Vital Signs</h3>
                  <div className="grid grid-cols-2 gap-4 text-slate-700">
                    <div><span className="text-slate-500 text-sm">Blood Pressure</span><p className="font-medium">{selectedAppointment.vitalSigns?.bloodPressure || 'N/A'}</p></div>
                    <div><span className="text-slate-500 text-sm">Heart Rate</span><p className="font-medium">{selectedAppointment.vitalSigns?.heartRate || 'N/A'} bpm</p></div>
                    <div><span className="text-slate-500 text-sm">Temperature</span><p className="font-medium">{selectedAppointment.vitalSigns?.temperature || 'N/A'}</p></div>
                    <div><span className="text-slate-500 text-sm">Weight</span><p className="font-medium">{selectedAppointment.vitalSigns?.weight || 'N/A'}</p></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h3 className="text-lg font-semibold mb-3 text-slate-900">Medical History</h3>
                  <p className="text-slate-700">{selectedAppointment.medicalHistory || 'No medical history available'}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h3 className="text-lg font-semibold mb-3 text-slate-900">Current Medications</h3>
                  <p className="text-slate-700">{selectedAppointment.medications || 'No medications listed'}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h3 className="text-lg font-semibold mb-3 text-slate-900">Current Symptoms</h3>
                  <p className="text-slate-700">{selectedAppointment.symptoms || 'No symptoms reported'}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h3 className="text-lg font-semibold mb-3 text-slate-900">Appointment Notes</h3>
                  <p className="text-slate-700">{selectedAppointment.notes || 'No notes available'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowPatientDetails(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              {selectedAppointment.status === 'scheduled' && (
                <>
                  <button
                    onClick={() => {
                      handleCompleteAppointment(selectedAppointment.id)
                      setShowPatientDetails(false)
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-lg transition-colors"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => {
                      handleCancelAppointment(selectedAppointment.id)
                      setShowPatientDetails(false)
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Cancel Appointment
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
