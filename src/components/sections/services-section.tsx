"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export interface Service {
  id: string
  title: string
  description: string
  icon: string
  featured: boolean
}

const defaultServices: Service[] = [
  {
    id: '1',
    title: 'Web Development',
    description: 'Custom web applications built with modern frameworks like React, Next.js, and Node.js.',
    icon: 'code',
    featured: true
  },
  {
    id: '2',
    title: 'UI/UX Design',
    description: 'User-centered design with a focus on intuitive interfaces and seamless user experiences.',
    icon: 'palette',
    featured: true
  },
  {
    id: '3',
    title: '3D Modeling & Animation',
    description: 'Custom 3D models and animations for web, games, and interactive experiences.',
    icon: 'cube',
    featured: true
  },
  {
    id: '4',
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile applications for iOS and Android.',
    icon: 'smartphone',
    featured: false
  },
  {
    id: '5',
    title: 'SEO Optimization',
    description: 'Improve your website\'s visibility and ranking in search engine results.',
    icon: 'search',
    featured: false
  },
  {
    id: '6',
    title: 'Content Creation',
    description: 'High-quality content creation for blogs, social media, and marketing materials.',
    icon: 'edit',
    featured: false
  }
]

interface ServiceCardProps {
  service: Service
}

function ServiceCard({ service }: ServiceCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 ${service.featured ? 'border-l-4 border-secondary' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
          {service.icon === 'code' && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
          )}
          {service.icon === 'palette' && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
          )}
          {service.icon === 'cube' && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          )}
          {service.icon === 'smartphone' && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          )}
          {service.icon === 'search' && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          )}
          {service.icon === 'edit' && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="heading-sm mb-2">{service.title}</h3>
          <p className="text-text/80 dark:text-background/80">{service.description}</p>
        </div>
      </div>
    </motion.div>
  )
}

interface ServicesSectionProps {
  showHeading?: boolean
}

export function ServicesSection({ showHeading = false }: ServicesSectionProps) {
  const [services, setServices] = useState<Service[]>([])
  
  useEffect(() => {
    // Load services from localStorage or use defaults
    const loadServices = () => {
      try {
        const storedServices = localStorage.getItem('services')
        if (storedServices) {
          setServices(JSON.parse(storedServices))
        } else {
          setServices(defaultServices)
          // Save default services to localStorage
          localStorage.setItem('services', JSON.stringify(defaultServices))
        }
      } catch (error) {
        console.error('Error loading services:', error)
        setServices(defaultServices)
      }
    }
    
    loadServices()
    
    // Set up event listener for storage changes
    const handleStorageChange = () => {
      loadServices()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  return (
    <section id="services" className="py-16">
      <div className="container-custom">
        {showHeading && (
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="heading-xl mb-4"
            >
              My <span className="text-secondary">Services</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="body-lg text-text/80 dark:text-background/80 max-w-2xl mx-auto"
            >
              I offer a range of services to help businesses and individuals create stunning digital experiences.
            </motion.p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}
