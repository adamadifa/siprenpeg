import { apiClient } from './client'

export interface IbadahItem {
  id: number
  nama_kegiatan: string
  id_kategori_ibadah: number
  checked: boolean
  kode_checklist_ibadah: string | null
}

export interface IbadahListResponse {
  success: boolean
  data: {
    tanggal: string
    npp: string
    ibadah: Record<string, IbadahItem[]>
  }
}

export interface ToggleIbadahPayload {
  id: number
  tanggal: string
  checked: boolean
}

export interface ToggleIbadahResponse {
  success: boolean
  message: string
}

export const getIbadahList = async (tanggal: string): Promise<IbadahListResponse> => {
  const { data } = await apiClient.get<IbadahListResponse>('/api/ibadah', {
    params: { tanggal }
  })
  return data
}

export const toggleIbadahItem = async (payload: ToggleIbadahPayload): Promise<ToggleIbadahResponse> => {
  const { data } = await apiClient.post<ToggleIbadahResponse>('/api/ibadah/toggle', payload)
  return data
}
