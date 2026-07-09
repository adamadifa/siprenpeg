import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  IconArrowLeft,
  IconX,
  IconPlus,
  IconFileText,
  IconStethoscope,
  IconUpload,
  IconCheck,
  IconCalendar,
  IconCircleFilled
} from '@tabler/icons-react'
import { getIzinHistory, storeIzin } from '../api/izin'
import { fetchSettings } from '../api/settings'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

const Izin: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Modal open state
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  // Form states
  const [jenisIzin, setJenisIzin] = React.useState<'izin' | 'sakit'>('izin')
  const [dari, setDari] = React.useState('')
  const [sampai, setSampai] = React.useState('')
  const [keterangan, setKeterangan] = React.useState('')
  const [sidImage, setSidImage] = React.useState<string | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)

  // Flatpickr refs
  const fpStartRef = React.useRef<any>(null)
  const fpEndRef = React.useRef<any>(null)

  // Initialize flatpickr on form inputs when modal opens
  const startCallback = React.useCallback((node: HTMLInputElement | null) => {
    if (fpStartRef.current) {
      fpStartRef.current.destroy()
      fpStartRef.current = null
    }
    if (node) {
      fpStartRef.current = flatpickr(node, {
        dateFormat: 'Y-m-d',
        defaultDate: dari || undefined,
        onChange: (_, dateStr) => {
          setDari(dateStr)
        }
      })
    }
  }, [isModalOpen])

  const endCallback = React.useCallback((node: HTMLInputElement | null) => {
    if (fpEndRef.current) {
      fpEndRef.current.destroy()
      fpEndRef.current = null
    }
    if (node) {
      fpEndRef.current = flatpickr(node, {
        dateFormat: 'Y-m-d',
        defaultDate: sampai || undefined,
        onChange: (_, dateStr) => {
          setSampai(dateStr)
        }
      })
    }
  }, [isModalOpen])

  // Queries
  const { data: historyResponse, isLoading } = useQuery({
    queryKey: ['izinHistory'],
    queryFn: getIzinHistory
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })

  // Submit Mutation
  const mutation = useMutation({
    mutationFn: storeIzin,
    onSuccess: (data) => {
      Swal.fire({
        title: 'Berhasil!',
        text: data.message || 'Pengajuan izin berhasil diajukan.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      setIsModalOpen(false)
      setDari('')
      setSampai('')
      setKeterangan('')
      setSidImage(null)
      setImagePreview(null)
      queryClient.invalidateQueries({ queryKey: ['izinHistory'] })
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Gagal mengirim pengajuan izin.'
      Swal.fire({
        title: 'Gagal!',
        text: errMsg,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      })
    }
  })

  // Image upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setSidImage(base64String)
        setImagePreview(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!dari || !sampai || !keterangan) {
      Swal.fire({
        title: 'Perhatian!',
        text: 'Mohon lengkapi semua kolom form.',
        icon: 'warning',
        confirmButtonColor: '#064e3b'
      })
      return
    }

    const t1 = new Date(dari)
    const t2 = new Date(sampai)
    const diffTime = Math.abs(t2.getTime() - t1.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    if (diffDays > 3) {
      Swal.fire({
        title: 'Peringatan!',
        text: 'Pengajuan izin tidak boleh lebih dari 3 hari!',
        icon: 'warning',
        confirmButtonColor: '#064e3b'
      })
      return
    }

    mutation.mutate({
      jenis_izin: jenisIzin,
      dari,
      sampai,
      keterangan,
      sid_image: jenisIzin === 'sakit' ? sidImage : null
    })
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const getDaysCount = (d1: string, d2: string) => {
    try {
      const t1 = new Date(d1)
      const t2 = new Date(d2)
      const diffTime = Math.abs(t2.getTime() - t1.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    } catch {
      return 1
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 mt-3 text-xs font-medium">Memuat data pengajuan...</p>
      </div>
    )
  }

  const listIzin = historyResponse?.data || []

  // Count stats
  const pendingCount = listIzin.filter(i => Number(i.status) === 0).length
  const approvedCount = listIzin.filter(i => Number(i.status) === 1).length
  const rejectedCount = listIzin.filter(i => Number(i.status) === 2).length

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Top Banner */}
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
          <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-full hover:bg-white/10 transition-colors mt-0.5">
            <IconArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">Pengajuan Izin</h1>
            <p className="text-[10px] text-[#a7f3d0] mt-1 leading-normal font-medium max-w-[240px]">
              Ajukan permohonan izin absen atau sakit dengan melampirkan keterangan medis Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Stats & Action Area */}
      <div className="px-5 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {/* Approved */}
            <div className="flex-1 text-center">
              <span className="text-xl font-bold text-emerald-600 block leading-none">
                {approvedCount}
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1.5 block">Disetujui</span>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-150" />

            {/* Pending */}
            <div className="flex-1 text-center">
              <span className="text-xl font-bold text-amber-500 block leading-none">
                {pendingCount}
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1.5 block">Pending</span>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-150" />

            {/* Rejected */}
            <div className="flex-1 text-center">
              <span className="text-xl font-bold text-rose-600 block leading-none">
                {rejectedCount}
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1.5 block">Ditolak</span>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-[#064e3b] hover:bg-[#053d2e] active:scale-[0.98] text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <IconPlus size={14} /> Ajukan Permohonan Izin Baru
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="px-5 mt-6">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3.5">Daftar Pengajuan</h3>

        <div className="space-y-2.5">
          {listIzin.map((item) => {
            const days = getDaysCount(item.dari, item.sampai)
            const isSakit = item.jenis_izin === 'sakit'
            const status = item.status

            return (
              <div 
                key={item.id} 
                className="bg-white rounded-xl border border-emerald-100 p-3 shadow-xs hover:border-emerald-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Calendar Badge Icon on the Left */}
                  <div className="flex flex-col items-center justify-center w-11 h-12 bg-gray-50 border border-gray-200/80 rounded-xl overflow-hidden shadow-2xs shrink-0">
                    <div className={`w-full py-0.5 text-center text-[7px] font-extrabold uppercase text-white tracking-wider ${
                      isSakit ? 'bg-amber-500' : 'bg-blue-500'
                    }`}>
                      {getMonthShort(item.dari)}
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center leading-none">
                      <span className="text-[11px] font-black text-gray-800">{getDateNumber(item.dari)}</span>
                      <span className="text-[7px] font-bold text-gray-400 uppercase mt-0.5">{days} HARI</span>
                    </div>
                  </div>

                  {/* Right Details Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-bold text-gray-800 truncate pr-2">
                        {isSakit ? 'Izin Sakit' : 'Izin Absen'}
                      </h4>
                      
                      {/* Status Badge */}
                      <div className="shrink-0">
                        {Number(status) === 0 && (
                          <span className="text-[7px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/40">
                            PENDING
                          </span>
                        )}
                        {Number(status) === 1 && (
                          <span className="text-[7px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100/60">
                            DISETUJUI
                          </span>
                        )}
                        {Number(status) === 2 && (
                          <span className="text-[7px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100/60">
                            DITOLAK
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-semibold mb-1">
                      <span>Periode:</span>
                      <span className="text-gray-700 font-bold bg-gray-50 border border-gray-150 rounded px-1.5 py-0.5">
                        {formatDate(item.dari)} - {formatDate(item.sampai)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[9px] text-gray-700 font-semibold">
                      <span className="truncate pr-4 italic">
                        "{item.keterangan}"
                      </span>
                      {item.doc_sid && (
                        <a 
                          href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/uploads/sid/${item.doc_sid}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[8px] font-extrabold text-emerald-800 hover:text-emerald-950 shrink-0 bg-emerald-50 rounded px-1.5 py-0.5 border border-emerald-100/60"
                        >
                          Surat Dokter
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {listIzin.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-xs">
              Belum ada riwayat pengajuan izin yang terdata.
            </div>
          )}
        </div>
      </div>

      {/* Form Submission Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 max-h-[85vh]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <IconFileText size={18} className="text-[#064e3b]" /> Formulir Pengajuan Izin
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-400 transition-colors cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>
            
            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Jenis Izin */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Jenis Pengajuan</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setJenisIzin('izin')
                      setSidImage(null)
                      setImagePreview(null)
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      jenisIzin === 'izin' 
                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-800 shadow-2xs' 
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <IconFileText size={18} className={jenisIzin === 'izin' ? 'text-emerald-700' : 'text-gray-400'} />
                    <span>Izin Absen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenisIzin('sakit')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      jenisIzin === 'sakit' 
                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-800 shadow-2xs' 
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <IconStethoscope size={18} className={jenisIzin === 'sakit' ? 'text-emerald-700' : 'text-gray-400'} />
                    <span>Izin Sakit</span>
                  </button>
                </div>
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Dari Tanggal</label>
                  <input 
                    ref={startCallback}
                    type="text" 
                    placeholder="Pilih tanggal"
                    readOnly
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-700 focus:outline-none focus:border-[#064e3b] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Sampai Tanggal</label>
                  <input 
                    ref={endCallback}
                    type="text" 
                    placeholder="Pilih tanggal"
                    readOnly
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-700 focus:outline-none focus:border-[#064e3b] font-medium"
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Keterangan / Alasan</label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Tuliskan keterangan lengkap di sini..."
                  rows={3}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-700 focus:outline-none focus:border-[#064e3b] font-medium resize-none"
                />
              </div>

              {/* Upload SID (only if Sakit) */}
              {jenisIzin === 'sakit' && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Upload Surat Dokter (SID)</label>
                  
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2 flex items-center justify-center max-h-[140px]">
                      <img 
                        src={imagePreview} 
                        alt="Preview Surat Dokter" 
                        className="max-h-[120px] max-w-full object-contain rounded-lg" 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSidImage(null)
                          setImagePreview(null)
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        <IconX size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-250 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col items-center justify-center py-6 px-4 cursor-pointer text-center group">
                      <IconUpload size={24} className="text-gray-400 group-hover:text-emerald-700 transition-colors mb-1.5" />
                      <span className="text-[10px] font-bold text-gray-500 block">Klik untuk Unggah Foto</span>
                      <span className="text-[8px] text-gray-400 block mt-0.5">Mendukung format JPG, PNG</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full py-2.5 bg-[#064e3b] hover:bg-[#053d2e] disabled:bg-gray-400 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {mutation.isPending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <IconCheck size={14} /> Kirim Pengajuan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Izin
