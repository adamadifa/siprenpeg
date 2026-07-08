import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  IconArrowLeft,
  IconInfoCircle,
  IconTrendingUp,
  IconTrendingDown,
  IconChevronRight,
  IconWifi
} from '@tabler/icons-react'
import { getSimpananDetails } from '../api/simpanan'
import { fetchSettings } from '../api/settings'

const Simpanan: React.FC = () => {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeCard, setActiveCard] = useState(0)

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['simpananDetails'],
    queryFn: getSimpananDetails,
    retry: false
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })

  const formatRupiah = (val: number | string) => {
    const num = typeof val === 'number' ? val : parseFloat(val)
    if (isNaN(num)) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  // Track active card on scroll & add mouse drag-to-scroll for desktop
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    
    const handler = () => {
      const scrollLeft = el.scrollLeft
      const cardWidth = el.offsetWidth * 0.78 + 12 // card width + gap
      setActiveCard(Math.round(scrollLeft / cardWidth))
    }
    el.addEventListener('scroll', handler, { passive: true })

    // Drag to scroll logic
    let isDown = false
    let startX: number
    let scrollLeft: number

    const onMouseDown = (e: MouseEvent) => {
      isDown = true
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
      el.style.cursor = 'grabbing'
      el.style.userSelect = 'none'
    }
    const onMouseLeave = () => {
      isDown = false
      el.style.cursor = 'grab'
    }
    const onMouseUp = () => {
      isDown = false
      el.style.cursor = 'grab'
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - el.offsetLeft
      const walk = (x - startX) * 1.5 // Scroll speed multiplier
      el.scrollLeft = scrollLeft - walk
    }

    el.style.cursor = 'grab'
    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mouseleave', onMouseLeave)
    el.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mousemove', onMouseMove)

    return () => {
      el.removeEventListener('scroll', handler)
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('mouseleave', onMouseLeave)
      el.removeEventListener('mouseup', onMouseUp)
      el.removeEventListener('mousemove', onMouseMove)
    }
  }, [responseData])

  // Card gradient colors for variety (using CSS gradients for absolute rendering safety)
  const cardGradients = [
    'linear-gradient(135deg, #064e3b 0%, #0d7358 100%)', // green
    'linear-gradient(135deg, #1e3a5f 0%, #2d6da3 100%)', // blue
    'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)', // purple
    'linear-gradient(135deg, #92400e 0%, #d97706 100%)', // orange
    'linear-gradient(135deg, #831843 0%, #db2777 100%)', // pink
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 mt-3 text-xs font-medium">Memuat data simpanan...</p>
      </div>
    )
  }

  if (error || !responseData?.success) {
    const errMsg = (error as any)?.response?.data?.message || 'Anda belum terdaftar sebagai Anggota Koperasi Tsarwah.'
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-8">
        <div className="bg-[#064e3b] px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <IconArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-base font-bold text-white tracking-wide">Simpanan Koperasi</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <IconInfoCircle size={32} className="text-amber-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Bukan Anggota Koperasi</h3>
          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">{errMsg}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-5 py-2 bg-[#064e3b] hover:bg-[#053e30] text-white rounded-xl font-semibold text-xs transition-colors active:scale-95"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { no_anggota, total_saldo, saldo_simpanan, mutasi } = responseData.data

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Top Section */}
      <div 
        className="bg-[#064e3b] px-5 pt-5 pb-32 relative overflow-hidden"
        style={settingsData?.data?.background_login ? {
          backgroundImage: `linear-gradient(to bottom, rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.92)), url(${settingsData.data.background_login})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        {/* Decorative Ornaments */}
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-emerald-500/[0.12] blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute left-[-20px] bottom-0 w-36 h-36 rounded-full bg-white/[0.03] blur-lg pointer-events-none" />
        <div className="absolute right-1/4 top-1/4 w-1.5 h-1.5 rounded-full bg-white/20 pointer-events-none" />
        <div className="absolute left-1/3 top-1/3 w-1 h-1 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute left-10 top-4 w-20 h-20 rounded-full border border-white/[0.02] pointer-events-none" />
        <div className="absolute right-12 bottom-12 w-28 h-28 rounded-full border border-white/[0.03] pointer-events-none" />
        {/* Tsarwah Header Logo */}
        <img 
          src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/assets/template/img/tsarwah.png`} 
          alt="Tsarwah Logo" 
          className="absolute right-5 top-5 w-11 h-auto object-contain opacity-90 pointer-events-none z-10" 
        />
        <div className="relative z-10 flex items-start gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-full hover:bg-white/10 transition-colors mt-0.5">
            <IconArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">Simpanan Koperasi</h1>
            <p className="text-[10px] text-[#a7f3d0] mt-1 leading-normal font-medium max-w-[240px]">
              Pantau informasi saldo simpanan, detail kontribusi, dan mutasi transaksi koperasi Anda secara real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Credit Card — overlaps green */}
      <div className="px-5 -mt-24">
        <div className="relative w-full aspect-[1.7/1] max-w-sm mx-auto rounded-2xl bg-gradient-to-br from-[#064e3b] via-[#0a6b4f] to-[#10b981] shadow-xl overflow-hidden p-5 flex flex-col justify-between">
          {/* Card decorative circles */}
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/[0.04]" />
          <div className="absolute -right-4 top-12 w-28 h-28 rounded-full bg-white/[0.06]" />
          <div className="absolute left-10 -bottom-8 w-32 h-32 rounded-full bg-white/[0.03]" />
          
          {/* Tsarwah Logo */}
          <img 
            src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/assets/template/img/tsarwah.png`} 
            alt="Tsarwah Logo" 
            className="absolute right-5 top-12 w-[60px] h-auto object-contain opacity-85 pointer-events-none z-10" 
          />
          
          {/* Top row */}
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[9px] text-white/60 uppercase tracking-[2px] font-semibold">Kopontren Tsarwah</p>
              <p className="text-[8px] text-white/40 mt-0.5 uppercase tracking-wider">Al Amin</p>
            </div>
            <IconWifi size={20} className="text-white/30 rotate-90" />
          </div>

          {/* Chip */}
          <div className="relative z-10 mt-1">
            <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="35" height="27" rx="4" fill="#d4af37" stroke="#c5a028" strokeWidth="0.5"/>
              <line x1="0" y1="10" x2="36" y2="10" stroke="#c5a028" strokeWidth="0.5"/>
              <line x1="0" y1="18" x2="36" y2="18" stroke="#c5a028" strokeWidth="0.5"/>
              <line x1="12" y1="0" x2="12" y2="28" stroke="#c5a028" strokeWidth="0.5"/>
              <line x1="24" y1="0" x2="24" y2="28" stroke="#c5a028" strokeWidth="0.5"/>
              <rect x="13" y="11" width="10" height="6" rx="1" fill="#e8c84a" stroke="#c5a028" strokeWidth="0.3"/>
            </svg>
          </div>

          {/* Center — balance */}
          <div className="relative z-10 text-center my-auto">
            <p className="text-[9px] text-white/50 uppercase tracking-widest font-semibold mb-1">Total Saldo</p>
            <h2 className="text-[26px] font-extrabold text-white leading-none tracking-tight tabular-nums drop-shadow-sm">
              {formatRupiah(total_saldo)}
            </h2>
          </div>

          {/* Bottom row */}
          <div className="flex justify-between items-end relative z-10">
            <div>
              <p className="text-[8px] text-white/40 uppercase tracking-wider">No. Anggota</p>
              <p className="text-xs font-mono font-bold text-white tracking-[3px]">{no_anggota}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-white/40 uppercase tracking-wider">Validity</p>
              <p className="text-[10px] font-bold text-white">UNLIMITED</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {/* Section Title */}
        <div className="px-5 flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-gray-800">Jenis Simpanan</h3>
          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {saldo_simpanan.map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-300 ${
                activeCard === i ? 'w-4 h-1.5 bg-[#064e3b]' : 'w-1.5 h-1.5 bg-gray-300'
              }`} />
            ))}
          </div>
        </div>

        {/* Swipeable Credit Cards for each savings type */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar scroll-pl-5"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="shrink-0 w-[8px]" />
          {saldo_simpanan.map((item, idx) => {
            const gradient = cardGradients[idx % cardGradients.length]
            return (
              <div
                key={item.kode_simpanan}
                className="shrink-0 w-[78%] max-w-xs aspect-[1.65/1] rounded-2xl shadow-lg p-4 flex flex-col justify-between snap-start relative overflow-hidden cursor-pointer active:scale-98 transition-transform"
                style={{ backgroundImage: gradient }}
                onClick={() => navigate(`/simpanan/${encodeURIComponent(item.kode_simpanan)}`)}
              >
                {/* Decorative */}
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/[0.06]" />
                <div className="absolute right-8 -bottom-10 w-24 h-24 rounded-full bg-white/[0.04]" />

                {/* Tsarwah Logo */}
                <img 
                  src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/assets/template/img/tsarwah.png`} 
                  alt="Tsarwah Logo" 
                  className="absolute right-4 top-10 w-9 h-auto object-contain opacity-80 pointer-events-none z-10" 
                />

                {/* Top */}
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-[8px] text-white/50 uppercase tracking-[1.5px] font-semibold">{item.kode_simpanan}</p>
                    <h4 className="text-[11px] font-bold text-white mt-0.5">{item.jenis_simpanan}</h4>
                  </div>
                  <IconWifi size={16} className="text-white/20 rotate-90" />
                </div>

                {/* Chip */}
                <div className="relative z-10 mt-1">
                  <svg width="28" height="22" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="0.5" width="35" height="27" rx="4" fill="#d4af37" stroke="#c5a028" strokeWidth="0.5"/>
                    <line x1="0" y1="10" x2="36" y2="10" stroke="#c5a028" strokeWidth="0.5"/>
                    <line x1="0" y1="18" x2="36" y2="18" stroke="#c5a028" strokeWidth="0.5"/>
                    <line x1="12" y1="0" x2="12" y2="28" stroke="#c5a028" strokeWidth="0.5"/>
                    <line x1="24" y1="0" x2="24" y2="28" stroke="#c5a028" strokeWidth="0.5"/>
                    <rect x="13" y="11" width="10" height="6" rx="1" fill="#e8c84a" stroke="#c5a028" strokeWidth="0.3"/>
                  </svg>
                </div>

                {/* Balance */}
                <div className="relative z-10 mt-auto">
                  <p className="text-[8px] text-white/40 uppercase tracking-wider mb-0.5">Saldo</p>
                  <p className="text-lg font-extrabold text-white tabular-nums tracking-tight">
                    {formatRupiah(item.jumlah)}
                  </p>
                </div>

                {/* Bottom */}
                <div className="flex justify-between items-end relative z-10 mt-2">
                  <div>
                    <p className="text-[7px] text-white/35 uppercase">Anggota</p>
                    <p className="text-[9px] font-mono text-white/80 tracking-wider">{no_anggota}</p>
                  </div>
                  <p className="text-[8px] text-white/50 font-bold uppercase tracking-wider">Tsarwah</p>
                </div>
              </div>
            )
          })}
          <div className="shrink-0 w-[8px]" />

          {saldo_simpanan.length === 0 && (
            <div className="w-full bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-xs text-gray-500">Tidak ada data simpanan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="px-5 mt-2">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-gray-800">Transaksi Terakhir</h3>
          <button className="text-[10px] text-[#064e3b] font-bold flex items-center gap-0.5 hover:underline">
            Lihat Semua <IconChevronRight size={12} />
          </button>
        </div>

        <div className="space-y-2.5">
          {mutasi.map((item, idx) => {
            const isSetoran = item.jenis_transaksi === 'S'
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-100 p-3.5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSetoran ? 'bg-emerald-50' : 'bg-rose-50'
                  }`}>
                    {isSetoran ? (
                      <IconTrendingUp size={18} className="text-emerald-600" />
                    ) : (
                      <IconTrendingDown size={18} className="text-rose-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      {isSetoran ? 'Setoran' : 'Penarikan'}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.jenis_simpanan} • {formatDate(item.tanggal)}</p>
                  </div>
                </div>
                <p className={`text-xs font-extrabold tabular-nums ${
                  isSetoran ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {isSetoran ? '+' : '-'}{formatRupiah(item.jumlah)}
                </p>
              </div>
            )
          })}

          {mutasi.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <p className="text-xs text-gray-400">Belum ada riwayat transaksi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Simpanan
