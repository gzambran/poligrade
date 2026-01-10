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
  runningForDistrict: string | null
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
  runningForDistrict: string | null
  published: boolean
  // Issue fields (arrays for list-based input)
  economicPolicy: string[] | null
  businessLabor: string[] | null
  healthCare: string[] | null
  education: string[] | null
  environment: string[] | null
  civilRights: string[] | null
  votingRights: string[] | null
  immigrationForeignAffairs: string[] | null
  publicSafety: string[] | null
}

// Helper to parse policy field from database (JSON string) to array
export function parsePolicyField(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [value]
  } catch {
    // Old format: plain text - convert to single-item array
    return value.trim() ? [value] : []
  }
}

// Helper to serialize policy array to JSON string for database
export function serializePolicyField(value: string[] | null): string | null {
  if (!value || value.length === 0) return null
  const filtered = value.filter(item => item.trim())
  return filtered.length > 0 ? JSON.stringify(filtered) : null
}
