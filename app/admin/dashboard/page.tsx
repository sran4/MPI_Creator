'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Engineer {
  _id: string
  fullName: string
  email: string
  title: string
  isActive: boolean
  createdAt: string
}

interface GlobalStep {
  _id: string
  title: string
  content: string
  category: string
  section: string
  usageCount: number
  isActive: boolean
  createdAt: string
}

interface Admin {
  _id: string
  email: string
  jobNo: string
  mpiNo: string
  mpiRev: string
  docId: string
  formId: string
  formRev: string
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [globalSteps, setGlobalSteps] = useState<GlobalStep[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'engineers' | 'steps'>('engineers')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    const userType = localStorage.getItem('userType')
    
    if (!token || !userData || userType !== 'admin') {
      router.push('/login')
      return
    }

    setAdmin(JSON.parse(userData))
    fetchEngineers()
    fetchGlobalSteps()
  }, [router])

  const fetchEngineers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/engineers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEngineers(data.engineers || [])
      } else {
        toast.error('Failed to fetch engineers')
      }
    } catch (error) {
      console.error('Error fetching engineers:', error)
      toast.error('Error loading engineers')
    }
  }

  const fetchGlobalSteps = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/steps', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setGlobalSteps(data.steps || [])
      } else {
        toast.error('Failed to fetch global steps')
      }
    } catch (error) {
      console.error('Error fetching global steps:', error)
      toast.error('Error loading global steps')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleEngineerStatus = async (engineerId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/engineers/${engineerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        toast.success(`Engineer ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
        fetchEngineers()
      } else {
        toast.error('Failed to update engineer status')
      }
    } catch (error) {
      console.error('Error updating engineer status:', error)
      toast.error('Error updating engineer status')
    }
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Are you sure you want to delete this global step?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/steps/${stepId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Global step deleted successfully')
        fetchGlobalSteps()
      } else {
        toast.error('Failed to delete global step')
      }
    } catch (error) {
      console.error('Error deleting global step:', error)
      toast.error('Error deleting global step')
    }
  }

  const filteredEngineers = engineers.filter(engineer =>
    engineer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engineer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engineer.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSteps = globalSteps.filter(step =>
    step.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    step.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    step.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    step.section.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-white opacity-80">System Administration & Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <Shield className="h-5 w-5" />
                <span>Administrator</span>
              </div>
              <Button 
                onClick={() => router.push('/admin/engineers/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Engineer
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
                  <p className="text-white opacity-80 text-sm">Total Engineers</p>
                  <p className="text-2xl font-bold text-white">{engineers.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm">Active Engineers</p>
                  <p className="text-2xl font-bold text-white">
                    {engineers.filter(e => e.isActive).length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm">Global Steps</p>
                  <p className="text-2xl font-bold text-white">{globalSteps.length}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm">Total Usage</p>
                  <p className="text-2xl font-bold text-white">
                    {globalSteps.reduce((sum, step) => sum + step.usageCount, 0)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-400" />
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
              variant={activeTab === 'engineers' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('engineers')}
              className={activeTab === 'engineers' ? 'bg-blue-600 text-white' : 'text-white hover:bg-white/20'}
            >
              <Users className="h-4 w-4 mr-2" />
              Engineers ({engineers.length})
            </Button>
            <Button
              variant={activeTab === 'steps' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('steps')}
              className={activeTab === 'steps' ? 'bg-blue-600 text-white' : 'text-white hover:bg-white/20'}
            >
              <FileText className="h-4 w-4 mr-2" />
              Global Steps ({globalSteps.length})
            </Button>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white opacity-60" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'engineers' ? (
            <div className="space-y-4">
              {filteredEngineers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-white opacity-40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Engineers Found</h3>
                  <p className="text-white opacity-80 mb-6">
                    {searchTerm ? 'No engineers match your search criteria.' : 'No engineers have been added yet.'}
                  </p>
                  <Button 
                    onClick={() => router.push('/admin/engineers/new')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Engineer
                  </Button>
                </div>
              ) : (
                filteredEngineers.map((engineer, index) => (
                  <motion.div
                    key={engineer._id}
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
                                {engineer.fullName}
                              </h3>
                              <Badge className={engineer.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                                {engineer.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white opacity-80">
                              <div>
                                <p><strong>Email:</strong> {engineer.email}</p>
                                <p><strong>Title:</strong> {engineer.title}</p>
                              </div>
                              <div className="text-sm">
                                <p><strong>Joined:</strong> {new Date(engineer.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleEngineerStatus(engineer._id, engineer.isActive)}
                              className={engineer.isActive ? 'text-red-400 hover:bg-red-400/20' : 'text-green-400 hover:bg-green-400/20'}
                            >
                              {engineer.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSteps.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-white opacity-40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Global Steps Found</h3>
                  <p className="text-white opacity-80 mb-6">
                    {searchTerm ? 'No steps match your search criteria.' : 'No global steps have been created yet.'}
                  </p>
                  <Button 
                    onClick={() => router.push('/admin/steps/new')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Step
                  </Button>
                </div>
              ) : (
                filteredSteps.map((step, index) => (
                  <motion.div
                    key={step._id}
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
                                {step.title}
                              </h3>
                              <Badge className="bg-blue-500 text-white">
                                {step.category}
                              </Badge>
                              <Badge className="bg-purple-500 text-white">
                                {step.section}
                              </Badge>
                            </div>
                            <p className="text-white opacity-80 mb-2">
                              {step.content.length > 150 ? `${step.content.substring(0, 150)}...` : step.content}
                            </p>
                            <div className="flex items-center space-x-4 text-white opacity-60 text-sm">
                              <span>Usage: {step.usageCount}</span>
                              <span>Created: {new Date(step.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/admin/steps/${step._id}/edit`)}
                              className="text-white hover:bg-white/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteStep(step._id)}
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
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
