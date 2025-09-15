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

interface DocumentId {
  _id: string
  docId: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface DocumentIdForm {
  docId: string
  description: string
}

export default function DocumentIdsPage() {
  const [documentIds, setDocumentIds] = useState<DocumentId[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDocumentId, setEditingDocumentId] = useState<DocumentId | null>(null)
  const [formData, setFormData] = useState<DocumentIdForm>({
    docId: '',
    description: ''
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchDocumentIds()
  }, [router])

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
        setDocumentIds(result.documentIds)
      } else {
        toast.error('Failed to fetch document IDs')
      }
    } catch (error) {
      console.error('Error fetching document IDs:', error)
      toast.error('An error occurred while fetching document IDs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.docId.trim()) {
      toast.error('Document ID is required')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = editingDocumentId 
        ? `/api/admin/document-ids/${editingDocumentId._id}`
        : '/api/admin/document-ids'
      
      const method = editingDocumentId ? 'PUT' : 'POST'
      
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
        toast.success(editingDocumentId ? 'Document ID updated successfully!' : 'Document ID created successfully!')
        resetForm()
        fetchDocumentIds()
      } else {
        toast.error(result.error || 'Failed to save document ID')
      }
    } catch (error) {
      console.error('Error saving document ID:', error)
      toast.error('An error occurred while saving document ID')
    }
  }

  const handleEdit = (documentId: DocumentId) => {
    setEditingDocumentId(documentId)
    setFormData({
      docId: documentId.docId,
      description: documentId.description || ''
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document ID?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/document-ids/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Document ID deleted successfully!')
        fetchDocumentIds()
      } else {
        const result = await response.json()
        toast.error(result.error || 'Failed to delete document ID')
      }
    } catch (error) {
      console.error('Error deleting document ID:', error)
      toast.error('An error occurred while deleting document ID')
    }
  }

  const resetForm = () => {
    setFormData({
      docId: '',
      description: ''
    })
    setEditingDocumentId(null)
    setIsFormOpen(false)
  }

  const filteredDocumentIds = documentIds.filter(documentId =>
    documentId.docId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (documentId.description && documentId.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading document IDs...</p>
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
                Document ID Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage document IDs for document management
              </p>
            </div>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Document ID
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search document IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Document IDs List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocumentIds.map((documentId) => (
            <motion.div
              key={documentId._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{documentId.docId}</CardTitle>
                      <CardDescription>
                        {documentId.description || 'No description'}
                      </CardDescription>
                    </div>
                    <Badge variant={documentId.isActive ? "default" : "secondary"}>
                      {documentId.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(documentId)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(documentId._id)}
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

        {filteredDocumentIds.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No document IDs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first document ID.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Document ID
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
                  {editingDocumentId ? 'Edit Document ID' : 'Add New Document ID'}
                </h2>
                <Button variant="outline" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="docId">Document ID *</Label>
                  <Input
                    id="docId"
                    value={formData.docId}
                    onChange={(e) => setFormData({ ...formData, docId: e.target.value })}
                    placeholder="e.g., DOC-001"
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
                    {editingDocumentId ? 'Update' : 'Create'}
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
