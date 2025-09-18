'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { ArrowLeft, Building, Home, Mail, MapPin, Phone, Save, User, X } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface CustomerCompanyForm {
  companyName: string
  city: string
  state: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  isActive: boolean
}

interface CustomerCompany {
  _id: string
  companyName: string
  city: string
  state: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function EditCustomerPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [customerCompany, setCustomerCompany] = useState<CustomerCompany | null>(null)
  const router = useRouter()
  const params = useParams()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CustomerCompanyForm>({
    mode: 'onChange'
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    if (params.id) {
      fetchCustomerCompany(params.id as string)
    }
  }, [params.id, router])

  const fetchCustomerCompany = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/customer-companies/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        const company = result.customerCompany
        setCustomerCompany(company)
        
        // Set form values
        setValue('companyName', company.companyName)
        setValue('city', company.city)
        setValue('state', company.state)
        setValue('contactPerson', company.contactPerson || '')
        setValue('email', company.email || '')
        setValue('phone', company.phone || '')
        setValue('address', company.address || '')
        setValue('isActive', company.isActive)
      } else {
        toast.error('Failed to fetch customer company')
        router.push('/customers')
      }
    } catch (error) {
      console.error('Error fetching customer company:', error)
      toast.error('An error occurred while fetching customer company')
      router.push('/customers')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: CustomerCompanyForm) => {
    setIsSaving(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/customer-companies/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Customer company updated successfully!')
        router.push('/customers')
      } else {
        toast.error(result.error || 'Failed to update customer company')
      }
    } catch (error) {
      console.error('Error updating customer company:', error)
      toast.error('An error occurred while updating customer company')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white opacity-80">Loading customer company...</p>
        </div>
      </div>
    )
  }

  if (!customerCompany) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Customer Company Not Found</h2>
          <Link href="/customers">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Back to Customers
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
        <div className="absolute top-40 right-32 w-24 h-24 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-2s'}}></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-4s'}}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-1s'}}></div>
      </div>

      {/* Header */}
      <header className="glassmorphism p-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/customers">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Edit Customer Company</h1>
                <p className="text-white opacity-80">Update customer company information</p>
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
                <Building className="h-6 w-6 mr-3" />
                Customer Company Information
              </CardTitle>
              <CardDescription className="text-white opacity-80">
                Update the customer company details. Fields marked with * are required.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Company Name - Full Width */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-white flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Enter company name"
                    className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500 ${
                      errors.companyName ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                    {...register('companyName', {
                      required: 'Company name is required',
                      minLength: {
                        value: 2,
                        message: 'Company name must be at least 2 characters'
                      },
                      maxLength: {
                        value: 100,
                        message: 'Company name cannot exceed 100 characters'
                      }
                    })}
                  />
                  {errors.companyName && (
                    <p className="text-red-400 text-sm flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      City *
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Enter city"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500 ${
                        errors.city ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('city', {
                        required: 'City is required',
                        minLength: {
                          value: 2,
                          message: 'City must be at least 2 characters'
                        },
                        maxLength: {
                          value: 50,
                          message: 'City cannot exceed 50 characters'
                        }
                      })}
                    />
                    {errors.city && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-white flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      State *
                    </Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="Enter state"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500 ${
                        errors.state ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('state', {
                        required: 'State is required',
                        minLength: {
                          value: 2,
                          message: 'State must be at least 2 characters'
                        },
                        maxLength: {
                          value: 50,
                          message: 'State cannot exceed 50 characters'
                        }
                      })}
                    />
                    {errors.state && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  {/* Contact Person */}
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson" className="text-white flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Contact Person
                    </Label>
                    <Input
                      id="contactPerson"
                      type="text"
                      placeholder="Enter contact person name"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500 ${
                        errors.contactPerson ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('contactPerson', {
                        maxLength: {
                          value: 100,
                          message: 'Contact person name cannot exceed 100 characters'
                        }
                      })}
                    />
                    {errors.contactPerson && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.contactPerson.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('email', {
                        pattern: {
                          value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                          message: 'Please enter a valid email address'
                        }
                      })}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('phone', {
                        maxLength: {
                          value: 20,
                          message: 'Phone number cannot exceed 20 characters'
                        }
                      })}
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Address - Full Width */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="text-white flex items-center">
                      <Home className="h-4 w-4 mr-2" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Enter full address"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500 ${
                        errors.address ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      {...register('address', {
                        maxLength: {
                          value: 200,
                          message: 'Address cannot exceed 200 characters'
                        }
                      })}
                    />
                    {errors.address && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.address.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center">
                    <span className="mr-2">📊</span>
                    Company Status
                  </Label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setValue('isActive', !watch('isActive'))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        watch('isActive') ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          watch('isActive') ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-sm font-medium ${
                      watch('isActive') ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {watch('isActive') ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-white/60">
                      {watch('isActive') 
                        ? 'Company is active and visible to users' 
                        : 'Company is inactive and hidden from users'
                      }
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Link href="/customers">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-gray-900"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Updating...' : 'Update Company'}
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
