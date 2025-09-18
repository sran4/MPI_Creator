'use client'

import { Button } from '@/components/ui/button'
import {
    FileText,
    Home,
    LogOut,
    Menu,
    Settings,
    User,
    X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
    // Hydrate from cache immediately (non-blocking)
    try {
      const cachedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      const cachedUserType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null
      if (cachedUser) {
        const parsed = JSON.parse(cachedUser)
        setUser({ ...parsed, userType: (parsed.userType || cachedUserType) as User['userType'] })
      }
    } catch {}

    // Verify in background with timeout to avoid long blocking
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)
    checkAuthStatus(controller.signal).finally(() => clearTimeout(timeoutId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuthStatus = async (signal?: AbortSignal) => {
    try {
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }
      
      const token = localStorage.getItem('token')
      if (!token) {
        // No token, render immediately
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        try {
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('userType', data.user.userType)
        } catch {}
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('userType')
        setUser(null)
      }
    } catch (error) {
      // Swallow network/abort errors to avoid blocking first paint
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('userType')
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

  // Avoid verbose logs in production to keep console clean and faster

  if (!mounted || isLoading) {
    return (
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 w-full block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16 w-full">
            <div className="flex items-center">
              <Link href="/" className="text-white text-xl font-bold flex items-center">
                <FileText className="h-6 w-6 mr-2" />
                MPI Traveler Combo Creator
              </Link>
            </div>
            <div className="hidden items-center justify-center space-x-2 2xl:space-x-4">
              <Link href="/login">
                <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg flex items-center justify-center">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg shadow-red-500/25">
                  Sign Up
                </Button>
              </Link>
            </div>
            {/* Burger menu button for loading state */}
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
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
              MPI Traveler Combo Creator
            </Link>
          </div>

          {/* Desktop Navigation - Hidden on all screens to force burger menu */}
          <div className="hidden items-center justify-center space-x-2 2xl:space-x-4">
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
                  <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg flex items-center justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg shadow-red-500/25">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Burger menu button - Shows on all screen sizes */}
          <div>
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

        {/* Burger menu navigation - Shows on all screen sizes */}
        {isMobileMenuOpen && (
          <div className="border-t border-white/20">
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
                    <Button className="w-full justify-center bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg flex items-center">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25">
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