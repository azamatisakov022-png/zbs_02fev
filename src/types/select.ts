export interface SelectOption {
  value: string | number | null
  label: string
  disabled?: boolean
}

export interface SelectGroup {
  label: string
  options: SelectOption[]
}
