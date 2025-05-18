"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import SectionSettings from './section-settings'

interface SiteSettings {
  title: string
  favicon: string
  mapSettings: {
    apiKey: string
    latitude: number
    longitude: number
    zoom: number
  }
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    title: 'Portfolio | Creative Developer & Designer',
    favicon: '/favicon.ico',
    mapSettings: {
      apiKey: '',
      latitude: 40.7128,
      longitude: -74.0060,
      zoom: 13
    }
  })
  const [previewFavicon, setPreviewFavicon] = useState<string>('/favicon.ico')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [uploadedFavicon, setUploadedFavicon] = useState<File | null>(null)

  useEffect(() => {
    // Load settings from localStorage
    try {
      const storedSettings = localStorage.getItem('siteSettings')
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings))
        setPreviewFavicon(JSON.parse(storedSettings).favicon || '/favicon.ico')
      }
    } catch (error) {
      console.error('Error loading site settings:', error)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setSettings(prev => ({ ...prev, favicon: value }))
    setPreviewFavicon(value)
  }

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFavicon(file)
      
      // Create a local URL for preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewFavicon(objectUrl)
      
      // Store the file name in settings
      const fileName = `/uploads/${file.name}`
      setSettings(prev => ({ ...prev, favicon: fileName }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Handle file upload if a file was selected
      if (uploadedFavicon) {
        // In a real application, you would upload the file to a server here
        // For this demo, we'll create a copy in the public folder
        const formData = new FormData()
        formData.append('file', uploadedFavicon)
        formData.append('type', 'favicon')
        
        try {
          // Upload the file to the server
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          
          if (!response.ok) {
            throw new Error('Failed to upload favicon')
          }
          
          const data = await response.json()
          // Update the settings with the new favicon path
          setSettings(prev => ({ ...prev, favicon: data.filePath }))
        } catch (uploadError) {
          console.error('Error uploading favicon:', uploadError)
          // Continue with saving other settings even if upload fails
        }
      }
      
      // Save to localStorage
      localStorage.setItem('siteSettings', JSON.stringify(settings))
      
      // Save map settings separately for easy access by the contact component
      localStorage.setItem('mapSettings', JSON.stringify(settings.mapSettings))
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Update document title
      document.title = settings.title
      
      // Update favicon
      const linkElements = document.querySelectorAll("link[rel*='icon']") as NodeListOf<HTMLLinkElement>
      linkElements.forEach(link => {
        link.href = settings.favicon
      })
      
      // Create a new link element if none exists
      if (linkElements.length === 0) {
        const newLink = document.createElement('link')
        newLink.rel = 'icon'
        newLink.href = settings.favicon
        document.head.appendChild(newLink)
      }
      
      // Reset the uploaded file
      setUploadedFavicon(null)
      
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error('Error saving site settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container-custom py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-white dark:bg-primary/40 p-8 rounded-xl shadow-lg"
      >
        <h1 className="heading-lg mb-6">Site Settings</h1>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block mb-2 font-medium">Site Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={settings.title}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Site Title"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This will be displayed in the browser tab and search results.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Favicon Settings</h3>
            
            <div className="mb-6">
              <label htmlFor="faviconUpload" className="block mb-2 font-medium">Upload Favicon</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="faviconUpload"
                  accept=".ico,.png,.svg,.jpg,.jpeg"
                  onChange={handleFaviconUpload}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Upload a favicon file from your computer (.ico, .png, or .svg recommended).
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="favicon" className="block mb-2 font-medium">Favicon URL</label>
              <input
                type="text"
                id="favicon"
                name="favicon"
                value={settings.favicon}
                onChange={handleFaviconChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="/favicon.ico"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Or enter the URL of your favicon. It should be a .ico, .png, or .svg file.
              </p>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 relative">
                  <Image 
                    src={previewFavicon} 
                    alt="Favicon preview" 
                    width={32} 
                    height={32} 
                    className="object-contain"
                    onError={() => setPreviewFavicon('/favicon.ico')}
                  />
                </div>
              </div>
              <span className="text-sm">Favicon Preview</span>
              {uploadedFavicon && (
                <span className="text-sm text-green-500">File selected: {uploadedFavicon.name}</span>
              )}
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Google Maps Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Configure the Google Maps display for the contact page.
            </p>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="mapApiKey" className="block mb-2 font-medium">Google Maps API Key</label>
                <input
                  type="text"
                  id="mapApiKey"
                  name="mapApiKey"
                  value={settings.mapSettings.apiKey}
                  onChange={(e) => setSettings({
                    ...settings,
                    mapSettings: {
                      ...settings.mapSettings,
                      apiKey: e.target.value
                    }
                  })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Enter your Google Maps API key"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Get an API key from the <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">Google Cloud Console</a>.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="mapLatitude" className="block mb-2 font-medium">Latitude</label>
                  <input
                    type="number"
                    id="mapLatitude"
                    name="mapLatitude"
                    value={settings.mapSettings.latitude}
                    onChange={(e) => setSettings({
                      ...settings,
                      mapSettings: {
                        ...settings.mapSettings,
                        latitude: parseFloat(e.target.value)
                      }
                    })}
                    step="0.000001"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
                
                <div>
                  <label htmlFor="mapLongitude" className="block mb-2 font-medium">Longitude</label>
                  <input
                    type="number"
                    id="mapLongitude"
                    name="mapLongitude"
                    value={settings.mapSettings.longitude}
                    onChange={(e) => setSettings({
                      ...settings,
                      mapSettings: {
                        ...settings.mapSettings,
                        longitude: parseFloat(e.target.value)
                      }
                    })}
                    step="0.000001"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
                
                <div>
                  <label htmlFor="mapZoom" className="block mb-2 font-medium">Zoom Level</label>
                  <input
                    type="number"
                    id="mapZoom"
                    name="mapZoom"
                    value={settings.mapSettings.zoom}
                    onChange={(e) => setSettings({
                      ...settings,
                      mapSettings: {
                        ...settings.mapSettings,
                        zoom: parseInt(e.target.value)
                      }
                    })}
                    min="1"
                    max="20"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    1 = World view, 20 = Building view
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-secondary text-white font-medium rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-70"
            >
              {isSaving ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Settings"
              )}
            </motion.button>
            
            {isSaved && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-4 text-green-500 dark:text-green-400"
              >
                Settings saved successfully!
              </motion.span>
            )}
          </div>
          
          {/* Section Settings */}
          <SectionSettings />
        </div>
      </motion.div>
    </div>
  )
}
