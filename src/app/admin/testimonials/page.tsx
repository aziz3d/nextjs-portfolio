'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Testimonial, defaultTestimonials } from '@/data/testimonials'
import Notification from '@/components/ui/notification'
import ConfirmationDialog from '@/components/ui/confirmation-dialog'

export default function TestimonialsManagement() {
  const { status } = useSession()
  const router = useRouter()
  
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    message: ''
  })
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    testimonialId: '',
    testimonialName: ''
  })
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    // Load testimonials from localStorage
    const loadTestimonials = () => {
      try {
        const storedTestimonials = localStorage.getItem('testimonials')
        if (storedTestimonials) {
          setTestimonials(JSON.parse(storedTestimonials))
        } else {
          // Initialize with default testimonials if none exist
          setTestimonials(defaultTestimonials)
          localStorage.setItem('testimonials', JSON.stringify(defaultTestimonials))
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading testimonials:', error)
        setIsLoading(false)
      }
    }
    
    loadTestimonials()
    
    // Listen for storage events to update testimonials
    window.addEventListener('storage', loadTestimonials)
    return () => window.removeEventListener('storage', loadTestimonials)
  }, [status, router])
  
  const handleToggleFeatured = (id: string) => {
    try {
      const updatedTestimonials = testimonials.map(testimonial => 
        testimonial.id === id ? { ...testimonial, featured: !testimonial.featured } : testimonial
      )
      
      // Save to localStorage
      localStorage.setItem('testimonials', JSON.stringify(updatedTestimonials))
      
      // Update state
      setTestimonials(updatedTestimonials)
      
      // Trigger storage event for other components
      window.dispatchEvent(new Event('storage'))
      
      // Show success notification
      setNotification({
        show: true,
        type: 'success',
        message: 'Testimonial updated successfully'
      })
      
      // Keep the inline message for backward compatibility
      setMessage({ type: 'success', text: 'Testimonial updated successfully' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error updating testimonial:', error)
      
      // Show error notification
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to update testimonial'
      })
      
      // Keep the inline message for backward compatibility
      setMessage({ type: 'error', text: 'Failed to update testimonial' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }
  
  const handleDeleteTestimonial = (id: string) => {
    // Find the testimonial to get its name for the confirmation message
    const testimonialToDelete = testimonials.find(testimonial => testimonial.id === id)
    if (!testimonialToDelete) return
    
    // Open confirmation dialog instead of using JavaScript confirm
    setConfirmDialog({
      isOpen: true,
      testimonialId: id,
      testimonialName: testimonialToDelete.name
    })
  }
  
  const confirmDelete = () => {
    const id = confirmDialog.testimonialId
    
    try {
      const updatedTestimonials = testimonials.filter(testimonial => testimonial.id !== id)
      
      // Save to localStorage
      localStorage.setItem('testimonials', JSON.stringify(updatedTestimonials))
      
      // Update state
      setTestimonials(updatedTestimonials)
      
      // Trigger storage event for other components
      window.dispatchEvent(new Event('storage'))
      
      // Show success notification
      setNotification({
        show: true,
        type: 'success',
        message: 'Testimonial deleted successfully'
      })
      
      // Keep the inline message for backward compatibility
      setMessage({ type: 'success', text: 'Testimonial deleted successfully' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      
      // Show error notification
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to delete testimonial'
      })
      
      // Keep the inline message for backward compatibility
      setMessage({ type: 'error', text: 'Failed to delete testimonial' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }
  
  const handleEditTestimonial = (id: string) => {
    router.push(`/admin/testimonials/edit?id=${id}`)
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Notification component */}
        <Notification
          show={notification.show}
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ ...notification, show: false })}
        />
        
        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          title="Delete Testimonial"
          message={`Are you sure you want to delete the testimonial from "${confirmDialog.testimonialName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          type="danger"
        />
        
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification component */}
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Testimonial"
        message={`Are you sure you want to delete the testimonial from "${confirmDialog.testimonialName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        type="danger"
      />
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-lg">Testimonials Management</h1>
        <button
          onClick={() => router.push('/admin/testimonials/new')}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          Add New Testimonial
        </button>
      </div>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'error' 
            ? 'bg-red-100 text-red-700 border border-red-400' 
            : 'bg-green-100 text-green-700 border border-green-400'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.length > 0 ? (
          testimonials.map(testimonial => (
            <div 
              key={testimonial.id} 
              className="bg-white dark:bg-primary/40 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                    {testimonial.avatarUrl ? (
                      <Image 
                        src={testimonial.avatarUrl} 
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary/20 flex items-center justify-center text-secondary text-xl font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
                
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ${i < (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-sm mb-4 line-clamp-3 italic text-gray-600 dark:text-gray-300">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    testimonial.featured 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {testimonial.featured ? 'Featured' : 'Not Featured'}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleFeatured(testimonial.id)}
                      className={testimonial.featured ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}
                      title={testimonial.featured ? 'Remove from featured' : 'Add to featured'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEditTestimonial(testimonial.id)}
                      className="text-secondary hover:text-secondary/80"
                      title="Edit testimonial"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(testimonial.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete testimonial"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white dark:bg-primary/40 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No testimonials found</p>
            <button
              onClick={() => router.push('/admin/testimonials/new')}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Add Your First Testimonial
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
