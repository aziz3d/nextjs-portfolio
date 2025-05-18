"use client"

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface KnottedTorusModelProps {
  scale?: number;
  wireframe?: boolean;
  color?: string;
  tubeRadius?: number;
  tubeSegments?: number;
  radialSegments?: number;
  p?: number;
  q?: number;
}

export function KnottedTorusModel({ 
  scale = 1, 
  color = "#6C63FF",
  tubeRadius = 0.35,
  tubeSegments = 128,
  radialSegments = 32,
  p = 2,
  q = 3
}: KnottedTorusModelProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const wireframeRef = useRef<THREE.LineSegments>(null!)
  
  // Create a parametric knot geometry
  const geometry = useMemo(() => {
    // TorusKnot parameters:
    // p: number of times the knot winds around its axis of rotational symmetry
    // q: number of times the knot winds around an interior circle
    return new THREE.TorusKnotGeometry(1.5, tubeRadius, tubeSegments, radialSegments, p, q)
  }, [tubeRadius, tubeSegments, radialSegments, p, q])
  
  // Create wireframe geometry
  const wireframeGeometry = useMemo(() => {
    return new THREE.WireframeGeometry(geometry)
  }, [geometry])
  
  useFrame((state, delta) => {
    if (meshRef.current && wireframeRef.current) {
      // Rotate the model
      meshRef.current.rotation.x += delta * 0.1
      meshRef.current.rotation.y += delta * 0.15
      
      // Keep wireframe in sync with the mesh
      wireframeRef.current.rotation.copy(meshRef.current.rotation)
      
      // Slight bobbing motion
      const time = state.clock.getElapsedTime()
      const bobHeight = Math.sin(time * 0.5) * 0.1
      meshRef.current.position.y = bobHeight
      wireframeRef.current.position.y = bobHeight
    }
  })

  // Calculate model scale
  const modelScale = [scale, scale, scale] as [number, number, number]

  return (
    <group>
      {/* Main mesh with material */}
      <mesh 
        ref={meshRef} 
        scale={modelScale} 
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={geometry} attach="geometry" />
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
      
      {/* Wireframe overlay */}
      <lineSegments 
        ref={wireframeRef} 
        scale={modelScale} 
        position={[0, 0, 0]}
      >
        <primitive object={wireframeGeometry} attach="geometry" />
        <lineBasicMaterial 
          color="#ffffff" 
          transparent={true}
          opacity={0.5}
          linewidth={1}
        />
      </lineSegments>
    </group>
  )
}
