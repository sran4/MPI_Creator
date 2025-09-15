'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  FileText, 
  Users, 
  Settings, 
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  User,
  Building,
  Printer,
  CheckSquare
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

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
  mpiRev: string
  jobNumber: string
  customerName: string
  customerCompanyName?: string
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

      const response = await fetch('/api/mpi', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMpis(data.mpis || [])
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
      } else {
        toast.error('Failed to fetch MPIs')
      }
    } catch (error) {
      console.error('Error fetching MPIs:', error)
      toast.error('An error occurred while fetching MPIs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMPI = async (mpiId: string) => {
    if (!confirm('Are you sure you want to delete this MPI? This action cannot be undone.')) {
      return
    }

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
      } else {
        toast.error('Failed to delete MPI')
      }
    } catch (error) {
      console.error('Error deleting MPI:', error)
      toast.error('An error occurred while deleting the MPI')
    }
  }

  const filteredMPIs = mpis.filter(mpi => {
    const matchesSearch = mpi.mpiNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mpi.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mpi.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || mpi.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

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
                New MPI/Traveler Combo
              </Button>
            </Link>
            <Link href="/tasks/new">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </Link>
            <Link href="/customers/new">
              <Button 
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Building className="h-4 w-4 mr-2" />
                New Customer
              </Button>
            </Link>
          </div>
        </div>

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
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMPIs.map((mpi) => (
                  <motion.div
                    key={mpi._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="glassmorphism-card glassmorphism-card-hover">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-white text-lg">
                              {mpi.mpiNumber} Rev {mpi.mpiRev}
                            </CardTitle>
                            <CardDescription className="text-white/70">
                              Job: {mpi.jobNumber}
                            </CardDescription>
                          </div>
                          <Badge className={`${getStatusColor(mpi.status)} border`}>
                            {mpi.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center text-white/80">
                            <Building className="h-4 w-4 mr-2" />
                            <span className="text-sm">{mpi.customerName}</span>
                          </div>
                          {mpi.customerCompanyName && (
                            <div className="flex items-center text-white/80">
                              <User className="h-4 w-4 mr-2" />
                              <span className="text-sm">{mpi.customerCompanyName}</span>
                            </div>
                          )}
                          <div className="flex items-center text-white/80">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm">
                              {new Date(mpi.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <Link href={`/mpi/${mpi._id}/view`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full border-white/20 text-white hover:bg-white/10">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/mpi/${mpi._id}/edit`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full border-white/20 text-white hover:bg-white/10">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMPI(mpi._id)}
                            className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
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
              <Link href="/customers/new">
                <Button className="bg-red-500 hover:bg-red-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Customer
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card className="glassmorphism-card">
            <CardContent className="p-12 text-center">
              <Settings className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Settings</h3>
              <p className="text-white/70 mb-6">
                Configure your account settings and preferences.
              </p>
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                <Settings className="h-4 w-4 mr-2" />
                Open Settings
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}