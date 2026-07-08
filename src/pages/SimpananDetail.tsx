import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  IconArrowLeft,
  IconInfoCircle,
  IconTrendingDown,
  IconTrendingUp,
  IconCalendar,
  IconCreditCard,
  IconWifi,
  IconUser,
  IconId
} from '@tabler/icons-react'
import { getSingleSimpananDetail } from '../api/simpanan'
import { fetchSettings } from '../api/settings'

const SimpananDetail: React.FC = () => {
  const { kodeSimpanan } = useParams<{ kodeSimpanan: string }>()
  const navigate = useNavigate()

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['simpananDetail', kodeSimpanan],
    queryFn: () => getSingleSimpananDetail(kodeSimpanan || ''),
    enabled: !!kodeSimpanan,
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



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 mt-3 text-xs font-medium">Memuat rincian simpanan...</p>
      </div>
    )
  }

  if (error || !responseData?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-8">
        <div className="bg-[#064e3b] px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/simpanan')} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <IconArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-base font-bold text-white tracking-wide">Detail Simpanan</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4">
            <IconInfoCircle size={32} className="text-rose-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Rincian Gagal Dimuat</h3>
          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
            Data simpanan ini tidak ditemukan atau gagal diambil dari server.
          </p>
          <button
            onClick={() => navigate('/simpanan')}
            className="mt-6 px-5 py-2 bg-[#064e3b] hover:bg-[#053e30] text-white rounded-xl font-semibold text-xs transition-colors active:scale-95"
          >
            Kembali ke Simpanan
          </button>
        </div>
      </div>
    )
  }

  const { simpanan, mutasi, no_anggota } = responseData.data

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
        <div className="absolute left-10 top-4 w-20 h-20 rounded-full border border-white/[0.02] pointer-events-none" />
        <div className="absolute right-12 bottom-12 w-28 h-28 rounded-full border border-white/[0.03] pointer-events-none" />
        
        {/* Tsarwah Header Logo */}
        <img 
          src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/assets/template/img/tsarwah.png`} 
          alt="Tsarwah Logo" 
          className="absolute right-5 top-5 w-11 h-auto object-contain opacity-90 pointer-events-none z-10" 
        />

        <div className="relative z-10 flex items-start gap-3 mb-6">
          <button onClick={() => navigate('/simpanan')} className="p-1.5 rounded-full hover:bg-white/10 transition-colors mt-0.5">
            <IconArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">Detail Simpanan</h1>
            <p className="text-[10px] text-[#a7f3d0] mt-1 leading-normal font-medium max-w-[240px]">
              Pantau mutasi saldo dan riwayat setoran simpanan koperasi Anda secara real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Main savings Card — overlaps green */}
      <div className="px-5 -mt-24 relative z-10">
        <div 
          className="relative w-full aspect-[1.7/1] max-w-sm mx-auto rounded-2xl shadow-xl overflow-hidden p-5 flex flex-col justify-between"
          style={{ backgroundImage: 'linear-gradient(135deg, #064e3b 0%, #0a6b4f 50%, #10b981 100%)' }}
        >
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
              <p className="text-[8px] text-white/40 mt-0.5 uppercase tracking-wider">Simpanan Anggota</p>
            </div>
            <IconWifi size={20} className="text-white/30 rotate-90" />
          </div>

          {/* Gold Chip */}
          <div className="relative z-10 mt-1">
            <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="28" rx="6" fill="url(#chip-grad)" />
              <rect x="3" y="4" width="30" height="20" rx="3" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.4" />
              <line x1="12" y1="4" x2="12" y2="24" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.4" />
              <line x1="24" y1="4" x2="24" y2="24" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.4" />
              <line x1="3" y1="14" x2="33" y2="14" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.4" />
              <defs>
                <linearGradient id="chip-grad" x1="0" y1="0" x2="36" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffe699" />
                  <stop offset="0.5" stopColor="#d4af37" />
                  <stop offset="1" stopColor="#aa7c11" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Middle Balance row */}
          <div className="relative z-10 my-1 text-center">
            <p className="text-[8px] text-white/50 uppercase tracking-widest">{simpanan.jenis_simpanan}</p>
            <h2 className="text-xl font-bold text-white mt-0.5 tracking-wide tabular-nums">
              {formatRupiah(simpanan.jumlah)}
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

      {/* Structured Account Information */}
      <div className="px-5 mt-6">
        <div className="bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-bold text-gray-800 border-b border-gray-100 pb-2 mb-1 flex items-center gap-1.5">
            <IconInfoCircle size={16} className="text-[#064e3b]" /> Informasi Akun Simpanan
          </h3>

          <div className="flex justify-between items-center text-xs pb-2.5 border-b border-gray-50">
            <div className="flex items-center gap-2 text-gray-400">
              <IconId size={15} />
              <span>Nomor Anggota</span>
            </div>
            <span className="font-bold text-gray-800 font-mono">{no_anggota}</span>
          </div>

          <div className="flex justify-between items-center text-xs pb-2.5 border-b border-gray-50">
            <div className="flex items-center gap-2 text-gray-400">
              <IconCreditCard size={15} />
              <span>Kode Jenis Simpanan</span>
            </div>
            <span className="font-bold text-gray-800">{simpanan.kode_simpanan}</span>
          </div>

          <div className="flex justify-between items-center text-xs pb-2.5 border-b border-gray-50">
            <div className="flex items-center gap-2 text-gray-400">
              <IconUser size={15} />
              <span>Kategori Simpanan</span>
            </div>
            <span className="font-bold text-[#064e3b]">{simpanan.jenis_simpanan}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 text-gray-400">
              <IconCalendar size={15} />
              <span>Pembaruan Terakhir</span>
            </div>
            <span className="font-bold text-gray-800">{formatDate(simpanan.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* Mutation History list */}
      <div className="px-5 mt-6">
        <h3 className="text-xs font-bold text-gray-800 mb-3 px-1">Riwayat Transaksi Mutasi</h3>

        <div className="bg-white rounded-2xl border border-gray-200/60 p-4 shadow-sm">
          <div className="divide-y divide-gray-50">
            {mutasi.map((item, idx) => {
              const isSetoran = item.jenis_transaksi === 'S'
              return (
                <div key={item.no_transaksi || idx} className="flex items-center justify-between py-3 px-1">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: isSetoran ? '#ecfdf5' : '#fef2f2' }}
                    >
                      {isSetoran ? (
                        <IconTrendingUp size={18} className="text-emerald-600" />
                      ) : (
                        <IconTrendingDown size={18} className="text-rose-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">
                        {isSetoran ? 'Setoran Simpanan' : 'Penarikan Simpanan'}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(item.tanggal)}</p>
                    </div>
                  </div>
                  <p 
                    className="text-xs font-extrabold tabular-nums"
                    style={{ color: isSetoran ? '#10b981' : '#ef4444' }}
                  >
                    {isSetoran ? '+' : '-'}{formatRupiah(item.jumlah)}
                  </p>
                </div>
              )
            })}

            {mutasi.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-xs">
                Belum ada transaksi mutasi terdaftar pada simpanan ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpananDetail
