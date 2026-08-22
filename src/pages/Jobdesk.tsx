import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  IconArrowLeft,
  IconSearch,
  IconBriefcase,
  IconHierarchy2,
  IconInfoCircle,
  IconClipboardText,
  IconBuilding
} from '@tabler/icons-react'
import { getJobdeskList } from '../api/jobdesk'
import { fetchSettings } from '../api/settings'

const Jobdesk: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedJobdesk, setSelectedJobdesk] = useState<any | null>(null)

  // Queries
  const { data: jobdeskResponse, isLoading } = useQuery({
    queryKey: ['jobdeskList', search],
    queryFn: () => getJobdeskList(search)
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })

  const list = jobdeskResponse?.data || []

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
        <h1 className="text-lg font-bold">Jobdesk Saya</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-xs">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari jobdesk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-gray-150 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-gray-700"
            />
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
              <IconClipboardText size={48} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600">Tidak Ada Jobdesk</p>
              <p className="text-xs text-gray-400 mt-1">Belum ada data jobdesk yang terdaftar untuk Anda.</p>
            </div>
          ) : (
            list.map((item) => (
              <div 
                key={item.kode_jobdesk} 
                onClick={() => setSelectedJobdesk(item)}
                className="bg-white rounded-xl border border-gray-150 hover:border-emerald-200 hover:shadow-sm active:scale-[0.995] transition-all overflow-hidden flex cursor-pointer group animate-fade-in"
              >
                <div className="p-3.5 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xs font-bold text-gray-800 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2 flex-1">
                      {item.jobdesk}
                    </h3>
                    <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 border border-emerald-100/50">
                      {item.kode_jobdesk}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 text-[10px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <IconHierarchy2 size={12} className="text-gray-400" />
                      {item.nama_dept}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconBriefcase size={12} className="text-gray-400" />
                      {item.nama_jabatan}
                    </span>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedJobdesk && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-opacity duration-300"
          onClick={() => setSelectedJobdesk(null)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start">
              <div className="space-y-1 pr-6">
                <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {selectedJobdesk.kode_jobdesk}
                </span>
                <h3 className="text-base font-bold text-gray-900 leading-snug">{selectedJobdesk.jobdesk}</h3>
              </div>
              <button 
                onClick={() => setSelectedJobdesk(null)}
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
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block mb-0.5 font-medium uppercase tracking-wider text-[9px]">Departemen</span>
                    <span className="font-semibold text-gray-800 break-words">
                      {selectedJobdesk.nama_dept}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5 font-medium uppercase tracking-wider text-[9px]">Unit</span>
                    <span className="font-semibold text-gray-800 break-words">
                      {selectedJobdesk.nama_unit || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5 font-medium uppercase tracking-wider text-[9px]">Jabatan</span>
                    <span className="font-semibold text-gray-800 block break-words">
                      {selectedJobdesk.nama_jabatan}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedJobdesk(null)}
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

export default Jobdesk
