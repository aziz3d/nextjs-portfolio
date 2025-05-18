'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { FooterConfig, SocialLink, QuickLink, LegalLink, defaultFooterConfig } from '@/data/footer'
import FileUpload from '@/components/ui/file-upload'

export default function FooterManager() {
  const { status } = useSession()
  const router = useRouter()
  
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(defaultFooterConfig)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [activeTab, setActiveTab] = useState<'general'|'social'|'quicklinks'|'legal'>('general')
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null)
  const [editingQuickLink, setEditingQuickLink] = useState<QuickLink | null>(null)
  const [editingLegalLink, setEditingLegalLink] = useState<LegalLink | null>(null)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    // In a real app, you would fetch from an API
    const storedFooterConfig = localStorage.getItem('footerConfig')
    if (storedFooterConfig) {
      setFooterConfig(JSON.parse(storedFooterConfig))
    } else {
      setFooterConfig(defaultFooterConfig)
    }
    setIsLoading(false)
  }, [status, router])
  
  const handleSaveChanges = () => {
    try {
      // Save to localStorage
      localStorage.setItem('footerConfig', JSON.stringify(footerConfig))
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Show success message
      setSaveStatus('success')
      
      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    } catch (error) {
      console.error('Error saving footer config:', error)
      setSaveStatus('error')
      
      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    }
  }
  
  const handleSaveGeneral = () => {
    handleSaveChanges()
  }
  
  // Social Links handlers
  const handleAddSocial = () => {
    const newSocial: SocialLink = {
      id: `social-${Date.now()}`,
      platform: '',
      url: '',
      icon: '',
      ariaLabel: '',
      order: footerConfig.socialLinks.length + 1,
      isActive: true,
      useLocalSvg: false,
      localSvgPath: ''
    }
    setEditingSocial(newSocial)
  }
  
  const handleSaveSocial = () => {
    if (!editingSocial) return
    
    if (!editingSocial.platform || !editingSocial.url) {
      setError('Platform name and URL are required')
      return
    }
    
    const isNewItem = !footerConfig.socialLinks.some(item => item.id === editingSocial.id)
    const updatedLinks = isNewItem 
      ? [...footerConfig.socialLinks, editingSocial]
      : footerConfig.socialLinks.map(item => item.id === editingSocial.id ? editingSocial : item)
    
    setFooterConfig({
      ...footerConfig,
      socialLinks: updatedLinks
    })
    
    setEditingSocial(null)
    setError('')
  }
  
  const handleDeleteSocial = (id: string) => {
    if (confirm('Are you sure you want to delete this social link?')) {
      setFooterConfig({
        ...footerConfig,
        socialLinks: footerConfig.socialLinks.filter(item => item.id !== id)
      })
    }
  }
  
  // Quick Links handlers
  const handleAddQuickLink = () => {
    const newLink: QuickLink = {
      id: `quick-${Date.now()}`,
      name: '',
      href: '',
      order: footerConfig.quickLinks.length + 1,
      isActive: true
    }
    setEditingQuickLink(newLink)
  }
  
  const handleSaveQuickLink = () => {
    if (!editingQuickLink) return
    
    if (!editingQuickLink.name || !editingQuickLink.href) {
      setError('Name and URL are required')
      return
    }
    
    const isNewItem = !footerConfig.quickLinks.some(item => item.id === editingQuickLink.id)
    const updatedLinks = isNewItem 
      ? [...footerConfig.quickLinks, editingQuickLink]
      : footerConfig.quickLinks.map(item => item.id === editingQuickLink.id ? editingQuickLink : item)
    
    setFooterConfig({
      ...footerConfig,
      quickLinks: updatedLinks
    })
    
    setEditingQuickLink(null)
    setError('')
  }
  
  const handleDeleteQuickLink = (id: string) => {
    if (confirm('Are you sure you want to delete this quick link?')) {
      setFooterConfig({
        ...footerConfig,
        quickLinks: footerConfig.quickLinks.filter(item => item.id !== id)
      })
    }
  }
  
  // Legal Links handlers
  const handleAddLegalLink = () => {
    const newLink: LegalLink = {
      id: `legal-${Date.now()}`,
      name: '',
      href: '',
      order: footerConfig.legalLinks.length + 1,
      isActive: true
    }
    setEditingLegalLink(newLink)
  }
  
  const handleSaveLegalLink = () => {
    if (!editingLegalLink) return
    
    if (!editingLegalLink.name || !editingLegalLink.href) {
      setError('Name and URL are required')
      return
    }
    
    const isNewItem = !footerConfig.legalLinks.some(item => item.id === editingLegalLink.id)
    const updatedLinks = isNewItem 
      ? [...footerConfig.legalLinks, editingLegalLink]
      : footerConfig.legalLinks.map(item => item.id === editingLegalLink.id ? editingLegalLink : item)
    
    setFooterConfig({
      ...footerConfig,
      legalLinks: updatedLinks
    })
    
    setEditingLegalLink(null)
    setError('')
  }
  
  const handleDeleteLegalLink = (id: string) => {
    if (confirm('Are you sure you want to delete this legal link?')) {
      setFooterConfig({
        ...footerConfig,
        legalLinks: footerConfig.legalLinks.filter(item => item.id !== id)
      })
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-lg">Footer Settings</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('general')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general' 
                  ? 'border-secondary text-secondary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              General
            </button>
            <button 
              onClick={() => setActiveTab('social')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'social' 
                  ? 'border-secondary text-secondary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Social Links
            </button>
            <button 
              onClick={() => setActiveTab('quicklinks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'quicklinks' 
                  ? 'border-secondary text-secondary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quick Links
            </button>
            <button 
              onClick={() => setActiveTab('legal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'legal' 
                  ? 'border-secondary text-secondary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Legal Links
            </button>
          </nav>
        </div>
        
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="font-medium mb-4">Footer Logo</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  The footer logo is managed in the Logos section. You can set a dedicated footer logo there.
                </p>
                <Link 
                  href="/admin/logos" 
                  className="px-4 py-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors inline-flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  Manage Logos
                </Link>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Footer Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={footerConfig.description}
                onChange={(e) => setFooterConfig({...footerConfig, description: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="copyrightText" className="block text-sm font-medium mb-2">
                Copyright Text
              </label>
              <input
                id="copyrightText"
                type="text"
                value={footerConfig.copyrightText}
                onChange={(e) => setFooterConfig({...footerConfig, copyrightText: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <p className="text-sm text-gray-500 mt-1">
                Use {'{year}'} to dynamically insert the current year.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium mb-2">
                  Contact Email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  value={footerConfig.contactInfo.email}
                  onChange={(e) => setFooterConfig({
                    ...footerConfig, 
                    contactInfo: {...footerConfig.contactInfo, email: e.target.value}
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={footerConfig.contactInfo.location}
                  onChange={(e) => setFooterConfig({
                    ...footerConfig, 
                    contactInfo: {...footerConfig.contactInfo, location: e.target.value}
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleSaveGeneral}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
        
        {/* Social Links */}
        {activeTab === 'social' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="heading-sm">Social Media Links</h2>
              <button
                onClick={handleAddSocial}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                disabled={!!editingSocial}
              >
                Add Social Link
              </button>
            </div>
            
            {editingSocial && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-4">
                  {footerConfig.socialLinks.some(item => item.id === editingSocial.id) ? 'Edit Social Link' : 'Add Social Link'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="platform" className="block text-sm font-medium mb-2">
                      Platform Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="platform"
                      type="text"
                      value={editingSocial.platform}
                      onChange={(e) => setEditingSocial({...editingSocial, platform: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., LinkedIn"
                    />
                  </div>
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium mb-2">
                      URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="url"
                      type="text"
                      value={editingSocial.url}
                      onChange={(e) => setEditingSocial({...editingSocial, url: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., https://linkedin.com/in/username"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center mb-4">
                    <input
                      id="useLocalSvg"
                      type="checkbox"
                      checked={editingSocial.useLocalSvg || false}
                      onChange={(e) => setEditingSocial({...editingSocial, useLocalSvg: e.target.checked})}
                      className="w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary dark:focus:ring-secondary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="useLocalSvg" className="ml-2 text-sm font-medium">
                      Use local SVG file
                    </label>
                  </div>
                  
                  {editingSocial.useLocalSvg ? (
                    <div>
                      <label htmlFor="localSvgPath" className="block text-sm font-medium mb-2">
                        Local SVG Path
                      </label>
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                          <select
                            id="localSvgPath"
                            value={editingSocial.localSvgPath || ''}
                            onChange={(e) => setEditingSocial({...editingSocial, localSvgPath: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value="">Select an icon</option>
                            <option value="/images/social-icons/linkedin.svg">LinkedIn</option>
                            <option value="/images/social-icons/github.svg">GitHub</option>
                            <option value="/images/social-icons/twitter.svg">Twitter</option>
                            <option value="/images/social-icons/instagram.svg">Instagram</option>
                          </select>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <p className="text-sm font-medium mb-2">Or upload your own SVG icon:</p>
                          <FileUpload 
                            fileType="social-icon"
                            acceptedFileTypes=".svg"
                            buttonText="Browse for SVG Icon"
                            onUploadComplete={(filePath) => {
                              setEditingSocial({...editingSocial, localSvgPath: filePath});
                            }}
                          />
                        </div>
                      </div>
                      {editingSocial.localSvgPath && (
                        <div className="mt-2 p-2 border rounded-lg flex justify-center">
                          <Image 
                            src={editingSocial.localSvgPath} 
                            alt="Selected icon" 
                            width={24} 
                            height={24} 
                            className="text-secondary"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="icon" className="block text-sm font-medium mb-2">
                        Icon SVG
                      </label>
                      <textarea
                        id="icon"
                        rows={3}
                        value={editingSocial.icon}
                        onChange={(e) => setEditingSocial({...editingSocial, icon: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="<svg>...</svg>"
                      />
                      {editingSocial.icon && (
                        <div className="mt-2 p-2 border rounded-lg flex justify-center">
                          <span dangerouslySetInnerHTML={{ __html: editingSocial.icon }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center mb-4">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={editingSocial.isActive}
                    onChange={(e) => setEditingSocial({...editingSocial, isActive: e.target.checked})}
                    className="w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary dark:focus:ring-secondary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium">
                    Active (visible in footer)
                  </label>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setEditingSocial(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSocial}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
            
            {footerConfig.socialLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No social links found. Add your first social link to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-left">
                    <tr>
                      <th className="px-4 py-3 text-sm font-medium">Platform</th>
                      <th className="px-4 py-3 text-sm font-medium">URL</th>
                      <th className="px-4 py-3 text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {footerConfig.socialLinks
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3 font-medium">{item.platform}</td>
                          <td className="px-4 py-3 text-gray-500">{item.url}</td>
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
                                onClick={() => setEditingSocial({...item})}
                                className="text-gray-500 hover:text-secondary"
                                disabled={!!editingSocial}
                                aria-label="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteSocial(item.id)}
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
          </div>
        )}
        
        {/* Quick Links Tab */}
        {activeTab === 'quicklinks' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="heading-sm">Quick Links</h2>
              <button
                onClick={handleAddQuickLink}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                disabled={!!editingQuickLink}
              >
                Add Quick Link
              </button>
            </div>
            
            {editingQuickLink && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-4">
                  {footerConfig.quickLinks.some(item => item.id === editingQuickLink.id) ? 'Edit Quick Link' : 'Add Quick Link'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="linkName" className="block text-sm font-medium mb-2">
                      Link Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="linkName"
                      type="text"
                      value={editingQuickLink.name}
                      onChange={(e) => setEditingQuickLink({...editingQuickLink, name: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Projects"
                    />
                  </div>
                  <div>
                    <label htmlFor="linkHref" className="block text-sm font-medium mb-2">
                      URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="linkHref"
                      type="text"
                      value={editingQuickLink.href}
                      onChange={(e) => setEditingQuickLink({...editingQuickLink, href: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., /projects"
                    />
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <input
                    id="quickLinkActive"
                    type="checkbox"
                    checked={editingQuickLink.isActive}
                    onChange={(e) => setEditingQuickLink({...editingQuickLink, isActive: e.target.checked})}
                    className="w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary dark:focus:ring-secondary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="quickLinkActive" className="ml-2 text-sm font-medium">
                    Active (visible in footer)
                  </label>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setEditingQuickLink(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveQuickLink}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
            
            {footerConfig.quickLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No quick links found. Add your first quick link to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-left">
                    <tr>
                      <th className="px-4 py-3 text-sm font-medium">Name</th>
                      <th className="px-4 py-3 text-sm font-medium">URL</th>
                      <th className="px-4 py-3 text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {footerConfig.quickLinks
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
                                onClick={() => setEditingQuickLink({...item})}
                                className="text-gray-500 hover:text-secondary"
                                disabled={!!editingQuickLink}
                                aria-label="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteQuickLink(item.id)}
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
          </div>
        )}
        
        {/* Legal Links Tab */}
        {activeTab === 'legal' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="heading-sm">Legal Links</h2>
              <button
                onClick={handleAddLegalLink}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                disabled={!!editingLegalLink}
              >
                Add Legal Link
              </button>
            </div>
            
            <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-4">Legal Section Title</h3>
              <div className="mb-4">
                <label htmlFor="legalTitle" className="block text-sm font-medium mb-2">
                  Title for Legal Links Section
                </label>
                <input
                  id="legalTitle"
                  type="text"
                  value={footerConfig.legalTitle}
                  onChange={(e) => setFooterConfig({...footerConfig, legalTitle: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., Legal, Policies, etc."
                />
                <p className="text-sm text-gray-500 mt-1">
                  This title will appear in the footer above the legal links.
                </p>
              </div>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Save Title
              </button>
            </div>
            
            {editingLegalLink && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-4">
                  {footerConfig.legalLinks.some(item => item.id === editingLegalLink.id) ? 'Edit Legal Link' : 'Add Legal Link'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="legalName" className="block text-sm font-medium mb-2">
                      Link Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="legalName"
                      type="text"
                      value={editingLegalLink.name}
                      onChange={(e) => setEditingLegalLink({...editingLegalLink, name: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Privacy Policy"
                    />
                  </div>
                  <div>
                    <label htmlFor="legalHref" className="block text-sm font-medium mb-2">
                      URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="legalHref"
                      type="text"
                      value={editingLegalLink.href}
                      onChange={(e) => setEditingLegalLink({...editingLegalLink, href: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., /privacy-policy"
                    />
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <input
                    id="legalLinkActive"
                    type="checkbox"
                    checked={editingLegalLink.isActive}
                    onChange={(e) => setEditingLegalLink({...editingLegalLink, isActive: e.target.checked})}
                    className="w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary dark:focus:ring-secondary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="legalLinkActive" className="ml-2 text-sm font-medium">
                    Active (visible in footer)
                  </label>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setEditingLegalLink(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveLegalLink}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
            
            {footerConfig.legalLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No legal links found. Add your first legal link to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-left">
                    <tr>
                      <th className="px-4 py-3 text-sm font-medium">Name</th>
                      <th className="px-4 py-3 text-sm font-medium">URL</th>
                      <th className="px-4 py-3 text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {footerConfig.legalLinks
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
                                onClick={() => setEditingLegalLink({...item})}
                                className="text-gray-500 hover:text-secondary"
                                disabled={!!editingLegalLink}
                                aria-label="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteLegalLink(item.id)}
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
              onClick={handleSaveChanges}
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
