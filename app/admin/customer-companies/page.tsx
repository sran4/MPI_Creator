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
  Search, 
  Edit, 
  Trash2, 
  Building2,
  ArrowLeft,
  Save,
  X,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

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

interface CustomerCompanyForm {
  companyName: string
  city: string
  state: string
  contactPerson: string
  email: string
  phone: string
  address: string
}

export default function CustomerCompaniesPage() {
  const [customerCompanies, setCustomerCompanies] = useState<CustomerCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<CustomerCompany | null>(null)
  const [formData, setFormData] = useState<CustomerCompanyForm>({
    companyName: '',
    city: '',
    state: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchCustomerCompanies()
  }, [router])

  const fetchCustomerCompanies = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/customer-companies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setCustomerCompanies(result.customerCompanies)
      } else {
        toast.error('Failed to fetch customer companies')
      }
    } catch (error) {
      console.error('Error fetching customer companies:', error)
      toast.error('An error occurred while fetching customer companies')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.companyName.trim() || !formData.city.trim() || !formData.state.trim()) {
      toast.error('Company name, city, and state are required')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = editingCompany 
        ? `/api/admin/customer-companies/${editingCompany._id}`
        : '/api/admin/customer-companies'
      
      const method = editingCompany ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(editingCompany ? 'Customer company updated successfully!' : 'Customer company created successfully!')
        resetForm()
        fetchCustomerCompanies()
      } else {
        toast.error(result.error || 'Failed to save customer company')
      }
    } catch (error) {
      console.error('Error saving customer company:', error)
      toast.error('An error occurred while saving customer company')
    }
  }

  const handleEdit = (company: CustomerCompany) => {
    setEditingCompany(company)
    setFormData({
      companyName: company.companyName,
      city: company.city,
      state: company.state,
      contactPerson: company.contactPerson || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || ''
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this customer company?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/customer-companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Customer company deleted successfully!')
        fetchCustomerCompanies()
      } else {
        const result = await response.json()
        toast.error(result.error || 'Failed to delete customer company')
      }
    } catch (error) {
      console.error('Error deleting customer company:', error)
      toast.error('An error occurred while deleting customer company')
    }
  }

  const resetForm = () => {
    setFormData({
      companyName: '',
      city: '',
      state: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: ''
    })
    setEditingCompany(null)
    setIsFormOpen(false)
  }

  const filteredCompanies = customerCompanies.filter(company =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.contactPerson && company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading customer companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Customer Companies
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage customer companies and their information
              </p>
            </div>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Companies List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <motion.div
              key={company._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-blue-500" />
                        {company.companyName}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {company.city}, {company.state}
                      </CardDescription>
                    </div>
                    <Badge variant={company.isActive ? "default" : "secondary"}>
                      {company.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {company.contactPerson && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Contact:</strong> {company.contactPerson}
                    </p>
                  )}
                  {company.email && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {company.email}
                    </p>
                  )}
                  {company.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {company.phone}
                    </p>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(company)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(company._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No companies found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first customer company.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            )}
          </div>
        )}

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-red-900/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glassmorphism-card rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingCompany ? 'Edit Customer Company' : 'Add New Customer Company'}
                </h2>
                <Button variant="outline" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="Enter contact person name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Enter state"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {editingCompany ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
