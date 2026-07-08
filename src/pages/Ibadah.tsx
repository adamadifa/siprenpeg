import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  IconArrowLeft,
  IconInfoCircle,
  IconCalendar,
  IconCheck,
  IconTrendingUp,
  IconWifi
} from '@tabler/icons-react'
import { getIbadahList, toggleIbadahItem } from '../api/ibadah'
import { fetchSettings } from '../api/settings'

const Ibadah: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // State for selected date, defaults to today (YYYY-MM-DD format)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    const offset = today.getTimezoneOffset()
    const localToday = new Date(today.getTime() - (offset * 60 * 1000))
    return localToday.toISOString().split('T')[0]
  })

  // Refetch settings for general background
  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })

  // Fetch ibadah list for selected date
  const { data: ibadahResponse, isLoading, error } = useQuery({
    queryKey: ['ibadahList', selectedDate],
    queryFn: () => getIbadahList(selectedDate)
  })

  // Mutation to toggle ibadah item
  const toggleMutation = useMutation({
    mutationFn: toggleIbadahItem,
    onMutate: async (newToggle) => {
      // Cancel queries to avoid overwrites
      await queryClient.cancelQueries({ queryKey: ['ibadahList', selectedDate] })

      // Snapshot previous state
      const previousData = queryClient.getQueryData<any>(['ibadahList', selectedDate])

      // Optimistically update the UI cache
      if (previousData?.success) {
        const updatedIbadah = { ...previousData.data.ibadah }
        for (const cat in updatedIbadah) {
          updatedIbadah[cat] = updatedIbadah[cat].map((item: any) => {
            if (item.id === newToggle.id) {
              return { ...item, checked: newToggle.checked }
            }
            return item
          })
        }
        queryClient.setQueryData(['ibadahList', selectedDate], {
          ...previousData,
          data: {
            ...previousData.data,
            ibadah: updatedIbadah
          }
        })
      }

      return { previousData }
    },
    onError: (err, newToggle, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(['ibadahList', selectedDate], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ibadahList', selectedDate] })
    }
  })

  // Calculate the dates for the horizontal weekly strip
  const weekDays = useMemo(() => {
    const current = new Date(selectedDate)
    const startOfWeek = new Date(current)
    // Set to Monday of the selected date's week
    const day = current.getDay()
    const diff = current.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    const days = []
    const names = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      days.push({
        name: names[i],
        dayNum: date.getDate(),
        dateStr
      })
    }
    return days
  }, [selectedDate])

  // Calculate progress stats
  const stats = useMemo(() => {
    if (!ibadahResponse?.success) return { total: 0, checked: 0, percent: 0 }
    let total = 0
    let checked = 0
    const categories = ibadahResponse.data.ibadah
    for (const cat in categories) {
      categories[cat].forEach(item => {
        total++
        if (item.checked) checked++
      })
    }
    const percent = total > 0 ? Math.round((checked / total) * 100) : 0
    return { total, checked, percent }
  }, [ibadahResponse])

  const handleToggle = (id: number, currentChecked: boolean) => {
    toggleMutation.mutate({
      id,
      tanggal: selectedDate,
      checked: !currentChecked
    })
  }

  const getDayNameLong = (dateStr: string) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    return days[new Date(dateStr).getDay()]
  }

  const formatIndoDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Top Header */}
      <div 
        className="bg-[#064e3b] px-5 pt-5 pb-32 relative overflow-hidden"
        style={settingsData?.data?.background_login ? {
          backgroundImage: `linear-gradient(to bottom, rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.92)), url(${settingsData.data.background_login})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        {/* Decorative Ornaments */}
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-emerald-500/[0.12] blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute left-[-20px] bottom-0 w-36 h-36 rounded-full bg-white/[0.03] blur-lg pointer-events-none" />
        
        {/* Tsarwah Logo */}
        <img 
          src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/assets/template/img/tsarwah.png`} 
          alt="Tsarwah Logo" 
          className="absolute right-5 top-5 w-11 h-auto object-contain opacity-90 pointer-events-none z-10" 
        />

        <div className="relative z-10 flex items-start gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-full hover:bg-white/10 transition-colors mt-0.5">
            <IconArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">Checklist Ibadah</h1>
            <p className="text-[10px] text-[#a7f3d0] mt-1 leading-normal font-medium max-w-[240px]">
              Pantau mutaba'ah harian, isi amal ibadah Anda secara teratur setiap hari.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content (overlaps green header) */}
      <div className="px-5 -mt-24 relative z-10 flex flex-col gap-5">
        
        {/* Calendar Strip Card */}
        <div className="bg-white rounded-2xl border border-gray-200/60 p-4 shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {getDayNameLong(selectedDate)}
              </p>
              <h2 className="text-sm font-extrabold text-gray-800 mt-0.5">
                {formatIndoDate(selectedDate)}
              </h2>
            </div>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="p-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-500">
                <IconCalendar size={18} />
              </button>
            </div>
          </div>

          {/* Horizontal Calendar strip */}
          <div className="flex justify-between gap-1 mt-1 border-t border-gray-50 pt-3">
            {weekDays.map((day) => {
              const isSelected = day.dateStr === selectedDate
              const isToday = day.dateStr === new Date().toISOString().split('T')[0]
              
              return (
                <button
                  key={day.dateStr}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-[#064e3b] text-white shadow-md shadow-emerald-900/10 scale-105' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-[8px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    {day.name}
                  </span>
                  <span className="text-xs font-extrabold mt-1.5 tabular-nums">
                    {day.dayNum}
                  </span>
                  {isToday && !isSelected && (
                    <div className="w-1 h-1 rounded-full bg-emerald-600 mt-1" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Daily Progress Card */}
        {stats.total > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200/60 p-4 shadow-sm flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Progress Hari Ini</p>
              <h3 className="text-sm font-extrabold text-gray-800 mt-0.5">
                {stats.checked} dari {stats.total} Ibadah
              </h3>
              <p className="text-[10px] text-gray-400 leading-normal mt-1">
                Ayo lengkapi seluruh amalan ibadah wajib dan sunnah hari ini!
              </p>
            </div>
            
            {/* Visual circle percentage */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" className="text-gray-100" strokeWidth="6" stroke="currentColor" fill="transparent" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  className="text-emerald-600 transition-all duration-500" 
                  strokeWidth="6" 
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - stats.percent / 100)}
                  strokeLinecap="round"
                  stroke="currentColor" 
                  fill="transparent" 
                />
              </svg>
              <span className="absolute text-[10px] font-extrabold text-emerald-800 tabular-nums">
                {stats.percent}%
              </span>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200/60 shadow-sm">
            <div className="w-8 h-8 border-3 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 mt-3 text-xs">Memuat daftar kegiatan ibadah...</p>
          </div>
        )}

        {/* Grouped Activities list */}
        {ibadahResponse?.success && (
          <div className="flex flex-col gap-4">
            {Object.keys(ibadahResponse.data.ibadah).map((categoryName) => {
              const items = ibadahResponse.data.ibadah[categoryName]
              return (
                <div key={categoryName} className="bg-white rounded-2xl border border-gray-200/60 p-4 shadow-sm flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-1.5">
                    <IconTrendingUp size={16} className="text-[#064e3b] shrink-0" />
                    {categoryName}
                  </h3>
                  
                  <div className="divide-y divide-gray-50">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2.5 px-1 first:pt-1 last:pb-1">
                        <div className="flex flex-col pr-4">
                          <span className="text-xs font-bold text-gray-800 leading-normal">{item.nama_kegiatan}</span>
                        </div>
                        
                        {/* Custom switch slider */}
                        <button
                          onClick={() => handleToggle(item.id, item.checked)}
                          disabled={toggleMutation.isPending}
                          className={`w-11 h-6 rounded-full transition-all relative flex items-center px-0.5 focus:outline-none ${
                            item.checked ? 'bg-[#064e3b]' : 'bg-gray-200'
                          }`}
                        >
                          <div 
                            className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all flex items-center justify-center ${
                              item.checked ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          >
                            {item.checked && (
                              <IconCheck size={12} strokeWidth={3} className="text-[#064e3b]" />
                            )}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {Object.keys(ibadahResponse.data.ibadah).length === 0 && (
              <div className="py-12 text-center text-gray-400 text-xs bg-white rounded-2xl border border-gray-200/60 shadow-sm">
                Belum ada daftar kegiatan ibadah terdaftar.
              </div>
            )}
          </div>
        )}

        {/* Error Handling */}
        {error && (
          <div className="py-8 text-center px-4 bg-white rounded-2xl border border-gray-200/60 shadow-sm flex flex-col items-center">
            <IconInfoCircle size={28} className="text-rose-500 mb-2" />
            <p className="text-xs font-bold text-gray-800">Gagal mengambil checklist ibadah</p>
            <p className="text-[10px] text-gray-400 mt-1">Harap periksa koneksi internet atau segarkan halaman.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Ibadah
