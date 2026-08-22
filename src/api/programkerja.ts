import { apiClient } from './client'

export interface ProgramKerjaDetail {
  kode_program_kerja: string
  program_kerja: string
  target_pencapaian: string
  keterangan: string | null
  kode_dept: string
  kode_unit: string
  nama_unit: string
  kode_jabatan: string
  nama_jabatan: string
}

export interface TahunAjaran {
  kode_ta: string
  tahun_ajaran: string
  status: number
}

export interface ProgramKerjaListResponse {
  success: boolean
  data: ProgramKerjaDetail[]
  tahun_ajaran: TahunAjaran[]
  ta_aktif: string | null
}

export const getProgramKerjaList = async (
  search?: string,
  kodeTa?: string
): Promise<ProgramKerjaListResponse> => {
  const params: Record<string, string> = {}
  if (search) params.search = search
  if (kodeTa) params.kode_ta = kodeTa

  const { data } = await apiClient.get<ProgramKerjaListResponse>('/api/program-kerja', { params })
  return data
}

export interface StoreProgramKerjaPayload {
  program_kerja: string
  target_pencapaian: string
  keterangan?: string
}

export interface StoreProgramKerjaResponse {
  success: boolean
  message: string
  data: ProgramKerjaDetail
}

export interface DeleteProgramKerjaResponse {
  success: boolean
  message: string
}

export const createProgramKerja = async (
  payload: StoreProgramKerjaPayload
): Promise<StoreProgramKerjaResponse> => {
  const { data } = await apiClient.post<StoreProgramKerjaResponse>('/api/program-kerja', payload)
  return data
}

export const deleteProgramKerja = async (
  kodeProgramKerja: string
): Promise<DeleteProgramKerjaResponse> => {
  const { data } = await apiClient.delete<DeleteProgramKerjaResponse>(`/api/program-kerja/${kodeProgramKerja}`)
  return data
}
