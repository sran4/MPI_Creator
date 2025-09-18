'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Archive, ArrowLeft, Building, Calendar, CheckCircle, Clock, Edit, FileText, Hash, Printer, User, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface MPI {
  _id: string
  mpiNumber: string
  jobNumber: string
  customerAssemblyName: string
  assemblyRev: string
  drawingName: string
  drawingRev: string
  assemblyQuantity: number
  kitReceivedDate: string
  dateReleased: string
  pages: string
  status: 'draft' | 'in-review' | 'approved' | 'rejected' | 'archived'
  createdAt: string
  updatedAt: string
  engineerId: {
    _id: string
    fullName: string
    email: string
  }
  customerCompanyId: {
    _id: string
    companyName: string
    city: string
    state: string
  }
  formId?: {
    _id: string
    formId: string
    formRev: string
    description?: string
  }
}

export default function AdminMPIViewPage() {
  const [mpi, setMpi] = useState<MPI | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    if (params.id) {
      fetchMPI()
    }
  }, [params.id])

  const fetchMPI = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/mpis/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setMpi(result.mpi)
      } else {
        toast.error('Failed to fetch MPI')
        router.push('/admin/dashboard')
      }
    } catch (error) {
      console.error('Error fetching MPI:', error)
      toast.error('An error occurred while fetching MPI')
      router.push('/admin/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!mpi) return

    setIsUpdating(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/mpis', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mpiId: mpi._id,
          status: newStatus
        })
      })

      if (response.ok) {
        const result = await response.json()
        setMpi(result.mpi)
        toast.success(`MPI status updated to ${newStatus}`)
      } else {
        toast.error('Failed to update MPI status')
      }
    } catch (error) {
      console.error('Error updating MPI status:', error)
      toast.error('An error occurred while updating MPI status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-600/20 text-green-300 border-green-500/30'
      case 'in-review':
        return 'bg-blue-600/20 text-blue-300 border-blue-500/30'
      case 'rejected':
        return 'bg-red-600/20 text-red-300 border-red-500/30'
      case 'archived':
        return 'bg-gray-600/20 text-gray-300 border-gray-500/30'
      default:
        return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'in-review':
        return <Clock className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      case 'archived':
        return <Archive className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white opacity-80">Loading MPI...</p>
        </div>
      </div>
    )
  }

  if (!mpi) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">MPI Not Found</h1>
          <p className="text-white/70 mb-6">The MPI you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/admin/dashboard">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg dark:gradient-bg">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-5 rounded-full floating"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white opacity-5 rounded-full floating" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-white opacity-5 rounded-full floating" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white opacity-5 rounded-full floating" style={{ animationDelay: '6s' }}></div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <FileText className="h-8 w-8 mr-3 text-red-300" />
                  MPI Details
                </h1>
                <p className="text-white/70 mt-1">View and manage MPI information</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(mpi.status)}>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(mpi.status)}
                  <span>{mpi.status.replace('-', ' ')}</span>
                </div>
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* MPI Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="text-white">MPI Information</CardTitle>
                <CardDescription className="text-white/70">
                  Basic MPI details and specifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Hash className="h-5 w-5 text-red-300" />
                    <div>
                      <p className="text-white/70 text-sm">MPI Number</p>
                      <p className="text-white font-semibold">{mpi.mpiNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Hash className="h-5 w-5 text-red-300" />
                    <div>
                      <p className="text-white/70 text-sm">Job Number</p>
                      <p className="text-white font-semibold">{mpi.jobNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-red-300" />
                    <div>
                      <p className="text-white/70 text-sm">Customer Assembly</p>
                      <p className="text-white font-semibold">{mpi.customerAssemblyName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Hash className="h-5 w-5 text-red-300" />
                    <div>
                      <p className="text-white/70 text-sm">Assembly Revision</p>
                      <p className="text-white font-semibold">{mpi.assemblyRev}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-red-300" />
                    <div>
                      <p className="text-white/70 text-sm">Drawing Name</p>
                      <p className="text-white font-semibold">{mpi.drawingName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Hash className="h-5 w-5 text-red-300" />
                    <div>
                      <p className="text-white/70 text-sm">Drawing Revision</p>
                      <p className="text-white font-semibold">{mpi.drawingRev}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Hash className="h-5 w-5 text-red-300" />
                    <div>
                      <p className="text-white/70 text-sm">Assembly Quantity</p>
                      <p className="text-white font-semibold">{mpi.assemblyQuantity}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-red-300" />
                    <div>
                      <p className="text-white/70 text-sm">Estimated Pages</p>
                      <p className="text-white font-semibold">{mpi.pages}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="text-white">Dates</CardTitle>
                <CardDescription className="text-white/70">
                  Important dates and timelines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-red-300" />
                    <div>
                      <p className="text-white/70 text-sm">Kit Received Date</p>
                      <p className="text-white font-semibold">
                        {new Date(mpi.kitReceivedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-red-300" />
                    <div>
                      <p className="text-white/70 text-sm">Date Released</p>
                      <p className="text-white font-semibold">
                        {new Date(mpi.dateReleased).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-red-300" />
                    <div>
                      <p className="text-white/70 text-sm">Created</p>
                      <p className="text-white font-semibold">
                        {new Date(mpi.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-red-300" />
                    <div>
                      <p className="text-white/70 text-sm">Last Updated</p>
                      <p className="text-white font-semibold">
                        {new Date(mpi.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Company */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="text-white">Customer Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-red-300" />
                  <div>
                    <p className="text-white font-semibold">{mpi.customerCompanyId.companyName}</p>
                    <p className="text-white/70 text-sm">{mpi.customerCompanyId.city}, {mpi.customerCompanyId.state}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assigned Engineer */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="text-white">Assigned Engineer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-red-300" />
                  <div>
                    <p className="text-white font-semibold">{mpi.engineerId.fullName}</p>
                    <p className="text-white/70 text-sm">{mpi.engineerId.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Information */}
            {mpi.formId && (
              <Card className="glassmorphism-card">
                <CardHeader>
                  <CardTitle className="text-white">Form Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-red-300" />
                    <div>
                      <p className="text-white font-semibold">{mpi.formId.formId}</p>
                      <p className="text-white/70 text-sm">Rev: {mpi.formId.formRev}</p>
                      {mpi.formId.description && (
                        <p className="text-white/60 text-xs mt-1">{mpi.formId.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Management */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="text-white">Status Management</CardTitle>
                <CardDescription className="text-white/70">
                  Update MPI status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mpi.status !== 'approved' && (
                  <Button
                    onClick={() => handleUpdateStatus('approved')}
                    disabled={isUpdating}
                    className="w-full bg-green-600/20 text-green-300 border-green-500/30 hover:bg-green-600/30"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
                
                {mpi.status !== 'rejected' && (
                  <Button
                    onClick={() => handleUpdateStatus('rejected')}
                    disabled={isUpdating}
                    className="w-full bg-red-600/20 text-red-300 border-red-500/30 hover:bg-red-600/30"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                )}
                
                {mpi.status !== 'in-review' && (
                  <Button
                    onClick={() => handleUpdateStatus('in-review')}
                    disabled={isUpdating}
                    className="w-full bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mark for Review
                  </Button>
                )}
                
                {mpi.status !== 'archived' && (
                  <Button
                    onClick={() => handleUpdateStatus('archived')}
                    disabled={isUpdating}
                    className="w-full bg-gray-600/20 text-gray-300 border-gray-500/30 hover:bg-gray-600/30"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 <Link href={`/admin/mpi/${mpi._id}/edit`} className="block">
                   <Button
                     variant="outline"
                     className="w-full border-white/20 text-white hover:bg-white/10"
                   >
                     <Edit className="h-4 w-4 mr-2" />
                     Edit MPI
                   </Button>
                 </Link>
                 
                 <Link href={`/admin/mpi/${mpi._id}/print-preview`} className="block">
                   <Button
                     variant="outline"
                     className="w-full border-white/20 text-white hover:bg-white/10"
                   >
                     <Printer className="h-4 w-4 mr-2" />
                     Print Preview
                   </Button>
                 </Link>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
