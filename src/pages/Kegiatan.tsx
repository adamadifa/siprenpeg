import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  IconArrowLeft,
  IconPlus,
  IconCalendar,
  IconTrash,
  IconClipboardText,
  IconPhoto,
  IconBriefcase
} from '@tabler/icons-react'
import { getKegiatanList, deleteKegiatan } from '../api/kegiatan'
import { fetchSettings } from '../api/settings'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

const Kegiatan: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Filter states
  const today = new Date().toISOString().split('T')[0]
  // Default show past 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(thirtyDaysAgo)
  const [endDate, setEndDate] = useState(today)
  const [selectedKegiatan, setSelectedKegiatan] = useState<any | null>(null)

  const startRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let startInstance: any
    let endInstance: any

    const formatDateToYmd = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    if (startRef.current) {
      startInstance = flatpickr(startRef.current, {
        dateFormat: 'd F Y',
        disableMobile: true,
        defaultDate: startDate,
        onChange: (selectedDates) => {
          if (selectedDates.length > 0) {
            setStartDate(formatDateToYmd(selectedDates[0]))
          }
        }
      })
    }

    if (endRef.current) {
      endInstance = flatpickr(endRef.current, {
        dateFormat: 'd F Y',
        disableMobile: true,
        defaultDate: endDate,
        onChange: (selectedDates) => {
          if (selectedDates.length > 0) {
            setEndDate(formatDateToYmd(selectedDates[0]))
          }
        }
      })
    }

    return () => {
      if (startInstance) startInstance.destroy()
      if (endInstance) endInstance.destroy()
    }
  }, [])

  // Queries
  const { data: kegiatanResponse, isLoading } = useQuery({
    queryKey: ['kegiatanList', startDate, endDate],
    queryFn: () => getKegiatanList(startDate, endDate)
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteKegiatan,
    onSuccess: (data) => {
      Swal.fire({
        title: 'Berhasil!',
        text: data.message || 'Kegiatan berhasil dihapus.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      queryClient.invalidateQueries({ queryKey: ['kegiatanList'] })
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Gagal menghapus kegiatan.'
      Swal.fire({
        title: 'Gagal!',
        text: errMsg,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      })
    }
  })

  const handleDelete = (id: number, nama: string) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Hapus kegiatan "${nama}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id)
      }
    })
  }

  const list = kegiatanResponse?.data || []

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div 
        className="bg-[#064e3b] px-4 py-4 text-white flex items-center gap-3 relative sticky top-0 z-30"
        style={settingsData?.data?.background_login ? {
          backgroundImage: `linear-gradient(to right, rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.92)), url(${settingsData.data.background_login})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <button onClick={() => navigate('/dashboard')} className="p-1 rounded-full hover:bg-white/10 transition-colors">
          <IconArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold">Realisasi Kegiatan</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="absolute -top-2 left-3.5 bg-white px-1.5 text-[10px] font-bold text-slate-500 z-10 transition-colors">Start Date</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:ring-1 focus-within:ring-emerald-600 focus-within:border-emerald-600 transition-all">
                <IconCalendar size={16} className="text-slate-400 mr-2 shrink-0" />
                <input
                  ref={startRef}
                  type="text"
                  placeholder="Pilih Tanggal"
                  className="w-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                />
              </div>
            </div>
            <div className="relative">
              <label className="absolute -top-2 left-3.5 bg-white px-1.5 text-[10px] font-bold text-slate-500 z-10 transition-colors">End Date</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:ring-1 focus-within:ring-emerald-600 focus-within:border-emerald-600 transition-all">
                <IconCalendar size={16} className="text-slate-400 mr-2 shrink-0" />
                <input
                  ref={endRef}
                  type="text"
                  placeholder="Pilih Tanggal"
                  className="w-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span className="text-xs text-gray-500">Memuat data...</span>
            </div>
          ) : list.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-250/70 p-8 text-center shadow-xs">
              <IconClipboardText size={48} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600">Belum Ada Realisasi Kegiatan</p>
              <p className="text-xs text-gray-400 mt-1">Silakan tambahkan kegiatan baru Anda hari ini.</p>
            </div>
          ) : (
            list.map((item) => {
              const formattedDate = new Date(item.tanggal).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })

              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedKegiatan(item)}
                  className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md hover:border-emerald-250 active:scale-[0.99] transition-all overflow-hidden flex flex-col cursor-pointer group"
                >
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-emerald-800 transition-colors">
                          {item.nama_kegiatan}
                        </h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id, item.nama_kegiatan)
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Hapus"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <IconCalendar size={14} className="text-gray-400 shrink-0 mt-0.5" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <IconBriefcase size={14} className="text-gray-400 shrink-0 mt-0.5" />
                        <span className="font-semibold text-gray-700">{item.jobdesk || 'Tugas Umum'}</span>
                      </div>
                      {item.program_kerja && (
                        <div className="flex items-start gap-1.5">
                          <IconClipboardText size={14} className="text-gray-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1 italic">{item.program_kerja}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400 line-clamp-1 flex-1 pr-4">
                        {item.uraian_kegiatan ? item.uraian_kegiatan.replace(/<[^>]*>/g, '') : ''}
                      </span>
                      {item.foto_url && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                          <IconPhoto size={12} />
                          Ada Foto
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto pointer-events-none px-4 z-40">
        <div className="flex justify-end w-full">
          <button
            onClick={() => navigate('/kegiatan/input')}
            className="w-12 h-12 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all pointer-events-auto"
          >
            <IconPlus size={24} />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedKegiatan && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-opacity duration-300"
          onClick={() => setSelectedKegiatan(null)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start">
              <div className="space-y-1 pr-6">
                <h3 className="text-base font-bold text-gray-900 leading-snug">{selectedKegiatan.nama_kegiatan}</h3>
              </div>
              <button 
                onClick={() => setSelectedKegiatan(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-slate-50/50">
              <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-2xs space-y-3">
                <div className="flex justify-between gap-4 text-xs border-b border-gray-100 pb-2.5">
                  <div className="flex-1">
                    <span className="text-gray-400 block mb-0.5 font-medium uppercase tracking-wider text-[10px]">Tanggal</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(selectedKegiatan.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="text-xs border-b border-gray-100 pb-2.5">
                  <span className="text-gray-400 block mb-0.5 font-medium uppercase tracking-wider text-[10px]">Jobdesk / Tugas</span>
                  <span className="font-semibold text-gray-800 leading-relaxed block">
                    {selectedKegiatan.jobdesk || 'Tugas Umum'}
                  </span>
                </div>
                {selectedKegiatan.program_kerja && (
                  <div className="text-xs pt-0.5">
                    <span className="text-gray-400 block mb-0.5 font-medium uppercase tracking-wider text-[10px]">Program Kerja</span>
                    <span className="font-semibold text-gray-800 leading-relaxed block">
                      {selectedKegiatan.program_kerja}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Uraian Kegiatan</h4>
                <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-2xs">
                  <div 
                    className="text-sm text-gray-700 leading-relaxed [&_p]:mb-2 last:[&_p]:mb-0"
                    dangerouslySetInnerHTML={{ __html: selectedKegiatan.uraian_kegiatan || '' }}
                  />
                </div>
              </div>

              {selectedKegiatan.foto_url && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Foto Dokumentasi</h4>
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white p-2">
                    <img 
                      src={selectedKegiatan.foto_url} 
                      alt="Dokumentasi" 
                      className="w-full object-cover max-h-64 rounded-lg hover:brightness-95 transition-all cursor-pointer"
                      onClick={() => window.open(selectedKegiatan.foto_url, '_blank')}
                    />
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md pointer-events-none">
                      Klik gambar untuk memperbesar
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedKegiatan(null)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Kegiatan
