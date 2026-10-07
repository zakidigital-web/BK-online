"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

interface ThreeHeroBackgroundProps {
  primaryColor?: string
  particleCount?: number
  className?: string
}

export function ThreeHeroBackground({
  primaryColor = "#4f46e5",
  particleCount = 120,
  className = "",
}: ThreeHeroBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [webGLSupported, setWebGLSupported] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Verify WebGL availability
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      if (!gl) {
        setWebGLSupported(false)
        return
      }
    } catch {
      setWebGLSupported(false)
      return
    }

    let animationFrameId: number
    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000)
    camera.position.z = 24

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // 2. Central Floating Geometry (Icosahedron wireframe + inner glowing mesh)
    const baseColor = new THREE.Color(primaryColor)
    const accentColor = new THREE.Color(primaryColor).offsetHSL(0.08, -0.1, 0.15)

    const icosaGroup = new THREE.Group()
    icosaGroup.position.set(4, 0, 0) // Align slightly towards right column

    // Outer wireframe geometric orb
    const geom = new THREE.IcosahedronGeometry(5.2, 2)
    const wireMat = new THREE.MeshBasicMaterial({
      color: baseColor,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    })
    const icosaMesh = new THREE.Mesh(geom, wireMat)
    icosaGroup.add(icosaMesh)

    // Secondary floating inner octahedron
    const innerGeom = new THREE.OctahedronGeometry(2.8, 0)
    const innerMat = new THREE.MeshBasicMaterial({
      color: accentColor,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    })
    const innerMesh = new THREE.Mesh(innerGeom, innerMat)
    icosaGroup.add(innerMesh)

    // Torus orbital ring
    const ringGeom = new THREE.TorusGeometry(7.2, 0.04, 16, 100)
    const ringMat = new THREE.MeshBasicMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0.35,
    })
    const ringMesh = new THREE.Mesh(ringGeom, ringMat)
    ringMesh.rotation.x = Math.PI / 3
    ringMesh.rotation.y = Math.PI / 6
    icosaGroup.add(ringMesh)

    scene.add(icosaGroup)

    // 3. Ambient Star / Neural Constellation Particle Field
    const particlesGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const originalPositions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3
      const x = (Math.random() - 0.5) * 45
      const y = (Math.random() - 0.5) * 28
      const z = (Math.random() - 0.5) * 22

      positions[idx] = x
      positions[idx + 1] = y
      positions[idx + 2] = z

      originalPositions[idx] = x
      originalPositions[idx + 1] = y
      originalPositions[idx + 2] = z

      velocities[idx] = (Math.random() - 0.5) * 0.008
      velocities[idx + 1] = (Math.random() - 0.5) * 0.008
      velocities[idx + 2] = (Math.random() - 0.5) * 0.005
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

    // Soft glowing circle canvas texture for particles
    const canvas = document.createElement("canvas")
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext("2d")
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)")
      gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.7)")
      gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.15)")
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 64, 64)
    }
    const particleTexture = new THREE.CanvasTexture(canvas)

    const particlesMaterial = new THREE.PointsMaterial({
      color: baseColor,
      size: 0.55,
      map: particleTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const particlesSystem = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesSystem)

    // 4. Subtle Interactivity (Mouse Parallax)
    let targetMouseX = 0
    let targetMouseY = 0
    let mouseX = 0
    let mouseY = 0

    const handleMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      targetMouseX = (event.clientX / innerWidth - 0.5) * 2
      targetMouseY = (event.clientY / innerHeight - 0.5) * 2
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })

    // 5. Responsive Resize Observer
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      if (w === 0 || h === 0) return

      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)

      // Reposition floating geometry for smaller mobile viewports
      if (w < 1024) {
        icosaGroup.position.set(0, 3.5, -4)
        icosaGroup.scale.set(0.75, 0.75, 0.75)
      } else {
        icosaGroup.position.set(5.5, 0.5, 0)
        icosaGroup.scale.set(1, 1, 1)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    // 6. Smooth Animation Loop (60 FPS)
    const startTime = performance.now()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = (performance.now() - startTime) * 0.001

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05

      // Idle rotations & bobbing
      icosaMesh.rotation.x = elapsedTime * 0.12
      icosaMesh.rotation.y = elapsedTime * 0.18

      innerMesh.rotation.x = -elapsedTime * 0.22
      innerMesh.rotation.y = elapsedTime * 0.28

      ringMesh.rotation.z = elapsedTime * 0.15

      icosaGroup.position.y += Math.sin(elapsedTime * 0.9) * 0.003
      icosaGroup.rotation.y = mouseX * 0.35
      icosaGroup.rotation.x = -mouseY * 0.25

      // Particle subtle drifting & breathing
      const posArray = particlesGeometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3
        posArray[idx] += velocities[idx]
        posArray[idx + 1] += velocities[idx + 1]

        // Drift boundary wrap
        if (Math.abs(posArray[idx] - originalPositions[idx]) > 3) velocities[idx] *= -1
        if (Math.abs(posArray[idx + 1] - originalPositions[idx + 1]) > 3) velocities[idx + 1] *= -1
      }
      particlesGeometry.attributes.position.needsUpdate = true

      particlesSystem.rotation.y = elapsedTime * 0.02 + mouseX * 0.1
      particlesSystem.rotation.x = -mouseY * 0.08

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }

      geom.dispose()
      wireMat.dispose()
      innerGeom.dispose()
      innerMat.dispose()
      ringGeom.dispose()
      ringMat.dispose()
      particlesGeometry.dispose()
      particlesMaterial.dispose()
      particleTexture.dispose()
      renderer.dispose()
    }
  }, [primaryColor, particleCount])

  if (!webGLSupported) {
    return null
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
    />
  )
}
