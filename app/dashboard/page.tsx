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
  Building
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface MPI {
  _id: string
  mpiNumber: string
  mpiVersion: string
  customerId: {
    customerName: string
    assemblyName: string
  }
  status: 'draft' | 'in-review' | 'approved' | 'archived'
  createdAt: string
  updatedAt: string
}

interface User {
  _id: string
  fullName: string
  email: string
  title: string
}

interface Customer {
  _id: string
  customerName: string
  assemblyName: string
  assemblyRev: string
  drawingName: string
  drawingRev: string
  assemblyQuantity: number
  kitReceivedDate: string
  kitCompleteDate: string
  comments: string
  createdAt: string
}

export default function EngineerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [mpis, setMpis] = useState<MPI[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'mpis' | 'customers'>('mpis')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userData))
    fetchMPIs()
    fetchCustomers()
  }, [router])

  const fetchMPIs = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/mpi', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMpis(data.mpis || [])
      } else {
        toast.error('Failed to fetch MPIs')
      }
    } catch (error) {
      console.error('Error fetching MPIs:', error)
      toast.error('Error loading MPIs')
    }
  }

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      } else {
        toast.error('Failed to fetch customers')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Error loading customers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMPI = async (mpiId: string) => {
    if (!confirm('Are you sure you want to delete this MPI?')) return

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
      toast.error('Error deleting MPI')
    }
  }

  const filteredMPIs = mpis.filter(mpi => {
    const matchesSearch = mpi.mpiNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mpi.customerId.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mpi.customerId.assemblyName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || mpi.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.assemblyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.drawingName.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-500'
      case 'in-review': return 'bg-blue-500'
      case 'approved': return 'bg-green-500'
      case 'archived': return 'bg-gray-500'
      default: return 'bg-gray-500'
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

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg dark:gradient-bg">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-5 rounded-full floating"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-2s'}}></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-4s'}}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-1s'}}></div>
      </div>

      {/* Header */}
      <header className="glassmorphism p-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Engineer Dashboard</h1>
              <p className="text-white opacity-80">Welcome back, {user?.fullName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <User className="h-5 w-5" />
                <span>{user?.title}</span>
              </div>
              <Button 
                onClick={() => router.push('/customers/new')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Building className="h-4 w-4 mr-2" />
                New Customer
              </Button>
              <Button 
                onClick={() => router.push('/mpi/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New MPI
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-8">
        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="glassmorphism border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm">Total MPIs</p>
                  <p className="text-2xl font-bold text-white">{mpis.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm">Draft</p>
                  <p className="text-2xl font-bold text-white">
                    {mpis.filter(mpi => mpi.status === 'draft').length}
                  </p>
                </div>
                <Edit className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm">In Review</p>
                  <p className="text-2xl font-bold text-white">
                    {mpis.filter(mpi => mpi.status === 'in-review').length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm">Approved</p>
                  <p className="text-2xl font-bold text-white">
                    {mpis.filter(mpi => mpi.status === 'approved').length}
                  </p>
                </div>
                <Download className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glassmorphism rounded-xl p-6 mb-8"
        >
          <div className="flex space-x-1 mb-6">
            <Button
              variant={activeTab === 'mpis' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('mpis')}
              className={activeTab === 'mpis' ? 'bg-blue-600 text-white' : 'text-white hover:bg-white/20'}
            >
              <FileText className="h-4 w-4 mr-2" />
              MPIs ({mpis.length})
            </Button>
            <Button
              variant={activeTab === 'customers' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('customers')}
              className={activeTab === 'customers' ? 'bg-blue-600 text-white' : 'text-white hover:bg-white/20'}
            >
              <Building className="h-4 w-4 mr-2" />
              Customers ({customers.length})
            </Button>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glassmorphism rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white opacity-60" />
                <input
                  type="text"
                  placeholder={activeTab === 'mpis' ? "Search MPIs by number, customer, or assembly..." : "Search customers by name or assembly..."}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {activeTab === 'mpis' && (
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-white opacity-60" />
                <select
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="in-review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            )}
          </div>
        </motion.div>

        {/* Content List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {activeTab === 'mpis' ? (
            // MPIs List
            filteredMPIs.length === 0 ? (
              <Card className="glassmorphism border-white/20">
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-white opacity-40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No MPIs Found</h3>
                  <p className="text-white opacity-80 mb-6">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No MPIs match your search criteria.' 
                      : 'Get started by creating your first MPI.'}
                  </p>
                  <Button 
                    onClick={() => router.push('/mpi/new')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New MPI
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredMPIs.map((mpi, index) => (
                <motion.div
                  key={mpi._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="glassmorphism border-white/20 hover:bg-white/10 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="text-xl font-semibold text-white">
                              {mpi.mpiNumber}
                            </h3>
                            <Badge className={`${getStatusColor(mpi.status)} text-white`}>
                              {getStatusText(mpi.status)}
                            </Badge>
                            <span className="text-white opacity-60">v{mpi.mpiVersion}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white opacity-80">
                            <div>
                              <p className="font-medium">Customer: {mpi.customerId.customerName}</p>
                              <p>Assembly: {mpi.customerId.assemblyName}</p>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Created: {new Date(mpi.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Updated: {new Date(mpi.updatedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/mpi/view?id=${mpi._id}`)}
                          className="text-white hover:bg-white/20"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/mpi/${mpi._id}/edit`)}
                            className="text-white hover:bg-white/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMPI(mpi._id)}
                            className="text-red-400 hover:bg-red-400/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )
          ) : (
            // Customers List
            filteredCustomers.length === 0 ? (
              <Card className="glassmorphism border-white/20">
                <CardContent className="p-12 text-center">
                  <Building className="h-16 w-16 text-white opacity-40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Customers Found</h3>
                  <p className="text-white opacity-80 mb-6">
                    {searchTerm 
                      ? 'No customers match your search criteria.' 
                      : 'Get started by creating your first customer.'}
                  </p>
                  <Button 
                    onClick={() => router.push('/customers/new')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Create New Customer
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredCustomers.map((customer, index) => (
                <motion.div
                  key={customer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="glassmorphism border-white/20 hover:bg-white/10 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="text-xl font-semibold text-white">
                              {customer.customerName}
                            </h3>
                            <Badge className="bg-green-500 text-white">
                              {customer.assemblyQuantity} units
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white opacity-80">
                            <div>
                              <p className="font-medium">Assembly: {customer.assemblyName}</p>
                              <p>Drawing: {customer.drawingName}</p>
                              <p>Rev: {customer.assemblyRev}</p>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Created: {new Date(customer.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Kit Due: {new Date(customer.kitCompleteDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/mpi/new?customerId=${customer._id}`)}
                            className="text-blue-400 hover:bg-blue-400/20"
                            title="Create MPI for this customer"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/customers/${customer._id}/edit`)}
                            className="text-white hover:bg-white/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )
          )}
        </motion.div>
      </main>
    </div>
  )
}
