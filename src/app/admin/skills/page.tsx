'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Skill } from '@/data/skills'
import PredefinedIcon from '@/components/icons/PredefinedIcon'
import Notification from '@/components/ui/notification'
import ConfirmationDialog from '@/components/ui/confirmation-dialog'

export default function SkillsAdmin() {
  const { status } = useSession()
  const router = useRouter()
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message] = useState({ type: '', text: '' })
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    message: ''
  })
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    skillId: '',
    skillName: ''
  })
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    const fetchSkills = async () => {
      try {
        setIsLoading(true)
        
        // First try to fetch from API
        try {
          const response = await fetch('/api/skills')
          if (response.ok) {
            const data = await response.json()
            if (data.skills && Array.isArray(data.skills)) {
              setSkills(data.skills)
              // Store in localStorage for future use
              localStorage.setItem('skills', JSON.stringify(data.skills))
              setIsLoading(false)
              return
            }
          }
        } catch (apiError) {
          console.error('API fetch error:', apiError)
          // Continue to localStorage fallback
        }
        
        // Fallback to localStorage
        const storedSkills = localStorage.getItem('skills')
        if (storedSkills) {
          const parsedSkills = JSON.parse(storedSkills)
          setSkills(parsedSkills)
        } else {
          // If no skills in localStorage, use default skills from the data file
          const { skills: defaultSkills } = await import('@/data/skills')
          setSkills(defaultSkills)
          // Store in localStorage for future use
          localStorage.setItem('skills', JSON.stringify(defaultSkills))
        }
      } catch (error) {
        console.error('Error fetching skills:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Listen for storage events to update skills data
    const handleStorageEvent = (event: StorageEvent | CustomEvent) => {
      console.log('Storage event triggered', event)
      
      // Handle both browser storage events and custom events
      if (event instanceof StorageEvent) {
        // Only process if the skills key changed or if all storage was updated
        if (event.key === 'skills' || event.key === null) {
          loadSkillsFromStorage()
        }
      } else if ('detail' in event) {
        // This is our custom event with detail
        const detail = event.detail as { key: string; action: string }
        if (detail && detail.key === 'skills') {
          console.log('Custom storage event for skills:', detail.action)
          loadSkillsFromStorage()
        }
      } else {
        // This is our custom event triggered by window.dispatchEvent(new Event('storage'))
        loadSkillsFromStorage()
      }
    }
    
    // Helper function to load skills from localStorage
    const loadSkillsFromStorage = () => {
      const storedSkills = localStorage.getItem('skills')
      if (storedSkills) {
        try {
          const parsedSkills = JSON.parse(storedSkills)
          console.log('Loading skills from storage:', parsedSkills)
          
          // Validate skills data before setting
          if (Array.isArray(parsedSkills)) {
            // Filter out any invalid skills
            const validSkills = parsedSkills.filter(skill => 
              skill && typeof skill === 'object' && skill.id && skill.name && skill.category
            )
            
            if (validSkills.length > 0) {
              setSkills(validSkills)
              return
            }
          }
        } catch (e) {
          console.error('Error parsing skills data:', e)
        }
      }
      
      // If we get here, either there are no skills or the data is invalid
      // Load default skills
      import('@/data/skills').then(({ skills: defaultSkills }) => {
        setSkills(defaultSkills)
        localStorage.setItem('skills', JSON.stringify(defaultSkills))
      })
    }
    
    if (status === 'authenticated') {
      fetchSkills()
      // Listen for browser storage events
      window.addEventListener('storage', handleStorageEvent as EventListener)
      // Add event listener for our custom storage event
      document.addEventListener('custom-storage-event', handleStorageEvent as EventListener)
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageEvent as EventListener)
      document.removeEventListener('custom-storage-event', handleStorageEvent as EventListener)
    }
  }, [status, router])
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'design':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
      case 'development':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case '3d':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'ai':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }
  
  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Beginner'
      case 2: return 'Elementary'
      case 3: return 'Intermediate'
      case 4: return 'Advanced'
      case 5: return 'Expert'
      default: return 'Unknown'
    }
  }
  
  const handleEdit = (id: string) => {
    router.push(`/admin/skills/edit/${id}`)
  }
  
  const handleDelete = async (id: string) => {
    // Find the skill to get its name for the confirmation message
    const skillToDelete = skills.find(skill => skill.id === id)
    if (!skillToDelete) return
    
    // Open confirmation dialog instead of using JavaScript confirm
    setConfirmDialog({
      isOpen: true,
      skillId: id,
      skillName: skillToDelete.name
    })
  }
  
  const confirmDelete = async () => {
    const id = confirmDialog.skillId
    
    try {
      // First try to delete via API
      try {
        const response = await fetch(`/api/skills/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          // API delete successful
        }
      } catch (apiError) {
        console.error('API delete error:', apiError)
        // Continue to localStorage fallback
      }
      
      // Update UI
      const updatedSkills = skills.filter(skill => skill.id !== id)
      setSkills(updatedSkills)
      
      // Always update localStorage for immediate UI updates
      // Save to localStorage
      localStorage.setItem('skills', JSON.stringify(updatedSkills))
      
      // Trigger standard storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Also dispatch a custom event that we can listen for specifically
      document.dispatchEvent(new CustomEvent('custom-storage-event', { 
        detail: { key: 'skills', action: 'delete', id } 
      }))
      
      // Show success notification
      setNotification({
        show: true,
        type: 'success',
        message: 'Skill deleted successfully!'
      })
    } catch (error) {
      console.error('Error deleting skill:', error)
      // Show error notification
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to delete skill'
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
        title="Delete Skill"
        message={`Are you sure you want to delete "${confirmDialog.skillName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        type="danger"
      />
      <div className="flex justify-between items-center mb-8">
        <h1 className="heading-lg">Manage Skills</h1>
        <button
          onClick={() => router.push('/admin/skills/new')}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          Add New Skill
        </button>
      </div>
      
      {/* Inline message - keeping for backward compatibility */}
      {message.text && (
        <div className={`px-4 py-3 rounded mb-6 ${message.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-700'}`}>
          {message.text}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-6 h-6 mr-2 flex-shrink-0">
                          {skill.icon ? (
                            skill.iconType === 'custom' ? (
                              <Image 
                                src={skill.icon} 
                                alt={`${skill.name} icon`} 
                                width={24}
                                height={24}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <PredefinedIcon name={skill.icon} className="w-6 h-6 text-secondary" />
                            )
                          ) : (
                            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs">
                              {skill.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium">{skill.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(skill.category)}`}>
                        {skill.category.charAt(0).toUpperCase() + skill.category.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div 
                            className="h-full bg-secondary rounded-full" 
                            style={{ width: `${skill.level * 20}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{getLevelLabel(skill.level)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(skill.id)}
                        className="text-secondary hover:text-secondary/80 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {skills.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No skills found. Add your first skill!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
