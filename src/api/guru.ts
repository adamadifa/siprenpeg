import { apiClient } from './client'

export interface GuruDashboardResponse {
  success: boolean
  data: {
    guru: {
      npp: string
      nama: string
      nama_unit: string
      foto: string | null
    }
    tahun_ajaran: string
    semester: string
    hari_ini: string
    jadwal_hari_ini: Array<{
      id: number
      jam_ke: number
      jam_mulai: string
      jam_selesai: string
      nama_mapel: string
      nama_kelas: string
      sudah_presensi: boolean
    }>
    kelas_binaan: Array<{
      nama_kelas: string
      nama_unit: string
      total_siswa: number
    }> | null
  }
}

export interface PresensiMapelInputResponse {
  success: boolean
  data: {
    presensi_id: number | null
    materi: string
    tanggal: string
    jadwal: {
      id: number
      nama_mapel: string
      nama_kelas: string
      jam_ke: number
      jam_mulai: string
      jam_selesai: string
    }
    students: Array<{
      siswa_id: number
      nama_lengkap: string
      no_pendaftaran: string
      foto: string | null
      status: string // H, I, S, A
      keterangan: string | null
    }>
  }
}

export interface StorePresensiMapelPayload {
  jadwal_pelajaran_id: number
  tanggal: string
  status: Record<number, string>
  keterangan: Record<number, string>
  materi: string
}

export const getGuruDashboardData = async (): Promise<GuruDashboardResponse> => {
  const { data } = await apiClient.get<GuruDashboardResponse>('/api/guru/dashboard')
  return data
}

export const getPresensiMapelData = async (jadwalId: string, tanggal?: string): Promise<PresensiMapelInputResponse> => {
  const url = tanggal ? `/api/guru/presensi-mapel/${jadwalId}/${tanggal}` : `/api/guru/presensi-mapel/${jadwalId}`
  const { data } = await apiClient.get<PresensiMapelInputResponse>(url)
  return data
}

export const storePresensiMapelData = async (payload: StorePresensiMapelPayload): Promise<{ success: boolean; message: string }> => {
  const { data } = await apiClient.post<{ success: boolean; message: string }>('/api/guru/presensi-mapel/store', payload)
  return data
}

export interface PresensiMapelHistoryItem {
  id: number
  jadwal_pelajaran_id: number
  tanggal: string
  jam_mulai: string
  jam_selesai: string
  materi: string | null
  nama_kelas: string
  nama_unit: string
  nama_mapel: string
}

export const getPresensiMapelHistory = async (tanggal?: string): Promise<{ success: boolean; data: PresensiMapelHistoryItem[] }> => {
  const url = tanggal ? `/api/guru/presensi-mapel/history?tanggal=${tanggal}` : '/api/guru/presensi-mapel/history'
  const { data } = await apiClient.get<{ success: boolean; data: PresensiMapelHistoryItem[] }>(url)
  return data
}

export interface JadwalPelajaranItem {
  id: number
  hari: string
  jam_ke: number
  jam_mulai: string
  jam_selesai: string
  semester: number
  nama_mapel: string
  nama_kelas: string
  nama_unit: string
  kode_unit: string
  kode_kelas: string
  tahun_ajaran: string
}

export const getGuruJadwal = async (filters?: { kode_unit?: string; kode_kelas?: string; semester?: string }): Promise<{ success: boolean; data: JadwalPelajaranItem[] }> => {
  const { data } = await apiClient.get<{ success: boolean; data: JadwalPelajaranItem[] }>('/api/guru/jadwal', { params: filters })
  return data
}
