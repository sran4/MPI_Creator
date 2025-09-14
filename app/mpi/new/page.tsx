'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, User, Building, FileText, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Customer {
  _id: string
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

interface NewMPIForm {
  customerId: string
  mpiNumber: string
  mpiVersion: string
}

export default function NewMPIPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<NewMPIForm>()

  const selectedCustomerId = watch('customerId')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      } else {
        toast.error('Failed to fetch customers')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Error loading customers')
    } finally {
      setIsLoadingCustomers(false)
    }
  }

  const onSubmit = async (data: NewMPIForm) => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/mpi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('MPI created successfully!')
        router.push(`/mpi/${result.mpi._id}/edit`)
      } else {
        toast.error(result.error || 'Failed to create MPI')
      }
    } catch (error) {
      console.error('Error creating MPI:', error)
      toast.error('An error occurred while creating MPI')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCustomer = customers.find(c => c._id === selectedCustomerId)

  if (isLoadingCustomers) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
                <h1 className="text-3xl font-bold text-white mb-2">Create New MPI</h1>
                <p className="text-white opacity-80">Set up a new Manufacturing Process Instruction</p>
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
                <Plus className="h-6 w-6 mr-3" />
                MPI Information
              </CardTitle>
              <CardDescription className="text-white opacity-80">
                Fill in the basic information for your new MPI
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer Selection */}
                <div className="space-y-2">
                  <Label htmlFor="customerId" className="text-white flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Customer & Assembly *
                  </Label>
                  <Select onValueChange={(value) => setValue('customerId', value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select customer and assembly" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.length === 0 ? (
                        <SelectItem value="" disabled>
                          No customers available. Create a customer first.
                        </SelectItem>
                      ) : (
                        customers.map((customer) => (
                          <SelectItem key={customer._id} value={customer._id}>
                            {customer.customerName} - {customer.assemblyName} (Rev: {customer.assemblyRev})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.customerId && (
                    <p className="text-red-400 text-sm">{errors.customerId.message}</p>
                  )}
                  {customers.length === 0 && (
                    <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-200 text-sm">
                        You need to create a customer first before creating an MPI.
                      </p>
                      <Link href="/customers/new">
                        <Button variant="outline" size="sm" className="mt-2 border-yellow-500 text-yellow-200 hover:bg-yellow-500/20">
                          Create Customer
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Selected Customer Details */}
                {selectedCustomer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-white/10 border border-white/20 rounded-lg"
                  >
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Selected Customer Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white opacity-80 text-sm">
                      <div>
                        <p><strong>Customer:</strong> {selectedCustomer.customerName}</p>
                        <p><strong>Assembly:</strong> {selectedCustomer.assemblyName}</p>
                        <p><strong>Assembly Rev:</strong> {selectedCustomer.assemblyRev}</p>
                      </div>
                      <div>
                        <p><strong>Drawing:</strong> {selectedCustomer.drawingName}</p>
                        <p><strong>Drawing Rev:</strong> {selectedCustomer.drawingRev}</p>
                        <p><strong>Quantity:</strong> {selectedCustomer.assemblyQuantity}</p>
                      </div>
                    </div>
                    {selectedCustomer.comments && (
                      <div className="mt-3">
                        <p><strong>Comments:</strong> {selectedCustomer.comments}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* MPI Number */}
                <div className="space-y-2">
                  <Label htmlFor="mpiNumber" className="text-white flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    MPI Number *
                  </Label>
                  <Input
                    id="mpiNumber"
                    type="text"
                    placeholder="e.g., MPI-2024-001"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500"
                    {...register('mpiNumber', {
                      required: 'MPI number is required',
                      pattern: {
                        value: /^[A-Z0-9-_]+$/,
                        message: 'MPI number can only contain uppercase letters, numbers, hyphens, and underscores'
                      }
                    })}
                  />
                  {errors.mpiNumber && (
                    <p className="text-red-400 text-sm">{errors.mpiNumber.message}</p>
                  )}
                </div>

                {/* MPI Version */}
                <div className="space-y-2">
                  <Label htmlFor="mpiVersion" className="text-white flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    MPI Version *
                  </Label>
                  <Input
                    id="mpiVersion"
                    type="text"
                    placeholder="e.g., Rev A, V1.0, 2024.1"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500"
                    {...register('mpiVersion', {
                      required: 'MPI version is required',
                      minLength: {
                        value: 1,
                        message: 'Version must be at least 1 character'
                      }
                    })}
                  />
                  {errors.mpiVersion && (
                    <p className="text-red-400 text-sm">{errors.mpiVersion.message}</p>
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
                    disabled={isLoading || customers.length === 0}
                  >
                    {isLoading ? 'Creating MPI...' : 'Create MPI'}
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
