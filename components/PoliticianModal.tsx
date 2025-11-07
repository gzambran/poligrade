'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { US_STATES, OFFICE_OPTIONS, STATUS_OPTIONS, GRADE_OPTIONS } from '@/lib/constants'

interface Politician {
  id?: string
  name: string
  state: string
  district: string | null
  office: string
  status: string
  grade: string
}

interface PoliticianModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (politician: Politician) => Promise<void>
  onDelete?: () => void
  politician?: Politician | null
}

export default function PoliticianModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  politician,
}: PoliticianModalProps) {
  const [formData, setFormData] = useState<Politician>({
    name: '',
    state: '',
    district: null,
    office: '',
    status: '',
    grade: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEditMode = !!politician

  useEffect(() => {
    if (politician) {
      setFormData(politician)
    } else {
      setFormData({
        name: '',
        state: '',
        district: null,
        office: '',
        status: '',
        grade: '',
      })
    }
    setError('')
  }, [politician, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.state || !formData.office || !formData.grade) {
      setError('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      // Default status to NONE if not set
      const dataToSave = {
        ...formData,
        status: formData.status || 'NONE',
      }
      await onSave(dataToSave)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save politician')
    } finally {
      setSaving(false)
    }
  }

  const showDistrictField = formData.office === 'HOUSE_REPRESENTATIVE'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {isEditMode ? 'Edit Politician' : 'Add New Politician'}
          </ModalHeader>
          <ModalBody>
            {error && (
              <div className="p-4 rounded-lg bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400 mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
                classNames={{ input: 'text-base', inputWrapper: 'h-12' }}
              />

              <Select
                label="State"
                selectedKeys={formData.state ? [formData.state] : []}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                isRequired
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
                selectedKeys={formData.office ? [formData.office] : []}
                onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                isRequired
                classNames={{ trigger: 'h-12' }}
              >
                {OFFICE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>

              {showDistrictField && (
                <Input
                  label="District"
                  placeholder="e.g., 14, At-Large"
                  value={formData.district || ''}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value || null })}
                  classNames={{ input: 'text-base', inputWrapper: 'h-12' }}
                />
              )}

              <Select
                label="Status"
                selectedKeys={formData.status ? [formData.status] : []}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                selectedKeys={formData.grade ? [formData.grade] : []}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                isRequired
                classNames={{ trigger: 'h-12' }}
              >
                {GRADE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-between w-full">
              <div>
                {isEditMode && onDelete && (
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={() => {
                      onDelete()
                      onClose()
                    }}
                    isDisabled={saving}
                  >
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  color="default"
                  variant="flat"
                  onPress={onClose}
                  isDisabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={saving}
                >
                  {isEditMode ? 'Save Changes' : 'Add Politician'}
                </Button>
              </div>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
