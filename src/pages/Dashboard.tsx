import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '../api/auth'
import { fetchSettings } from '../api/settings'
import {
  IconFingerprint,
  IconCalendarEvent,
  IconClock,
  IconCash,
  IconUserCheck,
  IconUsers,
  IconInfoCircle,
  IconExchange,
  IconBell,
  IconSettings,
  IconMapPin,
  IconNotes,
  IconPin,
  IconHeartHandshake,
  IconBriefcase
} from '@tabler/icons-react'

const Dashboard = () => {
  const [time, setTime] = useState(new Date())

  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })

  const user = userData?.data
  const userName = user?.karyawan?.nama || user?.name || localStorage.getItem('user_name') || 'Gabriel Eka Saputra'
  
  const localJabatan = localStorage.getItem('user_jabatan')
  const localUnit = localStorage.getItem('user_unit')
  const localDepartment = localJabatan && localUnit ? `${localJabatan} (${localUnit})` : 'Karyawan - Asatidz'
  
  const departmentName = user?.karyawan 
    ? `${user.karyawan.jabatan} (${user.karyawan.nama_unit})`
    : localDepartment
  const userPhoto = user?.karyawan?.foto || localStorage.getItem('user_photo') || null

  const [locationName, setLocationName] = useState('Mencari lokasi...')

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            if (data && data.address) {
              const address = data.address
              const parts = []
              
              // Get suburb or district
              const district = address.suburb || address.village || address.neighbourhood
              if (district) parts.push(district)
              
              // Get city or regency
              const city = address.city || address.town || address.city_district || address.regency
              if (city) parts.push(city)
              
              // Get state/province
              if (address.state) parts.push(address.state)
              
              setLocationName(parts.join(', ') || data.display_name)
            } else {
              setLocationName(`GPS Aktif (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`)
            }
          } catch (error) {
            setLocationName(`GPS Aktif (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`)
          }
        },
        (error) => {
          console.warn('Geolocation permission:', error.message)
          setLocationName('Akses lokasi ditolak')
        },
        { enableHighAccuracy: false, timeout: 15000 }
      )
    } else {
      setLocationName('GPS tidak didukung browser')
    }
  }, [])

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  const formatDate = (date: Date) =>
    date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const menuItems = [
    { icon: IconUserCheck, label: 'Ibadah', color: 'text-indigo-600', bg: 'bg-indigo-50', to: '/checklist-ibadah' },
    { icon: IconCash, label: 'Simpanan', color: 'text-emerald-600', bg: 'bg-emerald-50', to: '/simpanan' },
    { icon: IconHeartHandshake, label: 'Pinjaman', color: 'text-amber-600', bg: 'bg-amber-50', to: '/pinjaman' },
    { icon: IconBriefcase, label: 'Tabungan', color: 'text-blue-600', bg: 'bg-blue-50', to: '/tabungan' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Brand Background Block */}
      <div 
        className="bg-[#064e3b] px-5 pt-5 pb-20 relative overflow-hidden"
        style={settingsData?.data?.background_login ? {
          backgroundImage: `linear-gradient(to bottom, rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.92)), url(${settingsData.data.background_login})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        {/* Decorative Ornaments */}
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-emerald-500/[0.12] blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute left-[-20px] bottom-0 w-36 h-36 rounded-full bg-white/[0.03] blur-lg pointer-events-none" />
        <div className="absolute right-1/4 top-1/4 w-1.5 h-1.5 rounded-full bg-white/20 pointer-events-none" />
        <div className="absolute left-1/3 top-1/3 w-1 h-1 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute left-10 top-4 w-20 h-20 rounded-full border border-white/[0.02] pointer-events-none" />
        <div className="absolute right-12 bottom-12 w-28 h-28 rounded-full border border-white/[0.03] pointer-events-none" />

        {/* Top Row: Brand + Actions */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-wide">SIPRENPAS</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors relative">
              <IconBell size={20} className="text-white/90" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#064e3b]"></span>
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <IconSettings size={20} className="text-white/90" />
            </button>
          </div>
        </div>

        {/* Profile Row */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            {userPhoto ? (
              <img 
                src={userPhoto} 
                alt={userName} 
                className="w-11 h-11 rounded-full border border-white/20 object-cover shrink-0" 
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-white/20 border border-white/10 flex items-center justify-center text-white font-semibold text-base shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-[#a7f3d0]">{departmentName}</p>
            </div>
          </div>
          {settingsData?.data?.logo && (
            <img 
              src={settingsData.data.logo} 
              alt="School Logo" 
              className="w-16 h-16 object-contain shrink-0 opacity-95 pointer-events-none" 
            />
          )}
        </div>
      </div>

      {/* Clock Card — overlaps the green block */}
      <div className="px-5 -mt-14 relative z-10">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-3">{formatDate(time)} • {formatTime(time)}</p>
          <div className="flex items-center">
            {/* Clock In */}
            <div className="flex-1 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user?.karyawan?.presensi_today?.jam_in ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                <IconFingerprint size={20} className={user?.karyawan?.presensi_today?.jam_in ? 'text-emerald-600' : 'text-gray-400'} />
              </div>
              <div>
                <p className={`text-lg font-semibold leading-tight ${user?.karyawan?.presensi_today?.jam_in ? 'text-gray-900' : 'text-gray-400'}`}>
                  {user?.karyawan?.presensi_today?.jam_in || '--:--'}
                </p>
                <p className="text-xs text-gray-500">Clock In</p>
              </div>
            </div>

            <div className="w-px h-10 bg-gray-200 mx-3" />

            {/* Clock Out */}
            <div className="flex-1 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user?.karyawan?.presensi_today?.jam_out ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                <IconFingerprint size={20} className={user?.karyawan?.presensi_today?.jam_out ? 'text-emerald-600' : 'text-gray-400'} />
              </div>
              <div>
                <p className={`text-lg font-semibold leading-tight ${user?.karyawan?.presensi_today?.jam_out ? 'text-gray-900' : 'text-gray-400'}`}>
                  {user?.karyawan?.presensi_today?.jam_out || '--:--'}
                </p>
                <p className="text-xs text-gray-500">Clock Out</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
            <IconMapPin size={14} className="text-emerald-600 shrink-0" />
            <span className="text-xs text-gray-500 truncate" title={locationName}>
              {locationName}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">

        {/* Attendance Summary */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <IconUserCheck size={18} className="text-emerald-600" />
            <p className="text-sm font-semibold text-gray-900">Rekap Kehadiran Bulan Ini</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              {/* Hadir */}
              <div className="flex-1 text-center">
                <span className="text-xl font-bold text-[#064e3b] block">
                  {user?.karyawan?.rekap_presensi?.hadir ?? 0}
                </span>
                <span className="text-xs text-gray-500 font-medium mt-0.5 block">Hadir</span>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200" />

              {/* Sakit */}
              <div className="flex-1 text-center">
                <span className="text-xl font-bold text-rose-600 block">
                  {user?.karyawan?.rekap_presensi?.sakit ?? 0}
                </span>
                <span className="text-xs text-gray-500 font-medium mt-0.5 block">Sakit</span>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200" />

              {/* Izin */}
              <div className="flex-1 text-center">
                <span className="text-xl font-bold text-amber-600 block">
                  {user?.karyawan?.rekap_presensi?.izin ?? 0}
                </span>
                <span className="text-xs text-gray-500 font-medium mt-0.5 block">Izin</span>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200" />

              {/* Cuti */}
              <div className="flex-1 text-center">
                <span className="text-xl font-bold text-indigo-600 block">
                  {user?.karyawan?.rekap_presensi?.cuti ?? 0}
                </span>
                <span className="text-xs text-gray-500 font-medium mt-0.5 block">Cuti</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Menu */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-3">Menu</p>
          <div className="grid grid-cols-4 gap-3">
            {menuItems.map((item, i) => {
              const Icon = item.icon
              const inner = (
                <>
                  <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center mb-1.5`}>
                    <Icon size={20} className={item.color} />
                  </div>
                  <span className="text-[11px] text-gray-700 leading-tight text-center">{item.label}</span>
                </>
              )
              return item.to.startsWith('/') ? (
                <Link key={i} to={item.to} className="flex flex-col items-center active:scale-95 transition-transform">
                  {inner}
                </Link>
              ) : (
                <a key={i} href={item.to} className="flex flex-col items-center active:scale-95 transition-transform">
                  {inner}
                </a>
              )
            })}
          </div>
        </div>

        {/* Memos */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5">
              <IconNotes size={18} className="text-emerald-600" />
              <p className="text-sm font-semibold text-gray-900">Memo</p>
            </div>
            <a href="#" className="text-xs text-emerald-600 font-medium hover:underline">
              Lihat semua
            </a>
          </div>

          <div className="space-y-2">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5">
                  <IconPin size={14} className="text-red-500 rotate-45 shrink-0" />
                  <span className="text-sm font-medium text-gray-900">Peraturan Perusahaan 2026</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0 ml-2">17 Apr</span>
              </div>
              <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                Kepada seluruh Asatidz dan Karyawan, menyikapi hasil rapat direksi terkait jam operasional...
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5">
                  <IconPin size={14} className="text-gray-400 rotate-45 shrink-0" />
                  <span className="text-sm font-medium text-gray-900">Informasi Pemotongan PPH 21</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0 ml-2">27 Mei</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
