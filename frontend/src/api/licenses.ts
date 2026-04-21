// API-функции модуля «Лицензии».
// Используют общий axios-клиент с JWT-интерсептором (src/api/client.ts).

import api from './client'
import type {
  ApproveApplicationRequest,
  CreateApplicationRequest,
  EnumItem,
  License,
  LicenseApplication,
  LicenseApplicationStatus,
  LicenseDocumentType,
  LicenseType,
  ManualPaymentInfo,
  PaymentIntent,
  PaymentStatusInfo,
  RejectApplicationRequest,
  SiteVisitRequest,
  SubmitApplicationRequest,
} from '../types/licenses'

// ─── Заявитель (BUSINESS) ────────────────────────────────────────────

export const applicantApi = {
  async myApplications(): Promise<LicenseApplication[]> {
    const { data } = await api.get<LicenseApplication[]>('/license-applications/my')
    return data
  },

  async getMyApplication(id: number): Promise<LicenseApplication> {
    const { data } = await api.get<LicenseApplication>(`/license-applications/${id}`)
    return data
  },

  async createDraft(request: CreateApplicationRequest): Promise<LicenseApplication> {
    const { data } = await api.post<LicenseApplication>('/license-applications', request)
    return data
  },

  async updateDraft(id: number, request: CreateApplicationRequest): Promise<LicenseApplication> {
    const { data } = await api.put<LicenseApplication>(`/license-applications/${id}`, request)
    return data
  },

  async submit(id: number, request: SubmitApplicationRequest): Promise<PaymentIntent | null> {
    const { data } = await api.post<PaymentIntent | null>(`/license-applications/${id}/submit`, request)
    return data
  },

  async reopen(id: number): Promise<LicenseApplication> {
    const { data } = await api.post<LicenseApplication>(`/license-applications/${id}/reopen`, {})
    return data
  },

  async uploadDocument(
    applicationId: number,
    docType: LicenseDocumentType,
    file: File,
  ): Promise<LicenseApplication> {
    const form = new FormData()
    form.append('file', file)
    form.append('docType', docType)
    const { data } = await api.post<LicenseApplication>(
      `/license-applications/${applicationId}/documents?docType=${docType}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data
  },

  async deleteDocument(applicationId: number, docId: number): Promise<void> {
    await api.delete(`/license-applications/${applicationId}/documents/${docId}`)
  },

  async createPaymentIntent(applicationId: number, returnUrl?: string): Promise<PaymentIntent> {
    const { data } = await api.post<PaymentIntent>(
      `/license-applications/${applicationId}/pay`,
      { returnUrl: returnUrl || window.location.origin + '/business/license-applications' },
    )
    return data
  },

  async submitOfflineReceipt(
    applicationId: number,
    receipt: File,
    info: ManualPaymentInfo,
  ): Promise<void> {
    const form = new FormData()
    form.append('receipt', receipt)
    form.append('info', new Blob([JSON.stringify(info)], { type: 'application/json' }))
    await api.post(`/license-applications/${applicationId}/manual-payment`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async getPaymentStatus(applicationId: number): Promise<PaymentStatusInfo> {
    const { data } = await api.get<PaymentStatusInfo>(
      `/license-applications/${applicationId}/payment-status`,
    )
    return data
  },
}

// ─── Сотрудник МПРЭТН (EMPLOYEE / MINISTRY / ADMIN) ───────────────────

export const adminApplicationApi = {
  async list(params?: {
    status?: LicenseApplicationStatus
    licenseType?: LicenseType
    overdue?: boolean
  }): Promise<LicenseApplication[]> {
    const { data } = await api.get<LicenseApplication[]>('/admin/license-applications', {
      params,
    })
    return data
  },

  async statusCounts(): Promise<Record<string, number>> {
    const { data } = await api.get<Record<string, number>>(
      '/admin/license-applications/status-counts',
    )
    return data
  },

  async getById(id: number): Promise<LicenseApplication> {
    const { data } = await api.get<LicenseApplication>(`/admin/license-applications/${id}`)
    return data
  },

  async accept(id: number): Promise<LicenseApplication> {
    const { data } = await api.post<LicenseApplication>(
      `/admin/license-applications/${id}/accept`,
      {},
    )
    return data
  },

  async reject(id: number, request: RejectApplicationRequest): Promise<LicenseApplication> {
    const { data } = await api.post<LicenseApplication>(
      `/admin/license-applications/${id}/reject`,
      request,
    )
    return data
  },

  async recordSiteVisit(id: number, request: SiteVisitRequest): Promise<LicenseApplication> {
    const { data } = await api.post<LicenseApplication>(
      `/admin/license-applications/${id}/site-visit`,
      request,
    )
    return data
  },

  async approve(id: number, request: ApproveApplicationRequest): Promise<LicenseApplication> {
    const { data } = await api.post<LicenseApplication>(
      `/admin/license-applications/${id}/approve`,
      request,
    )
    return data
  },

  async confirmManualPayment(paymentId: number): Promise<void> {
    await api.post(`/admin/license-payments/${paymentId}/confirm-manual`, {})
  },
}

// ─── Реестр лицензий (EMPLOYEE / MINISTRY / ECO_OPERATOR read-only) ────

export const licenseRegistryApi = {
  async list(licenseType?: LicenseType): Promise<License[]> {
    const { data } = await api.get<License[]>('/licenses', {
      params: licenseType ? { licenseType } : {},
    })
    return data
  },

  async getById(id: number): Promise<License> {
    const { data } = await api.get<License>(`/licenses/${id}`)
    return data
  },

  async updateVisibility(
    id: number,
    payload: { isPublished?: boolean; isRevoked?: boolean; revocationReason?: string },
  ): Promise<License> {
    const { data } = await api.patch<License>(`/licenses/${id}/visibility`, payload)
    return data
  },

  async exportCsvUrl(licenseType?: LicenseType): Promise<Blob> {
    const res = await api.get<Blob>('/licenses/export.csv', {
      params: licenseType ? { licenseType } : {},
      responseType: 'blob',
    })
    return res.data
  },
}

// ─── Публичный реестр (без авторизации) ──────────────────────────────

export const publicLicensesApi = {
  async listPublished(params?: {
    search?: string
    page?: number
    size?: number
  }): Promise<{ content: License[]; totalElements: number; number: number; size: number }> {
    const { data } = await api.get('/public/licenses', { params })
    return data
  },

  async getByNumber(licenseNumber: string): Promise<License> {
    const { data } = await api.get<License>(`/public/licenses/${encodeURIComponent(licenseNumber)}`)
    return data
  },

  async licenseTypes(): Promise<EnumItem<LicenseType>[]> {
    const { data } = await api.get<EnumItem<LicenseType>[]>('/public/enums/license-types')
    return data
  },

  async rejectionReasons(): Promise<EnumItem[]> {
    const { data } = await api.get<EnumItem[]>('/public/enums/rejection-reasons')
    return data
  },

  async applicationStatuses(): Promise<EnumItem[]> {
    const { data } = await api.get<EnumItem[]>('/public/enums/application-statuses')
    return data
  },

  async documentTypes(licenseType?: LicenseType): Promise<EnumItem<LicenseDocumentType>[]> {
    const { data } = await api.get<EnumItem<LicenseDocumentType>[]>('/public/enums/document-types', {
      params: licenseType ? { licenseType } : {},
    })
    return data
  },
}
