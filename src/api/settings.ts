import { apiClient } from './client'

export interface PengaturanUmumResponse {
  status: string
  data: {
    logo?: string
    background_login?: string
    nama_sekolah?: string
    alamat?: string
    telepon?: string
    email?: string
    [key: string]: any
  } | null
  message?: string
}

export const fetchSettings = async (): Promise<PengaturanUmumResponse> => {
  const { data } = await apiClient.get<PengaturanUmumResponse>('/api/public/pengaturan-umum')
  return data
}
