'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Building, FileText, Calendar, Package, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface CustomerForm {
  customerName: string
  assemblyName: string
  assemblyRev: string
  drawingName: string
  drawingRev: string
  assemblyQuantity: number
  kitReceivedDate: string
  kitCompleteDate: string
  comments: string
}

export default function NewCustomerPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CustomerForm>()

  const onSubmit = async (data: CustomerForm) => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Customer created successfully!')
        router.push('/dashboard')
      } else {
        toast.error(result.error || 'Failed to create customer')
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error('An error occurred while creating customer')
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
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Create New Customer</h1>
                <p className="text-white opacity-80">Add a new customer and assembly project</p>
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
          <Card className="glassmorphism-card glassmorphism-card-hover">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <Building className="h-6 w-6 mr-3" />
                Customer Information
              </CardTitle>
              <CardDescription className="text-white opacity-80">
                Fill in the customer and assembly details
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer Name */}
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-white flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Customer Name *
                  </Label>
                  <Input
                    id="customerName"
                    type="text"
                    placeholder="Enter customer company name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500"
                    {...register('customerName', {
                      required: 'Customer name is required',
                      minLength: {
                        value: 2,
                        message: 'Customer name must be at least 2 characters'
                      }
                    })}
                  />
                  {errors.customerName && (
                    <p className="text-red-400 text-sm">{errors.customerName.message}</p>
                  )}
                </div>

                {/* Assembly Name */}
                <div className="space-y-2">
                  <Label htmlFor="assemblyName" className="text-white flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Assembly/Product Name *
                  </Label>
                  <Input
                    id="assemblyName"
                    type="text"
                    placeholder="Enter assembly or product name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500"
                    {...register('assemblyName', {
                      required: 'Assembly name is required',
                      minLength: {
                        value: 2,
                        message: 'Assembly name must be at least 2 characters'
                      }
                    })}
                  />
                  {errors.assemblyName && (
                    <p className="text-red-400 text-sm">{errors.assemblyName.message}</p>
                  )}
                </div>

                {/* Assembly Revision */}
                <div className="space-y-2">
                  <Label htmlFor="assemblyRev" className="text-white flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Assembly Revision *
                  </Label>
                  <Input
                    id="assemblyRev"
                    type="text"
                    placeholder="e.g., Rev A, V1.0, 2024.1"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500"
                    {...register('assemblyRev', {
                      required: 'Assembly revision is required',
                      minLength: {
                        value: 1,
                        message: 'Assembly revision must be at least 1 character'
                      }
                    })}
                  />
                  {errors.assemblyRev && (
                    <p className="text-red-400 text-sm">{errors.assemblyRev.message}</p>
                  )}
                </div>

                {/* Drawing Name */}
                <div className="space-y-2">
                  <Label htmlFor="drawingName" className="text-white flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Assembly Drawing Name *
                  </Label>
                  <Input
                    id="drawingName"
                    type="text"
                    placeholder="Enter assembly drawing name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500"
                    {...register('drawingName', {
                      required: 'Drawing name is required',
                      minLength: {
                        value: 2,
                        message: 'Drawing name must be at least 2 characters'
                      }
                    })}
                  />
                  {errors.drawingName && (
                    <p className="text-red-400 text-sm">{errors.drawingName.message}</p>
                  )}
                </div>

                {/* Drawing Revision */}
                <div className="space-y-2">
                  <Label htmlFor="drawingRev" className="text-white flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Drawing Revision *
                  </Label>
                  <Input
                    id="drawingRev"
                    type="text"
                    placeholder="e.g., Rev A, V1.0, 2024.1"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500"
                    {...register('drawingRev', {
                      required: 'Drawing revision is required',
                      minLength: {
                        value: 1,
                        message: 'Drawing revision must be at least 1 character'
                      }
                    })}
                  />
                  {errors.drawingRev && (
                    <p className="text-red-400 text-sm">{errors.drawingRev.message}</p>
                  )}
                </div>

                {/* Assembly Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="assemblyQuantity" className="text-white flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Assembly Quantity *
                  </Label>
                  <Input
                    id="assemblyQuantity"
                    type="number"
                    min="1"
                    placeholder="Enter number of boards to build"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500"
                    {...register('assemblyQuantity', {
                      required: 'Assembly quantity is required',
                      min: {
                        value: 1,
                        message: 'Assembly quantity must be at least 1'
                      }
                    })}
                  />
                  {errors.assemblyQuantity && (
                    <p className="text-red-400 text-sm">{errors.assemblyQuantity.message}</p>
                  )}
                </div>

                {/* Kit Received Date */}
                <div className="space-y-2">
                  <Label htmlFor="kitReceivedDate" className="text-white flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Kit Received Date *
                  </Label>
                  <Input
                    id="kitReceivedDate"
                    type="date"
                    className="bg-white/10 border-white/20 text-white focus:ring-blue-500"
                    {...register('kitReceivedDate', {
                      required: 'Kit received date is required'
                    })}
                  />
                  {errors.kitReceivedDate && (
                    <p className="text-red-400 text-sm">{errors.kitReceivedDate.message}</p>
                  )}
                </div>

                {/* Kit Complete Date */}
                <div className="space-y-2">
                  <Label htmlFor="kitCompleteDate" className="text-white flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Kit Complete Date *
                  </Label>
                  <Input
                    id="kitCompleteDate"
                    type="date"
                    className="bg-white/10 border-white/20 text-white focus:ring-blue-500"
                    {...register('kitCompleteDate', {
                      required: 'Kit complete date is required'
                    })}
                  />
                  {errors.kitCompleteDate && (
                    <p className="text-red-400 text-sm">{errors.kitCompleteDate.message}</p>
                  )}
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <Label htmlFor="comments" className="text-white flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comments
                  </Label>
                  <textarea
                    id="comments"
                    rows={4}
                    placeholder="Enter any additional comments or requirements"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    {...register('comments', {
                      maxLength: {
                        value: 500,
                        message: 'Comments cannot exceed 500 characters'
                      }
                    })}
                  />
                  {errors.comments && (
                    <p className="text-red-400 text-sm">{errors.comments.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Link href="/dashboard">
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
                    {isLoading ? 'Creating Customer...' : 'Create Customer'}
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
