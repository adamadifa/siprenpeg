import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  IconArrowLeft,
  IconCalendar,
  IconX,
  IconClock,
  IconFileText,
  IconAlertCircle,
  IconEdit,
  IconMapPin,
  IconBook,
  IconFilter
} from '@tabler/icons-react'
import { getPresensiMapelHistory } from '../api/guru'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

const PresensiMapelHistory: React.FC = () => {
  const navigate = useNavigate()
  
  // Filter States
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const [filterDate, setFilterDate] = React.useState('')
  const [filterUnit, setFilterUnit] = React.useState('')
  const [filterKelas, setFilterKelas] = React.useState('')

  // Temp Filter States (for modal)
  const [tempDate, setTempDate] = React.useState('')
  const [tempUnit, setTempUnit] = React.useState('')
  const [tempKelas, setTempKelas] = React.useState('')
  
  // Flatpickr ref inside modal
  const fpRef = React.useRef<any>(null)
  const dateInputRef = React.useCallback((node: HTMLInputElement | null) => {
    if (fpRef.current) {
      fpRef.current.destroy()
      fpRef.current = null
    }
    if (node) {
      fpRef.current = flatpickr(node, {
        dateFormat: 'Y-m-d',
        defaultDate: tempDate || undefined,
        disableMobile: true,
        onChange: (_, dateStr) => {
          setTempDate(dateStr)
        }
      })
    }
  }, [])

  // Fetch History (Filtered by date on API)
  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['presensiMapelHistory', filterDate],
    queryFn: () => getPresensiMapelHistory(filterDate || undefined)
  })

  const history = responseData?.data || []

  // Extract unique Units & Kelas list from current loaded history for dropdown options
  const uniqueUnits = React.useMemo(() => {
    const list = history.map(h => h.nama_unit).filter(Boolean)
    return Array.from(new Set(list))
  }, [history])

  const uniqueKelas = React.useMemo(() => {
    const list = history
      .filter(h => !tempUnit || h.nama_unit === tempUnit)
      .map(h => h.nama_kelas)
      .filter(Boolean)
    return Array.from(new Set(list))
  }, [history, tempUnit])

  // Filter in memory for Unit & Kelas
  const filteredHistory = React.useMemo(() => {
    return history.filter(item => {
      if (filterUnit && item.nama_unit !== filterUnit) return false
      if (filterKelas && item.nama_kelas !== filterKelas) return false
      return true
    })
  }, [history, filterUnit, filterKelas])

  // Date Formatting helpers
  const getDayName = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', { weekday: 'long' })
    } catch {
      return ''
    }
  }



  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  // Filter Actions
  const handleOpenFilter = () => {
    setTempDate(filterDate)
    setTempUnit(filterUnit)
    setTempKelas(filterKelas)
    setIsFilterOpen(true)
  }

  const handleApplyFilter = () => {
    setFilterDate(tempDate)
    setFilterUnit(tempUnit)
    setFilterKelas(tempKelas)
    setIsFilterOpen(false)
  }

  const handleResetFilter = () => {
    setTempDate('')
    setTempUnit('')
    setTempKelas('')
    setFilterDate('')
    setFilterUnit('')
    setFilterKelas('')
    setIsFilterOpen(false)
    if (fpRef.current) fpRef.current.clear()
  }

  const handleCloseFilter = () => {
    setTempDate(filterDate)
    setTempUnit(filterUnit)
    setTempKelas(filterKelas)
    setIsFilterOpen(false)
  }

  const hasActiveFilters = !!(filterDate || filterUnit || filterKelas)

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Header Banner */}
      <div className="bg-[#064e3b] px-5 pt-5 pb-9 relative overflow-hidden rounded-b-[2rem] shadow-sm">
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-emerald-505/[0.08] blur-2xl pointer-events-none -mr-16 -mt-16" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <button onClick={() => navigate('/akademik')} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors mt-0.5">
              <IconArrowLeft size={18} className="text-white" />
            </button>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">Riwayat Presensi</h1>
              <p className="text-[10px] text-[#a7f3d0] mt-0.5 font-medium">
                Kelola dan tinjau riwayat presensi mengajar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="px-5 mt-5 space-y-4">
        {/* Subheader info & Filter button */}
        <div className="flex justify-between items-center px-1 mb-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Daftar Pertemuan ({filteredHistory.length})
          </span>
          <button 
            onClick={handleOpenFilter}
            className="relative bg-white text-[#064e3b] border border-slate-200 hover:border-[#064e3b] rounded-xl font-bold text-[11px] flex items-center gap-1.5 px-3 py-1.5 shadow-xs active:scale-95 transition-all shrink-0"
          >
            <IconFilter size={12} className="text-[#064e3b]" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 border border-white animate-pulse" />
            )}
          </button>
        </div>

        {/* List Content */}
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 mt-3 text-xs font-semibold">Memuat riwayat...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-6 text-center">
              <IconAlertCircle className="text-red-500 mx-auto mb-2" size={32} />
              <h4 className="text-xs font-bold text-gray-800">Gagal Memuat Data</h4>
              <p className="text-[10px] text-gray-400 mt-1">Terjadi kesalahan pada server. Coba muat ulang.</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-8 text-center">
              <IconFileText className="text-gray-300 mx-auto mb-3" size={40} />
              <h4 className="text-xs font-bold text-gray-800">Belum Ada Riwayat Presensi</h4>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                {hasActiveFilters 
                  ? "Tidak ada data presensi pelajaran yang cocok dengan filter aktif Anda."
                  : "Anda belum pernah mengisi presensi kelas semester ini."
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilter}
                  className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[10px] font-bold transition-all active:scale-95"
                >
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredHistory.map((item, idx) => {
                const dayName = getDayName(item.tanggal)
                const isMateriTerisi = !!item.materi
                
                return (
                  <div key={item.id} className="relative pl-6">
                    {/* Segmented Timeline Line (ends exactly at the last node) */}
                    {idx < filteredHistory.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-[-24px] w-0.5 bg-slate-200" />
                    )}

                    {/* Timeline Node Dot */}
                    <div className={`absolute left-0.5 top-2 w-3 h-3 rounded-full border-2 border-white shadow-xs z-10 ${
                      isMateriTerisi ? 'bg-emerald-600' : 'bg-amber-500'
                    }`} />

                    {/* Date label above card */}
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {dayName}, {formatDateLabel(item.tanggal)}
                    </span>

                    {/* Timeline Card Content */}
                    <div className="bg-white rounded-2xl border border-slate-150 p-4 shadow-2xs hover:border-slate-350 transition-all duration-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <IconBook size={14} className="text-[#064e3b] shrink-0" />
                            <span className="truncate">{item.nama_mapel}</span>
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-[9.5px] font-semibold text-gray-400">
                            <span className="flex items-center gap-0.5">
                              <IconMapPin size={11} className="shrink-0" />
                              Kelas {item.nama_kelas} ({item.nama_unit})
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span className="flex items-center gap-0.5">
                              <IconClock size={11} className="shrink-0" />
                              {item.jam_mulai.slice(0, 5)} - {item.jam_selesai.slice(0, 5)}
                            </span>
                          </div>
                        </div>

                        {/* Status badge */}
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                          isMateriTerisi 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {isMateriTerisi ? 'Terisi' : 'Kosong'}
                        </span>
                      </div>

                      {/* Materi Description Speech Bubble */}
                      {isMateriTerisi && (
                        <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-150 text-[10px] text-slate-700 leading-relaxed font-medium">
                          {item.materi}
                        </div>
                      )}

                      {/* Card Actions */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex justify-end">
                        <Link 
                          to={`/akademik/presensi-mapel/${item.jadwal_pelajaran_id}?tanggal=${item.tanggal}`}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100/40 px-3.5 py-1.5 rounded-xl transition-all active:scale-[0.97]"
                        >
                          <IconEdit size={12} />
                          <span>Edit Presensi</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal / Bottom Sheet */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <IconFilter size={18} className="text-[#064e3b]" /> Filter Presensi
              </h3>
              <button 
                onClick={handleCloseFilter}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-400 transition-colors"
              >
                <IconX size={18} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Unit Dropdown */}
              <div className="flex items-center bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] focus-within:border-[#064e3b] focus-within:bg-white rounded-2xl p-2.5 transition-all duration-200">
                <IconMapPin size={18} className="text-[#064e3b] opacity-60 mr-2.5 shrink-0" />
                <div className="flex-1 flex flex-col min-w-0">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5">Unit</label>
                  <select 
                    value={tempUnit}
                    onChange={(e) => {
                      setTempUnit(e.target.value)
                      setTempKelas('')
                    }}
                    className="border-none bg-transparent p-0 text-[12px] font-bold text-gray-800 outline-none w-full cursor-pointer"
                  >
                    <option value="">Semua Unit</option>
                    {uniqueUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kelas Dropdown */}
              <div className="flex items-center bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] focus-within:border-[#064e3b] focus-within:bg-white rounded-2xl p-2.5 transition-all duration-200">
                <IconBook size={18} className="text-[#064e3b] opacity-60 mr-2.5 shrink-0" />
                <div className="flex-1 flex flex-col min-w-0">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5">Kelas</label>
                  <select 
                    value={tempKelas}
                    onChange={(e) => setTempKelas(e.target.value)}
                    className="border-none bg-transparent p-0 text-[12px] font-bold text-gray-800 outline-none w-full cursor-pointer"
                  >
                    <option value="">Semua Kelas</option>
                    {uniqueKelas.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Input */}
              <div className="flex items-center bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] focus-within:border-[#064e3b] focus-within:bg-white rounded-2xl p-2.5 transition-all duration-200">
                <IconCalendar size={18} className="text-[#064e3b] opacity-60 mr-2.5 shrink-0" />
                <div className="flex-1 flex flex-col min-w-0">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5">Tanggal</label>
                  <input 
                    ref={dateInputRef}
                    type="text" 
                    placeholder="Pilih Tanggal"
                    readOnly
                    className="border-none bg-transparent p-0 text-[12px] font-bold text-gray-800 outline-none w-full cursor-pointer placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3 justify-end shrink-0">
              <button 
                onClick={handleResetFilter}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Reset
              </button>
              <button 
                onClick={handleApplyFilter}
                className="flex-[1.5] py-2.5 bg-[#064e3b] hover:bg-[#053e30] text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-emerald-900/10"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PresensiMapelHistory
