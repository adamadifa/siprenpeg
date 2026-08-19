import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  IconArrowLeft,
  IconCalendar,
  IconMapPin,
  IconInfoCircle,
  IconChevronLeft,
  IconChevronRight,
  IconClipboardText
} from '@tabler/icons-react'
import { getAgendaPesantrenList } from '../api/agendaPesantren'
import { fetchSettings } from '../api/settings'

const AgendaPesantren: React.FC = () => {
  const navigate = useNavigate()

  // State for selected month & year
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()) // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0])

  // Queries
  const { data: agendaList, isLoading } = useQuery({
    queryKey: ['agendaPesantrenList'],
    queryFn: getAgendaPesantrenList
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })

  const list = agendaList || []

  // Month names
  const monthsIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  // Years for filter dropdown (5 years past and 5 years future)
  const years = useMemo(() => {
    const startYear = today.getFullYear() - 5
    return Array.from({ length: 11 }, (_, i) => startYear + i)
  }, [])

  // Helper to change month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(prev => prev - 1)
    } else {
      setCurrentMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(prev => prev + 1)
    } else {
      setCurrentMonth(prev => prev + 1)
    }
  }

  // Days list for the grid
  const daysGrid = useMemo(() => {
    const date = new Date(currentYear, currentMonth, 1)
    const days = []
    
    // Adjust Sunday (0) to index 6, Monday (1) to index 0
    let firstDayIndex = date.getDay() - 1
    if (firstDayIndex === -1) firstDayIndex = 6
    
    // Padding days from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null)
    }
    
    // Days in current month
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate()
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(currentYear, currentMonth, i))
    }
    
    return days
  }, [currentYear, currentMonth])

  // Helper to format date key for checking events (YYYY-MM-DD)
  const formatDateKey = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Check if a date has any events
  const getEventsForDate = (date: Date) => {
    const dateKey = formatDateKey(date)
    return list.filter(item => {
      const start = item.start.split('T')[0]
      // exclusive end date parsing for all day events
      const end = item.end ? item.end.split('T')[0] : start
      
      let actualEnd = end
      if (item.allDay && item.end) {
        const endDate = new Date(end)
        endDate.setDate(endDate.getDate() - 1)
        actualEnd = endDate.toISOString().split('T')[0]
      }

      return dateKey >= start && dateKey <= actualEnd
    })
  }

  // Helper to format date range
  const formatEventDate = (startStr: string, endStr: string, allDay: boolean) => {
    const start = new Date(startStr)
    const formattedStart = start.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    if (!endStr) {
      return formattedStart
    }

    const end = new Date(endStr)
    if (allDay) {
      end.setDate(end.getDate() - 1)
    }

    if (start.toDateString() === end.toDateString()) {
      return formattedStart
    }

    const formattedEnd = end.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    return `${formattedStart} - ${formattedEnd}`
  }

  // Helper to format time range
  const formatEventTime = (startStr: string, endStr: string, allDay: boolean) => {
    if (allDay) {
      return 'Seharian Penuh'
    }

    const start = new Date(startStr)
    const formattedStart = start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    if (!endStr) {
      return formattedStart
    }

    const end = new Date(endStr)
    const formattedEnd = end.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    return `${formattedStart} - ${formattedEnd}`
  }

  // Get events of the currently selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return []
    const selDate = new Date(selectedDate)
    return getEventsForDate(selDate)
  }, [selectedDate, list])

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div 
        className="bg-[#064e3b] px-4 py-4 text-white flex items-center justify-between sticky top-0 z-35"
        style={settingsData?.data?.background_login ? {
          backgroundImage: `linear-gradient(to right, rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.92)), url(${settingsData.data.background_login})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-1 rounded-full hover:bg-white/10 transition-colors">
            <IconArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold">Agenda Pesantren</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Month Selector dropdown & buttons */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={handlePrevMonth} className="p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors">
              <IconChevronLeft size={18} />
            </button>
            
            <div className="flex items-center gap-2">
              <select 
                value={currentMonth} 
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="bg-transparent text-sm font-bold text-gray-800 focus:outline-none cursor-pointer"
              >
                {monthsIndo.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
              <select 
                value={currentYear} 
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="bg-transparent text-sm font-bold text-gray-800 focus:outline-none cursor-pointer"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button onClick={handleNextMonth} className="p-2 rounded-lg bg-gray-50 border border-gray-250/70 hover:bg-gray-100 text-gray-600 transition-colors">
              <IconChevronRight size={18} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'].map((day, idx) => (
                <span key={idx} className="text-[10px] font-bold text-gray-400 uppercase">{day}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {daysGrid.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="aspect-square" />
                }

                const dateKey = formatDateKey(date)
                const isSelected = selectedDate === dateKey
                const events = getEventsForDate(date)
                const hasEvents = events.length > 0
                const isToday = formatDateKey(today) === dateKey

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all active:scale-95 ${
                      isSelected 
                        ? 'bg-[#064e3b] text-white shadow-md' 
                        : isToday 
                          ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-300' 
                          : 'hover:bg-gray-100 text-gray-800 font-medium'
                    }`}
                  >
                    <span className="text-xs">{date.getDate()}</span>
                    {hasEvents && (
                      <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${isSelected ? 'bg-orange-400' : 'bg-orange-500'}`} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Selected Date Header */}
        <div className="flex items-center gap-2 px-1">
          <IconCalendar size={18} className="text-emerald-700" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Agenda Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* List Content of selected date */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span className="text-xs text-gray-500">Memuat data...</span>
            </div>
          ) : selectedDateEvents.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-250/70 p-8 text-center shadow-xs">
              <IconClipboardText size={48} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600">Tidak Ada Agenda</p>
              <p className="text-xs text-gray-400 mt-1">Belum ada agenda pesantren yang dijadwalkan pada hari ini.</p>
            </div>
          ) : (
            selectedDateEvents.map((item) => {
              return (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                  {/* Accent line on left */}
                  <div className="border-l-4 border-orange-500 flex-1 flex flex-col p-4">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600">
                      <p className="flex items-center gap-2">
                        <IconCalendar size={14} className="text-emerald-600 shrink-0" />
                        <span className="font-semibold text-gray-700">Tanggal:</span>
                        <span>{formatEventDate(item.start, item.end, item.allDay)}</span>
                      </p>
                      {!item.allDay && (
                        <p className="flex items-center gap-2">
                          <IconInfoCircle size={14} className="text-emerald-600 shrink-0" />
                          <span className="font-semibold text-gray-700">Waktu:</span>
                          <span>{formatEventTime(item.start, item.end, item.allDay)}</span>
                        </p>
                      )}
                      {item.location && (
                        <p className="flex items-center gap-2">
                          <IconMapPin size={14} className="text-amber-600 shrink-0" />
                          <span className="font-semibold text-gray-700">Tempat:</span>
                          <span>{item.location}</span>
                        </p>
                      )}
                      {item.description && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="font-semibold text-gray-700 mb-1">Keterangan:</p>
                          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{item.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default AgendaPesantren
