"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HighlightsConfig, defaultHighlightsConfig, getHighlightsConfig, migrateHighlightsData } from '@/data/highlights'

export function HighlightsSection() {
  const [config, setConfig] = useState<HighlightsConfig>(defaultHighlightsConfig)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchHighlightsConfig = async () => {
      try {
        setIsLoading(true)
        
        // Migrate old data format to new format if needed
        migrateHighlightsData()
        
        // Get the highlights configuration
        const highlightsConfig = getHighlightsConfig()
        console.log('Loaded highlights config:', highlightsConfig)
        setConfig(highlightsConfig)
      } catch (error) {
        console.error('Error fetching highlights config:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Listen for storage events to update config
    const handleStorageChange = (event?: StorageEvent) => {
      // If it's a specific storage event and not for our key, ignore it
      if (event && event.key && event.key !== 'highlightsConfig') {
        return
      }
      
      console.log('Storage change detected, updating highlights')
      const highlightsConfig = getHighlightsConfig()
      setConfig(highlightsConfig)
    }
    
    // Custom event handler for our specific event
    const handleCustomStorageEvent = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.key === 'highlightsConfig') {
        console.log('Custom storage event detected for highlights')
        const highlightsConfig = getHighlightsConfig()
        setConfig(highlightsConfig)
      }
    }
    
    // Initial load
    fetchHighlightsConfig()
    
    // Add event listeners
    window.addEventListener('storage', handleStorageChange)
    document.addEventListener('custom-storage-event', handleCustomStorageEvent as EventListener)
    
    // Force a check for data on mount
    const checkTimer = setTimeout(() => {
      const highlightsConfig = getHighlightsConfig()
      setConfig(highlightsConfig)
    }, 500)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('custom-storage-event', handleCustomStorageEvent as EventListener)
      clearTimeout(checkTimer)
    }
  }, [])
  
  return (
    <section className="py-16 bg-gray-50 dark:bg-primary/30">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-10"
        >
          <h2 className="heading-lg mb-4">{config.title}</h2>
          <p className="body-lg text-text/70 dark:text-background/70 max-w-2xl mx-auto">
            {config.description}
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 lg:gap-24 py-8">
            {config.stats.filter(stat => stat.active).map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex justify-center items-center w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 text-secondary">
                  <span className="material-icons text-3xl">{stat.icon}</span>
                </div>
                <div className="flex items-baseline justify-center mb-1">
                  <span className="heading-xl text-primary dark:text-secondary">{stat.value}</span>
                  <span className="text-xl font-medium text-primary/70 dark:text-secondary/70 ml-1">+</span>
                </div>
                <p className="body-md font-medium text-text dark:text-background/90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
