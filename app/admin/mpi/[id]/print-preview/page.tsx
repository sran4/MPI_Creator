'use client'

import { Button } from '@/components/ui/button'
import {
    ArrowLeft,
    Download,
    MoveDown,
    MoveUp,
    RefreshCw,
    RotateCcw,
    Settings
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  formId?: {
    _id: string
    formId: string
    formRev: string
    description?: string
  }
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
  kitReceivedBy: string
  assemblyStartDate: string
  assemblyCompleteDate: string
  assemblyCompleteBy: string
  pages: number
  sections: MPISection[]
  customerCompanyId: CustomerCompany
  engineerId: {
    _id: string
    fullName: string
    email: string
  }
  createdAt: string
  updatedAt: string
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
  const [showControls, setShowControls] = useState(false)
  const [imageSizes, setImageSizes] = useState<{[key: string]: number}>({})
  const [sectionPageBreaks, setSectionPageBreaks] = useState<{[key: string]: boolean}>({})
  const [textSpacing, setTextSpacing] = useState(1)
  const router = useRouter()

  const fetchMPI = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/mpis/${params.id}`, {
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
      toast.error('Error loading MPI data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMPI()
  }, [params.id])

  const handlePrint = () => {
    window.print()
  }

  const toggleImageSize = (sectionId: string, imageIndex: number) => {
    const key = `${sectionId}-${imageIndex}`
    setImageSizes(prev => ({
      ...prev,
      [key]: prev[key] === 50 ? 100 : 50
    }))
  }

  const setImageSize = (sectionId: string, imageIndex: number, size: number) => {
    const key = `${sectionId}-${imageIndex}`
    setImageSizes(prev => ({
      ...prev,
      [key]: size
    }))
  }

  const toggleSectionPageBreak = (sectionId: string) => {
    setSectionPageBreaks(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const adjustTextSpacing = (spacing: number) => {
    setTextSpacing(spacing)
  }

  const resetAllControls = () => {
    setImageSizes({})
    setSectionPageBreaks({})
    setTextSpacing(1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading MPI...</div>
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

  // Human-readable Form ID (avoid falling back to Mongo ObjectId)
  const formIdValue = mpi.formId?.formId ?? 'N/A'
  const dateTimeValue = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
  console.log('🔍 Print Preview Debug:', {
    formIdValue,
    dateTimeValue,
    mpiFormId: mpi.formId,
    mpiId: mpi._id
  })

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Print-specific CSS for page numbering, Form ID, and date/time */}
      <style jsx global>{`
        @media print {
          /* Ensure containers don't clip content to a single page */
          .h-screen, .min-h-screen, .flex, .flex-1, .flex-col {
            height: auto !important;
            min-height: auto !important;
            display: block !important;
          }
          .overflow-y-auto, .overflow-auto, .overflow-y-scroll, .overflow-scroll {
            overflow: visible !important;
          }
          .max-w-4xl, .mx-auto, .p-6 {
            max-height: none !important;
          }
          @page {
            margin: 0.75in !important;
            size: 8.5in 11in !important;
            border: none !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            @top-left { content: ""; }
            @top-center { content: ""; }
            @top-right { content: ""; }
            @bottom-left {
              content: "Form ID: ${formIdValue}";
              font-size: 12pt;
              color: #000000 !important;
              font-family: Arial, sans-serif;
              font-weight: bold;
            }
            @bottom-center {
              content: "${dateTimeValue}";
              font-size: 12pt;
              color: #000000 !important;
              font-family: Arial, sans-serif;
              font-weight: bold;
            }
            @bottom-right {
              content: "Page " counter(page) " of " counter(pages);
              font-size: 12pt;
              color: #000000 !important;
              font-family: Arial, sans-serif;
              font-weight: bold;
            }
          }
          body {
            counter-reset: page;
            font-family: Arial, sans-serif;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          *, *::before, *::after {
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .print-section {
            break-inside: auto;
            page-break-inside: auto;
            margin-bottom: 1rem !important;
            padding-bottom: 1rem !important;
            page-break-before: auto !important;
          }
          .print-section:first-child {
            page-break-before: avoid !important;
            margin-top: 0 !important;
          }
          .print-section:last-child {
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
          }
          .print-section h3 {
            margin-bottom: 0.5rem !important;
            padding-bottom: 0.25rem !important;
          }
          .print-section .prose {
            margin-top: 0.5rem !important;
          }
          nav, header, .navbar, .nav-bar, .navigation, .header, .top-bar, .browser-chrome {
            display: none !important;
            visibility: hidden !important;
          }
          .print-controls-panel, .quick-actions-panel, .preview-header {
            display: none !important;
            visibility: hidden !important;
          }
          .min-h-screen {
            min-height: auto !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-preview-header {
            display: none !important;
          }
          .print-content {
            margin-top: 0 !important;
            padding-top: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          [class*="nav"], [class*="header"], [class*="navbar"], [class*="topbar"] {
            display: none !important;
            visibility: hidden !important;
          }
          .space-y-6 > * + * {
            margin-top: 1rem !important;
          }
          .space-y-4 > * + * {
            margin-top: 0.75rem !important;
          }
          .max-w-4xl {
            padding: 0.75rem !important;
          }
          .text-center.mb-8 {
            margin-bottom: 1rem !important;
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
          .interactive-text-spacing {
            line-height: ${textSpacing} !important;
          }
          .interactive-section-break {
            page-break-before: always !important;
          }
          .interactive-image-resize {
            max-width: ${imageSizes['image-0'] || 100}% !important;
            height: auto !important;
            object-fit: contain !important;
          }
          .image-size-25 { max-width: 25% !important; height: auto !important; object-fit: contain !important; }
          .image-size-50 { max-width: 50% !important; height: auto !important; object-fit: contain !important; }
          .image-size-75 { max-width: 75% !important; height: auto !important; object-fit: contain !important; }
          .image-size-100 { max-width: 100% !important; height: auto !important; object-fit: contain !important; }
        }
      `}</style>

      {/* Main Layout - Controls on left, Preview in center, Actions on right */}
      <div className="flex h-screen">
        {/* Left Controls Panel */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col print-controls-panel">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Print Controls</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowControls(!showControls)}
                className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Controls Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Text Spacing Controls */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">Text Spacing</h3>
              <div className="flex space-x-2">
                {[0.8, 1, 1.2, 1.5].map((spacing) => (
                  <Button
                    key={spacing}
                    variant={textSpacing === spacing ? "default" : "outline"}
                    size="sm"
                    onClick={() => adjustTextSpacing(spacing)}
                    className={`${
                      textSpacing === spacing 
                        ? "bg-blue-600 text-white" 
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {spacing}x
                  </Button>
                ))}
              </div>
            </div>

            {/* Section Management */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">Section Management</h3>
              <div className="space-y-2">
                {mpi.sections.map((section, index) => (
                  <div key={section.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 truncate">{section.title}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSectionPageBreak(section.id)}
                      className={`${
                        sectionPageBreaks[section.id] 
                          ? "bg-red-100 text-red-700 border-red-300" 
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {sectionPageBreaks[section.id] ? <MoveDown className="h-3 w-3" /> : <MoveUp className="h-3 w-3" />}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Sizing */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">Image Sizing</h3>
              <div className="space-y-2">
                {mpi.sections.map((section) => 
                  section.images.map((image, imageIndex) => (
                    <div key={`${section.id}-${imageIndex}`} className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-600 mb-2">Image {imageIndex + 1}</div>
                      <div className="flex space-x-1">
                        {[25, 50, 75, 100].map((size) => (
                          <Button
                            key={size}
                            variant="outline"
                            size="sm"
                            onClick={() => setImageSize(section.id, imageIndex, size)}
                            className={`${
                              imageSizes[`${section.id}-${imageIndex}`] === size 
                                ? "bg-blue-100 text-blue-700 border-blue-300" 
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {size}%
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={resetAllControls}
              className="w-full bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          </div>
        </div>

        {/* Center Preview Area */}
        <div className="flex-1 flex flex-col">
          {/* Preview Header */}
          <div className="bg-white border-b border-gray-200 p-4 preview-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href={`/admin/mpi/${params.id}/view`}>
                  <Button variant="outline" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to View
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Print Preview</h1>
                  <p className="text-sm text-gray-600">MPI: {mpi.mpiNumber}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={fetchMPI}
                  className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={handlePrint}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="max-w-4xl mx-auto p-6">
              {/* MPI Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4 text-gray-900">Manufacturing Process Instructions</h1>
              </div>

              {/* Assembly Details Section */}
              <div className="mb-8 border-2 border-gray-300 rounded-lg p-6 live-preview-section">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">Assembly Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900">
                  <div>
                    <span className="font-semibold">MPI Number:</span> {mpi.mpiNumber}
                  </div>
                  <div>
                    <span className="font-semibold">MPI Rev:</span> {mpi.mpiVersion}
                  </div>
                  <div>
                    <span className="font-semibold">Job No:</span> {mpi.jobNumber}
                  </div>
                  <div>
                    <span className="font-semibold">Old Job No:</span> {mpi.oldJobNumber || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Customer:</span> {mpi.customerCompanyId?.companyName || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Assembly Quantity:</span> {mpi.assemblyQuantity || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Customer Assembly Name:</span> {mpi.customerAssemblyName || 'N/A'}
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
                    <span className="font-semibold">Kit Received Date:</span> {mpi.kitReceivedDate || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Kit Received By:</span> {mpi.kitReceivedBy || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Assembly Start Date:</span> {mpi.assemblyStartDate || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Assembly Complete Date:</span> {mpi.assemblyCompleteDate || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Assembly Complete By:</span> {mpi.assemblyCompleteBy || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Pages:</span> {mpi.pages || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Engineer:</span> {mpi.engineerId?.fullName || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Form ID:</span> {mpi.formId?.formId || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Form Rev:</span> {mpi.formId?.formRev || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-6">
                {mpi.sections.map((section, sectionIndex) => (
                  <div
                    key={section.id}
                    className={`print-section border-2 border-gray-300 rounded-lg p-6 live-preview-section ${
                      sectionPageBreaks[section.id] ? 'interactive-section-break' : ''
                    }`}
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">{section.title}</h3>
                    <div className={`prose max-w-none interactive-text-spacing`}>
                      <div 
                        className="text-gray-900"
                        dangerouslySetInnerHTML={{
                          __html: section.content || 'No content available for this section.'
                        }}
                      />
                      
                      {/* Images */}
                      {section.images && section.images.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {section.images.map((image, imageIndex) => (
                            <div key={imageIndex} className="flex justify-center">
                              <img
                                src={image}
                                alt={`${section.title} - Image ${imageIndex + 1}`}
                                className={`max-w-full h-auto rounded border ${
                                  imageSizes[`${section.id}-${imageIndex}`] === 25 ? 'image-size-25' :
                                  imageSizes[`${section.id}-${imageIndex}`] === 50 ? 'image-size-50' :
                                  imageSizes[`${section.id}-${imageIndex}`] === 75 ? 'image-size-75' :
                                  imageSizes[`${section.id}-${imageIndex}`] === 100 ? 'image-size-100' :
                                  'interactive-image-resize'
                                }`}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Actions Panel */}
        <div className="w-64 bg-white border-l border-gray-200 flex flex-col quick-actions-panel">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>

          {/* Actions Content */}
          <div className="flex-1 p-4 space-y-4">
            <Button
              onClick={handlePrint}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Print Document
            </Button>

            <Link href={`/admin/mpi/${params.id}/view`} className="block">
              <Button
                variant="outline"
                className="w-full bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to View
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={fetchMPI}
              className="w-full bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Document Info</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Form ID: {formIdValue}</div>
                <div>Last Updated: {lastUpdated.toLocaleString()}</div>
                <div>Sections: {mpi.sections.length}</div>
                <div>Total Images: {mpi.sections.reduce((acc, section) => acc + (section.images?.length || 0), 0)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HTML Fallback Footer for Print */}
      <div className="hidden print:block fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black p-3 text-sm font-bold text-black">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="font-bold">Form ID: {formIdValue}</div>
          <div className="font-bold">{dateTimeValue}</div>
          <div className="font-bold">Page <span className="page-number">1</span></div>
        </div>
      </div>

      {/* Debug Footer for Preview */}
      <div className="print:hidden fixed bottom-0 left-0 right-0 bg-blue-100 border-t-2 border-blue-500 p-3 text-sm font-bold text-blue-900 z-50">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="font-bold">Form ID: {formIdValue}</div>
          <div className="font-bold">{dateTimeValue}</div>
          <div className="font-bold">Preview Mode</div>
        </div>
      </div>
    </div>
  )
}