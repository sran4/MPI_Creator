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
  Search, 
  Edit, 
  Trash2, 
  FileText,
  ArrowLeft,
  Save,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Form {
  _id: string
  formId: string
  formRev: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface FormForm {
  formId: string
  formRev: string
  description: string
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<Form | null>(null)
  const [formData, setFormData] = useState<FormForm>({
    formId: '',
    formRev: '',
    description: ''
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchForms()
  }, [router])

  const fetchForms = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/forms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setForms(result.forms)
      } else {
        toast.error('Failed to fetch forms')
      }
    } catch (error) {
      console.error('Error fetching forms:', error)
      toast.error('An error occurred while fetching forms')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.formId.trim() || !formData.formRev.trim()) {
      toast.error('Form ID and Form Revision are required')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = editingForm 
        ? `/api/admin/forms/${editingForm._id}`
        : '/api/admin/forms'
      
      const method = editingForm ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(editingForm ? 'Form updated successfully!' : 'Form created successfully!')
        resetForm()
        fetchForms()
      } else {
        toast.error(result.error || 'Failed to save form')
      }
    } catch (error) {
      console.error('Error saving form:', error)
      toast.error('An error occurred while saving form')
    }
  }

  const handleEdit = (form: Form) => {
    setEditingForm(form)
    setFormData({
      formId: form.formId,
      formRev: form.formRev,
      description: form.description || ''
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/forms/${formId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Form deleted successfully!')
        fetchForms()
      } else {
        const result = await response.json()
        toast.error(result.error || 'Failed to delete form')
      }
    } catch (error) {
      console.error('Error deleting form:', error)
      toast.error('An error occurred while deleting form')
    }
  }

  const resetForm = () => {
    setFormData({
      formId: '',
      formRev: '',
      description: ''
    })
    setEditingForm(null)
    setIsFormOpen(false)
  }

  const filteredForms = forms.filter(form =>
    form.formId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.formRev.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (form.description && form.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading forms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Form Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage form IDs and revisions for document management
              </p>
            </div>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Form
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Forms List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form) => (
            <motion.div
              key={form._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{form.formId}</CardTitle>
                      <CardDescription>Revision: {form.formRev}</CardDescription>
                    </div>
                    <Badge variant={form.isActive ? "default" : "secondary"}>
                      {form.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {form.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {form.description}
                    </p>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(form)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(form._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredForms.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No forms found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first form.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Form
              </Button>
            )}
          </div>
        )}

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-red-900/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glassmorphism-card rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingForm ? 'Edit Form' : 'Add New Form'}
                </h2>
                <Button variant="outline" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="formId">Form ID *</Label>
                  <Input
                    id="formId"
                    value={formData.formId}
                    onChange={(e) => setFormData({ ...formData, formId: e.target.value })}
                    placeholder="e.g., FORM-001"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="formRev">Form Revision *</Label>
                  <Input
                    id="formRev"
                    value={formData.formRev}
                    onChange={(e) => setFormData({ ...formData, formRev: e.target.value })}
                    placeholder="e.g., Rev A"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {editingForm ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
