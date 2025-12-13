'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Spinner } from '@nextui-org/react'
import PoliticianForm from '@/components/PoliticianForm'
import { PoliticianFormData } from '@/lib/types'

export default function NewPoliticianPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin')
    }
  }, [status, router])

  const handleSave = async (data: PoliticianFormData) => {
    const response = await fetch('/api/admin/politicians', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create politician')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
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
          <span>New</span>
        </nav>
        <h1 className="text-3xl font-bold">Add New Politician</h1>
      </div>

      {/* Form */}
      <PoliticianForm onSave={handleSave} />
    </div>
  )
}
