// US States for dropdown
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
]

// Office types
export const OFFICE_OPTIONS = [
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
