'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, FileText, Tag, Folder } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface StepForm {
  title: string
  content: string
  category: string
  section: string
}

const categories = [
  'Kitting',
  'SMT Single Side',
  'SMT Double Side',
  '2nd Operations',
  'Through Hole',
  'Wash',
  'Test',
  'AOI',
  'Final QC',
  'Packaging',
  'General',
  'Other'
]

const sections = [
  'Applicable Documents',
  'General Instructions',
  'Misc',
  'Kit Release',
  'SMT Preparation',
  'SMT Paste Print',
  'SMT Special Instructions',
  'SMT Reflow',
  'SMT First Article',
  'SMT Production Quantity',
  'SMT Additional Instructions',
  'Wash',
  '2nd Operations',
  'Test Section',
  'AOI',
  'Final QC',
  'Ship and Delivery',
  'Improvement Section'
]

export default function NewStepPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<StepForm>()

  const category = watch('category')
  const section = watch('section')

  const onSubmit = async (data: StepForm) => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Global step created successfully!')
        router.push('/admin/dashboard')
      } else {
        toast.error(result.error || 'Failed to create global step')
      }
    } catch (error) {
      console.error('Error creating global step:', error)
      toast.error('An error occurred while creating global step')
    } finally {
      setIsLoading(false)
    }
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
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Create Global Step</h1>
                <p className="text-white opacity-80">Add a new reusable step to the global library</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glassmorphism border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <FileText className="h-6 w-6 mr-3" />
                Step Information
              </CardTitle>
              <CardDescription className="text-white opacity-80">
                Create a reusable step that engineers can use in their MPIs
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Step Title *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter a descriptive title for this step"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500"
                    {...register('title', {
                      required: 'Step title is required',
                      minLength: {
                        value: 5,
                        message: 'Title must be at least 5 characters'
                      }
                    })}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm">{errors.title.message}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    Category *
                  </Label>
                  <Select onValueChange={(value) => setValue('category', value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select operation category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-400 text-sm">{errors.category.message}</p>
                  )}
                </div>

                {/* Section */}
                <div className="space-y-2">
                  <Label htmlFor="section" className="text-white flex items-center">
                    <Folder className="h-4 w-4 mr-2" />
                    MPI Section *
                  </Label>
                  <Select onValueChange={(value) => setValue('section', value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select MPI section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((sec) => (
                        <SelectItem key={sec} value={sec}>
                          {sec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.section && (
                    <p className="text-red-400 text-sm">{errors.section.message}</p>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-white flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Step Content *
                  </Label>
                  <textarea
                    id="content"
                    rows={8}
                    placeholder="Enter the detailed step instructions..."
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    {...register('content', {
                      required: 'Step content is required',
                      minLength: {
                        value: 10,
                        message: 'Content must be at least 10 characters'
                      }
                    })}
                  />
                  {errors.content && (
                    <p className="text-red-400 text-sm">{errors.content.message}</p>
                  )}
                </div>

                {/* Preview */}
                {(category && section && watch('title') && watch('content')) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-white/10 border border-white/20 rounded-lg"
                  >
                    <h4 className="text-white font-semibold mb-3">Step Preview</h4>
                    <div className="space-y-2 text-white opacity-80">
                      <p><strong>Title:</strong> {watch('title')}</p>
                      <p><strong>Category:</strong> {category}</p>
                      <p><strong>Section:</strong> {section}</p>
                      <div>
                        <strong>Content:</strong>
                        <p className="mt-1 text-sm">{watch('content')}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Link href="/admin/dashboard">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-gray-900"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Step...' : 'Create Global Step'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
