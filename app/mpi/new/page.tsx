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
import { ArrowLeft, Plus, User, Building, FileText, Calendar, Eye, X } from 'lucide-react'
import toast from 'react-hot-toast'
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
  assemblyQuantity: number
  kitReceivedDate: string
  dateReleased: string
  pages: string
}

export default function NewMPIPage() {
  const [customerCompanies, setCustomerCompanies] = useState<CustomerCompany[]>([])
  const [existingJobNumbers, setExistingJobNumbers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
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
    fetchJobNumbers()
    generateJobNumber()
    generateMPINumber()
    // Set default values
    setValue('dateReleased', new Date().toLocaleDateString('en-US'))
    setValue('pages', '04')
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
      toast.error('Error loading customer companies')
    } finally {
      setIsLoadingCompanies(false)
    }
  }

  const fetchJobNumbers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/mpi/job-numbers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setExistingJobNumbers(data.oldJobNumbers || [])
      }
    } catch (error) {
      console.error('Error fetching job numbers:', error)
    }
  }

  const generateJobNumber = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/mpi/job-numbers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setValue('jobNumber', data.jobNumber)
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
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setValue('mpiNumber', data.mpiNumber)
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
      <main className="max-w-6xl mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glassmorphism-card glassmorphism-card-hover">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <Plus className="h-6 w-6 mr-3" />
                CUSTOMER INFORMATION
              </CardTitle>
              <CardDescription className="text-white opacity-80">
                Create a new Manufacturing Process Instruction document
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Header Section - Professional Layout */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 max-h-[80vh] overflow-y-auto">
                  <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-200 text-sm">
                      <strong>Note:</strong> Scroll down to see all form fields including Drawing Name, Drawing Rev, Assembly Quantity, and Kit Received Date.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Job No. */}
                      <div className="flex items-center space-x-4">
                        <Label className="text-white font-semibold min-w-[120px] text-right">
                          Job No.:
                        </Label>
                        <div className="flex-1">
                          <Input
                            type="text"
                            className="bg-white/10 border-white/20 text-white text-center font-mono"
                            {...register('jobNumber', { required: 'Job number is required' })}
                            readOnly
                          />
                        </div>
                      </div>

                      {/* Old Job No. */}
                      <div className="flex items-center space-x-4">
                        <Label className="text-white font-semibold min-w-[120px] text-right">
                          Old Job No.:
                        </Label>
                        <div className="flex-1">
                          <Select onValueChange={(value) => setValue('oldJobNumber', value)}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select or N/A" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="N/A">N/A</SelectItem>
                              {existingJobNumbers.map((jobNumber) => (
                                <SelectItem key={jobNumber} value={jobNumber}>
                                  {jobNumber}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Customer Name */}
                      <div className="flex items-center space-x-4">
                        <Label className="text-white font-semibold min-w-[120px] text-right">
                          Customer Name:
                  </Label>
                        <div className="flex-1">
                          <Select onValueChange={(value) => setValue('customerCompanyId', value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select customer company" />
                    </SelectTrigger>
                    <SelectContent>
                              {customerCompanies.length === 0 ? (
                                <SelectItem value="no-companies" disabled>
                                  No customer companies available
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
                        </div>
                      </div>

                      {/* Customer Assembly Name */}
                      <div className="flex items-center space-x-4">
                        <Label className="text-white font-semibold min-w-[120px] text-right">
                          Customer Assembly Name:
                        </Label>
                        <div className="flex-1">
                          <Input
                            type="text"
                            placeholder="e.g., Clock Module"
                            className="bg-white/10 border-white/20 text-white"
                            {...register('customerAssemblyName', { required: 'Customer assembly name is required' })}
                          />
                        </div>
                      </div>

                      {/* Assembly Rev */}
                      <div className="flex items-center space-x-4">
                        <Label className="text-white font-semibold min-w-[120px] text-right">
                          Assembly Rev:
                        </Label>
                        <div className="flex-1">
                          <Input
                            type="text"
                            placeholder="e.g., Rev 5, V1.0"
                            className="bg-white/10 border-white/20 text-white"
                            {...register('assemblyRev', { required: 'Assembly revision is required' })}
                          />
                        </div>
                      </div>

                      {/* Drawing Name */}
                      <div className="flex items-center space-x-4">
                        <Label className="text-white font-semibold min-w-[120px] text-right">
                          Drawing Name:
                        </Label>
                        <div className="flex-1">
                          <Input
                            type="text"
                            placeholder="e.g., DWG-001, Drawing A"
                            className="bg-white/10 border-white/20 text-white"
                            {...register('drawingName', { required: 'Drawing name is required' })}
                          />
                        </div>
                      </div>

                      {/* Drawing Rev */}
                      <div className="flex items-center space-x-4">
                        <Label className="text-white font-semibold min-w-[120px] text-right">
                          Drawing Rev:
                        </Label>
                        <div className="flex-1">
                          <Input
                            type="text"
                            placeholder="e.g., Rev A, V1.0"
                            className="bg-white/10 border-white/20 text-white"
                            {...register('drawingRev', { required: 'Drawing revision is required' })}
                          />
                        </div>
                      </div>

                      {/* Assembly Quantity */}
                      <div className="flex items-center space-x-4">
                        <Label className="text-white font-semibold min-w-[120px] text-right">
                          Assembly Quantity:
                        </Label>
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder="e.g., 100, 500"
                            min="1"
                            className="bg-white/10 border-white/20 text-white"
                            {...register('assemblyQuantity', { 
                              required: 'Assembly quantity is required',
                              min: { value: 1, message: 'Quantity must be at least 1' }
                            })}
                          />
                        </div>
                      </div>

                      {/* Kit Received Date */}
                      <div className="flex items-center space-x-4">
                        <Label className="text-white font-semibold min-w-[120px] text-right">
                          Kit Received Date:
                        </Label>
                        <div className="flex-1">
                          <Input
                            type="date"
                            className="bg-white/10 border-white/20 text-white"
                            {...register('kitReceivedDate', { required: 'Kit received date is required' })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* MPI No. */}
                      <div className="flex items-center space-x-4">
                        <Label className="text-white font-semibold min-w-[100px] text-right">
                          MPI No.:
                        </Label>
                        <div className="flex-1">
                          <Input
                            type="text"
                            className="bg-white/10 border-white/20 text-white text-center font-mono"
                            {...register('mpiNumber', { required: 'MPI number is required' })}
                            readOnly
                          />
                        </div>
                      </div>

                      {/* MPI Rev */}
                      <div className="flex items-center space-x-4">
                        <Label className="text-white font-semibold min-w-[100px] text-right">
                          MPI Rev:
                        </Label>
                        <div className="flex-1">
                          <Input
                            type="text"
                            placeholder="e.g., 0, Rev A"
                            className="bg-white/10 border-white/20 text-white text-center"
                            {...register('mpiVersion')}
                          />
                        </div>
                      </div>

                      {/* Date Released */}
                      <div className="flex items-center space-x-4">
                        <Label className="text-white font-semibold min-w-[100px] text-right">
                          Date Released:
                        </Label>
                        <div className="flex-1">
                          <Input
                            type="text"
                            className="bg-white/10 border-white/20 text-white text-center"
                            {...register('dateReleased', { required: 'Date released is required' })}
                          />
                        </div>
                      </div>

                      {/* Pages */}
                      <div className="flex items-center space-x-4">
                        <Label className="text-white font-semibold min-w-[100px] text-right">
                          Pages:
                        </Label>
                        <div className="flex-1">
                          <Input
                            type="text"
                            className="bg-white/10 border-white/20 text-white text-center"
                            {...register('pages', { required: 'Pages is required' })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Customer Company Details */}
                {selectedCustomerCompany && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-white/10 border border-white/20 rounded-lg"
                  >
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Selected Customer Company Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white opacity-80 text-sm">
                      <div>
                        <p><strong>Company:</strong> {selectedCustomerCompany.companyName}</p>
                      </div>
                      <div>
                        <p><strong>City:</strong> {selectedCustomerCompany.city}</p>
                      </div>
                      <div>
                        <p><strong>State:</strong> {selectedCustomerCompany.state}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Error Messages */}
                {Object.keys(errors).length > 0 && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <h4 className="text-red-200 font-semibold mb-2">Please fix the following errors:</h4>
                    <ul className="text-red-200 text-sm space-y-1">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field}>• {error?.message}</li>
                      ))}
                    </ul>
                </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-6">
                  <Link href="/dashboard">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-gray-900"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreview}
                      className="border-white text-white hover:bg-white hover:text-gray-900"
                      disabled={!selectedCustomerCompany}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
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
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-red-900/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glassmorphism-card rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                MPI Preview
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(false)}
                className="text-gray-600 dark:text-gray-400"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Preview Content */}
            <div className="space-y-6">
              {/* Header Section */}
              <div className="border-2 border-gray-300 rounded-lg p-6">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
                  CUSTOMER INFORMATION
                </h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-900 min-w-[120px] text-right">
                        Job No.:
                      </span>
                      <span className="font-mono bg-gray-100 px-3 py-1 rounded">
                        {watch('jobNumber') || 'U000001'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-900 min-w-[120px] text-right">
                        Old Job No.:
                      </span>
                      <span className="font-mono bg-gray-100 px-3 py-1 rounded">
                        {watch('oldJobNumber') || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-900 min-w-[120px] text-right">
                        Customer Name:
                      </span>
                      <span className="bg-gray-100 px-3 py-1 rounded">
                        {selectedCustomerCompany?.companyName || 'Select Customer'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-900 min-w-[120px] text-right">
                        Customer Assembly Name:
                      </span>
                      <span className="bg-gray-100 px-3 py-1 rounded">
                        {watch('customerAssemblyName') || 'Enter assembly name'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-900 min-w-[120px] text-right">
                        Assembly Rev:
                      </span>
                      <span className="bg-gray-100 px-3 py-1 rounded">
                        {watch('assemblyRev') || 'Enter assembly revision'}
                      </span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-900 min-w-[100px] text-right">
                        MPI No.:
                      </span>
                      <span className="font-mono bg-gray-100 px-3 py-1 rounded">
                        {watch('mpiNumber') || 'MPI000001'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-900 min-w-[100px] text-right">
                        MPI Rev:
                      </span>
                      <span className="bg-gray-100 px-3 py-1 rounded">
                        {watch('mpiVersion') || '0'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-900 min-w-[100px] text-right">
                        Date Released:
                      </span>
                      <span className="bg-gray-100 px-3 py-1 rounded">
                        {watch('dateReleased') || new Date().toLocaleDateString('en-US')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-900 min-w-[100px] text-right">
                        Pages:
                      </span>
                      <span className="bg-gray-100 px-3 py-1 rounded">
                        {watch('pages') || '04'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Company Details */}
              {selectedCustomerCompany && (
                <div className="border border-gray-300 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Customer Company Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
                    <div>
                      <p><strong>Company:</strong> {selectedCustomerCompany.companyName}</p>
                    </div>
                    <div>
                      <p><strong>City:</strong> {selectedCustomerCompany.city}</p>
                    </div>
                    <div>
                      <p><strong>State:</strong> {selectedCustomerCompany.state}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Customer Data (Not shown in printed MPI) */}
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Additional Customer Data (Database Only)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <p><strong>Drawing Name:</strong> {watch('drawingName') || 'Enter drawing name'}</p>
                  </div>
                  <div>
                    <p><strong>Drawing Rev:</strong> {watch('drawingRev') || 'Enter drawing revision'}</p>
                  </div>
                  <div>
                    <p><strong>Assembly Quantity:</strong> {watch('assemblyQuantity') || 'Enter quantity'}</p>
                  </div>
                  <div>
                    <p><strong>Kit Received Date:</strong> {watch('kitReceivedDate') || 'Select date'}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2 italic">
                  * These fields are saved to the database but will not appear in the printed MPI document.
                </p>
              </div>

              {/* Default Sections Preview */}
              <div className="border border-gray-300 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  MPI Sections (Default)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>1. Applicable Documents</div>
                  <div>2. General Instructions</div>
                  <div>3. Kit Release</div>
                  <div>4. SMT Preparation/Planning</div>
                  <div>5. Paste Print</div>
                  <div>6. Reflow</div>
                  <div>7. First Article Approval</div>
                  <div>8. SMT Additional Instructions</div>
                  <div>9. Wave Solder</div>
                  <div>10. Through Hole Stuffing</div>
                  <div>11. 2nd Operations</div>
                  <div>12. Selective Solder</div>
                  <div>13. Wash and Dry</div>
                  <div>14. Flying Probe Test</div>
                  <div>15. Solder Paste Inspection</div>
                  <div>16. Automatic Optical Inspection (AOI)</div>
                  <div>17. Final QC</div>
                  <div>18. Ship and Delivery</div>
                  <div>19. Packaging</div>
                  <div>20. Test</div>
                </div>
              </div>
            </div>

            {/* Preview Actions */}
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-300">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                Close Preview
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false)
                  // Trigger form submission
                  const form = document.querySelector('form') as HTMLFormElement
                  if (form) {
                    form.requestSubmit()
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!selectedCustomerCompany}
              >
                Create MPI
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
