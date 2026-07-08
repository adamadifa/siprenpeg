import { apiClient } from './client'

export interface PresensiData {
  hariini: string
  jam_kerja: {
    kode_jam_kerja: string
    nama_jam_kerja: string
    jam_masuk: string
    jam_pulang: string
    lintashari: number
  } | null
  lokasi_kantor: {
    kode_cabang: string
    nama_cabang: string
    lokasi_cabang: string
    radius_cabang: number
  }
  presensi: {
    id: number
    npp: string
    tanggal: string
    jam_in: string | null
    jam_out: string | null
    lokasi_in: string | null
    lokasi_out: string | null
    foto_in: string | null
    foto_out: string | null
    kode_jam_kerja: string
    status: string
  } | null
  lock_location: number
}

export interface CheckinStatusResponse {
  success: boolean
  data: PresensiData
}

export interface StorePresensiPayload {
  status: number // 1: In, 2: Out
  lokasi: string // "lat,lng"
  kode_jam_kerja: string
  image: string // base64 string
}

export interface StorePresensiResponse {
  success: boolean
  message: string
}

export const getCheckinStatus = async (): Promise<CheckinStatusResponse> => {
  const { data } = await apiClient.get<CheckinStatusResponse>('/api/presensi/karyawan/check-status')
  return data
}

export const storeEmployeePresensi = async (payload: StorePresensiPayload): Promise<StorePresensiResponse> => {
  const { data } = await apiClient.post<StorePresensiResponse>('/api/presensi/karyawan/store', payload)
  return data
}
