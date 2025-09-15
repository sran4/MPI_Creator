'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText, 
  Settings, 
  Plus, 
  Search,
  Database,
  Folder,
  Trash2,
  Edit,
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Activity,
  File,
  Building
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Engineer {
  _id: string
  fullName: string
  email: string
  employeeId: string
  department: string
  isActive: boolean
  createdAt: string
}

interface Task {
  _id: string
  step: string
  categoryName: string
  usageCount: number
  isActive: boolean
  createdAt: string
}

interface Admin {
  _id: string
  email: string
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'engineers' | 'tasks'>('engineers')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchAdminData()
    fetchEngineers()
    fetchTasks()
  }, [router])

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setAdmin(result.user)
      } else {
        toast.error('Failed to fetch admin data')
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('An error occurred while fetching admin data')
      router.push('/login')
    }
  }

  const fetchEngineers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/engineers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setEngineers(result.engineers)
      } else {
        console.error('Failed to fetch engineers')
      }
    } catch (error) {
      console.error('Error fetching engineers:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/steps', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setTasks(result.steps)
      } else {
        console.error('Failed to fetch tasks')
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const filteredEngineers = engineers.filter(engineer =>
    engineer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engineer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engineer.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engineer.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTasks = tasks.filter(task =>
    task.step.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/70 mt-1">Welcome back, {admin?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-blue-600 hover:bg-blue-70  text-white hover:bg-white/10"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glassmorphism border-white/20 hover:border-white/40 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  Total Engineers
                </CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
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
            <Card className="glassmorphism border-white/20 hover:border-white/40 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  Tasks
                </CardTitle>
                <FileText className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{tasks.length}</div>
                <p className="text-xs text-white/60">
                  {tasks.filter(s => s.isActive).length} active
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glassmorphism border-white/20 hover:border-white/40 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  System Status
                </CardTitle>
                <Activity className="h-4 w-4 text-green-400" />
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
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link href="/admin/engineers/new">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Engineer
              </Button>
            </Link>
            <Link href="/admin/steps">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <FileText className="h-4 w-4 mr-2" />
                Manage Tasks
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                <Folder className="h-4 w-4 mr-2" />
                Manage Process Items
              </Button>
            </Link>
            <Link href="/admin/docs">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                <File className="h-4 w-4 mr-2" />
                Manage Docs
              </Button>
            </Link>
            <Link href="/admin/forms">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                <FileText className="h-4 w-4 mr-2" />
                Manage Forms
              </Button>
            </Link>
            <Link href="/admin/document-ids">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                <FileText className="h-4 w-4 mr-2" />
                Manage Document IDs
              </Button>
            </Link>
            <Link href="/admin/customer-companies">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                <Building className="h-4 w-4 mr-2" />
                Manage Customer Companies
              </Button>
            </Link>
            <Link href="/admin/test-models">
              <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
                <Database className="h-4 w-4 mr-2" />
                Test Models
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === 'engineers' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('engineers')}
            className={activeTab === 'engineers' 
              ? 'bg-blue-600 text-white' 
              : 'text-white hover:bg-white/10'
            }
          >
            <Users className="h-4 w-4 mr-2" />
            Engineers ({engineers.length})
          </Button>
          <Button
            variant={activeTab === 'tasks' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('tasks')}
            className={activeTab === 'tasks' 
              ? 'bg-blue-600 text-white' 
              : 'text-white hover:bg-white/10'
            }
          >
            <FileText className="h-4 w-4 mr-2" />
            Tasks ({tasks.length})
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === 'engineers' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEngineers.map((engineer, index) => (
              <motion.div
                key={engineer._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glassmorphism border-white/20 hover:border-white/40 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg flex items-center">
                          <User className="h-5 w-5 mr-2 text-blue-400" />
                          {engineer.fullName}
                        </CardTitle>
                        <div className="flex items-center mt-2">
                          <Mail className="h-4 w-4 mr-1 text-white/60" />
                          <span className="text-white/70 text-sm">{engineer.email}</span>
                        </div>
                      </div>
                      <Badge 
                        variant={engineer.isActive ? "default" : "secondary"}
                        className={engineer.isActive 
                          ? "bg-green-600 text-white" 
                          : "bg-gray-600 text-white"
                        }
                      >
                        {engineer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-white/70">
                        <span className="font-medium mr-2">ID:</span>
                        <span>{engineer.employeeId}</span>
                      </div>
                      <div className="flex items-center text-white/70">
                        <span className="font-medium mr-2">Dept:</span>
                        <span>{engineer.department}</span>
                      </div>
                      <div className="flex items-center text-white/70">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Joined {new Date(engineer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glassmorphism border-white/20 hover:border-white/40 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-green-400" />
                          Task
                        </CardTitle>
                        <div className="flex items-center mt-2">
                          <Folder className="h-4 w-4 mr-1 text-white/60" />
                          <span className="text-white/70 text-sm">{task.categoryName}</span>
                        </div>
                      </div>
                      <Badge 
                        variant={task.isActive ? "default" : "secondary"}
                        className={task.isActive 
                          ? "bg-green-600 text-white" 
                          : "bg-gray-600 text-white"
                        }
                      >
                        {task.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-white/80 text-sm mb-4 line-clamp-3">
                      {task.step}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-white/70">
                        <Users className="h-4 w-4 mr-1" />
                        {task.usageCount} uses
                      </div>
                      <div className="flex items-center text-white/70">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'engineers' && filteredEngineers.length === 0) || 
          (activeTab === 'tasks' && filteredTasks.length === 0)) && (
          <div className="text-center py-12">
            {activeTab === 'engineers' ? (
              <>
                <Users className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white/70 mb-2">No Engineers Found</h3>
                <p className="text-white/50 mb-6">Get started by adding your first engineer</p>
                <Link href="/admin/engineers/new">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Engineer
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <FileText className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white/70 mb-2">No Tasks Found</h3>
                <p className="text-white/50 mb-6">Get started by creating your first task</p>
                <Link href="/admin/steps">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <FileText className="h-4 w-4 mr-2" />
                    Manage Tasks
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}