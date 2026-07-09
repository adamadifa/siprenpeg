import { apiClient } from './client'

export interface TabunganAccount {
  no_rekening: string
  no_anggota: string
  kode_tabungan: string
  id_petugas: number
  saldo: number
  rfid: string | null
  created_at: string
  updated_at: string
  jenis_tabungan: string
}

export interface TabunganMutation {
  no_transaksi: string
  no_rekening: string
  tanggal: string
  jenis_transaksi: 'S' | 'T' | 'P'
  jumlah: number
  saldo: number
  berita: string | null
  id_petugas: number
  created_at: string
  updated_at: string
  jenis_tabungan?: string
}

export interface TabunganDetailsResponse {
  success: boolean
  data: {
    no_anggota: string
    total_saldo: number
    tabungan: TabunganAccount[]
    mutasi: TabunganMutation[]
  }
}

export interface TabunganDetailResponse {
  success: boolean
  data: {
    no_anggota: string
    tabungan: TabunganAccount
    mutasi: TabunganMutation[]
  }
}

export const getTabunganDetails = async (): Promise<TabunganDetailsResponse> => {
  const { data } = await apiClient.get<TabunganDetailsResponse>('/api/tabungan-karyawan')
  return data
}

export const getSingleTabunganDetail = async (
  noRekening: string,
  startDate?: string,
  endDate?: string
): Promise<TabunganDetailResponse> => {
  const params: Record<string, string> = {}
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate

  const { data } = await apiClient.get<TabunganDetailResponse>(`/api/tabungan-karyawan/${noRekening}`, { params })
  return data
}
