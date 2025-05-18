'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { NavigationItem, defaultNavItems } from '@/data/navigation'

export default function NewPage() {
  const { status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState<Partial<NavigationItem>>({
    name: '',
    href: '',
    order: 1,
    isActive: true
  })
  
  const [pageContent, setPageContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  if (status === 'unauthenticated') {
    router.push('/admin/login')
    return null
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      })
    } else if (type === 'number') {
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
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPageContent(e.target.value)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.href) {
      setError('Please fill in all required fields')
      return
    }
    
    // Validate URL format
    if (!formData.href.startsWith('/')) {
      setFormData({
        ...formData,
        href: `/${formData.href}`
      })
    }
    
    try {
      setIsSubmitting(true)
      setError('')
      
      // Get existing navigation items
      const storedNavItems = localStorage.getItem('navItems')
      const existingNavItems: NavigationItem[] = storedNavItems 
        ? JSON.parse(storedNavItems) 
        : defaultNavItems
      
      // Check if the URL already exists
      if (existingNavItems.some(item => item.href === formData.href)) {
        setError('A page with this URL already exists')
        setIsSubmitting(false)
        return
      }
      
      // Generate a unique ID
      const newPage: NavigationItem = {
        ...formData as NavigationItem,
        id: `nav-${formData.name?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      }
      
      // Add the new page to the navigation items
      const updatedNavItems = [...existingNavItems, newPage]
      
      // Save to localStorage
      localStorage.setItem('navItems', JSON.stringify(updatedNavItems))
      
      // Create the page content file
      await createPageContent(formData.href as string, pageContent)
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      router.push('/admin/pages')
    } catch (error) {
      console.error('Error adding page:', error)
      setError(error instanceof Error ? error.message : 'Failed to add page')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const createPageContent = async (href: string, content: string) => {
    // In a real app, this would create a file or database entry
    // For this demo, we'll store the content in localStorage
    const path = href.startsWith('/') ? href.substring(1) : href
    const pageContents = JSON.parse(localStorage.getItem('pageContents') || '{}')
    
    pageContents[path] = {
      content,
      lastUpdated: new Date().toISOString()
    }
    
    localStorage.setItem('pageContents', JSON.stringify(pageContents))
  }
  
  return (
    <div>
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.push('/admin/pages')}
          className="mr-4 text-secondary hover:underline"
        >
          ← Back to Pages
        </button>
        <h1 className="heading-lg">Add New Page</h1>
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
                Page Name <span className="text-red-500">*</span>
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
              <label htmlFor="href" className="block text-sm font-medium mb-2">
                URL Path <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 dark:text-gray-400 mr-1">/</span>
                <input
                  id="href"
                  name="href"
                  type="text"
                  value={formData.href?.startsWith('/') ? formData.href.substring(1) : formData.href}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                  placeholder="e.g. about-me"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                This will be the URL path for your page (e.g. /about-me)
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="order" className="block text-sm font-medium mb-2">
                Menu Order
              </label>
              <input
                id="order"
                name="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <p className="text-sm text-gray-500 mt-1">
                The order in which this page appears in the navigation menu
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm font-medium">
                Active
              </label>
              <p className="text-sm text-gray-500 ml-6">
                If checked, this page will be visible in the navigation menu
              </p>
            </div>
          </div>
          
          <div>
            <label htmlFor="pageContent" className="block text-sm font-medium mb-2">
              Page Content
            </label>
            <textarea
              id="pageContent"
              name="pageContent"
              value={pageContent}
              onChange={handleContentChange}
              rows={10}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono"
              placeholder="Enter your page content here. You can use Markdown formatting."
            />
            <p className="text-sm text-gray-500 mt-1">
              You can use Markdown formatting for your page content
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/pages')}
              className="px-4 py-2 border border-gray-300 rounded-lg mr-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
