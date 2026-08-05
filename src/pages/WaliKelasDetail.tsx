import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  IconArrowLeft,
  IconLoader2,
  IconAlertCircle,
  IconLock,
  IconLockOpen
} from '@tabler/icons-react'
import { apiClient } from '../api/client'

interface Student {
  id_siswa: number
  nis: string
  nama_lengkap: string
  foto: string | null
  rata_sumatif: number
  nilai_sas: number
  nilai_rapor: number
  capaian_kompetensi: string
}

interface PlanItem {
  id: number
  nama_penilaian: string
  kode_penilaian: string
  kategori_penilaian: 'SUMATIF' | 'SAS'
  tanggal_penilaian: string
}

interface WaliKelasDetailResponse {
  bobot: {
    id: number
    bobot_sumatif: number
    bobot_sas: number
    status: 'draft' | 'terkirim'
  }
  jadwal: {
    id: number
    nama_mapel: string
    nama_kelas: string
    guru: string
  }
  rencana: PlanItem[]
  students: Student[]
}

const WaliKelasDetail: React.FC = () => {
  const navigate = useNavigate()
  const { jadwalId } = useParams<{ jadwalId: string }>()

  // Fetch detail data
  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['waliKelasDetailData', jadwalId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: WaliKelasDetailResponse }>(
        `/api/guru/wali-kelas/detail/${jadwalId}`
      )
      return data
    },
    enabled: !!jadwalId
  })

  const info = responseData?.data

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-55 flex flex-col items-center justify-center p-4">
        <IconLoader2 size={32} className="animate-spin text-[#064e3b]" />
        <span className="mt-2.5 text-xs font-medium text-gray-500">Memuat detail penilaian...</span>
      </div>
    )
  }

  if (error || !info) {
    return (
      <div className="min-h-screen bg-gray-55 flex flex-col items-center justify-center p-4 text-center">
        <IconAlertCircle size={32} className="text-red-500 mb-2" />
        <span className="text-xs font-semibold text-gray-500 block">Gagal memuat detail penilaian.</span>
        <button onClick={() => navigate('/akademik/wali-kelas')} className="mt-4 text-xs font-bold text-white bg-[#064e3b] px-4 py-2 rounded-xl">
          Kembali
        </button>
      </div>
    )
  }

  const sumatifPlans = info.rencana.filter((r) => r.kategori_penilaian === 'SUMATIF')
  const sasPlans = info.rencana.filter((r) => r.kategori_penilaian === 'SAS')
  const isLocked = info.bobot.status === 'terkirim'

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans antialiased text-gray-800">
      {/* Header */}
      <header className="sticky top-0 bg-[#064e3b] text-white px-4 py-4 flex items-center gap-3 shadow-sm z-40 shrink-0">
        <button 
          onClick={() => navigate('/akademik/wali-kelas')}
          className="p-1 hover:bg-[#053e30] rounded-lg transition-colors active:scale-95"
        >
          <IconArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-[13px] font-bold tracking-wide leading-tight">Detail Penilaian Mapel</h1>
          <span className="text-[10px] text-emerald-200/90 font-medium block">
            {info.jadwal.nama_mapel} - Kelas {info.jadwal.nama_kelas}
          </span>
        </div>
      </header>

      <div className="p-4 max-w-md mx-auto flex flex-col gap-4">
        {/* Subject Card Info */}
        <div className="bg-[#064e3b] rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
          
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase tracking-wider font-semibold bg-white/10 px-2.5 py-0.5 rounded-md">
              Mata Pelajaran
            </span>
            <div className={`flex items-center gap-1 text-[9px] font-semibold uppercase py-0.5 px-2 rounded-md ${
              isLocked ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
            }`}>
              {isLocked ? <IconLock size={10} /> : <IconLockOpen size={10} />}
              <span>{isLocked ? 'Terkirim / Locked' : 'Draft'}</span>
            </div>
          </div>

          <h2 className="text-base font-bold mt-2 leading-tight">
            {info.jadwal.nama_mapel}
          </h2>
          <p className="text-[10.5px] text-emerald-200/80 font-medium mt-1">
            Guru: {info.jadwal.guru}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/10 text-[10px] font-semibold text-emerald-100/90">
            <div>
              <span className="text-[8px] text-emerald-300/85 block font-medium">BOBOT SUMATIF</span>
              {info.bobot.bobot_sumatif}%
            </div>
            <div>
              <span className="text-[8px] text-emerald-300/85 block font-medium">BOBOT SAS</span>
              {info.bobot.bobot_sas}%
            </div>
          </div>
        </div>

        {/* Plans Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3.5">
          <h3 className="text-xs font-semibold text-gray-800">Daftar Rencana Penilaian</h3>
          
          {/* Sumatif */}
          <div>
            <span className="text-[9.5px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mb-2 inline-block">SUMATIF</span>
            {sumatifPlans.length === 0 ? (
              <p className="text-[10px] text-gray-400 italic">Belum ada kolom Sumatif.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {sumatifPlans.map((p) => (
                  <span key={p.id} className="text-[9px] font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg" title={p.nama_penilaian}>
                    {p.kode_penilaian}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SAS */}
          <div className="pt-2.5 border-t border-gray-50">
            <span className="text-[9.5px] font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md mb-2 inline-block font-sans">SAS</span>
            {sasPlans.length === 0 ? (
              <p className="text-[10px] text-gray-400 italic">Belum ada kolom SAS.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {sasPlans.map((p) => (
                  <span key={p.id} className="text-[9px] font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg" title={p.nama_penilaian}>
                    {p.kode_penilaian}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Students Grades Recap List */}
        <div>
          <div className="mb-2.5">
            <span className="text-[10px] font-bold text-[#064e3b] uppercase tracking-wider">
              Rekap Nilai Siswa
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {info.students.map((student, index) => {
              const initials = student.nama_lengkap
                .split(' ')
                .map(w => w.charAt(0))
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div key={student.id_siswa} className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden p-3.5 flex flex-col gap-3">
                  {/* Student Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {student.foto ? (
                        <img 
                          src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/photos/pendaftaran/${student.foto}`} 
                          className="w-9 h-9 rounded-lg object-cover shadow-xs shrink-0" 
                          alt={student.nama_lengkap} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const sibling = e.currentTarget.nextSibling as HTMLDivElement;
                            if (sibling) sibling.style.display = 'flex';
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
                        <h4 className="text-[12px] font-bold text-gray-800 leading-tight truncate max-w-[190px]">{student.nama_lengkap}</h4>
                        <span className="text-[9px] text-gray-400 font-medium block mt-0.5">NIS: {student.nis}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md shrink-0">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Grades Grid */}
                  <div className="grid grid-cols-3 bg-[#f8fafc] rounded-lg p-2 gap-1 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Sumatif</span>
                      <span className="text-[12.5px] font-bold text-gray-800">{student.rata_sumatif ?? '-'}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">SAS</span>
                      <span className="text-[12.5px] font-bold text-gray-800">{student.nilai_sas ?? '-'}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Rapor</span>
                      <span className="text-[13px] font-bold text-[#064e3b]">{student.nilai_rapor ?? '-'}</span>
                    </div>
                  </div>

                  {/* Capaian Kompetensi */}
                  <div className="bg-emerald-50/20 rounded-lg p-2.5 text-[10px] text-gray-600 leading-relaxed border border-emerald-100/10">
                    <span className="font-bold text-[8.5px] uppercase tracking-wider text-[#064e3b] block mb-0.5">Capaian Kompetensi</span>
                    <span>{student.capaian_kompetensi}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaliKelasDetail
