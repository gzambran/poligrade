// Shared type definitions

export interface Politician {
  id: string
  name: string
  slug: string | null
  state: string
  district: string | null
  office: string
  status: string
  grade: string
  // Profile fields
  photoUrl: string | null
  party: string | null
  currentPosition: string | null
  runningFor: string | null
  published: boolean
  // Issue fields
  economicPolicy: string | null
  businessLabor: string | null
  healthCare: string | null
  education: string | null
  environment: string | null
  civilRights: string | null
  votingRights: string | null
  immigrationForeignAffairs: string | null
  publicSafety: string | null
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
  // Profile fields
  photoUrl: string | null
  party: string | null
  currentPosition: string | null
  runningFor: string | null
  published: boolean
  // Issue fields
  economicPolicy: string | null
  businessLabor: string | null
  healthCare: string | null
  education: string | null
  environment: string | null
  civilRights: string | null
  votingRights: string | null
  immigrationForeignAffairs: string | null
  publicSafety: string | null
}
