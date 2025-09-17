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
  documentId?: string
}

interface MPI {
  _id: string
  jobNumber: string
  oldJobNumber?: string
  mpiNumber: string
  mpiVersion: string
  customerCompanyId: {
    companyName: string
    city: string
    state: string
  }
  customerAssemblyName: string
  assemblyRev: string
  drawingName: string
  drawingRev: string
  assemblyQuantity: number
  kitReceivedDate: string
  dateReleased: string
  pages: string
  formId?: string
  formRev?: string
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
        const mpiData = data.mpi
        
        // Fetch Docs record to get formId and formRev
        try {
          const docsResponse = await fetch(`/api/docs?mpiNo=${mpiData.mpiNumber}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (docsResponse.ok) {
            const docsData = await docsResponse.json()
            if (docsData.docs && docsData.docs.length > 0) {
              const doc = docsData.docs[0]
              mpiData.formId = doc.formId
              mpiData.formRev = doc.formRev
            }
          }
        } catch (docsError) {
          console.error('Error fetching Docs:', docsError)
          // Continue without form data
        }
        
        setMpi(mpiData)
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


  const handlePrint = () => {
    window.print()
  }

  const handleRefresh = () => {
    fetchMPI()
    toast.success('Print preview refreshed!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading print preview...</div>
      </div>
    )
  }

  if (!mpi) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-xl">MPI not found</div>
      </div>
    )
  }

  return (
    <>
      {/* Print-specific CSS for page numbering and Form ID */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5in;
            size: 8.5in 11in;
            @bottom-left {
              content: "Form ID: " attr(data-form-id);
              font-size: 10pt;
              color: #666;
              font-family: Arial, sans-serif;
            }
            @bottom-right {
              content: "Page " counter(page) " of " counter(pages);
              font-size: 10pt;
              color: #666;
              font-family: Arial, sans-serif;
            }
          }
          body {
            counter-reset: page;
            font-family: Arial, sans-serif;
          }
          .print-page {
            page-break-after: always;
          }
          .print-page:last-child {
            page-break-after: avoid;
          }
        }
      `}</style>
      
      <div className="min-h-screen" data-form-id={mpi.formId || 'N/A'}>
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
                className="bg-gray-600 border-gray-300 text-white hover:bg-gray-700"
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
        <div className="bg-white shadow-lg print:shadow-none print-page">
          {/* MPI Header */}
          <div className="text-center mb-8 pt-10 border-b-2 border-gray-300 pb-6 print:mb-6">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Manufacturing Process Instructions</h1>
          </div>

          {/* Customer Information */}
          <div className="mb-8 border-2 border-gray-300 rounded-lg p-6 print:mb-6 print:rounded-none print-page">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">Assembly Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900">
              <div>
                <span className="font-semibold">MPI Number:</span> {mpi.mpiNumber}
              </div>
              <div>
                <span className="font-semibold">MPI Rev:</span> {mpi.mpiVersion}
              </div>
              <div>
                <span className="font-semibold">Job No:</span> {mpi.jobNumber || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Old Job No:</span> {mpi.oldJobNumber || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Customer:</span> {mpi.customerCompanyId.companyName}
              </div>
              <div>
                <span className="font-semibold">Assembly Quantity:</span> {mpi.assemblyQuantity || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Customer Assembly Name:</span> {mpi.customerAssemblyName}
              </div>
              <div>
                <span className="font-semibold">Customer Assembly Rev:</span> {mpi.assemblyRev || 'N/A'}
              </div>  
              <div>
                <span className="font-semibold">Drawing Name:</span> {mpi.drawingName || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Drawing Rev:</span> {mpi.drawingRev || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Kit receive date:</span> {new Date(mpi.kitReceivedDate).toLocaleDateString() || 'N/A'}
              </div>              
              <div>
                <span className="font-semibold">Date Released:</span> {new Date(mpi.dateReleased).toLocaleDateString() || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Pages:</span> {mpi.pages || 'N/A'}
              </div>        
            
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6 print:space-y-4">
            {mpi.sections.map((section, index) => {
              console.log('🖨️ Print Preview - Section:', section.title, 'Document ID:', section.documentId)
              return (
              <div key={section.id} className="border-2 border-gray-300 rounded-lg p-6 break-inside-avoid print:rounded-none print:mb-4 print-page">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2 flex justify-between items-center">
                  <span>{section.title}</span>
                  {section.documentId && (
                    <span className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg text-blue-800 text-sm font-medium">
                      {section.documentId}
                    </span>
                  )}
                </h3>
                
                {section.content && (
                  <div className="text-gray-900">
                    <div 
                      className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 print:bg-white print:border-gray-300"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
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
              )
            })}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
