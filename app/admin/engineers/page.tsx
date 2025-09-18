'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Briefcase,
    Calendar,
    Edit,
    Lock,
    Mail,
    Plus,
    Save,
    Search,
    Shield,
    Trash2,
    User,
    Users,
    X
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface Engineer {
  _id: string
  fullName: string
  email: string
  title: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface EngineerForm {
  fullName: string
  email: string
  password?: string
  title: string
  isActive: boolean
}

export default function EngineersPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingEngineer, setEditingEngineer] = useState<Engineer | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; engineer: Engineer | null }>({
    isOpen: false,
    engineer: null
  })
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<EngineerForm>({
    defaultValues: {
      isActive: true
    }
  })

  useEffect(() => {
    fetchEngineers()
  }, [])

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
        setEngineers(result.engineers || [])
      } else {
        toast.error('Failed to fetch engineers')
      }
    } catch (error) {
      console.error('Error fetching engineers:', error)
      toast.error('An error occurred while fetching engineers')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: EngineerForm) => {
    console.log('Form submitted with data:', data)
    console.log('Editing engineer:', editingEngineer)
    
    try {
      const token = localStorage.getItem('token')
      const url = editingEngineer 
        ? `/api/admin/engineers/${editingEngineer._id}`
        : '/api/admin/engineers'
      
      const method = editingEngineer ? 'PUT' : 'POST'
      
      // Remove password from update if it's empty
      const submitData = { ...data }
      if (editingEngineer && !submitData.password) {
        delete submitData.password
      }

      console.log('Submitting to:', url, 'Method:', method, 'Data:', submitData)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()
      console.log('Response:', response.status, result)

      if (response.ok) {
        toast.success(editingEngineer ? 'Engineer updated successfully!' : 'Engineer created successfully!')
        fetchEngineers()
        reset()
        setIsCreating(false)
        setEditingEngineer(null)
      } else {
        toast.error(result.error || 'Failed to save engineer')
      }
    } catch (error) {
      console.error('Error saving engineer:', error)
      toast.error('An error occurred while saving engineer')
    }
  }

  const handleEdit = (engineer: Engineer) => {
    console.log('Edit button clicked for engineer:', engineer)
    setEditingEngineer(engineer)
    setValue('fullName', engineer.fullName)
    setValue('email', engineer.email)
    setValue('title', engineer.title)
    setValue('isActive', engineer.isActive)
    setValue('password', '') // Clear password field
    setIsCreating(true)
  }

  const handleDelete = async (engineer: Engineer) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/engineers/${engineer._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Engineer deleted successfully')
        fetchEngineers()
        setDeleteModal({ isOpen: false, engineer: null })
      } else {
        const result = await response.json()
        toast.error(result.error || 'Failed to delete engineer')
      }
    } catch (error) {
      console.error('Error deleting engineer:', error)
      toast.error('An error occurred while deleting engineer')
    }
  }

  const openDeleteModal = (engineer: Engineer) => {
    setDeleteModal({ isOpen: true, engineer })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, engineer: null })
  }

  const cancelEdit = () => {
    reset()
    setIsCreating(false)
    setEditingEngineer(null)
  }

  const filteredEngineers = engineers.filter(engineer =>
    engineer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engineer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engineer.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white opacity-80">Loading engineers...</p>
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
                  <Users className="h-8 w-8 mr-3 text-red-300" />
                  Manage Engineers
                </h1>
                <p className="text-white/70 mt-1">Create, edit, and manage engineer accounts</p>
              </div>
            </div>
            <Button
              onClick={() => {
                console.log('Add Engineer button clicked')
                setIsCreating(true)
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Engineer
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glassmorphism-card glassmorphism-card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Total Engineers</CardTitle>
                <Users className="h-4 w-4 text-red-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{engineers.length}</div>
                <p className="text-xs text-white/60">All engineers</p>
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
                <CardTitle className="text-sm font-medium text-white/70">Active Engineers</CardTitle>
                <Shield className="h-4 w-4 text-red-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {engineers.filter(e => e.isActive).length}
                </div>
                <p className="text-xs text-white/60">Currently active</p>
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
                <CardTitle className="text-sm font-medium text-white/70">Inactive Engineers</CardTitle>
                <User className="h-4 w-4 text-red-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {engineers.filter(e => !e.isActive).length}
                </div>
                <p className="text-xs text-white/60">Currently inactive</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Create/Edit Form */}
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  {editingEngineer ? <Edit className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                  {editingEngineer ? 'Edit Engineer' : 'Create New Engineer'}
                </CardTitle>
                <CardDescription className="text-white/70">
                  {editingEngineer ? 'Update engineer information' : 'Add a new engineer to the system'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter full name"
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-red-500 ${
                          errors.fullName ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        {...register('fullName', {
                          required: 'Full name is required',
                          minLength: {
                            value: 2,
                            message: 'Full name must be at least 2 characters'
                          },
                          maxLength: {
                            value: 100,
                            message: 'Full name cannot exceed 100 characters'
                          }
                        })}
                      />
                      {errors.fullName && (
                        <p className="text-red-400 text-sm flex items-center">
                          <span className="mr-1">⚠️</span>
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-red-500 ${
                          errors.email ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                            message: 'Please enter a valid email address'
                          }
                        })}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm flex items-center">
                          <span className="mr-1">⚠️</span>
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white flex items-center">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Title *
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="Enter job title"
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-red-500 ${
                          errors.title ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        {...register('title', {
                          required: 'Title is required',
                          minLength: {
                            value: 2,
                            message: 'Title must be at least 2 characters'
                          },
                          maxLength: {
                            value: 50,
                            message: 'Title cannot exceed 50 characters'
                          }
                        })}
                      />
                      {errors.title && (
                        <p className="text-red-400 text-sm flex items-center">
                          <span className="mr-1">⚠️</span>
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Password {editingEngineer ? '(leave blank to keep current)' : '*'}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder={editingEngineer ? "Enter new password (optional)" : "Enter password"}
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-red-500 ${
                          errors.password ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        {...register('password', editingEngineer ? {
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters'
                          }
                        } : {
                          required: 'Password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters'
                          }
                        })}
                      />
                      {errors.password && (
                        <p className="text-red-400 text-sm flex items-center">
                          <span className="mr-1">⚠️</span>
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Active Status */}
                  <div className="space-y-2">
                    <Label className="text-white flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Account Status
                    </Label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setValue('isActive', !watch('isActive'))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                          watch('isActive') ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            watch('isActive') ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-medium ${
                        watch('isActive') ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {watch('isActive') ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingEngineer ? 'Update Engineer' : 'Create Engineer'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
            <Input
              placeholder="Search engineers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-red-500"
            />
          </div>
        </motion.div>

        {/* Engineers List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {filteredEngineers.map((engineer) => (
            <Card key={engineer._id} className="glassmorphism-card glassmorphism-card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      <User className="h-6 w-6 text-red-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-white">{engineer.fullName}</h3>
                        <Badge className={engineer.isActive 
                          ? "bg-green-500/20 text-green-300 border-green-500/30" 
                          : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                        }>
                          {engineer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-6 mt-2">
                        <div className="flex items-center text-white/70">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="text-sm">{engineer.email}</span>
                        </div>
                        <div className="flex items-center text-white/70">
                          <Briefcase className="h-4 w-4 mr-2" />
                          <span className="text-sm">{engineer.title}</span>
                        </div>
                        <div className="flex items-center text-white/70">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">
                            Created: {new Date(engineer.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(engineer)}
                      className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteModal(engineer)}
                      className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredEngineers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No engineers found</h3>
              <p className="text-white/70 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first engineer.'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => {
                    console.log('Add Engineer button clicked (empty state)')
                    setIsCreating(true)
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Engineer
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && deleteModal.engineer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="glassmorphism-card max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trash2 className="h-5 w-5 mr-2 text-red-400" />
                  Delete Engineer
                </CardTitle>
                <CardDescription className="text-white/70">
                  Are you sure you want to delete this engineer? This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-white">{deleteModal.engineer.fullName}</h4>
                  <p className="text-white/70 text-sm">{deleteModal.engineer.email}</p>
                  <p className="text-white/60 text-sm">{deleteModal.engineer.title}</p>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={closeDeleteModal}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleDelete(deleteModal.engineer!)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
