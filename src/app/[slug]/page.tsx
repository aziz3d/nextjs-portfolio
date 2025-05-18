'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { marked } from 'marked'
import { defaultNavItems, NavigationItem } from '@/data/navigation'

export default function DynamicPage() {
  const params = useParams()
  const slug = params?.slug as string
  
  const [pageContent, setPageContent] = useState<string>('')
  const [pageTitle, setPageTitle] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  
  useEffect(() => {
    const loadPageContent = () => {
      try {
        // Check if the page exists in navigation
        const storedNavItems = localStorage.getItem('navItems')
        const navItems = storedNavItems ? JSON.parse(storedNavItems) : defaultNavItems
        
        const page = navItems.find((item: NavigationItem) => {
          const itemPath = item.href.startsWith('/') ? item.href.substring(1) : item.href
          return itemPath === slug
        })
        
        if (!page) {
          setNotFound(true)
          setIsLoading(false)
          return
        }
        
        setPageTitle(page.name)
        
        // Load the page content
        const pageContents = JSON.parse(localStorage.getItem('pageContents') || '{}')
        
        if (pageContents[slug]) {
          setPageContent(pageContents[slug].content || '')
        } else {
          setPageContent('This page has no content yet.')
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading page content:', error)
        setPageContent('Error loading page content')
        setIsLoading(false)
      }
    }
    
    if (slug) {
      loadPageContent()
    }
    
    // Listen for storage events to update the page content
    window.addEventListener('storage', loadPageContent)
    return () => window.removeEventListener('storage', loadPageContent)
  }, [slug])
  
  if (notFound) {
    return (
      <>
        <Navigation />
        <main className="container-custom py-20">
          <div className="text-center">
            <h1 className="heading-xl mb-6">Page Not Found</h1>
            <p className="body-lg mb-8 text-text/70 dark:text-background/70 max-w-2xl mx-auto">
              The page you are looking for does not exist or has been removed.
            </p>
          </div>
        </main>
        <Footer />
      </>
    )
  }
  
  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="container-custom py-20">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
          </div>
        </main>
        <Footer />
      </>
    )
  }
  
  return (
    <>
      <Navigation />
      <main className="container-custom py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-xl mb-8">{pageTitle}</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: typeof pageContent === 'string' ? marked.parse(pageContent) as string : '' }} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
