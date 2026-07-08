import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  IconHome,
  IconFileText,
  IconFingerprint,
  IconCalendar,
  IconSettings
} from '@tabler/icons-react'

export const Layout: React.FC = () => {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full max-w-md mx-auto shadow-xl relative border-x border-slate-200">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="flex justify-around items-end pb-3 pt-2 relative">
          {/* Home */}
          <Link
            to="/dashboard"
            className={`flex flex-col items-center gap-1 transition-all duration-200 ${
              location.pathname === '/dashboard' ? 'text-[#064e3b] font-semibold' : 'text-slate-500 hover:text-emerald-700'
            }`}
          >
            <IconHome size={22} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          {/* Histori */}
          <Link
            to="/presensi"
            className={`flex flex-col items-center gap-1 transition-all duration-200 ${
              location.pathname === '/presensi' ? 'text-[#064e3b] font-semibold' : 'text-slate-500 hover:text-emerald-700'
            }`}
          >
            <IconFileText size={22} />
            <span className="text-[10px] font-medium">Histori</span>
          </Link>

          {/* Spacer for center button */}
          <div className="w-14 h-1" />

          {/* Absen (Floating Center Button) */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-7">
            <Link
              to="/presensi"
              className="w-14 h-14 bg-[#064e3b] hover:bg-[#043427] active:scale-95 text-white rounded-full flex items-center justify-center shadow-md border-4 border-white transition-all duration-200"
            >
              <IconFingerprint size={28} />
            </Link>
          </div>

          {/* Izin */}
          <Link
            to="/izin"
            className={`flex flex-col items-center gap-1 transition-all duration-200 ${
              location.pathname === '/izin' ? 'text-[#064e3b] font-semibold' : 'text-slate-500 hover:text-emerald-700'
            }`}
          >
            <IconCalendar size={22} />
            <span className="text-[10px] font-medium">Izin</span>
          </Link>

          {/* Setting */}
          <Link
            to="/profile"
            className={`flex flex-col items-center gap-1 transition-all duration-200 ${
              location.pathname === '/profile' ? 'text-[#064e3b] font-semibold' : 'text-slate-500 hover:text-emerald-700'
            }`}
          >
            <IconSettings size={22} />
            <span className="text-[10px] font-medium">Setting</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
