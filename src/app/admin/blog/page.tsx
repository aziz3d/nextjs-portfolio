"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { BlogPost } from '@/components/sections/blog-section'

export default function BlogAdmin() {
  const { status } = useSession()
  const router = useRouter()
  
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    // Load blog posts from localStorage
    const loadPosts = () => {
      try {
        setIsLoading(true)
        const storedPosts = localStorage.getItem('blogPosts')
        if (storedPosts) {
          setPosts(JSON.parse(storedPosts))
        }
      } catch (error) {
        console.error('Error loading blog posts:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Listen for storage events to update blog posts data
    const handleStorageChange = (e: StorageEvent | Event) => {
      if (e instanceof StorageEvent) {
        if (e.key === 'blogPosts' || e.key === null) {
          loadPosts()
        }
      } else {
        // Custom event triggered by window.dispatchEvent(new Event('storage'))
        loadPosts()
      }
    }
    
    if (status === 'authenticated') {
      loadPosts()
      window.addEventListener('storage', handleStorageChange)
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [status, router])
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      const updatedPosts = posts.filter(post => post.id !== id)
      setPosts(updatedPosts)
      localStorage.setItem('blogPosts', JSON.stringify(updatedPosts))
      window.dispatchEvent(new Event('storage'))
    }
  }
  
  const handleToggleFeatured = (id: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === id) {
        return { ...post, featured: !post.featured }
      }
      return post
    })
    setPosts(updatedPosts)
    localStorage.setItem('blogPosts', JSON.stringify(updatedPosts))
    window.dispatchEvent(new Event('storage'))
  }
  
  const handleReorder = (id: string, direction: 'up' | 'down') => {
    const index = posts.findIndex(post => post.id === id)
    if (index === -1) return
    
    const newPosts = [...posts]
    
    if (direction === 'up' && index > 0) {
      // Swap with previous item
      [newPosts[index], newPosts[index - 1]] = [newPosts[index - 1], newPosts[index]]
    } else if (direction === 'down' && index < posts.length - 1) {
      // Swap with next item
      [newPosts[index], newPosts[index + 1]] = [newPosts[index + 1], newPosts[index]]
    } else {
      return // No change needed
    }
    
    setPosts(newPosts)
    localStorage.setItem('blogPosts', JSON.stringify(newPosts))
    window.dispatchEvent(new Event('storage'))
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-lg">Blog Management</h1>
        <button
          onClick={() => router.push('/admin/blog/new')}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          Add New Post
        </button>
      </div>
      
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Author</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Featured</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No blog posts found. Add your first post!
                  </td>
                </tr>
              ) : (
                posts.map((post, index) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative h-10 w-10 rounded-md overflow-hidden flex-shrink-0">
                          <Image 
                            src={post.imageUrl} 
                            alt={post.title}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium truncate max-w-xs">{post.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{post.date}</td>
                    <td className="px-6 py-4">{post.author}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(post.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.featured ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400'}`}
                      >
                        {post.featured ? 'Featured' : 'Not Featured'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReorder(post.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleReorder(post.id, 'down')}
                          disabled={index === posts.length - 1}
                          className="p-1 text-gray-500 hover:text-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Down"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                        <button
                          onClick={() => router.push(`/admin/blog/edit/${post.id}`)}
                          className="p-1 text-blue-500 hover:text-blue-700"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
