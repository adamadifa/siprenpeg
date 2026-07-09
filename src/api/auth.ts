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

export interface UpdateProfilePayload {
  name: string
  username: string
  email: string
}

export interface UpdateProfileResponse {
  success: boolean
  message: string
  data: {
    user: any
  }
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export interface ChangePasswordResponse {
  success: boolean
  message: string
}

export const updateProfile = async (payload: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
  const { data } = await apiClient.post<UpdateProfileResponse>('/api/auth/update-profile', payload)
  return data
}

export const changePassword = async (payload: ChangePasswordPayload): Promise<ChangePasswordResponse> => {
  const { data } = await apiClient.post<ChangePasswordResponse>('/api/auth/change-password', payload)
  return data
}
