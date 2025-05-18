"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FooterConfig, defaultFooterConfig } from '@/data/footer'

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
const fetchFooterData = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Check if we have stored footer data in localStorage
  const storedFooterConfig = localStorage.getItem('footerConfig')
  
  return storedFooterConfig ? JSON.parse(storedFooterConfig) : defaultFooterConfig
}

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(defaultFooterConfig)
  
  const [footerLogo, setFooterLogo] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState<number>(120)
  const [useTextLogo, setUseTextLogo] = useState<boolean>(false)
  const [logoText, setLogoText] = useState<string>('Portfolio')
  
  useEffect(() => {
    // Load footer data on component mount
    const loadFooterData = async () => {
      try {
        const config = await fetchFooterData()
        setFooterConfig(config)
        
        // Load active frontend logo if available
        const storedLogos = localStorage.getItem('logos')
        if (storedLogos) {
          const logos = JSON.parse(storedLogos) as Logo[]
          const activeFrontendLogo = logos.find(logo => logo.type === 'frontend' && logo.active)
          if (activeFrontendLogo) {
            setFooterLogo(activeFrontendLogo.imageUrl)
            setLogoSize(activeFrontendLogo.size || 120)
            setUseTextLogo(activeFrontendLogo.useText || false)
            setLogoText(activeFrontendLogo.text || 'Portfolio')
          }
        }
      } catch (error) {
        console.error('Error loading footer data:', error)
      }
    }
    
    loadFooterData()
    
    // Set up event listener for storage changes
    const handleStorageChange = () => {
      loadFooterData()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  return (
    <footer className="bg-gradient-to-r from-primary/95 to-primary py-16 text-white relative overflow-hidden">
      {/* Abstract shapes for visual interest */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-secondary blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full bg-accent blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-secondary/70 blur-3xl"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="font-display text-2xl font-bold mb-4 inline-block">
              {useTextLogo ? (
                <div className="font-bold">
                  {logoText}<span className="text-secondary">.</span>
                </div>
              ) : footerLogo ? (
                <Image 
                  src={footerLogo} 
                  alt="Portfolio Logo" 
                  width={logoSize} 
                  height={logoSize / 3} 
                  className={`w-auto`} 
                  style={{ height: `${logoSize / 4}px` }}
                />
              ) : (
                <>Portfolio<span className="text-secondary">.</span></>
              )}
            </Link>
            <p className="body-md text-white/80 max-w-md mb-8 leading-relaxed">
              {footerConfig.description}
            </p>
            <div className="flex gap-5">
              {footerConfig.socialLinks
                .filter(link => link.isActive)
                .sort((a, b) => a.order - b.order)
                .map(link => (
                  <motion.a 
                    key={link.id}
                    href={link.url} 
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-secondary hover:scale-110 transition-all duration-300"
                    aria-label={link.ariaLabel}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {link.useLocalSvg && link.localSvgPath ? (
                      <Image 
                        src={link.localSvgPath} 
                        alt={link.platform} 
                        width={24} 
                        height={24}
                        className="text-white"
                      />
                    ) : (
                      <span dangerouslySetInnerHTML={{ __html: link.icon }} />
                    )}
                  </motion.a>
                ))
              }
            </div>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 relative inline-block">
                Quick Links
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-secondary rounded-full"></span>
              </h3>
              <ul className="space-y-4">
                {footerConfig.quickLinks
                  .filter(link => link.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map(link => (
                    <motion.li key={link.id} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                      <Link 
                        href={link.href} 
                        className="text-white/80 hover:text-secondary transition-all duration-300 flex items-center gap-2"
                      >
                        <span className="text-xs">→</span> {link.name}
                      </Link>
                    </motion.li>
                  ))
                }
              </ul>
            </div>
            
            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 relative inline-block">
                {footerConfig.legalTitle}
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-secondary rounded-full"></span>
              </h3>
              <ul className="space-y-4">
                {footerConfig.legalLinks
                  .filter(link => link.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map(link => (
                    <motion.li key={link.id} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                      <Link 
                        href={link.href} 
                        className="text-white/80 hover:text-secondary transition-all duration-300 flex items-center gap-2"
                      >
                        <span className="text-xs">→</span> {link.name}
                      </Link>
                    </motion.li>
                  ))
                }
              </ul>
            </div>
            
            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 relative inline-block">
                Contact
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-secondary rounded-full"></span>
              </h3>
              <ul className="space-y-5">
                <li className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-secondary transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <a href={`mailto:${footerConfig.contactInfo.email}`} className="text-white/80 hover:text-white transition-colors group-hover:translate-x-1 transform transition-transform duration-300">
                    {footerConfig.contactInfo.email}
                  </a>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-secondary transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <span className="text-white/80 group-hover:translate-x-1 transform transition-transform duration-300">{footerConfig.contactInfo.location}</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* No empty div needed with the fixed grid layout */}
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <motion.p 
            className="text-sm text-white/60 hover:text-white/80 transition-colors"
            initial={{ opacity: 0.6 }}
            whileHover={{ opacity: 1 }}
          >
            {footerConfig.copyrightText.replace('{year}', currentYear.toString())}
          </motion.p>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            {footerConfig.legalLinks
              .filter(link => link.isActive)
              .sort((a, b) => a.order - b.order)
              .map(link => (
                <motion.div
                  key={link.id}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link 
                    href={link.href} 
                    className="text-white/60 hover:text-secondary transition-all duration-300"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))
            }
          </div>
        </div>
      </div>
    </footer>
  )
}
