'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { User, getUserByEmail, hasPermission, getUsers, saveUsers } from '@/data/users'

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  hasPermission: () => false,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    setIsLoading(false)

    if (status === 'authenticated' && session?.user?.email) {
      // Get user from our "database" (localStorage)
      let user = getUserByEmail(session.user.email)
      
      // If no user found but we have a session, create a default admin user
      if (!user && session.user.email) {
        console.log('No user found in localStorage, creating default admin user')
        const defaultUser: User = {
          id: `admin-user-${Date.now()}`,
          name: session.user.name || 'Admin User',
          email: session.user.email,
          role: 'admin' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          image: session.user.image || undefined
        }
        
        // Save the user to localStorage
        const users = getUsers()
        users.push(defaultUser)
        saveUsers(users)
        
        user = defaultUser
      }
      
      if (user) {
        setCurrentUser({
          ...user,
          // Update user image from session if available
          image: session.user.image || user.image
        })
        
        // Store user profile in localStorage for persistence
        if (typeof window !== 'undefined' && session.user.image) {
          try {
            const userProfile = { image: session.user.image }
            localStorage.setItem('userProfile', JSON.stringify(userProfile))
          } catch (error) {
            console.error('Error storing user profile:', error)
          }
        }
      } else {
        setCurrentUser(null)
      }
    } else {
      setCurrentUser(null)
    }
  }, [session, status])

  type PermissionKey = 
    | 'canManageUsers'
    | 'canManageSiteSettings'
    | 'canManageNavigation'
    | 'canManageFooter'
    | 'canManageLegalPages'
    | 'canManageLogos'
    | 'canManage3DModels'
    | 'canManageHero'
    | 'canManageHighlights'
    | 'canManageProjects'
    | 'canManageSkills'
    | 'canManageTimeline'
    | 'canManageServices'
    | 'canManageTestimonials'
    | 'canManageContact'
    | 'canManagePages'
    | 'canManageBlog';

  const checkPermission = (permission: string) => {
    if (!currentUser) return false
    return hasPermission(currentUser, permission as PermissionKey)
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        hasPermission: checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
