'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, User, Mail, Lock, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface EngineerForm {
  fullName: string
  email: string
  password: string
  title: string
}

export default function NewEngineerPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<EngineerForm>()

  const onSubmit = async (data: EngineerForm) => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/engineers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Engineer created successfully!')
        router.push('/admin/dashboard')
      } else {
        toast.error(result.error || 'Failed to create engineer')
      }
    } catch (error) {
      console.error('Error creating engineer:', error)
      toast.error('An error occurred while creating engineer')
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
                <h1 className="text-3xl font-bold text-white mb-2">Add New Engineer</h1>
                <p className="text-white opacity-80">Create a new engineer account</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glassmorphism-card glassmorphism-card-hover">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <User className="h-6 w-6 mr-3" />
                Engineer Information
              </CardTitle>
              <CardDescription className="text-white opacity-80">
                Fill in the engineer's details to create their account
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter engineer's full name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500"
                    {...register('fullName', {
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Full name must be at least 2 characters'
                      }
                    })}
                  />
                  {errors.fullName && (
                    <p className="text-red-400 text-sm">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter engineer's email"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Please enter a valid email'
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm">{errors.email.message}</p>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Job Title *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Manufacturing Engineer, Process Engineer"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500"
                    {...register('title', {
                      required: 'Job title is required',
                      minLength: {
                        value: 2,
                        message: 'Job title must be at least 2 characters'
                      }
                    })}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm">{errors.title.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter temporary password"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                  />
                  {errors.password && (
                    <p className="text-red-400 text-sm">{errors.password.message}</p>
                  )}
                  <p className="text-white opacity-60 text-sm">
                    The engineer can change this password after their first login.
                  </p>
                </div>

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
                    {isLoading ? 'Creating Engineer...' : 'Create Engineer'}
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
