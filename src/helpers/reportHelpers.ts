import { productGroups } from '@/data/product-groups'
import { getNormativeForGroup } from '@/data/recycling-norms'
import type { ProcessingItem } from '@/types/report'

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export const getItemNormativePercent = (wasteType: string, year: number): number => {
  return getNormativeForGroup(wasteType, year) * 100
}

export const getItemNormative = (wasteType: string, year: number): number => {
  return getNormativeForGroup(wasteType, year)
}

export const getItemRequiredProcessing = (item: ProcessingItem, year: number): number => {
  const declared = parseFloat(item.declared) || 0
  return declared * getItemNormativePercent(item.wasteType, year) / 100
}

export const getItemSubjectToRecycle = (item: ProcessingItem, year: number): number => {
  const declared = parseFloat(item.declared) || 0
  return declared * getNormativeForGroup(item.wasteType, year)
}

export const getItemTotalProcessed = (item: ProcessingItem): number => {
  return parseFloat(item.processed) || 0
}

export const getItemDeficit = (item: ProcessingItem, year: number): number => {
  const subjectTo = getItemSubjectToRecycle(item, year)
  const total = getItemTotalProcessed(item)
  return Math.max(0, subjectTo - total)
}

export const getItemFulfillmentPercent = (item: ProcessingItem, year: number): number => {
  const required = getItemRequiredProcessing(item, year)
  const processed = parseFloat(item.processed) || 0
  if (required === 0) return 0
  return (processed / required) * 100
}

export const getItemRemainder = (item: ProcessingItem, year: number): number => {
  const required = getItemRequiredProcessing(item, year)
  const processed = parseFloat(item.processed) || 0
  return Math.max(0, required - processed)
}

export const getItemStatus = (item: ProcessingItem, year: number): 'fulfilled' | 'partial' | 'none' => {
  const required = getItemRequiredProcessing(item, year)
  const processed = parseFloat(item.processed) || 0
  if (processed >= required && required > 0) return 'fulfilled'
  if (processed > 0) return 'partial'
  return 'none'
}

export const getFulfillmentColor = (percent: number): string => {
  if (percent >= 100) return '#059669'
  if (percent >= 50) return '#CA8A04'
  return '#EF4444'
}

export interface ItemTotals {
  totalDeclared: number
  totalSubjectTo: number
  totalProcessed: number
  totalDeficit: number
}

export const calculateItemTotals = (items: ProcessingItem[], year: number): ItemTotals => {
  return {
    totalDeclared: items.reduce((s, i) => s + (parseFloat(i.declared) || 0), 0),
    totalSubjectTo: items.reduce((s, i) => s + getItemSubjectToRecycle(i, year), 0),
    totalProcessed: items.reduce((s, i) => s + getItemTotalProcessed(i), 0),
    totalDeficit: items.reduce((s, i) => s + getItemDeficit(i, year), 0),
  }
}

export const getBaseRate = (wasteType: string): number => {
  return productGroups.find(g => g.value === wasteType)?.baseRate || 0
}

export const getWasteTypeLabel = (value: string): string => {
  return productGroups.find(g => g.value === value)?.label || value
}

export const getGroupLabel = (value: string): string => {
  return productGroups.find(g => g.value === value)?.label || value
}

export const getPercentClass = (percent: number): string => {
  if (percent >= 100) return 'text-[#10b981]'
  if (percent >= 80) return 'text-[#f59e0b]'
  return 'text-[#ef4444]'
}

export const getRowClass = (row: Record<string, any>): string => {
  switch (row.status) {
    case 'approved': return 'row-green'
    case 'under_review': return 'row-yellow'
    case 'rejected': return 'row-red'
    default: return 'row-gray'
  }
}

export const fmt = (n: number): string => n.toFixed(2)

export const fmtPercent = (n: number): string => (n * 100).toFixed(1) + '%'
