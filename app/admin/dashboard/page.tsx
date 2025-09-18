'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import {
  Archive,
  BarChart3,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Trash2,
  User,
  Users,
  XCircle
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

interface Engineer {
  _id: string
  fullName: string
  email: string
  title: string
  isActive: boolean
  createdAt: string
}

interface MPI {
  _id: string
  mpiNumber: string
  jobNumber: string
  status: 'draft' | 'in-review' | 'approved' | 'rejected' | 'archived'
  customerAssemblyName: string
  engineerId: {
    _id: string
    fullName: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export default function AdminDashboardPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [mpis, setMpis] = useState<MPI[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mpiSearchTerm, setMpiSearchTerm] = useState('')
  const [mpiStatusFilter, setMpiStatusFilter] = useState<string>('all')
  const [expandedMpi, setExpandedMpi] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'mpis' | 'engineers'>('mpis')
  const [mpiCurrentPage, setMpiCurrentPage] = useState(1)
  const [mpiItemsPerPage] = useState(8) // 8 MPIs per page for better visibility
  const [systemStatus, setSystemStatus] = useState({
    database: 'checking',
    api: 'checking',
    overall: 'checking'
  })
  const router = useRouter()

  useEffect(() => {
    fetchUser()
    fetchData()
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Check database connectivity
      const dbResponse = await fetch('/api/test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const dbStatus = dbResponse.ok ? 'online' : 'offline'

      // Check API responsiveness
      const apiResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const apiStatus = apiResponse.ok ? 'online' : 'offline'

      // Determine overall status
      const overallStatus = (dbStatus === 'online' && apiStatus === 'online') ? 'online' : 'offline'

      setSystemStatus({
        database: dbStatus,
        api: apiStatus,
        overall: overallStatus
      })
    } catch (error) {
      console.error('Error checking system status:', error)
      setSystemStatus({
        database: 'offline',
        api: 'offline',
        overall: 'offline'
      })
    }
  }

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

  const fetchData = async () => {
    try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

      // Fetch engineers
      const engineersResponse = await fetch('/api/admin/engineers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (engineersResponse.ok) {
        const engineersData = await engineersResponse.json()
        setEngineers(engineersData.engineers || [])
      }

      // Fetch MPIs for admin
      const mpisResponse = await fetch('/api/admin/mpis', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (mpisResponse.ok) {
        const mpisData = await mpisResponse.json()
        setMpis(mpisData.mpis || [])
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEngineer = async (engineerId: string) => {
    if (!confirm('Are you sure you want to delete this engineer? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/engineers/${engineerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Engineer deleted successfully')
        fetchData()
      } else {
        toast.error('Failed to delete engineer')
      }
    } catch (error) {
      console.error('Error deleting engineer:', error)
      toast.error('An error occurred while deleting the engineer')
    }
  }

  const handleUpdateMpiStatus = async (mpiId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/mpis', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mpiId, status: newStatus })
      })

      if (response.ok) {
        toast.success(`MPI status updated to ${newStatus.replace('-', ' ')}`)
        fetchData() // Refresh data
      } else {
        const result = await response.json()
        toast.error(result.error || 'Failed to update MPI status')
      }
    } catch (error) {
      console.error('Error updating MPI status:', error)
      toast.error('Failed to update MPI status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'in-review':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'archived':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      case 'in-review':
        return <Clock className="h-4 w-4" />
      case 'draft':
        return <FileText className="h-4 w-4" />
      case 'archived':
        return <Archive className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Filter MPIs based on search and status
  const filteredMpis = mpis.filter(mpi => {
    const matchesSearch = 
      mpi.mpiNumber.toLowerCase().includes(mpiSearchTerm.toLowerCase()) ||
      mpi.jobNumber.toLowerCase().includes(mpiSearchTerm.toLowerCase()) ||
      mpi.customerAssemblyName.toLowerCase().includes(mpiSearchTerm.toLowerCase()) ||
      mpi.engineerId.fullName.toLowerCase().includes(mpiSearchTerm.toLowerCase())
    
    const matchesStatus = mpiStatusFilter === 'all' || mpi.status === mpiStatusFilter
    
    return matchesSearch && matchesStatus
  })

  // Pagination logic for MPIs
  const mpiTotalPages = Math.ceil(filteredMpis.length / mpiItemsPerPage)
  const mpiStartIndex = (mpiCurrentPage - 1) * mpiItemsPerPage
  const mpiEndIndex = mpiStartIndex + mpiItemsPerPage
  const paginatedMpis = filteredMpis.slice(mpiStartIndex, mpiEndIndex)

  // Reset to first page when search term or status filter changes
  useEffect(() => {
    setMpiCurrentPage(1)
  }, [mpiSearchTerm, mpiStatusFilter])

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
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white opacity-80">
              Manage engineers, MPIs, and system settings
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/admin/engineers/new">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Engineer
              </Button>
            </Link>
            <Link href="/admin/steps/new">
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Tasks
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
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <Shield className="h-8 w-8 text-red-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Welcome back, {user.fullName}!</h2>
                    <p className="text-white/70">
                      Administrator
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glassmorphism-card glassmorphism-card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  Total Engineers
                </CardTitle>
                <Users className="h-4 w-4 text-red-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{engineers.length}</div>
                <p className="text-xs text-white/60">
                  {engineers.filter(e => e.isActive).length} active
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glassmorphism-card glassmorphism-card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  Total MPIs
                </CardTitle>
                <FileText className="h-4 w-4 text-red-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{mpis.length}</div>
                <p className="text-xs text-white/60">
                  All time created
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glassmorphism-card glassmorphism-card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  Active MPIs
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-red-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {mpis.filter(mpi => mpi.status === 'approved').length}
                </div>
                <p className="text-xs text-white/60">
                  Approved documents
                </p>
                <div className="flex space-x-2 mt-2">
                  <span className="text-xs text-green-300">
                    {mpis.filter(mpi => mpi.status === 'approved').length} approved
                  </span>
                  <span className="text-xs text-blue-300">
                    {mpis.filter(mpi => mpi.status === 'in-review').length} in review
                  </span>
                  <span className="text-xs text-red-300">
                    {mpis.filter(mpi => mpi.status === 'rejected').length} rejected
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glassmorphism-card glassmorphism-card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  System Status
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={checkSystemStatus}
                    className="text-white/70 hover:text-white hover:bg-white/10 p-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Shield className={`h-4 w-4 ${
                    systemStatus.overall === 'online' ? 'text-green-400' : 
                    systemStatus.overall === 'checking' ? 'text-yellow-400' : 'text-red-400'
                  }`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  systemStatus.overall === 'online' ? 'text-green-400' : 
                  systemStatus.overall === 'checking' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {systemStatus.overall === 'checking' ? 'Checking...' : 
                   systemStatus.overall === 'online' ? 'Online' : 'Offline'}
                </div>
                <p className="text-xs text-white/60">
                  {systemStatus.overall === 'checking' ? 'Checking system health...' :
                   systemStatus.overall === 'online' ? 'All systems operational' : 'System issues detected'}
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Database:</span>
                    <span className={`${
                      systemStatus.database === 'online' ? 'text-green-400' : 
                      systemStatus.database === 'checking' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {systemStatus.database}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">API:</span>
                    <span className={`${
                      systemStatus.api === 'online' ? 'text-green-400' : 
                      systemStatus.api === 'checking' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {systemStatus.api}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/engineers">
            <Card className="glassmorphism-card glassmorphism-card-hover cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-red-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Manage Engineers</h3>
                    <p className="text-white/70 text-sm">Add, edit, or remove engineers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>

            <Link href="/admin/steps">
            <Card className="glassmorphism-card glassmorphism-card-hover cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <Settings className="h-6 w-6 text-red-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Manage Tasks</h3>
                    <p className="text-white/70 text-sm">Manage process Tasks library</p>
          </div>
        </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/categories">
            <Card className="glassmorphism-card glassmorphism-card-hover cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <Database className="h-6 w-6 text-red-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Categories | Process Types</h3>
                    <p className="text-white/70 text-sm">Manage Process Items</p>
        </div>
          </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Tabbed Management Section */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white/10 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('mpis')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'mpis'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>MPI Management</span>
            </button>
            <button
              onClick={() => setActiveTab('engineers')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'engineers'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Recent Engineers</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'mpis' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">MPI Management</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search MPIs..."
                      value={mpiSearchTerm}
                      onChange={(e) => setMpiSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    />
                  </div>
                  <select
                    value={mpiStatusFilter}
                    onChange={(e) => setMpiStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="in-review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="archived">Archived</option>
                  </select>
                  <Link href="/admin/mpi/new">
                    <Button className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap">
                      <Plus className="h-4 w-4 mr-2" />
                      Create MPI
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="space-y-4">
                {paginatedMpis.map((mpi) => (
                  <Card key={mpi._id} className="glassmorphism-card glassmorphism-card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                            {getStatusIcon(mpi.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <h4 className="font-semibold text-white">{mpi.mpiNumber}</h4>
                              <span className="text-white/60">•</span>
                              <span className="text-white/70">{mpi.jobNumber}</span>
                            </div>
                            <p className="text-sm text-white/70 mt-1">
                              {mpi.customerAssemblyName} • {mpi.engineerId.fullName}
                            </p>
                            <p className="text-xs text-white/60">
                              Created: {new Date(mpi.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(mpi.status)}>
                            {mpi.status.replace('-', ' ')}
                          </Badge>
                          
                          <div className="flex items-center space-x-2">
                            {/* Status Action Buttons */}
                            {mpi.status !== 'approved' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateMpiStatus(mpi._id, 'approved')}
                                className="bg-green-600/20 text-green-300 border-green-500/30 hover:bg-green-600/30"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                            )}
                            
                            {mpi.status !== 'rejected' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateMpiStatus(mpi._id, 'rejected')}
                                className="bg-red-600/20 text-red-300 border-red-500/30 hover:bg-red-600/30"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            )}
                            
                            {mpi.status !== 'in-review' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateMpiStatus(mpi._id, 'in-review')}
                                className="bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                Review
                              </Button>
                            )}
                            
                            {mpi.status !== 'archived' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateMpiStatus(mpi._id, 'archived')}
                                className="bg-gray-600/20 text-gray-300 border-gray-500/30 hover:bg-gray-600/30"
                              >
                                <Archive className="h-3 w-3 mr-1" />
                                Archive
                              </Button>
                            )}
                            
                            <Link href={`/admin/mpi/${mpi._id}/view`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredMpis.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-white/40 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No MPIs found</h3>
                    <p className="text-white/70 mb-4">
                      {mpiSearchTerm || mpiStatusFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria.' 
                        : 'No MPIs have been created yet.'}
                    </p>
                    {!mpiSearchTerm && mpiStatusFilter === 'all' && (
                      <Link href="/admin/mpi/new">
                        <Button className="bg-red-600 hover:bg-red-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Create New MPI
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* MPI Pagination Controls */}
              {filteredMpis.length > mpiItemsPerPage && (
                <div className="flex flex-col items-center space-y-4 mt-8">
                  {/* Page Info */}
                  <div className="text-white/80 text-sm">
                    Showing {mpiStartIndex + 1}-{Math.min(mpiEndIndex, filteredMpis.length)} of {filteredMpis.length} MPIs
                  </div>
                  
                  {/* Pagination Buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMpiCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={mpiCurrentPage === 1}
                      className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, mpiTotalPages) }, (_, i) => {
                        let pageNum;
                        if (mpiTotalPages <= 5) {
                          pageNum = i + 1;
                        } else if (mpiCurrentPage <= 3) {
                          pageNum = i + 1;
                        } else if (mpiCurrentPage >= mpiTotalPages - 2) {
                          pageNum = mpiTotalPages - 4 + i;
                        } else {
                          pageNum = mpiCurrentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={mpiCurrentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMpiCurrentPage(pageNum)}
                            className={`w-8 h-8 p-0 ${
                              mpiCurrentPage === pageNum
                                ? "bg-red-600 text-white"
                                : "border-white/20 text-white hover:bg-white/10"
                            }`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMpiCurrentPage(prev => Math.min(prev + 1, mpiTotalPages))}
                      disabled={mpiCurrentPage === mpiTotalPages}
                      className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'engineers' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Recent Engineers</h2>
              <div className="space-y-4">
                {engineers.slice(0, 10).map((engineer) => (
                  <Card key={engineer._id} className="glassmorphism-card glassmorphism-card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-red-300" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{engineer.fullName}</h4>
                            <p className="text-sm text-white/70">{engineer.email}</p>
                            <p className="text-xs text-white/60">{engineer.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={engineer.isActive 
                            ? "bg-green-500/20 text-green-300 border-green-500/30" 
                            : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                          }>
                            {engineer.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEngineer(engineer._id)}
                            className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {engineers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-white/40 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No engineers found</h3>
                    <p className="text-white/70">No engineers have been created yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}