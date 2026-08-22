import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { IconLock, IconUser, IconChevronLeft, IconFingerprint } from '@tabler/icons-react'
import { fetchSettings } from '../api/settings'
import { login } from '../api/auth'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallBtn, setShowInstallBtn] = useState(false)

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  // Listen for PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBtn(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if app is already running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallBtn(false)
    }
  }

  // Fetch settings dynamically using TanStack React Query
  const { data: settingsData, isPending } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    retry: false, // Don't retry infinitely if backend is offline
  })

  // Get the logo from settings API or fallback to generated avatar
  const logoUrl = settingsData?.data?.logo || '/avatar_asatidz.png'
  const bgLoginUrl = settingsData?.data?.background_login

  const containerStyle = {
    background: bgLoginUrl 
      ? `linear-gradient(rgba(4, 14, 12, 0.92), rgba(4, 14, 12, 0.96)), url(${bgLoginUrl}) center/cover no-repeat`
      : 'radial-gradient(circle at top, #0d2e24 0%, #040e0c 100%)'
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login({ username, password })
      if (response.success && response.data?.token) {
        const user = response.data.user
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user_name', user.karyawan?.nama || user.name)
        localStorage.setItem('user_jabatan', user.karyawan?.jabatan || '')
        localStorage.setItem('user_unit', user.karyawan?.nama_unit || '')
        localStorage.setItem('user_dept', user.karyawan?.nama_dept || '')
        localStorage.setItem('user_photo', user.karyawan?.foto || '')
        navigate('/dashboard', { replace: true })
      } else {
        setError(response.message || 'Login gagal.')
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'Terjadi kesalahan saat masuk. Silakan periksa koneksi internet Anda.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex flex-col justify-between max-w-md mx-auto px-6 py-6 shadow-2xl relative overflow-hidden select-none"
      style={containerStyle}
    >
      {/* Decorative Top Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />

      {/* Top Bar (Mobile App Style) */}
      <div className="flex items-center justify-between z-10">
        <button className="w-10 h-10 rounded-full bg-emerald-950/40 backdrop-blur-md border border-emerald-900/50 flex items-center justify-center text-white active:scale-95 transition-all">
          <IconChevronLeft size={20} />
        </button>
        {showInstallBtn ? (
          <button 
            onClick={handleInstallPWA}
            className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-emerald-950 text-xs font-black tracking-wide border-0 shadow-md transition-all z-20"
          >
            INSTALL APP
          </button>
        ) : (
          <div className="w-10 h-10" /> /* Spacer */
        )}
      </div>

      {/* Hero Logo / Avatar Section */}
      <div className="flex flex-col items-center z-10 my-4">
        <div className="relative">
          {/* Glowing Border Ring */}
          <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-pulse" style={{ transform: 'scale(1.05)' }} />
          <div className="w-40 h-40 overflow-hidden rounded-full border-4 border-emerald-950/60 bg-emerald-950/20 shadow-2xl flex items-center justify-center p-3">
            {isPending ? (
              <div className="w-full h-full rounded-full bg-emerald-950/40 animate-pulse flex items-center justify-center">
                <span className="loading loading-spinner loading-md text-emerald-400"></span>
              </div>
            ) : (
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="max-w-full max-h-full object-contain rounded-full"
              />
            )}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-wide mt-5">أهلاً وسهلاً</h2>
        <div className="text-3xl font-black text-emerald-400 tracking-widest mt-2">SIPRENPAS</div>
        <p className="text-xs text-white/90 font-medium tracking-wide mt-1">Portal Pelayanan Asatidz & Karyawan</p>
      </div>

      {/* Form Input Section */}
      <div className="flex-1 flex flex-col justify-center z-10 mt-2">
        {error && (
          <div className="alert alert-error bg-red-950/40 text-red-400 text-xs py-2 px-3 rounded-xl border border-red-900/50 mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          {/* Username */}
          <div className="form-control">
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-emerald-950/20 backdrop-blur-md border border-emerald-900/40 focus-within:border-emerald-500 focus-within:bg-emerald-950/30 transition-all">
              <IconUser className="text-emerald-500" size={18} />
              <input 
                type="text" 
                className="w-full bg-transparent border-0 outline-none text-sm text-white placeholder-slate-500" 
                placeholder="NPP atau Email" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-control">
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-emerald-950/20 backdrop-blur-md border border-emerald-900/40 focus-within:border-emerald-500 focus-within:bg-emerald-950/30 transition-all">
              <IconLock className="text-emerald-500" size={18} />
              <input 
                type="password" 
                className="w-full bg-transparent border-0 outline-none text-sm text-white placeholder-slate-500" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          {/* Remember & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="checkbox checkbox-xs checkbox-emerald border-emerald-900 bg-transparent rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-xs text-slate-400">Remember me</span>
            </label>
            <a href="#" className="text-xs font-semibold text-emerald-400 hover:underline">
              Forgot Password?
            </a>
          </div>

          {/* Sign In Button */}
          <button 
            type="submit" 
            className="w-full py-4 rounded-2xl mt-6 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-emerald-950 font-black text-sm tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 border-0 transition-all"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'SIGN IN'
            )}
          </button>
        </form>

        {/* Biometric Face / Fingerprint Login */}
        <div className="flex flex-col items-center mt-6">
          <button className="w-14 h-14 rounded-full bg-emerald-950/40 backdrop-blur-md border border-emerald-900/60 flex items-center justify-center text-white active:scale-95 active:bg-emerald-900/40 transition-all shadow-md">
            <IconFingerprint size={28} />
          </button>
          <span className="text-[10px] text-slate-400 mt-2 font-medium tracking-wide">Quick sign-in with Biometrics</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center mt-6 text-xs text-slate-500 z-10">
        Don't have an account?{' '}
        <a href="#" className="font-bold text-emerald-400 hover:underline">
          Contact Admin
        </a>
      </div>
    </div>
  )
}

export default Login
