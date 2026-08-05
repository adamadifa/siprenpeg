import React from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  IconArrowLeft,
  IconBook,
  IconCheck,
  IconClock,
  IconFileText,
  IconUsers,
  IconAlertCircle,
  IconCalendar
} from '@tabler/icons-react'
import { getPresensiMapelData, storePresensiMapelData } from '../api/guru'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

const InputPresensiMapel: React.FC = () => {
  const navigate = useNavigate()
  const { jadwalId } = useParams<{ jadwalId: string }>()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()

  // Get today's date automatically (default to today)
  const [tanggal, setTanggal] = React.useState(() => {
    const paramTanggal = searchParams.get('tanggal')
    if (paramTanggal) return paramTanggal

    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })


  const fpRef = React.useRef<any>(null)
  const dateInputRef = React.useCallback((node: HTMLInputElement | null) => {
    if (fpRef.current) {
      fpRef.current.destroy()
      fpRef.current = null
    }
    if (node) {
      fpRef.current = flatpickr(node, {
        dateFormat: 'Y-m-d',
        defaultDate: tanggal || undefined,
        disableMobile: true,
        onChange: (_, dateStr) => {
          setTanggal(dateStr)
        }
      })
    }
  }, [])

  // Form states
  const [materi, setMateri] = React.useState('')
  const [statuses, setStatuses] = React.useState<Record<number, string>>({})
  const [notes, setNotes] = React.useState<Record<number, string>>({})

  // Fetch Page Data
  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['presensiMapelInput', jadwalId, tanggal],
    queryFn: () => getPresensiMapelData(jadwalId!, tanggal),
    enabled: !!jadwalId
  })

  // Initialize form states when data loads
  React.useEffect(() => {
    if (responseData?.success && responseData.data) {
      setMateri(responseData.data.materi || '')
      
      const initialStatuses: Record<number, string> = {}
      const initialNotes: Record<number, string> = {}
      
      responseData.data.students.forEach((s) => {
        initialStatuses[s.siswa_id] = s.status || 'H'
        initialNotes[s.siswa_id] = s.keterangan || ''
      })
      
      setStatuses(initialStatuses)
      setNotes(initialNotes)
    }
  }, [responseData])

  // Store mutation
  const mutation = useMutation({
    mutationFn: storePresensiMapelData,
    onSuccess: (data) => {
      Swal.fire({
        title: 'Berhasil!',
        text: data.message || 'Presensi mata pelajaran berhasil disimpan.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      queryClient.invalidateQueries({ queryKey: ['guruDashboard'] })
      queryClient.invalidateQueries({ queryKey: ['presensiMapelInput', jadwalId, tanggal] })
      navigate('/akademik')
    },
    onError: (err: any) => {
      Swal.fire({
        title: 'Gagal!',
        text: err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan presensi.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      })
    }
  })

  const handleStatusChange = (siswaId: number, newStatus: string) => {
    setStatuses((prev) => ({ ...prev, [siswaId]: newStatus }))
  }

  const handleNoteChange = (siswaId: number, note: string) => {
    setNotes((prev) => ({ ...prev, [siswaId]: note }))
  }

  const handleSave = () => {
    if (!materi.trim()) {
      Swal.fire({
        title: 'Perhatian!',
        text: 'Mohon isi materi pelajaran hari ini.',
        icon: 'warning',
        confirmButtonColor: '#064e3b'
      })
      return
    }

    mutation.mutate({
      jadwal_pelajaran_id: Number(jadwalId),
      tanggal: tanggal!,
      status: statuses,
      keterangan: notes,
      materi
    })
  }

  const formatDateLabel = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })
    } catch {
      return dateStr
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 mt-3 text-xs font-semibold">Memuat daftar siswa...</p>
      </div>
    )
  }

  if (error || !responseData?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <IconAlertCircle size={32} className="text-red-500" />
        </div>
        <h3 className="font-bold text-gray-800 mb-1">Akses Ditolak</h3>
        <p className="text-xs text-gray-500 mb-4 max-w-xs leading-relaxed">
          {((error as any)?.response?.data?.message) || 'Tidak dapat memuat data presensi mata pelajaran.'}
        </p>
        <button 
          onClick={() => navigate('/akademik')}
          className="px-5 py-2.5 bg-[#064e3b] text-white rounded-xl text-xs font-semibold active:scale-95 transition-transform"
        >
          Kembali ke Akademik
        </button>
      </div>
    )
  }

  const { jadwal, students, presensi_id } = responseData.data

  const totalSiswa = students.length
  const totalHadir = Object.values(statuses).filter(s => s === 'H').length
  const totalIzin = Object.values(statuses).filter(s => s === 'I').length
  const totalSakit = Object.values(statuses).filter(s => s === 'S').length
  const totalAlpa = Object.values(statuses).filter(s => s === 'A').length

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'H': return 'bg-emerald-500 text-white border-emerald-500'
      case 'I': return 'bg-blue-500 text-white border-blue-500'
      case 'S': return 'bg-amber-500 text-white border-amber-500'
      case 'A': return 'bg-rose-500 text-white border-rose-500'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      {/* Top Banner Header */}
      <div className="bg-[#064e3b] px-5 pt-5 pb-24 relative overflow-hidden rounded-b-[2rem] shadow-md">
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-emerald-500/[0.08] blur-2xl pointer-events-none -mr-16 -mt-16" />
        
        <div className="relative z-10 flex items-start gap-3">
          <button onClick={() => navigate('/akademik')} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors mt-0.5">
            <IconArrowLeft size={18} className="text-white" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-white tracking-wide">Input Presensi Mapel</h1>
            <p className="text-[10px] text-[#a7f3d0] mt-0.5 leading-normal font-medium truncate max-w-[280px]">
              {formatDateLabel(tanggal)}
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Info Card - Overlaps Banner */}
      <div className="px-5 -mt-16 relative z-10 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-lg flex flex-col gap-4 relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full bg-emerald-50/50 pointer-events-none" />
          
          <div className="flex items-start gap-4 relative z-10">
            {/* Subject Icon Box */}
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-inner">
              <IconBook className="text-[#064e3b]" size={24} />
            </div>
            
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-gray-900 leading-tight">{jadwal.nama_mapel}</h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-semibold px-2 py-0.5 rounded-md">
                  Jam ke {jadwal.jam_ke}
                </span>
                <span className="text-[9px] bg-slate-50 text-slate-700 border border-slate-200/60 font-semibold px-2 py-0.5 rounded-md">
                  Kelas {jadwal.nama_kelas}
                </span>
                <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-100 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <IconClock size={10} />
                  {jadwal.jam_mulai} - {jadwal.jam_selesai}
                </span>
              </div>
            </div>
          </div>
 
          <div className="border-t border-gray-100 pt-3.5 relative z-10 flex flex-col gap-3.5">
            <div>
              <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
                Tanggal Presensi
              </label>
              <div className="relative flex items-center">
                <IconCalendar size={14} className="text-gray-400 absolute left-3.5 z-10" />
                <input
                  type="text"
                  ref={dateInputRef}
                  value={tanggal}
                  readOnly
                  className="w-full text-xs text-black border border-gray-250 rounded-xl pl-9 pr-3.5 py-2.5 outline-none focus:border-[#064e3b] transition-colors bg-gray-50/50 cursor-pointer"
                />
              </div>
            </div>
 
            <div>
              <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
                Materi Pelajaran Hari Ini *
              </label>
              <div className="relative">
                <textarea
                  value={materi}
                  onChange={(e) => setMateri(e.target.value)}
                  placeholder="Masukkan judul bab atau pokok bahasan materi pelajaran hari ini..."
                  rows={2}
                  className="w-full text-xs text-black border border-gray-250 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#064e3b] transition-colors resize-none placeholder-gray-400 bg-gray-50/50"
                />
              </div>
            </div>
          </div>
 
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-4 gap-2.5 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div>
            <span className="text-sm font-extrabold text-emerald-600 block leading-none">{totalHadir}</span>
            <span className="text-[8px] text-gray-400 font-bold uppercase mt-1 block">Hadir</span>
          </div>
          <div>
            <span className="text-sm font-extrabold text-blue-600 block leading-none">{totalIzin}</span>
            <span className="text-[8px] text-gray-400 font-bold uppercase mt-1 block">Izin</span>
          </div>
          <div>
            <span className="text-sm font-extrabold text-amber-500 block leading-none">{totalSakit}</span>
            <span className="text-[8px] text-gray-400 font-bold uppercase mt-1 block">Sakit</span>
          </div>
          <div>
            <span className="text-sm font-extrabold text-rose-600 block leading-none">{totalAlpa}</span>
            <span className="text-[8px] text-gray-400 font-bold uppercase mt-1 block">Alpa</span>
          </div>
        </div>

        {/* Student List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <IconUsers size={16} className="text-[#064e3b]" />
              <h3 className="text-xs font-bold text-gray-800">Daftar Siswa</h3>
            </div>
            <span className="text-[9px] font-bold text-gray-450 bg-gray-100 px-2 py-0.5 rounded-full">
              {totalSiswa} Siswa
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {students.map((student, idx) => {
              const currentStatus = statuses[student.siswa_id] || 'H'
              const currentNote = notes[student.siswa_id] || ''

              return (
                <div key={student.siswa_id} className="bg-white rounded-2xl border border-gray-150 p-3.5 shadow-sm flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    {/* Student Number & Avatar */}
                    <div className="relative shrink-0">
                      {student.foto ? (
                        <img 
                          src={student.foto} 
                          alt={student.nama_lengkap} 
                          className="w-10 h-10 rounded-full object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center justify-center">
                          {student.nama_lengkap.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-[8px] font-extrabold px-1 py-0.5 rounded-full min-w-4 text-center leading-none">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-900 leading-snug break-words">{student.nama_lengkap}</h4>
                      <p className="text-[9px] text-gray-400 mt-0.5">No. Pendaftaran: {student.no_pendaftaran}</p>
                    </div>
                  </div>

                  {/* Status Segmented Picker */}
                  <div className="grid grid-cols-4 gap-2 border-t border-gray-100 pt-3">
                    {[
                      { key: 'H', label: 'Hadir' },
                      { key: 'I', label: 'Izin' },
                      { key: 'S', label: 'Sakit' },
                      { key: 'A', label: 'Alpa' }
                    ].map((st) => {
                      const isSelected = currentStatus === st.key
                      return (
                        <button
                          key={st.key}
                          onClick={() => handleStatusChange(student.siswa_id, st.key)}
                          className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all active:scale-[0.96] text-center ${
                            isSelected 
                              ? getStatusColorClass(st.key) 
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {st.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Note/Keterangan input */}
                  {currentStatus !== 'H' && (
                    <div className="relative mt-1">
                      <IconFileText size={12} className="text-gray-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={currentNote}
                        onChange={(e) => handleNoteChange(student.siswa_id, e.target.value)}
                        placeholder={`Keterangan ${student.nama_lengkap.split(' ')[0]}...`}
                        className="w-full text-[10px] text-black border border-gray-200 rounded-lg pl-7 pr-2.5 py-1.5 outline-none focus:border-[#064e3b] transition-colors placeholder-gray-400"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

        {/* Action Button */}
        <div className="mt-8 mb-6 px-5 w-full flex items-center justify-center">
          <button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="w-full py-3 bg-[#064e3b] hover:bg-[#043a2b] disabled:bg-emerald-800/60 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/10"
          >
            {mutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <IconCheck size={16} />
            )}
            {presensi_id ? 'Simpan Perubahan' : 'Simpan Presensi'}
          </button>
        </div>
      </div>
  )
}

export default InputPresensiMapel
