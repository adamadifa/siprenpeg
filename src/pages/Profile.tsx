import React from 'react'
import { useNavigate } from 'react-router-dom'

const Profile: React.FC = () => {
  const navigate = useNavigate()
  const userName = localStorage.getItem('user_name') || 'Ustadz Karyawan'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_name')
    navigate('/login', { replace: true })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="card bg-white shadow-sm border border-slate-100 p-4 rounded-2xl text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-emerald-800 font-bold text-2xl mb-2">
          {userName.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-bold text-slate-800">{userName}</h2>
        <p className="text-sm text-slate-400">NPP. 1234567890</p>
      </div>

      <button 
        onClick={handleLogout}
        className="btn btn-outline btn-error w-full rounded-xl mt-4"
      >
        Keluar Aplikasi
      </button>
    </div>
  )
}

export default Profile
