'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  Download,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  BookOpen,
  Search,
  X,
  Save as SaveIcon,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

interface MPISection {
  id: string
  title: string
  content: string
  order: number
  isCollapsed: boolean
  images: string[]
}

interface MPI {
  _id: string
  mpiNumber: string
  mpiVersion: string
  customerId: {
    customerName: string
    assemblyName: string
  }
  sections: MPISection[]
  status: string
  createdAt: string
  updatedAt: string
}

interface Step {
  _id: string
  title: string
  content: string
  order: number
  isActive: boolean
}

interface StepCategory {
  _id: string
  categoryName: string
  description: string
  steps: Step[]
  usageCount: number
  createdAt: string
  updatedAt: string
}

export default function MPIEditorPage({ params }: { params: { id: string } }) {
  const [mpi, setMpi] = useState<MPI | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [showStepLibrary, setShowStepLibrary] = useState(false)
  const [stepCategories, setStepCategories] = useState<StepCategory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentSectionId, setCurrentSectionId] = useState('')
  const [showSaveStepModal, setShowSaveStepModal] = useState(false)
  const [stepToSave, setStepToSave] = useState({ title: '', content: '', category: '', section: '' })
  const [showPreview, setShowPreview] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchMPI()
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
        const data = await response.json()
        setMpi(data.mpi)
        // Expand first few sections by default
        const defaultExpanded = data.mpi.sections.slice(0, 3).map((s: MPISection) => s.id)
        setExpandedSections(new Set(defaultExpanded))
      } else {
        toast.error('Failed to fetch MPI')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching MPI:', error)
      toast.error('Error loading MPI')
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!mpi) return

    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/mpi/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          sections: mpi.sections.map((section, index) => ({
            ...section,
            order: index + 1
          }))
        }),
      })

      if (response.ok) {
        toast.success('MPI saved successfully!')
      } else {
        toast.error('Failed to save MPI')
      }
    } catch (error) {
      console.error('Error saving MPI:', error)
      toast.error('Error saving MPI')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const updateSectionContent = (sectionId: string, content: string) => {
    if (!mpi) return
    
    setMpi({
      ...mpi,
      sections: mpi.sections.map(section =>
        section.id === sectionId ? { ...section, content } : section
      )
    })
  }

  const addStepToSection = (sectionId: string) => {
    if (!mpi) return
    
    const section = mpi.sections.find(s => s.id === sectionId)
    if (!section) return
    
    const currentSteps = section.content.split('\n').filter(step => step.trim())
    const stepNumber = currentSteps.length + 1
    const newStep = `${stepNumber}. `
    
    const newContent = section.content.trim() 
      ? `${section.content}\n${newStep}`
      : newStep
    
    updateSectionContent(sectionId, newContent)
  }

  const addImageToSection = (sectionId: string) => {
    // For now, just show a placeholder message
    toast.success('Image upload feature coming soon!')
  }

  const clearSectionContent = (sectionId: string) => {
    if (!mpi) return
    if (confirm('Are you sure you want to clear this section content?')) {
      updateSectionContent(sectionId, '')
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!mpi || !result.destination) return

    const { source, destination } = result
    
    if (source.index === destination.index) return

    const newSections = Array.from(mpi.sections)
    const [reorderedSection] = newSections.splice(source.index, 1)
    newSections.splice(destination.index, 0, reorderedSection)

    // Update the order property for each section
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index + 1
    }))

    setMpi({
      ...mpi,
      sections: updatedSections
    })
  }

  const fetchStepCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/step-categories-simple', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStepCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching step categories:', error)
    }
  }

  const openStepLibrary = (sectionId: string) => {
    setCurrentSectionId(sectionId)
    setShowStepLibrary(true)
    fetchStepCategories()
  }

  const insertStep = async (step: Step, categoryName: string) => {
    if (!mpi) return
    
    const section = mpi.sections.find(s => s.id === currentSectionId)
    if (!section) return
    
    const newContent = section.content.trim() 
      ? `${section.content}\n${step.content}`
      : step.content
    
    updateSectionContent(currentSectionId, newContent)
    
    // Increment usage count for the category
    try {
      const token = localStorage.getItem('token')
      const category = stepCategories.find(cat => cat.categoryName === categoryName)
      if (category) {
        await fetch(`/api/step-categories/${category._id}/use`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Error updating usage count:', error)
    }
    
    setShowStepLibrary(false)
    toast.success('Step inserted successfully!')
  }

  const deleteStep = async (stepId: string, categoryId: string) => {
    if (!confirm('Are you sure you want to delete this step? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/step-categories/${categoryId}/steps`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stepId })
      })

      if (response.ok) {
        toast.success('Step deleted successfully!')
        fetchStepCategories() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(`Failed to delete step: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting step:', error)
      toast.error('Error deleting step')
    }
  }

  const saveStepToLibrary = async () => {
    if (!stepToSave.title || !stepToSave.content || !stepToSave.category) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/step-categories-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          categoryName: stepToSave.category,
          description: stepToSave.section,
          stepTitle: stepToSave.title,
          stepContent: stepToSave.content
        })
      })

      if (response.ok) {
        toast.success('Step saved to library!')
        setShowSaveStepModal(false)
        setStepToSave({ title: '', content: '', category: '', section: '' })
        fetchStepCategories()
      } else {
        const errorData = await response.json()
        console.error('Save step error:', errorData)
        toast.error(`Failed to save step: ${errorData.error || 'Unknown error'}`)
        if (errorData.details) {
          console.error('Error details:', errorData.details)
        }
      }
    } catch (error) {
      console.error('Error saving step:', error)
      toast.error('Error saving step')
    }
  }

  const mapSectionTitleToEnum = (title: string): string => {
    // Since we removed strict enum validation, we can use the title directly
    // Just ensure it's not empty and has reasonable length
    return title.trim() || 'General Instructions'
  }

  const openSaveStepModal = (sectionId: string) => {
    if (!mpi) return
    
    const section = mpi.sections.find(s => s.id === sectionId)
    if (!section || !section.content.trim()) {
      toast.error('Please add some content to save as a step')
      return
    }

    setStepToSave({
      title: `${section.title} - Step`,
      content: section.content,
      category: 'General',
      section: mapSectionTitleToEnum(section.title)
    })
    setShowSaveStepModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-500'
      case 'in-review': return 'bg-blue-500'
      case 'approved': return 'bg-green-500'
      case 'archived': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'in-review': return 'In Review'
      case 'approved': return 'Approved'
      case 'archived': return 'Archived'
      default: return status
    }
  }

  const exportToWord = async () => {
    if (!mpi) return

    setIsExporting(true)
    try {
      // Create the document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: "Manufacturing Process Instructions",
                  bold: true,
                  size: 32,
                }),
              ],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // MPI Information
            new Paragraph({
              children: [
                new TextRun({
                  text: `MPI Number: ${mpi.mpiNumber}`,
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Version: ${mpi.mpiVersion}`,
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Status: ${getStatusText(mpi.status)}`,
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Customer Information
            new Paragraph({
              children: [
                new TextRun({
                  text: "Customer Information",
                  bold: true,
                  size: 28,
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Customer: ${mpi.customerId.customerName}`,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Assembly: ${mpi.customerId.assemblyName}`,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Created: ${new Date(mpi.createdAt).toLocaleDateString()}`,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Last Updated: ${new Date(mpi.updatedAt).toLocaleDateString()}`,
                  size: 24,
                }),
              ],
              spacing: { after: 400 },
            }),

            // Sections
            ...mpi.sections.map((section, index) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. ${section.title}`,
                    bold: true,
                    size: 26,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),

              ...(section.content ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Instructions:",
                      bold: true,
                      size: 24,
                    }),
                  ],
                  spacing: { after: 100 },
                }),

                // Parse and format individual steps
                ...section.content.split('\n')
                  .filter(step => step.trim()) // Remove empty lines
                  .map((step, stepIndex) => {
                    const trimmedStep = step.trim()
                    
                    // Check if step already has a number (like "1. Step content")
                    const hasNumber = /^\d+\.\s/.test(trimmedStep)
                    
                    return new Paragraph({
                      children: [
                        new TextRun({
                          text: hasNumber ? trimmedStep : `${stepIndex + 1}. ${trimmedStep}`,
                          size: 22,
                        }),
                      ],
                      spacing: { after: 100 },
                      indent: { left: 400 }, // Indent steps for better readability
                    })
                  }),

                new Paragraph({
                  children: [
                    new TextRun({
                      text: "", // Empty paragraph for spacing
                    }),
                  ],
                  spacing: { after: 200 },
                }),
              ] : [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "No content added to this section yet.",
                      italics: true,
                      size: 22,
                    }),
                  ],
                  spacing: { after: 200 },
                }),
              ]),

              ...(section.images.length > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Images: ${section.images.length} image(s) attached`,
                      bold: true,
                      size: 22,
                    }),
                  ],
                  spacing: { after: 200 },
                }),
              ] : []),
            ]).flat(),
          ],
        }],
      })

      // Generate and download the document
      const buffer = await Packer.toBuffer(doc)
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      })
      
      const fileName = `MPI_${mpi.mpiNumber}_v${mpi.mpiVersion}_${new Date().toISOString().split('T')[0]}.docx`
      saveAs(blob, fileName)
      
      toast.success('MPI exported to Word document successfully!')
    } catch (error) {
      console.error('Error exporting to Word:', error)
      toast.error('Failed to export MPI to Word document')
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading MPI...</div>
      </div>
    )
  }

  if (!mpi) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">MPI not found</div>
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
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">MPI Editor</h1>
                <div className="flex items-center space-x-4">
                  <p className="text-white opacity-80">{mpi.mpiNumber}</p>
                  <Badge className={`${getStatusColor(mpi.status)} text-white`}>
                    {getStatusText(mpi.status)}
                  </Badge>
                  <span className="text-white opacity-60">v{mpi.mpiVersion}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="border-2 border-white text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white backdrop-blur-sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open(`/mpi/${params.id}/print-preview`, '_blank')}
                className="border-2 border-white text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white backdrop-blur-sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Print Preview
              </Button>
              <Button 
                variant="outline"
                onClick={exportToWord}
                disabled={isExporting}
                className="border-2 border-white text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white backdrop-blur-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Word'}
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-8">
        {/* MPI Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glassmorphism rounded-xl p-6 mb-8 border-2 border-white bg-white/5 print:border-2 print:border-black print:bg-white print:rounded-none print:shadow-none"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
            <div className="p-4 border-2 border-white rounded-lg bg-white/5 print:border-2 print:border-black print:bg-white print:rounded-none">
              <h3 className="text-lg font-semibold mb-2 border-b-2 border-white pb-2 print:border-b-2 print:border-black print:text-black">Customer Information</h3>
              <p className="print:text-black"><strong>Customer:</strong> {mpi.customerId.customerName}</p>
              <p className="print:text-black"><strong>Assembly:</strong> {mpi.customerId.assemblyName}</p>
            </div>
            <div className="p-4 border-2 border-white rounded-lg bg-white/5 print:border-2 print:border-black print:bg-white print:rounded-none">
              <h3 className="text-lg font-semibold mb-2 border-b-2 border-white pb-2 print:border-b-2 print:border-black print:text-black">MPI Details</h3>
              <p className="print:text-black"><strong>Created:</strong> {new Date(mpi.createdAt).toLocaleDateString()}</p>
              <p className="print:text-black"><strong>Last Updated:</strong> {new Date(mpi.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Sections */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {mpi.sections.map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className={`${snapshot.isDragging ? 'rotate-2 scale-105' : ''} transition-transform duration-200`}
                        >
                          <Card className="glassmorphism border-2 border-white shadow-lg bg-white/5 print:border-black print:border-2 print:bg-white print:shadow-none">
                <CardHeader 
                  className="cursor-pointer hover:bg-white/10 transition-colors border-b-2 border-white bg-white/5 print:border-b-2 print:border-black print:bg-white"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/10 transition-colors" title="Drag to reorder">
                        <GripVertical className="h-5 w-5 text-white opacity-60 hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex items-center space-x-2">
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="h-4 w-4 text-white" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-white" />
                        )}
                        <CardTitle className="text-white font-semibold print:text-black">{section.title}</CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {section.images.length > 0 && (
                        <Badge className="bg-blue-500 text-white">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          {section.images.length}
                        </Badge>
                      )}
                      <Badge className="bg-green-500 text-white">
                        <FileText className="h-3 w-3 mr-1" />
                        {section.content.length} chars
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                {expandedSections.has(section.id) && (
                  <CardContent className="border-t-2 border-white bg-white/3 print:border-t-2 print:border-black print:bg-white">
                    <div className="space-y-4 p-2 border-2 border-white rounded-lg bg-white/2 print:border-2 print:border-black print:bg-white print:rounded-none">
                      <div>
                        <label className="block text-white text-sm font-semibold mb-2 print:text-black">
                          Section Content
                        </label>
                        <textarea
                          value={section.content}
                          onChange={(e) => updateSectionContent(section.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              e.preventDefault()
                              addStepToSection(section.id)
                            }
                          }}
                          className="w-full h-32 px-3 py-2 bg-white/10 border-2 border-white rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 resize-none shadow-inner print:border-2 print:border-black print:bg-white print:text-black print:rounded-none"
                          placeholder="Enter section content... (Ctrl+Enter to add new step)"
                        />
                        {section.content && (
                          <div className="mt-2 text-white opacity-60 text-sm print:text-black print:opacity-100">
                            {section.content.split('\n').filter(step => step.trim()).length} step(s) in this section
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border-2 border-white rounded-lg bg-white/5 print:border-2 print:border-black print:bg-white print:rounded-none">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addImageToSection(section.id)}
                            className="border-2 border-white text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white backdrop-blur-sm"
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Add Image
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addStepToSection(section.id)}
                            className="border-2 border-white text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white backdrop-blur-sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Step
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStepLibrary(section.id)}
                            className="border-2 border-blue-400 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-300 backdrop-blur-sm"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Step Library
                          </Button>
                          {section.content && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openSaveStepModal(section.id)}
                                className="border-2 border-green-400 text-green-400 bg-green-500/10 hover:bg-green-500/20 hover:text-green-300 hover:border-green-300 backdrop-blur-sm"
                              >
                                <SaveIcon className="h-4 w-4 mr-2" />
                                Save Step
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => clearSectionContent(section.id)}
                                className="border-2 border-red-400 text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 hover:border-red-300 backdrop-blur-sm"
                              >
                                Clear
                              </Button>
                            </>
                          )}
                        </div>
                        <div className="text-white opacity-80 text-sm font-medium print:text-black print:opacity-100">
                          Order: {section.order}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
                          </Card>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </motion.div>
      </main>

      {/* Step Library Modal */}
      {showStepLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glassmorphism rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Step Library</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowStepLibrary(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex space-x-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search steps by title, content, category, or section..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-white/10 border-2 border-white/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 pr-8 bg-white/10 border-2 border-white/30 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                >
                <option value="">All Categories</option>
                {stepCategories.map(category => (
                  <option key={category._id} value={category.categoryName}>
                    {category.categoryName}
                  </option>
                ))}
                </select>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Debug Info */}
            <div className="mb-4 p-2 bg-blue-500/10 rounded text-xs text-blue-300">
              <strong>Available Categories:</strong> {stepCategories.map(cat => cat.categoryName).join(', ')}
              {selectedCategory && <><br/><strong>Selected:</strong> "{selectedCategory}"</>}
              <br/><strong>Total Categories:</strong> {stepCategories.length}
              {selectedCategory && (
                <>
                  <br/><strong>Steps in "{selectedCategory}":</strong> {
                    stepCategories.find(cat => cat.categoryName === selectedCategory)?.steps.length || 0
                  }
                </>
              )}
            </div>

            {/* Steps List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stepCategories
                .filter(category => {
                  // Filter by selected category
                  const matchesCategory = !selectedCategory || category.categoryName === selectedCategory
                  return matchesCategory
                })
                .map(category => (
                  <div key={category._id} className="glassmorphism rounded-lg p-4 border border-white/20">
                    <div className="mb-3">
                      <h3 className="text-white font-bold text-lg mb-1">{category.categoryName}</h3>
                      {category.description && (
                        <p className="text-white/70 text-sm mb-2">{category.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-white/60">
                        <span>Steps: {category.steps.length}</span>
                        <span>Used: {category.usageCount} times</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {category.steps
                        .filter(step => {
                          // Filter steps by search query
                          if (!searchQuery) return true
                          return step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 step.content.toLowerCase().includes(searchQuery.toLowerCase())
                        })
                        .map((step) => (
                          <div key={step._id} className="bg-white/5 rounded p-3 border border-white/10">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-white font-medium mb-1">{step.title}</h4>
                                <p className="text-white/70 text-sm">{step.content}</p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  onClick={() => insertStep(step, category.categoryName)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  size="sm"
                                >
                                  Insert
                                </Button>
                                <Button
                                  onClick={() => deleteStep(step._id, category._id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  size="sm"
                                  variant="destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              
              {stepCategories.length === 0 && (
                <div className="text-center text-white/60 py-8">
                  No step categories found. Create your first step by saving content from a section.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Step Modal */}
      {showSaveStepModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glassmorphism rounded-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Save Step to Library</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSaveStepModal(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Step Title</label>
                <input
                  type="text"
                  value={stepToSave.title}
                  onChange={(e) => setStepToSave({ ...stepToSave, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border-2 border-white/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                  placeholder="Enter step title..."
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">Category</label>
                <select
                  value={stepToSave.category}
                  onChange={(e) => setStepToSave({ ...stepToSave, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border-2 border-white/30 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                >
                  <option value="">Select a category...</option>
                  <option value="Applicable Documents">Applicable Documents</option>
                  <option value="General Instructions">General Instructions</option>
                  <option value="General">General</option>
                  <option value="Kit Release">Kit Release</option>
                  <option value="SMT Preparation/Planning">SMT Preparation/Planning</option>
                  <option value="Paste Print">Paste Print</option>
                  <option value="Reflow">Reflow</option>
                  <option value="First Article Approval">First Article Approval</option>
                  <option value="SMT Additional Instructions">SMT Additional Instructions</option>
                  <option value="Production Quantity Approval">Production Quantity Approval</option>
                  <option value="Wave Solder">Wave Solder</option>
                  <option value="Through Hole Stuffing">Through Hole Stuffing</option>
                  <option value="2nd Operations">2nd Operations</option>
                  <option value="Selective Solder">Selective Solder</option>
                  <option value="Wash and Dry">Wash and Dry</option>
                  <option value="Flying Probe Test">Flying Probe Test</option>
                  <option value="AOI Test">AOI Test</option>
                  <option value="TH Stuffing">TH Stuffing</option>
                  <option value="Final QC">Final QC</option>
                  <option value="Shipping and Delivery">Shipping and Delivery</option>
                  <option value="Packaging">Packaging</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">Section</label>
                <input
                  type="text"
                  value={stepToSave.section}
                  onChange={(e) => setStepToSave({ ...stepToSave, section: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border-2 border-white/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                  placeholder="Enter section name (e.g., SMT Preparation and Planning)"
                />
                <div className="mt-1 text-xs text-white/60">
                  Common sections: SMT Preparation, Kit Release, 2nd Operations, Test Section, etc.
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">Step Content</label>
                <textarea
                  value={stepToSave.content}
                  onChange={(e) => setStepToSave({ ...stepToSave, content: e.target.value })}
                  className="w-full h-32 px-3 py-2 bg-white/10 border-2 border-white/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 resize-none"
                  placeholder="Step content..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveStepModal(false)}
                  className="border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 hover:border-white/60"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveStepToLibrary}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Save Step
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glassmorphism rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">MPI Preview</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={exportToWord}
                  disabled={isExporting}
                  className="border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 hover:border-white/60"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Word'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 hover:border-white/60"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-120px)] print:overflow-visible print:max-h-none">
              {/* MPI Header */}
              <div className="glassmorphism rounded-lg p-6 mb-6 print:bg-white print:text-black print:border print:border-gray-300">
                <div className="text-center text-white print:text-black">
                  <h1 className="text-3xl font-bold mb-2">Manufacturing Process Instructions</h1>
                  <div className="flex items-center justify-center space-x-6 text-lg">
                    <div>
                      <span className="font-semibold">MPI Number:</span> {mpi.mpiNumber}
                    </div>
                    <div>
                      <span className="font-semibold">Version:</span> {mpi.mpiVersion}
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span> 
                      <Badge className={`${getStatusColor(mpi.status)} text-white ml-2 print:bg-gray-200 print:text-black`}>
                        {getStatusText(mpi.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="glassmorphism rounded-lg p-6 mb-6 print:bg-white print:text-black print:border print:border-gray-300">
                <h2 className="text-xl font-bold text-white mb-4 print:text-black">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white print:text-black">
                  <div>
                    <span className="font-semibold">Customer:</span> {mpi.customerId.customerName}
                  </div>
                  <div>
                    <span className="font-semibold">Assembly:</span> {mpi.customerId.assemblyName}
                  </div>
                  <div>
                    <span className="font-semibold">Created:</span> {new Date(mpi.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold">Last Updated:</span> {new Date(mpi.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                {mpi.sections.map((section, index) => (
                  <div key={section.id} className="glassmorphism rounded-lg p-6 print:bg-white print:text-black print:border print:border-gray-300 print:break-inside-avoid">
                    <h3 className="text-xl font-bold text-white mb-4 print:text-black">
                      {index + 1}. {section.title}
                    </h3>
                    
                    {section.content && (
                      <div className="text-white print:text-black">
                        <h4 className="font-semibold mb-2">Instructions:</h4>
                        <div className="bg-white/10 rounded-lg p-4 whitespace-pre-wrap print:bg-gray-50 print:border print:border-gray-200">
                          {section.content}
                        </div>
                      </div>
                    )}

                    {section.images.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-white mb-2 print:text-black">Images:</h4>
                        <div className="flex space-x-2">
                          {section.images.map((image, imgIndex) => (
                            <div key={imgIndex} className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center print:bg-gray-200 print:border print:border-gray-300">
                              <ImageIcon className="h-8 w-8 text-white/60 print:text-gray-600" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!section.content && section.images.length === 0 && (
                      <div className="text-white/60 italic print:text-gray-500">
                        No content added to this section yet.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
