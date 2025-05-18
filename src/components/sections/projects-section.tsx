"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Project } from '@/data/projects'

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeCategory, setActiveCategory] = useState("All")
  const [activeProject, setActiveProject] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [visibleIndex, setVisibleIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Fetch projects from localStorage or API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        
        // First check localStorage for projects
        const storedProjects = localStorage.getItem('projects')
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects))
          setIsLoading(false)
          return
        }
        
        // If not in localStorage, fetch from API
        const response = await fetch('/api/projects')
        const data = await response.json()
        setProjects(data.projects)
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Listen for storage events (when projects are added/updated)
    const handleStorageChange = () => {
      const storedProjects = localStorage.getItem('projects')
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects))
      }
    }
    
    fetchProjects()
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  
  // Get unique categories from projects
  const categories = ["All", ...Array.from(new Set(projects.map(project => 
    project.technologies[0] || "Other"
  )))]
  
  // Filter projects by category
  const filteredProjects = activeCategory === "All" 
    ? projects.filter(project => project.featured)
    : projects.filter(project => project.technologies.includes(activeCategory) && project.featured)

  // Calculate visible projects (3 at a time)
  const projectsPerView = 3
  const maxIndex = Math.max(0, filteredProjects.length - projectsPerView)

  // Functions to navigate projects
  const scrollLeft = useCallback(() => {
    if (containerRef.current) {
      const newIndex = Math.max(0, visibleIndex - 1)
      setVisibleIndex(newIndex)
      containerRef.current.scrollTo({ left: newIndex * (containerRef.current.clientWidth / projectsPerView), behavior: 'smooth' })
    }
  }, [visibleIndex, projectsPerView])

  const scrollRight = useCallback(() => {
    if (containerRef.current) {
      const newIndex = Math.min(maxIndex, visibleIndex + 1)
      setVisibleIndex(newIndex)
      containerRef.current.scrollTo({ left: newIndex * (containerRef.current.clientWidth / projectsPerView), behavior: 'smooth' })
    }
  }, [visibleIndex, projectsPerView, maxIndex])
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        scrollLeft()
      } else if (e.key === 'ArrowRight') {
        scrollRight()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [visibleIndex, filteredProjects.length, scrollLeft, scrollRight])

  return (
    <section id="projects" className="py-20 bg-background dark:bg-primary">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="heading-lg mb-4">Featured Projects</h2>
          <p className="body-lg text-text/70 dark:text-background/70 max-w-2xl mx-auto">
            Explore my selected works across various disciplines, from interactive 3D experiences 
            to AI-powered applications and modern web development.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category 
                  ? 'bg-secondary text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-text dark:text-background hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
          </div>
        )}

        {/* Projects Container with Navigation */}
        {!isLoading && filteredProjects.length > 0 && (
          <div className="relative max-w-6xl mx-auto pb-16">
            {/* Navigation Arrows */}
            <motion.button 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/90 dark:bg-primary/90 rounded-full shadow-lg hover:bg-secondary hover:text-white transition-all duration-300"
              onClick={scrollLeft}
              aria-label="Previous projects"
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              disabled={visibleIndex === 0}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: visibleIndex === 0 ? 0.5 : 1 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </motion.button>
            
            <motion.button 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/90 dark:bg-primary/90 rounded-full shadow-lg hover:bg-secondary hover:text-white transition-all duration-300"
              onClick={scrollRight}
              aria-label="Next projects"
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.9 }}
              disabled={visibleIndex >= maxIndex}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: visibleIndex >= maxIndex ? 0.5 : 1 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </motion.button>
            
            {/* Scrollable Projects Container */}
            <div className="w-full max-w-[1100px] mx-auto overflow-hidden">
              <motion.div 
                ref={containerRef}
                id="projects-container"
                className="flex gap-6 snap-x snap-mandatory mx-auto px-4 py-4 overflow-hidden"
                style={{ 
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ 
                      y: -10,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                    className="w-[330px] flex-shrink-0 snap-center bg-white dark:bg-primary/40 rounded-xl overflow-hidden shadow-lg transition-all duration-300 border border-transparent hover:border-secondary/20"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-10"></div>
                      <Image 
                        src={project.imageUrl} 
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-110"
                      />
                    </div>
                    <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="heading-md text-lg">{project.title}</h3>
                      </div>
                      <p className="body-md mb-4 text-text/70 dark:text-background/70 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <motion.span 
                            key={tech} 
                            className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full"
                            whileHover={{ scale: 1.1 }}
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveProject(project.id)}
                        className="w-full py-2 bg-secondary text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
                      >
                        <span>View Details</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" 
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            
            {/* Indicator dots */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {Array.from({ length: Math.ceil(filteredProjects.length / projectsPerView) }).map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === visibleIndex ? 'bg-secondary w-8' : 'bg-gray-300 dark:bg-gray-700'}`}
                  onClick={() => {
                    setVisibleIndex(index)
                    if (containerRef.current) {
                      containerRef.current.scrollTo({ left: index * (containerRef.current.clientWidth / projectsPerView), behavior: 'smooth' })
                    }
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setActiveProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-primary max-w-4xl w-full rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {projects.filter(p => p.id === activeProject).map((project) => (
                <div key={project.id} className="relative">
                  <button 
                    onClick={() => setActiveProject(null)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  <div className="relative h-64 md:h-80">
                    <Image 
                      src={project.imageUrl} 
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="p-8">
                    <h2 className="heading-lg mb-2">{project.title}</h2>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies.map((tech) => (
                        <span 
                          key={tech} 
                          className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mb-8">
                      <p className="body-md text-text/80 dark:text-background/80">{project.description}</p>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      {project.demoUrl && (
                        <a 
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2 bg-secondary text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all"
                        >
                          Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a 
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2 border border-secondary text-secondary dark:text-secondary font-medium rounded-full hover:bg-secondary/10 transition-all"
                        >
                          View Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
