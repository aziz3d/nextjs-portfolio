"use client"

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { TimelineItem } from '@/data/timeline'

// This will be replaced with API data
const initialTimelineData: TimelineItem[] = [
  {
    id: "timeline-1",
    date: "2023 - Present",
    title: "Senior Creative Developer",
    description: "Leading development of immersive 3D web experiences and AI-powered interactive applications for enterprise clients.",
    tags: ["WebGL", "Three.js", "AI Integration", "Team Leadership"]
  },
  {
    id: "timeline-2",
    date: "2021 - 2023",
    title: "UI/UX Designer & Frontend Developer",
    description: "Designed and developed responsive web applications with focus on animation and interactive elements.",
    tags: ["UI/UX", "React", "Animation", "Design Systems"]
  },
  {
    id: "timeline-3",
    date: "2019 - 2021",
    title: "Motion Designer",
    description: "Produced animations and motion graphics for digital marketing campaigns and interactive media.",
    tags: ["Motion Design", "After Effects", "Marketing", "Animation"]
  },
  {
    id: "timeline-4",
    date: "2017 - 2019",
    title: "3D Artist & Animator",
    description: "Created 3D models, textures, and animations for mobile and web-based games.",
    tags: ["3D Modeling", "Animation", "Game Development", "Blender"]
  },
  {
    id: "timeline-5",
    date: "2015 - 2017",
    title: "Graphic Designer",
    description: "Designed visual assets for print and digital marketing campaigns.",
    tags: ["Graphic Design", "Branding", "Marketing", "Print Design"]
  }
]



export function TimelineSection() {
  const [timelineData, setTimelineData] = useState<TimelineItem[]>(initialTimelineData)
  const [isLoading, setIsLoading] = useState(true)
  
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.4, 1, 1, 0.4])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8])
  
  // Fetch timeline data from localStorage or API
  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setIsLoading(true)
        
        // First check localStorage for timeline data
        let foundData = false
        const possibleKeys = ['timelineData', 'timeline', 'timelineItems']
        
        for (const key of possibleKeys) {
          const storedData = localStorage.getItem(key)
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData)
              if (Array.isArray(parsedData) && parsedData.length > 0) {
                setTimelineData(parsedData)
                foundData = true
                break
              }
            } catch (e) {
              console.error(`Error parsing ${key}:`, e)
            }
          }
        }
        
        if (!foundData) {
          // Try to fetch from API
          try {
            const response = await fetch('/api/timeline')
            if (response.ok) {
              const data = await response.json()
              if (data.timeline && Array.isArray(data.timeline)) {
                setTimelineData(data.timeline)
                // Store in localStorage for future use
                localStorage.setItem('timelineData', JSON.stringify(data.timeline))
                foundData = true
              }
            }
          } catch (apiError) {
            console.error('API fetch error:', apiError)
          }
        }
        
        // If still no data, use the initial data
        if (!foundData) {
          // Store initial data in localStorage
          localStorage.setItem('timelineData', JSON.stringify(initialTimelineData))
        }
      } catch (error) {
        console.error('Error fetching timeline data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTimelineData()
    
    // Listen for storage events to update timeline data
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'timelineData' || event.key === 'timeline' || event.key === 'timelineItems') {
        if (event.newValue) {
          try {
            const newData = JSON.parse(event.newValue)
            if (Array.isArray(newData)) {
              setTimelineData(newData)
            }
          } catch (e) {
            console.error('Error parsing storage event data:', e)
          }
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom storage events dispatched within the same window
    const handleCustomStorageEvent = () => {
      const possibleKeys = ['timelineData', 'timeline', 'timelineItems']
      for (const key of possibleKeys) {
        const storedData = localStorage.getItem(key)
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData)
            if (Array.isArray(parsedData)) {
              setTimelineData(parsedData)
              break
            }
          } catch (e) {
            console.error(`Error parsing ${key}:`, e)
          }
        }
      }
    }
    
    window.addEventListener('storage', handleCustomStorageEvent)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('storage', handleCustomStorageEvent)
    }
  }, [])
  
  return (
    <section id="timeline" className="py-20 bg-background dark:bg-primary relative overflow-hidden">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="heading-lg mb-4">Experience Timeline</h2>
          <p className="body-lg text-text/70 dark:text-background/70 max-w-2xl mx-auto">
            A chronological journey through my professional experience and key career milestones.
          </p>
        </motion.div>
        
        <motion.div 
          ref={containerRef}
          style={{ opacity, scale }}
          className="relative"
        >
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-secondary/30 rounded-full"></div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
            </div>
          )}
          
          {/* Timeline items */}
          {!isLoading && (
            <div className="space-y-12 relative">
              {timelineData.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`flex flex-col ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } gap-8 items-center`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-5 h-5 bg-secondary rounded-full border-4 border-background dark:border-primary z-10"></div>
                  
                  {/* Content */}
                  <div className="md:w-1/2 text-center md:text-right md:pl-0 pl-8 pr-8">
                    <div className={index % 2 === 0 ? 'md:text-right' : 'md:text-left'}>
                      <span className="mono text-secondary text-sm">{item.date}</span>
                      <h3 className="heading-md text-xl mt-2 mb-1">{item.title}</h3>
                      <p className="body-md mb-4 text-text/70 dark:text-background/70">{item.description}</p>
                      
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                          {item.tags.map((tag, i) => (
                            <span 
                              key={`${item.id}-tag-${i}`} 
                              className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {item.link && (
                        <a 
                          href={item.link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-4 text-secondary hover:underline"
                        >
                          {item.link.text}
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Empty space for the other side */}
                  <div className="md:w-1/2"></div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
        

        
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-secondary/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/10 rounded-full filter blur-3xl"></div>
        
      </div>
    </section>
  )
}
