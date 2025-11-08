'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardBody, Input, Select, SelectItem, Button } from '@nextui-org/react'

interface Politician {
  id: string
  name: string
  state: string
  district: string
  office: string
  status: string
  grade: string
}

const GRADE_OPTIONS = ['Progressive', 'Liberal', 'Centrist', 'Moderate', 'Conservative', 'Nationalist']
const OFFICE_OPTIONS = ['All', 'Governor', 'Senator', 'House Representative']

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

const US_STATES = Object.keys(STATE_MAP).sort()

// Fetch politicians from database via API
async function fetchPoliticians(): Promise<Politician[]> {
  const response = await fetch('/api/politicians')
  return response.json()
}

function GradesContent() {
  const searchParams = useSearchParams()
  const [politicians, setPoliticians] = useState<Politician[]>([])

  // Filter state
  const [nameQuery, setNameQuery] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [officeFilter, setOfficeFilter] = useState('All')
  const [gradeFilter, setGradeFilter] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  // Load data
  useEffect(() => {
    fetchPoliticians()
      .then(data => {
        setPoliticians(data)

        // Apply grade filter from URL if present
        const gradeParam = searchParams.get('grade')
        if (gradeParam && GRADE_OPTIONS.includes(gradeParam)) {
          setGradeFilter(gradeParam)
        }
      })
      .catch(err => {
        console.error('Error loading politicians:', err)
      })
  }, [searchParams])

  // Filter politicians
  const filteredPoliticians = useMemo(() => {
    return politicians.filter(p => {
      const matchesName = !nameQuery || p.name.toLowerCase().includes(nameQuery.toLowerCase())
      const matchesState = !stateFilter || p.state === stateFilter
      const matchesDistrict = !districtFilter || p.district.toLowerCase().includes(districtFilter.toLowerCase())
      const matchesOffice = officeFilter === 'All' || p.office === officeFilter
      const matchesGrade = !gradeFilter || p.grade === gradeFilter

      return matchesName && matchesState && matchesDistrict && matchesOffice && matchesGrade
    })
  }, [politicians, nameQuery, stateFilter, districtFilter, officeFilter, gradeFilter])

  // Summary counts by grade
  const summaryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    GRADE_OPTIONS.forEach(grade => { counts[grade] = 0 })

    filteredPoliticians.forEach(p => {
      if (counts[p.grade] !== undefined) {
        counts[p.grade]++
      }
    })

    return counts
  }, [filteredPoliticians])

  // Reset filters
  const handleReset = useCallback(() => {
    setNameQuery('')
    setStateFilter('')
    setDistrictFilter('')
    setOfficeFilter('All')
    setGradeFilter('')
    setCurrentPage(1)
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [nameQuery, stateFilter, districtFilter, officeFilter, gradeFilter])

  // Paginated results
  const totalPages = Math.ceil(filteredPoliticians.length / itemsPerPage)
  const paginatedPoliticians = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredPoliticians.slice(startIndex, endIndex)
  }, [filteredPoliticians, currentPage, itemsPerPage])

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Politician Grades</h1>
        <p className="text-lg text-foreground/60">
          Search and filter {politicians.length} elected officials by policy alignment
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {GRADE_OPTIONS.map(grade => (
          <Card key={grade} className="hover:shadow-lg transition-shadow">
            <CardBody className="text-center p-4">
              <p className="text-2xl font-bold text-primary mb-1">
                {summaryCounts[grade]}
              </p>
              <p className="text-sm text-foreground/60">{grade}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardBody className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Input
              label="Search Name"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              classNames={{ input: 'text-base', inputWrapper: 'h-12' }}
            />

            <Select
              label="State"
              selectedKeys={stateFilter ? [stateFilter] : []}
              onChange={(e) => setStateFilter(e.target.value)}
              classNames={{ trigger: 'h-12' }}
              placeholder="All states"
            >
              {US_STATES.map(state => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </Select>

            <Input
              label="District"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              classNames={{ input: 'text-base', inputWrapper: 'h-12' }}
              placeholder="e.g., 12"
            />

            <Select
              label="Office"
              selectedKeys={[officeFilter]}
              onChange={(e) => setOfficeFilter(e.target.value)}
              classNames={{ trigger: 'h-12' }}
            >
              {OFFICE_OPTIONS.map(office => (
                <SelectItem key={office} value={office}>
                  {office}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Grade"
              selectedKeys={gradeFilter ? [gradeFilter] : []}
              onChange={(e) => setGradeFilter(e.target.value)}
              classNames={{ trigger: 'h-12' }}
            >
              {GRADE_OPTIONS.map(grade => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </Select>

            <Button
              color="default"
              variant="flat"
              onPress={handleReset}
              className="h-12"
            >
              Reset Filters
            </Button>
          </div>

          <div className="mt-4 text-sm text-foreground/60">
            Showing {filteredPoliticians.length} of {politicians.length} politicians
            {filteredPoliticians.length > itemsPerPage && ` (page ${currentPage} of ${totalPages})`}
          </div>
        </CardBody>
      </Card>

      {/* Results Table */}
      <Card>
        <CardBody className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="text-left p-4 font-semibold">Name</th>
                  <th className="text-left p-4 font-semibold">State</th>
                  <th className="text-left p-4 font-semibold">District</th>
                  <th className="text-left p-4 font-semibold">Office</th>
                  <th className="text-left p-4 font-semibold">Grade</th>
                </tr>
              </thead>
              <tbody>
                {filteredPoliticians.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-foreground/60">
                      No politicians found matching your filters
                    </td>
                  </tr>
                ) : (
                  paginatedPoliticians.map((politician, index) => (
                    <tr
                      key={politician.id}
                      className="border-b border-divider hover:bg-default-100 transition-colors"
                    >
                      <td className="p-4">{politician.name}</td>
                      <td className="p-4">{STATE_MAP[politician.state] || politician.state}</td>
                      <td className="p-4">{politician.district || '—'}</td>
                      <td className="p-4">{politician.office}</td>
                      <td className="p-4">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                          {politician.grade}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden">
            {filteredPoliticians.length === 0 ? (
              <div className="text-center p-8 text-foreground/60">
                No politicians found matching your filters
              </div>
            ) : (
              <div className="divide-y divide-divider">
                {paginatedPoliticians.map((politician) => (
                  <div
                    key={politician.id}
                    className="p-4 hover:bg-default-100 transition-colors"
                  >
                    <div className="font-semibold text-lg mb-3">{politician.name}</div>
                    <div className="grid grid-cols-2 gap-3 bg-default-50 -mx-4 px-4 py-3 rounded-lg text-sm">
                      <div>
                        <span className="text-xs font-semibold text-foreground/60 block mb-1">State</span>
                        <span className="font-medium">{STATE_MAP[politician.state] || politician.state}</span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground/60 block mb-1">District</span>
                        <span className="font-medium">{politician.district || '—'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground/60 block mb-1">Office</span>
                        <span className="font-medium">{politician.office}</span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground/60 block mb-1">Grade</span>
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                          {politician.grade}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="flat"
            isDisabled={currentPage === 1}
            onPress={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show first, last, current, and pages around current
                return page === 1 ||
                       page === totalPages ||
                       Math.abs(page - currentPage) <= 1
              })
              .map((page, index, array) => {
                // Add ellipsis if there's a gap
                const prevPage = array[index - 1]
                const showEllipsis = prevPage && page - prevPage > 1

                return (
                  <div key={page} className="flex gap-2 items-center">
                    {showEllipsis && <span className="text-foreground/60">...</span>}
                    <Button
                      variant={currentPage === page ? 'solid' : 'flat'}
                      color={currentPage === page ? 'primary' : 'default'}
                      onPress={() => setCurrentPage(page)}
                      className="min-w-[44px]"
                    >
                      {page}
                    </Button>
                  </div>
                )
              })}
          </div>

          <Button
            variant="flat"
            isDisabled={currentPage === totalPages}
            onPress={() => setCurrentPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default function GradesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="text-2xl">Loading politicians...</div>
        </div>
      </div>
    }>
      <GradesContent />
    </Suspense>
  )
}
