'use client'

import { Component, Suspense, useRef, useState, useEffect, useMemo, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center, Bounds, Environment, useProgress } from '@react-three/drei'
import * as THREE from 'three'

// Rotasi koreksi default (derajat) — ngoreksi konvensi sumbu "atas"
// dari tool scan lama (KIRI Engine dkk). Export RealityScan ternyata
// gak selalu pakai konvensi yang sama, jadi ini cuma nilai AWAL; tiap
// artefak bisa nimpa lewat field "Rotasi Model" di admin kalau modelnya
// muncul miring/kesamping/keliatan dari ujung.
// Rotasi koreksi default (derajat) — GLTF standard orientation [0, 0, 0]
const DEFAULT_ROTATION_DEG: [number, number, number] = [0, 0, 0]

// ============================================================
// GLB Model Loader
// ============================================================
function Model({
  modelUrl,
  rotationDeg = DEFAULT_ROTATION_DEG,
}: {
  modelUrl: string
  rotationDeg?: [number, number, number]
}) {
  const { scene } = useGLTF(modelUrl)
  const modelRef = useRef<THREE.Group>(null)
  const rotationRad: [number, number, number] = [
    THREE.MathUtils.degToRad(rotationDeg[0]),
    THREE.MathUtils.degToRad(rotationDeg[1]),
    THREE.MathUtils.degToRad(rotationDeg[2]),
  ]

  const clonedScene = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    // Apply materials + vertex colors + double sided rendering
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true

        const setupMat = (mat: THREE.Material) => {
          const m = mat as THREE.MeshStandardMaterial
          m.side = THREE.DoubleSide // Mencegah bagian dalam/belakang model berlubang keliatan item bolong
          
          if (!m.map) {
            // Model tanpa foto tekstur diffuse (mis. macan_lonceng.glb):
            // Hapus vertex colors debug (salju/ungu bawaan RealityScan) dari memori geometri
            if (mesh.geometry.attributes.color) {
              mesh.geometry.deleteAttribute('color')
            }
            m.vertexColors = false
            m.color = new THREE.Color('#A38656')
            m.roughness = 0.45
            m.metalness = 0.4
          } else {
            // Jika ada foto tekstur diffuse asli (mis. buddha_fix.glb):
            // Pakai tekstur fotonya dan matikan vertex color debug
            m.vertexColors = false
          }
          m.needsUpdate = true
        }

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(setupMat)
        } else {
          setupMat(mesh.material)
        }
      }
    })
  }, [clonedScene])

  // Outer group rotates smoothly around world vertical Y-axis
  useFrame((_, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group ref={modelRef}>
      <group rotation={rotationRad}>
        <Center>
          <primitive object={clonedScene} />
        </Center>
      </group>
    </group>
  )
}

// ============================================================
// Model Error Boundary — sebagian file .glb hasil fotogrametri
// (RealityScan/RealityCapture) merujuk texture eksternal (mis.
// "*_u0_v0_diffuse.png") yang tidak ikut ter-embed atau ter-copy.
// GLTFLoader nge-throw kalau texture-nya gagal dimuat, dan itu
// membatalkan SELURUH parsing model — bukan cuma texture-nya saja.
// Boundary ini mencegah satu model rusak nge-crash seluruh halaman;
// dia jatuh balik ke placeholder wireframe yang sama seperti kalau
// file .glb-nya belum ada sama sekali.
// ============================================================
class ModelErrorBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.warn('[ModelViewer] Gagal memuat model 3D, jatuh ke placeholder:', error)
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// ============================================================
// Silent Error Boundary — buat komponen yang boleh gagal tanpa
// nge-jatohin viewer sama sekali (mis. <Environment>, yang ngambil
// file HDR dari CDN pihak ketiga; kalau koneksi ke situ gagal, cukup
// lanjut tanpa pantulan environment-nya, jangan sampai seluruh model
// ikut hilang gara-gara itu).
// ============================================================
class SilentErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.warn('[ModelViewer] Komponen opsional gagal dimuat, dilewati:', error)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// ============================================================
// Fallback Viewer — <model-viewer> (Google) buat model yang
// tekstur eksternalnya hilang.
//
// GLTFLoader kita (react-three-fiber) strict: satu texture 404
// membatalkan seluruh parsing. <model-viewer> jauh lebih toleran —
// dia tetap merender geometri + vertex color bawaan hasil scan,
// cuma detail foto teksturnya yang tidak ikut tampil. Jadi dipakai
// sebagai jalur cadangan, bukan pengganti utama (kualitas engine
// utama tetap lebih baik untuk model yang teksturnya lengkap).
//
// Dipasang via DOM API langsung (bukan dangerouslySetInnerHTML)
// supaya `modelUrl` — yang sekarang bisa diisi bebas oleh admin lewat
// CMS — tidak pernah diperlakukan sebagai markup mentah.
// ============================================================
function FallbackViewer({ modelUrl, rotation = [0, 0, 0] }: { modelUrl: string; rotation?: [number, number, number] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(
    typeof window !== 'undefined' && Boolean(customElements.get('model-viewer'))
  )

  useEffect(() => {
    if (customElements.get('model-viewer')) {
      setReady(true)
      return
    }
    if (!document.querySelector('script[data-model-viewer]')) {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'
      script.dataset.modelViewer = '1'
      document.head.appendChild(script)
    }
    let cancelled = false
    customElements.whenDefined('model-viewer').then(() => {
      if (!cancelled) setReady(true)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!ready || !container) return

    const el = document.createElement('model-viewer')
    el.setAttribute('src', modelUrl)
    el.setAttribute('auto-rotate', '')
    el.setAttribute('camera-controls', '')
    el.setAttribute('orientation', `${rotation[0]}deg ${rotation[1]}deg ${rotation[2]}deg`)

    // Bila model tak punya tekstur (fallback view), beri warna perunggu museum hangat (#A38656)
    el.addEventListener('load', () => {
      try {
        const materials = (el as any).model?.materials
        if (materials && materials.length > 0) {
          for (const mat of materials) {
            mat.pbrMetallicRoughness?.setBaseColorFactor([0.64, 0.52, 0.34, 1.0])
            mat.pbrMetallicRoughness?.setRoughnessFactor(0.45)
            mat.pbrMetallicRoughness?.setMetallicFactor(0.4)
          }
        }
      } catch {
        /* fail-safe */
      }
    })
    el.setAttribute('environment-image', 'neutral')
    el.setAttribute('exposure', '1.1')
    el.setAttribute('shadow-intensity', '1')
    el.style.width = '100%'
    el.style.height = '100%'

    container.replaceChildren(el)
    return () => { container.replaceChildren() }
  }, [ready, modelUrl, rotation])

  return <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#1A1918' }} />
}

// ============================================================
// Status Note — kenapa placeholder wireframe yang tampil
// ============================================================
function StatusNote({ text }: { text: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5,
        pointerEvents: 'none',
        maxWidth: '80%',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '9px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--warm)',
        }}
      >
        {text}
      </span>
    </div>
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
  modelUrl: string
  rotation?: [number, number, number]
}

export default function ModelViewer({ modelUrl, rotation }: ModelViewerProps) {
  // Progress ASLI dari THREE.DefaultLoadingManager (dipakai internal
  // sama GLTFLoader/TextureLoader) — bukan animasi tebakan. Model
  // .glb hasil fotogrametri bisa puluhan MB, jadi penting progress-nya
  // jujur (biar pengunjung gak ngira situsnya freeze pas nunggu lama).
  const { progress: loadProgress, active: loadActive } = useProgress()
  const [ready, setReady] = useState(false)
  const [modelBroken, setModelBroken] = useState(false)

  useEffect(() => {
    setModelBroken(false)
    setReady(false)
  }, [modelUrl])

  useEffect(() => {
    if (!loadActive && loadProgress >= 100) setReady(true)
  }, [loadActive, loadProgress])

  const loading = !ready

  // <model-viewer> adalah custom element DOM biasa — tidak bisa
  // dipasang di dalam <Canvas> (konteks WebGL milik react-three-fiber).
  // Jadi begitu model dinyatakan rusak, Canvas utama dilepas total dan
  // diganti elemen fallback ini, bukan digabung.
  const useFallback = modelBroken

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {loading && <LoadingScreen progress={loadProgress} />}
      {!useFallback && <DragHint />}

      {useFallback ? (
        <FallbackViewer modelUrl={modelUrl} rotation={rotation} />
      ) : (
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          shadows
          dpr={[1, 1.5]} // Capping Device Pixel Ratio saves massive amounts of GPU fill-rate on mobile
          gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
        >
          {/* Satu key light doang buat kasih arah bayangan/highlight.
              JANGAN tambah ambient/hemisphere/bounce light lagi di sini —
              <Environment> di bawah sudah nanganin ambient & pantulan
              secara realistis (itu cara yang benar buat material PBR/
              metalik). Numpuk banyak lampu di atas Environment bikin
              warnanya "kepucetan" (overexposed), bukan makin bagus. */}
          <directionalLight
            position={[4, 6, 3]}
            intensity={1.0}
            color="#FFF5E0"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          <Suspense fallback={null}>
            {/* Environment (IBL) — WAJIB buat material metalik (perunggu,
                emas, dll) biar gak keliatan "item banget". Ngambil file
                HDR dari CDN pihak ketiga, jadi dibungkus boundary sendiri
                — kalau CDN-nya gagal/lambat, viewer tetap jalan normal
                (cuma tanpa pantulan extra), gak ikut nge-crash. */}
            <SilentErrorBoundary>
              <Environment preset="studio" background={false} />
            </SilentErrorBoundary>

            {/* <Bounds fit> menggeser & nge-zoom KAMERA supaya pas
                membingkai apapun yang ada di dalamnya — jadi gak perlu
                lagi tebak-tebak skala manual per model (RealityScan,
                KIRI Engine, dll punya satuan mentah yang beda-beda). */}
            <Bounds key={modelUrl} fit clip observe margin={1.3}>
              <ModelErrorBoundary key={modelUrl} onError={() => setModelBroken(true)}>
                <Model modelUrl={modelUrl} rotationDeg={rotation} />
              </ModelErrorBoundary>
            </Bounds>
          </Suspense>

          <OrbitControls
            makeDefault
            enablePan={false}
            minDistance={0.5}
            maxDistance={50}
            enableDamping
            dampingFactor={0.05}
            autoRotate={false}
          />
        </Canvas>
      )}

      {useFallback && <StatusNote text="Pratinjau dasar — detail tekstur foto belum lengkap" />}
    </div>
  )
}
