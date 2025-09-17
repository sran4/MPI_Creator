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

interface Form {
  _id: string
  formId: string
  formRev: string
  description?: string
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
  formId: string
  formRev: string
  dateReleased: string
  pages: string
}

export default function NewMPIPage() {
  console.log('🎯 NewMPIPage component loaded')
  
  const [customerCompanies, setCustomerCompanies] = useState<CustomerCompany[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [existingJobNumbers, setExistingJobNumbers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [isLoadingForms, setIsLoadingForms] = useState(true)
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
  
  // Debug: Log forms state changes
  useEffect(() => {
    console.log('📋 Forms state updated:', forms)
  }, [forms])

  // Debug: Log customer companies state changes
  useEffect(() => {
    console.log('🏢 Customer companies state updated:', customerCompanies)
  }, [customerCompanies])

  useEffect(() => {
    fetchCustomerCompanies()
    fetchForms()
    fetchExistingJobNumbers()
    // Set default pages estimate
    setValue('pages', '4')
  }, [])

  // Token validation function
  const validateToken = (token: string | null): boolean => {
    if (!token) {
      console.error('❌ No token found')
      return false
    }
    
    if (!token.includes('.')) {
      console.error('❌ Invalid token format - missing dots')
      localStorage.removeItem('token')
      return false
    }
    
    try {
      // Basic JWT structure validation (3 parts separated by dots)
      const parts = token.split('.')
      if (parts.length !== 3) {
        console.error('❌ Invalid token format - wrong number of parts')
        localStorage.removeItem('token')
        return false
      }
      
      console.log('✅ Token format is valid')
      return true
    } catch (error) {
      console.error('❌ Token validation error:', error)
      localStorage.removeItem('token')
      return false
    }
  }

  // Separate useEffect for generating numbers after token is available
  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log('🔑 Token check:', token ? 'Token exists' : 'No token found')
    
    if (validateToken(token)) {
      console.log('🚀 Starting auto-generation of numbers...')
      // Auto-generate Job No. and MPI No. on page load
      generateJobNumber()
      generateMPINumber()
    } else {
      console.error('❌ Invalid token - cannot generate numbers')
      toast.error('Please log in to access this page')
      router.push('/login')
    }
  }, [])

  const fetchCustomerCompanies = async () => {
    try {
      console.log('🔄 Fetching customer companies...')
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ No token available for customer companies')
        toast.error('Please log in to load customer companies')
        setIsLoadingCompanies(false)
        return
      }
      
      // Validate token format
      if (!token.includes('.')) {
        console.error('❌ Invalid token format')
        localStorage.removeItem('token')
        toast.error('Invalid session. Please log in again.')
        router.push('/login')
        setIsLoadingCompanies(false)
        return
      }
      
      const response = await fetch('/api/customer-companies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('📡 Customer companies response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Customer companies data received:', data)
        setCustomerCompanies(data.customerCompanies || [])
        console.log('✅ Customer companies set in state:', data.customerCompanies?.length || 0, 'companies')
        if (data.customerCompanies?.length === 0) {
          console.log('ℹ️ No customer companies found. Please add some companies first.')
        }
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to fetch customer companies:', errorData)
        if (response.status === 401) {
          localStorage.removeItem('token')
          toast.error('Session expired. Please log in again.')
          router.push('/login')
        } else {
          toast.error('Failed to fetch customer companies')
        }
      }
    } catch (error) {
      console.error('❌ Error fetching customer companies:', error)
      toast.error('An error occurred while fetching customer companies')
    } finally {
      setIsLoadingCompanies(false)
    }
  }

  const fetchForms = async () => {
    try {
      console.log('🔄 Fetching forms...')
      const response = await fetch('/api/forms')
      console.log('📡 Forms response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Forms data received:', data)
        setForms(data.forms || [])
        console.log('✅ Forms set in state:', data.forms?.length || 0, 'forms')
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to fetch forms:', errorData)
        toast.error('Failed to fetch forms')
      }
    } catch (error) {
      console.error('❌ Error fetching forms:', error)
      toast.error('An error occurred while fetching forms')
    } finally {
      setIsLoadingForms(false)
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
      console.log('🔄 Generating job number...')
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ No token available for job number generation')
        toast.error('Please log in to generate job numbers')
        return
      }
      
      // Validate token format
      if (!token.includes('.')) {
        console.error('❌ Invalid token format')
        localStorage.removeItem('token')
        toast.error('Invalid session. Please log in again.')
        router.push('/login')
        return
      }
      
      const response = await fetch('/api/mpi/job-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('📡 Job number response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Job number data received:', data)
        const formattedJobNumber = data.jobNumber.replace(/([A-Z])(\d+)/, '$1-$2')
        console.log('✅ Setting job number:', formattedJobNumber)
        setValue('jobNumber', formattedJobNumber)
        toast.success('Job number generated successfully!')
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to generate job number:', errorData)
        if (response.status === 401) {
          localStorage.removeItem('token')
          toast.error('Session expired. Please log in again.')
          router.push('/login')
        } else {
          toast.error('Failed to generate job number')
        }
      }
    } catch (error) {
      console.error('❌ Error generating job number:', error)
      toast.error('Error generating job number')
    }
  }

  const generateMPINumber = async () => {
    try {
      console.log('🔄 Generating MPI number...')
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ No token available for MPI number generation')
        toast.error('Please log in to generate MPI numbers')
        return
      }
      
      // Validate token format
      if (!token.includes('.')) {
        console.error('❌ Invalid token format')
        localStorage.removeItem('token')
        toast.error('Invalid session. Please log in again.')
        router.push('/login')
        return
      }
      
      const response = await fetch('/api/mpi/mpi-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('📡 MPI number response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('📋 MPI number data received:', data)
        const formattedMPINumber = data.mpiNumber.replace(/([A-Z]+)(\d+)/, '$1-$2')
        console.log('✅ Setting MPI number:', formattedMPINumber)
        setValue('mpiNumber', formattedMPINumber)
        toast.success('MPI number generated successfully!')
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to generate MPI number:', errorData)
        if (response.status === 401) {
          localStorage.removeItem('token')
          toast.error('Session expired. Please log in again.')
          router.push('/login')
        } else {
          toast.error('Failed to generate MPI number')
        }
      }
    } catch (error) {
      console.error('❌ Error generating MPI number:', error)
      toast.error('Error generating MPI number')
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
      console.log('🔄 Starting MPI creation process...')
      
      // Use the form values for job number and MPI number (they can be edited by the user)
      let jobNumber = data.jobNumber
      let mpiNumber = data.mpiNumber
      
      // If the fields are empty, generate new numbers
      if (!jobNumber || jobNumber.trim() === '') {
        console.log('📞 Generating new job number...')
        const jobResponse = await fetch('/api/mpi/job-numbers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const jobData = await jobResponse.json()
        jobNumber = jobData.jobNumber.replace(/([A-Z])(\d+)/, '$1-$2')
        console.log('🔢 Generated Job Number:', jobNumber)
      } else {
        console.log('🔢 Using existing Job Number:', jobNumber)
      }
      
      if (!mpiNumber || mpiNumber.trim() === '') {
        console.log('📞 Generating new MPI number...')
        const mpiResponse = await fetch('/api/mpi/mpi-numbers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const mpiData = await mpiResponse.json()
        mpiNumber = mpiData.mpiNumber.replace(/([A-Z]+)(\d+)/, '$1-$2')
        console.log('🔢 Generated MPI Number:', mpiNumber)
      } else {
        console.log('🔢 Using existing MPI Number:', mpiNumber)
      }

      const token = localStorage.getItem('token')
      const response = await fetch('/api/mpi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerCompanyId: data.customerCompanyId,
          jobNumber: jobNumber,
          oldJobNumber: data.oldJobNumber,
          mpiNumber: mpiNumber,
          mpiVersion: data.mpiVersion,
          formId: data.formId,        // Add this line
          formRev: data.formRev,      // Add this line
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
                                                
                        {/* Debug Section - Remove after testing */}
                        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                          <h3 className="text-yellow-400 font-bold mb-2">Debug Panel</h3>
                          <div className="flex space-x-2">
                            <Button 
                              type="button" 
                              onClick={() => {
                                console.log('🧪 Manual test - generating job number')
                                generateJobNumber()
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Test Job Number
                            </Button>
                            <Button 
                              type="button" 
                              onClick={() => {
                                console.log('🧪 Manual test - generating MPI number')
                                generateMPINumber()
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Test MPI Number
                            </Button>
                            <Button 
                              type="button" 
                              onClick={() => {
                                console.log('🧪 Manual test - fetching forms')
                                fetchForms()
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Test Forms
                            </Button>
                            <Button 
                              type="button" 
                              onClick={() => {
                                console.log('🧪 Manual test - fetching companies')
                                fetchCustomerCompanies()
                              }}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              Test Companies
                            </Button>
                            <Button 
                              type="button" 
                              onClick={async () => {
                                console.log('🧪 Manual test - testing database')
                                try {
                                  const response = await fetch('/api/test')
                                  const data = await response.json()
                                  console.log('🧪 Test API response:', data)
                                } catch (error) {
                                  console.error('❌ Test API error:', error)
                                }
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Test DB
                            </Button>
                          </div>
                          <div className="mt-2 text-sm text-yellow-300">
                            <p>Forms: {forms.length} | Companies: {customerCompanies.length}</p>
                            <p>Loading Forms: {isLoadingForms ? 'Yes' : 'No'} | Loading Companies: {isLoadingCompanies ? 'Yes' : 'No'}</p>
                          </div>
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
                                  className="bg-white/10 border-white/20 text-white"
                                  {...register('jobNumber')}
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
                            </div>
  
                            <div className="space-y-2">
                              <Label htmlFor="oldJobNumber" className="text-white font-medium">
                                Old Job No.
                              </Label>
                              <Select onValueChange={(value) => setValue('oldJobNumber', value === 'none' ? '' : value)}>
                                <SelectTrigger className="bg-white/10 border-white/20 text-white ">
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
                                  className="bg-white/10 border-white/20 text-white"
                                  {...register('mpiNumber')}
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
                            </div>
  
                            <div className="space-y-2">
                              <Label htmlFor="mpiVersion" className="text-white font-medium">
                                MPI Rev <span className="text-red-400">*</span>
                              </Label>
                              <Input
                                id="mpiVersion"
                                type="text"
                                className="bg-white/10 border-white/20 text-white "
                                {...register('mpiVersion', { required: 'MPI revision is required' })}
                              />
                              {errors.mpiVersion && (
                                <p className="text-red-400 text-sm">{errors.mpiVersion.message}</p>
                              )}
                            </div>
                          </div>
                          {/* Row 3: Form ID & Form Revision */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="formId" className="text-white">
                                <FileText className="h-4 w-4 inline mr-2" />
                                Form ID
                              </Label>
                              <Select onValueChange={(value) => {
                                setValue('formId', value)
                                // Auto-fill form revision when form is selected (optional)
                                const selectedForm = forms.find(form => form._id === value)
                                if (selectedForm) {
                                  // Only auto-fill if the field is empty
                                  const currentFormRev = watch('formRev')
                                  if (!currentFormRev || currentFormRev.trim() === '') {
                                    setValue('formRev', selectedForm.formRev)
                                  }
                                }
                              }}>
                                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                  <SelectValue placeholder="Select a form..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {forms.length === 0 ? (
                                    <SelectItem value="no-forms" disabled>
                                      {isLoadingForms ? 'Loading forms...' : 'No forms available'}
                                    </SelectItem>
                                  ) : (
                                    forms.map((form) => (
                                      <SelectItem key={form._id} value={form._id}>
                                        {form.formId}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="formRev" className="text-white">
                                <FileText className="h-4 w-4 inline mr-2" />
                                Form Revision
                              </Label>
                              <Input
                                id="formRev"
                                type="text"
                                className="bg-white/10 border-white/20 text-white"
                                placeholder="Enter form revision"
                                {...register('formRev')}
                              />
                            </div>
                          </div>
  
                          {/* Row 4: Customer Name & Assembly Quantity */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="customerCompanyId" className="text-white font-medium">
                                Customer Company <span className="text-red-400">*</span>
                              </Label>
                              <Select onValueChange={(value) => setValue('customerCompanyId', value)}>
                                <SelectTrigger className="bg-white/10 border-white/20 text-white ">
                                  <SelectValue placeholder="Select customer company" />
                                </SelectTrigger>
                                <SelectContent>
                                  {customerCompanies.length === 0 ? (
                                    <SelectItem value="no-companies" disabled>
                                      {isLoadingCompanies ? 'Loading companies...' : 'No companies available'}
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
                                className="bg-white/10 border-white/20 text-white "
                                {...register('assemblyQuantity', { required: 'Assembly quantity is required' })}
                              />
                              {errors.assemblyQuantity && (
                                <p className="text-red-400 text-sm">{errors.assemblyQuantity.message}</p>
                              )}
                            </div>
                          </div>
  
                          {/* Row 5: Customer Assembly Name & Assembly Rev */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="customerAssemblyName" className="text-white font-medium">
                                Customer Assembly Name <span className="text-red-400">*</span>
                              </Label>
                              <Input
                                id="customerAssemblyName"
                                type="text"
                                className="bg-white/10 border-white/20 text-white "
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
                                className="bg-white/10 border-white/20 text-white "
                                {...register('assemblyRev', { required: 'Assembly revision is required' })}
                              />
                              {errors.assemblyRev && (
                                <p className="text-red-400 text-sm">{errors.assemblyRev.message}</p>
                              )}
                            </div>
                          </div>
  
                          {/* Row 6: Drawing Name & Drawing Rev */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="drawingName" className="text-white font-medium">
                                Drawing Name <span className="text-red-400">*</span>
                              </Label>
                              <Input
                                id="drawingName"
                                type="text"
                                className="bg-white/10 border-white/20 text-white "
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
                                className="bg-white/10 border-white/20 text-white "
                                {...register('drawingRev', { required: 'Drawing revision is required' })}
                              />
                              {errors.drawingRev && (
                                <p className="text-red-400 text-sm">{errors.drawingRev.message}</p>
                              )}
                            </div>
                          </div>
  
                          {/* Row 7: Kit Received Date & Date Released */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="kitReceivedDate" className="text-white font-medium">
                                Kit Received Date <span className="text-red-400">*</span>
                              </Label>
                              <Input
                                id="kitReceivedDate"
                                type="date"
                                className="bg-white/10 border-white/20 text-white "
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
                                className="bg-white/10 border-white/20 text-white "
                                {...register('dateReleased', { required: 'Date released is required' })}
                                defaultValue={new Date().toISOString().split('T')[0]}
                              />
                              {errors.dateReleased && (
                                <p className="text-red-400 text-sm">{errors.dateReleased.message}</p>
                              )}
                            </div>
                          </div>
                          {/* Row 8: Pages (Full Width) */}
                          <div className="space-y-2">
                            <Label htmlFor="pages" className="text-white font-medium">
                              Pages <span className="text-red-400">*</span>
                              <span className="text-white/60 text-sm ml-2">(Estimated - will be calculated after editing)</span>
                            </Label>
                            <Input
                              id="pages"
                              type="text"
                              placeholder="4"
                              className="bg-white/10 border-white/20 text-white"
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
                              <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                                <h1 className="text-3xl font-bold mb-4 text-gray-900">Manufacturing Process Instructions</h1>
                              </div>

                              {/* Assembly Details Section */}
                              <div className="mb-8 border-2 border-gray-300 rounded-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">Assembly Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900">
                                  <div>
                                    <span className="font-semibold">MPI Number:</span> {watch('mpiNumber') || 'MPI-000001'}
                                  </div>
                                  <div>
                                    <span className="font-semibold">MPI Rev:</span> {watch('mpiVersion') || 'A'}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Job No:</span> {watch('jobNumber') || 'U-000001'}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Old Job No:</span> {watch('oldJobNumber') || 'N/A'}
                                  </div>
                                 
                                  <div>
                                    <span className="font-semibold">Customer:</span> {customerCompanies.find(c => c._id === watch('customerCompanyId'))?.companyName || 'Not selected'}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Assembly Quantity:</span> { watch('assemblyQuantity') || 'Not selected'}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Customer Assembly Name:</span> {watch('customerAssemblyName') || 'Not specified'}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Customer Assembly Rev:</span> {watch('assemblyRev') || 'N/A'}
                                  </div>    
                                  <div>
                                    <span className="font-semibold">Drawing Name:</span> {watch('drawingName') || 'N/A'}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Drawing Rev:</span> {watch('drawingRev') || 'N/A'}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Kit receive date:</span> {watch('kitReceivedDate') ? new Date(watch('kitReceivedDate')).toLocaleDateString() : 'N/A'}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Kit release date:</span> {watch('dateReleased') ? new Date(watch('dateReleased')).toLocaleDateString() : 'N/A'}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Pages:</span> {watch('pages') || '4'}
                                  </div>                                  
                                </div>                                
                              </div>

                              {/* Applicable Documents Section */}
                              <div className="mb-6 border-2 border-gray-300 rounded-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">Applicable Documents</h2>
                                <div className="text-gray-500 italic">
                                  No content added to this section yet.
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







