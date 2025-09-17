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
  documentId?: string
  images: string[]
}

interface CustomerCompany {
  _id: string
  companyName: string
}

interface MPI {
  _id: string
  formId?: string
  jobNumber: string
  oldJobNumber?: string
  mpiNumber: string
  mpiVersion: string
  customerAssemblyName: string
  assemblyRev: string
  drawingName: string
  drawingRev: string
  assemblyQuantity: number
  kitReceivedDate: string
  dateReleased: string
  pages: number
  customerCompanyId: CustomerCompany
  sections: MPISection[]
}

interface PrintPreviewPageProps {
  params: {
    id: string
  }
}

export default function PrintPreviewPage({ params }: PrintPreviewPageProps) {
  const [mpi, setMpi] = useState<MPI | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const router = useRouter()

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
        console.error('Failed to fetch MPI')
        toast.error('Failed to load MPI data')
      }
    } catch (error) {
      console.error('Error fetching MPI:', error)
      toast.error('An error occurred while loading MPI')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchMPI()
  }

  const handlePrint = () => {
    // Set document title to something neutral before printing
    const originalTitle = document.title
    document.title = 'Manufacturing Process Instructions'
    window.print()
    // Restore original title after printing
    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }

  useEffect(() => {
    fetchMPI()
    // Set a neutral document title
    document.title = 'Manufacturing Process Instructions'
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!mpi) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">MPI not found</div>
      </div>
    )
  }

  return (
    <>
      {/* Print-specific CSS for page numbering, Form ID, and date/time */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5in;
            size: 8.5in 11in;
            @top-left { content: ""; }
            @top-center { content: ""; }
            @top-right { content: ""; }
            @bottom-left {
              content: "Form ID: " attr(data-form-id);
              font-size: 10pt;
              color: #666;
              font-family: Arial, sans-serif;
            }
            @bottom-center {
              content: attr(data-print-date);
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
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-section {
            break-inside: avoid;
            margin-bottom: 1rem;
            page-break-inside: avoid;
          }
          .print-section:last-child {
            margin-bottom: 0;
          }
          /* Hide all browser UI elements */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          /* Hide navigation and browser chrome */
          nav, header, .navbar, .nav-bar, .navigation, .header, .top-bar, .browser-chrome {
            display: none !important;
            visibility: hidden !important;
          }
          /* Hide any elements with common navigation classes */
          [class*="nav"], [class*="header"], [class*="navbar"], [class*="topbar"] {
            display: none !important;
            visibility: hidden !important;
          }
          /* Ensure only our content is visible */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background: white !important;
          }
          @page {
            margin: 0.5in !important;
            border: none !important;
          }
        }
      `}</style>
      
      <div className="min-h-screen" data-form-id={mpi.formId.formId || mpi._id || 'N/A'} data-print-date={new Date().toLocaleDateString() + ', ' + new Date().toLocaleTimeString()}>
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
          <div className="mb-8 border-2 border-gray-300 rounded-lg p-6 print:mb-6 print:rounded-none print-section">
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
                <span className="font-semibold">Assembly Quantity:</span> {mpi.assemblyQuantity}
              </div>
              <div>
                <span className="font-semibold">Customer Assembly Name:</span> {mpi.customerAssemblyName}
              </div>
              <div>
                <span className="font-semibold">Customer Assembly Rev:</span> {mpi.assemblyRev}
              </div>
              <div>
                <span className="font-semibold">Drawing Name:</span> {mpi.drawingName}
              </div>
              <div>
                <span className="font-semibold">Drawing Rev:</span> {mpi.drawingRev}
              </div>
              <div>
                <span className="font-semibold">Kit receive date:</span> {new Date(mpi.kitReceivedDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Kit release date:</span> {new Date(mpi.dateReleased).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6 print:space-y-4">
            {mpi.sections.map((section, index) => {
              console.log('🖨️ Print Preview - Section:', section.title, 'Document ID:', section.documentId)
              return (
                        <div key={section.id} className="border-2 border-gray-300 rounded-lg p-6 break-inside-avoid print:rounded-none print:mb-4 print-section">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2 flex justify-between items-center">
                  <span>{section.title}</span>
                  {section.documentId && (
                    <span className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg text-blue-800 text-sm font-medium">
                      {section.documentId}
                    </span>
                  )}
                </h3>
                {section.content && (
                  <div 
                    className="text-gray-900 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                )}
                {section.images && section.images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Images:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.images.map((image, imageIndex) => (
                        <div key={imageIndex} className="border rounded-lg p-2">
                          <img 
                            src={image} 
                            alt={`Section ${index + 1} Image ${imageIndex + 1}`}
                            className="w-full h-auto rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(!section.content || section.content.trim() === '') && (!section.images || section.images.length === 0) && (
                  <p className="text-gray-500 italic">No content added to this section yet.</p>
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