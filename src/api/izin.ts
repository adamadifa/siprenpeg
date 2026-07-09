import { apiClient } from './client'

export interface IzinHistoryItem {
  id: string
  dari: string
  sampai: string
  keterangan: string
  status: number // 0: Pending, 1: Approved, 2: Rejected
  jenis_izin: 'izin' | 'sakit'
  created_at: string
  doc_sid: string | null
}

export interface IzinHistoryResponse {
  success: boolean
  data: IzinHistoryItem[]
}

export interface StoreIzinPayload {
  jenis_izin: 'izin' | 'sakit'
  dari: string
  sampai: string
  keterangan: string
  sid_image?: string | null
}

export interface StoreIzinResponse {
  success: boolean
  message: string
}

export const getIzinHistory = async (): Promise<IzinHistoryResponse> => {
  const { data } = await apiClient.get<IzinHistoryResponse>('/api/izin/history')
  return data
}

export const storeIzin = async (payload: StoreIzinPayload): Promise<StoreIzinResponse> => {
  const { data } = await apiClient.post<StoreIzinResponse>('/api/izin/store', payload)
  return data
}
