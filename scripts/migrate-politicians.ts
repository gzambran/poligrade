import { PrismaClient, Office, Status, Grade } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// State abbreviation to full name mapping
const STATE_MAP: Record<string, string> = {
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

interface JSONPolitician {
  name: string
  district: string
  office: string
  grade: string
}

function transformOffice(office: string): Office {
  if (office === 'Governor') return Office.GOVERNOR
  if (office === 'Senator') return Office.SENATOR
  if (office === 'House Representative') return Office.HOUSE_REPRESENTATIVE
  throw new Error(`Unknown office: ${office}`)
}

function transformGrade(grade: string): Grade {
  // Handle invalid grades (like #NUM! from spreadsheet errors)
  if (grade === '#NUM!' || !grade) {
    return Grade.CENTRIST // Default grade for invalid/missing values
  }
  return grade.toUpperCase() as Grade
}

function parseDistrict(districtField: string, office: string): { state: string; district: string | null } {
  // For House Representatives: "AK-AL" -> state: "Alaska", district: "At-Large"
  // For House Representatives: "AL-1" -> state: "Alabama", district: "1"
  // For Governors/Senators: "AL" -> state: "Alabama", district: null

  if (districtField.includes('-')) {
    const [stateAbbr, districtNum] = districtField.split('-')
    const state = STATE_MAP[stateAbbr]
    if (!state) {
      throw new Error(`Unknown state abbreviation: ${stateAbbr}`)
    }
    // Normalize "AL" to "At-Large"
    const normalizedDistrict = districtNum === 'AL' ? 'At-Large' : districtNum
    return { state, district: normalizedDistrict }
  } else {
    const state = STATE_MAP[districtField]
    if (!state) {
      throw new Error(`Unknown state abbreviation: ${districtField}`)
    }
    return { state, district: null }
  }
}

async function main() {
  console.log('🚀 Starting politician migration...\n')

  // Read JSON file
  const jsonPath = path.join(process.cwd(), 'public', 'politicians.json')
  const jsonData = fs.readFileSync(jsonPath, 'utf-8')
  const politicians: JSONPolitician[] = JSON.parse(jsonData)

  console.log(`📊 Found ${politicians.length} politicians in JSON file\n`)

  // Check if there's already data
  const existingCount = await prisma.politician.count()
  if (existingCount > 0) {
    console.log(`⚠️  Warning: Database already contains ${existingCount} politicians`)
    console.log('   This script will add more politicians (duplicates possible)')
    console.log('   If you want to start fresh, delete existing records first.\n')
  }

  let successCount = 0
  let errorCount = 0
  const errors: Array<{ politician: JSONPolitician; error: string }> = []

  // Import each politician
  for (const jsonPol of politicians) {
    try {
      // Skip candidate entries without valid state (e.g., "D Candidate", "R Candidate")
      if (jsonPol.district.includes('Candidate')) {
        console.log(`⏭️  Skipping candidate: ${jsonPol.name} (${jsonPol.district})`)
        continue
      }

      const { state, district } = parseDistrict(jsonPol.district, jsonPol.office)

      await prisma.politician.create({
        data: {
          name: jsonPol.name,
          state,
          district,
          office: transformOffice(jsonPol.office),
          status: Status.INCUMBENT, // Default to incumbent for existing politicians
          grade: transformGrade(jsonPol.grade),
        },
      })

      successCount++

      // Progress indicator
      if (successCount % 50 === 0) {
        console.log(`✅ Imported ${successCount} politicians...`)
      }
    } catch (error: any) {
      errorCount++
      errors.push({ politician: jsonPol, error: error.message })
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📈 Migration Results:')
  console.log('='.repeat(60))
  console.log(`✅ Successfully imported: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log('='.repeat(60))

  if (errors.length > 0) {
    console.log('\n❌ Errors encountered:')
    errors.forEach((err, i) => {
      console.log(`${i + 1}. ${err.politician.name} - ${err.error}`)
    })
  }

  // Verify final count
  const finalCount = await prisma.politician.count()
  console.log(`\n📊 Total politicians in database: ${finalCount}`)
  console.log('\n✨ Migration complete!')
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
