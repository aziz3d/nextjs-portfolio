"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

export default function TermsOfServicePage() {
  const [content, setContent] = useState<string>('')
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))

  useEffect(() => {
    // Load content from localStorage
    try {
      const storedContent = localStorage.getItem('legalPagesContent')
      if (storedContent) {
        const parsedContent = JSON.parse(storedContent)
        setContent(parsedContent.termsOfService)
        
        // Extract last updated date from content if available
        const lastUpdatedMatch = parsedContent.termsOfService.match(/Last updated: ([^\n]*)/)
        if (lastUpdatedMatch && lastUpdatedMatch[1]) {
          setLastUpdated(lastUpdatedMatch[1])
        }
      }
    } catch (error) {
      console.error('Error loading terms of service content:', error)
    }

    // Listen for storage events to update content when changed in admin
    const handleStorageChange = () => {
      try {
        const storedContent = localStorage.getItem('legalPagesContent')
        if (storedContent) {
          const parsedContent = JSON.parse(storedContent)
          setContent(parsedContent.termsOfService)
          
          // Extract last updated date from content if available
          const lastUpdatedMatch = parsedContent.termsOfService.match(/Last updated: ([^\n]*)/)
          if (lastUpdatedMatch && lastUpdatedMatch[1]) {
            setLastUpdated(lastUpdatedMatch[1])
          }
        }
      } catch (error) {
        console.error('Error updating terms of service content:', error)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <section className="py-20 bg-background dark:bg-primary relative overflow-hidden">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="heading-lg mb-4">Terms of Service</h1>
          <p className="body-lg text-text/70 dark:text-background/70">
            Last updated: {lastUpdated}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-lg dark:prose-invert max-w-none"
        >
          {content ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Terms of service content is being loaded...</p>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link 
              href="/"
              className="inline-flex items-center text-secondary hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-secondary/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/10 rounded-full filter blur-3xl"></div>
    </section>
  )
}
