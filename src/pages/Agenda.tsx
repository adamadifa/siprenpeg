import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  IconArrowLeft,
  IconPlus,
  IconCalendar,
  IconTrash,
  IconClipboardText
} from '@tabler/icons-react'
import { getAgendaList, deleteAgenda } from '../api/agenda'
import { fetchSettings } from '../api/settings'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

const Agenda: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Filter states
  const today = new Date().toISOString().split('T')[0]
  // Default show past 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(thirtyDaysAgo)
  const [endDate, setEndDate] = useState(today)

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
  const { data: agendaResponse, isLoading } = useQuery({
    queryKey: ['agendaList', startDate, endDate],
    queryFn: () => getAgendaList(startDate, endDate)
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAgenda,
    onSuccess: (data) => {
      Swal.fire({
        title: 'Berhasil!',
        text: data.message || 'Agenda berhasil dihapus.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      queryClient.invalidateQueries({ queryKey: ['agendaList'] })
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Gagal menghapus agenda.'
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
      text: `Hapus agenda "${nama}"?`,
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

  const list = agendaResponse?.data || []

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div 
        className="bg-[#064e3b] px-4 py-4 text-white flex items-center gap-3 sticky top-0 z-35"
        style={settingsData?.data?.background_login ? {
          backgroundImage: `linear-gradient(to right, rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.92)), url(${settingsData.data.background_login})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <button onClick={() => navigate('/dashboard')} className="p-1 rounded-full hover:bg-white/10 transition-colors">
          <IconArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold">Agenda Kegiatan</h1>
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
              <p className="text-sm font-semibold text-gray-600">Belum Ada Agenda Kegiatan</p>
              <p className="text-xs text-gray-400 mt-1">Silakan tambahkan rencana agenda baru Anda.</p>
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
                  <div className="p-4">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="text-sm font-bold text-gray-900">{item.nama_kegiatan}</h3>
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
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="font-semibold text-gray-700 mb-1">Uraian Rencana:</p>
                        <div 
                          className="text-gray-600 leading-relaxed [&_p]:mb-2 last:[&_p]:mb-0"
                          dangerouslySetInnerHTML={{ __html: item.uraian_kegiatan || '' }}
                        />
                      </div>
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
            onClick={() => navigate('/agenda/input')}
            className="w-12 h-12 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all pointer-events-auto"
          >
            <IconPlus size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Agenda
