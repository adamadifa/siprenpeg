import { apiClient } from './client'

export interface PinjamanDetailsResponse {
  success: boolean
  data: {
    no_anggota: string
    total_pinjaman: number
    total_sisa: number
    pembiayaan: Array<{
      no_akad: string
      tanggal: string
      jumlah_pokok: number
      persentase: number
      total_pinjaman: number
      total_bayar: number
      sisa: number
      is_lunas: boolean
      progress: number
      jenis_pembiayaan: string
      keperluan: string
      status: string
    }>
    mutasi: Array<{
      no_akad: string
      tanggal: string
      jumlah: number
      jenis_transaksi: string
      jenis_pembiayaan: string
    }>
  }
}

export interface SinglePinjamanResponse {
  success: boolean
  data: {
    pembiayaan: {
      no_akad: string
      tanggal: string
      jumlah_pokok: number
      persentase: number
      total_pinjaman: number
      total_bayar: number
      sisa: number
      is_lunas: boolean
      progress: number
      jenis_pembiayaan: string
      keperluan: string
      status: string
      angsuran: number
    }
    rencana: Array<{
      no_akad: string
      cicilan_ke: number
      bulan: string
      tahun: string
      jumlah: number
      bayar: number
      status: string
    }>
    historibayar: Array<{
      id: number
      no_akad: string
      tanggal: string
      jumlah: number
      jenis_transaksi: string
      created_at?: string
    }>
  }
}

export const getPinjamanDetails = async (): Promise<PinjamanDetailsResponse> => {
  const { data } = await apiClient.get<PinjamanDetailsResponse>('/api/pinjaman')
  return data
}

export const getSinglePinjamanDetail = async (noAkad: string): Promise<SinglePinjamanResponse> => {
  const encodedAkad = encodeURIComponent(noAkad)
  const { data } = await apiClient.get<SinglePinjamanResponse>(`/api/pinjaman/${encodedAkad}`)
  return data
}
