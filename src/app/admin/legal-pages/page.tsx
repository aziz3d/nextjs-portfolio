"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface LegalPage {
  id: string
  title: string
  slug: string
  content: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface LegalPageContent {
  pages: LegalPage[]
}

export default function LegalPagesAdmin() {
  const [content, setContent] = useState<LegalPageContent>({
    pages: []
  })
  const [activePage, setActivePage] = useState<string | null>(null)
  const [editingPage, setEditingPage] = useState<LegalPage | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    // Load content from localStorage
    try {
      const storedContent = localStorage.getItem('legalPagesContent')
      if (storedContent) {
        const parsedContent = JSON.parse(storedContent)
        setContent(parsedContent)
        
        // Set the first page as active if there's no active page
        if (parsedContent.pages && parsedContent.pages.length > 0 && !activePage) {
          setActivePage(parsedContent.pages[0].id)
        }
      } else {
        // Fetch default content
        fetchDefaultContent()
      }
    } catch (error) {
      console.error('Error loading legal pages content:', error)
    }
  }, [activePage])

  const fetchDefaultContent = async () => {
    try {
      // In a real application, you would fetch this from your API or database
      // For this demo, we'll use placeholder text
      const now = new Date().toISOString()
      const defaultPages: LegalPage[] = [
        {
          id: 'privacy-policy',
          title: 'Privacy Policy',
          slug: 'privacy-policy',
          content: `# Privacy Policy\n\nLast updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n## 1. Introduction\n\nThis Privacy Policy describes how your personal information is collected, used, and shared when you visit or interact with our website.`,
          isActive: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'terms-of-service',
          title: 'Terms of Service',
          slug: 'terms-of-service',
          content: `# Terms of Service\n\nLast updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n## 1. Terms\n\nBy accessing this website, you are agreeing to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.`,
          isActive: true,
          createdAt: now,
          updatedAt: now
        }
      ]
      
      setContent({
        pages: defaultPages
      })
      
      // Set the first page as active
      if (defaultPages.length > 0) {
        setActivePage(defaultPages[0].id)
      }
    } catch (error) {
      console.error('Error fetching default content:', error)
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editingPage) return
    
    setEditingPage({
      ...editingPage,
      content: e.target.value
    })
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPage) return
    
    const title = e.target.value
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    
    setEditingPage({
      ...editingPage,
      title,
      slug
    })
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPage) return
    
    setEditingPage({
      ...editingPage,
      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    })
  }

  const handleCreatePage = () => {
    const now = new Date().toISOString()
    const newPage: LegalPage = {
      id: `legal-${Date.now()}`,
      title: '',
      slug: '',
      content: '',
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
    
    setEditingPage(newPage)
    setIsCreating(true)
  }

  const handleEditPage = (id: string) => {
    const pageToEdit = content.pages.find(page => page.id === id)
    if (pageToEdit) {
      setEditingPage({...pageToEdit})
    }
  }

  const handleSavePage = () => {
    if (!editingPage) return
    if (!editingPage.title || !editingPage.slug) {
      alert('Title and slug are required')
      return
    }
    
    setIsSaving(true)
    
    try {
      let updatedPages: LegalPage[]
      const now = new Date().toISOString()
      
      if (isCreating) {
        // Add new page
        updatedPages = [
          ...content.pages,
          {
            ...editingPage,
            updatedAt: now
          }
        ]
      } else {
        // Update existing page
        updatedPages = content.pages.map(page => 
          page.id === editingPage.id ? {...editingPage, updatedAt: now} : page
        )
      }
      
      // Update state
      const newContent = {
        pages: updatedPages
      }
      setContent(newContent)
      
      // Save to localStorage
      localStorage.setItem('legalPagesContent', JSON.stringify(newContent))
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Reset editing state
      setEditingPage(null)
      setIsCreating(false)
      setActivePage(editingPage.id)
      
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error('Error saving legal page:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingPage(null)
    setIsCreating(false)
  }

  const handleDeletePage = (id: string) => {
    if (content.pages.length <= 1) {
      alert('You must have at least one legal page')
      return
    }
    
    if (confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      const updatedPages = content.pages.filter(page => page.id !== id)
      
      // Update state
      const newContent = {
        pages: updatedPages
      }
      setContent(newContent)
      
      // Save to localStorage
      localStorage.setItem('legalPagesContent', JSON.stringify(newContent))
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Set a different page as active if the deleted page was active
      if (activePage === id && updatedPages.length > 0) {
        setActivePage(updatedPages[0].id)
      }
    }
  }

  const handleToggleActive = (id: string) => {
    const updatedPages = content.pages.map(page => 
      page.id === id ? {...page, isActive: !page.isActive} : page
    )
    
    // Update state
    const newContent = {
      pages: updatedPages
    }
    setContent(newContent)
    
    // Save to localStorage
    localStorage.setItem('legalPagesContent', JSON.stringify(newContent))
    
    // Trigger storage event for other components to update
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <div className="container-custom py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="heading-lg">Legal Pages Settings</h1>
          <button
            onClick={handleCreatePage}
            disabled={!!editingPage}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add New Page
          </button>
        </div>
        
        <p className="body-md text-text/70 dark:text-background/70 mb-8">
          Manage your legal pages such as Privacy Policy, Terms of Service, etc. Use Markdown formatting for the content.
        </p>
        
        {/* Editing Form */}
        {editingPage && (
          <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="heading-md mb-4">{isCreating ? 'Create New Legal Page' : 'Edit Legal Page'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="pageTitle" className="block mb-2 font-medium">
                  Page Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="pageTitle"
                  type="text"
                  value={editingPage.title}
                  onChange={handleTitleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="e.g., Privacy Policy"
                />
              </div>
              
              <div>
                <label htmlFor="pageSlug" className="block mb-2 font-medium">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 dark:text-gray-400 mr-2">/</span>
                  <input
                    id="pageSlug"
                    type="text"
                    value={editingPage.slug}
                    onChange={handleSlugChange}
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="e.g., privacy-policy"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="pageContent" className="font-medium">
                  Page Content (Markdown) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={editingPage.isActive}
                    onChange={(e) => setEditingPage({...editingPage, isActive: e.target.checked})}
                    className="w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary dark:focus:ring-secondary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium">
                    Active (visible on site)
                  </label>
                </div>
              </div>
              <textarea
                id="pageContent"
                value={editingPage.content}
                onChange={handleContentChange}
                rows={15}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="# Page Title&#10;&#10;Enter your content here using Markdown formatting."
              />
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePage}
                disabled={isSaving}
                className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Page</span>
                )}
              </button>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Formatting Tips</h3>
              <ul className="text-sm text-text/70 dark:text-background/70 space-y-1">
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded"># Heading 1</code> - Main heading</li>
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">## Heading 2</code> - Section heading</li>
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">**bold text**</code> - Bold text</li>
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">*italic text*</code> - Italic text</li>
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">[link text](url)</code> - Hyperlink</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Pages List */}
        {!editingPage && (
          <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg overflow-hidden">
            {content.pages.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No legal pages found.</p>
                <button
                  onClick={handleCreatePage}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Create Your First Page
                </button>
              </div>
            ) : (
              <>
                <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                  {content.pages.map((page) => (
                    <button
                      key={page.id}
                      className={`px-6 py-4 font-medium whitespace-nowrap ${activePage === page.id ? 'text-secondary border-b-2 border-secondary' : 'text-text/60 dark:text-background/60'}`}
                      onClick={() => setActivePage(page.id)}
                    >
                      {page.title || 'Untitled Page'}
                    </button>
                  ))}
                </div>
                
                <div className="p-6">
                  {content.pages.map((page) => {
                    if (page.id !== activePage) return null
                    
                    return (
                      <div key={page.id}>
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h2 className="heading-md">{page.title}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              URL: /{page.slug} • 
                              {page.isActive ? (
                                <span className="text-green-500"> Active</span>
                              ) : (
                                <span className="text-gray-500"> Inactive</span>
                              )} • 
                              Last updated: {new Date(page.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleActive(page.id)}
                              className={`p-2 rounded-lg ${page.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                              title={page.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {page.isActive ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => handleEditPage(page.id)}
                              className="p-2 bg-blue-100 text-blue-700 rounded-lg dark:bg-blue-900 dark:text-blue-300"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeletePage(page.id)}
                              className="p-2 bg-red-100 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-300"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 font-mono text-sm overflow-auto max-h-96">
                          <pre className="whitespace-pre-wrap">{page.content}</pre>
                        </div>
                        
                        {isSaved && (
                          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg dark:bg-green-900 dark:text-green-300 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Changes saved successfully!</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
