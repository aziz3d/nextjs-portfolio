"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Navigation } from '@/components/navigation'
import { Project } from '@/data/projects'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeCategory, setActiveCategory] = useState("All")
  const [activeProject, setActiveProject] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
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
  const categories = ["All", ...Array.from(new Set(projects.flatMap(project => project.technologies)))]
  
  // Filter projects by category
  const filteredProjects = activeCategory === "All" 
    ? projects 
    : projects.filter(project => project.technologies.includes(activeCategory))

  return (
    <>
      <Navigation />
      <main>
        <section className="py-20 bg-background dark:bg-primary">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h1 className="heading-lg mb-4">My Projects</h1>
              <p className="body-lg text-text/70 dark:text-background/70 max-w-2xl mx-auto">
                Browse through my complete portfolio of projects, from web applications to interactive experiences and design work.
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

            {/* Projects Grid */}
            {!isLoading && (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                layout
              >
                <AnimatePresence>
                  {filteredProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white dark:bg-primary/40 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                    >
                      <div className="relative h-64 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-10"></div>
                        <Image 
                          src={project.imageUrl} 
                          alt={project.title}
                          fill
                          className="object-cover transition-transform hover:scale-105"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="heading-md text-lg">{project.title}</h3>
                        </div>
                        <p className="body-md mb-4 text-text/70 dark:text-background/70">
                          {project.description}
                        </p>
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
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveProject(project.id)}
                          className="w-full py-2 bg-secondary text-white rounded-lg font-medium hover:bg-secondary/90 transition-colors"
                        >
                          View Details
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* No Projects Found */}
            {!isLoading && filteredProjects.length === 0 && (
              <div className="text-center py-20">
                <h3 className="heading-md mb-2">No projects found</h3>
                <p className="body-md text-text/70 dark:text-background/70">
                  No projects match the selected category. Try selecting a different category.
                </p>
              </div>
            )}
          </div>
        </section>

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
                            className="px-6 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-secondary/90 transition-colors"
                          >
                            View Demo
                          </a>
                        )}
                        {project.githubUrl && (
                          <a 
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
      </main>
    </>
  )
}
