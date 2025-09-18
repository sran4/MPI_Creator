'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import {
  Building,
  Calendar,
  CheckSquare,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Plus,
  Printer,
  Save,
  Search,
  Settings,
  Trash2,
  User,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface User {
  _id: string
  email: string
  fullName: string
  userType: "admin" | "engineer"
  title?: string
}

interface MPI {
  _id: string
  mpiNumber: string
  mpiVersion?: string
  jobNumber: string
  customerAssemblyName: string
  customerCompanyId?: {
    companyName: string
    city?: string
    state?: string
  }
  assemblyQuantity?: number
  status: 'draft' | 'in-review' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  engineerId: string
  engineerName?: string
}

export default function DashboardPage() {
  const [mpis, setMpis] = useState<MPI[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'mpis' | 'customers' | 'settings'>('mpis')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; mpiId: string | null; mpiNumber: string }>({
    isOpen: false,
    mpiId: null,
    mpiNumber: ''
  })
  const [passwordChangeModal, setPasswordChangeModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
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

  useEffect(() => {
    fetchUser()
    fetchMPIs()
  }, [])

  const fetchMPIs = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      console.log('🔍 Dashboard: Fetching MPIs with token:', token.substring(0, 20) + '...')

      const response = await fetch('/api/mpi', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('🔍 Dashboard: Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Dashboard: Received data:', data)
        console.log('🔍 Dashboard: MPIs count:', data.mpis?.length || 0)
        setMpis(data.mpis || [])
      } else if (response.status === 401) {
        console.log('🔍 Dashboard: Unauthorized, redirecting to login')
        localStorage.removeItem('token')
        router.push('/login')
      } else {
        const errorData = await response.json()
        console.log('🔍 Dashboard: Error response:', errorData)
        toast.error('Failed to fetch MPIs')
      }
    } catch (error) {
      console.error('🔍 Dashboard: Error fetching MPIs:', error)
      toast.error('An error occurred while fetching MPIs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMPI = async (mpiId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/mpi/${mpiId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('MPI deleted successfully')
        fetchMPIs()
        setDeleteModal({ isOpen: false, mpiId: null, mpiNumber: '' })
      } else {
        toast.error('Failed to delete MPI')
      }
    } catch (error) {
      console.error('Error deleting MPI:', error)
      toast.error('An error occurred while deleting the MPI')
    }
  }

  const openDeleteModal = (mpiId: string, mpiNumber: string) => {
    setDeleteModal({ isOpen: true, mpiId, mpiNumber })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, mpiId: null, mpiNumber: '' })
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long')
      return
    }

    setIsChangingPassword(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Password changed successfully!')
        setPasswordChangeModal(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(result.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('An error occurred while changing password')
    } finally {
      setIsChangingPassword(false)
    }
  }

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
      default: return 'bg-red-500/20 text-red-300 border-red-500/30'
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
            <div>
            <h1 className="text-3xl font-bold text-white mb-2">{user?.userType === "admin" ? "Admin Dashboard" : "Engineer Dashboard"}</h1>
            <p className="text-white opacity-80">Manage your MPI/Traveler Combo documents and tasks</p>
            </div>
          <div className="flex space-x-4">
            <Link href="/mpi/new">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create MPI / Traveler 
              </Button>
            </Link>
            <Link href="/tasks/new">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Add New Task
              </Button>
            </Link>
            <Link href="/customers/new">
              <Button 
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Building className="h-4 w-4 mr-2" />
                Add New Customer
              </Button>
            </Link>
          </div>
        </div>

        {/* Welcome Card */}
        {user && (
          <Card className="glassmorphism-card glassmorphism-card-hover mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <User className="h-8 w-8 text-blue-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Welcome back, {user.fullName}!</h2>
                    <p className="text-white/70">
                      {user.userType === "admin" ? "Administrator" : "Engineer"}
                      {user.title && ` • ${user.title}`}
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      {user.email}
                    </p>
            </div>
          </div>
                <div className="text-right">
                  <p className="text-white/60 text-sm">Last login</p>
                  <p className="text-white font-medium">{new Date().toLocaleDateString()}</p>
                </div>
        </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glassmorphism-card glassmorphism-card-hover">
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

          <Card className="glassmorphism-card glassmorphism-card-hover">
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

          <Card className="glassmorphism-card glassmorphism-card-hover">
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

          <Card className="glassmorphism-card glassmorphism-card-hover">
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

        {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6">
          <button
              onClick={() => setActiveTab('mpis')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'mpis' ? 'bg-red-500 text-white' : 'text-white hover:bg-white/20'
            }`}
          >
            <FileText className="h-4 w-4 mr-2 inline" />
            MPI/Traveler Combos
          </button>
          <button
              onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'customers' ? 'bg-red-500 text-white' : 'text-white hover:bg-white/20'
            }`}
          >
            <Users className="h-4 w-4 mr-2 inline" />
            Customers
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'settings' ? 'bg-red-500 text-white' : 'text-white hover:bg-white/20'
            }`}
          >
            <Settings className="h-4 w-4 mr-2 inline" />
            Settings
          </button>
          
          {/* View All MPIs Button */}
          <Link href="/mpis/all">
            <button className="px-4 py-2 rounded-lg font-medium transition-colors bg-purple-500 hover:bg-purple-600 text-white ml-4">
              <FileText className="h-4 w-4 mr-2 inline" />
              View All MPIs
            </button>
          </Link>
          </div>

        {/* Content based on active tab */}
        {activeTab === 'mpis' && (
          <div>
        {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Search MPIs by number, job, or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 backdrop-blur-sm"
                />
              </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-red-400 focus:ring-red-400/20 backdrop-blur-sm"
              >
                <option value="all" className="bg-red-500/20 text-white">All Status</option>
                <option value="draft" className="bg-red-500/20 text-white">Draft</option>
                <option value="in-review" className="bg-red-500/20 text-white">In Review</option>
                <option value="approved" className="bg-red-500/20 text-white">Approved</option>
                <option value="rejected" className="bg-red-500/20 text-white">Rejected</option>
                </select>
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
                              
                          >
                            <Printer className="h-4 w-4" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-blue-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              Print Preview
                            </div>
                            </Link>
                            <button
                              onClick={() => openDeleteModal(mpi._id, mpi.mpiNumber)}
                              className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors relative group"
                              
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
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    Previous
                  </Button>
                  
                  <span className="text-white/70 text-sm px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    Next
                  </Button>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-white/70 text-sm">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredMPIs.length)} of {filteredMPIs.length} MPIs
                  </span>
                  
                  <Link href="/mpis/all">
                    <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                      <FileText className="h-4 w-4 mr-2" />
                      View All MPIs
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Show View All button even when there are fewer than 10 MPIs */}
            {filteredMPIs.length <= itemsPerPage && filteredMPIs.length > 0 && (
              <div className="flex justify-center mt-6">
                <Link href="/mpis/all">
                  <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                    <FileText className="h-4 w-4 mr-2" />
                    View All MPIs
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'customers' && (
          <Card className="glassmorphism-card">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Customer Management</h3>
              <p className="text-white/70 mb-6">
                Manage your customer information and company details.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/customers">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    <Users className="h-4 w-4 mr-2" />
                    View All Customers
                  </Button>
                </Link>
                <Link href="/customers/new">
                  <Button className="bg-red-500 hover:bg-red-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Customer
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Account Information */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/70 text-sm">Full Name</Label>
                    <p className="text-white font-medium">{user?.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-white/70 text-sm">Email</Label>
                    <p className="text-white font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-white/70 text-sm">Role</Label>
                    <p className="text-white font-medium capitalize">{user?.userType}</p>
                  </div>
                  <div>
                    <Label className="text-white/70 text-sm">Title</Label>
                    <p className="text-white font-medium">{user?.title || 'Not specified'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

            {/* Security Settings */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Password</h4>
                    <p className="text-white/70 text-sm">Change your account password</p>
                  </div>
                  <Button 
                    onClick={() => setPasswordChangeModal(true)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
                </CardContent>
              </Card>
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
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {passwordChangeModal && (
        <div className="fixed inset-0 bg-red-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glassmorphism-card p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg mr-3">
                <Lock className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Change Password</h3>
            </div>
            
            <div className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-white">Current Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-white/50 hover:text-white/80 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                          </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white">New Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-white/50 hover:text-white/80 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                            </div>
                              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm New Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-white/50 hover:text-white/80 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                              </div>
                            </div>
                          </div>
            
            <div className="flex space-x-3 mt-6">
                          <Button
                onClick={() => {
                  setPasswordChangeModal(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
                          </Button>
                          <Button
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isChangingPassword ? 'Changing...' : 'Change Password'}
                          </Button>
                        </div>
                      </div>
        </div>
      )}
    </div>
  )
}