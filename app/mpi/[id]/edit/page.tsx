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
  Save, 
  ArrowLeft, 
  ArrowUp,
  FileText,
  Folder,
  Users,
  Search,
  Trash2,
  Edit,
  X,
  Image as ImageIcon,
  FileImage,
  Link as LinkIcon,
  Clipboard,
  GripVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Editor } from '@tinymce/tinymce-react'

interface MPI {
  _id: string
  mpiNumber: string
  mpiVersion: string
  customerCompanyId: {
    companyName: string
    city: string
    state: string
  }
  customerAssemblyName: string
  assemblyRev: string
  drawingName: string
  drawingRev: string
  assemblyQuantity: number
  kitReceivedDate: string
  dateReleased: string
  pages: string
  sections: Array<{
  id: string
  title: string
  content: string
  order: number
  isCollapsed: boolean
  images: string[]
  documentId?: string
  }>
  status: string
  createdAt: string
  updatedAt: string
}

interface ProcessItem {
  _id: string
  categoryName: string
}

interface Task {
  _id: string
  step: string
  categoryName: string
  processItem: {
    _id: string
    categoryName: string
  }
  isGlobal: boolean
  usageCount: number
}

interface DocumentId {
  _id: string
  docId: string
  description?: string
}

export default function MPIEditorPage({ params }: { params: { id: string } }) {
  const [mpi, setMpi] = useState<MPI | null>(null)
  const [processItems, setProcessItems] = useState<ProcessItem[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [documentIds, setDocumentIds] = useState<DocumentId[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showAddStepModal, setShowAddStepModal] = useState(false)
  const [showBulkTaskModal, setShowBulkTaskModal] = useState(false)
  const [showInsertDocIdModal, setShowInsertDocIdModal] = useState(false)
  const [showAddImageModal, setShowAddImageModal] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showSplitScreen, setShowSplitScreen] = useState(false)
  const [newStep, setNewStep] = useState({
    title: '',
    content: '',
    category: ''
  })
  const [newImageUrl, setNewImageUrl] = useState('')
  
  // Section management states
  const [showAddSectionModal, setShowAddSectionModal] = useState(false)
  const [showEditSectionModal, setShowEditSectionModal] = useState(false)
  const [editingSection, setEditingSection] = useState<{id: string, title: string} | null>(null)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    fetchMPI()
    fetchProcessItems()
    fetchTasks()
    fetchDocumentIds()
  }, [params.id])

  const fetchMPI = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/mpi/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setMpi(result.mpi)
      } else {
        toast.error('Failed to fetch MPI')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching MPI:', error)
      toast.error('An error occurred while fetching MPI')
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProcessItems = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/step-categories-simple', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setProcessItems(result.categories)
      } else {
        console.error('Failed to fetch process items')
      }
    } catch (error) {
      console.error('Error fetching process items:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setTasks(result.tasks || [])
      } else {
        console.error('Failed to fetch tasks')
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const fetchDocumentIds = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/document-ids', {
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

  const handleSaveMPI = async () => {
    if (!mpi) return

    console.log('💾 Saving MPI with sections:', mpi.sections)
    mpi.sections.forEach((section, index) => {
      console.log(`Section ${index + 1}:`, section.title, 'Order:', section.order, 'Document ID:', section.documentId)
    })

    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/mpi/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(mpi)
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ MPI saved successfully:', responseData)
        toast.success('MPI saved successfully!')
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to save MPI:', errorData)
        toast.error(`Failed to save MPI: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving MPI:', error)
      toast.error('An error occurred while saving MPI')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mpi || !newStep.title || !newStep.content || !newStep.category) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/step-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          categoryName: newStep.category,
          stepTitle: newStep.title,
          stepContent: newStep.content
        })
      })

      if (response.ok) {
        toast.success('Step added successfully!')
        setNewStep({ title: '', content: '', category: '' })
        setShowAddStepModal(false)
        fetchProcessItems()
      } else {
        toast.error('Failed to add step')
      }
    } catch (error) {
      console.error('Error adding step:', error)
      toast.error('An error occurred while adding step')
    }
  }


  const handleBulkInsertTasks = (taskIds: string[], sectionId: string) => {
    if (!mpi) return
    
    const selectedTasksData = tasks.filter(task => taskIds.includes(task._id))
    
    const updatedSections = mpi.sections.map(section => {
      if (section.id === sectionId) {
        const currentContent = section.content || ''
        // Format all selected tasks as HTML for TinyMCE with minimal spacing
        const formattedTasks = selectedTasksData.map(task => `${task.step}`).join('<br>')
        const newContent = currentContent 
          ? `${currentContent}<br>${formattedTasks}`
          : formattedTasks
        
        return {
          ...section,
          content: newContent
        }
      }
      return section
    })

    setMpi({
      ...mpi,
      sections: updatedSections
    })

    setShowBulkTaskModal(false)
    setSelectedTasks([])
    toast.success(`${selectedTasksData.length} tasks inserted successfully!`)
  }

  const handleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleSelectAllTasks = () => {
    const filteredTasks = tasks.filter(task =>
      task.step.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredTasks.map(task => task._id))
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - modalPosition.x,
      y: e.clientY - modalPosition.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setModalPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleInsertDocumentId = (docId: DocumentId, sectionId: string) => {
    if (!mpi) return

    const updatedSections = mpi.sections.map(section => {
      if (section.id === sectionId) {
        const currentContent = section.content || ''
        // Format Document ID as HTML for TinyMCE
        const formattedDocId = `<p><strong>${docId.docId}</strong></p>`
        const newContent = currentContent 
          ? `${currentContent}<br><br>${formattedDocId}`
          : formattedDocId
        
        return {
          ...section,
          content: newContent
        }
      }
      return section
    })

    setMpi({
      ...mpi,
      sections: updatedSections
    })

    setShowInsertDocIdModal(false)
    toast.success(`Document ID "${docId.docId}" inserted successfully!`)
  }

  const handleInsertDocumentIdForProcessItem = (docId: DocumentId, sectionId: string) => {
    if (!mpi) return

    console.log('🔍 DEBUG: Adding Document ID to Process Item')
    console.log('Document ID:', docId.docId)
    console.log('Section ID:', sectionId)
    console.log('Current MPI sections:', mpi.sections)

    const updatedSections = mpi.sections.map(section => {
      if (section.id === sectionId) {
        console.log('✅ Found matching section:', section.title)
        
        // Clean up any existing content that might contain "Instructions:" or Document IDs
        let cleanContent = section.content || ''
        cleanContent = cleanContent.replace(/Instructions:\s*/gi, '') // Remove "Instructions:" label
        cleanContent = cleanContent.replace(/<p><strong>(PROC-\d+-[A-Z]|IPC-[A-Z0-9-]+)<\/strong><\/p>/gi, '') // Remove Document IDs from HTML content
        cleanContent = cleanContent.replace(/^(PROC-\d+-[A-Z]|IPC-[A-Z0-9-]+)\s*\n*/gm, '') // Remove Document IDs from plain text content
        cleanContent = cleanContent.replace(/<br><br>/g, '') // Remove extra line breaks
        cleanContent = cleanContent.trim()
        
        console.log('🧹 Cleaned content:', cleanContent)
        console.log('📝 Setting documentId to:', docId.docId)
        
        // Store Document ID in separate field for two-column layout
        const updatedSection = {
          ...section,
          documentId: docId.docId,
          content: cleanContent
        }
        
        console.log('📋 Updated section:', updatedSection)
        return updatedSection
      }
      return section
    })

    console.log('🔄 Updated sections:', updatedSections)

    setMpi({
      ...mpi,
      sections: updatedSections
    })

    setShowInsertDocIdModal(false)
    const sectionTitle = mpi.sections.find(s => s.id === sectionId)?.title || 'section'
    toast.success(`Document ID "${docId.docId}" added to ${sectionTitle}!`)
  }

  const handleAddImage = (sectionId: string) => {
    if (!mpi || !newImageUrl.trim()) return

    const updatedSections = mpi.sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          images: [...section.images, newImageUrl.trim()]
        }
      }
      return section
    })

    setMpi({
      ...mpi,
      sections: updatedSections
    })

    setNewImageUrl('')
    setShowAddImageModal(false)
    toast.success('Image added successfully!')
  }

  const handleRemoveImage = (sectionId: string, imageIndex: number) => {
    if (!mpi) return

    const updatedSections = mpi.sections.map(section => {
      if (section.id === sectionId) {
        const updatedImages = section.images.filter((_, index) => index !== imageIndex)
        return {
          ...section,
          images: updatedImages
        }
      }
      return section
    })

    setMpi({
      ...mpi,
      sections: updatedSections
    })

    toast.success('Image removed successfully!')
  }

  const handleDragEnd = (result: DropResult) => {
    console.log('🔄 Drag and drop result:', result)
    
    if (!result.destination || !mpi) {
      console.log('❌ No destination or no MPI data')
      return
    }

    console.log('📋 Original sections:', mpi.sections.map(s => ({ title: s.title, order: s.order })))

    const items = Array.from(mpi.sections)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update the order property for each section
    const updatedSections = items.map((section, index) => ({
      ...section,
      order: index
    }))

    console.log('📋 Updated sections:', updatedSections.map(s => ({ title: s.title, order: s.order })))

    setMpi({
      ...mpi,
      sections: updatedSections
    })

    console.log('✅ MPI state updated with new section order')
    toast.success('Section reordered successfully!')
  }

  const moveSectionUp = (sectionId: string) => {
    console.log('🔼 Move section up called for:', sectionId)
    if (!mpi) {
      console.log('❌ No MPI data')
      return
    }

    const currentIndex = mpi.sections.findIndex(s => s.id === sectionId)
    console.log('📍 Current index:', currentIndex, 'Total sections:', mpi.sections.length)
    
    if (currentIndex <= 0) {
      toast.error('Section is already at the top')
      return
    }

    // Create a completely new array to force React re-render
    const newSections = mpi.sections.map((section, index) => {
      if (index === currentIndex) {
        return mpi.sections[currentIndex - 1]
      } else if (index === currentIndex - 1) {
        return mpi.sections[currentIndex]
      } else {
        return section
      }
    })

    console.log('🔄 Updated sections:', newSections.map(s => ({ title: s.title, id: s.id })))

    setMpi({
      ...mpi,
      sections: newSections
    })

    toast.success('Section moved up!')
  }

  const moveSectionDown = (sectionId: string) => {
    console.log('🔽 Move section down called for:', sectionId)
    if (!mpi) {
      console.log('❌ No MPI data')
      return
    }

    const currentIndex = mpi.sections.findIndex(s => s.id === sectionId)
    console.log('📍 Current index:', currentIndex, 'Total sections:', mpi.sections.length)
    
    if (currentIndex >= mpi.sections.length - 1) {
      toast.error('Section is already at the bottom')
      return
    }

    // Create a completely new array to force React re-render
    const newSections = mpi.sections.map((section, index) => {
      if (index === currentIndex) {
        return mpi.sections[currentIndex + 1]
      } else if (index === currentIndex + 1) {
        return mpi.sections[currentIndex]
      } else {
        return section
      }
    })

    console.log('🔄 Updated sections:', newSections.map(s => ({ title: s.title, id: s.id })))

    setMpi({
      ...mpi,
      sections: newSections
    })

    toast.success('Section moved down!')
  }

  const handleContentChange = (sectionId: string, newContent: string) => {
    if (!mpi) return

    const updatedSections = mpi.sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          content: newContent
        }
      }
      return section
    })

    setMpi({
      ...mpi,
      sections: updatedSections
    })
  }

  // Section CRUD handlers
  const handleAddSection = () => {
    if (!mpi || !newSectionTitle.trim()) return

    const newSection = {
      id: `section-${Date.now()}`,
      title: newSectionTitle.trim(),
      content: '',
      order: mpi.sections.length,
      isCollapsed: false,
      images: [],
      documentId: undefined
    }

    setMpi({
      ...mpi,
      sections: [...mpi.sections, newSection]
    })

    setNewSectionTitle('')
    setShowAddSectionModal(false)
    toast.success('Section added successfully!')
  }

  const handleEditSection = () => {
    if (!mpi || !editingSection || !newSectionTitle.trim()) return

    const updatedSections = mpi.sections.map(section => {
      if (section.id === editingSection.id) {
        return {
          ...section,
          title: newSectionTitle.trim()
        }
      }
      return section
    })

    setMpi({
      ...mpi,
      sections: updatedSections
    })

    setNewSectionTitle('')
    setEditingSection(null)
    setShowEditSectionModal(false)
    toast.success('Section updated successfully!')
  }

  const handleDeleteSection = (sectionId: string) => {
    if (!mpi) return

    const sectionToDelete = mpi.sections.find(s => s.id === sectionId)
    if (!sectionToDelete) return

    if (confirm(`Are you sure you want to delete the section "${sectionToDelete.title}"? This action cannot be undone.`)) {
      const updatedSections = mpi.sections.filter(section => section.id !== sectionId)
      
      // Reorder remaining sections
      const reorderedSections = updatedSections.map((section, index) => ({
        ...section,
        order: index
      }))

      setMpi({
        ...mpi,
        sections: reorderedSections
      })

      toast.success('Section deleted successfully!')
    }
  }

  const openEditSectionModal = (section: {id: string, title: string}) => {
    setEditingSection(section)
    setNewSectionTitle(section.title)
    setShowEditSectionModal(true)
  }

  const handleRemoveDocumentId = (sectionId: string) => {
    if (!mpi) return

    const updatedSections = mpi.sections.map(section => {
      if (section.id === sectionId) {
        // Also clean up any content that might contain "Instructions:" or Document IDs
        let cleanContent = section.content || ''
        cleanContent = cleanContent.replace(/Instructions:\s*/gi, '') // Remove "Instructions:" label
        cleanContent = cleanContent.replace(/<p><strong>(PROC-\d+-[A-Z]|IPC-[A-Z0-9-]+)<\/strong><\/p>/gi, '') // Remove Document IDs from HTML content
        cleanContent = cleanContent.replace(/^(PROC-\d+-[A-Z]|IPC-[A-Z0-9-]+)\s*\n*/gm, '') // Remove Document IDs from plain text content
        cleanContent = cleanContent.replace(/<br><br>/g, '') // Remove extra line breaks
        cleanContent = cleanContent.trim()
        
        return {
          ...section,
          documentId: undefined,
          content: cleanContent
        }
      }
      return section
    })

    setMpi({
      ...mpi,
      sections: updatedSections
    })

    const sectionTitle = mpi.sections.find(s => s.id === sectionId)?.title || 'section'
    toast.success(`Document ID removed from ${sectionTitle}!`)
  }

  const filteredProcessItems = processItems.filter(item =>
    item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTasks = tasks.filter(task =>
    task.step.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDocumentIds = documentIds.filter(docId =>
    docId.docId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (docId.description && docId.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading MPI editor...</div>
      </div>
    )
  }

  if (!mpi) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">MPI not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
                </Button>
              </Link>
              <div>
              <h1 className="text-4xl font-bold text-white">MPI Editor</h1>
              <p className="text-white/70 font-semibold text-red-500 mt-1">{mpi.customerCompanyId.companyName}-({mpi.customerAssemblyName}) - {mpi.mpiNumber} (Rev. - {mpi.mpiVersion})</p>
                </div>
              </div>
          <div className="flex items-center space-x-3">
              <Button 
              onClick={() => setShowSplitScreen(!showSplitScreen)}
              className={`${showSplitScreen ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
              >
              <FileText className="h-4 w-4 mr-2" />
              {showSplitScreen ? 'Hide Preview' : 'Show Preview'}
              </Button>
              <Button 
              onClick={() => setShowAddSectionModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
              </Button>
              <Button 
              onClick={() => setShowAddStepModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
              >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
              </Button>
              <Button 
              onClick={handleSaveMPI}
                disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save MPI'}
              </Button>
            </div>
          </div>

        {/* Main Content Area */}
        <div className={`mt-8 ${showSplitScreen ? 'xl:flex xl:space-x-6' : ''}`}>
          {/* Editor Section */}
          <div className={`${showSplitScreen ? 'xl:w-3/5' : 'w-full'}`}>
            {/* MPI Sections */}
            <div className="space-y-6">
                {mpi.sections.map((section, sectionIndex) => {
                  console.log('🎨 Editor - Section:', section.title, 'Index:', sectionIndex, 'ID:', section.id, 'Order:', section.order)
                  return (
                        <motion.div
                          key={`${section.id}-${sectionIndex}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: sectionIndex * 0.1 }}
                          className="transition-transform duration-200"
                        >
              <Card className="glassmorphism-card glassmorphism-card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-3 flex flex-col space-y-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            console.log('🔼 Up button clicked for section:', section.id, 'at index:', sectionIndex)
                            moveSectionUp(section.id)
                          }}
                          disabled={sectionIndex === 0}
                          className="text-white/50 hover:text-white/80 hover:bg-white/10 p-1 h-6 w-6"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            console.log('🔽 Down button clicked for section:', section.id, 'at index:', sectionIndex)
                            moveSectionDown(section.id)
                          }}
                          disabled={sectionIndex === mpi.sections.length - 1}
                          className="text-white/50 hover:text-white/80 hover:bg-white/10 p-1 h-6 w-6"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <Folder className="h-6 w-6 mr-3 text-purple-400" />
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-xl">{section.title}</CardTitle>
                          <CardDescription className="text-white/70">
                            {section.content ? 'Content available' : 'No content'}
                          </CardDescription>
                        </div>
                        {section.documentId && (
                          <div className="flex items-center space-x-2">
                            <div className="px-3 py-1 bg-blue-600/20 border border-blue-400/30 rounded-lg">
                              <span className="text-blue-300 text-sm font-medium">{section.documentId}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveDocumentId(section.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1 h-6 w-6"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      </div>
                        <div className="flex items-center space-x-2">
                          <div className="relative group">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedSectionId(section.id)
                                setSelectedTasks([])
                                setShowBulkTaskModal(true)
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white border-0 p-2"
                            >
                              <Clipboard className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              Insert Tasks
                            </div>
                          </div>
                          <div className="relative group">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedSectionId(section.id)
                                setShowAddImageModal(true)
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white border-0 p-2"
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              Add Image
                            </div>
                          </div>
                          <div className="relative group">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedSectionId(section.id)
                                setShowInsertDocIdModal(true)
                              }}
                              className="bg-orange-600 hover:bg-orange-700 text-white border-0 p-2"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              Add Doc ID to Title
                            </div>
                          </div>
                          <div className="relative group">
                            <Button
                              size="sm"
                              onClick={() => openEditSectionModal({id: section.id, title: section.title})}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white border-0 p-2"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              Edit
                            </div>
                          </div>
                          <div className="relative group">
                            <Button
                              size="sm"
                              onClick={() => handleDeleteSection(section.id)}
                              className="bg-red-600 hover:bg-red-700 text-white border-0 p-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              Delete
                            </div>
                          </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Editor
                            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
                            value={section.content || ''}
                            onEditorChange={(content: string) => handleContentChange(section.id, content)}
                            init={{
                              height: 200,
                              menubar: false,
                              plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                'insertdatetime', 'media', 'table', 'help', 'wordcount', 'textcolor',
                                'colorpicker', 'textpattern', 'paste', 'emoticons'
                              ],
                              toolbar: 'undo redo | blocks | ' +
                                'bold italic underline strikethrough | alignleft aligncenter ' +
                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                'forecolor backcolor | removeformat | help | image | link | table | ' +
                                'charmap | emoticons | fullscreen | preview | code',
                              content_style: `
                                body { 
                                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                                  font-size: 14px; 
                                  color: #1f2937; 
                                  background-color: transparent;
                                }
                                p { margin: 0 0 8px 0; color: #1f2937; }
                                h1, h2, h3, h4, h5, h6 { color: #1f2937; margin: 8px 0; }
                                strong, b { color: #1f2937; font-weight: bold; }
                                em, i { color: #1f2937; font-style: italic; }
                                u { color: #1f2937; text-decoration: underline; }
                                table { border-collapse: collapse; width: 100%; }
                                table td, table th { border: 1px solid #d1d5db; padding: 8px; color: #1f2937; }
                                a { color: #2563eb; text-decoration: underline; }
                                img { max-width: 100%; height: auto; }
                                .mce-content-body { color: #1f2937 !important; }
                              `,
                              skin: 'oxide-dark',
                              content_css: 'dark',
                              branding: false,
                              promotion: false,
                              statusbar: false,
                              resize: false,
                              placeholder: 'Enter section content here... You can use bold, italic, underline, colors, images, tables, and more!',
                              setup: (editor: any) => {
                                editor.on('init', () => {
                                  editor.getContainer().style.border = 'none';
                                  editor.getContainer().style.borderRadius = '8px';
                                  // Ensure content is visible
                                  const body = editor.getBody();
                                  if (body) {
                                    body.style.color = '#1f2937';
                                    body.style.backgroundColor = 'transparent';
                                  }
                                });
                                editor.on('NodeChange', () => {
                                  // Ensure all content remains visible
                                  const body = editor.getBody();
                                  if (body) {
                                    body.style.color = '#1f2937';
                                  }
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                      
                      {/* Images Section */}
                      {section.images && section.images.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-white font-semibold mb-2 flex items-center">
                            <FileImage className="h-4 w-4 mr-2" />
                            Images ({section.images.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {section.images.map((imageUrl, imageIndex) => (
                              <div key={imageIndex} className="relative group">
                                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <LinkIcon className="h-4 w-4 text-blue-400" />
                                    <span className="text-white/70 text-sm truncate">{imageUrl}</span>
                                  </div>
                              <Button
                                size="sm"
                                    onClick={() => window.open(imageUrl, '_blank')}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                              >
                                    View Image
                              </Button>
                                </div>
                              <Button
                                size="sm"
                                  variant="destructive"
                                  onClick={() => handleRemoveImage(section.id, imageIndex)}
                                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                  <X className="h-3 w-3" />
                              </Button>
                        </div>
                            ))}
                        </div>
                      </div>
                      )}
                    </div>
                  </CardContent>
              </Card>
                        </motion.div>
                  )
                })}
            </div>
          </div>

          {/* Print Preview Section */}
          {showSplitScreen && (
            <div className="xl:w-2/5 mt-8 xl:mt-0">
              <div className="glassmorphism-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Print Preview</h3>
                  <Button
                    size="sm"
                    onClick={() => window.open(`/mpi/${mpi._id}/print-preview`, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Open Full Preview
                  </Button>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-lg max-h-[80vh] overflow-y-auto">
                  <div className="text-black">
                    {/* MPI Header */}
                    <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                      <h1 className="text-3xl font-bold mb-4 text-gray-900">Manufacturing Process Instructions</h1>
                    </div>

                    {/* Assembly Details Section */}
                    <div className="mb-8 border-2 border-gray-300 rounded-lg p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">Assembly Details</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900">
                        <div>
                          <span className="font-semibold">MPI Number:</span> {mpi.mpiNumber}
                        </div>
                        <div>
                          <span className="font-semibold">MPI Rev:</span> {mpi.mpiVersion}
                        </div>
                        <div>
                          <span className="font-semibold">Job No:</span> {mpi.jobNumber}
                        </div>
                        <div>
                          <span className="font-semibold">Old Job No:</span> {mpi.oldJobNumber || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold">Customer:</span> {mpi.customerCompanyId?.companyName || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold">Assembly Quantity:</span> {mpi.assemblyQuantity || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold">Customer Assembly Name:</span> {mpi.customerAssemblyName || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold">Customer Assembly Rev:</span> {mpi.assemblyRev || 'N/A'}
                        </div>    
                        <div>
                          <span className="font-semibold">Drawing Name:</span> {mpi.drawingName || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold">Drawing Rev:</span> {mpi.drawingRev || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold">Kit receive date:</span> {mpi.kitReceivedDate ? new Date(mpi.kitReceivedDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold">Kit release date:</span> {mpi.dateReleased ? new Date(mpi.dateReleased).toLocaleDateString() : 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold">Pages:</span> {mpi.totalPages || mpi.pages || 'N/A'}
                        </div>      
                        

                     
                      </div>
                    </div>

                    {/* Sections */}
                    <div className="space-y-6">
                      {mpi.sections.map((section, index) => (
                        <div key={section.id} className="border-2 border-gray-300 rounded-lg p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2 flex justify-between items-center">
                            <span>{section.title}</span>
                            {section.documentId && (
                              <span className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg text-blue-800 text-sm font-medium">
                                {section.documentId}
                              </span>
                            )}
                          </h3>
                          {section.content && (
                            <div className="text-gray-900">
                              <div 
                                className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4"
                                dangerouslySetInnerHTML={{ __html: section.content }}
                              />
                            </div>
                          )}
                          {!section.content && (
                            <div className="text-gray-500 italic">
                              No content added to this section yet.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Section Modal */}
        {showAddSectionModal && (
          <div className="fixed inset-0 bg-red-900/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glassmorphism-card rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Add New Section</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddSectionModal(false)
                    setNewSectionTitle('')
                  }}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sectionTitle" className="text-white">Section Title</Label>
                  <Input
                    id="sectionTitle"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="Enter section title (e.g., General Instructions, Kit Release)"
                    className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddSectionModal(false)
                      setNewSectionTitle('')
                    }}
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddSection}
                    disabled={!newSectionTitle.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Add Section
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Section Modal */}
        {showEditSectionModal && (
          <div className="fixed inset-0 bg-red-900/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glassmorphism-card rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Edit Section</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditSectionModal(false)
                    setEditingSection(null)
                    setNewSectionTitle('')
                  }}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editSectionTitle" className="text-white">Section Title</Label>
                  <Input
                    id="editSectionTitle"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="Enter section title"
                    className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleEditSection()}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditSectionModal(false)
                      setEditingSection(null)
                      setNewSectionTitle('')
                    }}
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditSection}
                    disabled={!newSectionTitle.trim()}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Update Section
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Step Modal */}
        {showAddStepModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glassmorphism-card rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Add New Step</h2>
              <Button
                variant="ghost"
                  size="sm"
                  onClick={() => setShowAddStepModal(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
              </Button>
            </div>

              <form onSubmit={handleAddStep} className="space-y-4">
                <div>
                  <Label htmlFor="category" className="text-white">Process Item *</Label>
                <select
                    id="category"
                    value={newStep.category}
                    onChange={(e) => setNewStep({ ...newStep, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ colorScheme: 'dark' }}
                    required
                  >
                    <option value="" className="bg-gray-800 text-white">Select a process item</option>
                    {filteredProcessItems.map(item => (
                      <option key={item._id} value={item.categoryName} className="bg-gray-800 text-white">
                        {item.categoryName}
                  </option>
                ))}
                </select>
            </div>

                <div>
                  <Label htmlFor="title" className="text-white">Step Title *</Label>
                  <Input
                    id="title"
                    value={newStep.title}
                    onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    placeholder="Enter step title"
                    required
                  />
            </div>

                <div>
                  <Label htmlFor="content" className="text-white">Step Content *</Label>
                  <textarea
                    id="content"
                    value={newStep.content}
                    onChange={(e) => setNewStep({ ...newStep, content: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                    placeholder="Enter step content"
                    required
                  />
                    </div>
                    
                <div className="flex space-x-3 pt-4">
                                <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                                </Button>
                                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddStepModal(false)}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                                </Button>
                              </div>
              </form>
            </motion.div>
        </div>
      )}


        {/* Bulk Insert Tasks Modal */}
        {showBulkTaskModal && (
        <div className="fixed inset-0 bg-red-900/30 backdrop-blur-sm z-50 p-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glassmorphism-card rounded-lg p-4 w-full max-w-[95vw] max-h-[95vh] overflow-y-auto"
              style={{ 
                position: 'absolute',
                left: `${modalPosition.x}px`,
                top: `${modalPosition.y}px`,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div 
                className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
              >
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white">Bulk Insert Tasks</h2>
                  <p className="text-white/70 text-sm mt-1">Select multiple tasks to insert at once • Drag to move</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowBulkTaskModal(false)
                    setSelectedTasks([])
                    setModalPosition({ x: 0, y: 0 })
                  }}
                  className="text-white hover:bg-white/10 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-4">
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Button
                    size="sm"
                    onClick={handleSelectAllTasks}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {selectedTasks.length === filteredTasks.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <span className="text-white/70 text-sm">
                    {selectedTasks.length} of {filteredTasks.length} tasks selected
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setShowBulkTaskModal(false)
                      setSelectedTasks([])
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleBulkInsertTasks(selectedTasks, selectedSectionId)}
                    disabled={selectedTasks.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Insert {selectedTasks.length} Tasks
                  </Button>
                </div>
              </div>

              <div className="space-y-0.5 max-h-[600px] overflow-y-auto">
                {filteredTasks.map(task => (
                  <div key={task._id} className="bg-white/5 rounded p-2 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task._id)}
                        onChange={() => handleTaskSelection(task._id)}
                        className="h-4 w-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <Badge className="bg-purple-500 text-white flex-shrink-0 text-xs px-2 py-0.5">{task.categoryName}</Badge>
                      <span className="text-white/60 text-xs flex-shrink-0">Used {task.usageCount}</span>
                      <p className="text-white/70 text-sm flex-1 truncate">{task.step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
        </div>
      )}

        {/* Insert Document ID Modal */}
        {showInsertDocIdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glassmorphism-card rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Add Document ID to Process Item</h2>
                  <p className="text-white/70 text-sm mt-1">Add Document ID to the section title (header badge) or insert into content area</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInsertDocIdModal(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-4">
                <Input
                  placeholder="Search document IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
            </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredDocumentIds.map(docId => (
                  <div key={docId._id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-green-500 text-white">{docId.docId}</Badge>
                    </div>
                        {docId.description && (
                          <p className="text-white/70 text-sm">{docId.description}</p>
                        )}
                    </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            handleInsertDocumentIdForProcessItem(docId, selectedSectionId)
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add to Title
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            handleInsertDocumentId(docId, selectedSectionId)
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Insert in Content
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
            </motion.div>
              </div>
        )}

        {/* Add Image Modal */}
        {showAddImageModal && (
          <div className="fixed inset-0 bg-red-900/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glassmorphism-card rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Add Image Link</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddImageModal(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="imageUrl" className="text-white">Image URL *</Label>
                  <Input
                    id="imageUrl"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                        </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => handleAddImage(selectedSectionId)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddImageModal(false)}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                            </div>
                        </div>
            </motion.div>
                      </div>
                    )}
                      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col space-y-3">
        {/* Scroll to Top Button */}
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg shadow-gray-500/25 rounded-full p-3 h-12 w-12 flex items-center justify-center"
          title="Scroll to Top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
        
        {/* Add Section Button */}
        <Button
          onClick={() => setShowAddSectionModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 rounded-full p-4 h-14 w-14 flex items-center justify-center"
          title="Add New Section"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}