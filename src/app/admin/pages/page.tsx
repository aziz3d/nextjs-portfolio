'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { NavigationItem } from '@/data/navigation'

export default function PagesManagement() {
  const { status } = useSession()
  const router = useRouter()
  
  const [pages, setPages] = useState<NavigationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    // Load pages from localStorage
    const loadPages = () => {
      try {
        const storedNavItems = localStorage.getItem('navItems')
        if (storedNavItems) {
          const navItems = JSON.parse(storedNavItems)
          setPages(navItems)
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading pages:', error)
        setIsLoading(false)
      }
    }
    
    loadPages()
    
    // Listen for storage events to update the pages list
    window.addEventListener('storage', loadPages)
    return () => window.removeEventListener('storage', loadPages)
  }, [status, router])
  
  const handleToggleActive = async (id: string) => {
    try {
      const updatedPages = pages.map(page => 
        page.id === id ? { ...page, isActive: !page.isActive } : page
      )
      
      // Save to localStorage
      localStorage.setItem('navItems', JSON.stringify(updatedPages))
      
      // Update state
      setPages(updatedPages)
      
      // Trigger storage event for other components
      window.dispatchEvent(new Event('storage'))
      
      setMessage({ type: 'success', text: 'Page status updated successfully' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error updating page status:', error)
      setMessage({ type: 'error', text: 'Failed to update page status' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }
  
  const handleEditPage = (id: string) => {
    router.push(`/admin/pages/edit?id=${id}`)
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-lg">Pages Management</h1>
        <button
          onClick={() => router.push('/admin/pages/new')}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          Add New Page
        </button>
      </div>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'error' 
            ? 'bg-red-100 text-red-700 border border-red-400' 
            : 'bg-green-100 text-green-700 border border-green-400'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {pages.length > 0 ? (
                pages
                  .sort((a, b) => a.order - b.order)
                  .map(page => (
                    <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">{page.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{page.href}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{page.order}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          page.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {page.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPage(page.id)}
                            className="text-secondary hover:text-secondary/80"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(page.id)}
                            className={page.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                          >
                            {page.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No pages found. Click &ldquo;Add New Page&rdquo; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
