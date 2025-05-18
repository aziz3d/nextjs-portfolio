'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Testimonial, defaultTestimonials } from '@/data/testimonials'

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Load testimonials from localStorage
    const loadTestimonials = () => {
      try {
        const storedTestimonials = localStorage.getItem('testimonials')
        if (storedTestimonials) {
          setTestimonials(JSON.parse(storedTestimonials))
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading testimonials:', error)
        setIsLoading(false)
      }
    }
    
    loadTestimonials()
    
    // Listen for storage events to update testimonials
    window.addEventListener('storage', loadTestimonials)
    return () => window.removeEventListener('storage', loadTestimonials)
  }, [])
  
  // Filter to only show featured testimonials
  const featuredTestimonials = testimonials.filter(t => t.featured)
  
  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    if (featuredTestimonials.length <= 1) return
    
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % featuredTestimonials.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [featuredTestimonials.length])
  
  // If there are no testimonials, don't render the section
  if (featuredTestimonials.length === 0 && !isLoading) {
    return null
  }
  
  return (
    <section id="testimonials" className="py-20 bg-background dark:bg-primary relative overflow-hidden">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="heading-lg mb-4">Client Testimonials</h2>
          <p className="body-lg text-text/70 dark:text-background/70 max-w-2xl mx-auto">
            What clients say about my work and collaboration experience
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="relative">
            {/* Testimonial Cards */}
            <div className="relative h-[400px] md:h-[300px]">
              {featuredTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: index === activeIndex ? 1 : 0,
                    scale: index === activeIndex ? 1 : 0.9,
                    x: index === activeIndex ? 0 : (index < activeIndex ? -50 : 50)
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                  style={{ display: index === activeIndex ? 'block' : 'none' }}
                >
                  <div className="bg-white dark:bg-primary/40 p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-shrink-0">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden">
                          {testimonial.avatarUrl ? (
                            <Image 
                              src={testimonial.avatarUrl} 
                              alt={testimonial.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary/20 flex items-center justify-center text-secondary text-2xl font-bold">
                              {testimonial.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-grow text-center md:text-left">
                        <div className="flex justify-center md:justify-start mb-2">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i} 
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-5 w-5 ${i < (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        
                        <p className="body-lg italic mb-4 text-text/80 dark:text-background/80">
                          &ldquo;{testimonial.content}&rdquo;
                        </p>
                        
                        <div>
                          <h4 className="font-display font-bold text-lg">{testimonial.name}</h4>
                          <p className="text-text/60 dark:text-background/60">
                            {testimonial.role}, {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Pagination Dots */}
            {featuredTestimonials.length > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                {featuredTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === activeIndex 
                        ? 'bg-secondary' 
                        : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-secondary/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-accent/10 rounded-full filter blur-3xl"></div>
    </section>
  )
}
