import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  IconArrowLeft,
  IconInfoCircle,
  IconTrendingDown,
  IconCalendar,
  IconCreditCard,
  IconWifi,
  IconId,
  IconTrendingUp
} from '@tabler/icons-react'
import { getSinglePinjamanDetail } from '../api/pinjaman'
import { fetchSettings } from '../api/settings'

const PinjamanDetail: React.FC = () => {
  const { noAkad } = useParams<{ noAkad: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'rencana' | 'histori'>('rencana')

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['pinjamanDetail', noAkad],
    queryFn: () => getSinglePinjamanDetail(noAkad || ''),
    enabled: !!noAkad,
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
        <p className="text-gray-400 mt-3 text-xs font-medium">Memuat rincian pembiayaan...</p>
      </div>
    )
  }

  if (error || !responseData?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-8">
        <div className="bg-[#064e3b] px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/pinjaman')} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <IconArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-base font-bold text-white tracking-wide">Detail Pembiayaan</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4">
            <IconInfoCircle size={32} className="text-rose-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Rincian Tidak Ditemukan</h3>
          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
            Data rencana cicilan atau riwayat pembiayaan ini gagal diambil.
          </p>
          <button
            onClick={() => navigate('/pinjaman')}
            className="mt-6 px-5 py-2 bg-[#064e3b] hover:bg-[#053e30] text-white rounded-xl font-semibold text-xs transition-colors active:scale-95"
          >
            Kembali ke Pinjaman
          </button>
        </div>
      </div>
    )
  }

  const { pembiayaan, rencana, historibayar } = responseData.data

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
          <button onClick={() => navigate('/pinjaman')} className="p-1.5 rounded-full hover:bg-white/10 transition-colors mt-0.5">
            <IconArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">Detail Pembiayaan</h1>
            <p className="text-[10px] text-[#a7f3d0] mt-1 leading-normal font-medium max-w-[240px]">
              Pantau rencana cicilan, sisa tagihan, dan riwayat setoran angsuran berkala.
            </p>
          </div>
        </div>
      </div>

      {/* Main credit card (Yellow / Gold) — overlaps green */}
      <div className="px-5 -mt-24 relative z-10">
        <div 
          className="relative w-full aspect-[1.7/1] max-w-sm mx-auto rounded-2xl shadow-xl overflow-hidden p-5 flex flex-col justify-between"
          style={{ backgroundImage: 'linear-gradient(135deg, #78350f 0%, #ca8a04 50%, #eab308 100%)' }}
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
              <p className="text-[8px] text-white/40 mt-0.5 uppercase tracking-wider">Pembiayaan Anggota</p>
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

          {/* Middle Balance row (Sisa Hutang) */}
          <div className="relative z-10 my-1 text-center">
            <p className="text-[8px] text-white/50 uppercase tracking-widest">Sisa Tagihan Akad</p>
            <h2 className="text-xl font-bold text-white mt-0.5 tracking-wide tabular-nums">
              {formatRupiah(pembiayaan.sisa)}
            </h2>
          </div>

          {/* Bottom row */}
          <div className="flex justify-between items-end relative z-10">
            <div>
              <p className="text-[8px] text-white/40 uppercase tracking-wider">{pembiayaan.no_akad}</p>
              <p className="text-xs font-mono font-bold text-white tracking-[2px]">{pembiayaan.jenis_pembiayaan}</p>
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
        <div className="bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm flex flex-col gap-4">
          
          {/* Header Row */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <p className="text-[10px] text-gray-400 font-mono tracking-wider font-semibold uppercase">Status Pembiayaan</p>
              <h2 className="text-sm font-bold text-gray-800 mt-0.5">{pembiayaan.jenis_pembiayaan}</h2>
            </div>
            <div className="flex flex-col gap-1.5 items-end shrink-0">
              {pembiayaan.status === '1' ? (
                <span 
                  className="text-[8px] px-3 py-1 rounded-md font-extrabold uppercase tracking-wider shadow-sm text-center min-w-[80px]"
                  style={{ backgroundColor: '#10b981', color: '#ffffff', letterSpacing: '0.05em' }}
                >
                  Disetujui
                </span>
              ) : (
                <span 
                  className="text-[8px] px-3 py-1 rounded-md font-extrabold uppercase tracking-wider shadow-sm text-center min-w-[80px]"
                  style={{ backgroundColor: '#f59e0b', color: '#ffffff', letterSpacing: '0.05em' }}
                >
                  Pending
                </span>
              )}
              {pembiayaan.is_lunas ? (
                <span 
                  className="text-[8px] px-3 py-1 rounded-md font-extrabold uppercase tracking-wider shadow-sm text-center min-w-[80px]"
                  style={{ backgroundColor: '#0d9488', color: '#ffffff', letterSpacing: '0.05em' }}
                >
                  LUNAS
                </span>
              ) : (
                <span 
                  className="text-[8px] px-3 py-1 rounded-md font-extrabold uppercase tracking-wider shadow-sm text-center min-w-[80px]"
                  style={{ backgroundColor: '#ef4444', color: '#ffffff', letterSpacing: '0.05em' }}
                >
                  BELUM LUNAS
                </span>
              )}
            </div>
          </div>

          {/* Structured Rows (Key-Value) using only proven icons */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs pb-2.5 border-b border-gray-50">
              <div className="flex items-center gap-2 text-gray-400">
                <IconCalendar size={15} />
                <span>Tanggal Akad</span>
              </div>
              <span className="font-bold text-gray-800">{formatDate(pembiayaan.tanggal)}</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-2.5 border-b border-gray-50">
              <div className="flex items-center gap-2 text-gray-400">
                <IconCalendar size={15} />
                <span>Lama Angsuran</span>
              </div>
              <span className="font-bold text-gray-800">{pembiayaan.angsuran} Bulan</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-2.5 border-b border-gray-50">
              <div className="flex items-center gap-2 text-gray-400">
                <IconCreditCard size={15} />
                <span>Pokok Pinjaman</span>
              </div>
              <span className="font-bold text-gray-800 tabular-nums">{formatRupiah(pembiayaan.jumlah_pokok)}</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-2.5 border-b border-gray-50">
              <div className="flex items-center gap-2 text-gray-400">
                <IconInfoCircle size={15} />
                <span>Margin / Jasa ({pembiayaan.persentase}%)</span>
              </div>
              <span className="font-bold text-gray-800 tabular-nums">
                {formatRupiah(pembiayaan.total_pinjaman - pembiayaan.jumlah_pokok)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pb-2.5 border-b border-gray-50 bg-gray-50/50 p-2 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <IconCreditCard size={15} />
                <span>Total Tagihan</span>
              </div>
              <span className="font-extrabold text-gray-900 tabular-nums text-sm">{formatRupiah(pembiayaan.total_pinjaman)}</span>
            </div>
          </div>

          {/* Payment Progress Bar */}
          {pembiayaan.status === '1' && (
            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-gray-500 font-medium">Realisasi Pembayaran</span>
                <span className="font-bold text-emerald-600">{pembiayaan.progress}% ({formatRupiah(pembiayaan.total_bayar)} Dibayar)</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#064e3b] to-[#10b981] rounded-full transition-all duration-500" 
                  style={{ width: `${pembiayaan.progress}%` }} 
                />
              </div>
            </div>
          )}

          {/* Keperluan */}
          <div className="bg-gray-50 rounded-xl p-3 flex gap-2.5 items-start mt-1">
            <IconInfoCircle size={18} className="text-[#064e3b] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Tujuan Keperluan</p>
              <p className="text-xs font-medium text-gray-700 leading-normal mt-0.5">{pembiayaan.keperluan}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sleek segment control tab switcher */}
      <div className="px-5 mt-6">
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200/40 mb-4 shadow-inner">
          <button
            onClick={() => setActiveTab('rencana')}
            className={`flex-1 py-2 text-center font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'rencana'
                ? 'bg-white text-gray-800 shadow-sm border border-gray-200/20'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <IconId size={15} /> Rencana Cicilan
          </button>
          <button
            onClick={() => setActiveTab('histori')}
            className={`flex-1 py-2 text-center font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'histori'
                ? 'bg-white text-gray-800 shadow-sm border border-gray-200/20'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <IconTrendingDown size={15} /> Histori Bayar
          </button>
        </div>

        {/* Tab Content 1: Rencana Pembayaran */}
        {activeTab === 'rencana' && (
          <div className="bg-white rounded-2xl border border-gray-200/60 p-4 shadow-sm">
            <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase pb-2 border-b border-gray-100 px-1">
              <span className="w-[15%]">Tempo</span>
              <span className="w-[27%] text-right">Tagihan</span>
              <span className="w-[27%] text-right">Bayar</span>
              <span className="w-[31%] text-right">Sisa</span>
            </div>
            
            <div className="divide-y divide-gray-50">
              {rencana.map((item, idx) => {
                const jatuhtempo = `${item.tahun}-${item.bulan}-05`
                const tagihan = item.jumlah ?? 0
                const bayar = item.bayar ?? 0
                const sisa = tagihan - bayar
                
                return (
                  <div key={idx} className="flex justify-between items-center py-2 px-1 text-xs">
                    <span className="w-[15%] font-mono text-gray-500 font-semibold">
                      {new Date(jatuhtempo).toLocaleDateString('id-ID', { month: '2-digit', year: '2-digit' })}
                    </span>
                    <span className="w-[27%] text-right font-medium text-gray-500 tabular-nums">
                      {formatRupiah(tagihan)}
                    </span>
                    <span className="w-[27%] text-right font-bold text-emerald-600 tabular-nums">
                      {formatRupiah(bayar)}
                    </span>
                    <span className="w-[31%] text-right font-bold tabular-nums flex justify-end">
                      {sisa > 0 ? (
                        <span className="text-rose-600">{formatRupiah(sisa)}</span>
                      ) : (
                        <span 
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-extrabold text-[8px] uppercase tracking-wider whitespace-nowrap"
                          style={{ backgroundColor: '#ccfbf1', color: '#0f766e' }}
                        >
                          Lunas
                        </span>
                      )}
                    </span>
                  </div>
                )
              })}

              {rencana.length === 0 && (
                <div className="py-8 text-center text-gray-400 text-xs">
                  Tidak ada rencana pembayaran untuk pembiayaan ini.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content 2: Histori Setoran Pembayaran */}
        {activeTab === 'histori' && (
          <div className="bg-white rounded-2xl border border-gray-200/60 p-4 shadow-sm">
            <div className="divide-y divide-gray-50">
              {historibayar.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center justify-between py-3.5 px-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50">
                      <IconTrendingDown size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">
                        Bayar Angsuran
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(item.tanggal)}</p>
                    </div>
                  </div>
                  <p className="text-xs font-extrabold text-emerald-600 tabular-nums">
                    -{formatRupiah(item.jumlah)}
                  </p>
                </div>
              ))}

              {historibayar.length === 0 && (
                <div className="py-8 text-center text-gray-400 text-xs">
                  Belum ada catatan setoran angsuran.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PinjamanDetail
