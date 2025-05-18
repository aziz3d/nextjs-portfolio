"use client"

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function DefaultModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null!)
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotate the model
      groupRef.current.rotation.y += delta * 0.2
      
      // Slight bobbing motion
      const time = state.clock.getElapsedTime()
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.1
    }
  })

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Main cube */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial 
          color="#6C63FF" 
          metalness={0.8}
          roughness={0.2}
          emissive="#6C63FF"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Orbiting spheres */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI) / 2
        const radius = 2
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh 
            key={i} 
            position={[x, 0, z]}
            castShadow
          >
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial 
              color="#FF6C6C" 
              emissive="#FF6C6C"
              emissiveIntensity={0.5}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        )
      })}
      
      {/* Floating rings */}
      <mesh position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1, 0.2, 16, 32]} />
        <meshStandardMaterial 
          color="#63FFFC" 
          metalness={0.7}
          roughness={0.3}
          emissive="#63FFFC"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <mesh position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1, 0.2, 16, 32]} />
        <meshStandardMaterial 
          color="#FFEB3B" 
          metalness={0.7}
          roughness={0.3}
          emissive="#FFEB3B"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}
