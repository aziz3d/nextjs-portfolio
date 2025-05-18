'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAuth } from '@/contexts/auth-context'
import { SimpleMap } from '@/components/map/simple-map'

interface ContactSettings {
  id: string
  title: string
  subtitle: string
  description: string
  email: string
  phone: string
  address: string
  mapEnabled: boolean
  latitude: number
  longitude: number
  formEnabled: boolean
  socialLinks: {
    platform: string
    url: string
    icon: string
  }[]
}

const defaultContactSettings: ContactSettings = {
  id: 'contact-settings',
  title: 'Get in Touch',
  subtitle: 'Contact Me',
  description: 'Have a project in mind or want to discuss a potential collaboration? Feel free to reach out using the form below or through any of my social channels.',
  email: 'hello@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Creative St, Design City, 10001',
  mapEnabled: true,
  latitude: 40.7128,
  longitude: -74.0060,
  formEnabled: true,
  socialLinks: [
    { platform: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
    { platform: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' },
    { platform: 'GitHub', url: 'https://github.com', icon: 'github' }
  ]
}

export default function ContactAdmin() {
  const router = useRouter()
  const { status } = useSession()
  const { hasPermission } = useAuth()
  const [settings, setSettings] = useState<ContactSettings>(defaultContactSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    if (status === 'authenticated' && !hasPermission('canManagePages')) {
      router.push('/admin')
      return
    }
    
    // Load contact settings from localStorage
    const loadSettings = () => {
      try {
        const storedSettings = localStorage.getItem('contactSettings')
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings))
        }
      } catch (error) {
        console.error('Error loading contact settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSettings()
  }, [status, router, hasPermission])
  
  const handleSave = () => {
    try {
      setIsSaving(true)
      
      // Save to localStorage
      localStorage.setItem('contactSettings', JSON.stringify(settings))
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      setNotification({
        type: 'success',
        message: 'Contact settings saved successfully'
      })
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null)
      }, 3000)
    } catch (error) {
      console.error('Error saving contact settings:', error)
      setNotification({
        type: 'error',
        message: 'Failed to save contact settings'
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleAddSocialLink = () => {
    setSettings(prev => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { platform: '', url: '', icon: 'link' }
      ]
    }))
  }
  
  const handleRemoveSocialLink = (index: number) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }))
  }
  
  const handleSocialLinkChange = (index: number, field: 'platform' | 'url' | 'icon', value: string) => {
    setSettings(prev => {
      const updatedLinks = [...prev.socialLinks]
      updatedLinks[index] = {
        ...updatedLinks[index],
        [field]: value
      }
      return {
        ...prev,
        socialLinks: updatedLinks
      }
    })
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-lg">Contact Page Settings</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      {notification && (
        <div className={`mb-6 p-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.message}
        </div>
      )}
      
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="heading-md mb-6">Page Content</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Page Title
            </label>
            <input
              id="title"
              type="text"
              value={settings.title}
              onChange={(e) => setSettings({...settings, title: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium mb-2">
              Subtitle
            </label>
            <input
              id="subtitle"
              type="text"
              value={settings.subtitle}
              onChange={(e) => setSettings({...settings, subtitle: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={settings.description}
            onChange={(e) => setSettings({...settings, description: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="heading-md mb-6">Contact Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({...settings, email: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({...settings, phone: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="address" className="block text-sm font-medium mb-2">
            Address
          </label>
          <input
            id="address"
            type="text"
            value={settings.address}
            onChange={(e) => setSettings({...settings, address: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <input
              id="formEnabled"
              type="checkbox"
              checked={settings.formEnabled}
              onChange={(e) => setSettings({...settings, formEnabled: e.target.checked})}
              className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded"
            />
            <label htmlFor="formEnabled" className="ml-2 text-sm font-medium">
              Enable Contact Form
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="heading-md mb-6">Map Settings</h2>
        
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <input
              id="mapEnabled"
              type="checkbox"
              checked={settings.mapEnabled}
              onChange={(e) => setSettings({...settings, mapEnabled: e.target.checked})}
              className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded"
            />
            <label htmlFor="mapEnabled" className="ml-2 text-sm font-medium">
              Show Map on Contact Page
            </label>
          </div>
        </div>
        
        {settings.mapEnabled && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium mb-2">
                  Latitude
                </label>
                <input
                  id="latitude"
                  type="number"
                  step="0.0001"
                  value={settings.latitude}
                  onChange={(e) => setSettings({...settings, latitude: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium mb-2">
                  Longitude
                </label>
                <input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  value={settings.longitude}
                  onChange={(e) => setSettings({...settings, longitude: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mt-4 mb-6">
              <h3 className="text-sm font-medium mb-2">Map Preview</h3>
              <div className="border rounded-lg overflow-hidden">
                <SimpleMap
                  latitude={settings.latitude}
                  longitude={settings.longitude}
                  height="300px"
                />
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-md">Social Links</h2>
          <button
            onClick={handleAddSocialLink}
            className="px-3 py-1.5 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors text-sm"
          >
            Add Social Link
          </button>
        </div>
        
        {settings.socialLinks.map((link, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b last:border-b-0">
            <div>
              <label htmlFor={`platform-${index}`} className="block text-sm font-medium mb-2">
                Platform
              </label>
              <input
                id={`platform-${index}`}
                type="text"
                value={link.platform}
                onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="e.g., Twitter"
              />
            </div>
            
            <div>
              <label htmlFor={`url-${index}`} className="block text-sm font-medium mb-2">
                URL
              </label>
              <input
                id={`url-${index}`}
                type="text"
                value={link.url}
                onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="https://..."
              />
            </div>
            
            <div>
              <label htmlFor={`icon-${index}`} className="block text-sm font-medium mb-2">
                Icon
              </label>
              <div className="flex items-center">
                <select
                  id={`icon-${index}`}
                  value={link.icon}
                  onChange={(e) => handleSocialLinkChange(index, 'icon', e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="twitter">Twitter</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="github">GitHub</option>
                  <option value="youtube">YouTube</option>
                  <option value="dribbble">Dribbble</option>
                  <option value="behance">Behance</option>
                  <option value="medium">Medium</option>
                  <option value="link">Generic Link</option>
                </select>
                <button
                  onClick={() => handleRemoveSocialLink(index)}
                  className="ml-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  aria-label="Remove social link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      <p className="text-sm text-gray-500 mt-8">
        Note: Changes are saved to the browser for demo purposes. In a production environment, these would be saved to a database.
      </p>
    </div>
  )
}
