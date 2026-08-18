import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  IconArrowLeft,
  IconCalendar,
  IconUpload,
  IconX,
  IconClipboardText,
  IconFileDescription
} from '@tabler/icons-react'
import { getKegiatanOptions, createKegiatan } from '../api/kegiatan'
import { fetchSettings } from '../api/settings'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

const InputKegiatan: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Form states
  const todayStr = new Date().toISOString().split('T')[0]
  const [tanggal, setTanggal] = useState(todayStr)
  const [namaKegiatan, setNamaKegiatan] = useState('')
  const [kodeJobdesk, setKodeJobdesk] = useState('')
  const [kodeProgramKerja, setKodeProgramKerja] = useState('')
  const [uraianKegiatan, setUraianKegiatan] = useState('')
  const [foto, setFoto] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Flatpickr ref
  const fpRef = useRef<any>(null)

  const dateCallback = useCallback((node: HTMLInputElement | null) => {
    if (fpRef.current) {
      fpRef.current.destroy()
      fpRef.current = null
    }
    if (node) {
      fpRef.current = flatpickr(node, {
        dateFormat: 'Y-m-d',
        defaultDate: tanggal || undefined,
        onChange: (_, dateStr) => {
          setTanggal(dateStr)
        }
      })
    }
  }, [tanggal])

  // Queries
  const { data: optionsResponse, isLoading: isLoadingOptions } = useQuery({
    queryKey: ['kegiatanOptions'],
    queryFn: getKegiatanOptions
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })

  // Submit mutation
  const mutation = useMutation({
    mutationFn: createKegiatan,
    onSuccess: (data) => {
      Swal.fire({
        title: 'Berhasil!',
        text: data.message || 'Realisasi kegiatan berhasil disimpan.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      queryClient.invalidateQueries({ queryKey: ['kegiatanList'] })
      navigate('/kegiatan')
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Gagal menyimpan kegiatan.'
      Swal.fire({
        title: 'Gagal!',
        text: errMsg,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      })
    }
  })

  // Image change handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        Swal.fire({
          title: 'Format Tidak Valid!',
          text: 'Format foto harus berupa JPG, JPEG, atau PNG.',
          icon: 'warning',
          confirmButtonColor: '#064e3b'
        })
        return
      }

      // Read file as base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setFoto(base64String)
        setImagePreview(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFoto(null)
    setImagePreview(null)
  }

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
      uraian_kegiatan: uraianKegiatan,
      kode_jobdesk: kodeJobdesk || undefined,
      kode_program_kerja: kodeProgramKerja || undefined,
      foto: foto || undefined
    })
  }

  const jobdesks = optionsResponse?.data?.jobdesks || []
  const programs = optionsResponse?.data?.programs || []

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
        <button onClick={() => navigate('/kegiatan')} className="p-1 rounded-full hover:bg-white/10 transition-colors">
          <IconArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold">Input Kegiatan</h1>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
          
          {/* Tanggal */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Tanggal Kegiatan <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={dateCallback}
                type="text"
                readOnly
                className="w-full bg-slate-50 border border-gray-250/70 rounded-lg pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-gray-700 cursor-pointer"
              />
              <IconCalendar size={16} className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Nama Kegiatan */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Nama Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaKegiatan}
              onChange={(e) => setNamaKegiatan(e.target.value)}
              placeholder="Contoh: Mengawas Ujian Pagi"
              className="w-full bg-slate-50 border border-gray-250/70 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-gray-700"
              required
            />
          </div>

          {/* Jobdesk Dropdown */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Jobdesk / Tugas
            </label>
            <select
              value={kodeJobdesk}
              onChange={(e) => setKodeJobdesk(e.target.value)}
              className="w-full bg-slate-50 border border-gray-250/70 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-gray-700 cursor-pointer"
            >
              <option value="">-- Pilih Jobdesk (Tugas Umum jika kosong) --</option>
              {isLoadingOptions ? (
                <option disabled>Memuat pilihan...</option>
              ) : (
                jobdesks.map((jd) => (
                  <option key={jd.kode_jobdesk} value={jd.kode_jobdesk}>
                    {jd.jobdesk}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Program Kerja Dropdown */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Program Kerja Terkait
            </label>
            <select
              value={kodeProgramKerja}
              onChange={(e) => setKodeProgramKerja(e.target.value)}
              className="w-full bg-slate-50 border border-gray-250/70 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-gray-700 cursor-pointer"
            >
              <option value="">-- Pilih Program Kerja (Jika ada) --</option>
              {isLoadingOptions ? (
                <option disabled>Memuat pilihan...</option>
              ) : (
                programs.map((prog) => (
                  <option key={prog.kode_program_kerja} value={prog.kode_program_kerja}>
                    {prog.program_kerja}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Uraian Kegiatan */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Uraian Kegiatan <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={uraianKegiatan}
              onChange={(e) => setUraianKegiatan(e.target.value)}
              placeholder="Tuliskan rincian kegiatan yang telah dilakukan..."
              className="w-full bg-slate-50 border border-gray-250/70 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-gray-700"
              required
            />
          </div>

          {/* Upload Foto */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Foto Lampiran (Opsional)
            </label>
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-video flex items-center justify-center">
                <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm"
                >
                  <IconX size={16} />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                <IconUpload size={32} className="text-gray-400 mb-1.5" />
                <span className="text-xs font-semibold text-gray-700">Ambil Foto / Pilih File</span>
                <span className="text-[10px] text-gray-400 mt-0.5">Format: JPG, JPEG, PNG (Maks 1MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/kegiatan')}
              className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold py-2.5 rounded-lg transition-colors text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 rounded-lg transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Kegiatan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default InputKegiatan
