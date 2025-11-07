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
import { US_STATES, OFFICE_OPTIONS, STATUS_OPTIONS, GRADE_OPTIONS, formatOffice, formatStatus, formatGrade } from '@/lib/constants'
import PoliticianModal from '@/components/PoliticianModal'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'

interface Politician {
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
  }

  const handleRowClick = (politician: Politician) => {
    setSelectedPolitician(politician)
  }

  const handleSave = async (politician: Politician) => {
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
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Input
              label="Search Name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              classNames={{ input: 'text-base', inputWrapper: 'h-12' }}
            />

            <Select
              label="State"
              selectedKeys={stateFilter ? [stateFilter] : []}
              onChange={(e) => setStateFilter(e.target.value)}
              classNames={{ trigger: 'h-12' }}
            >
              {US_STATES.map(state => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Office"
              selectedKeys={officeFilter ? [officeFilter] : []}
              onChange={(e) => setOfficeFilter(e.target.value)}
              classNames={{ trigger: 'h-12' }}
            >
              {OFFICE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Status"
              selectedKeys={statusFilter ? [statusFilter] : []}
              onChange={(e) => setStatusFilter(e.target.value)}
              classNames={{ trigger: 'h-12' }}
            >
              {STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Grade"
              selectedKeys={gradeFilter ? [gradeFilter] : []}
              onChange={(e) => setGradeFilter(e.target.value)}
              classNames={{ trigger: 'h-12' }}
            >
              {GRADE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>

            <Button
              color="default"
              variant="flat"
              onPress={handleReset}
              className="h-12"
            >
              Reset
            </Button>
          </div>

          <div className="mt-4 text-sm text-foreground/60">
            Showing {politicians.length} politician{politicians.length !== 1 ? 's' : ''}
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
                    <td colSpan={6} className="text-center p-8 text-foreground/60">
                      No politicians found. Click &quot;Add Politician&quot; to get started.
                    </td>
                  </tr>
                ) : (
                  politicians.map((politician) => (
                    <tr
                      key={politician.id}
                      className="border-b border-divider hover:bg-default-100 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(politician)}
                    >
                      <td className="p-4">{politician.name}</td>
                      <td className="p-4">{politician.state}</td>
                      <td className="p-4">{politician.district || '—'}</td>
                      <td className="p-4">{formatOffice(politician.office)}</td>
                      <td className="p-4">{formatStatus(politician.status)}</td>
                      <td className="p-4">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">
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
