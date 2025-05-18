'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Project } from '@/data/projects'
import Image from 'next/image'
import Notification from '@/components/ui/notification'

export default function NewProject() {
  const { status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    technologies: [],
    imageUrl: '/images/project1.svg', // Default image
    featured: false
  })
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [techInput, setTechInput] = useState('')
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
      handleImageUpload(files[0])
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }
  
  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true)
      setUploadError('')
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', 'project')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload image')
      }
      
      const data = await response.json()
      
      if (data.success) {
        const imagePath = data.filePath
        setUploadedImage(imagePath)
        setFormData(prev => ({
          ...prev,
          imageUrl: imagePath
        }))
      } else {
        throw new Error(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleAddTech = () => {
    if (techInput.trim() && !formData.technologies?.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...(formData.technologies || []), techInput.trim()]
      })
      setTechInput('')
    }
  }
  
  const handleRemoveTech = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies?.filter(t => t !== tech) || []
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.technologies?.length) {
      setError('Please fill in all required fields')
      return
    }
    
    try {
      setIsSubmitting(true)
      setError('')
      
      // Generate a unique ID
      const newProject: Project = {
        ...formData as Project,
        id: `project-${Date.now()}`,
        demoUrl: formData.demoUrl || undefined,
        githubUrl: formData.githubUrl || undefined
      }
      
      // Send the project to the API
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProject)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add project')
      }
      
      // Save to localStorage for persistence
      localStorage.setItem('projects', JSON.stringify(result.projects))
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Show success notification
      setNotification({
        show: true,
        type: 'success',
        message: 'Project added successfully!'
      })
      
      // Add a small delay before redirecting
      setTimeout(() => {
        router.push('/admin/projects')
      }, 1500)
    } catch (error) {
      console.error('Error adding project:', error)
      setError(error instanceof Error ? error.message : 'Failed to add project')
      
      // Show error notification
      setNotification({
        show: true,
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to add project'
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
          onClick={() => router.push('/admin/projects')}
          className="mr-4 text-secondary hover:underline"
        >
          ← Back to Projects
        </button>
        <h1 className="heading-lg">Add New Project</h1>
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
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
                Project Image <span className="text-red-500">*</span>
              </label>
              
              {/* Image Preview */}
              <div className="mb-4 border rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
                <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {(uploadedImage || formData.imageUrl) && (
                    <Image 
                      src={uploadedImage || formData.imageUrl || ''}
                      alt="Project preview"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Custom Image
                  </label>
                  <div className="flex">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="projectImage"
                      name="projectImage"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </>
                      ) : 'Upload Image'}
                    </button>
                  </div>
                  {uploadError && (
                    <p className="text-red-500 text-sm mt-1">{uploadError}</p>
                  )}
                </div>
                
                {/* Preset Images */}
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
                    Or Select Preset Image
                  </label>
                  <select
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                  >
                    <option value="/images/project1.svg">Project Image 1 (Purple)</option>
                    <option value="/images/project2.svg">Project Image 2 (Green)</option>
                    <option value="/images/project3.svg">Project Image 3 (Dark)</option>
                  </select>
                </div>
              </div>
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Technologies <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                placeholder="Add a technology"
                className="flex-1 px-4 py-2 border rounded-l-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-4 py-2 bg-secondary text-white rounded-r-lg hover:bg-secondary/90 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.technologies?.map((tech) => (
                <span 
                  key={tech} 
                  className="text-sm px-3 py-1 bg-secondary/10 text-secondary rounded-full flex items-center"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(tech)}
                    className="ml-2 text-secondary/70 hover:text-secondary"
                  >
                    ×
                  </button>
                </span>
              ))}
              {formData.technologies?.length === 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  No technologies added yet
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="demoUrl" className="block text-sm font-medium mb-2">
                Demo URL
              </label>
              <input
                id="demoUrl"
                name="demoUrl"
                type="url"
                value={formData.demoUrl || ''}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="githubUrl" className="block text-sm font-medium mb-2">
                GitHub URL
              </label>
              <input
                id="githubUrl"
                name="githubUrl"
                type="url"
                value={formData.githubUrl || ''}
                onChange={handleChange}
                placeholder="https://github.com/username/repo"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
              className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm">
              Featured Project
            </label>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/projects')}
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
              {isSubmitting ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
