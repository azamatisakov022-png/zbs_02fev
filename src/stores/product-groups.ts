import { defineStore } from 'pinia'
import api from '@/api/client'
import type { ProductGroupDTO, ProductSubgroupDTO, ProductGroupNormDTO, NormTableRow, FeeRateGroup } from '@/types/product-group'

export const useProductGroupStore = defineStore('productGroups', {
  state: () => ({
    groups: [] as ProductGroupDTO[],
    subgroupsByGroup: {} as Record<number, ProductSubgroupDTO[]>,
    currentGroup: null as ProductGroupDTO | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getGroupByNumber(state) {
      return (groupNumber: number) =>
        state.groups.find(g => g.groupNumber === groupNumber) ?? null
    },

    getGroupByValue(state) {
      return (value: string): ProductGroupDTO | null => {
        const match = value.match(/group_(\d+)/)
        if (!match) return null
        const num = parseInt(match[1])
        return state.groups.find(g => g.groupNumber === num) ?? null
      }
    },

    getSubgroups(state) {
      return (groupNumber: number) =>
        state.subgroupsByGroup[groupNumber] ?? []
    },

    getSubgroupById(state) {
      return (groupNumber: number, subgroupId: string): ProductSubgroupDTO | null =>
        (state.subgroupsByGroup[groupNumber] ?? []).find(s => String(s.id) === subgroupId) ?? null
    },

    getGroupNumberFromValue() {
      return (value: string): number => {
        const match = value.match(/group_(\d+)/)
        return match ? parseInt(match[1]) : 0
      }
    },

    getGroupLabel() {
      return (value: string): string => {
        const group = (this as any).getGroupByValue(value) as ProductGroupDTO | null
        return group ? `${group.groupNumber}. ${group.name}` : ''
      }
    },

    getSubgroupName(state) {
      return (groupValue: string, subgroupId: string): string => {
        const match = groupValue.match(/group_(\d+)/)
        if (!match) return subgroupId
        const num = parseInt(match[1])
        const sub = (state.subgroupsByGroup[num] ?? []).find(s => String(s.id) === subgroupId)
        return sub?.name || subgroupId
      }
    },

    isPackagingGroup() {
      return (value: string): boolean => {
        const group = (this as any).getGroupByValue(value) as ProductGroupDTO | null
        return group?.type === 'packaging'
      }
    },

    normYears(state): number[] {
      const allYears = new Set<number>()
      for (const group of state.groups) {
        for (const norm of group.norms ?? []) {
          allYears.add(norm.year)
        }
      }
      return Array.from(allYears).sort()
    },

    normsTableData(state): NormTableRow[] {
      return state.groups.map(g => ({
        id: g.groupNumber,
        category: g.name,
        rates: (g.norms ?? []).reduce((acc, n) => {
          acc[n.year] = n.normPercent
          return acc
        }, {} as Record<number, number>),
      }))
    },

    feeRateGroups(state): FeeRateGroup[] {
      const SECTION_ORDER = ['А', 'Б', 'В', 'Г', 'Д', 'Е']
      const grouped: Record<string, FeeRateGroup> = {}
      for (const g of state.groups) {
        const letter = g.sectionLetter
        if (!grouped[letter]) {
          grouped[letter] = {
            groupLetter: letter,
            groupTitle: g.sectionName,
            items: [],
          }
        }
        grouped[letter].items.push({
          id: g.groupNumber,
          name: g.name,
          rate: g.currentRate,
          unit: g.unit || 'сом/тонна',
          effectiveDate: '01.01.2025',
        })
      }
      return SECTION_ORDER.filter(l => grouped[l]).map(l => grouped[l])
    },
  },

  actions: {
    async fetchGroups() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get<ProductGroupDTO[]>('/public/product-groups')
        this.groups = data
      } catch (e: any) {
        this.error = e.message || 'Failed to fetch product groups'
      } finally {
        this.loading = false
      }
    },

    async fetchGroupByNumber(groupNumber: number) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get<ProductGroupDTO>(`/public/product-groups/${groupNumber}`)
        this.currentGroup = data
      } catch (e: any) {
        this.error = e.message || 'Failed to fetch product group'
      } finally {
        this.loading = false
      }
    },

    async fetchAllGroupsWithNorms() {
      this.loading = true
      this.error = null
      try {
        const { data: groups } = await api.get<ProductGroupDTO[]>('/public/product-groups')
        const details = await Promise.all(
          groups.map(g =>
            api.get<ProductGroupDTO>(`/public/product-groups/${g.groupNumber}`)
              .then(res => res.data)
          )
        )
        this.groups = details
      } catch (e: any) {
        this.error = e.message || 'Failed to fetch product groups with norms'
      } finally {
        this.loading = false
      }
    },

    async fetchSubgroups(groupNumber: number) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get<ProductSubgroupDTO[]>(
          `/public/product-groups/${groupNumber}/subgroups`,
        )
        this.subgroupsByGroup[groupNumber] = data
      } catch (e: any) {
        this.error = e.message || 'Failed to fetch subgroups'
      } finally {
        this.loading = false
      }
    },
  },
})
