import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  IconArrowLeft,
  IconSchool,
  IconCalendarEvent,
  IconClock,
  IconCheck,
  IconAlertTriangle,
  IconPresentation,
  IconBook,
  IconUserCheck,
  IconFileSpreadsheet
} from '@tabler/icons-react'
import { getGuruDashboardData } from '../api/guru'
import { fetchSettings } from '../api/settings'

const Akademik: React.FC = () => {
  const navigate = useNavigate()

  const { data: dashboardResponse, isLoading, error } = useQuery({
    queryKey: ['guruDashboard'],
    queryFn: getGuruDashboardData
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })

  // Sapaan kontekstual
  const getGreeting = () => {
    const jam = new Date().getHours()
    if (jam >= 3 && jam < 11) return 'Selamat Pagi'
    if (jam >= 11 && jam < 15) return 'Selamat Siang'
    if (jam >= 15 && jam < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-55 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 mt-3 text-xs font-semibold">Memuat dashboard akademik...</p>
      </div>
    )
  }

  if (error || !dashboardResponse?.success) {
    return (
      <div className="min-h-screen bg-gray-55 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <IconSchool size={32} className="text-red-500" />
        </div>
        <h3 className="font-bold text-gray-800 mb-1">Akses Terbatas</h3>
        <p className="text-xs text-gray-500 mb-4 max-w-xs leading-relaxed">
          {((error as any)?.response?.data?.message) || 'Anda tidak terdaftar sebagai guru atau sesi login Anda telah berakhir.'}
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 bg-[#064e3b] hover:bg-[#043a2b] text-white rounded-xl text-xs font-semibold active:scale-95 transition-all shadow-md shadow-emerald-900/10"
        >
          Kembali ke Beranda
        </button>
      </div>
    )
  }

  const { guru, tahun_ajaran, semester, hari_ini, jadwal_hari_ini, kelas_binaan } = dashboardResponse.data

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-28 font-sans">
      {/* Top Header Card with Soft Emerald Gradient & Decors */}
      <div 
        className="bg-gradient-to-br from-[#064e3b] to-[#0b664f] px-6 pt-6 pb-28 relative overflow-hidden rounded-b-[2rem] shadow-lg"
        style={settingsData?.data?.background_login ? {
          backgroundImage: `linear-gradient(to bottom right, rgba(6, 78, 59, 0.96), rgba(11, 102, 79, 0.94)), url(${settingsData.data.background_login})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="absolute right-0 top-0 w-56 h-56 rounded-full bg-emerald-400/[0.08] blur-3xl pointer-events-none -mr-12 -mt-12" />
        <div className="absolute left-[-40px] bottom-[-20px] w-48 h-48 rounded-full bg-white/[0.03] blur-2xl pointer-events-none" />

        {/* Top Navbar */}
        <div className="relative z-10 flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 transition-all active:scale-95 flex items-center justify-center border border-white/10"
          >
            <IconArrowLeft size={18} className="text-white" />
          </button>
          <div className="text-center">
            <span className="text-[10px] bg-amber-500 text-white font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              Semester {semester}
            </span>
          </div>
        </div>

        {/* Profile and School Info */}
        <div className="relative z-10 mt-6 flex items-center gap-4">
          {guru.foto ? (
            <img 
              src={guru.foto} 
              alt={guru.nama} 
              className="w-14 h-14 rounded-full border-2 border-white/30 object-cover shadow-md"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/20 flex items-center justify-center text-white font-extrabold text-lg shadow-inner">
              {guru.nama.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-[#a7f3d0] font-semibold leading-none mb-1">{getGreeting()}</p>
            <h2 className="text-base font-bold text-white leading-tight truncate">{guru.nama}</h2>
            <p className="text-[10px] text-emerald-100/80 mt-0.5 flex items-center gap-1.5">
              <span className="bg-emerald-800/60 px-2 py-0.5 rounded text-white font-semibold">Npp {guru.npp}</span>
              <span>•</span>
              <span>Unit {guru.nama_unit}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-5 -mt-16 relative z-10 flex flex-col gap-6">
        
        {/* Academic Year Info Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <IconSchool className="text-[#064e3b]" size={20} />
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-bold leading-none">Tahun Pelajaran</p>
              <h4 className="text-xs font-bold text-gray-800 mt-1">{tahun_ajaran}</h4>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="text-right">
            <p className="text-[9px] text-gray-400 font-bold leading-none">Status Mengajar</p>
            <span className="text-[10px] font-bold text-emerald-600 mt-1 inline-block">Aktif Mengajar</span>
          </div>
        </div>

        {/* Wali Kelas Card (Conditional Slider) */}
        {kelas_binaan && Array.isArray(kelas_binaan) && kelas_binaan.length > 0 && (
          <div className="w-full">
            <style>{`
              .scrollbar-none::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-none {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
            <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-none pb-2 -mx-5 px-5">
              {kelas_binaan.map((kelas: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`bg-gradient-to-br from-[#064e3b] via-[#095a45] to-[#0b664f] rounded-2xl p-4 shadow-lg text-white relative overflow-hidden border border-emerald-500/25 snap-center shrink-0 ${
                    kelas_binaan.length > 1 ? 'w-[85%]' : 'w-full'
                  }`}
                >
                  {/* Abstract Background Ornaments */}
                  <div className="absolute right-[-15px] top-[-15px] w-24 h-24 rounded-full bg-emerald-400/[0.12] pointer-events-none" />
                  <div className="absolute left-[-20px] bottom-[-20px] w-28 h-28 rounded-full bg-teal-400/[0.08] pointer-events-none" />
                  <div className="absolute right-[10%] bottom-[10%] w-1.5 h-1.5 rounded-full bg-white/20 pointer-events-none" />
                  <div className="absolute right-[25%] top-[25%] w-1 h-1 rounded-full bg-white/10 pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div>
                      <span className="text-[8px] bg-white/20 text-[#a7f3d0] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                        Kelas Binaan {kelas_binaan.length > 1 ? `${idx + 1}/${kelas_binaan.length}` : 'Anda'}
                      </span>
                      <h3 className="text-sm font-bold mt-1.5 text-white">Wali Kelas {kelas.nama_kelas}</h3>
                      <p className="text-[9px] text-[#a7f3d0]/80 mt-0.5">{kelas.nama_unit}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/10 shadow-inner">
                      <IconPresentation size={20} className="text-[#a7f3d0]" />
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between mt-1 relative z-10 border border-white/5 backdrop-blur-[2px]">
                    <div>
                      <p className="text-[8px] text-[#a7f3d0]/70">Total Siswa Terdaftar</p>
                      <h4 className="text-base font-extrabold text-white mt-0.5">{kelas.total_siswa} Siswa</h4>
                    </div>
                    <span className="text-[10px] text-white font-semibold bg-emerald-500/40 px-2 py-0.5 rounded shadow-sm border border-emerald-400/20">
                      Aktif
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {kelas_binaan.length > 1 && (
              <p className="text-[9px] text-gray-400 text-center mt-1">Geser ke samping untuk melihat kelas lainnya ({kelas_binaan.length} kelas)</p>
            )}
          </div>
        )}

        {/* Today's Schedules */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <IconCalendarEvent size={18} className="text-[#064e3b]" />
              <h3 className="text-xs font-bold text-gray-800">Jadwal Mengajar ({hari_ini})</h3>
            </div>
            <span className="text-[10px] font-bold text-[#064e3b] bg-emerald-50 px-2 py-0.5 rounded-full">
              {jadwal_hari_ini.length} Sesi
            </span>
          </div>

          {jadwal_hari_ini.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <IconBook size={24} className="text-gray-300" />
              </div>
              <p className="text-xs font-semibold text-gray-600">Tidak Ada Jadwal Hari Ini</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Hari ini Anda bebas tugas mengajar di kelas.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {jadwal_hari_ini.map((j) => (
                <div 
                  key={j.id} 
                  className={`bg-white rounded-2xl border ${j.sudah_presensi ? 'border-emerald-100' : 'border-gray-150'} shadow-sm relative overflow-hidden transition-all active:scale-[0.99] p-3.5`}
                >
                  <div className="flex items-center gap-4">
                    {/* Left: Calendar style date box */}
                    <div className="flex flex-col items-center justify-center w-12 h-14 rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden shrink-0">
                      <div className={`w-full py-1 text-[8px] font-bold text-center text-white leading-none ${j.sudah_presensi ? 'bg-emerald-600' : 'bg-amber-500'}`}>
                        Jam
                      </div>
                      <div className="flex-1 flex items-center justify-center bg-gray-50/50 w-full">
                        <span className="text-base font-extrabold text-gray-800 leading-none">{j.jam_ke}</span>
                      </div>
                    </div>

                    {/* Right: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="text-xs font-bold text-gray-900 truncate leading-tight">{j.nama_mapel}</h4>
                        {j.sudah_presensi ? (
                          <span className="inline-flex items-center gap-0.5 text-[8px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                            <IconCheck size={9} /> Selesai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[8px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                            <IconAlertTriangle size={9} /> Belum
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                        <span>Kelas {j.nama_kelas}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-gray-400">
                          <IconClock size={10} />
                          {j.jam_mulai} - {j.jam_selesai}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Attendance Action Button */}
                  <button 
                    onClick={() => navigate(`/akademik/presensi-mapel/${j.id}`)}
                    className={`mt-3 w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-[10px] font-bold border transition-all active:scale-[0.98] ${
                      j.sudah_presensi 
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' 
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/50'
                    }`}
                  >
                    <IconUserCheck size={12} />
                    {j.sudah_presensi ? 'Lihat / Edit Presensi' : 'Input Presensi'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Academic Action Menus */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-3">Layanan Akademik</p>
          <div className="grid grid-cols-4 gap-3">
            {/* Presensi Mata Pelajaran */}
            <Link 
              to="/akademik/presensi-mapel"
              className="flex flex-col items-center active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-1.5 border border-emerald-100/50 shrink-0">
                <IconUserCheck size={20} className="text-emerald-600" />
              </div>
              <span className="text-[11px] text-gray-700 leading-tight text-center">Presensi</span>
            </Link>
 
            {/* Input Penilaian & Rapor */}
            <a 
              href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/rapor`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-1.5 border border-amber-100/50 shrink-0">
                <IconFileSpreadsheet size={20} className="text-amber-600" />
              </div>
              <span className="text-[11px] text-gray-700 leading-tight text-center">Rapor</span>
            </a>
 
            {/* Jadwal Mengajar Anda */}
            <Link 
              to="/akademik/jadwal"
              className="flex flex-col items-center active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-1.5 border border-blue-100/50 shrink-0">
                <IconCalendarEvent size={20} className="text-blue-600" />
              </div>
              <span className="text-[11px] text-gray-700 leading-tight text-center">Jadwal</span>
            </Link>

            {/* Wali Kelas (Conditional) */}
            {kelas_binaan && Array.isArray(kelas_binaan) && kelas_binaan.length > 0 && (
              <Link 
                to="/akademik/wali-kelas"
                className="flex flex-col items-center active:scale-95 transition-transform"
              >
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center mb-1.5 border border-purple-100/50 shrink-0">
                  <IconPresentation size={20} className="text-purple-600" />
                </div>
                <span className="text-[11px] text-gray-700 leading-tight text-center">Wali Kelas</span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Akademik
