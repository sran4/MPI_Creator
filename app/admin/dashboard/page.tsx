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
  BarChart3,
  Database,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

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
  status: string
  createdAt: string
}

export default function AdminDashboardPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [mpis, setMpis] = useState<MPI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

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

      // Fetch MPIs
      const mpisResponse = await fetch('/api/mpi', {
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
            <p className="text-white opacity-80">Manage engineers, MPIs, and system settings</p>
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
                Add Step
              </Button>
            </Link>
          </div>
        </div>

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
                <Shield className="h-4 w-4 text-red-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">Online</div>
                <p className="text-xs text-white/60">
                  All systems operational
                </p>
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
                    <h3 className="text-lg font-semibold text-white">Global Steps</h3>
                    <p className="text-white/70 text-sm">Manage process steps library</p>
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
                    <h3 className="text-lg font-semibold text-white">Categories</h3>
                    <p className="text-white/70 text-sm">Manage step categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Engineers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Engineers</h2>
            <div className="space-y-4">
              {engineers.slice(0, 5).map((engineer) => (
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
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recent MPIs</h2>
            <div className="space-y-4">
              {mpis.slice(0, 5).map((mpi) => (
                <Card key={mpi._id} className="glassmorphism-card glassmorphism-card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                          <FileText className="h-5 w-5 text-red-300" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{mpi.mpiNumber}</h4>
                          <p className="text-sm text-white/70">
                            Created: {new Date(mpi.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={
                        mpi.status === 'approved' ? "bg-green-500/20 text-green-300 border-green-500/30" :
                        mpi.status === 'draft' ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" :
                        mpi.status === 'in-review' ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                        "bg-gray-500/20 text-gray-300 border-gray-500/30"
                      }>
                        {mpi.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}