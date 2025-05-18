"use client"

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CreativeWireframeModelProps {
  scale?: number;
  color?: string;
  rotation?: [number, number, number];
}

export function CreativeWireframeModel({ 
  scale = 1, 
  color = "#6C63FF",
  rotation = [0, 0, 0]
}: CreativeWireframeModelProps) {
  const groupRef = useRef<THREE.Group>(null!)
  
  // Create references for each shape
  const dodecahedronRef = useRef<THREE.Mesh>(null!)
  const torusRef = useRef<THREE.Mesh>(null!)
  const icosahedronRef = useRef<THREE.Mesh>(null!)
  const ringRef = useRef<THREE.Mesh>(null!)
  
  // Create wireframe references
  const dodecahedronWireframeRef = useRef<THREE.LineSegments>(null!)
  const torusWireframeRef = useRef<THREE.LineSegments>(null!)
  const icosahedronWireframeRef = useRef<THREE.LineSegments>(null!)
  const ringWireframeRef = useRef<THREE.LineSegments>(null!)
  
  // Create geometries
  const { 
    dodecahedronGeometry, 
    torusGeometry, 
    icosahedronGeometry,
    ringGeometry
  } = useMemo(() => {
    return {
      dodecahedronGeometry: new THREE.DodecahedronGeometry(1, 0),
      torusGeometry: new THREE.TorusGeometry(1.5, 0.2, 16, 32),
      icosahedronGeometry: new THREE.IcosahedronGeometry(0.7, 0),
      ringGeometry: new THREE.RingGeometry(2, 2.2, 32)
    }
  }, [])
  
  // Create wireframe geometries
  const { 
    dodecahedronWireframeGeometry, 
    torusWireframeGeometry, 
    icosahedronWireframeGeometry,
    ringWireframeGeometry
  } = useMemo(() => {
    return {
      dodecahedronWireframeGeometry: new THREE.WireframeGeometry(dodecahedronGeometry),
      torusWireframeGeometry: new THREE.WireframeGeometry(torusGeometry),
      icosahedronWireframeGeometry: new THREE.WireframeGeometry(icosahedronGeometry),
      ringWireframeGeometry: new THREE.WireframeGeometry(ringGeometry)
    }
  }, [dodecahedronGeometry, torusGeometry, icosahedronGeometry, ringGeometry])
  
  // Animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Main group gentle rotation
      groupRef.current.rotation.y += delta * 0.15
      
      // Slight bobbing motion
      const time = state.clock.getElapsedTime()
      const bobHeight = Math.sin(time * 0.5) * 0.1
      groupRef.current.position.y = bobHeight
      
      // Individual shape animations
      if (dodecahedronRef.current) {
        dodecahedronRef.current.rotation.x += delta * 0.2
        dodecahedronRef.current.rotation.z += delta * 0.1
      }
      
      if (torusRef.current) {
        torusRef.current.rotation.x += delta * 0.1
      }
      
      if (icosahedronRef.current) {
        icosahedronRef.current.rotation.y += delta * 0.3
        icosahedronRef.current.rotation.z += delta * 0.2
      }
      
      if (ringRef.current) {
        ringRef.current.rotation.x = Math.PI / 2 // Keep it flat
        ringRef.current.rotation.z += delta * 0.05
      }
    }
  })

  // Calculate model scale
  const modelScale = [scale, scale, scale] as [number, number, number]

  return (
    <group 
      ref={groupRef} 
      scale={modelScale}
      rotation={rotation}
    >
      {/* Center dodecahedron */}
      <group position={[0, 0, 0]}>
        <mesh ref={dodecahedronRef} castShadow>
          <primitive object={dodecahedronGeometry} attach="geometry" />
          <meshStandardMaterial 
            color={color}
            transparent={true}
            opacity={0.6}
            metalness={0.8}
            roughness={0.2}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Dodecahedron wireframe */}
        <lineSegments ref={dodecahedronWireframeRef}>
          <primitive object={dodecahedronWireframeGeometry} attach="geometry" />
          <lineBasicMaterial 
            color="#ffffff" 
            transparent={true}
            opacity={0.7}
            linewidth={1}
          />
        </lineSegments>
      </group>
      
      {/* Orbiting torus */}
      <group position={[0, 0, 0]} rotation={[Math.PI / 4, 0, 0]}>
        <mesh ref={torusRef} castShadow>
          <primitive object={torusGeometry} attach="geometry" />
          <meshStandardMaterial 
            color={color}
            transparent={true}
            opacity={0.5}
            metalness={0.8}
            roughness={0.2}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Torus wireframe */}
        <lineSegments ref={torusWireframeRef}>
          <primitive object={torusWireframeGeometry} attach="geometry" />
          <lineBasicMaterial 
            color="#ffffff" 
            transparent={true}
            opacity={0.7}
            linewidth={1}
          />
        </lineSegments>
      </group>
      
      {/* Orbiting icosahedron */}
      <group position={[1.2, 1.2, 0]}>
        <mesh ref={icosahedronRef} castShadow>
          <primitive object={icosahedronGeometry} attach="geometry" />
          <meshStandardMaterial 
            color={color}
            transparent={true}
            opacity={0.7}
            metalness={0.8}
            roughness={0.2}
            emissive={color}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Icosahedron wireframe */}
        <lineSegments ref={icosahedronWireframeRef}>
          <primitive object={icosahedronWireframeGeometry} attach="geometry" />
          <lineBasicMaterial 
            color="#ffffff" 
            transparent={true}
            opacity={0.8}
            linewidth={1}
          />
        </lineSegments>
      </group>
      
      {/* Outer ring */}
      <group position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh ref={ringRef} castShadow>
          <primitive object={ringGeometry} attach="geometry" />
          <meshStandardMaterial 
            color={color}
            transparent={true}
            opacity={0.4}
            metalness={0.8}
            roughness={0.2}
            emissive={color}
            emissiveIntensity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Ring wireframe */}
        <lineSegments ref={ringWireframeRef}>
          <primitive object={ringWireframeGeometry} attach="geometry" />
          <lineBasicMaterial 
            color="#ffffff" 
            transparent={true}
            opacity={0.6}
            linewidth={1}
          />
        </lineSegments>
      </group>
      
      {/* Add some particles for extra visual interest */}
      {[...Array(20)].map((_, i) => {
        const theta = Math.random() * Math.PI * 2
        const radius = 2 + Math.random() * 1.5
        const x = Math.cos(theta) * radius
        const y = (Math.random() - 0.5) * 2
        const z = Math.sin(theta) * radius
        const size = 0.05 + Math.random() * 0.1
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshStandardMaterial 
              color={color}
              emissive={color}
              emissiveIntensity={1}
            />
          </mesh>
        )
      })}
    </group>
  )
}
