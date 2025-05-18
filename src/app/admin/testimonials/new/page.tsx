'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Testimonial, defaultTestimonials } from '@/data/testimonials'
import Notification from '@/components/ui/notification'

export default function NewTestimonial() {
  const { status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: '',
    role: '',
    company: '',
    content: '',
    rating: 5,
    featured: false
  })
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    message: ''
  })
  
  if (status === 'unauthenticated') {
    router.push('/admin/login')
    return null
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, files } = e.target as HTMLInputElement
    
    if (type === 'file' && files && files.length > 0) {
      handleAvatarUpload(files[0])
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      })
    } else if (name === 'rating') {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10)
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }
  
  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploading(true)
      
      // Show preview immediately
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarPreview(result)
      }
      reader.readAsDataURL(file)
      
      // Upload the file to the server
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', 'testimonials')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload avatar')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          avatarUrl: data.filePath
        }))
      } else {
        throw new Error(data.error || 'Failed to upload avatar')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setError('Failed to upload avatar. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.role || !formData.company || !formData.content) {
      setError('Please fill in all required fields')
      return
    }
    
    try {
      setIsSubmitting(true)
      setError('')
      
      // Get existing testimonials
      const storedTestimonials = localStorage.getItem('testimonials')
      const existingTestimonials: Testimonial[] = storedTestimonials 
        ? JSON.parse(storedTestimonials) 
        : defaultTestimonials
      
      // Generate a unique ID
      const newTestimonial: Testimonial = {
        ...formData as Testimonial,
        id: `testimonial-${Date.now()}`
      }
      
      // Add the new testimonial
      const updatedTestimonials = [...existingTestimonials, newTestimonial]
      
      // Save to localStorage
      localStorage.setItem('testimonials', JSON.stringify(updatedTestimonials))
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Show success notification
      setNotification({
        show: true,
        type: 'success',
        message: 'Testimonial added successfully!'
      })
      
      // Add a small delay before redirecting
      setTimeout(() => {
        router.push('/admin/testimonials')
      }, 1500)
    } catch (error) {
      console.error('Error adding testimonial:', error)
      setError(error instanceof Error ? error.message : 'Failed to add testimonial')
      
      // Show error notification
      setNotification({
        show: true,
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to add testimonial'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div>
      {/* Notification component */}
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.push('/admin/testimonials')}
          className="mr-4 text-secondary hover:underline"
        >
          ← Back to Testimonials
        </button>
        <h1 className="heading-lg">Add New Testimonial</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 mb-4">
              {avatarPreview || formData.avatarUrl ? (
                <Image 
                  src={avatarPreview || formData.avatarUrl || ''} 
                  alt="Avatar Preview" 
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
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : 'Upload Avatar'}
            </button>
            
            <input
              ref={fileInputRef}
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            
            <p className="text-sm text-gray-500 mt-2">
              Optional: Upload a client avatar (recommended size: 200x200px)
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium mb-2">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-2">
              Role/Position <span className="text-red-500">*</span>
            </label>
            <input
              id="role"
              name="role"
              type="text"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
              placeholder="e.g. CEO, Marketing Director, Project Manager"
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Testimonial Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
              placeholder="What did the client say about your work?"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="rating" className="block text-sm font-medium mb-2">
                Rating (1-5)
              </label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="focus:outline-none"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-8 w-8 ${star <= (formData.rating || 5) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <input
                  type="hidden"
                  name="rating"
                  value={formData.rating}
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm font-medium">
                Feature on homepage
              </label>
              <p className="text-sm text-gray-500 ml-6">
                Featured testimonials will be displayed in the testimonials section
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/testimonials')}
              className="px-4 py-2 border border-gray-300 rounded-lg mr-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
