"use client"

import { useState, useEffect } from 'react'
import { AllSectionSettings, defaultSectionSettings } from '@/data/section-settings'

export default function SectionSettings() {
  const [sectionSettings, setSectionSettings] = useState<AllSectionSettings>(defaultSectionSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    // Load section settings from localStorage
    try {
      const storedSettings = localStorage.getItem('sectionSettings')
      if (storedSettings) {
        setSectionSettings(JSON.parse(storedSettings))
      }
    } catch (error) {
      console.error('Error loading section settings:', error)
    }
  }, [])

  const handleChange = (section: string, field: string, value: string) => {
    setSectionSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof AllSectionSettings],
        [field]: value
      }
    }))
  }

  const handleSave = () => {
    setIsSaving(true)
    
    try {
      // Save to localStorage
      localStorage.setItem('sectionSettings', JSON.stringify(sectionSettings))
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Also dispatch a custom event that we can listen for specifically
      document.dispatchEvent(new CustomEvent('custom-storage-event', { 
        detail: { key: 'sectionSettings', action: 'update' } 
      }))
      
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error('Error saving section settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-6">Section Settings</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Customize the titles and descriptions for each section of your portfolio.
      </p>
      
      <div className="space-y-8">
        {/* Skills Section Settings */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Skills Section</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="skillsTitle" className="block mb-2 font-medium">Title</label>
              <input
                type="text"
                id="skillsTitle"
                value={sectionSettings.skills.title}
                onChange={(e) => handleChange('skills', 'title', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Skills Overview"
              />
            </div>
            
            <div>
              <label htmlFor="skillsDescription" className="block mb-2 font-medium">Description</label>
              <textarea
                id="skillsDescription"
                value={sectionSettings.skills.description}
                onChange={(e) => handleChange('skills', 'description', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="A comprehensive breakdown of my technical and creative abilities..."
              />
            </div>
          </div>
        </div>
        
        {/* Add other section settings here as needed */}
        
        <div className="pt-4">
          <button
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
              "Save Section Settings"
            )}
          </button>
          
          {isSaved && (
            <span className="ml-4 text-green-500 dark:text-green-400">
              Section settings saved successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
