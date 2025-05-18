'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Project } from '@/data/projects'
import Notification from '@/components/ui/notification'
import ConfirmationDialog from '@/components/ui/confirmation-dialog'

export default function ProjectsAdmin() {
  const { status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    message: ''
  })
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    projectId: '',
    projectTitle: ''
  })
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        
        // First check localStorage for projects
        const storedProjects = localStorage.getItem('projects')
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects))
          setIsLoading(false)
          return
        }
        
        // If not in localStorage, fetch from API
        const response = await fetch('/api/projects')
        const data = await response.json()
        setProjects(data.projects)
        
        // Store in localStorage for future use
        localStorage.setItem('projects', JSON.stringify(data.projects))
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Listen for storage events (when projects are added/updated)
    const handleStorageChange = () => {
      const storedProjects = localStorage.getItem('projects')
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects))
      }
    }
    
    if (status === 'authenticated') {
      fetchProjects()
      window.addEventListener('storage', handleStorageChange)
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [status, router])
  
  const handleEdit = (id: string) => {
    router.push(`/admin/projects/edit/${id}`)
  }
  
  const handleDelete = async (id: string) => {
    // Find the project to get its title for the confirmation message
    const projectToDelete = projects.find(project => project.id === id)
    if (!projectToDelete) return
    
    // Open confirmation dialog instead of using JavaScript confirm
    setConfirmDialog({
      isOpen: true,
      projectId: id,
      projectTitle: projectToDelete.title
    })
  }
  
  const confirmDelete = async () => {
    const id = confirmDialog.projectId
    
    try {
      // Remove the project from the current state
      const updatedProjects = projects.filter(project => project.id !== id)
      setProjects(updatedProjects)
      
      // Update localStorage
      localStorage.setItem('projects', JSON.stringify(updatedProjects))
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Show success notification
      setNotification({
        show: true,
        type: 'success',
        message: 'Project deleted successfully!'
      })
    } catch (error) {
      console.error('Error deleting project:', error)
      
      // Show error notification instead of alert
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to delete project'
      })
    }
  }
  
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div>
      {/* Notification component */}
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Project"
        message={`Are you sure you want to delete "${confirmDialog.projectTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        type="danger"
      />
      <div className="flex justify-between items-center mb-8">
        <h1 className="heading-lg">Manage Projects</h1>
        <button
          onClick={() => router.push('/admin/projects/new')}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          Add New Project
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Technologies</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Featured</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-12 h-12 relative rounded overflow-hidden">
                        <Image 
                          src={project.imageUrl} 
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{project.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.featured 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {project.featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(project.id)}
                        className="text-secondary hover:text-secondary/80 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No projects found. Add your first project!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
