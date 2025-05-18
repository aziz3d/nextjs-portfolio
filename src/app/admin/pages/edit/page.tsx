'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { NavigationItem, defaultNavItems } from '@/data/navigation'

export default function EditPage() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pageId = searchParams?.get('id')
  
  const [formData, setFormData] = useState<Partial<NavigationItem>>({
    name: '',
    href: '',
    order: 1,
    isActive: true
  })
  
  const [pageContent, setPageContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    if (!pageId) {
      router.push('/admin/pages')
      return
    }
    
    // Load page data
    const loadPageData = () => {
      try {
        const storedNavItems = localStorage.getItem('navItems')
        const navItems: NavigationItem[] = storedNavItems 
          ? JSON.parse(storedNavItems) 
          : defaultNavItems
        
        const page = navItems.find(item => item.id === pageId)
        
        if (!page) {
          router.push('/admin/pages')
          return
        }
        
        setFormData(page)
        
        // Load page content
        const pageContents = JSON.parse(localStorage.getItem('pageContents') || '{}')
        const path = page.href.startsWith('/') ? page.href.substring(1) : page.href
        
        if (pageContents[path]) {
          setPageContent(pageContents[path].content || '')
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading page data:', error)
        setError('Failed to load page data')
        setIsLoading(false)
      }
    }
    
    loadPageData()
  }, [pageId, router, status])
  
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
      const navItems: NavigationItem[] = storedNavItems 
        ? JSON.parse(storedNavItems) 
        : defaultNavItems
      
      // Check if the URL already exists and belongs to a different page
      const urlExists = navItems.some(item => 
        item.href === formData.href && item.id !== pageId
      )
      
      if (urlExists) {
        setError('A different page with this URL already exists')
        setIsSubmitting(false)
        return
      }
      
      // Update the page
      const updatedNavItems = navItems.map(item => 
        item.id === pageId ? { ...formData as NavigationItem } : item
      )
      
      // Save to localStorage
      localStorage.setItem('navItems', JSON.stringify(updatedNavItems))
      
      // Update the page content
      await updatePageContent(formData.href as string, pageContent)
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      router.push('/admin/pages')
    } catch (error) {
      console.error('Error updating page:', error)
      setError(error instanceof Error ? error.message : 'Failed to update page')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const updatePageContent = async (href: string, content: string) => {
    // In a real app, this would update a file or database entry
    // For this demo, we'll store the content in localStorage
    const path = href.startsWith('/') ? href.substring(1) : href
    const pageContents = JSON.parse(localStorage.getItem('pageContents') || '{}')
    
    pageContents[path] = {
      content,
      lastUpdated: new Date().toISOString()
    }
    
    localStorage.setItem('pageContents', JSON.stringify(pageContents))
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
          onClick={() => router.push('/admin/pages')}
          className="mr-4 text-secondary hover:underline"
        >
          ← Back to Pages
        </button>
        <h1 className="heading-lg">Edit Page: {formData.name}</h1>
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
