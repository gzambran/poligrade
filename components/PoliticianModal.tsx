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
  Switch,
  Textarea,
  Accordion,
  AccordionItem,
  Divider,
} from '@nextui-org/react'
import {
  US_STATES,
  STATE_MAP,
  OFFICE_OPTIONS,
  STATUS_OPTIONS,
  GRADE_OPTIONS,
  PARTY_OPTIONS,
  RUNNING_FOR_OPTIONS,
  ISSUE_CRITERIA,
} from '@/lib/constants'
import { Politician, PoliticianFormData } from '@/lib/types'

interface PoliticianModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (politician: PoliticianFormData) => Promise<void>
  onDelete?: () => void
  politician?: Politician | null
}

const emptyFormData: PoliticianFormData = {
  name: '',
  state: '',
  district: null,
  office: '',
  status: '',
  grade: '',
  photoUrl: null,
  party: null,
  currentPosition: null,
  runningFor: null,
  published: false,
  economicPolicy: null,
  businessLabor: null,
  healthCare: null,
  education: null,
  environment: null,
  civilRights: null,
  votingRights: null,
  immigrationForeignAffairs: null,
  publicSafety: null,
}

export default function PoliticianModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  politician,
}: PoliticianModalProps) {
  const [formData, setFormData] = useState<PoliticianFormData>(emptyFormData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [photoError, setPhotoError] = useState(false)

  const isEditMode = !!politician

  useEffect(() => {
    if (politician) {
      setFormData({
        ...emptyFormData,
        ...politician,
      })
    } else {
      setFormData(emptyFormData)
    }
    setError('')
    setPhotoError(false)
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

  const updateIssueField = (key: string, value: string) => {
    setFormData({
      ...formData,
      [key]: value || null,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6",
      }}
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

            {/* Grade Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground/80">Grade Information</h3>

              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
                classNames={{ input: 'text-base', inputWrapper: 'h-12' }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="State"
                  selectedKeys={formData.state ? [formData.state] : []}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  isRequired
                  classNames={{ trigger: 'h-12' }}
                >
                  {US_STATES.map(stateCode => (
                    <SelectItem key={stateCode} value={stateCode}>
                      {STATE_MAP[stateCode]}
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
              </div>

              {showDistrictField && (
                <Input
                  label="District"
                  placeholder="e.g., 14, At-Large"
                  value={formData.district || ''}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value || null })}
                  classNames={{ input: 'text-base', inputWrapper: 'h-12' }}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <Divider className="my-6" />

            {/* Profile Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground/80">Profile Information</h3>

              {/* Photo URL with Preview */}
              <div className="flex gap-4 items-start">
                <Input
                  label="Photo URL"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.photoUrl || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, photoUrl: e.target.value || null })
                    setPhotoError(false)
                  }}
                  className="flex-1"
                  classNames={{ input: 'text-base', inputWrapper: 'h-12' }}
                />
                {formData.photoUrl && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-default-100 flex-shrink-0 border border-divider">
                    {!photoError ? (
                      <img
                        src={formData.photoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setPhotoError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-danger">
                        Invalid URL
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Party"
                  selectedKeys={formData.party ? [formData.party] : []}
                  onChange={(e) => setFormData({ ...formData, party: e.target.value || null })}
                  classNames={{ trigger: 'h-12' }}
                >
                  {PARTY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Running For"
                  selectedKeys={formData.runningFor ? [formData.runningFor] : ['']}
                  onChange={(e) => setFormData({ ...formData, runningFor: e.target.value || null })}
                  classNames={{ trigger: 'h-12' }}
                >
                  {RUNNING_FOR_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <Input
                label="Current Position"
                placeholder="e.g., Governor of California, U.S. Senator"
                value={formData.currentPosition || ''}
                onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value || null })}
                classNames={{ input: 'text-base', inputWrapper: 'h-12' }}
              />
            </div>

            <Divider className="my-6" />

            {/* Issue Positions Section */}
            <div>
              <h3 className="text-lg font-semibold text-foreground/80 mb-4">Policy Positions</h3>
              <p className="text-sm text-foreground/60 mb-4">
                Enter stances for each policy area. Start each stance with &quot;For&quot; or &quot;Against&quot;.
              </p>

              <Accordion variant="splitted" className="gap-2">
                {ISSUE_CRITERIA.map(({ key, label }) => (
                  <AccordionItem
                    key={key}
                    aria-label={label}
                    title={label}
                    classNames={{
                      title: 'text-base font-medium',
                      content: 'pt-0 pb-4',
                    }}
                    indicator={
                      (formData as any)[key] ? (
                        <span className="text-success text-xs font-medium">Has content</span>
                      ) : undefined
                    }
                  >
                    <Textarea
                      placeholder={`Enter ${label} positions...`}
                      value={(formData as any)[key] || ''}
                      onChange={(e) => updateIssueField(key, e.target.value)}
                      minRows={3}
                      classNames={{
                        input: 'text-base',
                      }}
                    />
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <Divider className="my-6" />

            {/* Published Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-default-100">
              <div>
                <p className="font-medium">Published</p>
                <p className="text-sm text-foreground/60">
                  When enabled, the profile page becomes accessible to the public
                </p>
              </div>
              <Switch
                isSelected={formData.published}
                onValueChange={(val) => setFormData({ ...formData, published: val })}
                color="success"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-between w-full">
              <div>
                {isEditMode && onDelete && (
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={onDelete}
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
