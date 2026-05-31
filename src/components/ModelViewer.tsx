'use client'

import { Suspense, useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html, Environment } from '@react-three/drei'
import * as THREE from 'three'
import type { Hotspot } from '@/data/koleksi'

// ============================================================
// GLB Model Loader
// ============================================================
function Model({ slug, activeHotspot }: { slug: string; activeHotspot: string | null }) {
  const { scene } = useGLTF(`/models/${slug}.glb`)
  const modelRef = useRef<THREE.Group>(null)

  useEffect(() => {
    // Center the model
    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 2.5 / maxDim

    scene.position.sub(center)
    scene.scale.setScalar(scale)

    // Apply nice materials defaults
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
  }, [scene])

  useFrame((_, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.05
    }
  })

  return <group ref={modelRef}><primitive object={scene} /></group>
}

// ============================================================
// Fallback Placeholder (when .glb doesn't exist)
// ============================================================
function PlaceholderModel({ type }: { type: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1
    }
  })

  return (
    <mesh ref={meshRef}>
      {type === 'Manuscript' ? (
        <boxGeometry args={[3.5, 0.6, 0.12, 8, 3, 1]} />
      ) : (
        <dodecahedronGeometry args={[1.2, 1]} />
      )}
      <meshStandardMaterial
        color="#C8A96E"
        roughness={0.75}
        metalness={0.0}
        wireframe
        transparent
        opacity={0.45}
      />
    </mesh>
  )
}

// ============================================================
// Hotspot Markers (3D points on the model)
// ============================================================
function HotspotMarker({
  hotspot,
  isActive,
  onClick,
}: {
  hotspot: Hotspot
  isActive: boolean
  onClick: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(isActive ? 1.4 : 1)
    }
  })

  return (
    <group position={hotspot.position}>
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color={isActive ? '#C8A96E' : '#111110'}
          emissive={isActive ? '#C8A96E' : '#000000'}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
      </mesh>
      {/* Pulsing ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.1, 32]} />
        <meshBasicMaterial
          color={isActive ? '#C8A96E' : '#8C8A85'}
          transparent
          opacity={isActive ? 0.8 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {isActive && (
        <Html center distanceFactor={5} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              background: '#111110',
              color: '#F0EDE6',
              padding: '8px 14px',
              borderRadius: '2px',
              fontSize: '10px',
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
              transform: 'translateY(-30px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            {hotspot.label}
          </div>
        </Html>
      )}
    </group>
  )
}

// ============================================================
// Loading Screen
// ============================================================
function LoadingScreen({ progress }: { progress: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bone)',
        zIndex: 10,
        gap: '1.5rem',
      }}
    >
      <div
        style={{
          width: '120px',
          height: '1px',
          background: 'var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${progress}%`,
            background: 'var(--charcoal)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '9px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--warm)',
        }}
      >
        {Math.round(progress)}%
      </span>
    </div>
  )
}

// ============================================================
// Drag Hint Overlay
// ============================================================
function DragHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
        zIndex: 5,
        pointerEvents: 'none',
      }}
    >
      {/* Hand icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8C8A85" strokeWidth="1.5">
        <path d="M18 11V6a2 2 0 0 0-4 0v1M14 10V4a2 2 0 0 0-4 0v6M10 10V6a2 2 0 0 0-4 0v8l-1.46-1.46a2 2 0 0 0-2.83 2.83L6 20h10a4 4 0 0 0 4-4v-5a2 2 0 0 0-4 0v1" />
      </svg>
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--warm)',
        }}
      >
        Drag to rotate
      </span>
    </div>
  )
}

// ============================================================
// Main ModelViewer Component
// ============================================================
interface ModelViewerProps {
  slug: string
  type: string
  hotspots: Hotspot[]
  activeHotspot: string | null
  onHotspotClick: (id: string | null) => void
}

export default function ModelViewer({
  slug,
  type,
  hotspots,
  activeHotspot,
  onHotspotClick,
}: ModelViewerProps) {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [modelExists, setModelExists] = useState(true)

  // Simulate loading check — try to fetch the GLB
  useEffect(() => {
    let cancelled = false

    const checkModel = async () => {
      try {
        const res = await fetch(`/models/${slug}.glb`, { method: 'HEAD' })
        if (!cancelled) {
          setModelExists(res.ok)
        }
      } catch {
        if (!cancelled) setModelExists(false)
      }

      // Simulate progress
      let p = 0
      const interval = setInterval(() => {
        p += Math.random() * 25 + 10
        if (p >= 100) {
          p = 100
          clearInterval(interval)
          setTimeout(() => {
            if (!cancelled) setLoading(false)
          }, 300)
        }
        if (!cancelled) setProgress(p)
      }, 200)

      return () => clearInterval(interval)
    }

    checkModel()
    return () => { cancelled = true }
  }, [slug])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {loading && <LoadingScreen progress={progress} />}
      <DragHint />
      <Canvas
        camera={{ position: [0, 1, 5], fov: 45 }}
        shadows
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        {/* Warm ambient */}
        <ambientLight intensity={0.5} color="#F0EDE6" />

        {/* Key light — warm directional */}
        <directionalLight
          position={[4, 6, 3]}
          intensity={2.2}
          color="#FFF5E0"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Fill light */}
        <directionalLight position={[-4, 2, -2]} intensity={0.7} color="#E8D5A0" />

        {/* Rim / back light for edge definition */}
        <directionalLight position={[0, -2, -4]} intensity={0.35} color="#FFFFFF" />

        {/* Subtle top highlight */}
        <pointLight position={[0, 5, 0]} intensity={0.3} color="#FFF8ED" />

        <Suspense fallback={null}>
          {modelExists ? (
            <Model slug={slug} activeHotspot={activeHotspot} />
          ) : (
            <PlaceholderModel type={type} />
          )}

          {/* Hotspot markers */}
          {hotspots.map((hs) => (
            <HotspotMarker
              key={hs.id}
              hotspot={hs}
              isActive={activeHotspot === hs.id}
              onClick={() =>
                onHotspotClick(activeHotspot === hs.id ? null : hs.id)
              }
            />
          ))}
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={10}
          enableDamping
          dampingFactor={0.05}
          autoRotate={false}
        />
      </Canvas>
    </div>
  )
}
