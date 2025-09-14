'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function MPIViewPage() {
  const [mpi, setMpi] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const mpiId = searchParams.get('id')

  useEffect(() => {
    if (mpiId) {
      fetchMPI()
    }
  }, [mpiId])

  const fetchMPI = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/mpi/${mpiId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMpi(data.mpi)
      } else {
        console.error('Failed to fetch MPI')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching MPI:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading MPI...</div>
      </div>
    )
  }

  if (!mpi) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">MPI not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Manufacturing Process Instructions (MPI)
          </h1>
          <h2 className="text-2xl font-semibold text-white opacity-90 mb-4">
            {mpi.customerId?.assemblyName || 'Assembly Name'}
          </h2>
          <div className="flex justify-center items-center space-x-4 text-white opacity-80">
            <span>MPI Number: {mpi.mpiNumber}</span>
            <span>•</span>
            <span>Version: {mpi.mpiVersion}</span>
            <span>•</span>
            <span>Status: {mpi.status}</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-white mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white opacity-80">
            <div>
              <p><strong>Customer:</strong> {mpi.customerId?.customerName || 'N/A'}</p>
              <p><strong>Assembly:</strong> {mpi.customerId?.assemblyName || 'N/A'}</p>
              <p><strong>Assembly Rev:</strong> {mpi.customerId?.assemblyRev || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Drawing:</strong> {mpi.customerId?.drawingName || 'N/A'}</p>
              <p><strong>Drawing Rev:</strong> {mpi.customerId?.drawingRev || 'N/A'}</p>
              <p><strong>Quantity:</strong> {mpi.customerId?.assemblyQuantity || 'N/A'} units</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
