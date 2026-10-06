import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { db } from '../firebase/config'
import { doc, onSnapshot, addDoc, collection, getDoc } from 'firebase/firestore'
import { FaPhone, FaLocationDot } from 'react-icons/fa6'
import toast from 'react-hot-toast'

export default function EmergencyWidget() {
    const { currentUser } = useAuth()
    const [emergencyNumber, setEmergencyNumber] = useState('')
    const [geoLoading, setGeoLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [locationError, setLocationError] = useState('')

    useEffect(() => {
        if (!currentUser?.uid) return

        const emergencySettingsRef = doc(db, 'systemSettings', 'emergencyResponse')
        const unsubscribe = onSnapshot(emergencySettingsRef, (snapshot) => {
            const data = snapshot.data() || {}
            setEmergencyNumber(data.emergencyPhone || '')
        })

        return () => unsubscribe()
    }, [currentUser])

    const captureEmergencyLocation = async () => {
        if (!currentUser?.uid) return null

        setGeoLoading(true)
        setLocationError('')

        const getLocation = () =>
            new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocation not available in this browser'))
                    return
                }

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy
                        })
                    },
                    (error) => {
                        if (error.code === error.PERMISSION_DENIED) {
                            reject(new Error('Location permission denied. Please enable location access in browser settings.'))
                        } else if (error.code === error.POSITION_UNAVAILABLE) {
                            reject(new Error('Location service unavailable. GPS may be disabled.'))
                        } else if (error.code === error.TIMEOUT) {
                            reject(new Error('Location request timed out. Please try again.'))
                        } else {
                            reject(new Error(`Location error: ${error.message}`))
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 15000,
                        maximumAge: 0
                    }
                )
            })

        try {
            const coords = await getLocation()
            const studentDoc = await getDoc(doc(db, 'staffData', currentUser.uid))
            const studentData = studentDoc.data() || {}

            const record = {
                studentId: currentUser.uid,
                studentName: studentData.fullName || currentUser.displayName || currentUser.email || 'Student',
                studentEmail: currentUser.email || '',
                emergencyPhone: emergencyNumber || '',
                coordinates: coords,
                status: 'emergency_call_initiated',
                createdAt: new Date().toISOString(),
                source: 'web_app'
            }

            await addDoc(collection(db, 'emergencyAlerts'), record)
            toast.success('Location shared with emergency desk')
            return coords
        } catch (error) {
            console.error('Error capturing emergency location:', error)
            const errorMsg = error.message || 'Could not get location'
            setLocationError(errorMsg)
            toast.error(errorMsg)
            return null
        } finally {
            setGeoLoading(false)
        }
    }

    const handleEmergencyCall = async () => {
        if (!emergencyNumber) {
            toast.error('Emergency number not configured by admin')
            return
        }

        // Try to get location, but don't block the call if it fails
        await captureEmergencyLocation()

        const cleanNumber = emergencyNumber.replace(/\s+/g, '')
        const telHref = `tel:${cleanNumber}`

        if (window && typeof window !== 'undefined') {
            try {
                window.location.href = telHref
            } catch (error) {
                console.error('Emergency call failed:', error)
                toast.error('Could not initiate call')
            }
        }

        setIsOpen(false)
    }

    return (
        <div className="fixed bottom-6 right-6 z-40">
            {isOpen && (
                <div className="mb-4 max-w-xs flex flex-col gap-3 rounded-2xl border border-red-200 bg-white p-4 shadow-xl">
                    <p className="text-sm font-semibold text-slate-900">Emergency Support</p>
                    {emergencyNumber ? (
                        <>
                            <p className="text-xs text-slate-600">
                                Calling this number will attempt to send your location to the emergency desk.
                            </p>

                            {locationError && (
                                <div className="rounded-lg border border-amber-300 bg-amber-50 p-2.5">
                                    <p className="text-xs font-medium text-amber-900">{locationError}</p>
                                    <button
                                        onClick={() => {
                                            setLocationError('')
                                            captureEmergencyLocation()
                                        }}
                                        disabled={geoLoading}
                                        className="mt-2 text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
                                    >
                                        {geoLoading ? 'Retrying...' : 'Retry location'}
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={handleEmergencyCall}
                                disabled={geoLoading}
                                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                            >
                                <FaPhone className="h-4 w-4" />
                                {geoLoading ? 'Locating...' : `Call ${emergencyNumber}`}
                            </button>
                        </>
                    ) : (
                        <p className="text-xs text-slate-600">Emergency number not set by admin</p>
                    )}
                </div>
            )}

            <button
                onClick={() => {
                    setIsOpen(!isOpen)
                    setLocationError('')
                }}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition hover:shadow-xl"
                title="Emergency call widget"
            >
                <FaPhone className="h-6 w-6" />
            </button>
        </div>
    )
}
