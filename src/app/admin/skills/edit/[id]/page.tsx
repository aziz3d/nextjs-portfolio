'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Skill, skills as defaultSkills } from '@/data/skills'
import Notification from '@/components/ui/notification'

export default function EditSkill() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const [formData, setFormData] = useState<Partial<Skill>>({
    name: '',
    icon: '',
    level: 3,
    category: 'development',
    description: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
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
    
    const fetchSkill = async () => {
      try {
        setIsLoading(true)
        
        // First try to fetch from API
        try {
          const response = await fetch(`/api/skills/${id}`)
          if (response.ok) {
            const data = await response.json()
            if (data.skill) {
              setFormData({
                name: data.skill.name,
                icon: data.skill.icon,
                level: data.skill.level,
                category: data.skill.category,
                description: data.skill.description || ''
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
        const storedSkills = localStorage.getItem('skills')
        const skills = storedSkills ? JSON.parse(storedSkills) : defaultSkills
        
        const skill = skills.find((s: Skill) => s.id === id)
        
        if (!skill) {
          setError('Skill not found')
          setIsLoading(false)
          return
        }
        
        setFormData({
          name: skill.name,
          icon: skill.icon,
          level: skill.level,
          category: skill.category,
          description: skill.description || ''
        })
      } catch (error) {
        console.error('Error fetching skill:', error)
        setError('Failed to load skill')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (status === 'authenticated' && id) {
      fetchSkill()
    }
  }, [status, router, id])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'level') {
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category) {
      setError('Please fill in all required fields')
      return
    }
    
    try {
      setIsSubmitting(true)
      setError('')
      
      // Prepare the updated skill data with proper structure
      const updatedSkillData = {
        id, // Ensure ID is included
        name: formData.name || '',
        icon: formData.icon || '',
        iconType: formData.iconType || 'predefined',
        level: formData.level || 3,
        category: formData.category || '',
        description: formData.description || ''
      }
      
      // First try to update via API
      try {
        const response = await fetch(`/api/skills/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedSkillData)
        })
        
        if (response.ok) {
          // API update successful
        }
      } catch (apiError) {
        console.error('API update error:', apiError)
        // Continue to localStorage fallback
      }
      
      // Always update localStorage for immediate UI updates
      const storedSkills = localStorage.getItem('skills')
      const existingSkills = storedSkills ? JSON.parse(storedSkills) : defaultSkills
      
      // Check if the skill exists in the array
      const skillExists = existingSkills.some((skill: Skill) => skill.id === id)
      
      let updatedSkills
      if (skillExists) {
        // Update the existing skill
        updatedSkills = existingSkills.map((skill: Skill) => 
          skill.id === id 
            ? { 
                ...skill, 
                ...updatedSkillData
              } 
            : skill
        )
      } else {
        // If skill doesn't exist, add it to the array
        updatedSkills = [{ ...updatedSkillData }, ...existingSkills]
      }
      
      // Save to localStorage
      localStorage.setItem('skills', JSON.stringify(updatedSkills))
      
      // Trigger standard storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Also dispatch a custom event that we can listen for specifically
      document.dispatchEvent(new CustomEvent('custom-storage-event', { 
        detail: { key: 'skills', action: 'update', id } 
      }))
      
      // Force update the skills in localStorage to ensure it's properly saved
      localStorage.setItem('skills', JSON.stringify(updatedSkills))
      
      // Show success notification
      setNotification({
        show: true,
        type: 'success',
        message: 'Skill updated successfully!'
      })
      
      // Add a small delay before redirecting to ensure storage events are processed
      setTimeout(() => {
        // Redirect to skills admin page
        router.push('/admin/skills')
      }, 1500)
    } catch (error) {
      console.error('Error updating skill:', error)
      setError(error instanceof Error ? error.message : 'Failed to update skill')
      
      // Show error notification
      setNotification({
        show: true,
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update skill'
      })
    } finally {
      setIsSubmitting(false)
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
      {/* Notification component */}
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.push('/admin/skills')}
          className="mr-4 text-secondary hover:underline"
        >
          ← Back to Skills
        </button>
        <h1 className="heading-lg">Edit Skill</h1>
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
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Skill Name <span className="text-red-500">*</span>
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
              <label htmlFor="icon" className="block text-sm font-medium mb-2">
                Icon Name
              </label>
              <input
                id="icon"
                name="icon"
                type="text"
                value={formData.icon}
                onChange={handleChange}
                placeholder="e.g., react, figma, javascript"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter an icon name from a supported icon library or leave blank for default
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              >
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="3d">3D</option>
                <option value="ai">AI</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="level" className="block text-sm font-medium mb-2">
                Skill Level
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value={1}>Beginner</option>
                <option value={2}>Elementary</option>
                <option value={3}>Intermediate</option>
                <option value={4}>Advanced</option>
                <option value={5}>Expert</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/skills')}
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
