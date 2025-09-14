'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, ArrowLeft, User, Mail, Lock, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface SignupForm {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  title: string
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<SignupForm>()

  const password = watch('password')

  const onSubmit = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          title: data.title,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.setItem('userType', result.userType)
        
        toast.success('Account created successfully!')
        router.push('/dashboard')
      } else {
        toast.error(result.error || 'Signup failed')
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('An error occurred during signup')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg dark:gradient-bg flex items-center justify-center p-4">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-5 rounded-full floating"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-2s'}}></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-4s'}}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white opacity-5 rounded-full floating" style={{animationDelay: '-1s'}}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="glassmorphism border-white/20">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
              <div className="w-10"></div>
            </div>
            <CardDescription className="text-white opacity-80">
              Join MPI Generator as an Engineer
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
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
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
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
                  Job Title
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
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500 pr-10"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-white hover:bg-white/20"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500 pr-10"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match'
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-white hover:bg-white/20"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white opacity-80">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
