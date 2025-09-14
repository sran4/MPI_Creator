'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Download,
  RefreshCw,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface MPISection {
  id: string
  title: string
  content: string
  order: number
  isCollapsed: boolean
  images: string[]
}

interface MPI {
  _id: string
  mpiNumber: string
  mpiVersion: string
  customerId: {
    customerName: string
    assemblyName: string
  }
  sections: MPISection[]
  status: string
  createdAt: string
  updatedAt: string
}

export default function PrintPreviewPage({ params }: { params: { id: string } }) {
  const [mpi, setMpi] = useState<MPI | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const router = useRouter()

  useEffect(() => {
    fetchMPI()
    // Auto-refresh every 5 seconds to show real-time changes
    const interval = setInterval(() => {
      fetchMPI()
    }, 5000)

    return () => clearInterval(interval)
  }, [params.id])

  const fetchMPI = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/mpi/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMpi(data.mpi)
        setLastUpdated(new Date())
      } else {
        toast.error('Failed to fetch MPI')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching MPI:', error)
      toast.error('Error loading MPI')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'in-review': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'in-review': return 'In Review'
      case 'approved': return 'Approved'
      case 'archived': return 'Archived'
      default: return status
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleRefresh = () => {
    fetchMPI()
    toast.success('Print preview refreshed!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading print preview...</div>
      </div>
    )
  }

  if (!mpi) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-xl">MPI not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Print Preview Header - Hidden when printing */}
      <div className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/mpi/${params.id}/edit`}>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Print Preview</h1>
                <p className="text-sm text-gray-500">
                  Real-time preview • Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Preview Content */}
      <div className="max-w-4xl mx-auto p-6 print:p-0 print:max-w-none">
        <div className="bg-white shadow-lg print:shadow-none">
          {/* MPI Header */}
          <div className="text-center mb-8 border-b-2 border-gray-300 pb-6 print:mb-6">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Manufacturing Process Instructions</h1>
            <div className="flex items-center justify-center space-x-8 text-lg">
              <div>
                <span className="font-semibold">MPI Number:</span> {mpi.mpiNumber}
              </div>
              <div>
                <span className="font-semibold">Version:</span> {mpi.mpiVersion}
              </div>
              <div>
                <span className="font-semibold">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${getStatusColor(mpi.status)}`}>
                  {getStatusText(mpi.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-8 border-2 border-gray-300 rounded-lg p-6 print:mb-6 print:rounded-none">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900">
              <div>
                <span className="font-semibold">Customer:</span> {mpi.customerId.customerName}
              </div>
              <div>
                <span className="font-semibold">Assembly:</span> {mpi.customerId.assemblyName}
              </div>
              <div>
                <span className="font-semibold">Created:</span> {new Date(mpi.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Last Updated:</span> {new Date(mpi.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6 print:space-y-4">
            {mpi.sections.map((section, index) => (
              <div key={section.id} className="border-2 border-gray-300 rounded-lg p-6 break-inside-avoid print:rounded-none print:mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
                  {index + 1}. {section.title}
                </h3>
                
                {section.content && (
                  <div className="text-gray-900">
                    <h4 className="font-semibold mb-3 text-lg">Instructions:</h4>
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 whitespace-pre-wrap print:bg-white print:border-gray-300">
                      {section.content}
                    </div>
                  </div>
                )}

                {section.images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Images:</h4>
                    <div className="flex space-x-2">
                      {section.images.map((image, imgIndex) => (
                        <div key={imgIndex} className="w-20 h-20 bg-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center print:border-gray-400">
                          <ImageIcon className="h-8 w-8 text-gray-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!section.content && section.images.length === 0 && (
                  <div className="text-gray-500 italic">
                    No content added to this section yet.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
