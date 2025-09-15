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
  Search,
  Calendar,
  Hash,
  File
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Docs {
  _id: string
  jobNo?: string
  oldJobNo?: string
  mpiNo?: string
  mpiRev?: string
  processItem: string
  docId: string
  formId: string
  formRev: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface DocsForm {
  jobNo: string
  oldJobNo: string
  mpiNo: string
  mpiRev: string
  processItem: string
  docId: string
  formId: string
  formRev: string
}

interface Form {
  _id: string
  formId: string
  formRev: string
  description?: string
}

interface ProcessItem {
  _id: string
  categoryName: string
  isActive: boolean
}

interface DocumentId {
  _id: string
  docId: string
  description?: string
  isActive: boolean
}

export default function DocsPage() {
  const [docs, setDocs] = useState<Docs[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [processItems, setProcessItems] = useState<ProcessItem[]>([])
  const [documentIds, setDocumentIds] = useState<DocumentId[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<DocsForm>({
    jobNo: '',
    oldJobNo: '',
    mpiNo: '',
    mpiRev: '',
    processItem: '',
    docId: '',
    formId: '',
    formRev: ''
  })
  const router = useRouter()

  useEffect(() => {
    fetchDocs()
    fetchForms()
    fetchProcessItems()
    fetchDocumentIds()
  }, [])

  const fetchDocs = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/docs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setDocs(result.docs)
      } else {
        toast.error('Failed to fetch docs')
      }
    } catch (error) {
      console.error('Error fetching docs:', error)
      toast.error('An error occurred while fetching docs')
    } finally {
      setIsLoading(false)
    }
  }

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
        console.error('Failed to fetch forms')
      }
    } catch (error) {
      console.error('Error fetching forms:', error)
    }
  }

  const fetchProcessItems = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setProcessItems(result.categories || [])
      } else {
        console.error('Failed to fetch process items')
      }
    } catch (error) {
      console.error('Error fetching process items:', error)
    }
  }

  const fetchDocumentIds = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/document-ids', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setDocumentIds(result.documentIds || [])
      } else {
        console.error('Failed to fetch document IDs')
      }
    } catch (error) {
      console.error('Error fetching document IDs:', error)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Docs record created successfully!')
        resetForm()
        fetchDocs()
      } else {
        toast.error(result.error || 'Failed to create docs record')
      }
    } catch (error) {
      console.error('Error creating docs record:', error)
      toast.error('An error occurred while creating docs record')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEdit = (doc: Docs) => {
    setFormData({
      jobNo: doc.jobNo || '',
      oldJobNo: doc.oldJobNo || '',
      mpiNo: doc.mpiNo || '',
      mpiRev: doc.mpiRev || '',
      processItem: doc.processItem,
      docId: doc.docId,
      formId: doc.formId,
      formRev: doc.formRev
    })
    setIsEditing(doc._id)
    setShowForm(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEditing) return
    setIsCreating(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/docs/${isEditing}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Docs record updated successfully!')
        resetForm()
        fetchDocs()
      } else {
        toast.error(result.error || 'Failed to update docs record')
      }
    } catch (error) {
      console.error('Error updating docs record:', error)
      toast.error('An error occurred while updating docs record')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string, jobNo: string) => {
    if (!confirm(`Are you sure you want to delete docs record "${jobNo}"? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/docs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Docs record deleted successfully!')
        fetchDocs()
      } else {
        toast.error(result.error || 'Failed to delete docs record')
      }
    } catch (error) {
      console.error('Error deleting docs record:', error)
      toast.error('An error occurred while deleting docs record')
    }
  }

  const resetForm = () => {
    setFormData({
      jobNo: '',
      oldJobNo: '',
      mpiNo: '',
      mpiRev: '',
      processItem: '',
      docId: '',
      formId: '',
      formRev: ''
    })
    setShowForm(false)
    setIsEditing(null)
  }

  const filteredDocs = docs.filter(doc =>
    (doc.jobNo && doc.jobNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (doc.mpiNo && doc.mpiNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    doc.processItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.docId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.formId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading docs...</div>
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
              <h1 className="text-3xl font-bold text-white">Docs Management</h1>
              <p className="text-white/70 mt-1">Manage document records for your MPI system</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Docs Record
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              type="text"
              placeholder="Search docs records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
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
                  {isEditing ? 'Edit Docs Record' : 'Add New Docs Record'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jobNo" className="text-white">Job Number</Label>
                    <Input
                      id="jobNo"
                      value={formData.jobNo}
                      onChange={(e) => setFormData({ ...formData, jobNo: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      placeholder="Enter job number (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="oldJobNo" className="text-white">Old Job Number</Label>
                    <Input
                      id="oldJobNo"
                      value={formData.oldJobNo}
                      onChange={(e) => setFormData({ ...formData, oldJobNo: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      placeholder="Enter old job number (optional)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mpiNo" className="text-white">MPI Number</Label>
                    <Input
                      id="mpiNo"
                      value={formData.mpiNo}
                      onChange={(e) => setFormData({ ...formData, mpiNo: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      placeholder="Enter MPI number (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mpiRev" className="text-white">MPI Revision</Label>
                    <Input
                      id="mpiRev"
                      value={formData.mpiRev}
                      onChange={(e) => setFormData({ ...formData, mpiRev: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      placeholder="Enter MPI revision (optional)"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="processItem" className="text-white">Process Item *</Label>
                  <select
                    id="processItem"
                    value={formData.processItem}
                    onChange={(e) => setFormData({ ...formData, processItem: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" className="bg-red-500/20 text-white">Select Process Item</option>
                    {processItems.map((item) => (
                      <option key={item._id} value={item.categoryName} className="bg-red-500/20 text-white">
                        {item.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="docId" className="text-white">Document ID *</Label>
                    <select
                      id="docId"
                      value={formData.docId}
                      onChange={(e) => setFormData({ ...formData, docId: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="" className="bg-red-500/20 text-white">Select Document ID</option>
                      {documentIds.map((docId) => (
                        <option key={docId._id} value={docId.docId} className="bg-red-500/20 text-white">
                          {docId.docId} - {docId.description || 'No description'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="formId" className="text-white">Form ID *</Label>
                    <select
                      id="formId"
                      value={formData.formId}
                      onChange={(e) => setFormData({ ...formData, formId: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="" className="bg-red-500/20 text-white">Select Form ID</option>
                      {forms.map((form) => (
                        <option key={form._id} value={form.formId} className="bg-red-500/20 text-white">
                          {form.formId} - {form.description || 'No description'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="formRev" className="text-white">Form Revision *</Label>
                  <select
                    id="formRev"
                    value={formData.formRev}
                    onChange={(e) => setFormData({ ...formData, formRev: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" className="bg-red-500/20 text-white">Select Form Revision</option>
                    {forms
                      .filter(form => form.formId === formData.formId)
                      .map((form) => (
                        <option key={form._id} value={form.formRev} className="bg-red-500/20 text-white">
                          {form.formRev}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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

        {/* Docs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc, index) => (
            <motion.div
              key={doc._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glassmorphism-card glassmorphism-card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-400" />
                        {doc.processItem}
                      </CardTitle>
                      <div className="flex items-center mt-2 space-x-4">
                        {doc.jobNo && (
                          <div className="flex items-center">
                            <Hash className="h-4 w-4 mr-1 text-white/60" />
                            <span className="text-white/70 text-sm">Job: {doc.jobNo}</span>
                          </div>
                        )}
                        {doc.mpiNo && (
                          <div className="flex items-center">
                            <Hash className="h-4 w-4 mr-1 text-white/60" />
                            <span className="text-white/70 text-sm">MPI: {doc.mpiNo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(doc)}
                        className="text-blue-400 hover:bg-blue-400/10 p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc._id, doc.processItem)}
                        className="text-red-400 hover:bg-red-400/10 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-white/70">
                      <span className="font-medium mr-2">MPI Rev:</span>
                      <span>{doc.mpiRev}</span>
                    </div>
                    <div className="flex items-center text-white/70">
                      <span className="font-medium mr-2">Doc ID:</span>
                      <span>{doc.docId}</span>
                    </div>
                    <div className="flex items-center text-white/70">
                      <span className="font-medium mr-2">Form ID:</span>
                      <span>{doc.formId}</span>
                    </div>
                    <div className="flex items-center text-white/70">
                      <span className="font-medium mr-2">Form Rev:</span>
                      <span>{doc.formRev}</span>
                    </div>
                    {doc.oldJobNo && (
                      <div className="flex items-center text-white/70">
                        <span className="font-medium mr-2">Old Job:</span>
                        <span>{doc.oldJobNo}</span>
                      </div>
                    )}
                    <div className="flex items-center text-white/70">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Created {new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/70 mb-2">No Docs Records Found</h3>
            <p className="text-white/50 mb-6">Get started by creating your first docs record</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Docs Record
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
