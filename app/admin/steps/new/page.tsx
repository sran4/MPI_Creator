'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewStepPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new step management page
    router.replace('/admin/steps')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-xl">Redirecting to Step Management...</div>
    </div>
  )
}