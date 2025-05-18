"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HeroScene } from '../3d/hero-scene'

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

export function HeroSection() {
  const [settings, setSettings] = useState<HeroSettings>(defaultHeroSettings)
  
  useEffect(() => {
    // Load hero settings from localStorage
    const loadSettings = () => {
      try {
        const storedSettings = localStorage.getItem('heroSettings')
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings))
        }
      } catch (error) {
        console.error('Error loading hero settings:', error)
      }
    }
    
    loadSettings()
    
    // Set up event listener for storage changes
    const handleStorageChange = () => {
      loadSettings()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  return (
    <section id="hero" className="min-h-screen flex flex-col justify-center relative overflow-hidden">
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-2 lg:order-1"
          >
            <h1 className="heading-xl mb-4">
              {settings.title}
              <span className="text-secondary"> {settings.highlightedText1}</span>
              <br />& 
              <span className="text-accent"> {settings.highlightedText2}</span>
            </h1>
            <p className="body-lg mb-8 text-text/80 dark:text-background/80 max-w-xl">
              {settings.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.a
                href={settings.projectsButtonLink}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-secondary text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                {settings.projectsButtonText}
              </motion.a>
              <motion.a
                href={settings.contactButtonLink}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border border-secondary text-secondary dark:text-secondary font-medium rounded-full hover:bg-secondary/10 transition-all"
              >
                {settings.contactButtonText}
              </motion.a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="order-1 lg:order-2"
          >
            <HeroScene />
          </motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-secondary/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-accent/20 rounded-full filter blur-3xl"></div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-secondary"
        >
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </motion.div>
    </section>
  )
}
