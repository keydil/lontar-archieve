'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function useGSAPAnimations() {
  useEffect(() => {
    // Hero intro
    const tl = gsap.timeline({ delay: 0.4 })
    tl.to('.hero-kicker', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' })
      .to('.hero-h1', { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out' }, '-=0.8')
      .to('.hero-scroll', { opacity: 1, duration: 1, ease: 'power2.out' }, '-=0.4')
      .to('.nav-logo', { opacity: 1, duration: 0.8 }, '-=0.8')
      .to('.nav-link', { opacity: 1, duration: 0.6, stagger: 0.1 }, '-=0.6')

    // Hero parallax on scroll
    gsap.to('.hero-content', {
      yPercent: -25,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })

    // Manifesto section
    gsap.to('.manifesto-num', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#manifesto', start: 'top 70%' },
    })

    gsap.to('.manifesto-word', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.04,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#manifesto', start: 'top 60%' },
    })

    // Collection section
    gsap.to('.col-title', {
      opacity: 1,
      x: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#collection', start: 'top 70%' },
    })

    gsap.to('.col-meta', {
      opacity: 1,
      duration: 1,
      scrollTrigger: { trigger: '#collection', start: 'top 70%' },
    })

    gsap.to('.grid-item', {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.grid-items', start: 'top 75%' },
    })

    // Artifact section
    gsap.to('.artifact-label', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#artifact', start: 'top 70%' },
    })

    gsap.to('.artifact-h2', {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.15,
      scrollTrigger: { trigger: '#artifact', start: 'top 70%' },
    })

    gsap.to('.artifact-body', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.3,
      scrollTrigger: { trigger: '#artifact', start: 'top 70%' },
    })

    // Footer brand
    gsap.to('.footer-brand', {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: 'footer', start: 'top 80%' },
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])
}
