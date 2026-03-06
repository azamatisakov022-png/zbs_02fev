export interface ProductGroupDTO {
  id: number
  groupNumber: number
  name: string
  code: string
  type: 'product' | 'packaging'
  unit: string
  sectionLetter: string
  sectionName: string
  currentRate: number
  subgroupCount?: number
  subgroups?: ProductSubgroupDTO[]
  recyclingStandard: number
  norms?: ProductGroupNormDTO[]
}

export interface ProductGroupNormDTO {
  year: number
  normPercent: number
  resolutionNumber: string
}

export interface NormTableRow {
  id: number
  category: string
  rates: Record<number, number>
}

export interface FeeRateItem {
  id: number
  name: string
  rate: number
  unit: string
  effectiveDate: string
}

export interface FeeRateGroup {
  groupLetter: string
  groupTitle: string
  items: FeeRateItem[]
}

export interface ProductSubgroupDTO {
  id: number
  name: string
  type: 'product' | 'packaging'
  rateMultiplier: number
  sortOrder: number
  gskpCode?: string
  tnvedCode?: string | null
  tnvedName?: string | null
  packagingMaterial?: string | null
  packagingLetterCode?: string | null
  packagingDigitalCode?: string | null
}
