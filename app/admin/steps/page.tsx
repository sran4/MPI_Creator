'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Save, 
  X,
  FileText,
  Folder,
  Users,
  Search
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface ProcessItem {
  _id: string
  categoryName: string
}

interface Task {
  _id: string
  step: string
  categoryName: string
  processItem: ProcessItem
  usageCount: number
  createdAt: string
  updatedAt: string
}

interface TaskForm {
  step: string
  processItemId: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<ProcessItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [formData, setFormData] = useState<TaskForm>({
    step: '',
    processItemId: ''
  })
  const router = useRouter()

  useEffect(() => {
    fetchTasks()
    fetchCategories()
  }, [])

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
        toast.error('Failed to fetch tasks')
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('An error occurred while fetching tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setCategories(result.categories)
      } else {
        console.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          step: formData.step,
          processItemId: formData.processItemId
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Task created successfully!')
        setFormData({ step: '', processItemId: '' })
        setShowForm(false)
        fetchTasks()
      } else {
        toast.error(result.error || 'Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('An error occurred while creating task')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEdit = (task: Task) => {
    setFormData({
      step: task.step,
      processItemId: task.processItem._id
    })
    setIsEditing(task._id)
    setShowForm(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEditing) return
    setIsCreating(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/steps/${isEditing}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          step: formData.step,
          processItemId: formData.processItemId
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Task updated successfully!')
        setFormData({ step: '', processItemId: '' })
        setShowForm(false)
        setIsEditing(null)
        fetchTasks()
      } else {
        toast.error(result.error || 'Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('An error occurred while updating task')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string, stepContent: string) => {
    if (!confirm(`Are you sure you want to delete this task?\n\n"${stepContent.substring(0, 100)}${stepContent.length > 100 ? '...' : ''}"\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/steps/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Task deleted successfully!')
        fetchTasks()
      } else {
        toast.error(result.error || 'Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('An error occurred while deleting task')
    }
  }

  const resetForm = () => {
    setFormData({ step: '', processItemId: '' })
    setShowForm(false)
    setIsEditing(null)
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.step.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || task.processItem._id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const wordCount = formData.step.trim().split(/\s+/).filter(word => word.length > 0).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Task Management</h1>
              <p className="text-white/70 mt-1">Manage global tasks for your MPI system</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ colorScheme: 'dark' }}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id} className="bg-gray-800 text-white">
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {isEditing ? 'Edit Task' : 'Add New Task'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={isEditing ? handleUpdate : handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="processItemId" className="text-white">Process Item *</Label>
                  <select
                    id="processItemId"
                    value={formData.processItemId}
                    onChange={(e) => setFormData({ ...formData, processItemId: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ colorScheme: 'dark' }}
                    required
                  >
                    <option value="" className="bg-gray-800 text-white">Select a process item</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id} className="bg-gray-800 text-white">
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="step" className="text-white">Task Content *</Label>
                  <textarea
                    id="step"
                    value={formData.step}
                    onChange={(e) => setFormData({ ...formData, step: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                    placeholder="Enter task content (max 150 words)"
                    required
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-white/60">
                      {wordCount}/150 words
                    </p>
                    {wordCount > 150 && (
                      <p className="text-xs text-red-400">
                        Task content exceeds 150 words
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isCreating || wordCount > 150 || wordCount === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    {isCreating ? (
                      'Saving...'
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditing ? 'Update' : 'Create'}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Tasks Grid */}
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
                        <FileText className="h-5 w-5 mr-2 text-blue-400" />
                        Task
                      </CardTitle>
                      <div className="flex items-center mt-2">
                        <Folder className="h-4 w-4 mr-1 text-white/60" />
                        <span className="text-white/70 text-sm">{task.categoryName}</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(task)}
                        className="text-blue-400 hover:bg-blue-400/10 p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(task._id, task.step)}
                        className="text-red-400 hover:bg-red-400/10 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
                      <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/70 mb-2">No Tasks Found</h3>
            <p className="text-white/50 mb-6">Get started by creating your first task</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}