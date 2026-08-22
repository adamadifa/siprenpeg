import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import Dashboard from './pages/Dashboard'
import Presensi from './pages/Presensi'
import Izin from './pages/Izin'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Simpanan from './pages/Simpanan'
import SimpananDetail from './pages/SimpananDetail'
import Pinjaman from './pages/Pinjaman'
import PinjamanDetail from './pages/PinjamanDetail'
import Ibadah from './pages/Ibadah'
import Tabungan from './pages/Tabungan'
import TabunganDetail from './pages/TabunganDetail'
import PresensiHistory from './pages/PresensiHistory'
import Akademik from './pages/Akademik'
import InputPresensiMapel from './pages/InputPresensiMapel'
import PresensiMapelHistory from './pages/PresensiMapelHistory'
import Jadwal from './pages/Jadwal'
import Penilaian from './pages/Penilaian'
import ManageNilai from './pages/ManageNilai'
import WaliKelas from './pages/WaliKelas'
import WaliKelasDetail from './pages/WaliKelasDetail'
import WaliKelasSiswaDetail from './pages/WaliKelasSiswaDetail'
import Kegiatan from './pages/Kegiatan'
import InputKegiatan from './pages/InputKegiatan'
import Agenda from './pages/Agenda'
import InputAgenda from './pages/InputAgenda'
import AgendaPesantren from './pages/AgendaPesantren'
import ProgramKerja from './pages/ProgramKerja'
import Jobdesk from './pages/Jobdesk'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Route guard component to check for authentication token
const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/akademik" element={<Akademik />} />
              <Route path="/akademik/presensi-mapel" element={<PresensiMapelHistory />} />
              <Route path="/akademik/presensi-mapel/:jadwalId" element={<InputPresensiMapel />} />
              <Route path="/akademik/jadwal" element={<Jadwal />} />
              <Route path="/akademik/penilaian/:jadwalId" element={<Penilaian />} />
              <Route path="/akademik/penilaian/:jadwalId/manage/:kategori" element={<ManageNilai />} />
              <Route path="/akademik/wali-kelas" element={<WaliKelas />} />
              <Route path="/akademik/wali-kelas/detail/:jadwalId" element={<WaliKelasDetail />} />
              <Route path="/akademik/wali-kelas/siswa/:idSiswa" element={<WaliKelasSiswaDetail />} />
              <Route path="/presensi" element={<Presensi />} />
              <Route path="/presensi/history" element={<PresensiHistory />} />
               <Route path="/izin" element={<Izin />} />
              <Route path="/kegiatan" element={<Kegiatan />} />
              <Route path="/kegiatan/input" element={<InputKegiatan />} />
              <Route path="/program-kerja" element={<ProgramKerja />} />
              <Route path="/jobdesk" element={<Jobdesk />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/agenda/input" element={<InputAgenda />} />
              <Route path="/agenda-pesantren" element={<AgendaPesantren />} />
              <Route path="/checklist-ibadah" element={<Ibadah />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/simpanan" element={<Simpanan />} />
              <Route path="/simpanan/:kodeSimpanan" element={<SimpananDetail />} />
               <Route path="/pinjaman" element={<Pinjaman />} />
              <Route path="/pinjaman/:noAkad" element={<PinjamanDetail />} />
              <Route path="/tabungan" element={<Tabungan />} />
              <Route path="/tabungan/:noRekening" element={<TabunganDetail />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
