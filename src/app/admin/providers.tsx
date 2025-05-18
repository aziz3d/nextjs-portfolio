'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider as RoleAuthProvider } from '@/contexts/auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RoleAuthProvider>
        {children}
      </RoleAuthProvider>
    </SessionProvider>
  )
}
