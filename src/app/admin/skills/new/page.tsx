'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Skill } from '@/data/skills'
import Image from 'next/image'
import PredefinedIcon from '@/components/icons/PredefinedIcon'
import Notification from '@/components/ui/notification'

export default function NewSkill() {
  const { status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState<Partial<Skill>>({
    name: '',
    icon: '',
    iconType: 'predefined',
    level: 3,
    category: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [uploadedIconPath, setUploadedIconPath] = useState('')
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    message: ''
  })
  const [customCategory, setCustomCategory] = useState('')
  const [predefinedCategories] = useState([
    'Development', 'Design', '3D', 'AI', 'Tools', 'Languages', 'Frameworks', 'Other'
  ])
  
  const [predefinedIcons] = useState([
    'react', 'javascript', 'typescript', 'html', 'css', 'nextjs', 'threejs', 'nodejs', 'python', 'tailwind',
    'figma', 'adobe', 'photoshop', 'illustrator', 'xd', 'aftereffects', 'blender',
    'github', 'database', 'code', 'unity', 'development'
  ])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  if (status === 'unauthenticated') {
    router.push('/admin/login')
    return null
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'level') {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10)
      })
    } else if (name === 'category' && value === 'custom') {
      // If user selects custom category, don't update the formData yet
      // We'll update it when they type in the custom category field
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }
  
  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomCategory(value)
    setFormData({
      ...formData,
      category: value
    })
  }
  
  const handleIconTypeChange = (type: 'predefined' | 'custom') => {
    setFormData({
      ...formData,
      iconType: type,
      // Reset icon when changing type
      icon: type === 'predefined' ? '' : uploadedIconPath || ''
    })
  }
  
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const file = files[0]
    if (!file.name.toLowerCase().endsWith('.svg')) {
      setMessage({ type: 'error', text: 'Please upload an SVG file for the icon' })
      return
    }
    
    try {
      setUploadingIcon(true)
      setMessage({ type: '', text: '' })
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', 'skill-icon')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload icon')
      }
      
      const data = await response.json()
      console.log('Upload response:', data)
      
      if (data.success && data.filePath) {
        setUploadedIconPath(data.filePath)
        setFormData(prev => ({
          ...prev,
          icon: data.filePath,
          iconType: 'custom'
        }))
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Error uploading icon:', error)
      setMessage({ type: 'error', text: 'Failed to upload icon' })
    } finally {
      setUploadingIcon(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }
    
    try {
      setIsSubmitting(true)
      setMessage({ type: '', text: '' })
      
      // Generate a unique ID for the new skill
      const newSkillId = `skill-${Date.now()}`
      
      // Create the new skill object with proper structure
      const newSkill: Skill = {
        id: newSkillId,
        name: formData.name || '',
        icon: formData.icon || '',
        iconType: formData.iconType || 'predefined',
        level: formData.level || 3,
        category: formData.category || '',
        description: formData.description || ''
      }
      
      // First try to save via API
      try {
        const response = await fetch('/api/skills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newSkill)
        })
        
        if (response.ok) {
          // API save successful
        }
      } catch (apiError) {
        console.error('API save error:', apiError)
        // Continue to localStorage fallback
      }
      
      // Always update localStorage for immediate UI updates
      // Get existing skills from localStorage
      const storedSkills = localStorage.getItem('skills')
      const existingSkills = storedSkills ? JSON.parse(storedSkills) : []
      
      // Add the new skill
      const updatedSkills = [newSkill, ...existingSkills]
      
      // Save to localStorage
      localStorage.setItem('skills', JSON.stringify(updatedSkills))
      
      // Trigger standard storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Also dispatch a custom event that we can listen for specifically
      document.dispatchEvent(new CustomEvent('custom-storage-event', { 
        detail: { key: 'skills', action: 'add' } 
      }))
      
      // Force update the skills in localStorage to ensure it's properly saved
      localStorage.setItem('skills', JSON.stringify(updatedSkills))
      
      // Show success notification
      setNotification({
        show: true,
        type: 'success',
        message: 'Skill added successfully!'
      })
      
      // Set success message for inline display
      setMessage({ type: 'success', text: 'Skill added successfully! Redirecting...' })
      
      // Redirect to skills admin page after a short delay
      setTimeout(() => {
        router.push('/admin/skills')
      }, 1500)
    } catch (error) {
      console.error('Error adding skill:', error)
      setMessage({ type: 'error', text: 'Failed to add skill' })
      
      // Show error notification
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to add skill'
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
          onClick={() => router.push('/admin/skills')}
          className="mr-4 text-secondary hover:underline"
        >
          ← Back to Skills
        </button>
        <h1 className="heading-lg">Add New Skill</h1>
      </div>
      
      {message.text && (
        <div className={`px-4 py-3 rounded mb-6 ${message.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-700'}`}>
          {message.text}
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
                placeholder="e.g., React"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <select
                  id="category"
                  name="category"
                  value={formData.category || 'custom'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {predefinedCategories.map(category => (
                    <option key={category} value={category.toLowerCase()}>{category}</option>
                  ))}
                  <option value="custom">Custom Category...</option>
                </select>
                
                {(formData.category === 'custom' || !predefinedCategories.map(c => c.toLowerCase()).includes(formData.category?.toLowerCase() || '')) && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={handleCustomCategoryChange}
                    placeholder="Enter custom category"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                  />
                )}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Icon
            </label>
            
            <div className="mb-4">
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => handleIconTypeChange('predefined')}
                  className={`px-4 py-2 rounded-lg ${formData.iconType === 'predefined' ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                >
                  Use Predefined Icon
                </button>
                <button
                  type="button"
                  onClick={() => handleIconTypeChange('custom')}
                  className={`px-4 py-2 rounded-lg ${formData.iconType === 'custom' ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                >
                  Upload SVG Icon
                </button>
              </div>
              
              {formData.iconType === 'predefined' ? (
                <div>
                  <div className="mb-3">
                    <input
                      id="icon"
                      name="icon"
                      type="text"
                      value={formData.icon}
                      onChange={handleChange}
                      placeholder="e.g., react, javascript, figma"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Available Icons:</p>
                    <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                      {predefinedIcons.map(iconName => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              icon: iconName
                            })
                          }}
                          className={`p-2 rounded-lg flex flex-col items-center justify-center text-xs ${formData.icon === iconName ? 'bg-secondary/20 border border-secondary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                          <PredefinedIcon name={iconName} className="w-6 h-6 mb-1" />
                          <span className="truncate w-full text-center">{iconName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      disabled={uploadingIcon}
                    >
                      {uploadingIcon ? 'Uploading...' : 'Choose SVG File'}
                    </button>
                    
                    {uploadedIconPath && (
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                          <Image 
                            src={uploadedIconPath} 
                            alt="Uploaded icon" 
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        <span className="text-sm text-green-600 dark:text-green-400">
                          SVG uploaded successfully
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg"
                    onChange={handleIconUpload}
                    className="hidden"
                  />
                  
                  <p className="text-sm text-gray-500 mt-2">
                    Upload an SVG file for your skill icon. For best results, use a simple, single-color SVG.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="level" className="block text-sm font-medium mb-2">
              Skill Level <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <input
                id="level"
                name="level"
                type="range"
                min="1"
                max="5"
                value={formData.level}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="ml-4 min-w-[80px] text-center font-medium">
                {formData.level === 1 && 'Beginner'}
                {formData.level === 2 && 'Elementary'}
                {formData.level === 3 && 'Intermediate'}
                {formData.level === 4 && 'Advanced'}
                {formData.level === 5 && 'Expert'}
              </span>
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
              rows={3}
              placeholder="Brief description of your experience with this skill"
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
              {isSubmitting ? 'Saving...' : 'Save Skill'}
            </button>
          </div>
          
          {/* Floating save button */}
          <div className="fixed bottom-6 right-6 z-50">
            <button
              type="submit"
              disabled={isSubmitting || uploadingIcon}
              className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{isSubmitting ? 'Saving...' : 'Save Skill'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
