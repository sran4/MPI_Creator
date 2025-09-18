'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Building,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  FileText,
  Filter,
  Plus,
  Printer,
  Search,
  Trash2,
  User
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface MPI {
  _id: string
  mpiNumber: string
  mpiVersion: string
  jobNumber: string
  customerAssemblyName: string
  customerCompanyId?: {
    companyName: string
  }
  assemblyQuantity?: number
  status: 'draft' | 'in-review' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  engineerId: string
  engineerName?: string
}

interface User {
  _id: string
  fullName: string
  email: string
  userType: 'engineer' | 'admin'
  title?: string
}

export default function AllMPIsPage() {
  const [mpis, setMpis] = useState<MPI[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; mpiId: string | null; mpiNumber: string }>({
    isOpen: false,
    mpiId: null,
    mpiNumber: ''
  })
  const router = useRouter()

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    }
  }

  const fetchMPIs = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/mpi", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMpis(data.mpis || [])
      }
    } catch (error) {
      console.error("Error fetching MPIs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMPI = async (mpiId: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/mpi/${mpiId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        setMpis(prev => prev.filter(mpi => mpi._id !== mpiId))
        closeDeleteModal()
      }
    } catch (error) {
      console.error("Error deleting MPI:", error)
    }
  }

  const openDeleteModal = (mpiId: string, mpiNumber: string) => {
    setDeleteModal({
      isOpen: true,
      mpiId,
      mpiNumber
    })
  }

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      mpiId: null,
      mpiNumber: ''
    })
  }

  useEffect(() => {
    fetchUser()
    fetchMPIs()
  }, [])

  const filteredMPIs = mpis.filter(mpi => {
    const matchesSearch = mpi.mpiNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mpi.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mpi.customerAssemblyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (mpi.customerCompanyId?.companyName && mpi.customerCompanyId.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || mpi.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredMPIs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMPIs = filteredMPIs.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'in-review': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-5 rounded-full floating"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-2s'}}></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-4s'}}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-1s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">All MPIs</h1>
              <p className="text-white opacity-80">View and manage all your MPI/Traveler Combo documents</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <Link href="/mpi/new">
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create New MPI
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glassmorphism-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm">Total MPIs</p>
                  <p className="text-2xl font-bold text-white">{mpis.length}</p>
                </div>
                <FileText className="h-8 w-8 text-red-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm">Draft</p>
                  <p className="text-2xl font-bold text-white">
                    {mpis.filter(mpi => mpi.status === 'draft').length}
                  </p>
                </div>
                <Edit className="h-8 w-8 text-red-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm">In Review</p>
                  <p className="text-2xl font-bold text-white">
                    {mpis.filter(mpi => mpi.status === 'in-review').length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-red-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm">Approved</p>
                  <p className="text-2xl font-bold text-white">
                    {mpis.filter(mpi => mpi.status === 'approved').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-red-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search MPIs by number, job, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 backdrop-blur-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-white/50" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-red-400 focus:ring-red-400/20 backdrop-blur-sm"
            >
              <option value="all" className="bg-red-500/20 text-white">All Status</option>
              <option value="draft" className="bg-red-500/20 text-white">Draft</option>
              <option value="in-review" className="bg-red-500/20 text-white">In Review</option>
              <option value="approved" className="bg-red-500/20 text-white">Approved</option>
              <option value="rejected" className="bg-red-500/20 text-white">Rejected</option>
            </select>
          </div>
        </div>

        {/* MPIs List */}
        {filteredMPIs.length === 0 ? (
          <Card className="glassmorphism-card">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No MPIs Found</h3>
              <p className="text-white/70 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No MPIs match your current search criteria.' 
                  : 'Get started by creating your first MPI/Traveler Combo document.'
                }
              </p>
              <Link href="/mpi/new">
                <Button className="bg-red-500 hover:bg-red-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First MPI/Traveler Combo
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {paginatedMPIs.map((mpi) => (
              <motion.div
                key={mpi._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="glassmorphism-card glassmorphism-card-hover p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {mpi.mpiNumber} {mpi.mpiVersion ? `Rev ${mpi.mpiVersion}` : ''}
                        </h3>
                        <p className="text-white/70 text-sm">Job: {mpi.jobNumber}</p>
                      </div>
                      {mpi.customerCompanyId && (
                        <div className="flex items-center text-white/80">
                          <User className="h-4 w-4 mr-2" />
                          <span className="text-sm">{mpi.customerCompanyId.companyName}</span>
                        </div>
                      )}
                      <div className="flex items-center text-white/80">
                        <Building className="h-4 w-4 mr-2" />
                        <span className="text-sm">{mpi.customerAssemblyName}</span>
                      </div>
                      
                      {mpi.assemblyQuantity && (
                        <div className="flex items-center text-white/80">
                          <span className="text-sm font-medium">Qty: {mpi.assemblyQuantity}</span>
                        </div>
                      )}
                      <div className="flex items-center text-white/80">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">                           
                         Updated: {new Date(mpi.updatedAt).toLocaleDateString()}         
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getStatusColor(mpi.status)} border`}>
                        {mpi.status.replace('-', ' ')}
                      </Badge>
                      
                      <div className="flex items-center space-x-2">
                        <Link 
                          href={`/mpi/${mpi._id}/edit`}
                          className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors inline-flex items-center justify-center relative group"
                          title="Edit MPI"
                        >
                          <Edit className="h-4 w-4" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-blue-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                            Edit MPI
                          </div>
                        </Link>
                        <Link 
                          href={`/mpi/${mpi._id}/print-preview`}
                          className="p-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors inline-flex items-center justify-center relative group"
                          title="Print Preview"
                        >
                          <Printer className="h-4 w-4" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-blue-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                            Print Preview
                          </div>
                        </Link>
                        <button
                          onClick={() => openDeleteModal(mpi._id, mpi.mpiNumber)}
                          className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors relative group"
                          title="Delete MPI"
                        >
                          <Trash2 className="h-4 w-4" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-blue-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                            Delete MPI
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {filteredMPIs.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className={currentPage === pageNum 
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : "text-white border-white/20 hover:bg-white/10"
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-white/10"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-white/70 text-sm">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredMPIs.length)} of {filteredMPIs.length} MPIs
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-red-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glassmorphism-card p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg mr-3">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Delete MPI</h3>
            </div>
            
            <p className="text-white/80 mb-6">
              Are you sure you want to delete <span className="font-semibold text-white">{deleteModal.mpiNumber}</span>? 
              This action cannot be undone and will permanently remove the MPI and all associated data.
            </p>
            
            <div className="flex space-x-3">
              <Button
                onClick={closeDeleteModal}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteModal.mpiId && handleDeleteMPI(deleteModal.mpiId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
