'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { AuthProvider } from './providers'
import { useAuth } from '@/contexts/auth-context'

interface Logo {
  id: string
  name: string
  type: 'frontend' | 'backend'
  imageUrl: string
  active: boolean
  useText?: boolean  // Whether to use text instead of image
  text?: string     // Text to display if useText is true
  size?: number     // Size in pixels (width)
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  )
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  
  // Now useSession is used inside the AuthProvider
  const { data: session, status, update } = useSession()
  const { currentUser, hasPermission, isLoading: authLoading } = useAuth()
  
  // Helper function to check permissions with a fallback for when auth is still loading
  const checkPermission = (permission: string) => {
    // If auth is still loading or we're on the admin page, show all menus
    if (authLoading || !currentUser) return true
    return hasPermission(permission)
  }

  const [adminLogo, setAdminLogo] = useState<string | null>(null)
  const [useTextLogo, setUseTextLogo] = useState<boolean>(false)
  const [logoText, setLogoText] = useState<string>('Portfolio Admin')

  useEffect(() => {
    if (status === 'loading') return
    
    setIsLoading(false)
    
    if (status === 'unauthenticated' && pathname !== '/admin/login') {
      router.push('/admin/login')
    }

    // Load active backend logo if available
    if (typeof window !== 'undefined') {
      // Check for stored user profile data
      const storedUserProfile = localStorage.getItem('userProfile')
      if (storedUserProfile) {
        try {
          const userProfile = JSON.parse(storedUserProfile)
          if (userProfile.image) {
            console.log('Found stored profile image:', userProfile.image)
            // Update session with stored profile image if not already set
            if (session && !session.user.image) {
              console.log('Updating session with stored profile image')
              update({
                ...session,
                user: {
                  ...session.user,
                  image: userProfile.image
                }
              })
            }
          }
        } catch (error) {
          console.error('Error loading user profile from localStorage:', error)
        }
      }
      
      // Load logo data
      const storedLogos = localStorage.getItem('logos')
      if (storedLogos) {
        try {
          const logos = JSON.parse(storedLogos) as Logo[]
          const activeBackendLogo = logos.find(logo => logo.type === 'backend' && logo.active)
          if (activeBackendLogo) {
            setAdminLogo(activeBackendLogo.imageUrl)
            setUseTextLogo(activeBackendLogo.useText || false)
            setLogoText(activeBackendLogo.text || 'Portfolio Admin')
          }
        } catch (error) {
          console.error('Error loading logos:', error)
        }
      }

      // Listen for storage changes to update the logo
      const handleStorageChange = () => {
        const updatedLogos = localStorage.getItem('logos')
        if (updatedLogos) {
          try {
            const logos = JSON.parse(updatedLogos) as Logo[]
            const activeBackendLogo = logos.find(logo => logo.type === 'backend' && logo.active)
            if (activeBackendLogo) {
              setAdminLogo(activeBackendLogo.imageUrl)
              setUseTextLogo(activeBackendLogo.useText || false)
              setLogoText(activeBackendLogo.text || 'Portfolio Admin')
            }
          } catch (error) {
            console.error('Error loading logos:', error)
          }
        }
      }

      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [status, router, pathname, session, update])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background dark:bg-primary">
        <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-primary">
      {(session || pathname === '/admin/login') ? (
        <>
          {pathname !== '/admin/login' && (
            <header className="bg-white dark:bg-primary/40 shadow-md">
              <div className="container-custom py-4 flex justify-between items-center">
                {adminLogo && !useTextLogo ? (
                  <div className="flex items-center">
                    <Link href="/admin" className="cursor-pointer">
                      <Image 
                        src={adminLogo} 
                        alt="Admin Logo" 
                        width={120} 
                        height={32} 
                        className="h-8 w-auto" 
                      />
                    </Link>
                  </div>
                ) : (
                  <Link href="/admin" className="cursor-pointer">
                    <h1 className="font-display text-xl font-bold">{useTextLogo ? logoText : 'Portfolio Admin'}</h1>
                  </Link>
                )}
                {session && (
                  <nav className="flex gap-4">
                    <Link href="/admin" className="text-secondary hover:underline">Dashboard</Link>
                    
                    {/* Site Configuration Dropdown */}
                    <div className="relative group">
                      <button className="flex items-center text-secondary hover:underline">
                        <span>Site Configuration</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                      <div 
                        className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out"
                        style={{ transitionDelay: '0.1s' }}
                        onMouseLeave={(e) => {
                          // Add a small delay before hiding the dropdown
                          e.currentTarget.style.transitionDelay = '0.3s';
                        }}
                      >
                        {/* General Settings */}
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                          General Settings
                        </div>
                        {checkPermission('canManageSiteSettings') && (
                          <Link href="/admin/site-settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Site Settings
                          </Link>
                        )}
                        {checkPermission('canManageLogos') && (
                          <Link href="/admin/logos" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Logos & Branding
                          </Link>
                        )}
                        
                        {/* Navigation & Structure */}
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 mt-2">
                          Navigation & Structure
                        </div>
                        {checkPermission('canManageNavigation') && (
                          <Link href="/admin/navigation" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Navigation Menu
                          </Link>
                        )}
                        {checkPermission('canManageFooter') && (
                          <Link href="/admin/footer" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Footer Content
                          </Link>
                        )}
                        {checkPermission('canManageLegalPages') && (
                          <Link href="/admin/legal-pages" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Legal Pages
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    {/* Portfolio Content Dropdown */}
                    <div className="relative group">
                      <button className="flex items-center text-secondary hover:underline">
                        <span>Portfolio Content</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                      <div 
                        className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out"
                        style={{ transitionDelay: '0.1s' }}
                        onMouseLeave={(e) => {
                          // Add a small delay before hiding the dropdown
                          e.currentTarget.style.transitionDelay = '0.3s';
                        }}
                      >
                        {/* Homepage Sections */}
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                          Homepage Sections
                        </div>
                        {checkPermission('canManageHero') && (
                          <Link href="/admin/hero" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Hero Section
                          </Link>
                        )}
                        {checkPermission('canManageHighlights') && (
                          <Link href="/admin/highlights" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Portfolio Highlights
                          </Link>
                        )}
                        
                        {/* Portfolio Items */}
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 mt-2">
                          Portfolio Items
                        </div>
                        {checkPermission('canManageProjects') && (
                          <Link href="/admin/projects" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Projects
                          </Link>
                        )}
                        {checkPermission('canManageSkills') && (
                          <Link href="/admin/skills" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Skills & Expertise
                          </Link>
                        )}
                        {checkPermission('canManageServices') && (
                          <Link href="/admin/services" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Services Offered
                          </Link>
                        )}
                        {checkPermission('canManageTimeline') && (
                          <Link href="/admin/timeline" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Experience Timeline
                          </Link>
                        )}
                        {checkPermission('canManageTestimonials') && (
                          <Link href="/admin/testimonials" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Client Testimonials
                          </Link>
                        )}
                        {checkPermission('canManageContact') && (
                          <Link href="/admin/contact" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Contact Information
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    {/* Content Management Dropdown */}
                    <div className="relative group">
                      <button className="flex items-center text-secondary hover:underline">
                        <span>Content Management</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                      <div 
                        className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out"
                        style={{ transitionDelay: '0.1s' }}
                        onMouseLeave={(e) => {
                          // Add a small delay before hiding the dropdown
                          e.currentTarget.style.transitionDelay = '0.3s';
                        }}
                      >
                        {/* Pages & Blog */}
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                          Pages & Blog
                        </div>
                        {(checkPermission('canManagePages')) && (
                          <Link href="/admin/pages" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Custom Pages
                          </Link>
                        )}
                        {(checkPermission('canManageBlog')) && (
                          <Link href="/admin/blog" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Blog Articles
                          </Link>
                        )}
                        
                        {/* Media & Assets */}
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 mt-2">
                          Media & Assets
                        </div>
                        {(checkPermission('canManage3DModels')) && (
                          <Link href="/admin/3d-models" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            3D Models
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    {/* Administration Dropdown - Admin Only */}
                    {checkPermission('canManageUsers') && (
                      <div className="relative group">
                        <button className="flex items-center text-secondary hover:underline">
                          <span>Administration</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                        <div 
                          className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out"
                          style={{ transitionDelay: '0.1s' }}
                          onMouseLeave={(e) => {
                            // Add a small delay before hiding the dropdown
                            e.currentTarget.style.transitionDelay = '0.3s';
                          }}
                        >
                          <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                            User Management
                          </div>
                          <Link href="/admin/users" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Users & Permissions
                          </Link>
                        </div>
                      </div>
                    )}
                    <div className="relative group ml-2">
                      <button className="flex items-center text-secondary hover:underline">
                        {session.user.image ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden mr-2 border-2 border-secondary">
                            <Image
                              src={session.user.image}
                              alt={session.user.name || 'Profile'}
                              width={32}
                              height={32}
                              className="object-cover w-full h-full"
                              unoptimized={session.user.image.startsWith('http')}
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-secondary">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                          </div>
                        )}
                        <span>{session.user.name}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                      <div 
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out"
                        style={{ transitionDelay: '0.1s' }}
                        onMouseLeave={(e) => {
                          // Add a small delay before hiding the dropdown
                          e.currentTarget.style.transitionDelay = '0.3s';
                        }}
                      >
                        <Link href="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                          Profile Settings
                        </Link>
                        <button 
                          onClick={() => signOut({ callbackUrl: '/admin/login' })}
                          className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </nav>
                )}
              </div>
            </header>
          )}
          <main className="container-custom py-8">
            {children}
          </main>
        </>
      ) : null}
    </div>
  )
}
