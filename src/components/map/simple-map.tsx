'use client'

import React from 'react'
import Image from 'next/image'

interface SimpleMapProps {
  latitude: number
  longitude: number
  zoom?: number
  width?: string
  height?: string
  title?: string
  className?: string
}

export function SimpleMap({
  latitude,
  longitude,
  zoom = 15,
  width = '100%',
  height = '400px',
  title = 'Location Map',
  className = ''
}: SimpleMapProps) {
  // OpenStreetMap URL format
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`
  
  return (
    <div className={`map-container ${className}`} style={{ width, height }}>
      <iframe
        title={title}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={mapUrl}
        style={{ border: '1px solid #ccc', borderRadius: '8px' }}
      />
      <div className="text-xs text-right mt-1 text-gray-500">
        <a 
          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}//${latitude}/${longitude}`} 
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          View Larger Map
        </a>
      </div>
    </div>
  )
}

// Alternative implementation using a static image from OpenStreetMap
export function StaticMap({
  latitude,
  longitude,
  zoom = 15,
  width = '100%',
  height = '400px',
  title = 'Location Map',
  className = ''
}: SimpleMapProps) {
  // Static map URL from OpenStreetMap
  const staticMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=600x400&maptype=mapnik&markers=${latitude},${longitude},red-pushpin`

  return (
    <div className={`map-container ${className}`} style={{ width, height }}>
      <Image
        src={staticMapUrl}
        alt={title}
        fill
        style={{ 
          objectFit: 'cover',
          border: '1px solid #ccc', 
          borderRadius: '0.5rem'
        }}
      />
      <div className="text-xs text-right mt-1 text-gray-500">
        <a 
          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}//${latitude}/${longitude}`} 
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          View Larger Map
        </a>
      </div>
    </div>
  )
}
