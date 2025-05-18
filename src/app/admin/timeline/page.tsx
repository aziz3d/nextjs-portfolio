'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { TimelineItem } from '@/data/timeline'
import Notification from '@/components/ui/notification'
import ConfirmationDialog from '@/components/ui/confirmation-dialog'

export default function TimelineAdmin() {
  const { status } = useSession()
  const router = useRouter()
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    message: ''
  })
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    itemId: '',
    itemTitle: ''
  })
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    const fetchTimeline = async () => {
      try {
        setIsLoading(true)
        
        // First try to fetch from API
        try {
          const response = await fetch('/api/timeline')
          if (response.ok) {
            const data = await response.json()
            if (data.timeline && Array.isArray(data.timeline)) {
              setTimeline(data.timeline)
              // Store in localStorage for future use
              localStorage.setItem('timelineData', JSON.stringify(data.timeline))
              setIsLoading(false)
              return
            }
          }
        } catch (apiError) {
          console.error('API fetch error:', apiError)
          // Continue to localStorage fallback
        }
        
        // Fallback to localStorage
        let foundData = false
        const possibleKeys = ['timelineData', 'timeline', 'timelineItems']
        
        for (const key of possibleKeys) {
          const storedData = localStorage.getItem(key)
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData)
              if (Array.isArray(parsedData)) {
                setTimeline(parsedData)
                foundData = true
                break
              }
            } catch (e) {
              console.error(`Error parsing ${key}:`, e)
            }
          }
        }
        
        // If still no data, use the default timeline from the data file
        if (!foundData) {
          // Import the default timeline
          const { timeline: defaultTimeline } = await import('@/data/timeline')
          setTimeline(defaultTimeline)
          // Store in localStorage for future use
          localStorage.setItem('timelineData', JSON.stringify(defaultTimeline))
        }
      } catch (error) {
        console.error('Error fetching timeline:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Listen for storage events to update timeline data
    const handleStorageChange = (e: StorageEvent | Event) => {
      console.log('Timeline storage event triggered', e)
      // Handle both browser storage events and custom events
      if (e instanceof StorageEvent) {
        // Only process if the timeline key changed or if all storage was updated
        const possibleKeys = ['timelineData', 'timeline', 'timelineItems']
        if (e.key === null || possibleKeys.includes(e.key)) {
          loadTimelineFromStorage()
        }
      } else if (e instanceof CustomEvent && e.type === 'custom-storage-event') {
        // This is our custom event triggered by document.dispatchEvent(new CustomEvent())
        if (e.detail?.key && ['timelineData', 'timeline', 'timelineItems'].includes(e.detail.key)) {
          loadTimelineFromStorage()
        } else {
          // If no specific key, reload anyway
          loadTimelineFromStorage()
        }
      } else {
        // This is our standard event triggered by window.dispatchEvent(new Event('storage'))
        loadTimelineFromStorage()
      }
    }
    
    // Helper function to load timeline from localStorage
    const loadTimelineFromStorage = () => {
      const possibleKeys = ['timelineData', 'timeline', 'timelineItems']
      for (const key of possibleKeys) {
        const storedData = localStorage.getItem(key)
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData)
            if (Array.isArray(parsedData)) {
              console.log('Loading timeline from storage:', parsedData)
              setTimeline(parsedData)
              break
            }
          } catch (e) {
            console.error(`Error parsing ${key}:`, e)
          }
        }
      }
    }
    
    if (status === 'authenticated') {
      fetchTimeline()
      // Listen for browser storage events
      window.addEventListener('storage', handleStorageChange)
      // Add event listener for our custom storage event
      document.addEventListener('custom-storage-event', handleStorageChange)
      // Add event listener for our standard storage event
      window.addEventListener('storage', handleStorageChange)
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('custom-storage-event', handleStorageChange)
    }
  }, [status, router])
  
  const handleEdit = (id: string) => {
    router.push(`/admin/timeline/edit/${id}`)
  }
  
  const handleDelete = async (id: string) => {
    // Find the timeline item to get its title for the confirmation message
    const itemToDelete = timeline.find(item => item.id === id)
    if (!itemToDelete) return
    
    // Open confirmation dialog instead of using JavaScript confirm
    setConfirmDialog({
      isOpen: true,
      itemId: id,
      itemTitle: itemToDelete.title
    })
  }
  
  const confirmDelete = async () => {
    const id = confirmDialog.itemId
    
    try {
      // First try to delete via API if available
      let apiSuccess = false
      try {
        const response = await fetch(`/api/timeline/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          apiSuccess = true
        }
      } catch (apiError) {
        console.error('API delete error:', apiError)
        // Continue to localStorage fallback
      }
      
      // Update UI
      const updatedTimeline = timeline.filter(item => item.id !== id)
      setTimeline(updatedTimeline)
      
      // If API call wasn't successful, update localStorage
      if (!apiSuccess) {
        // Check which localStorage key has the timeline data
        const possibleKeys = ['timelineData', 'timeline', 'timelineItems']
        let updatedKey = 'timelineData' // Default key to use
        
        for (const key of possibleKeys) {
          const storedData = localStorage.getItem(key)
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData)
              if (Array.isArray(parsedData) && parsedData.some(item => item.id === id)) {
                // Found the key with our timeline data
                updatedKey = key
                break
              }
            } catch (e) {
              console.error(`Error parsing ${key}:`, e)
            }
          }
        }
        
        // Save the updated timeline to localStorage
        localStorage.setItem(updatedKey, JSON.stringify(updatedTimeline))
        
        // Also save to timelineData for consistency
        if (updatedKey !== 'timelineData') {
          localStorage.setItem('timelineData', JSON.stringify(updatedTimeline))
        }
        
        // Trigger standard storage event for other components to update
        window.dispatchEvent(new Event('storage'))
        
        // Also dispatch a custom event that we can listen for specifically
        document.dispatchEvent(new CustomEvent('custom-storage-event', { 
          detail: { key: 'timelineData', action: 'delete', id } 
        }))
      }
      
      // Show success notification
      setNotification({
        show: true,
        type: 'success',
        message: 'Timeline entry deleted successfully!'
      })
    } catch (error) {
      console.error('Error deleting timeline entry:', error)
      // Show error notification
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to delete timeline entry'
      })
    }
  }
  
  if (status === 'loading' || status === 'unauthenticated') {
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
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Timeline Entry"
        message={`Are you sure you want to delete "${confirmDialog.itemTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        type="danger"
      />
      <div className="flex justify-between items-center mb-8">
        <h1 className="heading-lg">Manage Timeline</h1>
        <button
          onClick={() => router.push('/admin/timeline/new')}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          Add New Entry
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {timeline.map((item) => (
            <div 
              key={item.id} 
              className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm font-mono text-secondary mb-1">{item.date}</div>
                  <h3 className="text-xl font-display font-bold">{item.title}</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="p-2 text-secondary hover:bg-secondary/10 rounded-full transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">{item.description}</p>
              
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {item.link && (
                <div className="mt-4">
                  <a 
                    href={item.link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-secondary hover:underline flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    {item.link.text}
                  </a>
                </div>
              )}
            </div>
          ))}
          
          {timeline.length === 0 && (
            <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No timeline entries found.</p>
              <button
                onClick={() => router.push('/admin/timeline/new')}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Add Your First Entry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
