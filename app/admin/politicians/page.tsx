'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import {
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  Spinner,
} from '@nextui-org/react'
import { US_STATES, STATE_MAP, OFFICE_OPTIONS, STATUS_OPTIONS, GRADE_OPTIONS, formatOffice, formatStatus, formatGrade, getGradeColor } from '@/lib/constants'
import PoliticianModal from '@/components/PoliticianModal'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'
import { Politician, PoliticianFormData } from '@/lib/types'

export default function AdminPoliticiansPage() {
  const { data: session } = useSession()
  const [politicians, setPoliticians] = useState<Politician[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPolitician, setSelectedPolitician] = useState<Politician | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Filter state
  const [nameFilter, setNameFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [officeFilter, setOfficeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  const fetchPoliticians = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (nameFilter) params.append('name', nameFilter)
      if (stateFilter) params.append('state', stateFilter)
      if (officeFilter) params.append('office', officeFilter)
      if (statusFilter) params.append('status', statusFilter)
      if (gradeFilter) params.append('grade', gradeFilter)

      const response = await fetch(`/api/admin/politicians?${params}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setPoliticians(data)
    } catch (error) {
      console.error('Error fetching politicians:', error)
    } finally {
      setLoading(false)
    }
  }, [nameFilter, stateFilter, officeFilter, statusFilter, gradeFilter])

  useEffect(() => {
    fetchPoliticians()
  }, [fetchPoliticians])

  const handleReset = () => {
    setNameFilter('')
    setStateFilter('')
    setOfficeFilter('')
    setStatusFilter('')
    setGradeFilter('')
    setCurrentPage(1)
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [nameFilter, stateFilter, officeFilter, statusFilter, gradeFilter])

  // Pagination calculations
  const totalPages = Math.ceil(politicians.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPoliticians = politicians.slice(startIndex, endIndex)

  const handleRowClick = (politician: Politician) => {
    setSelectedPolitician(politician)
  }

  const handleSave = async (politician: PoliticianFormData) => {
    if (politician.id) {
      // Update existing
      const response = await fetch(`/api/admin/politicians/${politician.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(politician),
      })

      if (!response.ok) {
        throw new Error('Failed to update politician')
      }
    } else {
      // Create new
      const response = await fetch('/api/admin/politicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(politician),
      })

      if (!response.ok) {
        throw new Error('Failed to create politician')
      }
    }

    // Refresh list
    await fetchPoliticians()
    setSelectedPolitician(null)
    setShowAddModal(false)
  }

  const handleDelete = async () => {
    if (!selectedPolitician) return

    const response = await fetch(`/api/admin/politicians/${selectedPolitician.id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete politician')
    }

    // Refresh list
    await fetchPoliticians()
    setSelectedPolitician(null)
    setShowDeleteModal(false)
  }

  const handleCloseEditModal = () => {
    setSelectedPolitician(null)
  }

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Politician Management</h1>
          <p className="text-foreground/60">
            Logged in as: {session?.user?.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            color="primary"
            size="lg"
            onPress={() => setShowAddModal(true)}
          >
            Add Politician
          </Button>
          <Button
            color="default"
            variant="flat"
            size="lg"
            onPress={() => signOut({ callbackUrl: '/admin' })}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-semibold">Filter Politicians</h2>
            <div className="text-sm text-foreground/60">
              {politicians.length} results
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </div>
          </div>

          {/* Search Inputs Row */}
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <Input
              placeholder="Search by name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              aria-label="Filter politicians by name"
              classNames={{ input: 'text-base', inputWrapper: 'h-12' }}
              startContent={
                <span className="text-xs text-foreground/60 font-medium">Name</span>
              }
            />

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

          {/* Filter Dropdowns Row */}
          <div className="flex flex-wrap gap-4 items-center" role="search" aria-label="Filter politicians">
            <div className="flex-1 min-w-[180px]">
              <Select
                placeholder="All offices"
                selectedKeys={officeFilter ? [officeFilter] : []}
                onChange={(e) => setOfficeFilter(e.target.value)}
                aria-label="Filter by office type"
                classNames={{ trigger: 'h-12' }}
                startContent={
                  <span className="text-xs text-foreground/60 font-medium mr-2">Office</span>
                }
              >
                {OFFICE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <Select
                placeholder="All statuses"
                selectedKeys={statusFilter ? [statusFilter] : []}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by politician status"
                classNames={{ trigger: 'h-12' }}
                startContent={
                  <span className="text-xs text-foreground/60 font-medium mr-2">Status</span>
                }
              >
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="flex-1 min-w-[180px]">
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
                {GRADE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="text-left p-4 font-semibold">Name</th>
                  <th className="text-left p-4 font-semibold">State</th>
                  <th className="text-left p-4 font-semibold">District</th>
                  <th className="text-left p-4 font-semibold">Office</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Grade</th>
                </tr>
              </thead>
              <tbody>
                {politicians.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8">
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-foreground/80 font-medium">No politicians found</p>
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
                  currentPoliticians.map((politician) => (
                    <tr
                      key={politician.id}
                      className="border-b border-divider hover:bg-default-100 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(politician)}
                    >
                      <td className="p-4">{politician.name}</td>
                      <td className="p-4">{STATE_MAP[politician.state] || politician.state}</td>
                      <td className="p-4">{politician.district || '—'}</td>
                      <td className="p-4">{formatOffice(politician.office)}</td>
                      <td className="p-4">{formatStatus(politician.status)}</td>
                      <td className="p-4">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                          style={{
                            backgroundColor: `${getGradeColor(formatGrade(politician.grade)).bg}20`,
                            color: getGradeColor(formatGrade(politician.grade)).text
                          }}
                        >
                          {formatGrade(politician.grade)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination navigation" className="flex justify-center items-center gap-2 mt-6">
          <Button
            size="sm"
            variant="flat"
            isDisabled={currentPage === 1}
            onPress={() => setCurrentPage(currentPage - 1)}
            aria-label="Go to previous page"
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const showPage =
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)

              // Show ellipsis
              const showEllipsisBefore = page === currentPage - 2 && currentPage > 3
              const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2

              if (!showPage && !showEllipsisBefore && !showEllipsisAfter) {
                return null
              }

              if (showEllipsisBefore || showEllipsisAfter) {
                return <span key={page} className="px-2" aria-hidden="true">...</span>
              }

              return (
                <Button
                  key={page}
                  size="sm"
                  variant={currentPage === page ? 'solid' : 'flat'}
                  color={currentPage === page ? 'primary' : 'default'}
                  onPress={() => setCurrentPage(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </Button>
              )
            })}
          </div>

          <Button
            size="sm"
            variant="flat"
            isDisabled={currentPage === totalPages}
            onPress={() => setCurrentPage(currentPage + 1)}
            aria-label="Go to next page"
          >
            Next
          </Button>
        </nav>
      )}

      {/* Add/Edit Modal */}
      <PoliticianModal
        isOpen={showAddModal || !!selectedPolitician}
        onClose={() => {
          setShowAddModal(false)
          setSelectedPolitician(null)
        }}
        onSave={handleSave}
        onDelete={handleOpenDeleteModal}
        politician={selectedPolitician}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        politicianName={selectedPolitician?.name || ''}
      />
    </div>
  )
}
