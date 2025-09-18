'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion } from 'framer-motion'
import { ArrowLeft, Building, Calendar, Eye, FileText, Hash, Printer, Save, User, X } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

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

interface Engineer {
  _id: string
  fullName: string
  email: string
}

interface MPI {
  _id: string
  mpiNumber: string
  jobNumber: string
  customerAssemblyName: string
  assemblyRev: string
  drawingName: string
  drawingRev: string
  assemblyQuantity: number
  kitReceivedDate: string
  dateReleased: string
  pages: string
  status: 'draft' | 'in-review' | 'approved' | 'rejected' | 'archived'
  customerCompanyId: string
  engineerId: string
  formId?: string
  formRev?: string
}

interface AdminMPIEditForm {
  customerCompanyId: string
  jobNumber: string
  mpiNumber: string
  formId: string
  formRev: string
  customerAssemblyName: string
  assemblyRev: string
  drawingName: string
  drawingRev: string
  assemblyQuantity: string
  kitReceivedDate: string
  dateReleased: string
  pages: string
  engineerId: string
}

export default function AdminMPIEditPage() {
  const [mpi, setMpi] = useState<MPI | null>(null)
  const [customerCompanies, setCustomerCompanies] = useState<CustomerCompany[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const params = useParams()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<AdminMPIEditForm>({
    mode: 'onChange'
  })

  useEffect(() => {
    if (params.id) {
      initializeData()
    }
  }, [params.id])

  const initializeData = async () => {
    try {
      await Promise.all([
        fetchMPI(),
        fetchCustomerCompanies(),
        fetchForms(),
        fetchEngineers()
      ])
    } catch (error) {
      console.error('Error initializing data:', error)
      toast.error('Failed to initialize form data')
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchMPI = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/mpis/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        const mpiData = result.mpi
        setMpi(mpiData)
        
        // Populate form with existing data
        setValue('customerCompanyId', mpiData.customerCompanyId._id)
        setValue('jobNumber', mpiData.jobNumber)
        setValue('mpiNumber', mpiData.mpiNumber)
        setValue('formId', mpiData.formId?._id || '')
        setValue('formRev', mpiData.formRev || '')
        setValue('customerAssemblyName', mpiData.customerAssemblyName)
        setValue('assemblyRev', mpiData.assemblyRev)
        setValue('drawingName', mpiData.drawingName)
        setValue('drawingRev', mpiData.drawingRev)
        setValue('assemblyQuantity', mpiData.assemblyQuantity.toString())
        setValue('kitReceivedDate', mpiData.kitReceivedDate.split('T')[0])
        setValue('dateReleased', mpiData.dateReleased.split('T')[0])
        setValue('pages', mpiData.pages)
        setValue('engineerId', mpiData.engineerId._id)
      } else {
        toast.error('Failed to fetch MPI')
        router.push('/admin/dashboard')
      }
    } catch (error) {
      console.error('Error fetching MPI:', error)
      toast.error('An error occurred while fetching MPI')
      router.push('/admin/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomerCompanies = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/customer-companies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setCustomerCompanies(result.customerCompanies || [])
      } else {
        toast.error('Failed to fetch customer companies')
      }
    } catch (error) {
      console.error('Error fetching customer companies:', error)
      toast.error('An error occurred while fetching customer companies')
    }
  }

  const fetchForms = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/forms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setForms(result.forms || [])
      } else {
        console.error('Failed to fetch forms')
      }
    } catch (error) {
      console.error('Error fetching forms:', error)
    }
  }

  const fetchEngineers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/engineers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setEngineers(result.engineers || [])
      } else {
        toast.error('Failed to fetch engineers')
      }
    } catch (error) {
      console.error('Error fetching engineers:', error)
      toast.error('An error occurred while fetching engineers')
    }
  }

  const onSubmit = async (data: AdminMPIEditForm) => {
    setIsSaving(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/mpis/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          assemblyQuantity: parseInt(data.assemblyQuantity)
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('MPI updated successfully!')
        router.push(`/admin/mpi/${params.id}/view`)
      } else {
        toast.error(result.error || 'Failed to update MPI')
      }
    } catch (error) {
      console.error('Error updating MPI:', error)
      toast.error('An error occurred while updating MPI')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white opacity-80">Loading MPI data...</p>
        </div>
      </div>
    )
  }

  if (!mpi) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">MPI Not Found</h1>
          <p className="text-white/70 mb-6">The MPI you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/admin/dashboard">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg dark:gradient-bg">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-5 rounded-full floating"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white opacity-5 rounded-full floating" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-white opacity-5 rounded-full floating" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white opacity-5 rounded-full floating" style={{ animationDelay: '6s' }}></div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/admin/mpi/${params.id}/view`}>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to View
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <FileText className="h-8 w-8 mr-3 text-red-300" />
                  Edit MPI (Admin)
                </h1>
                <p className="text-white/70 mt-1">Edit MPI information and assign to engineers</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href={`/admin/mpi/${params.id}/view`}>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </Link>
              <Link href={`/admin/mpi/${params.id}/print-preview`}>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Preview
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glassmorphism-card">
            <CardHeader>
              <CardTitle className="text-white">MPI Information</CardTitle>
              <CardDescription className="text-white/70">
                Edit the details for this MPI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Company */}
                  <div className="space-y-2">
                    <Label htmlFor="customerCompanyId" className="text-white flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Customer Company *
                    </Label>
                    <Select 
                      value={watch('customerCompanyId')} 
                      onValueChange={(value) => setValue('customerCompanyId', value)}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select customer company" />
                      </SelectTrigger>
                      <SelectContent>
                        {customerCompanies.map((company) => (
                          <SelectItem key={company._id} value={company._id}>
                            {company.companyName} - {company.city}, {company.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.customerCompanyId && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        Customer company is required
                      </p>
                    )}
                  </div>

                  {/* Assigned Engineer */}
                  <div className="space-y-2">
                    <Label htmlFor="engineerId" className="text-white flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Assign to Engineer *
                    </Label>
                    <Select 
                      value={watch('engineerId')} 
                      onValueChange={(value) => setValue('engineerId', value)}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select engineer" />
                      </SelectTrigger>
                      <SelectContent>
                        {engineers.map((engineer) => (
                          <SelectItem key={engineer._id} value={engineer._id}>
                            {engineer.fullName} - {engineer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.engineerId && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        Engineer assignment is required
                      </p>
                    )}
                  </div>

                  {/* Job Number */}
                  <div className="space-y-2">
                    <Label htmlFor="jobNumber" className="text-white flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      Job Number *
                    </Label>
                    <Input
                      id="jobNumber"
                      type="text"
                      placeholder="U-000001"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-red-500 ${
                        errors.jobNumber ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('jobNumber', {
                        required: 'Job number is required',
                        pattern: {
                          value: /^U-\d{6}$/,
                          message: 'Job number must be in format U-000001'
                        }
                      })}
                    />
                    {errors.jobNumber && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.jobNumber.message}
                      </p>
                    )}
                  </div>

                  {/* MPI Number */}
                  <div className="space-y-2">
                    <Label htmlFor="mpiNumber" className="text-white flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      MPI Number *
                    </Label>
                    <Input
                      id="mpiNumber"
                      type="text"
                      placeholder="MPI-000001"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-red-500 ${
                        errors.mpiNumber ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('mpiNumber', {
                        required: 'MPI number is required',
                        pattern: {
                          value: /^MPI-\d{6}$/,
                          message: 'MPI number must be in format MPI-000001'
                        }
                      })}
                    />
                    {errors.mpiNumber && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.mpiNumber.message}
                      </p>
                    )}
                  </div>

                  {/* Form ID */}
                  <div className="space-y-2">
                    <Label htmlFor="formId" className="text-white flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Form ID *
                    </Label>
                    <Select 
                      value={watch('formId')} 
                      onValueChange={(value) => {
                        setValue('formId', value)
                        const selectedForm = forms.find(f => f._id === value)
                        if (selectedForm) {
                          setValue('formRev', selectedForm.formRev)
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select form" />
                      </SelectTrigger>
                      <SelectContent>
                        {forms.map((form) => (
                          <SelectItem key={form._id} value={form._id}>
                            {form.formId} - {form.description || 'No description'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.formId && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        Form ID is required
                      </p>
                    )}
                  </div>

                  {/* Form Revision */}
                  <div className="space-y-2">
                    <Label htmlFor="formRev" className="text-white flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Form Revision *
                    </Label>
                    <Input
                      id="formRev"
                      type="text"
                      placeholder="A"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-red-500 ${
                        errors.formRev ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('formRev', {
                        required: 'Form revision is required'
                      })}
                    />
                    {errors.formRev && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.formRev.message}
                      </p>
                    )}
                  </div>

                  {/* Customer Assembly Name */}
                  <div className="space-y-2">
                    <Label htmlFor="customerAssemblyName" className="text-white flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Customer Assembly Name *
                    </Label>
                    <Input
                      id="customerAssemblyName"
                      type="text"
                      placeholder="Enter assembly name"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-red-500 ${
                        errors.customerAssemblyName ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('customerAssemblyName', {
                        required: 'Customer assembly name is required',
                        minLength: {
                          value: 2,
                          message: 'Assembly name must be at least 2 characters'
                        }
                      })}
                    />
                    {errors.customerAssemblyName && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.customerAssemblyName.message}
                      </p>
                    )}
                  </div>

                  {/* Assembly Revision */}
                  <div className="space-y-2">
                    <Label htmlFor="assemblyRev" className="text-white flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      Assembly Revision *
                    </Label>
                    <Input
                      id="assemblyRev"
                      type="text"
                      placeholder="A"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-red-500 ${
                        errors.assemblyRev ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('assemblyRev', {
                        required: 'Assembly revision is required'
                      })}
                    />
                    {errors.assemblyRev && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.assemblyRev.message}
                      </p>
                    )}
                  </div>

                  {/* Drawing Name */}
                  <div className="space-y-2">
                    <Label htmlFor="drawingName" className="text-white flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Drawing Name *
                    </Label>
                    <Input
                      id="drawingName"
                      type="text"
                      placeholder="Enter drawing name"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-red-500 ${
                        errors.drawingName ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('drawingName', {
                        required: 'Drawing name is required',
                        minLength: {
                          value: 2,
                          message: 'Drawing name must be at least 2 characters'
                        }
                      })}
                    />
                    {errors.drawingName && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.drawingName.message}
                      </p>
                    )}
                  </div>

                  {/* Drawing Revision */}
                  <div className="space-y-2">
                    <Label htmlFor="drawingRev" className="text-white flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      Drawing Revision *
                    </Label>
                    <Input
                      id="drawingRev"
                      type="text"
                      placeholder="A"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-red-500 ${
                        errors.drawingRev ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('drawingRev', {
                        required: 'Drawing revision is required'
                      })}
                    />
                    {errors.drawingRev && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.drawingRev.message}
                      </p>
                    )}
                  </div>

                  {/* Assembly Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="assemblyQuantity" className="text-white flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      Assembly Quantity *
                    </Label>
                    <Input
                      id="assemblyQuantity"
                      type="number"
                      min="1"
                      placeholder="1"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-red-500 ${
                        errors.assemblyQuantity ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('assemblyQuantity', {
                        required: 'Assembly quantity is required',
                        min: {
                          value: 1,
                          message: 'Quantity must be at least 1'
                        }
                      })}
                    />
                    {errors.assemblyQuantity && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.assemblyQuantity.message}
                      </p>
                    )}
                  </div>

                  {/* Pages */}
                  <div className="space-y-2">
                    <Label htmlFor="pages" className="text-white flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Estimated Pages *
                    </Label>
                    <Input
                      id="pages"
                      type="text"
                      placeholder="4"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-red-500 ${
                        errors.pages ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('pages', {
                        required: 'Pages estimate is required'
                      })}
                    />
                    {errors.pages && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.pages.message}
                      </p>
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
                      className={`bg-white/10 border-white/20 text-white focus:ring-red-500 ${
                        errors.kitReceivedDate ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('kitReceivedDate', {
                        required: 'Kit received date is required'
                      })}
                    />
                    {errors.kitReceivedDate && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.kitReceivedDate.message}
                      </p>
                    )}
                  </div>

                  {/* Date Released */}
                  <div className="space-y-2">
                    <Label htmlFor="dateReleased" className="text-white flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Date Released *
                    </Label>
                    <Input
                      id="dateReleased"
                      type="date"
                      className={`bg-white/10 border-white/20 text-white focus:ring-red-500 ${
                        errors.dateReleased ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('dateReleased', {
                        required: 'Date released is required'
                      })}
                    />
                    {errors.dateReleased && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.dateReleased.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Link href={`/admin/mpi/${params.id}/view`}>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
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
