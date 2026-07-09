import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  IconUser,
  IconLock,
  IconLogout,
  IconArrowLeft,
  IconCheck,
  IconEdit,
  IconKey
} from '@tabler/icons-react'
import { getCurrentUser, updateProfile, changePassword } from '../api/auth'
import { fetchSettings } from '../api/settings'

const Profile: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Tab state: 'profile' | 'password'
  const [activeTab, setActiveTab] = React.useState<'profile' | 'password'>('profile')

  // Edit Profile Form States
  const [name, setName] = React.useState('')
  const [username, setUsername] = React.useState('')
  const [email, setEmail] = React.useState('')

  // Edit Password Form States
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = React.useState('')

  // Queries
  const { data: userResponse, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })

  // Set form defaults once user data loads
  React.useEffect(() => {
    if (userResponse?.data) {
      setName(userResponse.data.name || '')
      setUsername(userResponse.data.username || '')
      setEmail(userResponse.data.email || '')
    }
  }, [userResponse])

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res) => {
      Swal.fire({
        title: 'Berhasil!',
        text: res.message || 'Profil berhasil diperbarui.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Gagal memperbarui profil.'
      Swal.fire({
        title: 'Gagal!',
        text: errMsg,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      })
    }
  })

  // Password Update Mutation
  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (res) => {
      Swal.fire({
        title: 'Berhasil!',
        text: res.message || 'Password berhasil diubah.',
        icon: 'success',
        confirmButtonColor: '#064e3b'
      })
      setCurrentPassword('')
      setNewPassword('')
      setNewPasswordConfirm('')
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Gagal mengubah password.'
      Swal.fire({
        title: 'Gagal!',
        text: errMsg,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      })
    }
  })

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !username.trim() || !email.trim()) {
      Swal.fire({
        title: 'Peringatan!',
        text: 'Nama lengkap, Username, dan Email wajib diisi.',
        icon: 'warning',
        confirmButtonColor: '#064e3b'
      })
      return
    }

    updateProfileMutation.mutate({
      name,
      username,
      email
    })
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      Swal.fire({
        title: 'Peringatan!',
        text: 'Semua kolom password wajib diisi.',
        icon: 'warning',
        confirmButtonColor: '#064e3b'
      })
      return
    }

    if (newPassword !== newPasswordConfirm) {
      Swal.fire({
        title: 'Peringatan!',
        text: 'Konfirmasi password baru tidak cocok.',
        icon: 'warning',
        confirmButtonColor: '#064e3b'
      })
      return
    }

    changePasswordMutation.mutate({
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirm
    })
  }

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar Aplikasi?',
      text: 'Anda perlu masuk kembali untuk mengakses data Anda.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#064e3b',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token')
        localStorage.removeItem('user_name')
        navigate('/', { replace: true })
      }
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 mt-3 text-xs font-medium">Memuat data profil...</p>
      </div>
    )
  }

  const user = userResponse?.data
  const karyawan = user?.karyawan
  const nameInitial = (user?.name || 'U').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Top Banner */}
      <div 
        className="bg-[#064e3b] px-5 pt-5 pb-24 relative overflow-hidden"
        style={settingsData?.data?.background_login ? {
          backgroundImage: `linear-gradient(to bottom, rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.92)), url(${settingsData.data.background_login})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-emerald-500/[0.12] blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute left-[-20px] bottom-0 w-36 h-36 rounded-full bg-white/[0.03] blur-lg pointer-events-none" />

        <img 
          src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/assets/template/img/tsarwah.png`} 
          alt="Tsarwah Logo" 
          className="absolute right-5 top-5 w-11 h-auto object-contain opacity-90 pointer-events-none z-10" 
        />

        <div className="relative z-10 flex items-start gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-full hover:bg-white/10 transition-colors mt-0.5">
            <IconArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">Pengaturan Akun</h1>
            <p className="text-[10px] text-[#a7f3d0] mt-1 leading-normal font-medium max-w-[240px]">
              Kelola informasi profil, username, dan keamanan kata sandi Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="px-5 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl border border-gray-150/80 p-5 shadow-lg flex flex-col items-center text-center">
          {karyawan?.foto ? (
            <img 
              src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/uploads/karyawan/${karyawan.foto}`} 
              alt={user?.name} 
              className="w-18 h-18 rounded-full object-cover border-3 border-emerald-50 shadow-md mb-3"
            />
          ) : (
            <div className="w-18 h-18 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full flex items-center justify-center font-black text-2xl shadow-inner mb-3">
              {nameInitial}
            </div>
          )}

          <h2 className="text-sm font-black text-gray-800 leading-tight">{user?.name}</h2>
          <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mt-1">
            NPP. {user?.npp || '1234567890'}
          </p>

          <div className="flex justify-center gap-2 mt-2">
            <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-gray-50 border border-gray-150 text-gray-500 uppercase">
              {karyawan?.jabatan || 'Ustadz'}
            </span>
            <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-[#064e3b] uppercase">
              {karyawan?.nama_unit || 'Unit Kerja'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="px-5 mt-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#064e3b] text-[#064e3b]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <IconUser size={15} /> Edit Profil
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'password'
                ? 'border-[#064e3b] text-[#064e3b]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <IconLock size={15} /> Ubah Password
          </button>
        </div>
      </div>

      {/* Forms Area */}
      <div className="px-5 mt-5">
        <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-xs">
          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <IconUser size={15} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Lengkap Anda"
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-gray-700 focus:outline-none focus:border-[#064e3b] font-medium"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <IconEdit size={15} />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username Akun"
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-gray-700 focus:outline-none focus:border-[#064e3b] font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Alamat Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <span className="text-[13px] font-extrabold font-mono">@</span>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Alamat Email Anda"
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-gray-700 focus:outline-none focus:border-[#064e3b] font-medium"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full mt-2 py-2.5 bg-[#064e3b] hover:bg-[#053d2e] disabled:bg-gray-400 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <IconCheck size={14} /> Simpan Perubahan Profil
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Password Lama */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Password Saat Ini</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <IconKey size={15} />
                  </span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-gray-700 focus:outline-none focus:border-[#064e3b] font-medium"
                  />
                </div>
              </div>

              {/* Password Baru */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Password Baru</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <IconLock size={15} />
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-gray-700 focus:outline-none focus:border-[#064e3b] font-medium"
                  />
                </div>
              </div>

              {/* Konfirmasi Password Baru */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Konfirmasi Password Baru</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <IconLock size={15} />
                  </span>
                  <input
                    type="password"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    placeholder="Masukkan ulang password baru"
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-gray-700 focus:outline-none focus:border-[#064e3b] font-medium"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="w-full mt-2 py-2.5 bg-[#064e3b] hover:bg-[#053d2e] disabled:bg-gray-400 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <IconCheck size={14} /> Ganti Kata Sandi
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Logout Action Button */}
      <div className="px-5 mt-5">
        <button
          onClick={handleLogout}
          className="w-full py-2.5 border-2 border-red-100 hover:bg-red-50 text-red-600 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <IconLogout size={15} /> Keluar Aplikasi
        </button>
      </div>
    </div>
  )
}

export default Profile
