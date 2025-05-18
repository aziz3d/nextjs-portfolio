"use client"

import { useEffect, useState } from 'react'

interface SiteSettings {
  title: string
  favicon: string
}

export function SiteMetadata() {
  const [settings, setSettings] = useState<SiteSettings>({
    title: 'Portfolio | Creative Developer & Designer',
    favicon: '/favicon.ico'
  })

  useEffect(() => {
    // Load settings from localStorage
    try {
      const storedSettings = localStorage.getItem('siteSettings')
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings))
      }
    } catch (error) {
      console.error('Error loading site settings:', error)
    }

    // Listen for storage events to update metadata when changed in admin
    const handleStorageChange = () => {
      try {
        const storedSettings = localStorage.getItem('siteSettings')
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings))
        }
      } catch (error) {
        console.error('Error updating site settings:', error)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    // Update document title
    document.title = settings.title
    
    // Update favicon
    const linkElements = document.querySelectorAll("link[rel*='icon']") as NodeListOf<HTMLLinkElement>
    linkElements.forEach(link => {
      link.href = settings.favicon
    })
  }, [settings])

  return null // This component doesn't render anything
}
