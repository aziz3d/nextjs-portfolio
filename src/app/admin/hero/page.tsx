"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface HeroSettings {
  title: string
  highlightedText1: string
  highlightedText2: string
  description: string
  projectsButtonText: string
  projectsButtonLink: string
  contactButtonText: string
  contactButtonLink: string
}

const defaultHeroSettings: HeroSettings = {
  title: 'Creative',
  highlightedText1: 'Developer',
  highlightedText2: 'Designer',
  description: 'Crafting immersive digital experiences through 2D/3D design, animation, and cutting-edge web development with AI-powered features.',
  projectsButtonText: 'View Projects',
  projectsButtonLink: '#projects',
  contactButtonText: 'Contact Me',
  contactButtonLink: '#contact'
}

export default function HeroSettings() {
  const { status } = useSession()
  const router = useRouter()
  
  const [settings, setSettings] = useState<HeroSettings>(defaultHeroSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    // Load hero settings from localStorage
    const loadSettings = () => {
      try {
        const storedSettings = localStorage.getItem('heroSettings')
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings))
        }
      } catch (error) {
        console.error('Error loading hero settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (status === 'authenticated') {
      loadSettings()
    }
  }, [status, router])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      // Save to localStorage
      localStorage.setItem('heroSettings', JSON.stringify(settings))
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving hero settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default settings?')) {
      setSettings(defaultHeroSettings)
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
        <h1 className="heading-lg">Hero Section Settings</h1>
      </div>
      
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="heading-md mb-6">Text Content</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Main Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={settings.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="highlightedText1" className="block text-sm font-medium mb-2">
              Highlighted Text 1 (Secondary Color)
            </label>
            <input
              id="highlightedText1"
              name="highlightedText1"
              type="text"
              value={settings.highlightedText1}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="highlightedText2" className="block text-sm font-medium mb-2">
              Highlighted Text 2 (Accent Color)
            </label>
            <input
              id="highlightedText2"
              name="highlightedText2"
              type="text"
              value={settings.highlightedText2}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={settings.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <h2 className="heading-md mb-6">Button Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="projectsButtonText" className="block text-sm font-medium mb-2">
              Projects Button Text
            </label>
            <input
              id="projectsButtonText"
              name="projectsButtonText"
              type="text"
              value={settings.projectsButtonText}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="projectsButtonLink" className="block text-sm font-medium mb-2">
              Projects Button Link
            </label>
            <input
              id="projectsButtonLink"
              name="projectsButtonLink"
              type="text"
              value={settings.projectsButtonLink}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="contactButtonText" className="block text-sm font-medium mb-2">
              Contact Button Text
            </label>
            <input
              id="contactButtonText"
              name="contactButtonText"
              type="text"
              value={settings.contactButtonText}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="contactButtonLink" className="block text-sm font-medium mb-2">
              Contact Button Link
            </label>
            <input
              id="contactButtonLink"
              name="contactButtonLink"
              type="text"
              value={settings.contactButtonLink}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Reset to Default
          </button>
          
          <div className="flex items-center gap-4">
            {saveStatus === 'success' && (
              <span className="text-green-600 dark:text-green-400">✓ Saved successfully</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-600 dark:text-red-400">✗ Error saving</span>
            )}
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6">
        <h2 className="heading-md mb-4">Preview</h2>
        
        <div className="bg-background dark:bg-primary p-8 rounded-lg">
          <div className="max-w-2xl">
            <h1 className="heading-xl mb-4">
              {settings.title}
              <span className="text-secondary"> {settings.highlightedText1}</span>
              <br />& 
              <span className="text-accent"> {settings.highlightedText2}</span>
            </h1>
            <p className="body-lg mb-8 text-text/80 dark:text-background/80">
              {settings.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                className="px-8 py-3 bg-secondary text-white font-medium rounded-full shadow-lg"
              >
                {settings.projectsButtonText}
              </button>
              <button
                className="px-8 py-3 border border-secondary text-secondary dark:text-secondary font-medium rounded-full"
              >
                {settings.contactButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
