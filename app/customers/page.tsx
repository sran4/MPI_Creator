'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Home,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface CustomerCompany {
  _id: string;
  companyName: string;
  city: string;
  state: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CustomersPage() {
  const [customerCompanies, setCustomerCompanies] = useState<CustomerCompany[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    company: CustomerCompany | null;
  }>({
    isOpen: false,
    company: null,
  });
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    company: CustomerCompany | null;
  }>({
    isOpen: false,
    company: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 9 cards for large screens
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchCustomerCompanies();
  }, [router]);

  const fetchCustomerCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customer-companies', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCustomerCompanies(result.customerCompanies);
      } else {
        toast.error('Failed to fetch customer companies');
      }
    } catch (error) {
      console.error('Error fetching customer companies:', error);
      toast.error('An error occurred while fetching customer companies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (company: CustomerCompany) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/customer-companies/${company._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Customer company deleted successfully!');
        fetchCustomerCompanies();
        setDeleteModal({ isOpen: false, company: null });
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete customer company');
      }
    } catch (error) {
      console.error('Error deleting customer company:', error);
      toast.error('An error occurred while deleting customer company');
    }
  };

  const openDeleteModal = (company: CustomerCompany) => {
    setDeleteModal({ isOpen: true, company });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, company: null });
  };

  const openViewModal = (company: CustomerCompany) => {
    setViewModal({ isOpen: true, company });
  };

  const closeViewModal = () => {
    setViewModal({ isOpen: false, company: null });
  };

  const filteredCompanies = customerCompanies
    .filter(
      company =>
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.contactPerson &&
          company.contactPerson
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      // First sort by active status (active companies first)
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;

      // Then sort by company name alphabetically
      return a.companyName.localeCompare(b.companyName);
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className='min-h-screen gradient-bg dark:gradient-bg flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto'></div>
          <p className='mt-4 text-white opacity-80'>
            Loading customer companies...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen gradient-bg dark:gradient-bg'>
      {/* Floating Background Elements */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-20 w-32 h-32 bg-white opacity-5 rounded-full floating'></div>
        <div
          className='absolute top-40 right-32 w-24 h-24 bg-white opacity-5 rounded-full floating'
          style={{ animationDelay: '-2s' }}
        ></div>
        <div
          className='absolute bottom-32 left-40 w-40 h-40 bg-white opacity-5 rounded-full floating'
          style={{ animationDelay: '-4s' }}
        ></div>
        <div
          className='absolute bottom-20 right-20 w-28 h-28 bg-white opacity-5 rounded-full floating'
          style={{ animationDelay: '-1s' }}
        ></div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Header */}
        <div className='glassmorphism p-6 mb-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Link href='/engineer/dashboard'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-white hover:bg-white/20'
                >
                  <ArrowLeft className='h-4 w-4' />
                </Button>
              </Link>
              <div>
                <h1 className='text-3xl font-bold text-white mb-2'>
                  Customer Management
                </h1>
                <p className='text-white opacity-80'>
                  Manage your customer companies and their information
                </p>
              </div>
            </div>
            <Link href='/customers/new'>
              <Button className='bg-red-600 hover:bg-red-700 text-white'>
                <Plus className='h-4 w-4 mr-2' />
                Add New Customer
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className='mb-6'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4' />
            <Input
              placeholder='Search companies...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500'
            />
          </div>
        </div>

        {/* Companies List */}
        <div className='space-y-8'>
          {/* Active Companies */}
          {paginatedCompanies.filter(company => company.isActive).length >
            0 && (
            <div>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                <span className='w-3 h-3 bg-green-500 rounded-full mr-3'></span>
                Active Companies (
                {filteredCompanies.filter(company => company.isActive).length})
              </h3>
              <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                {paginatedCompanies
                  .filter(company => company.isActive)
                  .map(company => (
                    <motion.div
                      key={company._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className='glassmorphism-card glassmorphism-card-hover h-full'>
                        <CardHeader>
                          <div className='flex items-center justify-between'>
                            <div>
                              <CardTitle className='text-lg flex items-center text-white'>
                                <Building2 className='h-5 w-5 mr-2 text-blue-400' />
                                {company.companyName}
                              </CardTitle>
                              <CardDescription className='flex items-center mt-1 text-white/80'>
                                <MapPin className='h-4 w-4 mr-1' />
                                {company.city}, {company.state}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                company.isActive ? 'default' : 'secondary'
                              }
                              className='bg-green-600 text-white'
                            >
                              {company.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {company.contactPerson && (
                            <p className='text-sm text-white/80 mb-2 flex items-center'>
                              <User className='h-4 w-4 mr-1' />
                              <strong>Contact:</strong> {company.contactPerson}
                            </p>
                          )}
                          {company.email && (
                            <p className='text-sm text-white/80 mb-2 flex items-center'>
                              <Mail className='h-4 w-4 mr-1' />
                              {company.email}
                            </p>
                          )}
                          {company.phone && (
                            <p className='text-sm text-white/80 mb-4 flex items-center'>
                              <Phone className='h-4 w-4 mr-1' />
                              {company.phone}
                            </p>
                          )}
                          <div className='flex space-x-2'>
                            {/* View Button with Tooltip */}
                            <div className='relative group'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => openViewModal(company)}
                                className='border-white/20 text-white hover:bg-white/20'
                              >
                                <Eye className='h-4 w-4' />
                              </Button>
                              <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10'>
                                View Details
                              </div>
                            </div>

                            {/* Edit Button with Tooltip */}
                            <div className='relative group'>
                              <Link href={`/customers/${company._id}/edit`}>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  className='border-white/20 text-white hover:bg-white/20'
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                              </Link>
                              <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10'>
                                Edit Company
                              </div>
                            </div>

                            {/* Delete Button with Tooltip */}
                            <div className='relative group'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => openDeleteModal(company)}
                                className='border-red-500/50 text-red-400 hover:bg-red-500/20'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                              <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10'>
                                Delete Company
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}

          {/* Inactive Companies */}
          {paginatedCompanies.filter(company => !company.isActive).length >
            0 && (
            <div>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                <span className='w-3 h-3 bg-gray-500 rounded-full mr-3'></span>
                Inactive Companies (
                {filteredCompanies.filter(company => !company.isActive).length})
              </h3>
              <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                {paginatedCompanies
                  .filter(company => !company.isActive)
                  .map(company => (
                    <motion.div
                      key={company._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className='glassmorphism-card glassmorphism-card-hover h-full opacity-75'>
                        <CardHeader>
                          <div className='flex items-center justify-between'>
                            <div>
                              <CardTitle className='text-white flex items-center'>
                                <Building2 className='h-5 w-5 mr-2' />
                                {company.companyName}
                              </CardTitle>
                              <CardDescription className='text-white/80 flex items-center mt-1'>
                                <MapPin className='h-4 w-4 mr-1' />
                                {company.city}, {company.state}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                company.isActive ? 'default' : 'secondary'
                              }
                              className='bg-gray-600 text-white'
                            >
                              {company.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className='space-y-2'>
                            {company.contactPerson && (
                              <div className='flex items-center text-white/80'>
                                <User className='h-4 w-4 mr-2' />
                                <span className='text-sm'>
                                  {company.contactPerson}
                                </span>
                              </div>
                            )}
                            {company.email && (
                              <div className='flex items-center text-white/80'>
                                <Mail className='h-4 w-4 mr-2' />
                                <span className='text-sm'>{company.email}</span>
                              </div>
                            )}
                            {company.phone && (
                              <div className='flex items-center text-white/80'>
                                <Phone className='h-4 w-4 mr-2' />
                                <span className='text-sm'>{company.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className='flex justify-end space-x-2 mt-4'>
                            {/* View Button with Tooltip */}
                            <div className='relative group'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => openViewModal(company)}
                                className='border-blue-500/50 text-blue-400 hover:bg-blue-500/20'
                              >
                                <Eye className='h-4 w-4' />
                              </Button>
                              <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10'>
                                View Details
                              </div>
                            </div>

                            {/* Edit Button with Tooltip */}
                            <div className='relative group'>
                              <Link href={`/customers/${company._id}/edit`}>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  className='border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20'
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                              </Link>
                              <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10'>
                                Edit Company
                              </div>
                            </div>

                            {/* Delete Button with Tooltip */}
                            <div className='relative group'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => openDeleteModal(company)}
                                className='border-red-500/50 text-red-400 hover:bg-red-500/20'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                              <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10'>
                                Delete Company
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredCompanies.length > itemsPerPage && (
          <div className='flex flex-col items-center space-y-4 mt-8'>
            {/* Page Info */}
            <div className='text-white/80 text-sm'>
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredCompanies.length)} of{' '}
              {filteredCompanies.length} companies
            </div>

            {/* Pagination Buttons */}
            <div className='flex items-center space-x-2'>
              {/* Previous Button */}
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='border-white/20 text-white hover:bg-white/10 disabled:opacity-50'
              >
                <ChevronLeft className='h-4 w-4 mr-1' />
                Previous
              </Button>

              {/* Page Numbers */}
              <div className='flex items-center space-x-1'>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 p-0 ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border-white/20 text-white hover:bg-white/10'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              {/* Next Button */}
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className='border-white/20 text-white hover:bg-white/10 disabled:opacity-50'
              >
                Next
                <ChevronRight className='h-4 w-4 ml-1' />
              </Button>
            </div>
          </div>
        )}

        {filteredCompanies.length === 0 && (
          <div className='text-center py-12'>
            <Building2 className='h-12 w-12 text-white/40 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-white mb-2'>
              No companies found
            </h3>
            <p className='text-white/80 mb-4'>
              {searchTerm
                ? 'Try adjusting your search terms.'
                : 'Get started by creating your first customer company.'}
            </p>
            {!searchTerm && (
              <Link href='/customers/new'>
                <Button className='bg-red-600 hover:bg-red-700 text-white'>
                  <Plus className='h-4 w-4 mr-2' />
                  Add Company
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && deleteModal.company && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='glassmorphism-card rounded-lg p-6 w-full max-w-md'
            >
              <div className='text-center'>
                <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4'>
                  <Trash2 className='h-6 w-6 text-red-600' />
                </div>
                <h3 className='text-lg font-medium text-white mb-2'>
                  Delete Customer Company
                </h3>
                <p className='text-white/80 mb-6'>
                  Are you sure you want to delete{' '}
                  <strong>{deleteModal.company.companyName}</strong>? This
                  action cannot be undone.
                </p>
                <div className='flex space-x-3'>
                  <Button
                    variant='outline'
                    onClick={closeDeleteModal}
                    className='flex-1 border-white/20 text-white hover:bg-white/20'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleDelete(deleteModal.company!)}
                    className='flex-1 bg-red-600 hover:bg-red-700 text-white'
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* View Details Modal */}
        {viewModal.isOpen && viewModal.company && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='glassmorphism-card rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'
            >
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-2xl font-bold text-white flex items-center'>
                  <Building2 className='h-6 w-6 mr-3 text-blue-400' />
                  {viewModal.company.companyName}
                </h3>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={closeViewModal}
                  className='border-white/20 text-white hover:bg-white/20'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Company Information */}
                <div className='space-y-4'>
                  <div>
                    <h4 className='text-lg font-semibold text-white mb-3 flex items-center'>
                      <Building2 className='h-5 w-5 mr-2 text-blue-400' />
                      Company Information
                    </h4>
                    <div className='space-y-3'>
                      <div className='flex items-center'>
                        <Building2 className='h-4 w-4 mr-3 text-white/60' />
                        <div>
                          <p className='text-sm text-white/60'>Company Name</p>
                          <p className='text-white font-medium'>
                            {viewModal.company.companyName}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center'>
                        <MapPin className='h-4 w-4 mr-3 text-white/60' />
                        <div>
                          <p className='text-sm text-white/60'>Location</p>
                          <p className='text-white font-medium'>
                            {viewModal.company.city}, {viewModal.company.state}
                          </p>
                        </div>
                      </div>
                      {viewModal.company.address && (
                        <div className='flex items-start'>
                          <Home className='h-4 w-4 mr-3 text-white/60 mt-1' />
                          <div>
                            <p className='text-sm text-white/60'>Address</p>
                            <p className='text-white font-medium'>
                              {viewModal.company.address}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className='space-y-4'>
                  <div>
                    <h4 className='text-lg font-semibold text-white mb-3 flex items-center'>
                      <User className='h-5 w-5 mr-2 text-green-400' />
                      Contact Information
                    </h4>
                    <div className='space-y-3'>
                      {viewModal.company.contactPerson ? (
                        <div className='flex items-center'>
                          <User className='h-4 w-4 mr-3 text-white/60' />
                          <div>
                            <p className='text-sm text-white/60'>
                              Contact Person
                            </p>
                            <p className='text-white font-medium'>
                              {viewModal.company.contactPerson}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className='flex items-center'>
                          <User className='h-4 w-4 mr-3 text-white/60' />
                          <div>
                            <p className='text-sm text-white/60'>
                              Contact Person
                            </p>
                            <p className='text-white/40 font-medium'>
                              Not provided
                            </p>
                          </div>
                        </div>
                      )}
                      {viewModal.company.email ? (
                        <div className='flex items-center'>
                          <Mail className='h-4 w-4 mr-3 text-white/60' />
                          <div>
                            <p className='text-sm text-white/60'>Email</p>
                            <p className='text-white font-medium'>
                              {viewModal.company.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className='flex items-center'>
                          <Mail className='h-4 w-4 mr-3 text-white/60' />
                          <div>
                            <p className='text-sm text-white/60'>Email</p>
                            <p className='text-white/40 font-medium'>
                              Not provided
                            </p>
                          </div>
                        </div>
                      )}
                      {viewModal.company.phone ? (
                        <div className='flex items-center'>
                          <Phone className='h-4 w-4 mr-3 text-white/60' />
                          <div>
                            <p className='text-sm text-white/60'>Phone</p>
                            <p className='text-white font-medium'>
                              {viewModal.company.phone}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className='flex items-center'>
                          <Phone className='h-4 w-4 mr-3 text-white/60' />
                          <div>
                            <p className='text-sm text-white/60'>Phone</p>
                            <p className='text-white/40 font-medium'>
                              Not provided
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Dates */}
              <div className='mt-6 pt-6 border-t border-white/20'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='text-center'>
                    <p className='text-sm text-white/60'>Status</p>
                    <Badge
                      variant={
                        viewModal.company.isActive ? 'default' : 'secondary'
                      }
                      className='bg-green-600 text-white mt-1'
                    >
                      {viewModal.company.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className='text-center'>
                    <p className='text-sm text-white/60'>Created</p>
                    <p className='text-white font-medium mt-1'>
                      {viewModal.company.createdAt
                        ? new Date(
                            viewModal.company.createdAt
                          ).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div className='text-center'>
                    <p className='text-sm text-white/60'>Last Updated</p>
                    <p className='text-white font-medium mt-1'>
                      {viewModal.company.updatedAt
                        ? new Date(
                            viewModal.company.updatedAt
                          ).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end space-x-3 mt-6 pt-6 border-t border-white/20'>
                <Button
                  variant='outline'
                  onClick={closeViewModal}
                  className='border-white/20 text-white hover:bg-white/20'
                >
                  Close
                </Button>
                <Link href={`/customers/${viewModal.company._id}/edit`}>
                  <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
                    <Edit className='h-4 w-4 mr-2' />
                    Edit Company
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
