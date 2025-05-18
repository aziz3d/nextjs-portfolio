'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { TimelineItem } from '@/data/timeline'
import Notification from '@/components/ui/notification'

export default function NewTimelineItem() {
  const { status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState<Partial<TimelineItem>>({
    date: '',
    title: '',
    description: '',
    tags: []
  })
  
  const [tagInput, setTagInput] = useState('')
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      })
      setTagInput('')
    }
  }
  
  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t: string) => t !== tag) || []
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.date || !formData.title || !formData.description) {
      setError('Please fill in all required fields')
      return
    }
    
    try {
      setIsSubmitting(true)
      setError('')
      
      // Generate a unique ID for the new timeline entry
      const newTimelineId = `timeline-${Date.now()}`
      
      // Create the new timeline entry object
      const newTimelineEntry: TimelineItem = {
        ...formData as TimelineItem,
        id: newTimelineId
      }
      
      // First try to save via API
      try {
        const response = await fetch('/api/timeline', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newTimelineEntry)
        })
        
        if (response.ok) {
          // API save successful
        }
      } catch (apiError) {
        console.error('API save error:', apiError)
        // Continue to localStorage fallback
      }
      
      // Always update localStorage for immediate UI updates
      // Get existing timeline entries from localStorage
      const storedTimeline = localStorage.getItem('timelineData')
      const existingTimeline = storedTimeline ? JSON.parse(storedTimeline) : []
      
      // Add the new timeline entry
      const updatedTimeline = [newTimelineEntry, ...existingTimeline]
      
      // Save to localStorage
      localStorage.setItem('timelineData', JSON.stringify(updatedTimeline))
      
      // Trigger standard storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Also dispatch a custom event that we can listen for specifically
      document.dispatchEvent(new CustomEvent('custom-storage-event', { 
        detail: { key: 'timelineData', action: 'add' } 
      }))
      
      // Show success notification
      setNotification({
        show: true,
        type: 'success',
        message: 'Timeline entry added successfully!'
      })
      
      // Redirect to timeline admin page after a short delay
      setTimeout(() => {
        router.push('/admin/timeline')
      }, 1500)
    } catch (error) {
      console.error('Error adding timeline entry:', error)
      setError('Failed to add timeline entry')
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
          onClick={() => router.push('/admin/timeline')}
          className="mr-4 text-secondary hover:underline"
        >
          ← Back to Timeline
        </button>
        <h1 className="heading-lg">Add New Timeline Entry</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                id="date"
                name="date"
                type="text"
                value={formData.date}
                onChange={handleChange}
                placeholder="e.g., 2023 - Present"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Senior Creative Developer"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your role, achievements, or experience"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Tags
            </label>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag"
                className="flex-1 px-4 py-2 border rounded-l-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-secondary text-white rounded-r-lg hover:bg-secondary/90 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags?.map((tag) => (
                <span 
                  key={tag} 
                  className="text-sm px-3 py-1 bg-secondary/10 text-secondary rounded-full flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-secondary/70 hover:text-secondary"
                  >
                    ×
                  </button>
                </span>
              ))}
              {formData.tags?.length === 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  No tags added yet
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="linkText" className="block text-sm font-medium mb-2">
                Link Text
              </label>
              <input
                id="linkText"
                name="linkText"
                type="text"
                value={formData.link?.text || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    // If there's a value, create/update the link with both text and url
                    setFormData({
                      ...formData,
                      link: {
                        url: formData.link?.url || '',  // Ensure url is a string
                        text: value
                      }
                    });
                  } else if (formData.link?.url) {
                    // If text is empty but URL exists, keep the link with empty text
                    setFormData({
                      ...formData,
                      link: {
                        url: formData.link.url,
                        text: ''
                      }
                    });
                  } else {
                    // If both text and URL are empty, remove the link
                    const newFormData = { ...formData };
                    delete newFormData.link;
                    setFormData(newFormData);
                  }
                }}
                placeholder="e.g., View Project"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="linkUrl" className="block text-sm font-medium mb-2">
                Link URL
              </label>
              <input
                id="linkUrl"
                name="linkUrl"
                type="url"
                value={formData.link?.url || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    // If there's a value, create/update the link with both url and text
                    setFormData({
                      ...formData,
                      link: {
                        text: formData.link?.text || '',  // Ensure text is a string
                        url: value
                      }
                    });
                  } else if (formData.link?.text) {
                    // If URL is empty but text exists, keep the link with empty URL
                    setFormData({
                      ...formData,
                      link: {
                        text: formData.link.text,
                        url: ''
                      }
                    });
                  } else {
                    // If both URL and text are empty, remove the link
                    const newFormData = { ...formData };
                    delete newFormData.link;
                    setFormData(newFormData);
                  }
                }}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/timeline')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 mr-4"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
