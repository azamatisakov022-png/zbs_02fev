// Профиль компании текущего пользователя.
// Бэкенд: kg.eco.operator.controller.CompanyController.

import api from './client'

export interface MyCompany {
  id: number
  companyName: string
  inn: string
  legalForm?: string  // 'ОсОО' | 'ОАО' | 'ИП' | 'Иная'
  region?: string
  address?: string
  director?: string
  contactPerson?: string
  phone?: string
  email?: string
}

export const companyApi = {
  /** GET /companies/my - профиль компании авторизованного user'а. */
  async getMyCompany(): Promise<MyCompany> {
    const { data } = await api.get<MyCompany>('/companies/my')
    return data
  },
}
