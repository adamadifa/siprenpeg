import { apiClient } from './client'

export interface JobdeskDetail {
  kode_jobdesk: string
  jobdesk: string
  kode_dept: string
  kode_jabatan: string
  kode_unit: string
  nama_dept: string
  nama_jabatan: string
  nama_unit: string
}

export interface JobdeskListResponse {
  success: boolean
  data: JobdeskDetail[]
}

export const getJobdeskList = async (search?: string): Promise<JobdeskListResponse> => {
  const params: Record<string, string> = {}
  if (search) params.search = search

  const { data } = await apiClient.get<JobdeskListResponse>('/api/jobdesk', { params })
  return data
}
