import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  IconArrowLeft,
  IconCalendar
} from '@tabler/icons-react'
import { createAgenda } from '../api/agenda'
import { fetchSettings } from '../api/settings'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

const InputAgenda: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Form states
  const todayStr = new Date().toISOString().split('T')[0]
  const [tanggal, setTanggal] = useState(todayStr)
  const [namaKegiatan, setNamaKegiatan] = useState('')
  const [uraianKegiatan, setUraianKegiatan] = useState('')



  // Queries
  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })

  // Submit mutation
  const mutation = useMutation({
    mutationFn: createAgenda,
    onSuccess: (data) => {
      Swal.fire({
        title: 'Berhasil!',
        text: data.message || 'Agenda berhasil disimpan.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      queryClient.invalidateQueries({ queryKey: ['agendaList'] })
      navigate('/agenda')
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Gagal menyimpan agenda.'
      Swal.fire({
        title: 'Gagal!',
        text: errMsg,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tanggal || !namaKegiatan || !uraianKegiatan) {
      Swal.fire({
        title: 'Perhatian!',
        text: 'Mohon isi semua kolom yang wajib.',
        icon: 'warning',
        confirmButtonColor: '#064e3b'
      })
      return
    }

    mutation.mutate({
      tanggal,
      nama_kegiatan: namaKegiatan,
      uraian_kegiatan: uraianKegiatan
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div 
        className="bg-[#064e3b] px-4 py-4 text-white flex items-center gap-3 sticky top-0 z-30"
        style={settingsData?.data?.background_login ? {
          backgroundImage: `linear-gradient(to right, rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.92)), url(${settingsData.data.background_login})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <button onClick={() => navigate('/agenda')} className="p-1 rounded-full hover:bg-white/10 transition-colors">
          <IconArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold">Input Agenda</h1>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
          
          {/* Tanggal */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Tanggal Agenda <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full bg-slate-50 border border-gray-250/70 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-gray-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Nama Kegiatan */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Rencana Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaKegiatan}
              onChange={(e) => setNamaKegiatan(e.target.value)}
              placeholder="Contoh: Rapat Evaluasi Kurikulum"
              className="w-full bg-slate-50 border border-gray-250/70 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-gray-700"
              required
            />
          </div>

          {/* Uraian Kegiatan */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Uraian Rencana Kegiatan <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              value={uraianKegiatan}
              onChange={(e) => setUraianKegiatan(e.target.value)}
              placeholder="Tuliskan detail rencana dan hal-hal yang akan dipersiapkan..."
              className="w-full bg-slate-50 border border-gray-250/70 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-gray-700"
              required
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/agenda')}
              className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold py-2.5 rounded-lg transition-colors text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 rounded-lg transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Agenda'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default InputAgenda
