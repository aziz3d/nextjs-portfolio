"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BlogPost } from '@/components/sections/blog-section'

export default function EditBlogPost() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
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
  const [isLoading, setIsLoading] = useState(true)
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
    
    const fetchBlogPost = async () => {
      try {
        setIsLoading(true)
        
        // Load from localStorage
        const storedPosts = localStorage.getItem('blogPosts')
        if (!storedPosts) {
          setError('Blog post not found')
          setIsLoading(false)
          return
        }
        
        const posts: BlogPost[] = JSON.parse(storedPosts)
        const post = posts.find(p => p.id === id)
        
        if (!post) {
          setError('Blog post not found')
          setIsLoading(false)
          return
        }
        
        setFormData({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          imageUrl: post.imageUrl,
          date: post.date,
          author: post.author,
          tags: post.tags,
          featured: post.featured
        })
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching blog post:', error)
        setError('Failed to load blog post')
        setIsLoading(false)
      }
    }
    
    if (status === 'authenticated' && id) {
      fetchBlogPost()
    }
  }, [status, router, id])
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim() || !formData.imageUrl.trim()) {
      setError('Please fill in all required fields')
      return
    }
    
    try {
      setIsSubmitting(true)
      setError('')
      
      // First try to update via API
      try {
        const response = await fetch(`/api/blog/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        
        // API request successful
        if (response.ok) {
          console.log('API update successful')
        }
      } catch (apiError) {
        console.error('API update error:', apiError)
        // Continue to localStorage fallback
      }
      
      // Always update localStorage for immediate UI updates
      // Load existing posts
      const storedPosts = localStorage.getItem('blogPosts')
      const existingPosts: BlogPost[] = storedPosts ? JSON.parse(storedPosts) : []
      
      // Check if the post exists in the array
      const postExists = existingPosts.some(post => post.id === id)
      
      let updatedPosts
      if (postExists) {
        // Update post
        updatedPosts = existingPosts.map(post => 
          post.id === id ? { ...post, ...formData } : post
        )
      } else {
        // If post doesn't exist, add it to the array
        updatedPosts = [{ ...formData, id }, ...existingPosts]
      }
      
      // Save updated posts
      localStorage.setItem('blogPosts', JSON.stringify(updatedPosts))
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Show success message
      alert('Blog post updated successfully!')
      
      // Redirect to blog admin page
      router.push('/admin/blog')
    } catch (error) {
      console.error('Error updating blog post:', error)
      setError('Failed to update blog post')
    } finally {
      setIsSubmitting(false)
    }
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
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.push('/admin/blog')}
          className="mr-4 text-secondary hover:underline"
        >
          ← Back to Blog Posts
        </button>
        <h1 className="heading-lg">Edit Blog Post</h1>
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
                Featured Image URL <span className="text-red-500">*</span>
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="text"
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
            <label className="block text-sm font-medium mb-1">
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
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
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
              {formData.tags.length === 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  No tags added yet
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              checked={formData.featured}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-secondary border-gray-300 rounded focus:ring-secondary"
            />
            <label htmlFor="featured" className="ml-2 block text-sm font-medium">
              Featured Post (shown prominently on homepage)
            </label>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/blog')}
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
      
      {/* Media Insert Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-primary rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">
              {mediaType === 'youtube' ? 'Insert YouTube Video' : 'Insert Image'}
            </h3>
            
            {mediaType === 'youtube' ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="youtubeUrl" className="block text-sm font-medium mb-1">
                    YouTube Video URL
                  </label>
                  <input
                    id="youtubeUrl"
                    type="text"
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
                  <label className="block text-sm font-medium mb-1">
                    Upload Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      disabled={isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Choose File'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(e.target.files[0])
                        }
                      }}
                    />
                    {uploadedImageUrl && (
                      <span className="text-green-600 dark:text-green-400 text-sm">
                        Image uploaded successfully!
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
                    Or Enter Image URL
                  </label>
                  <input
                    id="imageUrl"
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-end mt-6 space-x-4">
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
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
