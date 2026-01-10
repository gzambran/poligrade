'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
  Accordion,
  AccordionItem,
  Card,
  CardBody,
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
import { Politician, PoliticianFormData, parsePolicyField } from '@/lib/types'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'

interface PoliticianFormProps {
  politician?: Politician | null
  onSave: (data: PoliticianFormData) => Promise<void>
  onDelete?: () => Promise<void>
}

const emptyFormData: PoliticianFormData = {
  name: '',
  state: '',
  district: null,
  office: '',
  status: '',
  grade: 'PENDING',
  photoUrl: null,
  party: null,
  currentPosition: null,
  runningFor: null,
  runningForDistrict: null,
  published: false,
  economicPolicy: [],
  businessLabor: [],
  healthCare: [],
  education: [],
  environment: [],
  civilRights: [],
  votingRights: [],
  immigrationForeignAffairs: [],
  publicSafety: [],
}

export default function PoliticianForm({
  politician,
  onSave,
  onDelete,
}: PoliticianFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<PoliticianFormData>(emptyFormData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [photoError, setPhotoError] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const isEditMode = !!politician

  useEffect(() => {
    if (politician) {
      setFormData({
        ...emptyFormData,
        ...politician,
        // Parse policy fields from JSON strings to arrays
        economicPolicy: parsePolicyField(politician.economicPolicy),
        businessLabor: parsePolicyField(politician.businessLabor),
        healthCare: parsePolicyField(politician.healthCare),
        education: parsePolicyField(politician.education),
        environment: parsePolicyField(politician.environment),
        civilRights: parsePolicyField(politician.civilRights),
        votingRights: parsePolicyField(politician.votingRights),
        immigrationForeignAffairs: parsePolicyField(politician.immigrationForeignAffairs),
        publicSafety: parsePolicyField(politician.publicSafety),
      })
    } else {
      setFormData(emptyFormData)
    }
    setError('')
    setPhotoError(false)
  }, [politician])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.state || !formData.office || !formData.grade) {
      setError('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const dataToSave = {
        ...formData,
        status: formData.status || 'NONE',
      }
      await onSave(dataToSave)
      router.push('/admin/politicians')
    } catch (err: any) {
      setError(err.message || 'Failed to save politician')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    try {
      await onDelete()
      router.push('/admin/politicians')
    } catch (err: any) {
      setError(err.message || 'Failed to delete politician')
    }
    setShowDeleteModal(false)
  }

  const showDistrictField = formData.office === 'HOUSE_REPRESENTATIVE'
  const showRunningForDistrict = formData.runningFor === 'HOUSE_REPRESENTATIVE'

  // Policy list management helpers
  const getPolicyArray = (key: string): string[] => {
    return (formData as any)[key] || []
  }

  const addPolicyItem = (key: string) => {
    const current = getPolicyArray(key)
    setFormData({
      ...formData,
      [key]: [...current, ''],
    })
  }

  const updatePolicyItem = (key: string, index: number, value: string) => {
    const current = getPolicyArray(key)
    const updated = [...current]
    updated[index] = value
    setFormData({
      ...formData,
      [key]: updated,
    })
  }

  const removePolicyItem = (key: string, index: number) => {
    const current = getPolicyArray(key)
    const updated = current.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      [key]: updated,
    })
  }

  const hasNonEmptyPolicies = (key: string): boolean => {
    const arr = getPolicyArray(key)
    return arr.some(item => item.trim() !== '')
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="p-4 rounded-lg bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400 mb-6">
            {error}
          </div>
        )}

        {/* Grade Information Section */}
        <Card className="mb-6">
          <CardBody className="p-6">
            <h2 className="text-xl font-semibold mb-6">Grade Information</h2>

            <div className="space-y-4">
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
          </CardBody>
        </Card>

        {/* Profile Information Section */}
        <Card className="mb-6">
          <CardBody className="p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

            <div className="space-y-4">
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

              {showRunningForDistrict && (
                <Input
                  label="District"
                  placeholder="e.g., 14, At-Large"
                  value={formData.runningForDistrict || ''}
                  onChange={(e) => setFormData({ ...formData, runningForDistrict: e.target.value || null })}
                  classNames={{ input: 'text-base', inputWrapper: 'h-12' }}
                />
              )}

              <Input
                label="Current Position"
                placeholder="e.g., Governor of California, U.S. Senator"
                value={formData.currentPosition || ''}
                onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value || null })}
                classNames={{ input: 'text-base', inputWrapper: 'h-12' }}
              />
            </div>
          </CardBody>
        </Card>

        {/* Policy Positions Section */}
        <Card className="mb-6">
          <CardBody className="p-6">
            <h2 className="text-xl font-semibold mb-2">Policy Positions</h2>
            <p className="text-sm text-foreground/60 mb-6">
              Add individual stances for each policy area. Start each stance with &quot;For&quot; or &quot;Against&quot;.
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
                    indicator: 'data-[open=true]:rotate-0',
                  }}
                  indicator={
                    hasNonEmptyPolicies(key) ? (
                      <span className="text-success text-lg" aria-label="Has content">✓</span>
                    ) : undefined
                  }
                >
                  <div className="space-y-2">
                    {getPolicyArray(key).map((item, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          placeholder={`e.g., For expanding Medicare coverage`}
                          value={item}
                          onChange={(e) => updatePolicyItem(key, index, e.target.value)}
                          classNames={{ input: 'text-base', inputWrapper: 'h-10' }}
                          className="flex-1"
                        />
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          color="danger"
                          onPress={() => removePolicyItem(key, index)}
                          aria-label="Remove policy"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => addPolicyItem(key)}
                      className="mt-2"
                    >
                      + Add Policy
                    </Button>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </CardBody>
        </Card>

        {/* Published Toggle */}
        <Card
          className={`mb-8 border-l-4 ${
            formData.published
              ? 'border-l-success bg-success-50/50 dark:bg-success-900/10'
              : 'border-l-primary'
          }`}
        >
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">
                  {formData.published ? 'Published' : 'Ready to Publish?'}
                </p>
                <p className="text-sm text-foreground/60">
                  When enabled, the profile page becomes accessible to the public
                </p>
              </div>
              <Switch
                isSelected={formData.published}
                onValueChange={(val) => setFormData({ ...formData, published: val })}
                color="success"
                size="lg"
              />
            </div>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div>
            {isEditMode && onDelete && (
              <Button
                color="danger"
                variant="flat"
                onPress={() => setShowDeleteModal(true)}
                isDisabled={saving}
              >
                Delete Politician
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              as={Link}
              href="/admin/politicians"
              color="default"
              variant="flat"
              isDisabled={saving}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={saving}
              size="lg"
            >
              {isEditMode ? 'Save Changes' : 'Add Politician'}
            </Button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        politicianName={politician?.name || ''}
      />
    </>
  )
}
