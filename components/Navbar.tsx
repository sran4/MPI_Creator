'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  User, 
  LogOut, 
  Settings, 
  FileText, 
  Users, 
  Building,
  Menu,
  X,
  Home
} from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  fullName: string
  userType: 'admin' | 'engineer'
  title?: string
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }
      
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('No token found, showing auth links')
        setIsLoading(false)
        return
      }

      console.log('Token found, checking auth status')
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('User authenticated:', data.user)
        setUser(data.user)
      } else {
        console.log('Auth failed, removing token')
        localStorage.removeItem('token')
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    setUser(null)
    toast.success('Logged out successfully')
    router.push('/')
  }

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/admin/signup'

  console.log('Navbar render - mounted:', mounted, 'isLoading:', isLoading, 'user:', user, 'pathname:', pathname, 'window width:', typeof window !== 'undefined' ? window.innerWidth : 'server')

  if (!mounted || isLoading) {
    return (
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 w-full block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16 w-full">
            <div className="flex items-center">
              <Link href="/" className="text-white text-xl font-bold flex items-center">
                <FileText className="h-6 w-6 mr-2" />
                MPI Creator
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 w-full block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-16 w-full">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-white text-xl font-bold flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              MPI Creator
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {/* Navigation Links */}
                <Link href="/dashboard">
                  <Button 
                    variant="ghost" 
                    className={`text-white hover:bg-white/10 ${pathname === '/dashboard' ? 'bg-white/20' : ''}`}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>

                {user.userType === 'admin' && (
                  <Link href="/admin/dashboard">
                    <Button 
                      variant="ghost" 
                      className={`text-white hover:bg-white/10 ${pathname === '/admin/dashboard' ? 'bg-white/20' : ''}`}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm">
                    {user.fullName || user.email}
                  </span>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="text-white hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-white/10"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start text-white hover:bg-white/10 ${pathname === '/dashboard' ? 'bg-white/20' : ''}`}
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>

                  {user.userType === 'admin' && (
                    <Link href="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start text-white hover:bg-white/10 ${pathname === '/admin/dashboard' ? 'bg-white/20' : ''}`}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}

                  <div className="px-2 py-1.5 border-t border-white/20">
                    <p className="text-sm font-medium text-white">{user.fullName || 'User'}</p>
                    <p className="text-xs text-white/70">{user.email}</p>
                    <p className="text-xs text-white/70 capitalize">{user.userType}</p>
                  </div>

                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="w-full justify-start text-white hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
