"use client"

import { useState, useEffect, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { SimpleMap } from '@/components/map/simple-map'
import PredefinedIcon from '@/components/icons/PredefinedIcon'

interface ContactSettings {
  id: string
  title: string
  subtitle: string
  description: string
  email: string
  phone: string
  address: string
  mapEnabled: boolean
  latitude: number
  longitude: number
  formEnabled: boolean
  socialLinks: {
    platform: string
    url: string
    icon: string
  }[]
}

const defaultContactSettings: ContactSettings = {
  id: 'contact-settings',
  title: 'Get in Touch',
  subtitle: 'Contact Me',
  description: 'Have a project in mind or want to discuss a potential collaboration? Feel free to reach out using the form below or through any of my social channels.',
  email: 'hello@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Creative St, Design City, 10001',
  mapEnabled: true,
  latitude: 40.7128,
  longitude: -74.0060,
  formEnabled: true,
  socialLinks: [
    { platform: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
    { platform: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' },
    { platform: 'GitHub', url: 'https://github.com', icon: 'github' }
  ]
}

export function ContactSection() {
  const [settings, setSettings] = useState<ContactSettings>(defaultContactSettings)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  
  useEffect(() => {
    // Load contact settings from localStorage
    const loadSettings = () => {
      try {
        const storedSettings = localStorage.getItem('contactSettings')
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings))
        }
      } catch (error) {
        console.error('Error loading contact settings:', error)
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // In a real application, you would send the form data to a server
    setFormStatus('submitting')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
      
      setFormStatus('success')
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setFormStatus('idle')
      }, 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setFormStatus('error')
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setFormStatus('idle')
      }, 5000)
    }
  }
  
  return (
    <section id="contact" className="py-20 bg-background dark:bg-primary">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-sm uppercase tracking-wider text-secondary mb-2">{settings.subtitle}</h2>
          <h3 className="heading-xl mb-4">{settings.title}</h3>
          <p className="body-lg max-w-2xl mx-auto text-text/80 dark:text-background/80">
            {settings.description}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-secondary/10 dark:bg-secondary/20 p-3 rounded-full text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Email</h4>
                  <a href={`mailto:${settings.email}`} className="text-secondary hover:underline">
                    {settings.email}
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-secondary/10 dark:bg-secondary/20 p-3 rounded-full text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Phone</h4>
                  <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="text-secondary hover:underline">
                    {settings.phone}
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-secondary/10 dark:bg-secondary/20 p-3 rounded-full text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Address</h4>
                  <p className="text-text/80 dark:text-background/80">
                    {settings.address}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Social Links */}
            {settings.socialLinks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Connect With Me</h4>
                <div className="flex space-x-4">
                  {settings.socialLinks.map((link, index) => (
                    <a 
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-secondary/10 dark:bg-secondary/20 p-3 rounded-full text-secondary hover:bg-secondary hover:text-white transition-colors"
                      aria-label={link.platform}
                    >
                      <PredefinedIcon name={link.icon} className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Map */}
            {settings.mapEnabled && (
              <div className="mt-8">
                <h4 className="font-semibold mb-3">Location</h4>
                <div className="rounded-lg overflow-hidden shadow-lg h-[300px]">
                  <SimpleMap
                    latitude={settings.latitude}
                    longitude={settings.longitude}
                    height="300px"
                    title="My Location"
                  />
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Contact Form */}
          {settings.formEnabled && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-8"
            >
              <h4 className="heading-md mb-6">Send Me a Message</h4>
              
              {formStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
                  Your message has been sent successfully! I&apos;ll get back to you soon.
                </div>
              )}
              
              {formStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
                  There was an error sending your message. Please try again later.
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Your Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className="w-full px-6 py-3 bg-secondary text-white font-medium rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
