import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  IconArrowLeft,
  IconBook,
  IconUsers,
  IconEdit,
  IconCheck,
  IconAlertCircle,
  IconLock,
  IconLockOpen,
  IconLoader2
} from '@tabler/icons-react'
import { apiClient } from '../api/client'

interface StudentAverage {
  id_siswa: number
  nis: string
  nama_lengkap: string
  foto: string | null
  rata_sumatif: number
  nilai_sas: number
  nilai_rapor: number
  capaian_kompetensi: string
}

interface AssessmentPlan {
  id: number
  nama_penilaian: string
  kode_penilaian: string
  kategori_penilaian: 'SUMATIF' | 'SAS'
  keterangan: string | null
  tanggal_penilaian: string
}

interface PenilaianIndexData {
  jadwal: {
    id: number
    nama_mapel: string
    nama_kelas: string
    semester: number
    tahun_ajaran: string
    guru: string
  }
  bobot: {
    id: number
    bobot_sumatif: number
    bobot_sas: number
    status: 'draft' | 'terkirim'
  }
  rencana: AssessmentPlan[]
  students: StudentAverage[]
}

const Penilaian: React.FC = () => {
  const navigate = useNavigate()
  const { jadwalId } = useParams<{ jadwalId: string }>()
  const queryClient = useQueryClient()

  // Modal States
  const [isWeightModalOpen, setIsWeightModalOpen] = React.useState(false)

  // Weight form states
  const [bobotSumatif, setBobotSumatif] = React.useState(60)
  const [bobotSas, setBobotSas] = React.useState(40)

  // Fetch index data
  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['penilaianIndex', jadwalId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: PenilaianIndexData }>(`/api/guru/penilaian/${jadwalId}`)
      return data
    },
    enabled: !!jadwalId
  })

  const info = responseData?.data

  // Initialize weights when loaded
  React.useEffect(() => {
    if (info?.bobot) {
      setBobotSumatif(info.bobot.bobot_sumatif)
      setBobotSas(info.bobot.bobot_sas)
    }
  }, [info])

  // Weight Mutation
  const updateWeightMutation = useMutation({
    mutationFn: async (payload: { id: number; bobot_sumatif: number; bobot_sas: number }) => {
      const { data } = await apiClient.post('/api/guru/penilaian/bobot', payload)
      return data
    },
    onSuccess: (data: any) => {
      Swal.fire({
        title: 'Berhasil!',
        text: data.message || 'Bobot penilaian berhasil diperbarui.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      setIsWeightModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['penilaianIndex', jadwalId] })
    },
    onError: (err: any) => {
      Swal.fire({
        title: 'Gagal!',
        text: err.response?.data?.message || 'Gagal mengubah bobot penilaian.',
        icon: 'error',
        confirmButtonColor: '#064e3b'
      })
    }
  })

  // Submit / Lock Mutation
  const lockMutation = useMutation({
    mutationFn: async (bobotId: number) => {
      const { data } = await apiClient.post('/api/guru/penilaian/kirim', { bobot_id: bobotId })
      return data
    },
    onSuccess: (data: any) => {
      Swal.fire({
        title: 'Terkirim & Terkunci!',
        text: data.message || 'Nilai berhasil dikirim.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      queryClient.invalidateQueries({ queryKey: ['penilaianIndex', jadwalId] })
    },
    onError: (err: any) => {
      Swal.fire({
        title: 'Gagal!',
        text: err.response?.data?.message || 'Gagal mengirim nilai.',
        icon: 'error',
        confirmButtonColor: '#064e3b'
      })
    }
  })

  // Unlock Mutation
  const unlockMutation = useMutation({
    mutationFn: async (bobotId: number) => {
      const { data } = await apiClient.post('/api/guru/penilaian/batal-kirim', { bobot_id: bobotId })
      return data
    },
    onSuccess: (data: any) => {
      Swal.fire({
        title: 'Kunci Dibuka!',
        text: data.message || 'Status nilai dikembalikan ke draft.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      queryClient.invalidateQueries({ queryKey: ['penilaianIndex', jadwalId] })
    },
    onError: (err: any) => {
      Swal.fire({
        title: 'Gagal!',
        text: err.response?.data?.message || 'Gagal membuka kunci.',
        icon: 'error',
        confirmButtonColor: '#064e3b'
      })
    }
  })

  const handleUpdateWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (bobotSumatif + bobotSas !== 100) {
      Swal.fire('Error', 'Total bobot harus 100%', 'error')
      return
    }
    if (info?.bobot.id) {
      updateWeightMutation.mutate({
        id: info.bobot.id,
        bobot_sumatif: bobotSumatif,
        bobot_sas: bobotSas
      })
    }
  }

  const handleLockGrades = () => {
    if (!info?.bobot.id) return
    Swal.fire({
      title: 'Kirim & Kunci Nilai?',
      text: 'Nilai yang sudah dikirim tidak akan bisa diubah kembali oleh guru pengampu.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#064e3b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Kirim',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        lockMutation.mutate(info.bobot.id)
      }
    })
  }

  const handleUnlockGrades = () => {
    if (!info?.bobot.id) return
    Swal.fire({
      title: 'Buka Kunci Nilai?',
      text: 'Anda akan dapat mengedit nilai kembali setelah membuka kunci ini.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Buka Kunci',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        unlockMutation.mutate(info.bobot.id)
      }
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <IconLoader2 size={32} className="animate-spin text-[#064e3b]" />
        <span className="mt-2.5 text-xs font-medium text-gray-500">Memuat penilaian...</span>
      </div>
    )
  }

  if (error || !info) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <IconAlertCircle size={32} className="text-red-500" />
        <span className="mt-2 text-xs font-semibold text-gray-500">Gagal memuat data penilaian.</span>
        <button onClick={() => navigate('/akademik')} className="mt-4 text-xs font-bold text-white bg-[#064e3b] px-4 py-2 rounded-xl">
          Kembali
        </button>
      </div>
    )
  }

  const isLocked = info.bobot.status === 'terkirim'

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
          <h1 className="text-[13px] font-bold tracking-wide leading-tight">Penilaian Siswa</h1>
          <span className="text-[10px] text-emerald-200/90 font-medium block">
            {info.jadwal.nama_mapel} - Kelas {info.jadwal.nama_kelas}
          </span>
        </div>
      </header>

      <div className="p-4 max-w-md mx-auto flex flex-col gap-4">
        {/* Subject Details & Status Card */}
        <div className="bg-[#064e3b] rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
          
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase tracking-wider font-semibold bg-white/10 px-2 py-0.5 rounded-md">
              Mata Pelajaran
            </span>
            <div className={`flex items-center gap-1 text-[9px] font-semibold uppercase py-0.5 px-2 rounded-md ${
              isLocked ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
            }`}>
              {isLocked ? <IconLock size={10} /> : <IconLockOpen size={10} />}
              <span>{isLocked ? 'Locked / Terkirim' : 'Draft'}</span>
            </div>
          </div>

          <h2 className="text-base font-bold mt-2 leading-tight">
            {info.jadwal.nama_mapel}
          </h2>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/10 text-[10px] font-semibold text-emerald-100/90">
            <div>
              <span className="text-[8.5px] text-emerald-300/85 block font-medium">KELAS</span>
              {info.jadwal.nama_kelas}
            </div>
            <div>
              <span className="text-[8.5px] text-emerald-300/85 block font-medium">GURU PENGAMPU</span>
              {info.jadwal.guru}
            </div>
            <div>
              <span className="text-[8.5px] text-emerald-300/85 block font-medium">TAHUN AJARAN</span>
              {info.jadwal.tahun_ajaran}
            </div>
            <div>
              <span className="text-[8.5px] text-emerald-300/85 block font-medium">SEMESTER</span>
              {info.jadwal.semester === 1 ? '1 (Ganjil)' : '2 (Genap)'}
            </div>
          </div>
        </div>

        {/* Weights Setup Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold text-gray-800">Bobot Penilaian</h3>
            {!isLocked && (
              <button 
                onClick={() => setIsWeightModalOpen(true)}
                className="text-[10px] font-semibold text-[#064e3b] hover:underline flex items-center gap-0.5"
              >
                <IconEdit size={12} />
                <span>Ubah</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <span className="text-[8.5px] font-medium text-gray-500 uppercase block mb-1">Rata-Rata Sumatif</span>
              <span className="text-base font-bold text-gray-900">{info.bobot.bobot_sumatif}%</span>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <span className="text-[8.5px] font-medium text-gray-500 uppercase block mb-1">Nilai Akhir (SAS)</span>
              <span className="text-base font-bold text-gray-900">{info.bobot.bobot_sas}%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Row (Matching siprenpas mobile layout) */}
        <div className="grid grid-cols-2 gap-3 mt-1.5">
          <button
            onClick={() => navigate(`/akademik/penilaian/${info.jadwal.id}/manage/SUMATIF`)}
            className="flex items-center justify-center gap-2 text-[11px] font-bold py-3 px-4 rounded-xl shadow-xs transition-all active:scale-[0.97] bg-emerald-50 text-[#064e3b] hover:bg-emerald-100/80 border border-emerald-100/50"
          >
            <IconBook size={16} />
            <span>Kelola Sumatif</span>
          </button>
          <button
            onClick={() => navigate(`/akademik/penilaian/${info.jadwal.id}/manage/SAS`)}
            className="flex items-center justify-center gap-2 text-[11px] font-bold py-3 px-4 rounded-xl shadow-xs transition-all active:scale-[0.97] bg-cyan-50/70 text-cyan-800 hover:bg-cyan-100/70 border border-cyan-100/50"
          >
            <IconBook size={16} />
            <span>Kelola SAS</span>
          </button>
        </div>

        {/* Kirim Button / Status Badge (Matching siprenpas mobile layout) */}
        <div className="flex flex-col gap-2.5 mt-1">
          {isLocked ? (
            <>
              <div className="w-full py-2.5 text-center rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5 text-[11.5px] shadow-xs">
                <IconCheck size={16} />
                <span>Status: Terkirim</span>
              </div>
              <button 
                onClick={handleUnlockGrades}
                className="w-full py-2.5 text-center rounded-xl bg-red-600 hover:bg-red-750 text-white font-bold flex items-center justify-center gap-1.5 text-[11.5px] shadow-xs active:scale-[0.97] transition-all"
              >
                <IconArrowLeft size={16} className="shrink-0" />
                <span>Batal Kirim Nilai</span>
              </button>
            </>
          ) : (
            <button 
              onClick={handleLockGrades}
              className="w-full py-2.5 text-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5 text-[11.5px] shadow-xs active:scale-[0.97] transition-all"
            >
              <IconCheck size={16} />
              <span>Kirim Nilai</span>
            </button>
          )}
        </div>

        {/* Student list card (Replication of siprenpas mobile cards) */}
        <div>
          <div className="mb-2.5">
            <span className="text-[10px] font-bold text-[#064e3b] uppercase tracking-wider">
              Rekap Nilai Siswa
            </span>
          </div>

          <div id="student-grades-section" className="flex flex-col gap-3">
            {info.students.map((student, index) => {
              const initials = student.nama_lengkap
                .split(' ')
                .map(w => w.charAt(0))
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div key={student.id_siswa} className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden p-3.5 flex flex-col gap-3">
                  {/* Student Header Info */}
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
                        <span className="text-[9px] text-gray-400 font-medium block mt-0.5">NIS: {student.nis ?? '-'}</span>
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



      {/* Weight Modal */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xs font-bold text-gray-900 mb-4">Ubah Bobot Penilaian</h3>
            <form onSubmit={handleUpdateWeightSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Bobot Sumatif (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={bobotSumatif} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0
                    setBobotSumatif(val)
                    setBobotSas(100 - val)
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#064e3b] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Bobot SAS (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={bobotSas} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0
                    setBobotSas(val)
                    setBobotSumatif(100 - val)
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#064e3b] outline-none"
                />
              </div>
              <div className="text-[9px] text-gray-400 italic">
                * Jumlah bobot Sumatif and SAS harus 100%. Mengubah input akan otomatis menyesuaikan sisi yang lain.
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsWeightModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-gray-500 bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={updateWeightMutation.isPending}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#064e3b] rounded-xl flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {updateWeightMutation.isPending && <IconLoader2 size={12} className="animate-spin" />}
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Penilaian
