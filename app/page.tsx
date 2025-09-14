'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const features = [
    {
      icon: FileText,
      title: 'Professional MPI Generation',
      description: 'Create industry-standard Manufacturing Process Instructions with drag & drop sections',
      color: 'text-blue-500'
    },
    {
      icon: Users,
      title: 'Multi-User Management',
      description: 'Admin controls with engineer assignments and role-based access',
      color: 'text-green-500'
    },
    {
      icon: Settings,
      title: 'Global Steps Library',
      description: 'Reusable steps across operations with real-time updates',
      color: 'text-purple-500'
    },
    {
      icon: BarChart3,
      title: 'Process Tracking',
      description: 'Version control, audit trails, and improvement tracking',
      color: 'text-orange-500'
    },
    {
      icon: Shield,
      title: 'Industry Compliance',
      description: 'IPC-A-610, J-STD-001, ISO 9001, AS9100, ISO 13485, IATF 16949',
      color: 'text-red-500'
    },
    {
      icon: Zap,
      title: 'Advanced Export',
      description: 'Professional Word documents and PDF generation',
      color: 'text-yellow-500'
    }
  ]

  const stats = [
    { label: 'MPIs Created', value: '1,200+' },
    { label: 'Active Engineers', value: '50+' },
    { label: 'Global Steps', value: '500+' },
    { label: 'Customer Projects', value: '300+' }
  ]

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
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">MPI Generator</h1>
              <p className="text-white opacity-80">Manufacturing Process Instructions for PCBA</p>
            </div>
            <div className="flex space-x-4">
              {isAuthenticated ? (
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/login')}
                    className="border-white text-white hover:bg-white hover:text-gray-900"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => router.push('/signup')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-white mb-6">
            Streamline Your Manufacturing
            <span className="block text-blue-300">Process Documentation</span>
          </h2>
          <p className="text-xl text-white opacity-80 mb-8 max-w-3xl mx-auto">
            Professional web-based application for generating Manufacturing Process Instructions (MPI) 
            specifically designed for Printed Circuit Board Assembly (PCBA) companies.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg"
              onClick={() => router.push('/signup')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Start Creating MPIs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg"
            >
              View Demo
            </Button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="glassmorphism border-white/20">
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white opacity-80">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Everything You Need for Professional MPI Creation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="glassmorphism border-white/20 h-full hover:bg-white/20 transition-all duration-300">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white opacity-80">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <Card className="glassmorphism border-white/20 max-w-4xl mx-auto">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Manufacturing Documentation?
              </h3>
              <p className="text-white opacity-80 mb-8 text-lg">
                Join hundreds of PCBA companies already using MPI Generator to streamline their processes.
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  size="lg"
                  onClick={() => router.push('/signup')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                >
                  Get Started Free
                  <CheckCircle className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="glassmorphism mt-16 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white opacity-60">
            © 2024 MPI Generator. All rights reserved. Built for PCBA manufacturing excellence.
          </p>
        </div>
      </footer>
    </div>
  )
}
