"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  imageUrl: string
  date: string
  author: string
  tags: string[]
  featured: boolean
}

const defaultBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Web Development with AI',
    excerpt: 'Exploring how artificial intelligence is transforming the way we build and interact with websites.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquet nisl, nec aliquet nisl nisl nec nisl. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquet nisl, nec aliquet nisl nisl nec nisl.',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
    date: '2025-05-10',
    author: 'John Doe',
    tags: ['AI', 'Web Development', 'Future Tech'],
    featured: true
  },
  {
    id: '2',
    title: 'Designing for Accessibility: Best Practices',
    excerpt: 'Learn how to make your websites more accessible to users with disabilities.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquet nisl, nec aliquet nisl nisl nec nisl. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquet nisl, nec aliquet nisl nisl nec nisl.',
    imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07',
    date: '2025-05-05',
    author: 'Jane Smith',
    tags: ['Accessibility', 'UI/UX', 'Design'],
    featured: true
  },
  {
    id: '3',
    title: 'Getting Started with 3D Web Animations',
    excerpt: 'A beginner\'s guide to creating stunning 3D animations for your web projects.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquet nisl, nec aliquet nisl nisl nec nisl. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquet nisl, nec aliquet nisl nisl nec nisl.',
    imageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766',
    date: '2025-04-28',
    author: 'Michael Johnson',
    tags: ['3D', 'Animation', 'WebGL'],
    featured: false
  },
  {
    id: '4',
    title: 'The Rise of Serverless Architecture',
    excerpt: 'Why serverless is becoming the preferred choice for modern web applications.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquet nisl, nec aliquet nisl nisl nec nisl. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquet nisl, nec aliquet nisl nisl nec nisl.',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31',
    date: '2025-04-20',
    author: 'Sarah Williams',
    tags: ['Serverless', 'Architecture', 'Cloud'],
    featured: false
  }
]

interface BlogCardProps {
  post: BlogPost
}

function BlogCard({ post }: BlogCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-primary/40 rounded-xl shadow-lg overflow-hidden"
    >
      <div className="relative h-48 w-full">
        <Image 
          src={post.imageUrl} 
          alt={post.title}
          fill
          className="object-cover"
        />
        {post.featured && (
          <div className="absolute top-2 right-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded">
            Featured
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-text/60 dark:text-background/60 mb-2">
          <span>{post.date}</span>
          <span>•</span>
          <span>{post.author}</span>
        </div>
        <h3 className="heading-sm mb-2">{post.title}</h3>
        <p className="text-text/80 dark:text-background/80 mb-4">{post.excerpt}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span 
              key={index}
              className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link 
          href={`/blog/${post.id}`}
          className="text-secondary font-medium hover:underline inline-flex items-center"
        >
          Read More
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </motion.div>
  )
}

interface BlogSectionProps {
  showHeading?: boolean
}

export function BlogSection({ showHeading = false }: BlogSectionProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  
  useEffect(() => {
    // Load blog posts from localStorage or use defaults
    const loadPosts = () => {
      try {
        const storedPosts = localStorage.getItem('blogPosts')
        if (storedPosts) {
          setPosts(JSON.parse(storedPosts))
        } else {
          setPosts(defaultBlogPosts)
          // Save default posts to localStorage
          localStorage.setItem('blogPosts', JSON.stringify(defaultBlogPosts))
        }
      } catch (error) {
        console.error('Error loading blog posts:', error)
        setPosts(defaultBlogPosts)
      }
    }
    
    loadPosts()
    
    // Set up event listener for storage changes
    const handleStorageChange = () => {
      loadPosts()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  return (
    <section id="blog" className="py-16">
      <div className="container-custom">
        {showHeading && (
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="heading-xl mb-4"
            >
              Latest <span className="text-secondary">Articles</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="body-lg text-text/80 dark:text-background/80 max-w-2xl mx-auto"
            >
              Insights, tutorials, and thoughts on web development, design, and technology.
            </motion.p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}
