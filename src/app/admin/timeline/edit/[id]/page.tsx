'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { TimelineItem } from '@/data/timeline'
import Notification from '@/components/ui/notification'

export default function EditTimelineItem() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const [formData, setFormData] = useState<Partial<TimelineItem>>({
    title: '',
    date: '',
    description: '',
    tags: [],
    link: { text: '', url: '' }
  })
  
  const [tagInput, setTagInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    message: ''
  })
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    const fetchTimelineItem = async () => {
      try {
        setIsLoading(true)
        
        // First try to fetch from API
        try {
          const response = await fetch(`/api/timeline/${id}`)
          if (response.ok) {
            const data = await response.json()
            if (data.timelineItem) {
              setFormData({
                title: data.timelineItem.title,
                date: data.timelineItem.date,
                description: data.timelineItem.description,
                tags: data.timelineItem.tags || [],
                link: data.timelineItem.link || { text: '', url: '' }
              })
              setIsLoading(false)
              return
            }
          }
        } catch (apiError) {
          console.error('API fetch error:', apiError)
          // Continue to localStorage fallback
        }
        
        // Fallback to localStorage
        // Check different possible localStorage keys
        let timeline = []
        const possibleKeys = ['timeline', 'timelineData', 'timelineItems']
        
        for (const key of possibleKeys) {
          const storedData = localStorage.getItem(key)
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData)
              if (Array.isArray(parsedData)) {
                timeline = parsedData
                break
              }
            } catch (e) {
              console.error(`Error parsing ${key}:`, e)
            }
          }
        }
        
        // If still empty, use the default timeline from the data file
        if (timeline.length === 0) {
          // Import the default timeline
          const { timeline: defaultTimeline } = await import('@/data/timeline')
          timeline = defaultTimeline
        }
        
        const item = timeline.find((item: TimelineItem) => item.id === id)
        
        if (!item) {
          setError('Timeline item not found')
          return
        }
        
        setFormData({
          title: item.title,
          date: item.date,
          description: item.description,
          tags: item.tags || [],
          link: item.link || { text: '', url: '' }
        })
      } catch (error) {
        console.error('Error fetching timeline item:', error)
        setError('Failed to load timeline item')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (status === 'authenticated' && id) {
      fetchTimelineItem()
    }
  }, [status, router, id])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name.startsWith('link.')) {
      const linkField = name.split('.')[1]
      setFormData({
        ...formData,
        link: {
          ...formData.link!,
          [linkField]: value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }
  
  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }
  
  const handleRemoveTag = (index: number) => {
    if (formData.tags) {
      const newTags = [...formData.tags]
      newTags.splice(index, 1)
      setFormData({
        ...formData,
        tags: newTags
      })
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.date || !formData.description) {
      setError('Please fill in all required fields')
      return
    }
    
    try {
      setIsSubmitting(true)
      setError('')
      
      // First try to update via API if available
      try {
        const response = await fetch(`/api/timeline/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            id: id // Ensure ID is included
          })
        })
        
        if (response.ok) {
          router.push('/admin/timeline')
          return
        }
      } catch (apiError) {
        console.error('API update error:', apiError)
        // Continue to localStorage fallback
      }
      
      // Fallback to localStorage
      // Check different possible localStorage keys
      let timelineKey = 'timeline'
      let timeline = []
      const possibleKeys = ['timeline', 'timelineData', 'timelineItems']
      
      for (const key of possibleKeys) {
        const storedData = localStorage.getItem(key)
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData)
            if (Array.isArray(parsedData)) {
              timeline = parsedData
              timelineKey = key
              break
            }
          } catch (e) {
            console.error(`Error parsing ${key}:`, e)
          }
        }
      }
      
      // If timeline is still empty, use the default timeline
      if (timeline.length === 0) {
        const { timeline: defaultTimeline } = await import('@/data/timeline')
        timeline = defaultTimeline
      }
      
      // Update the timeline item
      const updatedTimeline = timeline.map(item => 
        item.id === id ? { ...formData as TimelineItem, id } : item
      )
      
      // If the item wasn't found (no items were updated), add it as a new item
      if (!updatedTimeline.some((item: TimelineItem) => item.id === id)) {
        updatedTimeline.push({
          ...formData as TimelineItem,
          id
        } as TimelineItem)
      }
      
      // Save to localStorage
      localStorage.setItem(timelineKey, JSON.stringify(updatedTimeline))
      
      // Also save to 'timelineData' to ensure compatibility with other components
      if (timelineKey !== 'timelineData') {
        localStorage.setItem('timelineData', JSON.stringify(updatedTimeline))
      }
      
      // Trigger standard storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Also dispatch a custom event that we can listen for specifically
      document.dispatchEvent(new CustomEvent('custom-storage-event', { 
        detail: { key: 'timelineData', action: 'update', id } 
      }))
      
      // Show success notification
      setNotification({
        show: true,
        type: 'success',
        message: 'Timeline entry updated successfully!'
      })
      
      // Redirect to timeline admin page after a short delay
      setTimeout(() => {
        router.push('/admin/timeline')
      }, 1500)
    } catch (error) {
      console.error('Error updating timeline item:', error)
      setError(error instanceof Error ? error.message : 'Failed to update timeline item')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
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
        <h1 className="heading-lg">Edit Timeline Entry</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              required
            />
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              placeholder="e.g., 2023 or Jan 2023"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-secondary text-white rounded-r-lg hover:bg-secondary/90 transition-colors"
              >
                Add
              </button>
            </div>
            
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="ml-1 text-secondary/70 hover:text-secondary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Link (Optional)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="link.text"
                  value={formData.link?.text || ''}
                  onChange={handleChange}
                  placeholder="Link Text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <input
                  type="url"
                  name="link.url"
                  value={formData.link?.url || ''}
                  onChange={handleChange}
                  placeholder="URL"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/admin/timeline')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
