import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  IconArrowLeft,
  IconX,
  IconFilter
} from '@tabler/icons-react'
import { getPresensiHistory } from '../api/presensi'
import { fetchSettings } from '../api/settings'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

const PresensiHistory: React.FC = () => {
  const navigate = useNavigate()

  const [startDate, setStartDate] = React.useState<string>('')
  const [endDate, setEndDate] = React.useState<string>('')

  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const [tempStartDate, setTempStartDate] = React.useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30) // 30 days ago
    return d.toISOString().split('T')[0]
  })
  const [tempEndDate, setTempEndDate] = React.useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  const fpStartRef = React.useRef<any>(null)
  const startRef = React.useCallback((node: HTMLInputElement | null) => {
    if (fpStartRef.current) {
      fpStartRef.current.destroy()
      fpStartRef.current = null
    }
    if (node) {
      fpStartRef.current = flatpickr(node, {
        dateFormat: 'Y-m-d',
        defaultDate: tempStartDate || undefined,
        onChange: (_, dateStr) => {
          setTempStartDate(dateStr)
        }
      })
    }
  }, [])

  const fpEndRef = React.useRef<any>(null)
  const endRef = React.useCallback((node: HTMLInputElement | null) => {
    if (fpEndRef.current) {
      fpEndRef.current.destroy()
      fpEndRef.current = null
    }
    if (node) {
      fpEndRef.current = flatpickr(node, {
        dateFormat: 'Y-m-d',
        defaultDate: tempEndDate || undefined,
        onChange: (_, dateStr) => {
          setTempEndDate(dateStr)
        }
      })
    }
  }, [])

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['presensiHistory', startDate, endDate],
    queryFn: () => getPresensiHistory(startDate, endDate),
    retry: false
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const getDayName = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', { weekday: 'long' })
    } catch {
      return ''
    }
  }

  const getMonthShort = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()
    } catch {
      return ''
    }
  }

  const getDateNumber = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.getDate().toString().padStart(2, '0')
    } catch {
      return ''
    }
  }

  const checkLate = (jamIn: string | null, jamMasuk: string) => {
    if (!jamIn) return false
    try {
      // jamIn can be full datetime string like "2026-07-09 08:15:00"
      const timeInStr = jamIn.includes(' ') ? jamIn.split(' ')[1] : jamIn
      const [hIn, mIn] = timeInStr.split(':').map(Number)
      const [hMasuk, mMasuk] = jamMasuk.split(':').map(Number)
      
      const inMinutes = hIn * 60 + mIn
      const masukMinutes = hMasuk * 60 + mMasuk
      return inMinutes > masukMinutes
    } catch {
      return false
    }
  }

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '-'
    try {
      const timePart = timeStr.includes(' ') ? timeStr.split(' ')[1] : timeStr
      return timePart.substring(0, 5) // Return HH:mm
    } catch {
      return timeStr
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 mt-3 text-xs font-medium">Memuat histori presensi...</p>
      </div>
    )
  }

  const history = responseData?.data || []

  // Calculate rekap
  const rekap = {
    hadir: history.filter(h => h.status.toLowerCase() === 'h').length,
    izin: history.filter(h => h.status.toLowerCase() === 'i').length,
    sakit: history.filter(h => h.status.toLowerCase() === 's').length,
    alfa: history.filter(h => h.status.toLowerCase() === 'a').length,
    terlambat: history.filter(h => h.status.toLowerCase() === 'h' && checkLate(h.jam_in, h.jam_masuk)).length
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Top Brand Banner */}
      <div 
        className="bg-[#064e3b] px-5 pt-5 pb-24 relative overflow-hidden"
        style={settingsData?.data?.background_login ? {
          backgroundImage: `linear-gradient(to bottom, rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.92)), url(${settingsData.data.background_login})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-emerald-500/[0.12] blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute left-[-20px] bottom-0 w-36 h-36 rounded-full bg-white/[0.03] blur-lg pointer-events-none" />

        <img 
          src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/assets/template/img/tsarwah.png`} 
          alt="Tsarwah Logo" 
          className="absolute right-5 top-5 w-11 h-auto object-contain opacity-90 pointer-events-none z-10" 
        />

        <div className="relative z-10 flex items-start gap-3">
          <button onClick={() => navigate('/presensi')} className="p-1.5 rounded-full hover:bg-white/10 transition-colors mt-0.5">
            <IconArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">Histori Kehadiran</h1>
            <p className="text-[10px] text-[#a7f3d0] mt-1 leading-normal font-medium max-w-[240px]">
              Pantau riwayat absensi masuk, pulang, jam kerja dan status keterlambatan Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Rekap Kehadiran Cards */}
      <div className="px-5 -mt-16 relative z-10">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-md">
          <p className="text-[10px] text-gray-400 tracking-wider font-semibold uppercase mb-3.5">
            Rekap Kehadiran {startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : '30 Hari Terakhir'}
          </p>
          
          <div className="flex items-center justify-between">
            {/* Hadir */}
            <div className="flex-1 text-center">
              <span className="text-xl font-bold text-[#064e3b] block leading-none">
                {rekap.hadir}
              </span>
              <span className="text-xs text-gray-500 font-semibold mt-1.5 block">Hadir</span>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200" />

            {/* Terlambat */}
            <div className="flex-1 text-center">
              <span className="text-xl font-bold text-amber-600 block leading-none">
                {rekap.terlambat}
              </span>
              <span className="text-xs text-gray-500 font-semibold mt-1.5 block">Terlambat</span>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200" />

            {/* Izin/Sakit */}
            <div className="flex-1 text-center">
              <span className="text-xl font-bold text-blue-600 block leading-none">
                {rekap.izin + rekap.sakit}
              </span>
              <span className="text-xs text-gray-500 font-semibold mt-1.5 block">Izin/Sakit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <IconFilter size={18} className="text-[#064e3b]" /> Filter Riwayat Kehadiran
              </h3>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-400 transition-colors"
              >
                <IconX size={18} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Dari Tanggal</label>
                  <input 
                    ref={startRef}
                    type="text" 
                    placeholder="Pilih tanggal"
                    readOnly
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-700 focus:outline-none focus:border-[#064e3b] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Sampai Tanggal</label>
                  <input 
                    ref={endRef}
                    type="text" 
                    placeholder="Pilih tanggal"
                    readOnly
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-700 focus:outline-none focus:border-[#064e3b] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3 justify-end">
              <button 
                onClick={() => {
                  const defaultStart = new Date()
                  defaultStart.setDate(defaultStart.getDate() - 30)
                  const defaultStartStr = defaultStart.toISOString().split('T')[0]
                  const defaultEndStr = new Date().toISOString().split('T')[0]
                  setTempStartDate(defaultStartStr)
                  setTempEndDate(defaultEndStr)
                  setStartDate('')
                  setEndDate('')
                  setIsFilterOpen(false)
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={() => {
                  setStartDate(tempStartDate)
                  setEndDate(tempEndDate)
                  setIsFilterOpen(false)
                }}
                className="px-5 py-2 bg-[#064e3b] hover:bg-[#053e30] text-white rounded-xl font-bold text-xs shadow-md transition-colors"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Histori List */}
      <div className="px-5 mt-6">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Daftar Kehadiran</h3>
            <button 
              onClick={() => {
                setTempStartDate(startDate || tempStartDate)
                setTempEndDate(endDate || tempEndDate)
                setIsFilterOpen(true)
              }}
              className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#064e3b] transition-colors border border-emerald-100/50"
              title="Filter Tanggal"
            >
              <IconFilter size={14} />
            </button>
            {startDate && endDate && (
              <button
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
                className="text-[10px] text-gray-400 hover:text-gray-600 underline font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">{history.length} Hari</span>
        </div>

        <div className="space-y-2.5">
          {history.map((item, idx) => {
            const isHadir = item.status.toLowerCase() === 'h'
            const isLate = isHadir && checkLate(item.jam_in, item.jam_masuk)
            const dayName = getDayName(item.tanggal)

            return (
              <div 
                key={item.id || idx} 
                className="bg-white rounded-xl border border-emerald-100 p-3 shadow-xs hover:border-emerald-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Calendar Badge Icon on the Left */}
                  <div className="flex flex-col items-center justify-center w-11 h-12 bg-gray-50 border border-gray-200/80 rounded-xl overflow-hidden shadow-2xs shrink-0">
                    <div className={`w-full py-0.5 text-center text-[7px] font-extrabold uppercase text-white tracking-wider ${
                      isHadir ? 'bg-emerald-600' : 'bg-rose-500'
                    }`}>
                      {getMonthShort(item.tanggal)}
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center leading-none">
                      <span className="text-[11px] font-black text-gray-800">{getDateNumber(item.tanggal)}</span>
                      <span className="text-[7px] font-bold text-gray-400 uppercase mt-0.5">{dayName.substring(0, 3)}</span>
                    </div>
                  </div>

                  {/* Right Details Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-bold text-gray-800 truncate pr-2">
                        {item.nama_jam_kerja}
                      </h4>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        {isLate && (
                          <span className="text-[7px] font-extrabold uppercase px-1 rounded bg-rose-50 text-rose-600 border border-rose-100/60">
                            TERLAMBAT
                          </span>
                        )}
                        {item.status.toLowerCase() === 'h' && (
                          <span className="text-[7px] font-extrabold uppercase px-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100/60">
                            HADIR
                          </span>
                        )}
                        {item.status.toLowerCase() === 'i' && (
                          <span className="text-[7px] font-extrabold uppercase px-1 rounded bg-blue-50 text-blue-700 border border-blue-100/60">
                            IZIN
                          </span>
                        )}
                        {item.status.toLowerCase() === 's' && (
                          <span className="text-[7px] font-extrabold uppercase px-1 rounded bg-amber-50 text-amber-700 border border-amber-100/60">
                            SAKIT
                          </span>
                        )}
                        {item.status.toLowerCase() === 'a' && (
                          <span className="text-[7px] font-extrabold uppercase px-1 rounded bg-rose-50 text-rose-700 border border-rose-100/60">
                            ALFA
                          </span>
                        )}
                      </div>
                    </div>

                    {isHadir ? (
                      <div className="flex items-center gap-2 text-[9px] text-gray-500 font-medium">
                        <div>
                          <span>In:</span>{' '}
                          <span className="font-bold text-gray-700">{formatTime(item.jam_in)}</span>
                          <span className="text-[7px] text-gray-400 ml-0.5 font-normal">({item.jam_masuk.substring(0, 5)})</span>
                        </div>
                        <div className="w-[3px] h-[3px] rounded-full bg-gray-300" />
                        <div>
                          <span>Out:</span>{' '}
                          <span className="font-bold text-gray-700">{formatTime(item.jam_out)}</span>
                          <span className="text-[7px] text-gray-400 ml-0.5 font-normal">({item.jam_pulang.substring(0, 5)})</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[9px] text-gray-400 font-semibold truncate leading-none">
                        Keterangan: {item.status.toLowerCase() === 'i' ? 'Izin Kerja' : item.status.toLowerCase() === 's' ? 'Sakit' : 'Tanpa Keterangan'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {history.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200/60 p-8 shadow-sm text-center text-gray-400 text-xs">
              Tidak ada data riwayat presensi yang ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PresensiHistory;
