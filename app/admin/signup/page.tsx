'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Lock, Shield, ArrowLeft, Eye, EyeOff, Briefcase } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const adminSignupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  title: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  adminKey: z.string().min(1, 'Admin key is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type AdminSignupFormData = z.infer<typeof adminSignupSchema>

export default function AdminSignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminSignupFormData>({
    resolver: zodResolver(adminSignupSchema),
  })

  const onSubmit = async (data: AdminSignupFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/admin-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: data.fullName,
          title: data.title,
          email: data.email,
          password: data.password,
          adminKey: data.adminKey,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Admin account created successfully! Please sign in.')
        router.push('/login')
      } else {
        toast.error(result.error || 'Failed to create admin account')
      }
    } catch (error) {
      console.error('Admin signup error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-5 rounded-full floating"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-2s'}}></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-4s'}}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-1s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-white hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="glassmorphism-card glassmorphism-card-hover">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <Shield className="h-6 w-6 mr-2 text-red-300" />
                Admin Signup
              </CardTitle>
              <div className="w-10"></div>
            </div>
            <CardDescription className="text-white opacity-80">
              Create Admin Account for MPI Traveler Combo Creator
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 backdrop-blur-sm"
                    {...register('fullName')}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-300 text-sm">{errors.fullName.message}</p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Title (Optional)</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., System Administrator, IT Manager"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 backdrop-blur-sm"
                    {...register('title')}
                  />
                </div>
                {errors.title && (
                  <p className="text-red-300 text-sm">{errors.title.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 backdrop-blur-sm"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-300 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Admin Key */}
              <div className="space-y-2">
                <Label htmlFor="adminKey" className="text-white">Admin Key *</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="adminKey"
                    type="password"
                    placeholder="Enter admin key"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 backdrop-blur-sm"
                    {...register('adminKey')}
                  />
                </div>
                {errors.adminKey && (
                  <p className="text-red-300 text-sm">{errors.adminKey.message}</p>
                )}
                <p className="text-white/60 text-xs">
                  Contact your system administrator for the admin key
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 backdrop-blur-sm"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-white/50 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-300 text-sm">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 backdrop-blur-sm"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-white/50 hover:text-white/80 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-300 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg shadow-red-500/25"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Admin Account...' : 'Create Admin Account'}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-white/70">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-red-300 hover:text-red-200 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Regular Signup Link */}
            <div className="mt-4 text-center">
              <p className="text-white/70">
                Need a regular account?{' '}
                <Link 
                  href="/signup" 
                  className="text-red-300 hover:text-red-200 font-medium"
                >
                  Engineer signup
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}