'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { NavigationItem, defaultNavItems, SiteConfig, defaultSiteConfig } from '@/data/navigation'

export default function NavigationManager() {
  const { status } = useSession()
  const router = useRouter()
  
  const [navItems, setNavItems] = useState<NavigationItem[]>([])
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultSiteConfig)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null)

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [createPage, setCreatePage] = useState(false)
  const [pageTemplate, setPageTemplate] = useState<'basic' | 'withHero'>('basic')
  const [isCreatingPage, setIsCreatingPage] = useState(false)
  const [pageCreationStatus, setPageCreationStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle')
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    // In a real app, you would fetch from an API
    // For this example, we'll use localStorage or default data
    const storedNavItems = localStorage.getItem('navItems')
    const storedSiteConfig = localStorage.getItem('siteConfig')
    
    setNavItems(storedNavItems ? JSON.parse(storedNavItems) : defaultNavItems)
    setSiteConfig(storedSiteConfig ? JSON.parse(storedSiteConfig) : defaultSiteConfig)
    setIsLoading(false)
  }, [status, router])
  
  const handleAddItem = () => {
    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      name: '',
      href: '',
      order: navItems.length + 1,
      isActive: true
    }
    
    setEditingItem(newItem)
  }
  
  const handleEditItem = (item: NavigationItem) => {
    setEditingItem({ ...item })
  }
  
  const handleSaveItem = async () => {
    if (!editingItem) return
    
    if (!editingItem.name || !editingItem.href) {
      setError('Name and URL are required')
      return
    }
    
    // Check if this is a new item or an edit
    const isNewItem = !navItems.some(item => item.id === editingItem.id)
    
    // Create the page if requested (only for new items)
    if (isNewItem && createPage) {
      setIsCreatingPage(true)
      setPageCreationStatus('creating')
      
      try {
        const response = await fetch('/api/pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pageName: editingItem.name,
            pageUrl: editingItem.href,
            pageTemplate: pageTemplate
          })
        })
        
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to create page')
        }
        
        setPageCreationStatus('success')
        
        // Show success message
        setError('')
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } catch (error) {
        console.error('Error creating page:', error)
        setPageCreationStatus('error')
        setError(error instanceof Error ? error.message : 'Failed to create page')
        return
      } finally {
        setIsCreatingPage(false)
      }
    }
    
    const updatedNavItems = isNewItem
      ? [...navItems, editingItem]
      : navItems.map(item => item.id === editingItem.id ? editingItem : item)
    
    // Save to state
    setNavItems(updatedNavItems)
    
    // Save to localStorage to persist changes
    localStorage.setItem('navItems', JSON.stringify(updatedNavItems))
    
    // Trigger storage event for other components to update
    window.dispatchEvent(new Event('storage'))
    
    setEditingItem(null)
    setError('')
    setCreatePage(false)
    setPageTemplate('basic')
  }
  
  const handleCancelEdit = () => {
    setEditingItem(null)
    setError('')
    setCreatePage(false)
    setPageTemplate('basic')
    setPageCreationStatus('idle')
  }
  
  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this navigation item?')) {
      const updatedItems = navItems.filter(item => item.id !== id)
      setNavItems(updatedItems)
      
      // Save to localStorage
      localStorage.setItem('navItems', JSON.stringify(updatedItems))
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
    }
  }
  
  const handleToggleActive = (id: string) => {
    const updatedItems = navItems.map(item => 
      item.id === id ? { ...item, isActive: !item.isActive } : item
    )
    setNavItems(updatedItems)
    
    // Save to localStorage
    localStorage.setItem('navItems', JSON.stringify(updatedItems))
    
    // Trigger storage event for other components to update
    window.dispatchEvent(new Event('storage'))
  }
  
  const handleReorder = (id: string, direction: 'up' | 'down') => {
    const itemIndex = navItems.findIndex(item => item.id === id)
    if (
      (direction === 'up' && itemIndex === 0) || 
      (direction === 'down' && itemIndex === navItems.length - 1)
    ) {
      return
    }
    
    const newItems = [...navItems]
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1
    
    // Swap the items
    const temp = newItems[itemIndex]
    newItems[itemIndex] = newItems[targetIndex]
    newItems[targetIndex] = temp
    
    // Update order numbers
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index + 1
    }))
    
    // Save to state
    setNavItems(updatedItems)
    
    // Save to localStorage to persist changes
    localStorage.setItem('navItems', JSON.stringify(updatedItems))
    
    // Trigger storage event for other components to update
    window.dispatchEvent(new Event('storage'))
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
        <h1 className="heading-lg">Navigation & Logo Settings</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Logo Settings Note */}
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="heading-md mb-4">Logo Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Logo settings are now managed in the Site Settings section for better organization.
        </p>
        <Link 
          href="/admin/site-settings" 
          className="px-4 py-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors inline-flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Go to Site Settings
        </Link>
      </div>
      
      {/* Navigation Items Section */}
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="heading-md">Navigation Items</h2>
          <button
            onClick={handleAddItem}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
            disabled={!!editingItem}
          >
            Add New Item
          </button>
        </div>
        
        {editingItem && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-4">
              {navItems.some(item => item.id === editingItem.id) ? 'Edit Item' : 'Add New Item'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., Projects"
                />
              </div>
              <div>
                <label htmlFor="href" className="block text-sm font-medium mb-2">
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  id="href"
                  type="text"
                  value={editingItem.href}
                  onChange={(e) => setEditingItem({...editingItem, href: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., /projects"
                />
              </div>
            </div>
            <div className="flex items-center mb-4">
              <input
                id="isActive"
                type="checkbox"
                checked={editingItem.isActive}
                onChange={(e) => setEditingItem({...editingItem, isActive: e.target.checked})}
                className="w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary dark:focus:ring-secondary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="isActive" className="ml-2 text-sm font-medium">
                Active (visible in navigation)
              </label>
            </div>
            
            {/* Page Creation Section - Only show for new items */}
            {!navItems.some(item => item.id === editingItem.id) && (
              <div className="mt-6 border-t pt-4 dark:border-gray-700">
                <h4 className="font-medium mb-3">Page Creation</h4>
                
                <div className="flex items-center mb-4">
                  <input
                    id="createPage"
                    type="checkbox"
                    checked={createPage}
                    onChange={(e) => setCreatePage(e.target.checked)}
                    className="w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary dark:focus:ring-secondary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="createPage" className="ml-2 text-sm font-medium">
                    Create a new page for this navigation item
                  </label>
                </div>
                
                {createPage && (
                  <div className="mb-4">
                    <label htmlFor="pageTemplate" className="block text-sm font-medium mb-2">
                      Page Template
                    </label>
                    <select
                      id="pageTemplate"
                      value={pageTemplate}
                      onChange={(e) => setPageTemplate(e.target.value as 'basic' | 'withHero')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="basic">Basic Page</option>
                      <option value="withHero">Page with Hero Section</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      Select a template for the new page. You can customize it later.
                    </p>
                  </div>
                )}
                
                {pageCreationStatus === 'error' && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    Failed to create page. Please try again.
                  </div>
                )}
                
                {pageCreationStatus === 'success' && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Page created successfully!
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                disabled={isCreatingPage}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingPage ? 'Creating Page...' : 'Save'}
              </button>
            </div>
          </div>
        )}
        
        {navItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No navigation items found. Add your first item to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 text-left">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium">Order</th>
                  <th className="px-4 py-3 text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-sm font-medium">URL</th>
                  <th className="px-4 py-3 text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {navItems
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleReorder(item.id, 'up')}
                            disabled={item.order === 1}
                            className="p-1 text-gray-500 hover:text-secondary disabled:opacity-30"
                            aria-label="Move up"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                            </svg>
                          </button>
                          <span>{item.order}</span>
                          <button
                            onClick={() => handleReorder(item.id, 'down')}
                            disabled={item.order === navItems.length}
                            className="p-1 text-gray-500 hover:text-secondary disabled:opacity-30"
                            aria-label="Move down"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-gray-500">{item.href}</td>
                      <td className="px-4 py-3">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleToggleActive(item.id)}
                            className="text-gray-500 hover:text-secondary"
                            aria-label={item.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {item.isActive ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-gray-500 hover:text-secondary"
                            disabled={!!editingItem}
                            aria-label="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-gray-500 hover:text-red-500"
                            aria-label="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-500">Note: Changes are saved to the browser for demo purposes. In a production environment, these would be saved to a database.</p>
          <div>
            {saveStatus === 'success' && (
              <span className="text-green-600 dark:text-green-400 text-sm mr-4">✓ Changes saved successfully</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-600 dark:text-red-400 text-sm mr-4">✗ Error saving changes</span>
            )}
            <button
              onClick={() => {
                try {
                  setSaveStatus('saving')
                  localStorage.setItem('navItems', JSON.stringify(navItems))
                  localStorage.setItem('siteConfig', JSON.stringify(siteConfig))
                  window.dispatchEvent(new Event('storage'))
                  setSaveStatus('success')
                  setTimeout(() => setSaveStatus('idle'), 3000)
                } catch (error) {
                  console.error('Error saving navigation settings:', error)
                  setSaveStatus('error')
                  setTimeout(() => setSaveStatus('idle'), 3000)
                }
              }}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
