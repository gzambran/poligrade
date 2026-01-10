'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardBody, Input, Select, SelectItem, Button } from '@nextui-org/react'
import { STATE_MAP, US_STATES, getGradeColor, formatOffice } from '@/lib/constants'

interface Politician {
  id: string
  name: string
  slug: string | null
  state: string
  district: string
  office: string
  status: string
  grade: string
  published: boolean
}

const GRADE_OPTIONS = ['Progressive', 'Liberal', 'Centrist', 'Moderate', 'Conservative', 'Nationalist']
const OFFICE_OPTIONS = ['All', 'N/A', 'Governor', 'Senator', 'House Representative']

interface GradesClientProps {
  politicians: Politician[]
}

export default function GradesClient({ politicians }: GradesClientProps) {
  const searchParams = useSearchParams()

  // Filter state
  const [nameQuery, setNameQuery] = useState('')
  const [debouncedNameQuery, setDebouncedNameQuery] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [officeFilter, setOfficeFilter] = useState('All')
  const [gradeFilter, setGradeFilter] = useState('')

  // Sort state - Initialize to match server-side default sort
  const [sortColumn, setSortColumn] = useState<'name' | 'state' | 'district' | 'office' | 'grade' | null>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  // Debounce name search
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedNameQuery(nameQuery)
    }, 300)

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [nameQuery])

  // Apply grade filter from URL on mount
  useEffect(() => {
    const gradeParam = searchParams.get('grade')
    if (gradeParam && GRADE_OPTIONS.includes(gradeParam)) {
      setGradeFilter(gradeParam)
    }
  }, [searchParams])

  // Sort function
  const handleSort = useCallback((column: 'name' | 'state' | 'district' | 'office' | 'grade') => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, default to ascending
      setSortColumn(column)
      setSortDirection('asc')
    }
  }, [sortColumn])

  // Filter and sort politicians
  const filteredPoliticians = useMemo(() => {
    let filtered = politicians.filter(p => {
      const matchesName = !debouncedNameQuery || p.name.toLowerCase().includes(debouncedNameQuery.toLowerCase())
      const matchesState = !stateFilter || p.state === stateFilter
      const matchesOffice = officeFilter === 'All' || formatOffice(p.office) === officeFilter
      const matchesGrade = !gradeFilter || p.grade === gradeFilter

      return matchesName && matchesState && matchesOffice && matchesGrade
    })

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number
        let bValue: string | number

        if (sortColumn === 'district') {
          // Numerical sorting for district
          // Handle empty districts (senators) - put them at the end
          const aDistrict = a.district && a.district !== '—' ? a.district : ''
          const bDistrict = b.district && b.district !== '—' ? b.district : ''

          if (!aDistrict && !bDistrict) return 0
          if (!aDistrict) return 1  // Empty districts go to end
          if (!bDistrict) return -1 // Empty districts go to end

          // Extract number from district string (e.g., "12", "At-Large")
          const aNum = aDistrict === 'At-Large' ? 999 : parseInt(aDistrict) || 0
          const bNum = bDistrict === 'At-Large' ? 999 : parseInt(bDistrict) || 0
          aValue = aNum
          bValue = bNum
        } else {
          // Alphabetical sorting for other columns
          aValue = a[sortColumn].toLowerCase()
          bValue = b[sortColumn].toLowerCase()
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [politicians, debouncedNameQuery, stateFilter, officeFilter, gradeFilter, sortColumn, sortDirection])

  // Summary counts by grade (politicians with an office)
  const summaryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    GRADE_OPTIONS.forEach(grade => { counts[grade] = 0 })

    filteredPoliticians
      .filter(p => p.office !== 'NONE')
      .forEach(p => {
        if (counts[p.grade] !== undefined) {
          counts[p.grade]++
        }
      })

    return counts
  }, [filteredPoliticians])

  // Reset filters
  const handleReset = useCallback(() => {
    setNameQuery('')
    setDebouncedNameQuery('')
    setStateFilter('')
    setOfficeFilter('All')
    setGradeFilter('')
    setSortColumn('name')
    setSortDirection('asc')
    setCurrentPage(1)
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedNameQuery, stateFilter, officeFilter, gradeFilter])

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
          View policy-based grades for politicians across the United States
        </p>
      </div>

      {/* Bar Chart */}
      <div className="mb-8">
        <Card className="p-6 shadow-xl">
          {/* Desktop: Vertical bars */}
          <div
            className="hidden md:flex justify-between items-end h-64 space-x-4 pt-10"
            role="img"
            aria-label={`Bar chart showing politician counts: ${GRADE_OPTIONS.map(g => `${g}: ${summaryCounts[g]}`).join(', ')}`}
          >
            {(() => {
              const counts = Object.values(summaryCounts)
              const maxCount = counts.length > 0 ? Math.max(...counts) : 1

              return GRADE_OPTIONS.map((grade) => {
                const count = summaryCounts[grade] || 0
                const { bg, text } = getGradeColor(grade)
                const height = Math.max(5, (count / maxCount) * 100)

                return (
                  <div key={grade} className="flex flex-col items-center justify-end h-full flex-1 min-w-[45px]">
                    <div className="text-xl font-bold mb-2" style={{ color: text }}>
                      {count}
                    </div>

                    <div
                      className="w-full rounded-t-lg shadow-md transition-all duration-700 ease-out"
                      style={{ height: `${height}%`, backgroundColor: bg }}
                    />

                    <div className="text-sm text-center pt-2 text-foreground/80">
                      {grade}
                    </div>
                  </div>
                )
              })
            })()}
          </div>

          {/* Mobile: Horizontal bars */}
          <div
            className="md:hidden flex flex-col space-y-3"
            role="img"
            aria-label={`Bar chart showing politician counts: ${GRADE_OPTIONS.map(g => `${g}: ${summaryCounts[g]}`).join(', ')}`}
          >
            {(() => {
              const counts = Object.values(summaryCounts)
              const maxCount = counts.length > 0 ? Math.max(...counts) : 1

              return GRADE_OPTIONS.map((grade) => {
                const count = summaryCounts[grade] || 0
                const { bg, text } = getGradeColor(grade)
                const width = Math.max(5, (count / maxCount) * 100)

                return (
                  <div key={grade} className="flex items-center gap-3">
                    <div className="w-24 text-sm font-medium text-right" style={{ color: text }}>
                      {grade}
                    </div>
                    <div className="flex-1 h-8 bg-default-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg shadow-md transition-all duration-700 ease-out"
                        style={{ width: `${width}%`, backgroundColor: bg }}
                      />
                    </div>
                    <div className="w-8 text-sm font-bold" style={{ color: text }}>
                      {count}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardBody className="p-6">
          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 items-center" role="search" aria-label="Filter politicians">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by name"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                aria-label="Filter politicians by name"
                classNames={{ input: 'text-base', inputWrapper: 'h-12' }}
                startContent={
                  <span className="text-xs text-foreground/60 font-medium">Name</span>
                }
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select
                placeholder="Select state"
                selectedKeys={stateFilter ? [stateFilter] : []}
                onChange={(e) => setStateFilter(e.target.value)}
                aria-label="Filter by state"
                classNames={{ trigger: 'h-12' }}
                startContent={
                  <span className="text-xs text-foreground/60 font-medium mr-2">State</span>
                }
              >
                {US_STATES.map(stateCode => (
                  <SelectItem key={stateCode} value={stateCode}>
                    {STATE_MAP[stateCode]}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select
                placeholder="All offices"
                selectedKeys={[officeFilter]}
                onChange={(e) => setOfficeFilter(e.target.value)}
                aria-label="Filter by office type"
                classNames={{ trigger: 'h-12' }}
                startContent={
                  <span className="text-xs text-foreground/60 font-medium mr-2">Office</span>
                }
              >
                {OFFICE_OPTIONS.map(office => (
                  <SelectItem key={office} value={office}>
                    {office}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select
                placeholder="All grades"
                selectedKeys={gradeFilter ? [gradeFilter] : []}
                onChange={(e) => setGradeFilter(e.target.value)}
                aria-label="Filter by political grade"
                classNames={{ trigger: 'h-12' }}
                startContent={
                  <span className="text-xs text-foreground/60 font-medium mr-2">Grade</span>
                }
              >
                {GRADE_OPTIONS.map(grade => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Sort Dropdown - Mobile Only */}
            <div className="flex-1 min-w-[200px] md:hidden">
              <Select
                placeholder="Sort by"
                selectedKeys={sortColumn ? [`${sortColumn}-${sortDirection}`] : []}
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    const [column, direction] = value.split('-') as [typeof sortColumn, 'asc' | 'desc']
                    setSortColumn(column)
                    setSortDirection(direction)
                  }
                }}
                aria-label="Sort results"
                classNames={{ trigger: 'h-12' }}
                startContent={
                  <span className="text-xs text-foreground/60 font-medium mr-2">Sort</span>
                }
              >
                <SelectItem key="name-asc" value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem key="name-desc" value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem key="state-asc" value="state-asc">State (A-Z)</SelectItem>
                <SelectItem key="state-desc" value="state-desc">State (Z-A)</SelectItem>
                <SelectItem key="district-asc" value="district-asc">District (Low-High)</SelectItem>
                <SelectItem key="district-desc" value="district-desc">District (High-Low)</SelectItem>
                <SelectItem key="office-asc" value="office-asc">Office (A-Z)</SelectItem>
                <SelectItem key="office-desc" value="office-desc">Office (Z-A)</SelectItem>
                <SelectItem key="grade-asc" value="grade-asc">Grade (A-Z)</SelectItem>
                <SelectItem key="grade-desc" value="grade-desc">Grade (Z-A)</SelectItem>
              </Select>
            </div>

            <Button
              color="default"
              variant="light"
              onPress={handleReset}
              className="h-12"
              aria-label="Clear all filters"
            >
              Reset
            </Button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-foreground/60">
              {filteredPoliticians.length} of {politicians.length} results
              {filteredPoliticians.length > itemsPerPage && ` • Page ${currentPage} of ${totalPages}`}
            </p>
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
                  <th className="text-left p-4 font-semibold w-auto min-w-[200px]">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      aria-label="Sort by name"
                    >
                      Name
                      <span className="text-sm opacity-60" aria-hidden="true">
                        {sortColumn === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    </button>
                  </th>
                  <th className="text-left p-4 font-semibold w-[180px] lg:w-[220px]">
                    <button
                      onClick={() => handleSort('state')}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      aria-label="Sort by state"
                    >
                      State
                      <span className="text-sm opacity-60" aria-hidden="true">
                        {sortColumn === 'state' ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    </button>
                  </th>
                  <th className="text-left p-4 font-semibold w-[120px] lg:w-[160px]">
                    <button
                      onClick={() => handleSort('district')}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      aria-label="Sort by district number"
                    >
                      District
                      <span className="text-sm opacity-60" aria-hidden="true">
                        {sortColumn === 'district' ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    </button>
                  </th>
                  <th className="text-left p-4 font-semibold w-[100px] lg:w-[200px]">
                    <button
                      onClick={() => handleSort('office')}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      aria-label="Sort by office"
                    >
                      Office
                      <span className="text-sm opacity-60" aria-hidden="true">
                        {sortColumn === 'office' ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    </button>
                  </th>
                  <th className="text-left p-4 font-semibold w-[120px]">
                    Status
                  </th>
                  <th className="text-left p-4 font-semibold w-[150px] lg:w-[180px]">
                    <button
                      onClick={() => handleSort('grade')}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      aria-label="Sort by grade"
                    >
                      Grade
                      <span className="text-sm opacity-60" aria-hidden="true">
                        {sortColumn === 'grade' ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPoliticians.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8">
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-foreground/80 font-medium">No politicians found matching your filters</p>
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={handleReset}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPoliticians.map((politician, index) => (
                    <tr
                      key={politician.id}
                      className="border-b border-divider hover:bg-default-100 transition-colors"
                    >
                      <td className="p-4">
                        {politician.published && politician.slug ? (
                          <Link
                            href={`/politicians/${politician.slug}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {politician.name}
                          </Link>
                        ) : (
                          politician.name
                        )}
                      </td>
                      <td className="p-4">{STATE_MAP[politician.state] || politician.state}</td>
                      <td className="p-4">{politician.district || '—'}</td>
                      <td className="p-4">{formatOffice(politician.office)}</td>
                      <td className="p-4">{politician.status !== 'None' ? politician.status : '—'}</td>
                      <td className="p-4">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                          style={{
                            backgroundColor: `${getGradeColor(politician.grade).bg}20`,
                            color: getGradeColor(politician.grade).text
                          }}
                        >
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
              <div className="text-center p-8">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-foreground/80 font-medium">No politicians found matching your filters</p>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={handleReset}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-divider">
                {paginatedPoliticians.map((politician) => (
                  <div
                    key={politician.id}
                    className="p-4 hover:bg-default-100 transition-colors"
                  >
                    <div className="font-semibold text-lg mb-3">
                      {politician.published && politician.slug ? (
                        <Link
                          href={`/politicians/${politician.slug}`}
                          className="text-primary hover:underline"
                        >
                          {politician.name}
                        </Link>
                      ) : (
                        politician.name
                      )}
                    </div>
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
                        <span className="font-medium">{formatOffice(politician.office)}</span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground/60 block mb-1">Status</span>
                        <span className="font-medium">{politician.status !== 'None' ? politician.status : '—'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs font-semibold text-foreground/60 block mb-1">Grade</span>
                        <span
                          className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                          style={{
                            backgroundColor: `${getGradeColor(politician.grade).bg}20`,
                            color: getGradeColor(politician.grade).text
                          }}
                        >
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
        <nav aria-label="Pagination navigation" className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="flat"
            isDisabled={currentPage === 1}
            onPress={() => setCurrentPage(p => p - 1)}
            aria-label="Go to previous page"
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
                    {showEllipsis && <span className="text-foreground/60" aria-hidden="true">...</span>}
                    <Button
                      variant={currentPage === page ? 'solid' : 'flat'}
                      color={currentPage === page ? 'primary' : 'default'}
                      onPress={() => setCurrentPage(page)}
                      className="min-w-[44px]"
                      aria-label={`Go to page ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
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
            aria-label="Go to next page"
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  )
}
