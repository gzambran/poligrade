'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Spinner } from '@nextui-org/react'
import PoliticianForm from '@/components/PoliticianForm'
import { Politician, PoliticianFormData } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditPoliticianPage({ params }: PageProps) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [politician, setPolitician] = useState<Politician | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin')
      return
    }

    if (status === 'authenticated') {
      fetchPolitician()
    }
  }, [status, id])

  const fetchPolitician = async () => {
    try {
      const response = await fetch(`/api/admin/politicians?name=`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      const found = data.find((p: Politician) => p.id === id)
      if (!found) {
        setError('Politician not found')
      } else {
        setPolitician(found)
      }
    } catch (err) {
      setError('Failed to load politician')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: PoliticianFormData) => {
    const response = await fetch(`/api/admin/politicians/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update politician')
    }
  }

  const handleDelete = async () => {
    const response = await fetch(`/api/admin/politicians/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete politician')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="p-8 text-center">
          <p className="text-danger text-lg mb-4">{error}</p>
          <Link href="/admin/politicians" className="text-primary hover:underline">
            Back to Politicians
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-sm text-foreground/60 mb-2">
          <Link href="/admin/politicians" className="hover:text-primary">
            Politicians
          </Link>
          <span className="mx-2">/</span>
          <span>Edit</span>
        </nav>
        <h1 className="text-3xl font-bold">Edit Politician</h1>
        {politician && (
          <p className="text-foreground/60 mt-1">{politician.name}</p>
        )}
      </div>

      {/* Form */}
      <PoliticianForm
        politician={politician}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
