import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import LogoutButton from '../../components/LogoutButton'
import EmailVerificationStatus from '../../components/EmailVerificationStatus'
import { FaUserDoctor, FaCalendar, FaUserInjured, FaPills, FaCalendarDay, FaFileLines, FaPlus, FaHashtag, FaClipboardList } from 'react-icons/fa6'
import HeaderBanner from '../../components/HeaderBanner'
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

export default function Doctor() {
  const { currentUser, userRole } = useAuth()
  const [stats, setStats] = useState({
    todayAppointments: 0,
    waitingPatients: 0,
    weeklyPrescriptions: 0,
    loading: true
  })
  const [doctorName, setDoctorName] = useState('')

  // Fetch doctor's name from staffData collection
  useEffect(() => {
    if (!currentUser) return

    const fetchDoctorName = async () => {
      try {
        const userDocRef = doc(db, 'staffData', currentUser.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          const name = userData.fullName || currentUser.displayName || 'Unknown Doctor'
          setDoctorName(name)
        } else {
          setDoctorName(currentUser.displayName || 'Unknown Doctor')
        }
      } catch (error) {
        console.error('Error fetching doctor name:', error)
        setDoctorName(currentUser.displayName || 'Unknown Doctor')
      }
    }

    fetchDoctorName()
  }, [currentUser])

  // Fetch real-time stats
  useEffect(() => {
    if (!currentUser) return

    const today = new Date().toISOString().split('T')[0]
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)

    let regularTodayCount = 0
    let regularWaitingCount = 0
    let weeklyPrescriptionCount = 0

    const updateStatsState = () => {
      setStats(prev => ({
        ...prev,
        todayAppointments: regularTodayCount,
        waitingPatients: regularWaitingCount,
        weeklyPrescriptions: weeklyPrescriptionCount,
        loading: false
      }))
    }

    // Query for today's regular patient appointments assigned to this doctor (use doctorId for reliability)
    const todayAppointmentsRef = collection(db, 'appointments')
    const todayQuery = query(
      todayAppointmentsRef,
      where('appointmentDate', '==', today),
      where('doctorId', '==', currentUser?.uid || '')
    )

    // Query for weekly prescriptions
    const weeklyPrescriptionsRef = collection(db, 'prescriptions')
    const weeklyQuery = query(
      weeklyPrescriptionsRef,
      where('doctorId', '==', currentUser.uid)
    )

    const unsubscribeToday = onSnapshot(todayQuery, (snapshot) => {
      regularTodayCount = snapshot.docs.filter(docSnap => {
        const data = docSnap.data()
        return data.source !== 'student-portal'
      }).length

      regularWaitingCount = snapshot.docs.filter(docSnap => {
        const data = docSnap.data()
        return data.status === 'token_generated' || data.status === 'in_progress'
      }).length

      updateStatsState()
    })

    const unsubscribeWeekly = onSnapshot(weeklyQuery, (snapshot) => {
      weeklyPrescriptionCount = snapshot.docs.filter(doc => {
        const data = doc.data()
        const createdAt = new Date(data.createdAt)
        return createdAt >= weekStart
      }).length
      updateStatsState()
    })

    return () => {
      unsubscribeToday()
      unsubscribeWeekly()
    }
  }, [currentUser])

  return (
    <div className="text-slate-900">
      <HeaderBanner title="Doctor Dashboard" subtitle={`Welcome, ${currentUser?.displayName || 'Doctor'}`} icon={FaUserDoctor} image="/images/doctor.jpg" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <Link to="/doctor/tokens" className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FaHashtag className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-semibold text-slate-900">Patient Queue</h3>
              </div>
              <FaHashtag className="w-4 h-4 text-amber-500" />
            </div>
            {stats.loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                <p className="text-lg text-slate-500">Loading...</p>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-amber-500">{stats.waitingPatients}</p>
                <p className="text-sm text-slate-600 mt-2">
                  {stats.waitingPatients === 0 ? 'No patients waiting' :
                    stats.waitingPatients === 1 ? 'patient waiting' :
                      'patients waiting'}
                </p>
              </>
            )}
            <p className="text-xs text-amber-500 mt-2">Click to view queue →</p>
          </Link>

          <Link to="/doctor/prescriptions" className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FaPills className="w-6 h-6 text-violet-600" />
                <h3 className="text-lg font-semibold text-slate-900">Prescriptions</h3>
              </div>
              <FaFileLines className="w-4 h-4 text-violet-600" />
            </div>
            {stats.loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <p className="text-lg text-slate-500">Loading...</p>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-violet-600">{stats.weeklyPrescriptions}</p>
                <p className="text-sm text-slate-600 mt-2">
                  {stats.weeklyPrescriptions === 0 ? 'No prescriptions this week' :
                    'prescriptions this week'}
                </p>
              </>
            )}
            <p className="text-xs text-violet-600 mt-2">Click to manage prescriptions →</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/doctor/prescriptions/create" className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:bg-slate-100 transition-colors">
              <div className="flex items-center space-x-3">
                <FaPlus className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">New Prescription</h3>
                  <p className="text-sm text-slate-600">Create prescription for patient</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/prescriptions" className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:bg-slate-100 transition-colors">
              <div className="flex items-center space-x-3">
                <FaFileLines className="w-5 h-5 text-violet-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">View Prescriptions</h3>
                  <p className="text-sm text-slate-600">Manage all prescriptions</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/prescriptions/medicines" className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:bg-slate-100 transition-colors">
              <div className="flex items-center space-x-3">
                <FaPills className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-semibold text-slate-900">Manage Medicines</h3>
                  <p className="text-sm text-slate-600">Add/edit medicine inventory</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/tokens" className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:bg-slate-100 transition-colors">
              <div className="flex items-center space-x-3">
                <FaHashtag className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">Patient Queue</h3>
                  <p className="text-sm text-slate-600">View and manage patient tokens</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/consultations" className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:bg-slate-100 transition-colors">
              <div className="flex items-center space-x-3">
                <FaClipboardList className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">Consultation Queue</h3>
                  <p className="text-sm text-slate-600">View student consultations</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* User Info Card */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Email</p>
              <p className="text-white font-medium">{currentUser?.email}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Role</p>
              <p className="text-teal-400 font-medium capitalize">{userRole}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Full Name</p>
              <p className="text-white font-medium">{currentUser?.displayName}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Email Verified</p>
              <EmailVerificationStatus />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


