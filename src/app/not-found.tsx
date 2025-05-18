"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Text3D, Center } from '@react-three/drei'

// 3D Error Model
function ErrorModel() {
  return (
    <Float
      speed={1.5}
      rotationIntensity={0.2}
      floatIntensity={0.5}
    >
      <group>
        {/* 404 Text */}
        <Center>
          <Text3D
            font="/fonts/Inter_Bold.json"
            size={1.5}
            height={0.2}
            curveSegments={12}
          >
            404
            <meshStandardMaterial color="#6C63FF" emissive="#6C63FF" emissiveIntensity={0.5} />
          </Text3D>
        </Center>
        
        {/* Glitchy particles around the text */}
        {Array.from({ length: 50 }).map((_, i) => (
          <mesh key={i} position={[
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
          ]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color="#FF6C6C" emissive="#FF6C6C" emissiveIntensity={0.8} />
          </mesh>
        ))}
      </group>
    </Float>
  )
}

// Fallback component if WebGL is not supported
function Fallback404() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <h1 className="text-9xl font-bold text-secondary">404</h1>
    </div>
  )
}

export default function NotFound() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-primary">
      <div className="w-full h-[40vh] mb-8">
        {isClient ? (
          <ErrorBoundary>
            <Canvas
              camera={{ position: [0, 0, 5], fov: 50 }}
              className="w-full h-full"
            >
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
              <ErrorModel />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
          </ErrorBoundary>
        ) : (
          <Fallback404 />
        )}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center px-4"
      >
        <h1 className="heading-lg mb-4">Page Not Found</h1>
        <p className="body-lg text-text/70 dark:text-background/70 mb-8 max-w-md mx-auto">
          Oops! It seems like you&apos;ve ventured into the digital void. The page you&apos;re looking for has either been moved, deleted, or never existed.
        </p>
        
        <Link 
          href="/"
          className="px-6 py-3 bg-secondary text-white font-medium rounded-lg hover:bg-secondary/90 transition-colors inline-flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Return Home
        </Link>
      </motion.div>
    </div>
  )
}

// Error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <Fallback404 />;
  }

  return <>{children}</>;
}
