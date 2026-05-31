'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ArtifactScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 1.5, 7)
    camera.lookAt(0, 0, 0)

    const resize = () => {
      const w = canvas.parentElement?.clientWidth || 600
      const h = canvas.parentElement?.clientHeight || window.innerHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()

    // ============================================================
    // LIGHTING
    // ============================================================
    const ambientLight = new THREE.AmbientLight(0xF0EDE6, 0.6)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xFFF5E0, 2.5)
    dirLight.position.set(3, 6, 4)
    dirLight.castShadow = true
    scene.add(dirLight)

    const fillLight = new THREE.DirectionalLight(0xE8D5A0, 0.8)
    fillLight.position.set(-4, 2, -2)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xFFFFFF, 0.4)
    rimLight.position.set(0, -3, -4)
    scene.add(rimLight)

    // ============================================================
    // HELPER: Create lontar leaf shape (elongated, slightly tapered)
    // ============================================================
    function createLontarLeafGeometry(
      length: number,
      width: number,
      segments: number,
      curvature: number
    ): THREE.BufferGeometry {
      const geo = new THREE.BufferGeometry()
      const segsX = segments
      const segsY = 2
      const positions: number[] = []
      const normals: number[] = []
      const uvs: number[] = []
      const indices: number[] = []

      for (let iy = 0; iy <= segsY; iy++) {
        for (let ix = 0; ix <= segsX; ix++) {
          const u = ix / segsX  // 0 = left, 1 = right
          const v = iy / segsY  // 0 = bottom, 1 = top

          // Taper: narrower at both ends (leaf shape)
          const taper = Math.sin(u * Math.PI)
          const x = (u - 0.5) * length
          const y = (v - 0.5) * width * taper

          // Slight curve along length (like a real leaf bending)
          const bend = Math.sin(u * Math.PI) * curvature
          const z = bend + Math.sin(v * Math.PI - Math.PI / 2) * 0.04

          positions.push(x, y, z)
          normals.push(0, 0, 1)
          uvs.push(u, v)
        }
      }

      for (let iy = 0; iy < segsY; iy++) {
        for (let ix = 0; ix < segsX; ix++) {
          const a = iy * (segsX + 1) + ix
          const b = a + (segsX + 1)
          indices.push(a, b, a + 1)
          indices.push(b, b + 1, a + 1)
        }
      }

      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
      geo.setIndex(indices)
      geo.computeVertexNormals()
      return geo
    }

    // ============================================================
    // LONTAR LEAF TEXTURE (procedural canvas texture)
    // ============================================================
    function createLontarTexture(): THREE.CanvasTexture {
      const size = 1024
      const c = document.createElement('canvas')
      c.width = size * 3
      c.height = size
      const ctx = c.getContext('2d')!

      // Base color — warm aged lontar
      const baseGrad = ctx.createLinearGradient(0, 0, c.width, c.height)
      baseGrad.addColorStop(0, '#C8A96E')
      baseGrad.addColorStop(0.3, '#D4B882')
      baseGrad.addColorStop(0.6, '#C2A060')
      baseGrad.addColorStop(1, '#B8956A')
      ctx.fillStyle = baseGrad
      ctx.fillRect(0, 0, c.width, c.height)

      // Leaf veins — center vein
      ctx.strokeStyle = 'rgba(90, 60, 20, 0.5)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(0, size / 2)
      ctx.lineTo(c.width, size / 2)
      ctx.stroke()

      // Side veins
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(90, 60, 20, 0.25)'
      for (let i = 0; i < 40; i++) {
        const x = (c.width / 40) * i
        const angle = 0.4
        ctx.beginPath()
        ctx.moveTo(x, size / 2)
        ctx.lineTo(x + 80, size / 2 - 80 * Math.tan(angle))
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, size / 2)
        ctx.lineTo(x + 80, size / 2 + 80 * Math.tan(angle))
        ctx.stroke()
      }

      // Aksara marks (simulated script lines)
      ctx.strokeStyle = 'rgba(50, 30, 10, 0.6)'
      ctx.lineWidth = 1.5
      for (let row = 0; row < 3; row++) {
        const y = size * 0.28 + row * (size * 0.22)
        let x = 40
        while (x < c.width - 40) {
          const charWidth = 14 + Math.random() * 10
          // Randomized aksara-like strokes
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + charWidth * 0.6, y - 10 + Math.random() * 8)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(x + charWidth * 0.3, y + 3, 3 + Math.random() * 3, 0, Math.PI * 1.5)
          ctx.stroke()
          x += charWidth + 4 + Math.random() * 6
        }
      }

      // Grain/noise texture overlay
      for (let i = 0; i < 8000; i++) {
        const gx = Math.random() * c.width
        const gy = Math.random() * c.height
        const alpha = Math.random() * 0.06
        ctx.fillStyle = `rgba(60, 35, 10, ${alpha})`
        ctx.fillRect(gx, gy, 1, 1)
      }

      // Aged spots
      for (let i = 0; i < 30; i++) {
        const sx = Math.random() * c.width
        const sy = Math.random() * c.height
        const sr = 3 + Math.random() * 18
        const spotGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr)
        spotGrad.addColorStop(0, 'rgba(80, 45, 10, 0.15)')
        spotGrad.addColorStop(1, 'rgba(80, 45, 10, 0)')
        ctx.fillStyle = spotGrad
        ctx.beginPath()
        ctx.arc(sx, sy, sr, 0, Math.PI * 2)
        ctx.fill()
      }

      return new THREE.CanvasTexture(c)
    }

    // ============================================================
    // BUILD THE LEAF STACK (like real lontar — multiple leaves bound)
    // ============================================================
    const lontarGroup = new THREE.Group()
    const leafTexture = createLontarTexture()

    const leafCount = 5
    for (let i = 0; i < leafCount; i++) {
      const isTop = i === Math.floor(leafCount / 2)
      const geo = createLontarLeafGeometry(
        5.5,
        0.7,
        60,
        0.12 + i * 0.03
      )

      const mat = new THREE.MeshStandardMaterial({
        map: leafTexture,
        side: THREE.DoubleSide,
        roughness: 0.75,
        metalness: 0.0,
        transparent: i !== Math.floor(leafCount / 2),
        opacity: isTop ? 1.0 : 0.85 - i * 0.05,
      })

      const leaf = new THREE.Mesh(geo, mat)
      leaf.position.y = (i - leafCount / 2) * 0.12
      leaf.position.z = (i - leafCount / 2) * 0.05
      leaf.rotation.z = (Math.random() - 0.5) * 0.04
      leaf.rotation.x = (Math.random() - 0.5) * 0.03
      leaf.castShadow = true
      leaf.receiveShadow = true
      lontarGroup.add(leaf)
    }

    // Binding cord (the string that binds lontar leaves)
    const cordPositions = [-1.8, 0, 1.8]
    cordPositions.forEach(xPos => {
      const cordGeo = new THREE.CylinderGeometry(0.018, 0.018, leafCount * 0.12 + 0.3, 6)
      const cordMat = new THREE.MeshStandardMaterial({
        color: 0x8B5E3C,
        roughness: 0.9,
        metalness: 0.0,
      })
      const cord = new THREE.Mesh(cordGeo, cordMat)
      cord.position.set(xPos, 0, 0.1)
      cord.rotation.x = Math.PI / 2
      lontarGroup.add(cord)
    })

    // Hole details at binding points
    cordPositions.forEach(xPos => {
      const holeRingGeo = new THREE.TorusGeometry(0.04, 0.01, 6, 12)
      const holeRingMat = new THREE.MeshStandardMaterial({ color: 0x7A4F28, roughness: 0.95 })
      const holeRing = new THREE.Mesh(holeRingGeo, holeRingMat)
      holeRing.position.set(xPos, 0, 0.1)
      lontarGroup.add(holeRing)
    })

    scene.add(lontarGroup)

    // ============================================================
    // SUBTLE DUST PARTICLES
    // ============================================================
    const pGeo = new THREE.BufferGeometry()
    const pCount = 120
    const pPos = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 10
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const pMat = new THREE.PointsMaterial({
      color: 0xC8A96E,
      size: 0.03,
      transparent: true,
      opacity: 0.35,
    })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // ============================================================
    // MOUSE PARALLAX
    // ============================================================
    let targetRotX = 0
    let targetRotY = 0
    let currentRotX = 0
    let currentRotY = 0

    const onMouseMove = (e: MouseEvent) => {
      targetRotY = (e.clientX / window.innerWidth - 0.5) * 0.6
      targetRotX = -(e.clientY / window.innerHeight - 0.5) * 0.35
    }
    document.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', resize)

    // ============================================================
    // ANIMATION LOOP
    // ============================================================
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = Date.now() * 0.001

      // Smooth mouse follow
      currentRotX += (targetRotX - currentRotX) * 0.04
      currentRotY += (targetRotY - currentRotY) * 0.04

      lontarGroup.rotation.x = currentRotX
      lontarGroup.rotation.y = currentRotY

      // Gentle idle float
      lontarGroup.position.y = Math.sin(t * 0.5) * 0.06
      lontarGroup.rotation.z = Math.sin(t * 0.3) * 0.015

      // Individual leaf micro-movement
      lontarGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && i < leafCount) {
          child.rotation.z = Math.sin(t * 0.4 + i * 0.8) * 0.012
        }
      })

      particles.rotation.y = t * 0.008
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      document.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', resize)
      leafTexture.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  )
}
