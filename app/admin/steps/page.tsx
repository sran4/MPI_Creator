'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Edit,
    FileText,
    Folder,
    Plus,
    Save,
    Search,
    Trash2,
    Users,
    X
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

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
  const [categoryPages, setCategoryPages] = useState<Record<string, number>>({})
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

  // Group tasks by category
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const categoryName = task.categoryName
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedTasks).sort()

  // Pagination logic
  const tasksPerPage = 5
  
  const getCurrentPage = (categoryName: string) => {
    return categoryPages[categoryName] || 1
  }

  const setCurrentPage = (categoryName: string, page: number) => {
    setCategoryPages(prev => ({
      ...prev,
      [categoryName]: page
    }))
  }

  const getPaginatedTasks = (categoryName: string) => {
    const tasks = groupedTasks[categoryName] || []
    const currentPage = getCurrentPage(categoryName)
    const startIndex = (currentPage - 1) * tasksPerPage
    const endIndex = startIndex + tasksPerPage
    return tasks.slice(startIndex, endIndex)
  }

  const getTotalPages = (categoryName: string) => {
    const tasks = groupedTasks[categoryName] || []
    return Math.ceil(tasks.length / tasksPerPage)
  }

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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Folder className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Categories</p>
                <p className="text-white text-xl font-semibold">{sortedCategories.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FileText className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Total Tasks</p>
                <p className="text-white text-xl font-semibold">{filteredTasks.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Total Uses</p>
                <p className="text-white text-xl font-semibold">
                  {filteredTasks.reduce((sum, task) => sum + task.usageCount, 0)}
                </p>
              </div>
            </div>
          </div>
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
              <option key={category._id} value={category._id} className="bg-red-500/20 text-white">
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-red-900/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glassmorphism-card rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
                    <option value="" className="bg-red-500/20 text-white">Select a process item</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id} className="bg-red-500/20 text-white">
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

        {/* Category-based Tasks */}
        <div className="space-y-6">
          {sortedCategories.map((categoryName, categoryIndex) => {
            const categoryTasks = groupedTasks[categoryName]
            const totalUsage = categoryTasks.reduce((sum, task) => sum + task.usageCount, 0)
            const paginatedTasks = getPaginatedTasks(categoryName)
            const totalPages = getTotalPages(categoryName)
            const currentPage = getCurrentPage(categoryName)
            
            return (
              <motion.div
                key={categoryName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <Card className="glassmorphism-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Folder className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl flex items-center">
                            {categoryName}
                          </CardTitle>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-white/70 text-sm">
                              {categoryTasks.length} task{categoryTasks.length !== 1 ? 's' : ''}
                            </span>
                            <div className="flex items-center text-white/70 text-sm">
                              <Users className="h-4 w-4 mr-1" />
                              {totalUsage} total uses
                            </div>
                            {totalPages > 1 && (
                              <span className="text-white/60 text-sm">
                                Page {currentPage} of {totalPages}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {paginatedTasks.map((task, taskIndex) => (
                        <div
                          key={task._id}
                          className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-white/80 text-sm mb-2">
                                {task.step}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-white/60">
                                <div className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {task.usageCount} uses
                                </div>
                                <div className="flex items-center">
                                  <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-1 ml-4">
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
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                        <div className="text-white/70 text-sm">
                          Showing {((currentPage - 1) * tasksPerPage) + 1} to {Math.min(currentPage * tasksPerPage, categoryTasks.length)} of {categoryTasks.length} tasks
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(categoryName, currentPage - 1)}
                            disabled={currentPage === 1}
                            className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          
                          {/* Page Numbers */}
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <Button
                                key={page}
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(categoryName, page)}
                                className={`w-8 h-8 p-0 text-sm ${
                                  page === currentPage
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(categoryName, currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {sortedCategories.length === 0 && (
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