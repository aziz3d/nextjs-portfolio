"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { BlogPost } from '@/components/sections/blog-section'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function BlogPostPage() {
  const { id } = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = () => {
      try {
        const storedPosts = localStorage.getItem('blogPosts')
        if (storedPosts) {
          const posts = JSON.parse(storedPosts) as BlogPost[]
          const foundPost = posts.find(post => post.id === id)
          
          if (foundPost) {
            setPost(foundPost)
          } else {
            setError('Blog post not found')
          }
        } else {
          setError('No blog posts available')
        }
      } catch (err) {
        console.error('Error fetching blog post:', err)
        setError('Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="container-custom pt-32 pb-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !post) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="container-custom pt-32 pb-16">
          <div className="text-center">
            <h1 className="heading-xl mb-4 text-red-500">{error || "Blog post not found"}</h1>
            <p className="body-lg mb-8">The blog post you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.</p>
            <Link href="/blog" className="btn-primary">
              Return to Blog
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="container-custom pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/blog" className="inline-flex items-center text-secondary mb-8 hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Blog
          </Link>
          
          <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg overflow-hidden">
            <div className="relative h-64 md:h-96 w-full">
              <Image 
                src={post.imageUrl} 
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="p-8">
              <div className="flex items-center gap-2 text-sm text-text/60 dark:text-background/60 mb-4">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.author}</span>
              </div>
              
              <h1 className="heading-xl mb-6">{post.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-sm bg-secondary/10 text-secondary px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p>{post.content}</p>
                
                {/* This is a placeholder for the full content. In a real app, you'd render the full content here */}
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
                <h2>Key Takeaways</h2>
                <ul>
                  <li>Important point one about this topic</li>
                  <li>Critical insight number two that readers should remember</li>
                  <li>Final thought that wraps up the article nicely</li>
                </ul>
                <p>
                  In conclusion, this topic demonstrates the importance of staying current with industry trends and best practices.
                  We hope you found this article helpful and informative.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
