// State abbreviation to full name mapping
export const STATE_MAP: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming'
}

// US States array (2-letter abbreviations sorted by full name)
export const US_STATES = Object.keys(STATE_MAP).sort((a, b) =>
  STATE_MAP[a].localeCompare(STATE_MAP[b])
)

// Office types
export const OFFICE_OPTIONS = [
  { value: 'NONE', label: 'N/A' },
  { value: 'GOVERNOR', label: 'Governor' },
  { value: 'SENATOR', label: 'Senator' },
  { value: 'HOUSE_REPRESENTATIVE', label: 'House Representative' },
]

// Status types
export const STATUS_OPTIONS = [
  { value: 'INCUMBENT', label: 'Incumbent' },
  { value: 'CANDIDATE', label: 'Candidate' },
  { value: 'NONE', label: 'None' },
]

// Grade types
export const GRADE_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROGRESSIVE', label: 'Progressive' },
  { value: 'LIBERAL', label: 'Liberal' },
  { value: 'CENTRIST', label: 'Centrist' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'CONSERVATIVE', label: 'Conservative' },
  { value: 'NATIONALIST', label: 'Nationalist' },
]

// Helper to convert enum to display label
export const formatOffice = (office: string) => {
  return OFFICE_OPTIONS.find(o => o.value === office)?.label || office
}

export const formatStatus = (status: string) => {
  return STATUS_OPTIONS.find(s => s.value === status)?.label || status
}

export const formatGrade = (grade: string) => {
  return GRADE_OPTIONS.find(g => g.value === grade)?.label || grade
}

// Grade colors for consistent styling across the app
export const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  Pending: { bg: '#a6a6a6', text: '#a6a6a6' },
  Progressive: { bg: '#3c78d8', text: '#3c78d8' },
  Liberal: { bg: '#6d9eeb', text: '#6d9eeb' },
  Centrist: { bg: '#a4c2f4', text: '#a4c2f4' },
  Moderate: { bg: '#ea9999', text: '#ea9999' },
  Conservative: { bg: '#e06666', text: '#e06666' },
  Nationalist: { bg: '#cc0000', text: '#cc0000' },
}

export const getGradeColor = (grade: string) =>
  GRADE_COLORS[grade] || { bg: '#a6a6a6', text: '#a6a6a6' }

// Party options
export const PARTY_OPTIONS = [
  { value: 'DEMOCRAT', label: 'Democrat' },
  { value: 'REPUBLICAN', label: 'Republican' },
  { value: 'INDEPENDENT', label: 'Independent' },
]

// Running For options (Office + "Not Running")
export const RUNNING_FOR_OPTIONS = [
  { value: '', label: 'Not Running' },
  { value: 'NONE', label: 'N/A' },
  { value: 'GOVERNOR', label: 'Governor' },
  { value: 'SENATOR', label: 'Senator' },
  { value: 'HOUSE_REPRESENTATIVE', label: 'House Representative' },
]

// Issue criteria for profile pages
export const ISSUE_CRITERIA = [
  { key: 'economicPolicy', label: 'Economic Policy' },
  { key: 'businessLabor', label: 'Business & Labor' },
  { key: 'healthCare', label: 'Health Care' },
  { key: 'education', label: 'Education' },
  { key: 'environment', label: 'Environment' },
  { key: 'civilRights', label: 'Civil Rights' },
  { key: 'votingRights', label: 'Voting Rights & Democracy' },
  { key: 'immigrationForeignAffairs', label: 'Immigration & Foreign Affairs' },
  { key: 'publicSafety', label: 'Public Safety' },
] as const

export const formatParty = (party: string | null) => {
  if (!party) return null
  return PARTY_OPTIONS.find(p => p.value === party)?.label || party
}

export const formatRunningFor = (runningFor: string | null) => {
  if (!runningFor) return null
  return RUNNING_FOR_OPTIONS.find(r => r.value === runningFor)?.label || runningFor
}

// Generate a URL-friendly slug from a name
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Trim hyphens from start/end
}
