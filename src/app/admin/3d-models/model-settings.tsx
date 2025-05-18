'use client'

import { useState, useEffect } from 'react'

// Interface for model settings
interface ModelSettings {
  sizeMultiplier: number; // Multiplier for model size (1.0 = default)
}

export default function ModelSettingsManager() {
  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    sizeMultiplier: 1.0
  })
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  useEffect(() => {
    // Load model settings from localStorage if available
    const loadModelSettings = () => {
      try {
        const storedSettings = localStorage.getItem('modelSettings')
        if (storedSettings) {
          setModelSettings(JSON.parse(storedSettings))
        }
      } catch (error) {
        console.error('Error loading model settings:', error)
      }
    }

    loadModelSettings()
  }, [])

  const handleSaveSettings = () => {
    try {
      // Save settings to localStorage
      localStorage.setItem('modelSettings', JSON.stringify(modelSettings))
      
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event('storage'))
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Model settings saved successfully'
      })
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Error saving model settings:', error)
      setNotification({
        type: 'error',
        message: 'Failed to save model settings'
      })
    }
  }

  return (
    <div className="bg-white dark:bg-primary/40 rounded-xl shadow-lg p-6 mb-6">
      <h2 className="heading-md mb-4">3D Model Display Settings</h2>
      
      {notification && (
        <div className={`mb-4 p-3 rounded-lg ${notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {notification.message}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Model Size Multiplier ({modelSettings.sizeMultiplier.toFixed(1)}x)
          </label>
          <input 
            type="range" 
            min="0.5" 
            max="2.0" 
            step="0.1"
            value={modelSettings.sizeMultiplier}
            onChange={(e) => setModelSettings({
              ...modelSettings,
              sizeMultiplier: parseFloat(e.target.value)
            })}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            Adjust the size of the 3D model in the hero section (1.0 = default size)
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
