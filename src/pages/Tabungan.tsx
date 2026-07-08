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
import { getTabunganDetails } from '../api/tabungan'
import { fetchSettings } from '../api/settings'

const Tabungan: React.FC = () => {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeCard, setActiveCard] = useState(0)

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['tabunganDetails'],
    queryFn: getTabunganDetails,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 mt-3 text-xs font-medium">Memuat data tabungan...</p>
      </div>
    )
  }

  if (error || !responseData?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-8">
        <div className="bg-[#064e3b] px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <IconArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-base font-bold text-white tracking-wide">Tabungan Koperasi</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4">
            <IconInfoCircle size={32} className="text-rose-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Tabungan Tidak Ditemukan</h3>
          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
            {error instanceof Error ? error.message : 'Anda belum terdaftar sebagai Anggota Koperasi Tsarwah atau tidak memiliki rekening tabungan.'}
          </p>
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

  const { total_saldo, tabungan, mutasi } = responseData.data

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Top Banner section */}
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
        
        {/* Tsarwah Logo */}
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
            <h1 className="text-base font-bold text-white tracking-wide">Tabungan Koperasi</h1>
            <p className="text-[10px] text-[#a7f3d0] mt-1 leading-normal font-medium max-w-[240px]">
              Kelola rekening tabungan sukarela dan berjangka Anda.
            </p>
          </div>
        </div>
        
        {/* Combined Account Balance */}
        <div className="relative z-10 mt-2 px-1">
          <p className="text-[10px] text-white/60 uppercase tracking-widest font-semibold">Total Saldo Tabungan</p>
          <h2 className="text-2xl font-bold text-white mt-1 tabular-nums tracking-wide">
            {formatRupiah(total_saldo)}
          </h2>
        </div>
      </div>

      {/* Credit Cards Horizontal Scroll Container — overlaps green */}
      <div className="-mt-20 relative z-10">
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-5 pb-5 scrollbar-none snap-x snap-mandatory"
        >
          {tabungan.map((item, idx) => (
            <div 
              key={item.no_rekening}
              onClick={() => navigate(`/tabungan/${item.no_rekening}`)}
              className="w-[78%] shrink-0 snap-center transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              <div 
                className="relative w-full aspect-[1.58/1] rounded-2xl shadow-lg overflow-hidden p-5 flex flex-col justify-between"
                style={{ backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)' }}
              >
                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/[0.04]" />
                <div className="absolute -right-4 top-10 w-24 h-24 rounded-full bg-white/[0.05]" />
                <div className="absolute left-10 -bottom-8 w-28 h-28 rounded-full bg-white/[0.03]" />
                
                {/* Tsarwah Watermark logo */}
                <img 
                  src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/assets/template/img/tsarwah.png`} 
                  alt="Tsarwah Logo" 
                  className="absolute right-5 top-10 w-[55px] h-auto object-contain opacity-80 pointer-events-none z-10" 
                />

                {/* Top row */}
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-[8px] text-white/60 uppercase tracking-[2px] font-semibold">Kopontren Tsarwah</p>
                    <p className="text-[7px] text-white/40 mt-0.5 uppercase tracking-wider">Tabungan Karyawan</p>
                  </div>
                  <IconWifi size={18} className="text-white/30 rotate-90" />
                </div>

                {/* Account details */}
                <div className="relative z-10 my-1">
                  <p className="text-[7px] text-white/50 uppercase tracking-widest">Saldo Rekening</p>
                  <h3 className="text-lg font-bold text-white tracking-wide tabular-nums mt-0.5">
                    {formatRupiah(item.saldo)}
                  </h3>
                </div>

                {/* Footer details */}
                <div className="flex justify-between items-end relative z-10">
                  <div>
                    <p className="text-[7px] text-white/40 uppercase tracking-wider">{item.no_rekening}</p>
                    <p className="text-[10px] font-bold text-white tracking-wide uppercase truncate max-w-[150px]">
                      {item.jenis_tabungan}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[7px] text-white/40 uppercase tracking-wider">Active</p>
                    <p className="text-[9px] font-bold text-white">YES</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {tabungan.length === 0 && (
            <div className="w-full bg-white rounded-2xl p-8 text-center text-gray-400 text-xs border border-gray-100 shadow-sm">
              Belum ada rekening tabungan aktif.
            </div>
          )}
        </div>

        {/* Indicator dots for carousel */}
        {tabungan.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-1 mb-2">
            {tabungan.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeCard === idx ? 'w-5 bg-[#064e3b]' : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Transaction History Mutations */}
      <div className="px-5 mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Mutasi Rekening Terakhir</h3>
          <span className="text-[10px] text-gray-400 font-medium">5 Transaksi</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/60 p-4 shadow-sm flex flex-col divide-y divide-gray-50">
          {mutasi.map((item, idx) => {
            const isDeposit = item.jenis_transaksi === 'S'
            return (
              <div key={item.no_transaksi || idx} className="flex items-center justify-between py-3 px-1 first:pt-1 last:pb-1">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isDeposit ? 'bg-emerald-50' : 'bg-rose-50'
                  }`}>
                    {isDeposit ? (
                      <IconTrendingUp size={18} className="text-emerald-600" />
                    ) : (
                      <IconTrendingDown size={18} className="text-rose-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 leading-normal">
                      {isDeposit ? 'Setoran Tabungan' : 'Penarikan / Debet'}
                    </h4>
                    <p className="text-[9px] text-gray-400 mt-0.5 font-medium">
                      {formatDate(item.tanggal)} • {item.jenis_tabungan || 'Tabungan'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-extrabold tabular-nums ${
                    isDeposit ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {isDeposit ? '+' : '-'}{formatRupiah(item.jumlah)}
                  </p>
                  <p className="text-[9px] text-gray-400 mt-0.5 tabular-nums">
                    Saldo: {formatRupiah(item.saldo)}
                  </p>
                </div>
              </div>
            )
          })}

          {mutasi.length === 0 && (
            <div className="py-8 text-center text-gray-400 text-xs">
              Belum ada riwayat transaksi setoran atau penarikan.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Tabungan
