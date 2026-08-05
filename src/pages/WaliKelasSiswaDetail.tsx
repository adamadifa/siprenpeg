import React from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  IconArrowLeft,
  IconLoader2,
  IconAlertCircle,
  IconUser,
  IconPhone,
  IconGenderMale,
  IconGenderFemale,
  IconHeartHandshake,
  IconBriefcase,
  IconFileText,
  IconHome,
  IconUsersGroup
} from '@tabler/icons-react'
import { apiClient } from '../api/client'

interface Student {
  id_siswa: number
  nis: string
  nama_lengkap: string
  jenis_kelamin: string
  foto: string | null
  nisn: string
  tempat_lahir: string
  tanggal_lahir: string
  alamat: string
  kode_pos: string
  no_kk: string
  anak_ke: number | string
  jumlah_saudara: number | string
  nik_ayah: string
  nama_ayah: string
  pendidikan_ayah: string
  pekerjaan_ayah: string
  nik_ibu: string
  nama_ibu: string
  pendidikan_ibu: string
  pekerjaan_ibu: string
  no_hp_orang_tua: string
}

interface WaliKelasResponse {
  students: Student[]
}

const WaliKelasSiswaDetail: React.FC = () => {
  const navigate = useNavigate()
  const { idSiswa } = useParams<{ idSiswa: string }>()
  const location = useLocation()

  // Try to get student data from navigation state first
  const stateStudent = location.state?.student as Student | undefined

  // Otherwise fallback to fetching the Wali Kelas class list to find this student
  const { data: responseData, isLoading } = useQuery({
    queryKey: ['waliKelasData', ''],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: WaliKelasResponse }>('/api/guru/wali-kelas')
      return data
    },
    enabled: !stateStudent
  })

  const student = stateStudent || responseData?.data.students.find(s => String(s.id_siswa) === idSiswa)

  if (isLoading && !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <IconLoader2 size={32} className="animate-spin text-[#064e3b]" />
        <span className="mt-2.5 text-xs font-medium text-gray-500">Memuat profil siswa...</span>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <IconAlertCircle size={32} className="text-red-500 mb-2" />
        <span className="text-xs font-semibold text-gray-500 block">Siswa tidak ditemukan.</span>
        <button onClick={() => navigate('/akademik/wali-kelas')} className="mt-4 text-xs font-bold text-white bg-[#064e3b] px-4 py-2 rounded-xl">
          Kembali
        </button>
      </div>
    )
  }

  const initials = student.nama_lengkap
    .split(' ')
    .map(w => w.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 pb-16 font-sans antialiased text-gray-800">
      {/* Header */}
      <header className="sticky top-0 bg-[#064e3b] text-white px-4 py-4 flex items-center gap-3 shadow-sm z-40 shrink-0">
        <button 
          onClick={() => navigate('/akademik/wali-kelas')}
          className="p-1 hover:bg-[#053e30] rounded-lg transition-colors active:scale-95"
        >
          <IconArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-[13px] font-bold tracking-wide leading-tight">Profil Lengkap Siswa</h1>
          <span className="text-[10px] text-emerald-200/90 font-medium block">
            Detail Siswa Binaan
          </span>
        </div>
      </header>

      {/* Main Cover Section */}
      <div className="bg-gradient-to-br from-[#064e3b] to-[#0b664f] text-white px-6 pt-6 pb-20 relative overflow-hidden rounded-b-[2rem] shadow-lg text-center">
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/[0.03] blur-xl pointer-events-none" />
        
        {/* Photo Container */}
        <div className="w-20 h-20 rounded-2xl mx-auto bg-white/10 border-2 border-white/30 overflow-hidden shadow-md flex items-center justify-center relative z-10">
          {student.foto ? (
            <img 
              src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/photos/pendaftaran/${student.foto}`} 
              className="w-full h-full object-cover" 
              alt={student.nama_lengkap} 
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const fallback = e.currentTarget.nextSibling as HTMLDivElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-full h-full bg-gradient-to-br from-emerald-100 to-[#064e3b] text-white font-extrabold text-xl flex items-center justify-center"
            style={{ display: student.foto ? 'none' : 'flex' }}
          >
            {initials}
          </div>
        </div>

        <h2 className="font-extrabold text-base mt-4 leading-tight truncate px-4 relative z-10">
          {student.nama_lengkap}
        </h2>
        <p className="text-[10.5px] text-emerald-200/90 font-semibold mt-1.5 relative z-10 flex items-center justify-center gap-2">
          <span>NIS: {student.nis}</span>
          <span>•</span>
          <span>NISN: {student.nisn}</span>
        </p>
      </div>

      {/* Details Container */}
      <div className="px-4 -mt-10 relative z-20 max-w-md mx-auto flex flex-col gap-4">
        
        {/* Section: Detail Pribadi */}
        <div className="bg-white rounded-2xl p-4.5 shadow-sm border border-gray-100 flex flex-col gap-3.5">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
            <IconUser size={16} className="text-[#064e3b]" />
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Detail Pribadi</h3>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between items-start gap-4">
              <span className="text-gray-400 font-semibold shrink-0 w-28">Gender</span>
              <span className="text-gray-800 font-bold text-right">
                {student.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              </span>
            </div>
            
            <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-2.5">
              <span className="text-gray-400 font-semibold shrink-0 w-28">Tempat, Tgl Lahir</span>
              <span className="text-gray-800 font-bold text-right leading-tight">
                {student.tempat_lahir}, {student.tanggal_lahir !== '-' ? new Date(student.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </span>
            </div>

            <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-2.5">
              <span className="text-gray-400 font-semibold shrink-0 w-28">No. Kartu Keluarga</span>
              <span className="text-gray-800 font-bold text-right">
                {student.no_kk}
              </span>
            </div>

            <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-2.5">
              <span className="text-gray-400 font-semibold shrink-0 w-28">Hubungan Keluarga</span>
              <span className="text-gray-800 font-bold text-right">
                Anak ke-{student.anak_ke} dari {student.jumlah_saudara} bersaudara
              </span>
            </div>

            <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-2.5">
              <span className="text-gray-400 font-semibold shrink-0 w-28">Alamat Tinggal</span>
              <span className="text-gray-800 font-bold text-right leading-relaxed">
                {student.alamat} {student.kode_pos !== '-' && `(Kodepos: ${student.kode_pos})`}
              </span>
            </div>
          </div>
        </div>

        {/* Section: Data Ayah */}
        <div className="bg-white rounded-2xl p-4.5 shadow-sm border border-gray-100 flex flex-col gap-3.5">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
            <IconBriefcase size={16} className="text-[#064e3b]" />
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Data Ayah</h3>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between items-start gap-4">
              <span className="text-gray-400 font-semibold shrink-0 w-28">NIK Ayah</span>
              <span className="text-gray-800 font-bold text-right">{student.nik_ayah}</span>
            </div>
            
            <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-2.5">
              <span className="text-gray-400 font-semibold shrink-0 w-28">Nama Lengkap</span>
              <span className="text-gray-800 font-bold text-right">{student.nama_ayah}</span>
            </div>

            <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-2.5">
              <span className="text-gray-400 font-semibold shrink-0 w-28">Pendidikan</span>
              <span className="text-gray-800 font-bold text-right">{student.pendidikan_ayah}</span>
            </div>

            <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-2.5">
              <span className="text-gray-400 font-semibold shrink-0 w-28">Pekerjaan</span>
              <span className="text-gray-800 font-bold text-right">{student.pekerjaan_ayah}</span>
            </div>
          </div>
        </div>

        {/* Section: Data Ibu */}
        <div className="bg-white rounded-2xl p-4.5 shadow-sm border border-gray-100 flex flex-col gap-3.5">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
            <IconHeartHandshake size={16} className="text-[#064e3b]" />
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Data Ibu</h3>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between items-start gap-4">
              <span className="text-gray-400 font-semibold shrink-0 w-28">NIK Ibu</span>
              <span className="text-gray-800 font-bold text-right">{student.nik_ibu}</span>
            </div>
            
            <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-2.5">
              <span className="text-gray-400 font-semibold shrink-0 w-28">Nama Lengkap</span>
              <span className="text-gray-800 font-bold text-right">{student.nama_ibu}</span>
            </div>

            <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-2.5">
              <span className="text-gray-400 font-semibold shrink-0 w-28">Pendidikan</span>
              <span className="text-gray-800 font-bold text-right">{student.pendidikan_ibu}</span>
            </div>

            <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-2.5">
              <span className="text-gray-400 font-semibold shrink-0 w-28">Pekerjaan</span>
              <span className="text-gray-800 font-bold text-right">{student.pekerjaan_ibu}</span>
            </div>
          </div>
        </div>

        {/* Section: Kontak Orang Tua */}
        <div className="bg-white rounded-2xl p-4.5 shadow-sm border border-gray-100 flex flex-col gap-3.5">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
            <IconPhone size={16} className="text-[#064e3b]" />
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Kontak Wali / Orang Tua</h3>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between items-center gap-4">
              <span className="text-gray-400 font-semibold shrink-0 w-28">No. HP Hubung</span>
              <a 
                href={`tel:${student.no_hp_orang_tua}`}
                className="text-[#064e3b] font-extrabold text-right hover:underline flex items-center justify-end gap-1.5 active:scale-95 transition-all"
              >
                <IconPhone size={14} className="shrink-0" />
                <span>{student.no_hp_orang_tua}</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default WaliKelasSiswaDetail
