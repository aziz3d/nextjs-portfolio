"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BlogPost } from '@/components/sections/blog-section'
import Image from 'next/image'

export default function NewBlogPost() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState<Omit<BlogPost, 'id'>>({
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    date: new Date().toISOString().split('T')[0],
    author: '',
    tags: [],
    featured: false
  })
  
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // For media insertion
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [mediaType, setMediaType] = useState<'image' | 'youtube'>('image')
  const [mediaUrl, setMediaUrl] = useState('')
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    // Set author name from session if available
    if (status === 'authenticated' && session?.user?.name) {
      setFormData(prev => ({
        ...prev,
        author: session.user.name || ''
      }))
    }
  }, [status, router, session])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }
  
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }
  
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }
  
  // Media insertion functions
  const handleOpenMediaModal = (type: 'image' | 'youtube') => {
    setMediaType(type)
    setMediaUrl('')
    setShowMediaModal(true)
  }
  
  const handleInsertMedia = () => {
    if (!contentRef.current) return
    
    const textarea = contentRef.current
    const cursorPosition = textarea.selectionStart
    
    let mediaCode = ''
    if (mediaType === 'youtube') {
      // Extract video ID from YouTube URL
      const videoId = extractYouTubeVideoId(mediaUrl)
      if (!videoId) {
        alert('Invalid YouTube URL')
        return
      }
      mediaCode = `\n\n<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n\n`
    } else {
      // Insert image
      const imageToInsert = uploadedImageUrl || mediaUrl
      if (!imageToInsert) {
        alert('Please provide an image URL or upload an image')
        return
      }
      mediaCode = `\n\n![Image](${imageToInsert})\n\n`
    }
    
    const newContent = 
      formData.content.substring(0, cursorPosition) + 
      mediaCode + 
      formData.content.substring(cursorPosition)
    
    setFormData(prev => ({
      ...prev,
      content: newContent
    }))
    
    setShowMediaModal(false)
    setMediaUrl('')
    setUploadedImageUrl('')
  }
  
  const extractYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }
  
  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', 'gallery')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload image')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setUploadedImageUrl(data.filePath)
      } else {
        throw new Error(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim() || !formData.imageUrl.trim()) {
      setError('Please fill in all required fields')
      return
    }
    
    try {
      setIsSubmitting(true)
      setError('')
      
      // First try to save via API
      try {
        const newPost: BlogPost = {
          id: `post-${Date.now()}`,
          ...formData
        }
        
        const response = await fetch('/api/blog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newPost)
        })
        
        // API request successful
        if (response.ok) {
          console.log('API save successful')
        }
      } catch (apiError) {
        console.error('API save error:', apiError)
        // Continue to localStorage fallback
      }
      
      // Always update localStorage for immediate UI updates
      // Load existing posts
      const storedPosts = localStorage.getItem('blogPosts')
      const existingPosts: BlogPost[] = storedPosts ? JSON.parse(storedPosts) : []
      
      // Create new post
      const newPost: BlogPost = {
        id: `post-${Date.now()}`,
        ...formData
      }
      
      // Save updated posts
      const updatedPosts = [newPost, ...existingPosts]
      localStorage.setItem('blogPosts', JSON.stringify(updatedPosts))
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Show success message
      alert('Blog post created successfully!')
      
      // Redirect to blog admin page
      router.push('/admin/blog')
    } catch (error) {
      console.error('Error saving blog post:', error)
      alert('Failed to save blog post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="heading-lg">Add New Blog Post</h1>
          <button
            onClick={() => router.push('/admin/blog')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
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
              <label htmlFor="excerpt" className="block text-sm font-medium mb-1">
                Excerpt <span className="text-red-500">*</span>
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="content" className="block text-sm font-medium">
                  Content <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenMediaModal('image')}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                  >
                    Insert Image
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenMediaModal('youtube')}
                    className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                  >
                    Insert YouTube
                  </button>
                </div>
              </div>
              <textarea
                id="content"
                name="content"
                ref={contentRef}
                value={formData.content}
                onChange={handleChange}
                rows={15}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports Markdown formatting. Use **bold**, *italic*, # headings, etc.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
                  Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="author" className="block text-sm font-medium mb-1">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  id="author"
                  name="author"
                  type="text"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-secondary focus:ring-secondary rounded"
                  />
                  <span>Featured Post</span>
                </label>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="tags" className="block text-sm font-medium mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    id="tags"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-1 bg-secondary/10 text-secondary px-3 py-1 rounded-full"
                    >
                      <span>{tag}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag)}
                        className="text-secondary hover:text-secondary/70"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/admin/blog')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Media Insertion Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {mediaType === 'youtube' ? 'Insert YouTube Video' : 'Insert Image'}
            </h3>
            
            {mediaType === 'youtube' ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="youtubeUrl" className="block text-sm font-medium mb-1">
                    YouTube URL
                  </label>
                  <input
                    id="youtubeUrl"
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="imageUrlMedia" className="block text-sm font-medium mb-1">
                    Image URL
                  </label>
                  <input
                    id="imageUrlMedia"
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium mb-2">Or upload an image:</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageUpload(e.target.files[0])
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary/10 file:text-secondary hover:file:bg-secondary/20"
                  />
                  {isUploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                  {uploadedImageUrl && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600 mb-1">Upload successful!</p>
                      <div className="relative h-20 w-20 border rounded overflow-hidden">
                        <Image 
                          src={uploadedImageUrl} 
                          alt="Uploaded image" 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertMedia}
                disabled={mediaType === 'youtube' ? !mediaUrl : (!mediaUrl && !uploadedImageUrl)}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
