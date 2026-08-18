import { apiClient } from './client'

export interface AgendaKegiatan {
  id: number
  tanggal: string
  nama_kegiatan: string
  kode_dept: string
  kode_jabatan: string
  uraian_kegiatan: string
}

export interface AgendaListResponse {
  success: boolean
  data: AgendaKegiatan[]
}

export interface CreateAgendaPayload {
  tanggal: string
  nama_kegiatan: string
  uraian_kegiatan: string
}

export interface SimpleResponse {
  success: boolean
  message: string
}

export const getAgendaList = async (
  startDate?: string,
  endDate?: string
): Promise<AgendaListResponse> => {
  const params: Record<string, string> = {}
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate

  const { data } = await apiClient.get<AgendaListResponse>('/api/agenda-kegiatan', { params })
  return data
}

export const createAgenda = async (payload: CreateAgendaPayload): Promise<SimpleResponse> => {
  const { data } = await apiClient.post<SimpleResponse>('/api/agenda-kegiatan', payload)
  return data
}

export const deleteAgenda = async (id: number): Promise<SimpleResponse> => {
  const { data } = await apiClient.delete<SimpleResponse>(`/api/agenda-kegiatan/${id}`)
  return data
}
