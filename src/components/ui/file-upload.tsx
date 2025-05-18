'use client'

import { useState, useRef } from 'react'

interface FileUploadProps {
  onUploadComplete: (filePath: string) => void
  fileType: string
  acceptedFileTypes?: string
  buttonText?: string
  className?: string
}

export default function FileUpload({
  onUploadComplete,
  fileType,
  acceptedFileTypes = "image/*",
  buttonText = "Upload File",
  className = ""
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(10)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', fileType)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setUploadProgress(100)
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Notify parent component
      onUploadComplete(data.filePath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center">
        <label
          className={`
            px-4 py-2 rounded-lg cursor-pointer text-sm font-medium
            ${isUploading 
              ? 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300' 
              : 'bg-secondary text-white hover:bg-secondary/90 transition-colors'
            }
          `}
        >
          {isUploading ? 'Uploading...' : buttonText}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedFileTypes}
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>

      {isUploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-secondary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs mt-1 text-gray-500">Uploading: {uploadProgress}%</p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  )
}
