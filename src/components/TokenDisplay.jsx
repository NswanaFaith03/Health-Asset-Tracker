import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Hash, Clock, User, AlertCircle } from 'lucide-react'
import HeaderBanner from './HeaderBanner'

export default function TokenDisplay() {
  const [currentToken, setCurrentToken] = useState(null)
  const [nextToken, setNextToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (!selectedDate) return

    setLoading(true)
    const appointmentsRef = collection(db, 'appointments')
    const q = query(
      appointmentsRef,
      where('appointmentDate', '==', selectedDate),
      where('status', 'in', ['token_generated', 'in_progress'])
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Sort by token number
      const sortedAppointments = appointmentsData.sort((a, b) => {
        if (a.tokenNumber && b.tokenNumber) {
          return a.tokenNumber - b.tokenNumber
        }
        if (a.tokenNumber) return -1
        if (b.tokenNumber) return 1
        return 0
      })

      // Find current token (in_progress)
      const current = sortedAppointments.find(apt => apt.status === 'in_progress')
      setCurrentToken(current)

      // Find next token (first token_generated)
      const next = sortedAppointments.find(apt => apt.status === 'token_generated')
      setNextToken(next)

      setLoading(false)
    }, (error) => {
      console.error('Error fetching appointments:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [selectedDate])

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-xl text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <HeaderBanner title="Patient Queue" subtitle={new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} icon={Hash} image="/images/unzaclinicposter.jpg" />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {/* Current Token */}
        {currentToken && (
          <div className="bg-slate-50 border border-green-200 rounded-3xl p-8 mb-8 text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-green-400 mb-2">Currently Serving</h2>
              <div className="w-32 h-32 bg-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-6xl font-bold text-green-400">{currentToken.tokenNumber}</span>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-slate-900 mb-2">{currentToken.patientName}</h3>
                <p className="text-lg text-slate-700">
                  {currentToken.patientAge} years, {currentToken.patientGender}
                </p>
                <p className="text-slate-400 mt-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  {currentToken.appointmentTime}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Token */}
        {nextToken && (
          <div className="bg-slate-50 border border-teal-200 rounded-3xl p-8 mb-8 text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-teal-400 mb-2">Next Patient</h2>
              <div className="w-24 h-24 bg-teal-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold text-teal-400">{nextToken.tokenNumber}</span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{nextToken.patientName}</h3>
                <p className="text-lg text-slate-700">
                  {nextToken.patientAge} years, {nextToken.patientGender}
                </p>
                <p className="text-slate-400 mt-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  {nextToken.appointmentTime}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Tokens Message */}
        {!currentToken && !nextToken && (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <AlertCircle className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Queue Empty</h2>
            <p className="text-slate-700 text-lg mb-4">
              No patients are currently waiting or being served.
            </p>
            <p className="text-slate-600 text-sm">
              Waiting for the next patient to arrive...
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold mb-4">Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-400">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Green: Currently being served</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Blue: Next in line</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
              <span>Gray: Waiting for token</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
