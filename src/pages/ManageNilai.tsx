import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  IconArrowLeft,
  IconSearch,
  IconCheck,
  IconLoader2,
  IconAlertCircle,
  IconUsers,
  IconLock,
  IconPlus,
  IconTrash
} from '@tabler/icons-react'
import { apiClient } from '../api/client'

interface Student {
  id_siswa: number
  nis: string
  nama_lengkap: string
  foto: string | null
}

interface PlanItem {
  id: number
  nama_penilaian: string
  kode_penilaian: string
}

interface ManageNilaiResponse {
  bobot: {
    id: number
    kode_kelas: string
    nama_kelas: string
    nama_mapel: string
    status: 'draft' | 'terkirim'
  }
  rencana: PlanItem[]
  students: Student[]
  grades: Record<number, Record<number, number | string>>
}

const ManageNilai: React.FC = () => {
  const navigate = useNavigate()
  const { jadwalId, kategori } = useParams<{ jadwalId: string; kategori: string }>()
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [localGrades, setLocalGrades] = React.useState<Record<number, Record<number, string>>>({})

  // Assessment Plan Form States
  const [isPlanModalOpen, setIsPlanModalOpen] = React.useState(false)
  const [namaPenilaian, setNamaPenilaian] = React.useState('')
  const [kodePenilaian, setKodePenilaian] = React.useState('')
  const [tanggalPenilaian, setTanggalPenilaian] = React.useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [keteranganPenilaian, setKeteranganPenilaian] = React.useState('')

  // Fetch page data
  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['manageNilaiData', jadwalId, kategori],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: ManageNilaiResponse }>(
        `/api/guru/penilaian/${jadwalId}/manage/${kategori}`
      )
      return data
    },
    enabled: !!jadwalId && !!kategori
  })

  const info = responseData?.data

  // Sync server grades to local state when loaded
  React.useEffect(() => {
    if (info?.grades) {
      const mapped: Record<number, Record<number, string>> = {}
      Object.keys(info.grades).forEach((studentId) => {
        const sId = parseInt(studentId)
        mapped[sId] = {}
        Object.keys(info.grades[sId]).forEach((rencanaId) => {
          const rId = parseInt(rencanaId)
          const val = info.grades[sId][rId]
          mapped[sId][rId] = val !== null && val !== undefined ? String(val) : ''
        })
      })
      setLocalGrades(mapped)
    }
  }, [info])

  // Save Grades Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: { nilai: Record<number, Record<number, string>> }) => {
      const { data } = await apiClient.post('/api/guru/penilaian/nilai', payload)
      return data
    },
    onSuccess: (data: any) => {
      Swal.fire({
        title: 'Berhasil!',
        text: data.message || 'Nilai berhasil disimpan.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      queryClient.invalidateQueries({ queryKey: ['penilaianIndex', jadwalId] })
      queryClient.invalidateQueries({ queryKey: ['manageNilaiData', jadwalId, kategori] })
      navigate(`/akademik/penilaian/${jadwalId}`)
    },
    onError: (err: any) => {
      Swal.fire({
        title: 'Gagal!',
        text: err.response?.data?.message || 'Gagal menyimpan nilai.',
        icon: 'error',
        confirmButtonColor: '#064e3b'
      })
    }
  })

  // Add Plan Mutation
  const addPlanMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post('/api/guru/penilaian/rencana', payload)
      return data
    },
    onSuccess: (data: any) => {
      Swal.fire({
        title: 'Berhasil!',
        text: data.message || 'Rencana penilaian berhasil ditambahkan.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      setIsPlanModalOpen(false)
      // reset form
      setNamaPenilaian('')
      setKodePenilaian('')
      setKeteranganPenilaian('')
      queryClient.invalidateQueries({ queryKey: ['penilaianIndex', jadwalId] })
      queryClient.invalidateQueries({ queryKey: ['manageNilaiData', jadwalId, kategori] })
    },
    onError: (err: any) => {
      Swal.fire({
        title: 'Gagal!',
        text: err.response?.data?.message || 'Gagal menambahkan rencana penilaian.',
        icon: 'error',
        confirmButtonColor: '#064e3b'
      })
    }
  })

  // Delete Plan Mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete(`/api/guru/penilaian/rencana/${id}`)
      return data
    },
    onSuccess: (data: any) => {
      Swal.fire({
        title: 'Dihapus!',
        text: data.message || 'Rencana penilaian berhasil dihapus.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      queryClient.invalidateQueries({ queryKey: ['penilaianIndex', jadwalId] })
      queryClient.invalidateQueries({ queryKey: ['manageNilaiData', jadwalId, kategori] })
    },
    onError: (err: any) => {
      Swal.fire({
        title: 'Gagal!',
        text: err.response?.data?.message || 'Gagal menghapus rencana penilaian.',
        icon: 'error',
        confirmButtonColor: '#064e3b'
      })
    }
  })

  const handleInputChange = (studentId: number, rencanaId: number, value: string) => {
    if (value !== '') {
      const num = parseFloat(value)
      if (isNaN(num) || num < 0 || num > 100) return
    }

    setLocalGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [rencanaId]: value
      }
    }))
  }

  const handleSave = () => {
    saveMutation.mutate({ nilai: localGrades })
  }

  const handleAddPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!namaPenilaian.trim() || !kodePenilaian.trim()) {
      Swal.fire('Peringatan', 'Harap isi Nama dan Kode Penilaian.', 'warning')
      return
    }
    if (info?.bobot.id) {
      addPlanMutation.mutate({
        bobot_penilaian_id: info.bobot.id,
        nama_penilaian: namaPenilaian,
        kode_penilaian: kodePenilaian,
        kategori_penilaian: kategori,
        tanggal_penilaian: tanggalPenilaian,
        keterangan: keteranganPenilaian
      })
    }
  }

  const handleDeletePlan = (id: number, name: string) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Menghapus rencana penilaian "${name}" juga akan menghapus seluruh nilai siswa yang berkaitan!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        deletePlanMutation.mutate(id)
      }
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <IconLoader2 size={32} className="animate-spin text-[#064e3b]" />
        <span className="mt-2 text-xs font-semibold text-gray-500">Memuat halaman penilaian...</span>
      </div>
    )
  }

  if (error || !info) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <IconAlertCircle size={32} className="text-red-500" />
        <span className="mt-2 text-xs font-semibold text-gray-500">Gagal memuat form input nilai.</span>
        <button onClick={() => navigate(`/akademik/penilaian/${jadwalId}`)} className="mt-4 text-xs font-bold text-white bg-[#064e3b] px-4 py-2 rounded-xl">
          Kembali
        </button>
      </div>
    )
  }

  const isLocked = info.bobot.status === 'terkirim'
  const filteredStudents = info.students.filter(
    (s) => s.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) || s.nis.includes(searchQuery)
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans antialiased text-gray-800">
      {/* Header */}
      <header className="sticky top-0 bg-[#064e3b] text-white px-4 py-4 flex items-center gap-3 shadow-sm z-40 shrink-0">
        <button 
          onClick={() => navigate(`/akademik/penilaian/${jadwalId}`)}
          className="p-1 hover:bg-[#053e30] rounded-lg transition-colors active:scale-95"
        >
          <IconArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-[13px] font-bold tracking-wide leading-tight">Input Nilai {kategori}</h1>
          <span className="text-[10px] text-emerald-200/90 font-medium block">
            {info.bobot.nama_mapel} - Kelas {info.bobot.nama_kelas}
          </span>
        </div>
      </header>

      <div className="p-4 max-w-md mx-auto flex flex-col gap-4">
        {/* Info Header Card */}
        <div className="bg-[#064e3b] rounded-2xl p-4 text-white shadow-md relative overflow-hidden flex flex-col gap-2.5">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
          <div>
            <h2 className="text-sm font-bold leading-tight">Nilai {kategori === 'SUMATIF' ? 'Sumatif' : 'SAS'} Lingkup Materi</h2>
            <p className="text-[10px] text-emerald-200/90 font-medium mt-0.5">
              {info.bobot.nama_mapel} | Kelas {info.bobot.nama_kelas}
            </p>
          </div>

          {isLocked ? (
            <div className="flex items-center gap-1.5 text-[9.5px] font-semibold text-amber-300 bg-amber-500/20 py-2 px-3 rounded-xl border border-amber-500/20">
              <IconLock size={12} className="shrink-0" />
              <span>Nilai sudah dikirim dan dikunci. Anda tidak dapat melakukan perubahan.</span>
            </div>
          ) : (
            <div className="flex justify-between items-center pt-2.5 border-t border-white/10">
              <span className="text-[9px] font-semibold text-emerald-200/80 uppercase tracking-wider">Lingkup Materi</span>
              <button 
                onClick={() => setIsPlanModalOpen(true)}
                className="flex items-center gap-1 text-[9.5px] font-bold text-white bg-white/15 hover:bg-white/20 py-1.5 px-3 rounded-lg active:scale-95 transition-all"
              >
                <IconPlus size={12} />
                <span>Tambah Penilaian</span>
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <IconSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari nama atau NIS siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-gray-800 focus:border-[#064e3b] outline-none shadow-xs"
          />
        </div>

        {/* Student Assessment Form Cards */}
        {info.rencana.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
            <IconAlertCircle size={32} className="text-gray-400 mb-2" />
            <p className="text-xs font-bold text-gray-505">Belum ada rencana penilaian dalam kategori ini.</p>
            <p className="text-[10px] text-gray-400 mt-1">Harap ketuk "Tambah Penilaian" di atas terlebih dahulu.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-xs font-bold text-gray-400">
                Siswa tidak ditemukan.
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div key={student.id_siswa} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
                  {/* Student Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#064e3b] flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0 shadow-xs">
                        {student.foto ? (
                          <img 
                            src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/photos/pendaftaran/${student.foto}`} 
                            alt={student.nama_lengkap} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallback = e.currentTarget.nextSibling as HTMLDivElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-full h-full bg-gradient-to-br from-emerald-100 to-[#064e3b] text-white font-bold text-[10px] flex items-center justify-center"
                          style={{ display: student.foto ? 'none' : 'flex' }}
                        >
                          {student.nama_lengkap.split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase()}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11.5px] font-bold text-gray-800 block leading-tight truncate max-w-[190px]">{student.nama_lengkap}</span>
                        <span className="text-[8.5px] text-gray-400 font-medium mt-0.5">NIS: {student.nis}</span>
                      </div>
                    </div>
                  </div>

                  {/* Inputs for each Rencana Penilaian */}
                  <div className="flex flex-col gap-2 mt-1">
                    {info.rencana.map((plan) => {
                      const score = localGrades[student.id_siswa]?.[plan.id] ?? '';
                      return (
                        <div key={plan.id} className="flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-gray-800 block leading-tight">{plan.kode_penilaian}</span>
                            <span className="text-[8.5px] text-gray-400 font-medium block truncate" title={plan.nama_penilaian}>
                              {plan.nama_penilaian}
                            </span>
                          </div>
                          <div className="w-[70px] shrink-0">
                            <input 
                              type="number"
                              placeholder="-"
                              min="0"
                              max="100"
                              disabled={isLocked}
                              value={score}
                              onChange={(e) => handleInputChange(student.id_siswa, plan.id, e.target.value)}
                              className={`w-full h-9 border border-gray-200 rounded-lg text-center text-xs font-bold focus:border-[#064e3b] outline-none disabled:bg-gray-100 disabled:text-gray-400 ${
                                score !== '' ? (parseFloat(score) < 75 ? 'text-red-500' : 'text-emerald-600') : ''
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Sticky Save Bar */}
      {!isLocked && info.rencana.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 z-40 shadow-xl rounded-t-3xl flex gap-3">
          <button 
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#064e3b] hover:bg-[#053e30] py-3 rounded-xl shadow-md active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <IconLoader2 size={16} className="animate-spin" />
            ) : (
              <IconCheck size={16} />
            )}
            <span>Simpan Semua Nilai</span>
          </button>
        </div>
      )}

      {/* Add Assessment Plan Modal inside ManageNilai */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xs font-bold text-gray-900 mb-4">Tambah Rencana Penilaian ({kategori})</h3>
            <form onSubmit={handleAddPlanSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nama Penilaian</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Sumatif Harian 1"
                  value={namaPenilaian}
                  onChange={(e) => setNamaPenilaian(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#064e3b] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Kode Penilaian</label>
                <input 
                  type="text" 
                  placeholder="Contoh: S1 / SAS"
                  value={kodePenilaian}
                  onChange={(e) => setKodePenilaian(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#064e3b] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Tanggal Penilaian</label>
                <input 
                  type="date" 
                  value={tanggalPenilaian}
                  onChange={(e) => setTanggalPenilaian(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#064e3b] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Keterangan (Opsional)</label>
                <textarea 
                  rows={2}
                  placeholder="Tulis keterangan di sini..."
                  value={keteranganPenilaian}
                  onChange={(e) => setKeteranganPenilaian(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#064e3b] outline-none resize-none"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsPlanModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-gray-500 bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={addPlanMutation.isPending}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#064e3b] rounded-xl flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {addPlanMutation.isPending && <IconLoader2 size={12} className="animate-spin" />}
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

export default ManageNilai
