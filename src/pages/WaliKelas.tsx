import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  IconArrowLeft,
  IconUsers,
  IconFileSpreadsheet,
  IconCalendarEvent,
  IconChevronRight,
  IconLoader2,
  IconAlertCircle,
  IconSchool,
  IconUser,
  IconPrinter
} from '@tabler/icons-react'
import { apiClient } from '../api/client'

interface HomeroomClass {
  kode_kelas: string
  nama_kelas: string
  nama_unit: string
  total_siswa: number
}

interface Student {
  id_siswa: number
  nis: string
  nama_lengkap: string
  jenis_kelamin: string
  foto: string | null
  nisn: string
  tempat_lahir: string
  tanggal_lahir: string
  alamat: string
  nama_ayah: string
  nama_ibu: string
  no_hp_orang_tua: string
}

interface MonitoringItem {
  jadwal_id: number
  mapel_nama: string
  guru_nama: string
  rencana_sumatif: number
  rencana_sas: number
  nilai_count: number
  expected_count: number
  completion_rate: number
  status: string
}

interface PresenceSchedule {
  id: number
  hari: string
  jam_ke: number
  jam_mulai: string
  jam_selesai: string
  mapel_nama: string
  guru_nama: string
  total_presensi: number
}

interface WaliKelasResponse {
  active_ta: string
  active_semester: string
  kelas_binaan: HomeroomClass[]
  current_kelas: HomeroomClass
  students: Student[]
  monitoring: MonitoringItem[]
  presence_schedules: PresenceSchedule[]
}

const WaliKelas: React.FC = () => {
  const navigate = useNavigate()
  const [selectedClass, setSelectedClass] = React.useState<string>('')
  const [activeTab, setActiveTab] = React.useState<'siswa' | 'nilai' | 'presensi'>('siswa')
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

  // Fetch Wali Kelas Data
  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['waliKelasData', selectedClass],
    queryFn: async () => {
      const url = selectedClass ? `/api/guru/wali-kelas?kode_kelas=${selectedClass}` : '/api/guru/wali-kelas'
      const { data } = await apiClient.get<{ success: boolean; data: WaliKelasResponse }>(url)
      return data
    }
  })

  const info = responseData?.data

  // Initialize selected class when loaded
  React.useEffect(() => {
    if (info?.current_kelas && !selectedClass) {
      setSelectedClass(info.current_kelas.kode_kelas)
    }
  }, [info])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <IconLoader2 size={32} className="animate-spin text-[#064e3b]" />
        <span className="mt-2.5 text-xs font-medium text-gray-500">Memuat data kelas binaan...</span>
      </div>
    )
  }

  if (error || !info) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <IconAlertCircle size={32} className="text-red-500 mb-2" />
        <span className="text-xs font-semibold text-gray-500 block">Gagal memuat data Wali Kelas.</span>
        <span className="text-[10px] text-gray-400 mt-1 max-w-xs block leading-relaxed">
          {((error as any)?.response?.data?.message) || 'Pastikan Anda terdaftar sebagai Wali Kelas pada tahun ajaran aktif.'}
        </span>
        <button onClick={() => navigate('/akademik')} className="mt-4 text-xs font-bold text-white bg-[#064e3b] px-4 py-2 rounded-xl shadow-md">
          Kembali ke Akademik
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans antialiased text-gray-800">
      {/* Header */}
      <header className="sticky top-0 bg-[#064e3b] text-white px-4 py-4 flex items-center gap-3 shadow-sm z-40 shrink-0">
        <button 
          onClick={() => navigate('/akademik')}
          className="p-1 hover:bg-[#053e30] rounded-lg transition-colors active:scale-95"
        >
          <IconArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-[13px] font-bold tracking-wide leading-tight">Wali Kelas</h1>
          <span className="text-[10px] text-emerald-200/90 font-medium block">
            Kelas Binaan • {info.current_kelas.nama_kelas}
          </span>
        </div>
      </header>

      <div className="p-4 max-w-md mx-auto flex flex-col gap-4">
        {/* Class Selection Dropdown (if multiple classes) */}
        {info.kelas_binaan.length > 1 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider">Pilih Kelas Binaan</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-3.5 py-3 text-xs font-bold text-gray-800 focus:border-[#064e3b] outline-none shadow-xs"
            >
              {info.kelas_binaan.map((k) => (
                <option key={k.kode_kelas} value={k.kode_kelas}>
                  Kelas {k.nama_kelas} ({k.nama_unit})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Current Class Overview Card */}
        <div className="bg-[#064e3b] rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
          
          <span className="text-[9px] uppercase tracking-wider font-semibold bg-white/10 px-2.5 py-0.5 rounded-md">
            Wali Kelas {info.current_kelas.nama_kelas}
          </span>
          <h2 className="text-base font-bold mt-2 leading-tight">
            {info.current_kelas.nama_unit}
          </h2>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-[10px] font-semibold text-emerald-100/90">
            <div>
              <span className="text-[8px] text-emerald-300/85 block font-medium">TAHUN AJARAN</span>
              {info.active_ta}
            </div>
            <div>
              <span className="text-[8px] text-emerald-300/85 block font-medium">SEMESTER</span>
              {info.active_semester}
            </div>
            <div>
              <span className="text-[8px] text-emerald-300/85 block font-medium">TOTAL SISWA</span>
              {info.current_kelas.total_siswa} Siswa
            </div>
          </div>
        </div>

        {/* Tab Buttons (Siswa, Nilai, Presensi) */}
        <div className="flex bg-gray-200/60 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('siswa')}
            className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'siswa' 
                ? 'bg-white text-[#064e3b] shadow-xs' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <IconUsers size={16} />
            <span>Siswa</span>
          </button>
          <button
            onClick={() => setActiveTab('nilai')}
            className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'nilai' 
                ? 'bg-white text-[#064e3b] shadow-xs' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <IconFileSpreadsheet size={16} />
            <span>Nilai</span>
          </button>
          <button
            onClick={() => setActiveTab('presensi')}
            className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'presensi' 
                ? 'bg-white text-[#064e3b] shadow-xs' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <IconCalendarEvent size={16} />
            <span>Presensi</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex flex-col gap-3">
          {activeTab === 'siswa' && (
            <div className="flex flex-col gap-3">
              {info.students.map((student, index) => {
                const initials = student.nama_lengkap
                  .split(' ')
                  .map(w => w.charAt(0))
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <div 
                    key={student.id_siswa} 
                    onClick={() => navigate(`/akademik/wali-kelas/siswa/${student.id_siswa}`, { state: { student } })}
                    className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden p-3.5 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer hover:border-emerald-100/80"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {student.foto ? (
                        <img 
                          src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/photos/pendaftaran/${student.foto}`} 
                          className="w-9 h-9 rounded-lg object-cover shadow-xs shrink-0" 
                          alt={student.nama_lengkap} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const fallback = e.currentTarget.nextSibling as HTMLDivElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-100 to-[#064e3b] text-white font-bold text-[11px] flex items-center justify-center shadow-xs shrink-0"
                        style={{ display: student.foto ? 'none' : 'flex' }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[11.5px] font-bold text-gray-800 leading-tight truncate max-w-[190px]">{student.nama_lengkap}</h4>
                        <span className="text-[9px] text-gray-400 font-medium block mt-0.5">NIS: {student.nis ?? '-'} • {student.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md shrink-0">
                      #{index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'nilai' && (
            <div className="flex flex-col gap-3">
              {info.monitoring.map((m) => (
                <div 
                  key={m.jadwal_id} 
                  onClick={() => navigate(`/akademik/wali-kelas/detail/${m.jadwal_id}`)}
                  className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden p-3.5 flex flex-col gap-3 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h4 className="text-[12px] font-bold text-gray-800 leading-tight truncate max-w-[240px]">
                        {m.mapel_nama}
                      </h4>
                      <span className="text-[9px] text-gray-400 font-medium block mt-0.5 flex items-center gap-1">
                        <IconUser size={12} className="shrink-0" />
                        <span>{m.guru_nama}</span>
                      </span>
                    </div>
                    <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-md ${
                      m.status === 'Lengkap' 
                        ? 'text-emerald-700 bg-emerald-50' 
                        : m.status === 'Belum Ada Rencana' 
                        ? 'text-gray-500 bg-gray-150' 
                        : 'text-amber-700 bg-amber-50'
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  {/* Plans setup */}
                  <div className="flex gap-4 text-[9px] font-semibold text-gray-500">
                    <span>Sumatif: {m.rencana_sumatif} Kolom</span>
                    <span>SAS: {m.rencana_sas} Kolom</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-50">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-gray-400">Pengisian Nilai</span>
                      <span className="text-[#064e3b]">{m.completion_rate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#064e3b] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${m.completion_rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'presensi' && (
            <div className="flex flex-col gap-3">
              {info.presence_schedules.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">Tidak ada jadwal pelajaran.</p>
              ) : (
                info.presence_schedules.map((ps) => (
                  <div key={ps.id} className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden p-3.5 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-[#064e3b] bg-emerald-50 px-1.5 py-0.5 rounded">
                            {ps.hari} • Jam {ps.jam_ke}
                          </span>
                          <span className="text-[8.5px] text-gray-400 font-medium">
                            ({ps.jam_mulai} - {ps.jam_selesai})
                          </span>
                        </div>
                        <h4 className="text-[11.5px] font-bold text-gray-800 mt-1.5 truncate max-w-[220px]">{ps.mapel_nama}</h4>
                        <span className="text-[9px] text-gray-400 block mt-0.5 truncate max-w-[220px]">{ps.guru_nama}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[12.5px] font-bold text-gray-800 block">{ps.total_presensi}</span>
                        <span className="text-[8.5px] text-gray-400 font-medium block mt-0.5">Pertemuan</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDownloadPdf(ps.id, ps.mapel_nama, info.current_kelas.nama_kelas)}
                      disabled={downloadingId !== null}
                      className="w-full inline-flex items-center justify-center gap-1 text-[10px] font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-250 py-2 rounded-xl active:scale-[0.97] transition-all disabled:opacity-50"
                    >
                      {downloadingId === ps.id ? (
                        <IconLoader2 size={12} className="animate-spin text-gray-500" />
                      ) : (
                        <IconPrinter size={12} />
                      )}
                      <span>{downloadingId === ps.id ? 'Mengunduh...' : 'Unduh Laporan Presensi'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WaliKelas
