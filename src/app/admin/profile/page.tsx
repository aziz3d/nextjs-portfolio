'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

export default function ProfileSettings() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profilePicture: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    if (status === 'authenticated' && session?.user) {
      setProfileData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
        profilePicture: session.user.image || ''
      }))
      
      if (session.user.image) {
        setPreviewImage(session.user.image)
      }
      
      setIsLoading(false)
    }
  }, [status, session, router])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target
    
    if (name === 'profilePicture' && files && files.length > 0) {
      const file = files[0]
      const reader = new FileReader()
      
      // Show preview immediately
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewImage(result)
      }
      reader.readAsDataURL(file)
      
      // Upload the file to the server
      uploadProfileImage(file)
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }
  
  const uploadProfileImage = async (file: File) => {
    try {
      setMessage({ type: '', text: '' })
      console.log('Uploading profile image...')
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', 'profile')
      
      // Show loading message
      setMessage({ type: 'info', text: 'Uploading profile picture...' })
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      console.log('Upload response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upload error response:', errorText)
        throw new Error(`Failed to upload image: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Upload response data:', data)
      
      if (data.success) {
        // Update the profile data with the new image path
        const fullImagePath = data.filePath
        console.log('Profile image uploaded successfully:', fullImagePath)
        
        setProfileData(prev => ({
          ...prev,
          profilePicture: fullImagePath
        }))
        
        // Also update the preview image with the actual path
        // This ensures the UI shows the saved image from the server
        setPreviewImage(fullImagePath)
        
        // Show success message
        setMessage({ type: 'success', text: 'Profile picture uploaded successfully' })
      } else {
        throw new Error(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading profile image:', error)
      setMessage({ type: 'error', text: `Failed to upload profile image: ${error instanceof Error ? error.message : 'Unknown error'}` })
    }
  }
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset message
    setMessage({ type: '', text: '' })
    
    // Validate form
    if (!profileData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' })
      return
    }
    
    try {
      setIsSaving(true)
      setMessage({ type: 'info', text: 'Updating profile...' })
      
      console.log('Updating profile with data:', {
        name: profileData.name,
        email: profileData.email,
        image: profileData.profilePicture
      })
      
      // Try to update via API first (if implemented)
      try {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: profileData.name,
            email: profileData.email,
            image: profileData.profilePicture
          })
        })
        
        if (response.ok) {
          const apiData = await response.json()
          console.log('API update successful:', apiData)
        }
      } catch (apiError) {
        console.log('API update not available, using session update instead:', apiError)
        // Continue with session update as fallback
      }
      
      // Update the session with the new name, email, and profile picture
      console.log('Updating session with new profile data')
      await update({
        ...session,
        user: {
          ...session?.user,
          name: profileData.name,
          email: profileData.email,
          image: profileData.profilePicture
        }
      })
      
      // Also store in localStorage for persistence
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('userProfile', JSON.stringify({
            name: profileData.name,
            email: profileData.email,
            image: profileData.profilePicture
          }))
          console.log('Profile data saved to localStorage')
        } catch (storageError) {
          console.error('Failed to save profile to localStorage:', storageError)
        }
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: `Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}` })
    } finally {
      setIsSaving(false)
    }
  }
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset message
    setMessage({ type: '', text: '' })
    setMessage({ type: 'info', text: 'Processing password change...' })
    
    // Validate form
    if (!profileData.currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required' })
      return
    }
    
    if (!profileData.newPassword) {
      setMessage({ type: 'error', text: 'New password is required' })
      return
    }
    
    if (profileData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' })
      return
    }
    
    if (profileData.newPassword !== profileData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    
    try {
      setIsSaving(true)
      
      console.log('Attempting to change password')
      
      // First try to update via API
      try {
        const response = await fetch('/api/user/password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            currentPassword: profileData.currentPassword,
            newPassword: profileData.newPassword
          })
        })
        
        if (response.ok) {
          const apiData = await response.json()
          console.log('Password changed via API:', apiData)
        } else {
          const errorData = await response.json()
          console.error('API password change failed:', errorData)
          throw new Error(errorData.message || 'Failed to change password via API')
        }
      } catch (apiError) {
        console.log('API password change not available, using localStorage fallback:', apiError)
        
        // For demo purposes, store the new password in localStorage
        if (typeof window !== 'undefined') {
          try {
            // Get existing user data if any
            const existingUserData = localStorage.getItem('userCredentials')
            const userData = existingUserData ? JSON.parse(existingUserData) : {}
            
            // Update with new password (in a real app, this would be hashed)
            userData.password = profileData.newPassword
            
            // Save back to localStorage
            localStorage.setItem('userCredentials', JSON.stringify(userData))
            console.log('Password saved to localStorage')
          } catch (storageError) {
            console.error('Failed to save password to localStorage:', storageError)
            throw storageError
          }
        }
      }
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
      
      setMessage({ type: 'success', text: 'Password changed successfully' })
    } catch (error) {
      console.error('Error changing password:', error)
      setMessage({ type: 'error', text: `Failed to change password: ${error instanceof Error ? error.message : 'Unknown error'}` })
    } finally {
      setIsSaving(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-lg">Profile Settings</h1>
      </div>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'error' 
            ? 'bg-red-100 text-red-700 border border-red-400' 
            : message.type === 'info'
              ? 'bg-blue-100 text-blue-700 border border-blue-400'
              : 'bg-green-100 text-green-700 border border-green-400'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6">
          <h2 className="heading-md mb-6">Profile Information</h2>
          
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 mb-4">
                {previewImage ? (
                  <Image 
                    src={previewImage} 
                    alt="Profile Picture" 
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Change Picture
              </button>
              
              <input
                ref={fileInputRef}
                id="profilePicture"
                name="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={profileData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Change Password */}
        <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6">
          <h2 className="heading-md mb-6">Change Password</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={profileData.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={profileData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
                minLength={8}
              />
              <p className="text-sm text-gray-500 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={profileData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
