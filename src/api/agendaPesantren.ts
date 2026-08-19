import { apiClient } from './client'

export interface AgendaPesantren {
  id: number
  title: string
  start: string
  end: string
  description: string
  location: string
  allDay: boolean
  extendedProps: {
    encrypted_id: string
  }
}

export const getAgendaPesantrenList = async (): Promise<AgendaPesantren[]> => {
  const { data } = await apiClient.get<AgendaPesantren[]>('/api/agenda-pesantren')
  return data
}
