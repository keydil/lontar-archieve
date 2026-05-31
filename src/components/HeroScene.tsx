'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 0, 6)

    // Lighting
    scene.add(new THREE.AmbientLight(0xF0EDE6, 0.8))
    const dir = new THREE.DirectionalLight(0xFFF5E0, 2)
    dir.position.set(4, 6, 3)
    scene.add(dir)

    // Procedural leaf texture (same as ArtifactScene)
    function createLeafTexture(): THREE.CanvasTexture {
      const size = 512
      const c = document.createElement('canvas')
      c.width = size * 3; c.height = size
      const ctx = c.getContext('2d')!
      const g = ctx.createLinearGradient(0, 0, c.width, 0)
      g.addColorStop(0, '#C8A96E')
      g.addColorStop(0.5, '#D4B882')
      g.addColorStop(1, '#B8956A')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, c.width, c.height)
      ctx.strokeStyle = 'rgba(90,60,20,0.4)'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(0, size/2); ctx.lineTo(c.width, size/2); ctx.stroke()
      ctx.lineWidth = 0.8
      for (let i = 0; i < 30; i++) {
        const x = (c.width / 30) * i
        ctx.beginPath(); ctx.moveTo(x, size/2); ctx.lineTo(x+60, size/2-40); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(x, size/2); ctx.lineTo(x+60, size/2+40); ctx.stroke()
      }
      for (let i = 0; i < 3000; i++) {
        ctx.fillStyle = `rgba(60,35,10,${Math.random()*0.05})`
        ctx.fillRect(Math.random()*c.width, Math.random()*c.height, 1, 1)
      }
      return new THREE.CanvasTexture(c)
    }

    // Leaf geometry helper
    function makeLeafGeo(len: number, wid: number, segs: number, curve: number) {
      const geo = new THREE.BufferGeometry()
      const pos: number[] = [], norm: number[] = [], uv: number[] = [], idx: number[] = []
      for (let iy = 0; iy <= 2; iy++) {
        for (let ix = 0; ix <= segs; ix++) {
          const u = ix / segs, v = iy / 2
          const taper = Math.sin(u * Math.PI)
          const x = (u - 0.5) * len
          const y = (v - 0.5) * wid * taper
          const z = Math.sin(u * Math.PI) * curve
          pos.push(x, y, z); norm.push(0, 0, 1); uv.push(u, v)
        }
      }
      for (let iy = 0; iy < 2; iy++) {
        for (let ix = 0; ix < segs; ix++) {
          const a = iy * (segs + 1) + ix, b = a + (segs + 1)
          idx.push(a, b, a+1, b, b+1, a+1)
        }
      }
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3))
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
      geo.setIndex(idx)
      geo.computeVertexNormals()
      return geo
    }

    const tex = createLeafTexture()
    const group = new THREE.Group()

    // 3 leaves at different angles — floating behind hero text
    const leafConfigs = [
      { y: 0, z: 0, rx: 0.1, ry: 0.15, rz: 0.05, opacity: 0.9, scale: 1.0 },
      { y: 0.5, z: -0.8, rx: -0.2, ry: -0.1, rz: 0.12, opacity: 0.5, scale: 0.85 },
      { y: -0.4, z: -1.5, rx: 0.15, ry: 0.2, rz: -0.08, opacity: 0.3, scale: 0.75 },
    ]

    leafConfigs.forEach(cfg => {
      const leaf = new THREE.Mesh(
        makeLeafGeo(5, 0.65, 48, 0.1),
        new THREE.MeshStandardMaterial({
          map: tex, side: THREE.DoubleSide,
          roughness: 0.8, metalness: 0,
          transparent: true, opacity: cfg.opacity,
        })
      )
      leaf.position.set(0, cfg.y, cfg.z)
      leaf.rotation.set(cfg.rx, cfg.ry, cfg.rz)
      leaf.scale.setScalar(cfg.scale)
      group.add(leaf)
    })
    scene.add(group)

    // Particles
    const pGeo = new THREE.BufferGeometry()
    const pPos = new Float32Array(200 * 3)
    for (let i = 0; i < 200 * 3; i++) pPos[i] = (Math.random() - 0.5) * 14
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xC8A96E, size: 0.02, transparent: true, opacity: 0.4 }))
    scene.add(particles)

    let mx = 0, my = 0, crx = 0, cry = 0
    const onMM = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.5
      my = -(e.clientY / window.innerHeight - 0.5) * 0.3
    }
    document.addEventListener('mousemove', onMM)

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = Date.now() * 0.001
      crx += (my - crx) * 0.04
      cry += (mx - cry) * 0.04
      group.rotation.x = crx
      group.rotation.y = cry
      group.position.y = Math.sin(t * 0.4) * 0.08
      particles.rotation.y = t * 0.01
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      document.removeEventListener('mousemove', onMM)
      window.removeEventListener('resize', onResize)
      tex.dispose()
      renderer.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 1, width: '100%', height: '100%' }} />
}
