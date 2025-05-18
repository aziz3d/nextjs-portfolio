"use client"

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface LaptopModelProps {
  scale?: number;
  wireframe?: boolean;
  color?: string;
  rotation?: [number, number, number];
}

export function LaptopModel({ 
  scale = 1, 
  wireframe = true, 
  color = "#6C63FF",
  rotation = [0, 0, 0]
}: LaptopModelProps) {
  const meshRef = useRef<THREE.Group>(null!)
  const screenWireframeRef = useRef<THREE.LineSegments>(null!)
  const baseWireframeRef = useRef<THREE.LineSegments>(null!)
  
  // Create laptop geometries
  const { screenGeometry, baseGeometry } = useMemo(() => {
    // Screen part (slightly thinner box)
    const screen = new THREE.BoxGeometry(2, 1.2, 0.08)
    
    // Base part (slightly thicker box)
    const base = new THREE.BoxGeometry(2, 0.1, 1.4)
    
    return { screenGeometry: screen, baseGeometry: base }
  }, [])
  
  // Create wireframe geometries
  const { screenWireframeGeometry, baseWireframeGeometry } = useMemo(() => {
    return {
      screenWireframeGeometry: new THREE.WireframeGeometry(screenGeometry),
      baseWireframeGeometry: new THREE.WireframeGeometry(baseGeometry)
    }
  }, [screenGeometry, baseGeometry])
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y += delta * 0.15
      
      // Slight bobbing motion
      const time = state.clock.getElapsedTime()
      const bobHeight = Math.sin(time * 0.5) * 0.1
      meshRef.current.position.y = bobHeight
    }
  })

  // Calculate model scale
  const modelScale = [scale, scale, scale] as [number, number, number]

  return (
    <group 
      ref={meshRef} 
      scale={modelScale}
      rotation={rotation}
    >
      {/* Screen part */}
      <group position={[0, 0.7, 0]} rotation={[Math.PI * -0.1, 0, 0]}>
        <mesh castShadow receiveShadow>
          <primitive object={screenGeometry} attach="geometry" />
          <meshStandardMaterial 
            color={color}
            transparent={true}
            opacity={0.85}
            metalness={0.8}
            roughness={0.2}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Screen wireframe */}
        {wireframe && (
          <lineSegments ref={screenWireframeRef}>
            <primitive object={screenWireframeGeometry} attach="geometry" />
            <lineBasicMaterial 
              color="#ffffff" 
              transparent={true}
              opacity={0.7}
              linewidth={1}
            />
          </lineSegments>
        )}
      </group>
      
      {/* Base part */}
      <group position={[0, 0, 0.7]}>
        <mesh castShadow receiveShadow>
          <primitive object={baseGeometry} attach="geometry" />
          <meshStandardMaterial 
            color={color}
            transparent={true}
            opacity={0.85}
            metalness={0.8}
            roughness={0.2}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Base wireframe */}
        {wireframe && (
          <lineSegments ref={baseWireframeRef}>
            <primitive object={baseWireframeGeometry} attach="geometry" />
            <lineBasicMaterial 
              color="#ffffff" 
              transparent={true}
              opacity={0.7}
              linewidth={1}
            />
          </lineSegments>
        )}
      </group>
    </group>
  )
}
