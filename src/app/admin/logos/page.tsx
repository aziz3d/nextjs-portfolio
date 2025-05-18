"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

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

export default function LogoManager() {
  const { status } = useSession()
  const router = useRouter()
  
  const [logos, setLogos] = useState<Logo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    // Load logos from localStorage or use defaults
    const loadLogos = () => {
      try {
        const storedLogos = localStorage.getItem('logos')
        if (storedLogos) {
          // Ensure all logos have the required properties with default values if missing
          const parsedLogos = JSON.parse(storedLogos) as Logo[]
          const normalizedLogos = parsedLogos.map(logo => ({
            ...logo,
            size: logo.size || 120,
            useText: typeof logo.useText === 'boolean' ? logo.useText : false,
            text: logo.text || (logo.type === 'frontend' ? 'Portfolio' : 'Portfolio Admin')
          }))
          setLogos(normalizedLogos)
        } else {
          // Default logos
          const defaultLogos: Logo[] = [
            {
              id: 'frontend-default',
              name: 'Default Frontend Logo',
              type: 'frontend',
              imageUrl: '/images/logos/frontend-logo.svg',
              active: true,
              size: 120, // Default size in pixels
              useText: false,
              text: 'Portfolio'
            },
            {
              id: 'backend-default',
              name: 'Default Backend Logo',
              type: 'backend',
              imageUrl: '/images/logos/backend-logo.svg',
              active: true,
              size: 120, // Default size in pixels
              useText: false,
              text: 'Portfolio Admin'
            }
          ]
          setLogos(defaultLogos)
          localStorage.setItem('logos', JSON.stringify(defaultLogos))
        }
      } catch (error) {
        console.error('Error loading logos:', error)
      }
      
      setIsLoading(false)
    }
    
    loadLogos()
  }, [status, router])
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'frontend' | 'backend') => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg']
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload an SVG, PNG, or JPEG file.')
      return
    }
    
    setIsUploading(true)
    setUploadError('')
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', 'logo')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload logo')
      }
      
      // Create a new logo
      const newLogo: Logo = {
        id: `${type}-${Date.now()}`,
        name: `${type === 'frontend' ? 'Frontend' : 'Backend'} Logo - ${result.originalName}`,
        type: type,
        imageUrl: result.filePath,
        active: false,
        size: 120, // Default size in pixels
        useText: false,
        text: type === 'frontend' ? 'Portfolio' : 'Portfolio Admin'
      }
      
      // Update logos
      const updatedLogos = [...logos, newLogo]
      setLogos(updatedLogos)
      localStorage.setItem('logos', JSON.stringify(updatedLogos))
      
      setNotification({
        type: 'success',
        message: `${type === 'frontend' ? 'Frontend' : 'Backend'} logo uploaded successfully.`
      })
      
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Error uploading logo:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload logo')
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleSetActive = (id: string, type: 'frontend' | 'backend') => {
    // Update logos to reflect the active state
    const updatedLogos = logos.map(logo => ({
      ...logo,
      active: logo.type === type ? logo.id === id : logo.active
    }))
    
    // Save to state and localStorage
    setLogos(updatedLogos)
    localStorage.setItem('logos', JSON.stringify(updatedLogos))
    
    setNotification({
      type: 'success',
      message: `${type === 'frontend' ? 'Frontend' : 'Backend'} logo updated successfully.`
    })
    
    setTimeout(() => setNotification(null), 3000)
  }
  
  const handleDeleteLogo = (id: string) => {
    // Get the logo to be deleted
    const logoToDelete = logos.find(logo => logo.id === id)
    
    if (!logoToDelete) return
    
    // Check if it's active
    if (logoToDelete.active) {
      setNotification({
        type: 'error',
        message: 'Cannot delete an active logo. Please set another logo as active first.'
      })
      setTimeout(() => setNotification(null), 3000)
      return
    }
    
    // Confirm deletion
    if (confirm('Are you sure you want to delete this logo?')) {
      const updatedLogos = logos.filter(logo => logo.id !== id)
      setLogos(updatedLogos)
      localStorage.setItem('logos', JSON.stringify(updatedLogos))
      
      setNotification({
        type: 'success',
        message: 'Logo deleted successfully.'
      })
      
      setTimeout(() => setNotification(null), 3000)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Logo Management</h1>
      
      {notification && (
        <div className={`mb-4 p-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' :
          notification.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {notification.message}
        </div>
      )}
      
      {uploadError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {uploadError}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Frontend Logo Section */}
        <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Frontend Logo</h2>
          <p className="text-sm text-gray-500 mb-4">
            This logo will be displayed in the website header and other frontend elements.
          </p>
          
          <div className="mb-6">
            <label htmlFor="frontendLogoUpload" className="block text-sm font-medium mb-2">
              Upload New Frontend Logo
            </label>
            <input
              type="file"
              id="frontendLogoUpload"
              accept=".svg,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => handleLogoUpload(e, 'frontend')}
              disabled={isUploading}
            />
            <label 
              htmlFor="frontendLogoUpload"
              className={`px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors cursor-pointer inline-block ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? 'Uploading...' : 'Choose File'}
            </label>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {logos
              .filter(logo => logo.type === 'frontend')
              .map(logo => (
                <div 
                  key={logo.id} 
                  className={`border rounded-lg overflow-hidden ${logo.active ? 'border-secondary ring-2 ring-secondary/30' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative p-4 flex items-center justify-center">
                    <Image 
                      src={logo.imageUrl} 
                      alt={logo.name}
                      width={200}
                      height={100}
                      className="max-w-full max-h-full object-contain"
                    />
                    
                    {logo.active && (
                      <div className="absolute top-2 right-2 bg-secondary text-white text-xs px-2 py-1 rounded">
                        Active
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium">{logo.name}</h3>
                    
                    {/* Logo Settings */}
                    <div className="mt-3 space-y-3">
                      {/* Size Setting */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Logo Size ({logo.size}px)
                        </label>
                        <input 
                          type="range" 
                          min="60" 
                          max="300" 
                          step="10"
                          value={logo.size}
                          onChange={(e) => {
                            const newSize = parseInt(e.target.value);
                            const updatedLogos = logos.map(l => 
                              l.id === logo.id ? {...l, size: newSize} : l
                            );
                            setLogos(updatedLogos);
                            localStorage.setItem('logos', JSON.stringify(updatedLogos));
                            window.dispatchEvent(new Event('storage'));
                          }}
                          className="w-full"
                        />
                      </div>
                      
                      {/* Text Option */}
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`useText-${logo.id}`} 
                          checked={logo.useText}
                          onChange={(e) => {
                            const updatedLogos = logos.map(l => 
                              l.id === logo.id ? {...l, useText: e.target.checked} : l
                            );
                            setLogos(updatedLogos);
                            localStorage.setItem('logos', JSON.stringify(updatedLogos));
                            window.dispatchEvent(new Event('storage'));
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`useText-${logo.id}`} className="text-sm">
                          Use Text Instead of Image
                        </label>
                      </div>
                      
                      {/* Text Input (only shown if useText is true) */}
                      {logo.useText && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Logo Text
                          </label>
                          <input 
                            type="text" 
                            value={logo.text}
                            onChange={(e) => {
                              const updatedLogos = logos.map(l => 
                                l.id === logo.id ? {...l, text: e.target.value} : l
                              );
                              setLogos(updatedLogos);
                              localStorage.setItem('logos', JSON.stringify(updatedLogos));
                              window.dispatchEvent(new Event('storage'));
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      {!logo.active && (
                        <button
                          onClick={() => handleSetActive(logo.id, 'frontend')}
                          className="px-3 py-1 text-sm bg-secondary/10 text-secondary rounded hover:bg-secondary/20 transition-colors"
                        >
                          Set as Active
                        </button>
                      )}
                      
                      {!logo.active && (
                        <button
                          onClick={() => handleDeleteLogo(logo.id)}
                          className="p-2 text-gray-500 hover:text-red-500"
                          aria-label="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        {/* Backend Logo Section */}
        <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Backend Logo</h2>
          <p className="text-sm text-gray-500 mb-4">
            This logo will be displayed in the admin dashboard and other backend elements.
          </p>
          
          <div className="mb-6">
            <label htmlFor="backendLogoUpload" className="block text-sm font-medium mb-2">
              Upload New Backend Logo
            </label>
            <input
              type="file"
              id="backendLogoUpload"
              accept=".svg,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => handleLogoUpload(e, 'backend')}
              disabled={isUploading}
            />
            <label 
              htmlFor="backendLogoUpload"
              className={`px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors cursor-pointer inline-block ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? 'Uploading...' : 'Choose File'}
            </label>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {logos
              .filter(logo => logo.type === 'backend')
              .map(logo => (
                <div 
                  key={logo.id} 
                  className={`border rounded-lg overflow-hidden ${logo.active ? 'border-secondary ring-2 ring-secondary/30' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative p-4 flex items-center justify-center">
                    <Image 
                      src={logo.imageUrl} 
                      alt={logo.name}
                      width={200}
                      height={100}
                      className="max-w-full max-h-full object-contain"
                    />
                    
                    {logo.active && (
                      <div className="absolute top-2 right-2 bg-secondary text-white text-xs px-2 py-1 rounded">
                        Active
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium">{logo.name}</h3>
                    
                    {/* Logo Settings */}
                    <div className="mt-3 space-y-3">
                      {/* Size Setting */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Logo Size ({logo.size}px)
                        </label>
                        <input 
                          type="range" 
                          min="60" 
                          max="300" 
                          step="10"
                          value={logo.size}
                          onChange={(e) => {
                            const newSize = parseInt(e.target.value);
                            const updatedLogos = logos.map(l => 
                              l.id === logo.id ? {...l, size: newSize} : l
                            );
                            setLogos(updatedLogos);
                            localStorage.setItem('logos', JSON.stringify(updatedLogos));
                            window.dispatchEvent(new Event('storage'));
                          }}
                          className="w-full"
                        />
                      </div>
                      
                      {/* Text Option */}
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`useText-${logo.id}`} 
                          checked={logo.useText}
                          onChange={(e) => {
                            const updatedLogos = logos.map(l => 
                              l.id === logo.id ? {...l, useText: e.target.checked} : l
                            );
                            setLogos(updatedLogos);
                            localStorage.setItem('logos', JSON.stringify(updatedLogos));
                            window.dispatchEvent(new Event('storage'));
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`useText-${logo.id}`} className="text-sm">
                          Use Text Instead of Image
                        </label>
                      </div>
                      
                      {/* Text Input (only shown if useText is true) */}
                      {logo.useText && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Logo Text
                          </label>
                          <input 
                            type="text" 
                            value={logo.text}
                            onChange={(e) => {
                              const updatedLogos = logos.map(l => 
                                l.id === logo.id ? {...l, text: e.target.value} : l
                              );
                              setLogos(updatedLogos);
                              localStorage.setItem('logos', JSON.stringify(updatedLogos));
                              window.dispatchEvent(new Event('storage'));
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      {!logo.active && (
                        <button
                          onClick={() => handleSetActive(logo.id, 'backend')}
                          className="px-3 py-1 text-sm bg-secondary/10 text-secondary rounded hover:bg-secondary/20 transition-colors"
                        >
                          Set as Active
                        </button>
                      )}
                      
                      {!logo.active && (
                        <button
                          onClick={() => handleDeleteLogo(logo.id)}
                          className="p-2 text-gray-500 hover:text-red-500"
                          aria-label="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Note: Changes are saved to the browser for demo purposes. In a production environment, these would be saved to a database.</p>
      </div>
    </div>
  )
}
