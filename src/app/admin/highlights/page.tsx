'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { HighlightsConfig, HighlightStat, defaultHighlightsConfig, getHighlightsConfig, saveHighlightsConfig, migrateHighlightsData } from '@/data/highlights'

export default function HighlightsAdmin() {
  const { status } = useSession()
  const router = useRouter()
  const [config, setConfig] = useState<HighlightsConfig>(defaultHighlightsConfig)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [newStat, setNewStat] = useState<HighlightStat>({
    id: '',
    icon: 'star',
    value: 0,
    label: '',
    active: true
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    const fetchHighlightsConfig = async () => {
      try {
        setIsLoading(true)
        
        // Migrate old data format to new format if needed
        migrateHighlightsData()
        
        // Get the highlights configuration
        const highlightsConfig = getHighlightsConfig()
        setConfig(highlightsConfig)
      } catch (error) {
        console.error('Error fetching highlights config:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Listen for storage events
    const handleStorageChange = (e?: StorageEvent) => {
      // If it's a storage event, check if it's for our key
      if (e && e.key !== null && e.key !== 'highlightsConfig') {
        return
      }
      
      const highlightsConfig = getHighlightsConfig()
      setConfig(highlightsConfig)
    }
    
    // Custom event handler for our specific event
    const handleCustomStorageEvent = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.key === 'highlightsConfig') {
        const highlightsConfig = getHighlightsConfig()
        setConfig(highlightsConfig)
      }
    }
    
    if (status === 'authenticated') {
      fetchHighlightsConfig()
      window.addEventListener('storage', handleStorageChange)
      document.addEventListener('custom-storage-event', handleCustomStorageEvent as EventListener)
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('custom-storage-event', handleCustomStorageEvent as EventListener)
    }
  }, [status, router])
  
  const handleTitleChange = (title: string) => {
    setConfig(prev => ({ ...prev, title }))
  }
  
  const handleDescriptionChange = (description: string) => {
    setConfig(prev => ({ ...prev, description }))
  }
  
  const handleToggleActive = (id: string) => {
    setConfig(prev => ({
      ...prev,
      stats: prev.stats.map(stat => 
        stat.id === id ? { ...stat, active: !stat.active } : stat
      )
    }))
  }
  
  const handleValueChange = (id: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      stats: prev.stats.map(stat => 
        stat.id === id ? { ...stat, value } : stat
      )
    }))
  }
  
  const handleLabelChange = (id: string, label: string) => {
    setConfig(prev => ({
      ...prev,
      stats: prev.stats.map(stat => 
        stat.id === id ? { ...stat, label } : stat
      )
    }))
  }
  
  const handleIconChange = (id: string, icon: string) => {
    setConfig(prev => ({
      ...prev,
      stats: prev.stats.map(stat => 
        stat.id === id ? { ...stat, icon } : stat
      )
    }))
  }
  
  const handleAddStat = () => {
    if (!newStat.label.trim()) {
      setMessage({ type: 'error', text: 'Please provide a label for the new stat' })
      return
    }
    
    // Generate a unique ID based on timestamp
    const newStatWithId = {
      ...newStat,
      id: `stat-${Date.now()}`
    }
    
    setConfig(prev => ({
      ...prev,
      stats: [...prev.stats, newStatWithId]
    }))
    
    // Reset the new stat form
    setNewStat({
      id: '',
      icon: 'star',
      value: 0,
      label: '',
      active: true
    })
    
    setMessage({ type: 'success', text: 'New stat added! Don\'t forget to save your changes.' })
  }
  
  const handleRemoveStat = (id: string) => {
    if (window.confirm('Are you sure you want to remove this stat?')) {
      setConfig(prev => ({
        ...prev,
        stats: prev.stats.filter(stat => stat.id !== id)
      }))
      setMessage({ type: 'success', text: 'Stat removed! Don\'t forget to save your changes.' })
    }
  }
  
  const handleNewStatChange = (field: keyof HighlightStat, value: string | number | boolean) => {
    setNewStat(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleSave = async () => {
    try {
      setIsSaving(true)
      setMessage({ type: '', text: '' })
      
      // Save to localStorage using our helper function
      saveHighlightsConfig(config)
      
      // Force a manual refresh of the data to ensure it's saved properly
      localStorage.setItem('highlightsConfig', JSON.stringify(config))
      
      // Manually trigger both events to ensure all components update
      window.dispatchEvent(new Event('storage'))
      document.dispatchEvent(new CustomEvent('custom-storage-event', { 
        detail: { key: 'highlightsConfig', action: 'update' } 
      }))
      
      setMessage({ type: 'success', text: 'Highlights configuration saved successfully!' })
    } catch (error) {
      console.error('Error saving highlights configuration:', error)
      setMessage({ type: 'error', text: 'Failed to save highlights configuration' })
    } finally {
      setIsSaving(false)
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
    <div className="relative pb-20">
      {/* Floating save button */}
      <div className="fixed bottom-6 right-6 z-10 flex flex-col items-end space-y-2">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg px-4 py-2 text-sm">
          Remember to save your changes!
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center"
        >
          <span className="material-icons mr-2">{isSaving ? 'hourglass_top' : 'save'}</span>
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="heading-lg">Portfolio Highlights</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'error' 
            ? 'bg-red-100 text-red-700 border border-red-400' 
            : 'bg-green-100 text-green-700 border border-green-400'
        }`}>
          {message.text}
        </div>
      )}
      
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Manage the content displayed in the Portfolio Highlights section. Edit the title and description, toggle stats on/off, update values, and customize labels.
      </p>
      
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="heading-md mb-4">Section Content</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Section Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Section Description</label>
            <textarea
              value={config.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="heading-md">Statistics</h2>
        <span className="text-sm text-gray-500">{config.stats.length} stats total, {config.stats.filter(s => s.active).length} active</span>
      </div>
      
      {/* Add New Stat Form */}
      <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 mb-8 border-2 border-dashed border-secondary/30">
        <h3 className="heading-sm mb-4">Add New Stat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Label *</label>
            <input
              type="text"
              value={newStat.label}
              onChange={(e) => handleNewStatChange('label', e.target.value)}
              placeholder="e.g., Web Projects"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Value</label>
            <input
              type="number"
              value={newStat.value}
              onChange={(e) => handleNewStatChange('value', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Icon</label>
            <select
              value={newStat.icon}
              onChange={(e) => handleNewStatChange('icon', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="computer">Computer</option>
              <option value="link">Link</option>
              <option value="3d_rotation">3D</option>
              <option value="calendar_today">Calendar</option>
              <option value="code">Code</option>
              <option value="people">People</option>
              <option value="star">Star</option>
              <option value="work">Work</option>
              <option value="school">Education</option>
              <option value="lightbulb">Idea</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="relative inline-flex items-center cursor-pointer mr-4">
              <input 
                type="checkbox" 
                checked={newStat.active}
                onChange={(e) => handleNewStatChange('active', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-secondary"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Active
              </span>
            </label>
            
            <button
              onClick={handleAddStat}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Add Stat
            </button>
          </div>
        </div>
      </div>
      
      {/* Existing Stats */}
      <h3 className="heading-sm mb-4">Existing Stats</h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.stats.map((stat: HighlightStat) => (
            <div key={stat.id} className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 relative group">
              {/* Remove button */}
              <button 
                onClick={() => handleRemoveStat(stat.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                title="Remove stat"
              >
                <span className="material-icons text-sm">delete</span>
              </button>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <span className="material-icons text-secondary text-2xl mr-2">
                    {stat.icon}
                  </span>
                  <h3 className="heading-md">{stat.label}</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={stat.active}
                    onChange={() => handleToggleActive(stat.id)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-secondary"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {stat.active ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Icon</label>
                  <select
                    value={stat.icon}
                    onChange={(e) => handleIconChange(stat.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="computer">Computer</option>
                    <option value="link">Link</option>
                    <option value="3d_rotation">3D</option>
                    <option value="calendar_today">Calendar</option>
                    <option value="code">Code</option>
                    <option value="people">People</option>
                    <option value="star">Star</option>
                    <option value="work">Work</option>
                    <option value="school">Education</option>
                    <option value="lightbulb">Idea</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <input
                    type="number"
                    value={stat.value}
                    onChange={(e) => handleValueChange(stat.id, parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Label</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => handleLabelChange(stat.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
