import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  IconArrowLeft,
  IconCalendar,
  IconMapPin,
  IconBook,
  IconFilter,
  IconX,
  IconAlertCircle,
  IconCalendarEvent,
  IconCheckbox,
  IconPrinter,
  IconChartBar,
  IconLoader2
} from '@tabler/icons-react'
import { getGuruJadwal } from '../api/guru'
import { apiClient } from '../api/client'

const Jadwal: React.FC = () => {
  const navigate = useNavigate()

  // Day list
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

  // Helper to resolve today's Indonesian day name
  const getTodayIndoDay = () => {
    try {
      const d = new Date()
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      const today = dayNames[d.getDay()]
      return today === 'Minggu' ? 'Senin' : today
    } catch {
      return 'Senin'
    }
  }

  // Helper to resolve today's date in Y-m-d format
  const getTodayDateString = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const date = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
  }

  const todayDate = getTodayDateString()

  // Selected Day State
  const [selectedDay, setSelectedDay] = React.useState<string>(getTodayIndoDay())

  // Filter States
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const [filterUnit, setFilterUnit] = React.useState('')
  const [filterKelas, setFilterKelas] = React.useState('')
  const [filterSemester, setFilterSemester] = React.useState('')

  // Temp Filter States (for modal)
  const [tempUnit, setTempUnit] = React.useState('')
  const [tempKelas, setTempKelas] = React.useState('')
  const [tempSemester, setTempSemester] = React.useState('')

  const [downloadingId, setDownloadingId] = React.useState<number | null>(null)

  const handleDownloadPdf = async (id: number, namaMapel: string, namaKelas: string) => {
    try {
      setDownloadingId(id)
      const response = await apiClient.get(`/api/guru/jadwal-pelajaran/cetak-presensi/${id}?pdf=1`, {
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Rekap_Presensi_${namaMapel.replace(/\s+/g, '_')}_${namaKelas.replace(/\s+/g, '_')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download PDF:', error)
      alert('Gagal mengunduh laporan presensi. Silakan coba lagi.')
    } finally {
      setDownloadingId(null)
    }
  }

  // Fetch Schedules (Entire schedule, we filter day/unit/kelas in React)
  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['guruJadwal'],
    queryFn: () => getGuruJadwal()
  })

  const schedules = responseData?.data || []

  // Extract unique filter choices from loaded data
  const uniqueUnits = React.useMemo(() => {
    const list = schedules.map(s => s.nama_unit).filter(Boolean)
    return Array.from(new Set(list))
  }, [schedules])

  const uniqueKelas = React.useMemo(() => {
    const list = schedules
      .filter(s => !tempUnit || s.nama_unit === tempUnit)
      .map(s => s.nama_kelas)
      .filter(Boolean)
    return Array.from(new Set(list))
  }, [schedules, tempUnit])

  // Filter schedules by selected day AND filter options
  const filteredSchedules = React.useMemo(() => {
    return schedules.filter(item => {
      // First filter by selected day
      if (item.hari !== selectedDay) return false
      
      // Filter by unit
      if (filterUnit && item.nama_unit !== filterUnit) return false
      
      // Filter by kelas
      if (filterKelas && item.nama_kelas !== filterKelas) return false
      
      // Filter by semester
      if (filterSemester && String(item.semester) !== filterSemester) return false
      
      return true
    })
  }, [schedules, selectedDay, filterUnit, filterKelas, filterSemester])

  // Modal Actions
  const handleOpenFilter = () => {
    setTempUnit(filterUnit)
    setTempKelas(filterKelas)
    setTempSemester(filterSemester)
    setIsFilterOpen(true)
  }

  const handleApplyFilter = () => {
    setFilterUnit(tempUnit)
    setFilterKelas(tempKelas)
    setFilterSemester(tempSemester)
    setIsFilterOpen(false)
  }

  const handleResetFilter = () => {
    setTempUnit('')
    setTempKelas('')
    setTempSemester('')
    setFilterUnit('')
    setFilterKelas('')
    setFilterSemester('')
    setIsFilterOpen(false)
  }

  const handleCloseFilter = () => {
    setIsFilterOpen(false)
  }

  const hasActiveFilters = !!(filterUnit || filterKelas || filterSemester)

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Header Banner */}
      <div className="bg-[#064e3b] px-4 py-4 relative shadow-sm flex items-center justify-between text-white shrink-0">
        <button onClick={() => navigate('/akademik')} className="p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0">
          <IconArrowLeft size={22} className="text-white" />
        </button>
        <h1 className="text-sm font-bold tracking-wide absolute left-1/2 transform -translate-x-1/2">
          Jadwal Pelajaran
        </h1>
        <div className="w-8 h-8 shrink-0" />
      </div>

      {/* Subheader info & Filter row */}
      <div className="px-5 mt-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-black text-gray-800 tracking-wider">
            AGENDA KELAS
          </span>
          <button 
            onClick={handleOpenFilter}
            className="relative bg-white text-gray-700 border border-gray-200 hover:border-[#064e3b] rounded-xl font-bold text-[11px] flex items-center gap-1.5 px-3 py-1.5 shadow-2xs active:scale-95 transition-all shrink-0"
          >
            <IconFilter size={12} className="text-[#064e3b]" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 border border-white animate-pulse" />
            )}
          </button>
        </div>

        {/* Horizontal Swipeable Day Tabs */}
        <div className="flex overflow-x-auto gap-2 py-1.5 scrollbar-none shrink-0 -mx-1 px-1">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-0-0-auto px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 ${
                day === selectedDay
                  ? 'bg-[#064e3b] text-white shadow-md shadow-emerald-900/20'
                  : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Schedule List content */}
        <div className="pt-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 mt-3 text-xs font-semibold">Memuat jadwal...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-6 text-center">
              <IconAlertCircle className="text-red-500 mx-auto mb-2" size={32} />
              <h4 className="text-xs font-bold text-gray-800">Gagal Memuat Data</h4>
              <p className="text-[10px] text-gray-400 mt-1">Terjadi kesalahan pada server. Coba muat ulang.</p>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-2xs">
              <IconCalendarEvent className="text-gray-300 mx-auto mb-3" size={40} />
              <h4 className="text-xs font-bold text-gray-800">Tidak Ada Jadwal</h4>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                {hasActiveFilters 
                  ? "Tidak ada jadwal yang cocok dengan filter aktif Anda untuk hari ini."
                  : `Anda tidak memiliki jadwal mengajar pada hari ${selectedDay}.`
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
            <div className="space-y-4">
              {filteredSchedules.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs hover:shadow-xs transition-all duration-200"
                >
                  <div className="flex gap-3.5 items-start">
                    {/* Left Column: Jam Ke & Waktu */}
                    <div className="w-18 shrink-0 text-center flex flex-col items-center justify-center min-h-[55px] pt-1">
                      <span className="text-[14px] font-black text-[#064e3b] leading-none">
                        {item.jam_mulai ? item.jam_mulai.slice(0, 5) : '-'}
                      </span>
                      <span className="text-[8.5px] text-gray-400 mt-1 font-bold">
                        s/d {item.jam_selesai ? item.jam_selesai.slice(0, 5) : '-'}
                      </span>
                      <span className="mt-2 text-[8px] font-bold rounded px-1.5 py-0.5 bg-gray-100 text-gray-600 shrink-0">
                        Jam {item.jam_ke}
                      </span>
                    </div>

                    {/* Vertical Divider Line */}
                    <div className="w-px self-stretch bg-gray-200 my-0.5" />

                    {/* Right Column: Detail Pelajaran */}
                    <div className="flex-1 min-w-0 pl-1.5">
                      <h4 className="text-xs font-black text-gray-900 leading-snug truncate">
                        {item.nama_mapel}
                      </h4>
                      
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="text-[9.5px] text-gray-600 flex items-center gap-1.5 font-bold truncate">
                          <IconMapPin size={13} className="text-gray-400 shrink-0" />
                          <span>Kelas {item.nama_kelas}</span>
                        </span>
                        <span className="text-[9.5px] text-gray-600 flex items-center gap-1.5 font-bold truncate">
                          <IconCalendar size={13} className="text-gray-400 shrink-0" />
                          <span>Sem. {item.semester === 1 ? 'Ganjil' : 'Genap'} (TA {item.tahun_ajaran})</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Divider Line */}
                  <div className="border-t border-gray-200 my-3.5" />

                  {/* Actions Row */}
                  <div className="flex gap-2 items-center">
                    <Link 
                      to={`/akademik/presensi-mapel/${item.id}?tanggal=${todayDate}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-[10px] font-bold text-white bg-[#064e3b] hover:bg-[#053e30] py-2 rounded-xl shadow-xs active:scale-[0.97] transition-all"
                    >
                      <IconCheckbox size={13} />
                      <span>Presensi</span>
                    </Link>

                    <button 
                      onClick={() => handleDownloadPdf(item.id, item.nama_mapel, item.nama_kelas)}
                      disabled={downloadingId !== null}
                      className="inline-flex items-center justify-center gap-1 text-[10px] font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 py-2 px-3.5 rounded-xl active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingId === item.id ? (
                        <IconLoader2 size={13} className="animate-spin text-gray-500" />
                      ) : (
                        <IconPrinter size={13} />
                      )}
                      <span>{downloadingId === item.id ? 'Proses...' : 'Cetak'}</span>
                    </button>

                    <button 
                      onClick={() => navigate(`/akademik/penilaian/${item.id}`)}
                      className="inline-flex items-center justify-center gap-1 text-[10px] font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 py-2 px-3.5 rounded-xl active:scale-[0.97] transition-all"
                    >
                      <IconChartBar size={13} />
                      <span>Nilai</span>
                    </button>
                  </div>
                </div>
              ))}
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
                <IconFilter size={18} className="text-[#064e3b]" /> Filter Jadwal
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

              {/* Semester Dropdown */}
              <div className="flex items-center bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] focus-within:border-[#064e3b] focus-within:bg-white rounded-2xl p-2.5 transition-all duration-200">
                <IconCalendarEvent size={18} className="text-[#064e3b] opacity-60 mr-2.5 shrink-0" />
                <div className="flex-1 flex flex-col min-w-0">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5">Semester</label>
                  <select 
                    value={tempSemester}
                    onChange={(e) => setTempSemester(e.target.value)}
                    className="border-none bg-transparent p-0 text-[12px] font-bold text-gray-800 outline-none w-full cursor-pointer"
                  >
                    <option value="">Semua Semester</option>
                    <option value="1">Semester Ganjil</option>
                    <option value="2">Semester Genap</option>
                  </select>
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

export default Jadwal
