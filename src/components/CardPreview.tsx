'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * CardPreviewInner — A small rotating placeholder geometry
 * for the collection card thumbnails. Uses a rounded box
 * wireframe to match the existing wireframe aesthetic.
 */
function CardPreviewInner({ artifactType }: { artifactType: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.0005) * 0.15
    }
  })

  // Use different geometry based on artifact type
  const geometry =
    artifactType === 'Manuscript' ? (
      <boxGeometry args={[3, 0.5, 0.15, 4, 2, 1]} />
    ) : (
      <dodecahedronGeometry args={[0.9, 0]} />
    )

  return (
    <>
      <ambientLight intensity={0.5} color="#F0EDE6" />
      <directionalLight position={[3, 4, 2]} intensity={1.5} color="#FFF5E0" />
      <mesh ref={meshRef}>
        {geometry}
        <meshStandardMaterial
          color="#C8A96E"
          wireframe
          transparent
          opacity={0.6}
          roughness={0.8}
        />
      </mesh>
    </>
  )
}

export default function CardPreview({ artifactType }: { artifactType: string }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ alpha: true, antialias: true }}
    >
      <CardPreviewInner artifactType={artifactType} />
    </Canvas>
  )
}
