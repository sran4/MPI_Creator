'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building, Eye, EyeOff, FileText, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface CustomerCompany {
  _id: string
  companyName: string
  city: string
  state: string
}

interface NewMPIForm {
  customerCompanyId: string
  jobNumber: string
  oldJobNumber: string
  mpiNumber: string
  mpiVersion: string
  customerAssemblyName: string
  assemblyRev: string
  drawingName: string
  drawingRev: string
  assemblyQuantity: string
  kitReceivedDate: string
  dateReleased: string
  pages: string
}

export default function NewMPIPage() {
  const [customerCompanies, setCustomerCompanies] = useState<CustomerCompany[]>([])
  const [existingJobNumbers, setExistingJobNumbers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [showPreview, setShowPreview] = useState(true)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<NewMPIForm>()

  const selectedCustomerCompanyId = watch('customerCompanyId')

  useEffect(() => {
    fetchCustomerCompanies()
    fetchExistingJobNumbers()
    // Auto-generate Job No. and MPI No. on page load
    generateJobNumber()
    generateMPINumber()
    // Set default pages estimate
    setValue('pages', '4')
  }, [])

  const fetchCustomerCompanies = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/customer-companies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCustomerCompanies(data.customerCompanies || [])
      } else {
        toast.error('Failed to fetch customer companies')
      }
    } catch (error) {
      console.error('Error fetching customer companies:', error)
      toast.error('An error occurred while fetching customer companies')
    } finally {
      setIsLoadingCompanies(false)
    }
  }

  const fetchExistingJobNumbers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/mpi/job-numbers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setExistingJobNumbers(data.jobNumbers || [])
      }
    } catch (error) {
      console.error('Error fetching existing job numbers:', error)
    }
  }

  const generateJobNumber = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/mpi/job-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const formattedJobNumber = data.jobNumber.replace(/([A-Z])(\d+)/, '$1-$2')
        setValue('jobNumber', formattedJobNumber)
      }
    } catch (error) {
      console.error('Error generating job number:', error)
    }
  }

  const generateMPINumber = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/mpi/mpi-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const formattedMPINumber = data.mpiNumber.replace(/([A-Z]+)(\d+)/, '$1-$2')
        setValue('mpiNumber', formattedMPINumber)
      }
    } catch (error) {
      console.error('Error generating MPI number:', error)
    }
  }

  const onSubmit = async (data: NewMPIForm) => {
    setIsLoading(true)
    
    // Validate that a valid customer company is selected
    if (!data.customerCompanyId || data.customerCompanyId === 'no-companies') {
      toast.error('Please select a valid customer company')
      setIsLoading(false)
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/mpi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerCompanyId: data.customerCompanyId,
          jobNumber: data.jobNumber,
          oldJobNumber: data.oldJobNumber,
          mpiNumber: data.mpiNumber,
          mpiVersion: data.mpiVersion,
          customerAssemblyName: data.customerAssemblyName,
          assemblyRev: data.assemblyRev,
          drawingName: data.drawingName,
          drawingRev: data.drawingRev,
          assemblyQuantity: data.assemblyQuantity,
          kitReceivedDate: data.kitReceivedDate,
          dateReleased: data.dateReleased,
          pages: data.pages
        }),
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

  const selectedCustomerCompany = customerCompanies.find(c => c._id === selectedCustomerCompanyId)

  const handlePreview = () => {
    setShowPreview(true)
  }

  const getFormData = () => {
    const form = document.querySelector('form') as HTMLFormElement
    if (!form) return null
    
    const formData = new FormData(form)
    return {
      jobNumber: formData.get('jobNumber') as string,
      oldJobNumber: formData.get('oldJobNumber') as string,
      mpiNumber: formData.get('mpiNumber') as string,
      mpiVersion: formData.get('mpiVersion') as string,
      customerCompanyId: formData.get('customerCompanyId') as string,
      customerAssemblyNumber: formData.get('customerAssemblyNumber') as string,
      assemblyName: formData.get('assemblyName') as string,
      dateReleased: formData.get('dateReleased') as string,
      pages: formData.get('pages') as string,
    }
    
  }

  if (isLoadingCompanies) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-5 rounded-full floating"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-2s'}}></div>
          <div className="absolute bottom-32 left-40 w-40 h-40 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-4s'}}></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-6s'}}></div>
  
        <main className="relative z-10 container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glassmorphism-card border-white/20">
              <CardHeader className="text-center">
                <div className="flex items-center justify-between">
                  <Link href="/dashboard" className="flex items-center text-white/80 hover:text-white transition-colors">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Dashboard
                  </Link>
                  <CardTitle className="text-2xl font-bold text-white flex items-center justify-center">
                    <FileText className="h-6 w-6 mr-3" />
                    Create New MPI
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center space-x-2"
                  >
                    {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Split Screen Layout */}
                  <div className={`${showPreview ? 'xl:flex xl:gap-6' : ''}`}>
                    {/* Form Section - 60% on large screens */}
                    <div className={`${showPreview ? 'xl:w-3/5' : 'w-full'} flex flex-col`}>
                      {/* Header Section - Professional Layout */}
                      <div className="bg-white/5 border border-white/10 rounded-lg p-6 max-h-[80vh] overflow-y-auto">
                        <div className="mb-6 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-200 text-sm">
                            <strong>Note:</strong> All fields are required. Fill out the form completely to create your MPI document.
                          </p>
                        </div>
                        
                        {/* Optimized Input Layout - 2 Inputs Per Row */}
                        <div className="space-y-6">
                          {/* Row 1: Job No. & Old Job No. */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="jobNumber" className="text-white font-medium">
                                Job No. <span className="text-red-400">*</span>
                              </Label>
                              <div className="flex space-x-2">
                                <Input
                                  id="jobNumber"
                                  type="text"
                                  className="bg-white/10 border-white/20 text-white opacity-60 cursor-not-allowed"
                                  {...register('jobNumber', { required: 'Job number is required' })}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={generateJobNumber}
                                  className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              {errors.jobNumber && (
                                <p className="text-red-400 text-sm">{errors.jobNumber.message}</p>
                              )}
                            </div>
  
                            <div className="space-y-2">
                              <Label htmlFor="oldJobNumber" className="text-white font-medium">
                                Old Job No.
                              </Label>
                              <Select onValueChange={(value) => setValue('oldJobNumber', value === 'none' ? '' : value)}>
                                <SelectTrigger className="bg-white/10 border-white/20 text-white opacity-60 cursor-not-allowed">
                                  <SelectValue placeholder="Select old job number (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  {existingJobNumbers.map((jobNumber) => (
                                    <SelectItem key={jobNumber} value={jobNumber}>
                                      {jobNumber}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
  
                          {/* Row 2: MPI No. & MPI Rev */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="mpiNumber" className="text-white font-medium">
                                MPI No. <span className="text-red-400">*</span>
                              </Label>
                              <div className="flex space-x-2">
                                <Input
                                  id="mpiNumber"
                                  type="text"
                                  className="bg-white/10 border-white/20 text-white opacity-60 cursor-not-allowed"
                                  {...register('mpiNumber', { required: 'MPI number is required' })}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={generateMPINumber}
                                  className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              {errors.mpiNumber && (
                                <p className="text-red-400 text-sm">{errors.mpiNumber.message}</p>
                              )}
                            </div>
  
                            <div className="space-y-2">
                              <Label htmlFor="mpiVersion" className="text-white font-medium">
                                MPI Rev <span className="text-red-400">*</span>
                              </Label>
                              <Input
                                id="mpiVersion"
                                type="text"
                                className="bg-white/10 border-white/20 text-white opacity-60 cursor-not-allowed"
                                {...register('mpiVersion', { required: 'MPI revision is required' })}
                              />
                              {errors.mpiVersion && (
                                <p className="text-red-400 text-sm">{errors.mpiVersion.message}</p>
                              )}
                            </div>
                          </div>
  
                          {/* Row 3: Customer Name & Assembly Quantity */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="customerCompanyId" className="text-white font-medium">
                                Customer Company <span className="text-red-400">*</span>
                              </Label>
                              <Select onValueChange={(value) => setValue('customerCompanyId', value)}>
                                <SelectTrigger className="bg-white/10 border-white/20 text-white opacity-60 cursor-not-allowed">
                                  <SelectValue placeholder="Select customer company" />
                                </SelectTrigger>
                                <SelectContent>
                                  {customerCompanies.length === 0 ? (
                                    <SelectItem value="no-companies" disabled>
                                      No companies available
                                    </SelectItem>
                                  ) : (
                                    customerCompanies.map((company) => (
                                      <SelectItem key={company._id} value={company._id}>
                                        {company.companyName} - {company.city}, {company.state}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              {errors.customerCompanyId && (
                                <p className="text-red-400 text-sm">{errors.customerCompanyId.message}</p>
                              )}
                            </div>
  
                            <div className="space-y-2">
                              <Label htmlFor="assemblyQuantity" className="text-white font-medium">
                                Assembly Quantity <span className="text-red-400">*</span>
                              </Label>
                              <Input
                                id="assemblyQuantity"
                                type="text"
                                className="bg-white/10 border-white/20 text-white opacity-60 cursor-not-allowed"
                                {...register('assemblyQuantity', { required: 'Assembly quantity is required' })}
                              />
                              {errors.assemblyQuantity && (
                                <p className="text-red-400 text-sm">{errors.assemblyQuantity.message}</p>
                              )}
                            </div>
                          </div>
  
                          {/* Row 4: Customer Assembly Name & Assembly Rev */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="customerAssemblyName" className="text-white font-medium">
                                Customer Assembly Name <span className="text-red-400">*</span>
                              </Label>
                              <Input
                                id="customerAssemblyName"
                                type="text"
                                className="bg-white/10 border-white/20 text-white opacity-60 cursor-not-allowed"
                                {...register('customerAssemblyName', { required: 'Customer assembly name is required' })}
                              />
                              {errors.customerAssemblyName && (
                                <p className="text-red-400 text-sm">{errors.customerAssemblyName.message}</p>
                              )}
                            </div>
  
                            <div className="space-y-2">
                              <Label htmlFor="assemblyRev" className="text-white font-medium">
                                Assembly Rev <span className="text-red-400">*</span>
                              </Label>
                              <Input
                                id="assemblyRev"
                                type="text"
                                className="bg-white/10 border-white/20 text-white opacity-60 cursor-not-allowed"
                                {...register('assemblyRev', { required: 'Assembly revision is required' })}
                              />
                              {errors.assemblyRev && (
                                <p className="text-red-400 text-sm">{errors.assemblyRev.message}</p>
                              )}
                            </div>
                          </div>
  
                          {/* Row 5: Drawing Name & Drawing Rev */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="drawingName" className="text-white font-medium">
                                Drawing Name <span className="text-red-400">*</span>
                              </Label>
                              <Input
                                id="drawingName"
                                type="text"
                                className="bg-white/10 border-white/20 text-white opacity-60 cursor-not-allowed"
                                {...register('drawingName', { required: 'Drawing name is required' })}
                              />
                              {errors.drawingName && (
                                <p className="text-red-400 text-sm">{errors.drawingName.message}</p>
                              )}
                            </div>
  
                            <div className="space-y-2">
                              <Label htmlFor="drawingRev" className="text-white font-medium">
                                Drawing Rev <span className="text-red-400">*</span>
                              </Label>
                              <Input
                                id="drawingRev"
                                type="text"
                                className="bg-white/10 border-white/20 text-white opacity-60 cursor-not-allowed"
                                {...register('drawingRev', { required: 'Drawing revision is required' })}
                              />
                              {errors.drawingRev && (
                                <p className="text-red-400 text-sm">{errors.drawingRev.message}</p>
                              )}
                            </div>
                          </div>
  
                          {/* Row 6: Kit Received Date & Date Released */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="kitReceivedDate" className="text-white font-medium">
                                Kit Received Date <span className="text-red-400">*</span>
                              </Label>
                              <Input
                                id="kitReceivedDate"
                                type="date"
                                className="bg-white/10 border-white/20 text-white opacity-60 cursor-not-allowed"
                                {...register('kitReceivedDate', { required: 'Kit received date is required' })}
                              />
                              {errors.kitReceivedDate && (
                                <p className="text-red-400 text-sm">{errors.kitReceivedDate.message}</p>
                              )}
                            </div>
  
                            <div className="space-y-2">
                              <Label htmlFor="dateReleased" className="text-white font-medium">
                                Date Released <span className="text-red-400">*</span>
                              </Label>
                              <Input
                                id="dateReleased"
                                type="date"
                                className="bg-white/10 border-white/20 text-white opacity-60 cursor-not-allowed"
                                {...register('dateReleased', { required: 'Date released is required' })}
                                defaultValue={new Date().toISOString().split('T')[0]}
                              />
                              {errors.dateReleased && (
                                <p className="text-red-400 text-sm">{errors.dateReleased.message}</p>
                              )}
                            </div>
                          </div>
  
                          {/* Row 7: Pages (Full Width) */}
                          <div className="space-y-2">
                            <Label htmlFor="pages" className="text-white font-medium">
                              Pages <span className="text-red-400">*</span>
                              <span className="text-white/60 text-sm ml-2">(Estimated - will be calculated after editing)</span>
                            </Label>
                            <Input
                              id="pages"
                              type="text"
                              className="bg-white/10 border-white/20 text-white opacity-60 cursor-not-allowed"
                              disabled={true}
                              value="4"
                              {...register('pages', { required: 'Pages is required' })}
                            />
                          </div>
  
                          {/* Buttons */}
                          <div className="flex space-x-4 justify-end pt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => router.push('/dashboard')}
                              className="text-white border-white/20 hover:bg-white/10"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={isLoading || customerCompanies.length === 0}
                            >
                              {isLoading ? 'Creating MPI...' : 'Create MPI'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
  
                    {/* Preview Section - 40% on large screens */}
                    {showPreview && (
                      <div className="xl:w-2/5 mt-8 xl:mt-0">
                        <div className="glassmorphism-card p-4 h-fit">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Live Preview</h3>
                            <span className="text-white/70 text-sm">Print Version</span>
                          </div>
                          <div className="bg-white rounded-lg p-6 shadow-lg max-h-[80vh] overflow-y-auto">
                            <div className="text-black">
                              {/* MPI Header */}
                              <div className="text-center mb-6 border-b pb-4">
                                <h1 className="text-2xl font-bold mb-2">MPI/Traveler Combo</h1>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>MPI Number:</strong> {watch('mpiNumber') || 'MPI-000001'}
                                  </div>
                                  <div>
                                    <strong>Version:</strong> {watch('mpiVersion') || 'Rev A'}
                                  </div>
                                  <div>
                                    <strong>Job Number:</strong> {watch('jobNumber') || 'U-000001'}
                                  </div>
                                  <div>
                                    <strong>Assembly:</strong> {watch('customerAssemblyName') || 'Not specified'}
                                  </div>
                                  <div>
                                    <strong>Company:</strong> {customerCompanies.find(c => c._id === watch('customerCompanyId'))?.companyName || 'Not selected'}
                                  </div>
                                  <div>
                                    <strong>Quantity:</strong> {watch('assemblyQuantity') || '1'}
                                  </div>
                                </div>
                              </div>
  
                              {/* Customer Information Section */}
                              <div className="mb-6">
                                <h2 className="text-xl font-bold mb-4 text-center border-b pb-2">CUSTOMER INFORMATION</h2>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Job No.:</strong> {watch('jobNumber') || 'U-000001'}
                                  </div>
                                  <div>
                                    <strong>Old Job No.:</strong> {watch('oldJobNumber') || 'N/A'}
                                  </div>
                                  <div>
                                    <strong>MPI No.:</strong> {watch('mpiNumber') || 'MPI-000001'}
                                  </div>
                                  <div>
                                    <strong>MPI Rev:</strong> {watch('mpiVersion') || 'A'}
                                  </div>
                                  <div>
                                    <strong>Customer Name:</strong> {customerCompanies.find(c => c._id === watch('customerCompanyId'))?.companyName || 'Not selected'}
                                  </div>
                                  <div>
                                    <strong>Assembly Quantity:</strong> {watch('assemblyQuantity') || '1'}
                                  </div>
                                  <div>
                                    <strong>Customer Assembly Name:</strong> {watch('customerAssemblyName') || 'Not specified'}
                                  </div>
                                  <div>
                                    <strong>Assembly Rev:</strong> {watch('assemblyRev') || 'A'}
                                  </div>
                                  <div>
                                    <strong>Drawing Name:</strong> {watch('drawingName') || 'Not specified'}
                                  </div>
                                  <div>
                                    <strong>Drawing Rev:</strong> {watch('drawingRev') || 'A'}
                                  </div>
                                  <div>
                                    <strong>Kit Received Date:</strong> {watch('kitReceivedDate') || 'MM/DD/YYYY'}
                                  </div>
                                  <div>
                                    <strong>Date Released:</strong> {watch('dateReleased') || 'MM/DD/YYYY'}
                                  </div>
                                  <div className="col-span-2">
                                    <strong>Pages:</strong> {watch('pages') || '1'}
                                  </div>
                                </div>
                              </div>
  
                              {/* Sample Process Section */}
                              <div className="border border-gray-300 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-3">Sample Process Section</h3>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-start space-x-3">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold min-w-[60px] text-center">
                                      Step 1
                                    </span>
                                    <p>Sample process step description will appear here...</p>
                                  </div>
                                  <div className="flex items-start space-x-3">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold min-w-[60px] text-center">
                                      Step 2
                                    </span>
                                    <p>Another process step will be displayed here...</p>
                                  </div>
                                </div>
                              </div>
  
                              {/* Print Instructions */}
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                                <h3 className="font-semibold text-yellow-800 mb-2">Print Instructions</h3>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                  <li>• This preview shows how your MPI will look when printed</li>
                                  <li>• All form data will be populated in the final document</li>
                                  <li>• Process steps will be added in the editor after creation</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
  )
}







