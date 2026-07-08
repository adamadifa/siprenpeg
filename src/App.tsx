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
              <Route path="/presensi" element={<Presensi />} />
               <Route path="/izin" element={<Izin />} />
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
