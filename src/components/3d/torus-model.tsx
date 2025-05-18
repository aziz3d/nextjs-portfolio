"use client"

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface TorusModelProps {
  scale?: number;
  wireframe?: boolean;
}

export function TorusModel({ scale = 1, wireframe = true }: TorusModelProps) {
  const torusRef = useRef<THREE.Mesh>(null!)
  
  useFrame((state, delta) => {
    if (torusRef.current) {
      // Rotate the torus
      torusRef.current.rotation.x += delta * 0.2
      torusRef.current.rotation.y += delta * 0.3
      
      // Slight bobbing motion
      const time = state.clock.getElapsedTime()
      torusRef.current.position.y = Math.sin(time * 0.5) * 0.1
    }
  })

  // Calculate model scale
  const modelScale = scale || 1

  return (
    <mesh ref={torusRef} scale={[modelScale, modelScale, modelScale]} position={[0, 0, 0]}>
      <torusGeometry args={[2, 0.5, 32, 100]} />
      <meshStandardMaterial 
        color="#6C63FF" 
        wireframe={wireframe} 
        emissive="#6C63FF"
        emissiveIntensity={0.3}
        metalness={0.8} 
        roughness={0.2} 
      />
    </mesh>
  )
}
