'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number>()

  useEffect(() => {
    const cursor = cursorRef.current
    const ring = ringRef.current
    if (!cursor || !ring) return

    // Hide default cursor globally
    document.documentElement.style.cursor = 'none'

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    const onEnter = () => {
      if (ring) {
        ring.style.width = '52px'
        ring.style.height = '52px'
        ring.style.borderColor = '#111110'
      }
    }
    const onLeave = () => {
      if (ring) {
        ring.style.width = '32px'
        ring.style.height = '32px'
        ring.style.borderColor = '#111110'
      }
    }

    // RAF loop for smooth follow
    const loop = () => {
      // Dot: instant
      cursor.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`

      // Ring: lerp
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12
      ring.style.transform = `translate(${ringPos.current.x - 16}px, ${ringPos.current.y - 16}px)`

      rafRef.current = requestAnimationFrame(loop)
    }

    document.addEventListener('mousemove', onMouseMove)

    const targets = document.querySelectorAll('a, button, .grid-item')
    targets.forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      document.documentElement.style.cursor = ''
      document.removeEventListener('mousemove', onMouseMove)
      targets.forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          background: '#111110',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '32px',
          height: '32px',
          border: '1.5px solid #111110',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99998,
          willChange: 'transform',
          transition: 'width 0.3s ease, height 0.3s ease',
        }}
      />
    </>
  )
}