import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  IconArrowLeft,
  IconSearch,
  IconBriefcase,
  IconHierarchy2,
  IconInfoCircle,
  IconBook,
  IconPlus,
  IconTrash
} from '@tabler/icons-react'
import { getProgramKerjaList, createProgramKerja, deleteProgramKerja } from '../api/programkerja'
import { fetchSettings } from '../api/settings'

const ProgramKerja: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedTa, setSelectedTa] = useState('')
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null)

  const queryClient = useQueryClient()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newProgramName, setNewProgramName] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [newKeterangan, setNewKeterangan] = useState('')

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: createProgramKerja,
    onSuccess: (data) => {
      Swal.fire({
        title: 'Berhasil!',
        text: data.message || 'Program kerja berhasil disimpan.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      setIsAddModalOpen(false)
      setNewProgramName('')
      setNewTarget('')
      setNewKeterangan('')
      queryClient.invalidateQueries({ queryKey: ['programKerjaList'] })
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Gagal menyimpan program kerja.'
      Swal.fire({
        title: 'Gagal!',
        text: errMsg,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      })
    }
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProgramKerja,
    onSuccess: (data) => {
      Swal.fire({
        title: 'Berhasil!',
        text: data.message || 'Program kerja berhasil dihapus.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      setSelectedProgram(null)
      queryClient.invalidateQueries({ queryKey: ['programKerjaList'] })
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Gagal menghapus program kerja.'
      Swal.fire({
        title: 'Gagal!',
        text: errMsg,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      })
    }
  })

  const handleDelete = (kode: string, name: string) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Hapus program kerja "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(kode)
      }
    })
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProgramName || !newTarget) {
      Swal.fire({
        title: 'Peringatan',
        text: 'Program kerja dan target pencapaian harus diisi.',
        icon: 'warning',
        confirmButtonColor: '#064e3b'
      })
      return
    }
    createMutation.mutate({
      program_kerja: newProgramName,
      target_pencapaian: newTarget,
      keterangan: newKeterangan || undefined
    })
  }

  // Queries
  const { data: programResponse, isLoading } = useQuery({
    queryKey: ['programKerjaList', search, selectedTa],
    queryFn: () => getProgramKerjaList(search, selectedTa)
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })

  // Set default active academic year on load
  useEffect(() => {
    if (programResponse?.ta_aktif && !selectedTa) {
      setSelectedTa(programResponse.ta_aktif)
    }
  }, [programResponse])

  const list = programResponse?.data || []

  // Helper to safely strip HTML tags or handle rendering
  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div 
        className="bg-[#064e3b] px-4 py-4 text-white flex items-center gap-3 relative sticky top-0 z-30 shadow-sm"
        style={settingsData?.data?.background_login ? {
          backgroundImage: `linear-gradient(to right, rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.92)), url(${settingsData.data.background_login})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <button onClick={() => navigate('/dashboard')} className="p-1 rounded-full hover:bg-white/10 transition-colors">
          <IconArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold">Program Kerja Saya</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-xs">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <IconSearch size={16} />
              </span>
              <input
                type="text"
                placeholder="Cari program..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-gray-150 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-gray-700"
              />
            </div>
            <div className="relative w-36">
              <select
                value={selectedTa}
                onChange={(e) => setSelectedTa(e.target.value)}
                className="w-full bg-slate-50 border border-gray-150 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-gray-700 appearance-none pr-8"
              >
                <option value="">Semua TA</option>
                {programResponse?.tahun_ajaran?.map((ta) => (
                  <option key={ta.kode_ta} value={ta.kode_ta}>
                    {ta.tahun_ajaran} {ta.status === 1 ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-450">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-xs">
              <IconBook size={48} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600">Tidak Ada Program Kerja</p>
              <p className="text-xs text-gray-400 mt-1">Belum ada data program kerja untuk kriteria filter ini.</p>
            </div>
          ) : (
            list.map((item) => (
              <div 
                key={item.kode_program_kerja} 
                onClick={() => setSelectedProgram(item)}
                className="bg-white rounded-xl border border-gray-150 hover:border-emerald-200 hover:shadow-sm active:scale-[0.995] transition-all overflow-hidden flex cursor-pointer group"
              >
                <div className="p-3.5 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xs font-bold text-gray-800 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2 flex-1">
                      {item.program_kerja}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-emerald-100/50">
                        {item.kode_program_kerja}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.kode_program_kerja, item.program_kerja)
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Hapus"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 text-[10px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <IconHierarchy2 size={12} className="text-gray-400" />
                      {item.kode_dept}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconBriefcase size={12} className="text-gray-400" />
                      {item.nama_jabatan}
                    </span>
                  </div>

                  {item.target_pencapaian && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 line-clamp-1 pr-4">
                        Target: {item.target_pencapaian.replace(/<[^>]*>/g, '')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedProgram && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-opacity duration-300"
          onClick={() => setSelectedProgram(null)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start">
              <div className="space-y-1 pr-6">
                <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {selectedProgram.kode_program_kerja}
                </span>
                <h3 className="text-base font-bold text-gray-900 leading-snug">{selectedProgram.program_kerja}</h3>
              </div>
              <button 
                onClick={() => setSelectedProgram(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-slate-50/50">
              <div className="bg-white p-4 rounded-xl border border-gray-155 shadow-2xs space-y-3">
                <div className="flex justify-between gap-4 text-xs border-b border-gray-100 pb-2.5">
                  <div className="flex-1">
                    <span className="text-gray-400 block mb-0.5 font-medium uppercase tracking-wider text-[10px]">Departemen</span>
                    <span className="font-semibold text-gray-800">
                      {selectedProgram.kode_dept}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-400 block mb-0.5 font-medium uppercase tracking-wider text-[10px]">Unit</span>
                    <span className="font-semibold text-gray-800">
                      {selectedProgram.nama_unit}
                    </span>
                  </div>
                </div>
                <div className="text-xs pt-0.5">
                  <span className="text-gray-400 block mb-0.5 font-medium uppercase tracking-wider text-[10px]">Jabatan</span>
                  <span className="font-semibold text-gray-800 block">
                    {selectedProgram.nama_jabatan}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Target Pencapaian</h4>
                <div className="bg-white p-4 rounded-xl border border-gray-155 shadow-2xs">
                  <div 
                    className="text-sm text-gray-700 leading-relaxed parsed-html-content"
                    dangerouslySetInnerHTML={createMarkup(selectedProgram.target_pencapaian)}
                  />
                </div>
              </div>

              {selectedProgram.keterangan && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Keterangan Tambahan</h4>
                  <div className="bg-white p-4 rounded-xl border border-gray-155 shadow-2xs flex gap-2.5 items-start">
                    <IconInfoCircle className="text-gray-400 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {selectedProgram.keterangan}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedProgram(null)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto pointer-events-none px-4 z-40">
        <div className="flex justify-end w-full">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-12 h-12 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all pointer-events-auto"
          >
            <IconPlus size={24} />
          </button>
        </div>
      </div>

      {/* Add Program Kerja Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-opacity duration-300"
          onClick={() => setIsAddModalOpen(false)}
        >
          <form 
            onSubmit={handleAddSubmit}
            className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-snug">Tambah Program Kerja</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Mendaftarkan program kerja baru Anda</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50/50">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block uppercase tracking-wider">Program Kerja</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembuatan laporan bulanan..."
                  value={newProgramName}
                  onChange={(e) => setNewProgramName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-medium text-gray-700 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block uppercase tracking-wider">Target Pencapaian</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Terselesaikannya laporan tepat waktu..."
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-medium text-gray-700 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block uppercase tracking-wider">Keterangan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Informasi tambahan program kerja..."
                  value={newKeterangan}
                  onChange={(e) => setNewKeterangan(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-medium text-gray-700 shadow-2xs"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default ProgramKerja
