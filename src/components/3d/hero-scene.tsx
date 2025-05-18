"use client"

import { useState, useEffect, Suspense, ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Environment, ContactShadows, useGLTF } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { PlaceholderModel } from './placeholder-model'
import { CreativeWireframeModel } from './creative-wireframe-model'
import { Model3D } from '@/data/models'

// Interface for model settings
interface ModelSettings {
  sizeMultiplier: number; // Multiplier for model size (1.0 = default)
}

// Simple ErrorBoundary component for handling 3D model loading errors
function ErrorBoundary({ children, fallback }: { children: ReactNode, fallback: ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Add event listener for 3D model loading errors
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Component to load and display a 3D model
function Model({ url, position, rotation, scale }: { url: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number] }) {
  const [hasError, setHasError] = useState(false);
  const [autoScale, setAutoScale] = useState<[number, number, number]>(scale);
  const [autoPosition, setAutoPosition] = useState<[number, number, number]>(position);
  
  // Always define all hooks at the top level, before any conditional returns
  const validUrl = url && url !== '' && url.startsWith('/');
  const gltf = useGLTF(validUrl ? url : '/models/placeholder.glb');
  const modelData = validUrl ? gltf : null;
  
  // Reset error state when URL changes
  useEffect(() => {
    setHasError(false);
  }, [url]);
  
  // Auto-fit the model when it loads
  useEffect(() => {
    if (modelData && modelData.scene) {
      try {
        // Calculate bounding box to determine model size
        const box = new THREE.Box3().setFromObject(modelData.scene);
        const size = box.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        
        // Adjust scale to fit the model within the frame
        // Base scale on the largest dimension to maintain aspect ratio
        const targetSize = 2.76 * 0.92; // Target size in the scene (reduced by 8% from previous size)
        const adjustedScale = targetSize / maxDimension;
        
        // Apply the adjusted scale while maintaining the original proportions
        const baseScale = Math.min(scale[0], scale[1], scale[2]);
        setAutoScale([
          baseScale * adjustedScale,
          baseScale * adjustedScale,
          baseScale * adjustedScale
        ]);
        
        // Adjust position to center the model
        const center = box.getCenter(new THREE.Vector3());
        setAutoPosition([
          position[0] - center.x * adjustedScale,
          position[1] - center.y * adjustedScale,
          position[2] - center.z * adjustedScale
        ]);
      } catch (error) {
        console.error('Error calculating model dimensions:', error);
        setHasError(true);
      }
    }
  }, [modelData, scale, position]);
  
  // Handle error cases
  if (hasError || !url || url === '' || !url.startsWith('/') || !modelData) {
    console.log('Rendering placeholder due to error or invalid URL');
    return <PlaceholderModel scale={scale[0]} />;
  }
  
  // Render the 3D model
  return (
    <primitive 
      object={modelData.scene} 
      position={autoPosition} 
      rotation={rotation} 
      scale={autoScale} 
      onError={() => {
        console.error('Error in primitive');
        setHasError(true);
      }}
    />
  );
}

export function HeroScene() {
  const [activeModel, setActiveModel] = useState<Model3D | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    sizeMultiplier: 1.0
  })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Load active 3D model from localStorage
    const loadActiveModel = () => {
      try {
        // Check if we have stored models in localStorage
        const storedModels = localStorage.getItem('3dModels')
        if (storedModels) {
          const models = JSON.parse(storedModels) as Model3D[]
          const active = models.find(model => model.isActive)
          if (active) {
            // Validate model data before setting
            if (active.modelUrl && 
                Array.isArray(active.position) && active.position.length === 3 &&
                Array.isArray(active.rotation) && active.rotation.length === 3 &&
                Array.isArray(active.scale) && active.scale.length === 3) {
              setActiveModel(active)
            } else {
              console.error('Invalid model data:', active)
              setActiveModel(null)
            }
          }
        } else {
          // No models stored, use placeholder
          setActiveModel(null)
        }
        
        // Load model settings if available
        const storedModelSettings = localStorage.getItem('modelSettings')
        if (storedModelSettings) {
          setModelSettings(JSON.parse(storedModelSettings))
        }
      } catch (error) {
        console.error('Error loading active model:', error)
        setHasError(true)
        setActiveModel(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadActiveModel()
    
    // Listen for storage events to update the model when changed in admin
    const handleStorageChange = () => {
      loadActiveModel()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // No reset function needed here as it's moved to the admin panel
  
  // Return an error message if there was an error loading the model
  if (hasError) {
    return (
      <div className="w-full h-[50vh] md:h-[60vh] lg:h-[70vh] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center p-8">
          <h3 className="text-xl font-bold text-red-500 mb-2">Error Loading 3D Model</h3>
          <p className="text-gray-600 dark:text-gray-300">There was a problem loading the 3D model. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 0 : 1 }}
      transition={{ duration: 1 }}
      className="w-full h-[50vh] md:h-[60vh] lg:h-[70vh]"
    >
      <Canvas 
        shadows
        camera={{ position: [0, 0, 10], fov: 40 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <directionalLight position={[0, 5, 5]} intensity={0.6} castShadow />
        <pointLight position={[5, 0, 5]} intensity={0.3} color="#6C63FF" />
        
        <Float
          speed={1.2}
          rotationIntensity={0.1}
          floatIntensity={0.3}
        >
          <Suspense fallback={<mesh>
            <octahedronGeometry args={[2, 0]} />
            <meshStandardMaterial color="#6C63FF" />
          </mesh>}>
            {activeModel ? (
              <ErrorBoundary fallback={<PlaceholderModel scale={1.5} />}>
                <Suspense fallback={null}>
                  <Model 
                    url={activeModel.modelUrl} 
                    position={activeModel.position} 
                    rotation={activeModel.rotation} 
                    scale={[
                      activeModel.scale[0] * modelSettings.sizeMultiplier,
                      activeModel.scale[1] * modelSettings.sizeMultiplier,
                      activeModel.scale[2] * modelSettings.sizeMultiplier
                    ]} 
                  />
                </Suspense>
              </ErrorBoundary>
            ) : (
              <CreativeWireframeModel scale={1.5} color="#6C63FF" rotation={[0, Math.PI * 0.25, 0]} />
            )}
          </Suspense>
        </Float>
        
        <ContactShadows 
          position={[0, -3, 0]} 
          opacity={0.3} 
          scale={12} 
          blur={2.5} 
          far={4} 
        />
        
        <Environment preset="city" />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
          rotateSpeed={0.5}
          autoRotate={!isMobile} // Auto-rotate when not on mobile
          autoRotateSpeed={0.5} // Slow auto-rotation
          target={[0, 0, 0]}
          // Allow full orbit around the object
          minAzimuthAngle={-Math.PI} 
          maxAzimuthAngle={Math.PI}
        />
      </Canvas>
    </motion.div>
  )
}
