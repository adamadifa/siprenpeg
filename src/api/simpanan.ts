import { apiClient } from './client'

export interface SaldoSimpananItem {
  id: number
  no_anggota: string
  kode_simpanan: string
  jumlah: string
  created_at: string
  updated_at: string
  jenis_simpanan: string
}

export interface MutasiItem {
  no_transaksi: string
  no_anggota: string
  tanggal: string
  kode_simpanan: string
  jenis_transaksi: 'S' | 'T' | 'P' // S: Setoran, T/P: Penarikan
  jumlah: string
  created_at: string
  updated_at: string
  jenis_simpanan?: string
}

export interface SimpananData {
  no_anggota: string
  total_saldo: number
  saldo_simpanan: SaldoSimpananItem[]
  mutasi: MutasiItem[]
}

export interface SimpananResponse {
  success: boolean
  data: SimpananData
}

export interface SingleSimpananResponse {
  success: boolean
  data: {
    no_anggota: string
    simpanan: SaldoSimpananItem
    mutasi: MutasiItem[]
  }
}

export const getSimpananDetails = async (): Promise<SimpananResponse> => {
  const { data } = await apiClient.get<SimpananResponse>('/api/simpanan')
  return data
}

export const getSingleSimpananDetail = async (kodeSimpanan: string): Promise<SingleSimpananResponse> => {
  const encoded = encodeURIComponent(kodeSimpanan)
  const { data } = await apiClient.get<SingleSimpananResponse>(`/api/simpanan/${encoded}`)
  return data
}
