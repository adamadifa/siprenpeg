import React from 'react'

const Izin: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="card bg-white shadow-sm border border-slate-100 p-4 rounded-2xl">
        <h2 className="text-xl font-bold text-slate-800">Formulir Pengajuan Izin</h2>
        <p className="text-sm text-slate-500 mt-1">Silakan ajukan izin cuti, sakit, atau dinas luar.</p>
        <button className="btn btn-warning mt-4 w-100 rounded-xl bg-amber-600 border-amber-600 text-white">
          Ajukan Izin Baru
        </button>
      </div>
    </div>
  )
}

export default Izin
