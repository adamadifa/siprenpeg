import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  IconArrowLeft,
  IconPlus,
  IconCalendar,
  IconTrash,
  IconClipboardText,
  IconPhoto
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

  // Flatpickr refs
  const fpStartRef = useRef<any>(null)
  const fpEndRef = useRef<any>(null)

  const startCallback = useCallback((node: HTMLInputElement | null) => {
    if (fpStartRef.current) {
      fpStartRef.current.destroy()
      fpStartRef.current = null
    }
    if (node) {
      fpStartRef.current = flatpickr(node, {
        dateFormat: 'Y-m-d',
        defaultDate: startDate || undefined,
        onChange: (_, dateStr) => {
          setStartDate(dateStr)
        }
      })
    }
  }, [startDate])

  const endCallback = useCallback((node: HTMLInputElement | null) => {
    if (fpEndRef.current) {
      fpEndRef.current.destroy()
      fpEndRef.current = null
    }
    if (node) {
      fpEndRef.current = flatpickr(node, {
        dateFormat: 'Y-m-d',
        defaultDate: endDate || undefined,
        onChange: (_, dateStr) => {
          setEndDate(dateStr)
        }
      })
    }
  }, [endDate])

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
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <IconCalendar size={18} className="text-emerald-600" />
            <span className="text-sm font-semibold text-gray-900">Filter Tanggal</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-medium text-gray-500 block mb-1">DARI</label>
              <input
                ref={startCallback}
                type="text"
                readOnly
                className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-gray-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 block mb-1">SAMPAI</label>
              <input
                ref={endCallback}
                type="text"
                readOnly
                className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-gray-700"
              />
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
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-55 bg-opacity-20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {item.jobdesk || 'Tugas Umum'}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 mt-1">{item.nama_kegiatan}</h3>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id, item.nama_kegiatan)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Hapus"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600">
                      <p className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-700 shrink-0">Tanggal:</span>
                        <span>{formattedDate}</span>
                      </p>
                      {item.program_kerja && (
                        <p className="flex items-start gap-1.5">
                          <span className="font-semibold text-gray-700 shrink-0">Program Kerja:</span>
                          <span className="italic text-gray-500">{item.program_kerja}</span>
                        </p>
                      )}
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="font-semibold text-gray-700 mb-1">Uraian Kegiatan:</p>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{item.uraian_kegiatan}</p>
                      </div>
                    </div>
                  </div>

                  {item.foto_url && (
                    <div className="border-t border-gray-100 bg-gray-50 p-3 flex items-center gap-2">
                      <IconPhoto size={16} className="text-gray-400" />
                      <a
                        href={item.foto_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-600 hover:underline font-medium truncate"
                      >
                        Lihat Foto Lampiran
                      </a>
                    </div>
                  )}
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
    </div>
  )
}

export default Kegiatan
