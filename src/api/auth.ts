import { apiClient } from './client'

export interface LoginPayload {
  username: string
  password?: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: {
      id: number
      name: string
      username: string
      email: string
      npp?: string
      [key: string]: any
    }
  }
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/api/auth/login', payload)
  return data
}

export interface UserResponse {
  success: boolean
  data: {
    id: number
    name: string
    username: string
    email: string
    npp?: string
    karyawan?: {
      nama: string
      jabatan: string
      nama_unit: string
      foto: string | null
    }
    [key: string]: any
  }
}

export const getCurrentUser = async (): Promise<UserResponse> => {
  const { data } = await apiClient.get<UserResponse>('/api/user')
  return data
}
