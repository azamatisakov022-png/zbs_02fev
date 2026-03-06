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
