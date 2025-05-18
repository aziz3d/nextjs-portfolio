"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Stats {
  webProjects: number
  logoDesigns: number
  graphics3D: number
  developmentYears: number
}

export function StatsSection() {
  const [stats, setStats] = useState<Stats>({
    webProjects: 0,
    logoDesigns: 0,
    graphics3D: 0,
    developmentYears: 0
  })
  
  useEffect(() => {
    // In a real app, you would fetch this data from an API or database
    // For this demo, we'll use static data
    const defaultStats = {
      webProjects: 48,
      logoDesigns: 65,
      graphics3D: 32,
      developmentYears: 8
    }
    
    // Check if we have stored stats in localStorage
    const storedStats = localStorage.getItem('portfolioStats')
    if (storedStats) {
      setStats(JSON.parse(storedStats))
    } else {
      setStats(defaultStats)
    }
    
    // Set up counter animation
    const animateCounters = () => {
      const finalStats = storedStats ? JSON.parse(storedStats) : defaultStats
      const duration = 2000 // ms
      const frameDuration = 1000 / 60 // 60fps
      const totalFrames = Math.round(duration / frameDuration)
      
      let frame = 0
      const counter = setInterval(() => {
        frame++
        const progress = frame / totalFrames
        
        setStats({
          webProjects: Math.floor(progress * finalStats.webProjects),
          logoDesigns: Math.floor(progress * finalStats.logoDesigns),
          graphics3D: Math.floor(progress * finalStats.graphics3D),
          developmentYears: Math.floor(progress * finalStats.developmentYears)
        })
        
        if (frame === totalFrames) {
          clearInterval(counter)
          setStats(finalStats)
        }
      }, frameDuration)
      
      return () => clearInterval(counter)
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cleanup = animateCounters()
          observer.disconnect()
          return cleanup
        }
      })
    }, { threshold: 0.1 })
    
    const section = document.getElementById('stats-section')
    if (section) {
      observer.observe(section)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <section id="stats-section" className="py-24 bg-gradient-to-b from-background to-gray-50 dark:from-primary dark:to-primary/90">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="heading-xl mb-4">Portfolio Highlights</h2>
          <p className="body-lg text-text/70 dark:text-background/70 max-w-2xl mx-auto">
            A snapshot of my professional journey and creative output across different domains
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 text-center"
          >
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-secondary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
            </div>
            <h3 className="heading-2xl font-bold text-secondary mb-2">{stats.webProjects}</h3>
            <p className="body-md text-text/70 dark:text-background/70">Web Projects</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 text-center"
          >
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-secondary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <h3 className="heading-2xl font-bold text-secondary mb-2">{stats.logoDesigns}</h3>
            <p className="body-md text-text/70 dark:text-background/70">Logo Designs</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 text-center"
          >
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-secondary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
              </svg>
            </div>
            <h3 className="heading-2xl font-bold text-secondary mb-2">{stats.graphics3D}</h3>
            <p className="body-md text-text/70 dark:text-background/70">3D Graphics</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 text-center"
          >
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-secondary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="heading-2xl font-bold text-secondary mb-2">{stats.developmentYears}</h3>
            <p className="body-md text-text/70 dark:text-background/70">Years of Development</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
