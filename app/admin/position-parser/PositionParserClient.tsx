'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  Button,
  Input,
  Card,
  CardBody,
  Spinner,
  Checkbox,
  Autocomplete,
  AutocompleteItem,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { ISSUE_CRITERIA } from '@/lib/constants'
import { Politician, parsePolicyField } from '@/lib/types'
import type { ParserResponse, SSEEvent } from '@/lib/position-parser-types'

const MAX_URLS = 4

// Map category labels to database field keys
const CATEGORY_TO_KEY: Record<string, string> = {
  'Economic Policy': 'economicPolicy',
  'Business & Labor': 'businessLabor',
  'Health Care': 'healthCare',
  'Education': 'education',
  'Environment': 'environment',
  'Civil Rights': 'civilRights',
  'Voting Rights': 'votingRights',
  'Immigration & Foreign Affairs': 'immigrationForeignAffairs',
  'Public Safety': 'publicSafety',
}

export default function PositionParserClient() {
  const { data: session } = useSession()
  const [urls, setUrls] = useState<string[]>(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState<ParserResponse | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  // Politician selection
  const [politicians, setPoliticians] = useState<Politician[]>([])
  const [selectedPoliticianId, setSelectedPoliticianId] = useState<string | null>(null)
  const [loadingPoliticians, setLoadingPoliticians] = useState(true)

  // Position selection (index: boolean)
  const [selectedPositions, setSelectedPositions] = useState<Record<number, boolean>>({})

  // Category assignment (index: category key or "uncategorized")
  const [positionCategories, setPositionCategories] = useState<Record<number, string>>({})

  // Save state
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Fetch politicians on mount
  useEffect(() => {
    const fetchPoliticians = async () => {
      try {
        const response = await fetch('/api/admin/politicians')
        if (response.ok) {
          const data = await response.json()
          setPoliticians(data)
        }
      } catch (err) {
        console.error('Failed to fetch politicians:', err)
      } finally {
        setLoadingPoliticians(false)
      }
    }
    fetchPoliticians()
  }, [])

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls]
    newUrls[index] = value
    setUrls(newUrls)
  }

  const handleSubmit = async () => {
    const validUrls = urls.filter(url => url.trim())
    if (validUrls.length === 0) {
      setErrors(['Please enter at least one URL'])
      return
    }

    setLoading(true)
    setProgress('')
    setResult(null)
    setErrors([])
    setSelectedPositions({})
    setPositionCategories({})
    setSaveSuccess(false)

    const apiUrl = process.env.NEXT_PUBLIC_POSITION_PARSER_URL
    const apiKey = process.env.NEXT_PUBLIC_POSITION_PARSER_API_KEY

    if (!apiUrl) {
      setErrors(['Position Parser API URL not configured'])
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${apiUrl}/api/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'X-API-Key': apiKey }),
        },
        body: JSON.stringify({ urls: validUrls }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6)) as SSEEvent

              if (event.type === 'progress') {
                setProgress(event.message)
              } else if (event.type === 'result') {
                setResult(event.data)
                // Select all positions by default, all categories start as "uncategorized"
                const allSelected: Record<number, boolean> = {}
                const allCategories: Record<number, string> = {}
                ;(event.data.positions ?? []).forEach((_, idx) => {
                  allSelected[idx] = true
                  allCategories[idx] = 'uncategorized'
                })
                setSelectedPositions(allSelected)
                setPositionCategories(allCategories)
                if (event.data.warnings && event.data.warnings.length > 0) {
                  setErrors(event.data.warnings)
                }
              } else if (event.type === 'error') {
                setErrors([event.message])
              }
            } catch {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Unknown error occurred'])
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  const togglePosition = (index: number) => {
    setSelectedPositions(prev => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const updatePositionCategory = (index: number, categoryKey: string) => {
    setPositionCategories(prev => ({
      ...prev,
      [index]: categoryKey,
    }))
  }

  const isPositionSelected = (index: number): boolean => {
    return selectedPositions[index] || false
  }

  const getSelectedCount = (): number => {
    return Object.values(selectedPositions).filter(Boolean).length
  }

  const canSaveToProfile = (): boolean => {
    if (!selectedPoliticianId || getSelectedCount() === 0) return false

    // Check if any selected position has "uncategorized" category
    for (const [idx, isSelected] of Object.entries(selectedPositions)) {
      if (isSelected && positionCategories[Number(idx)] === 'uncategorized') {
        return false
      }
    }
    return true
  }

  const getValidationMessage = (): string | null => {
    if (!selectedPoliticianId) return 'Select a politician first'
    if (getSelectedCount() === 0) return 'Select at least one position'

    const uncategorizedCount = Object.entries(selectedPositions)
      .filter(([idx, isSelected]) => isSelected && positionCategories[Number(idx)] === 'uncategorized')
      .length

    if (uncategorizedCount > 0) {
      return `${uncategorizedCount} selected position${uncategorizedCount > 1 ? 's' : ''} need a category assigned`
    }

    return null
  }

  const handleAddToProfile = async () => {
    if (!selectedPoliticianId || !result) return

    setSaving(true)
    setErrors([])

    try {
      // Fetch current politician data
      const politicianRes = await fetch(`/api/admin/politicians/${selectedPoliticianId}`)
      if (!politicianRes.ok) throw new Error('Failed to fetch politician data')
      const politician: Politician = await politicianRes.json()

      // Build update payload with merged positions grouped by category
      const updateData: Record<string, string[]> = {}

      // Group selected positions by their assigned category
      const positionsByCategory: Record<string, string[]> = {}

      ;(result.positions ?? []).forEach((position, idx) => {
        if (!isPositionSelected(idx)) return

        const categoryKey = positionCategories[idx]
        if (!categoryKey || categoryKey === 'uncategorized') return

        if (!positionsByCategory[categoryKey]) {
          positionsByCategory[categoryKey] = []
        }
        positionsByCategory[categoryKey].push(position.stance)
      })

      // For each category with new positions, merge with existing
      for (const [fieldKey, newPositions] of Object.entries(positionsByCategory)) {
        // Get existing positions
        const existingRaw = (politician as any)[fieldKey]
        const existing = parsePolicyField(existingRaw)

        // Merge (append new to existing)
        updateData[fieldKey] = [...existing, ...newPositions]
      }

      // Update politician
      const updateRes = await fetch(`/api/admin/politicians/${selectedPoliticianId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!updateRes.ok) throw new Error('Failed to update politician')

      setSaveSuccess(true)
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Failed to save positions'])
    } finally {
      setSaving(false)
    }
  }

  const selectedPolitician = politicians.find(p => p.id === selectedPoliticianId)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold">Position Parser</h1>
        </div>
        <Button
          color="default"
          variant="flat"
          size="lg"
          onPress={() => signOut({ callbackUrl: '/admin' })}
        >
          Sign Out
        </Button>
      </div>

      {/* Politician Selection */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <h2 className="text-xl font-semibold mb-4">Select Politician</h2>
          {loadingPoliticians ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Loading politicians...</span>
            </div>
          ) : (
            <Autocomplete
              label="Politician"
              placeholder="Search by name..."
              selectedKey={selectedPoliticianId}
              onSelectionChange={(key) => setSelectedPoliticianId(key as string | null)}
              classNames={{ base: 'max-w-md' }}
            >
              {politicians.map((p) => (
                <AutocompleteItem key={p.id} value={p.id}>
                  {p.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>
          )}
        </CardBody>
      </Card>

      {/* URL Input Form */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <h2 className="text-xl font-semibold mb-4">Enter URLs to Analyze</h2>

          <div className="space-y-3 mb-4">
            {urls.map((url, index) => (
              <Input
                key={index}
                placeholder={`https://example.com/issues`}
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                aria-label={`URL ${index + 1}`}
                classNames={{ input: 'text-base', inputWrapper: 'h-12' }}
                startContent={
                  <span className="text-xs text-foreground/60 font-medium">URL {index + 1}</span>
                }
                isDisabled={loading}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              color="primary"
              size="lg"
              onPress={handleSubmit}
              isDisabled={loading || urls.every(u => !u.trim())}
            >
              {loading ? (
                <>
                  <Spinner size="sm" color="current" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                'Analyze Positions'
              )}
            </Button>
          </div>

          {/* Progress Display */}
          {progress && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-primary font-medium">{progress}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Errors/Warnings */}
      {errors.length > 0 && (
        <Card className="mb-6 border-warning">
          <CardBody className="p-4">
            <h3 className="font-semibold text-warning mb-2">Warnings</h3>
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm text-foreground/80">
                  {error}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* Success Message */}
      {saveSuccess && selectedPolitician && (
        <Card className="mb-6 border-success bg-success-50 dark:bg-success-900/20">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-success">Positions Added Successfully</h3>
                <p className="text-sm text-foreground/80">
                  {getSelectedCount()} positions added to {selectedPolitician.name}&apos;s profile
                </p>
              </div>
              <Button
                as="a"
                href={`/admin/politicians/${selectedPoliticianId}/edit`}
                target="_blank"
                color="success"
                variant="flat"
                size="sm"
              >
                View Profile
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardBody className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Extracted Positions
                  {result.politician_name && (
                    <span className="text-foreground/60 font-normal ml-2">
                      for {result.politician_name}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-foreground/60 mt-1">
                  {getSelectedCount()} of {result.positions?.length ?? 0} positions selected
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button
                  color="success"
                  size="lg"
                  onPress={handleAddToProfile}
                  isDisabled={!canSaveToProfile() || saving}
                  isLoading={saving}
                >
                  Add Selected to Profile
                </Button>
                {getValidationMessage() && (
                  <p className="text-xs text-warning">
                    {getValidationMessage()}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {(result.positions ?? []).map((position, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    isPositionSelected(index)
                      ? 'border-success bg-success-50 dark:bg-success-900/10'
                      : 'border-default-200 bg-default-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      isSelected={isPositionSelected(index)}
                      onValueChange={() => togglePosition(index)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium mb-2">{position.stance}</p>
                      {position.note && (
                        <p className="text-sm text-warning mb-2">
                          Note: {position.note}
                        </p>
                      )}
                      <div className="text-xs text-foreground/50 mb-3">
                        Sources:{' '}
                        {(position.source_urls ?? []).map((url, i) => (
                          <span key={url}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {url}
                            </a>
                            {i < (position.source_urls?.length ?? 0) - 1 && ', '}
                          </span>
                        ))}
                      </div>
                      <Select
                        label="Category"
                        placeholder="Select a category"
                        selectedKeys={positionCategories[index] ? [positionCategories[index]] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string
                          updatePositionCategory(index, selected)
                        }}
                        size="sm"
                        classNames={{ base: 'max-w-xs' }}
                        isRequired={isPositionSelected(index)}
                        items={[
                          { key: 'uncategorized', label: 'Uncategorized' },
                          ...ISSUE_CRITERIA.map(c => ({ key: c.key, label: c.label }))
                        ]}
                      >
                        {(item) => (
                          <SelectItem key={item.key}>
                            {item.label}
                          </SelectItem>
                        )}
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !result && errors.length === 0 && (
        <Card>
          <CardBody className="p-8 text-center">
            <p className="text-foreground/60">
              Select a politician, enter URLs above, and click &quot;Analyze Positions&quot; to extract policy positions.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
