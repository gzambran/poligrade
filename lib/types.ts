// Shared type definitions

export interface Politician {
  id: string
  name: string
  state: string
  district: string | null
  office: string
  status: string
  grade: string
  createdAt: string
  updatedAt: string
}

export interface PoliticianFormData {
  id?: string
  name: string
  state: string
  district: string | null
  office: string
  status: string
  grade: string
}
