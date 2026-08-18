import { apiClient } from './client'

export interface RealisasiKegiatan {
  id: number
  tanggal: string
  nama_kegiatan: string
  kode_dept: string
  kode_jabatan: string
  kode_jobdesk: string | null
  jobdesk: string | null
  kode_program_kerja: string | null
  program_kerja: string | null
  uraian_kegiatan: string
  foto: string | null
  foto_url: string | null
}

export interface Jobdesk {
  kode_jobdesk: string
  jobdesk: string
}

export interface ProgramKerja {
  kode_program_kerja: string
  program_kerja: string
}

export interface KegiatanOptions {
  jobdesks: Jobdesk[]
  programs: ProgramKerja[]
}

export interface KegiatanListResponse {
  success: boolean
  data: RealisasiKegiatan[]
}

export interface KegiatanOptionsResponse {
  success: boolean
  data: KegiatanOptions
}

export interface CreateKegiatanPayload {
  tanggal: string
  nama_kegiatan: string
  uraian_kegiatan: string
  kode_jobdesk?: string
  kode_program_kerja?: string
  foto?: string // base64 string
}

export interface SimpleResponse {
  success: boolean
  message: string
}

export const getKegiatanList = async (
  startDate?: string,
  endDate?: string
): Promise<KegiatanListResponse> => {
  const params: Record<string, string> = {}
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate

  const { data } = await apiClient.get<KegiatanListResponse>('/api/realisasi-kegiatan', { params })
  return data
}

export const getKegiatanOptions = async (): Promise<KegiatanOptionsResponse> => {
  const { data } = await apiClient.get<KegiatanOptionsResponse>('/api/realisasi-kegiatan/options')
  return data
}

export const createKegiatan = async (payload: CreateKegiatanPayload): Promise<SimpleResponse> => {
  const { data } = await apiClient.post<SimpleResponse>('/api/realisasi-kegiatan', payload)
  return data
}

export const deleteKegiatan = async (id: number): Promise<SimpleResponse> => {
  const { data } = await apiClient.delete<SimpleResponse>(`/api/realisasi-kegiatan/${id}`)
  return data
}
