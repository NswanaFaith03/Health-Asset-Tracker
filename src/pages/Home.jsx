import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const appName = import.meta.env.VITE_APP_NAME || 'DigiHealth'
  const redirectDelay = Number(import.meta.env.VITE_REDIRECT_DELAY_MS || 5000)

  useEffect(() => {
    const id = setTimeout(() => navigate('/login'), redirectDelay)
    return () => clearTimeout(id)
  }, [navigate, redirectDelay])

  useEffect(() => {
    document.title = `${appName} — Welcome`
  }, [appName])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-slate-900 px-4">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-teal-200 bg-teal-50">
          <img
            src="/images/unzamainlogo.png"
            alt="DigiHealth logo"
            className="h-full w-full object-contain"
          />
        </div>

        <div className="text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-teal-600 sm:text-5xl">DigiHealth</h1>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Clinic Management System</p>
          <p className="mt-4 text-base text-slate-600">
            Preparing your secure healthcare workspace. You will be redirected to the login portal shortly.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-teal-600" />
            <span className="text-sm text-slate-500">Redirecting in {Math.max(1, Math.round(redirectDelay / 1000))} seconds</span>
          </div>
        </div>
      </div>
    </div>
  )
}


