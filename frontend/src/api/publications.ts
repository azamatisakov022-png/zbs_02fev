// API-функции модуля «Публикации».

import api from './client'
import type {
  CreatePublicationRequest,
  PageResult,
  Publication,
  PublicationCategory,
  PublicationLang,
  PublicationListItem,
} from '../types/publications'

// ─── Публичная часть (без auth) ─────────────────────────────────────

export const publicPublicationsApi = {
  /** Лента опубликованных. */
  async list(params?: {
    category?: PublicationCategory
    search?: string
    lang?: PublicationLang
    page?: number
    size?: number
  }): Promise<PageResult<PublicationListItem>> {
    const { data } = await api.get<PageResult<PublicationListItem>>(
      '/public/publications',
      { params },
    )
    return data
  },

  /** Самая свежая - для hero-блока. Может быть null если нет публикаций. */
  async latest(lang: PublicationLang = 'ru'): Promise<PublicationListItem | null> {
    const { data } = await api.get<PublicationListItem | null>(
      '/public/publications/latest',
      { params: { lang } },
    )
    return data
  },

  /** Детальная статья по slug. */
  async getBySlug(slug: string, lang: PublicationLang = 'ru'): Promise<Publication> {
    const { data } = await api.get<Publication>(
      `/public/publications/${encodeURIComponent(slug)}`,
      { params: { lang } },
    )
    return data
  },
}

// ─── Админ (auth) ────────────────────────────────────────────────────

export const publicationsApi = {
  /** Список для админки (видны и снятые с публикации). */
  async listAdmin(params?: { page?: number; size?: number }): Promise<PageResult<PublicationListItem>> {
    const { data } = await api.get<PageResult<PublicationListItem>>(
      '/publications/admin', { params },
    )
    return data
  },

  /** Получить публикацию по id (для формы редактирования). */
  async getById(id: number): Promise<Publication> {
    const { data } = await api.get<Publication>(`/publications/${id}`)
    return data
  },

  /** Создать. Cover загружается отдельным запросом после. */
  async create(request: CreatePublicationRequest): Promise<Publication> {
    const { data } = await api.post<Publication>('/publications', request)
    return data
  },

  /** Обновить. */
  async update(id: number, request: CreatePublicationRequest): Promise<Publication> {
    const { data } = await api.put<Publication>(`/publications/${id}`, request)
    return data
  },

  /** Загрузить cover-картинку (multipart). */
  async uploadCover(id: number, file: File): Promise<Publication> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post<Publication>(
      `/publications/${id}/cover`, form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data
  },

  /** Опубликовать (если был unpublished). */
  async publish(id: number): Promise<Publication> {
    const { data } = await api.post<Publication>(`/publications/${id}/publish`, {})
    return data
  },

  /** Снять с публикации. */
  async unpublish(id: number): Promise<Publication> {
    const { data } = await api.post<Publication>(`/publications/${id}/unpublish`, {})
    return data
  },

  /** Удалить (только админ). */
  async delete(id: number): Promise<void> {
    await api.delete(`/publications/${id}`)
  },
}
