"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from './theme-toggle'
import { NavigationItem, defaultNavItems, SiteConfig, defaultSiteConfig } from '@/data/navigation'

interface Logo {
  id: string
  name: string
  type: 'frontend' | 'backend'
  imageUrl: string
  active: boolean
  size: number // Size in pixels (width)
  useText: boolean // Whether to use text instead of image
  text: string // Text to display if useText is true
}

// This would be fetched from an API in a real application
const fetchNavigationData = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Check if we have stored navigation data in localStorage
  const storedNavItems = localStorage.getItem('navItems')
  const storedSiteConfig = localStorage.getItem('siteConfig')
  
  return {
    navItems: storedNavItems ? JSON.parse(storedNavItems) : defaultNavItems,
    siteConfig: storedSiteConfig ? JSON.parse(storedSiteConfig) : defaultSiteConfig
  }
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [navItems, setNavItems] = useState<NavigationItem[]>(defaultNavItems)
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultSiteConfig)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  useEffect(() => {
    // Load navigation data on component mount
    const loadNavigationData = async () => {
      try {
        const { navItems: items, siteConfig: config } = await fetchNavigationData()
        setNavItems(items)
        setSiteConfig(config)
        
        // Load active frontend logo if available
        const storedLogos = localStorage.getItem('logos')
        if (storedLogos) {
          const logos = JSON.parse(storedLogos) as Logo[]
          const activeFrontendLogo = logos.find(logo => logo.type === 'frontend' && logo.active)
          if (activeFrontendLogo) {
            setSiteConfig(prev => ({
              ...prev,
              logoImage: activeFrontendLogo.imageUrl,
              logoText: activeFrontendLogo.text || prev.logoText,
              logoSize: activeFrontendLogo.size || 120,
              useTextLogo: activeFrontendLogo.useText || false
            }))
          }
        }
      } catch (error) {
        console.error('Error loading navigation data:', error)
      }
    }
    
    loadNavigationData()
    
    // Set up event listener for storage changes
    const handleStorageChange = () => {
      loadNavigationData()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'py-2 bg-secondary/80 text-white backdrop-blur-md shadow-md' 
          : 'py-4 bg-accent/10 dark:bg-secondary/20 backdrop-blur-md'
      }`}>
        <div className="container-custom flex justify-between items-center">
          <Link href="/" className="font-display text-xl font-bold">
            <motion.span 
              className={`${scrolled ? 'text-white' : 'text-text dark:text-background'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {siteConfig.useTextLogo ? (
                <div className="font-bold">
                  {siteConfig.logoText}
                  <span className="text-secondary">.</span>
                </div>
              ) : siteConfig.logoImage ? (
                <Image 
                  src={siteConfig.logoImage} 
                  alt={siteConfig.logoText} 
                  width={siteConfig.logoSize || 120} 
                  height={(siteConfig.logoSize || 120) / 3} 
                  className={`w-auto`} 
                  style={{ height: `${(siteConfig.logoSize || 120) / 4}px` }}
                />
              ) : (
                <>
                  {siteConfig.logoText}
                  <span className="text-secondary">.</span>
                </>
              )}
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems
              .filter(item => item.isActive)
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <Link 
                  key={item.id} 
                  href={item.href}
                  className="font-body hover:text-secondary transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden z-50 relative"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col justify-between h-5">
              <span className={`h-0.5 w-full bg-current transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`h-0.5 w-full bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`h-0.5 w-full bg-current transform transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background dark:bg-primary flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center space-y-8">
              {navItems
                .filter(item => item.isActive)
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="font-display text-2xl hover:text-secondary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ThemeToggle />
    </>
  )
}
