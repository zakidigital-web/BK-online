"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import * as THREE from "three"
import { AssessmentMascot, type MascotCharacter, type MascotMood } from "./assessment-mascot"

interface ThreeMascot3DProps {
  character?: MascotCharacter
  mood?: MascotMood
  size?: number
  interactive?: boolean
  showParticles?: boolean
  showSpeechBubble?: boolean
  message?: string
  className?: string
  onClick?: () => void
}

const CHARACTER_PALETTES: Record<
  MascotCharacter,
  {
    primary: number
    secondary: number
    accent: number
    belly: number
    blush: number
    particle: number
  }
> = {
  kimi: {
    primary: 0x10b981, // emerald
    secondary: 0x059669,
    accent: 0xfbbf24, // gold
    belly: 0xd1fae5,
    blush: 0xf472b6,
    particle: 0x34d399,
  },
  piko: {
    primary: 0x3b82f6, // blue
    secondary: 0x2563eb,
    accent: 0x60a5fa,
    belly: 0xeff6ff,
    blush: 0xfb7185,
    particle: 0x93c5fd,
  },
  mimi: {
    primary: 0xf43f5e, // rose
    secondary: 0xe11d48,
    accent: 0xfb7185,
    belly: 0xffe4e6,
    blush: 0xf43f5e,
    particle: 0xfb7185,
  },
  sparky: {
    primary: 0xf59e0b, // amber
    secondary: 0xd97706,
    accent: 0xfef08a,
    belly: 0xfef3c7,
    blush: 0xfb923c,
    particle: 0xfcd34d,
  },
  zen: {
    primary: 0x6366f1, // indigo
    secondary: 0x4f46e5,
    accent: 0xa855f7,
    belly: 0xe0e7ff,
    blush: 0xc084fc,
    particle: 0x818cf8,
  },
}

export function ThreeMascot3D({
  character = "kimi",
  mood = "happy",
  size = 140,
  interactive = true,
  showParticles = true,
  showSpeechBubble = false,
  message = "Halo!",
  className = "",
  onClick,
}: ThreeMascot3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [webGLOk, setWebGLOk] = useState<boolean | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const clickCount = useRef(0)

  // Verify WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      setWebGLOk(Boolean(gl))
    } catch {
      setWebGLOk(false)
    }
  }, [])

  useEffect(() => {
    if (!webGLOk || !mountRef.current) return

    const container = mountRef.current
    const palette = CHARACTER_PALETTES[character]

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 7.5)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(size, size)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.innerHTML = ""
    container.appendChild(renderer.domElement)

    // 2. Lighting Setup (Soft Kawaii Studio Light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6)
    keyLight.position.set(4, 6, 6)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.8)
    fillLight.position.set(-4, -2, 4)
    scene.add(fillLight)

    const rimLight = new THREE.PointLight(palette.primary, 2.5, 12)
    rimLight.position.set(0, 4, -3)
    scene.add(rimLight)

    // 3. Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: palette.primary,
      roughness: 0.35,
      metalness: 0.1,
    })
    const bellyMat = new THREE.MeshStandardMaterial({
      color: palette.belly,
      roughness: 0.5,
    })
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.8,
    })
    const eyeGlintMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const blushMat = new THREE.MeshBasicMaterial({ color: palette.blush, transparent: true, opacity: 0.7 })
    const accentMat = new THREE.MeshStandardMaterial({
      color: palette.accent,
      roughness: 0.25,
      metalness: 0.2,
      emissive: palette.accent,
      emissiveIntensity: 0.15,
    })

    // 4. Character Root Group
    const mascotGroup = new THREE.Group()
    scene.add(mascotGroup)

    // Sub-parts references for animation
    let leftEar: THREE.Object3D | null = null
    let rightEar: THREE.Object3D | null = null
    let leftWing: THREE.Object3D | null = null
    let rightWing: THREE.Object3D | null = null
    let tail: THREE.Object3D | null = null
    let crown: THREE.Object3D | null = null

    // BUILD CHARACTER GEOMETRY
    if (character === "kimi") {
      // KIMI: Cute Owl / Bird Counselor
      // Round Body
      const bodyGeo = new THREE.SphereGeometry(1.6, 32, 32)
      bodyGeo.scale(1, 1.08, 0.95)
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
      mascotGroup.add(bodyMesh)

      // Belly Patch
      const bellyGeo = new THREE.SphereGeometry(1.2, 28, 28)
      bellyGeo.scale(0.85, 0.95, 0.35)
      const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat)
      bellyMesh.position.set(0, -0.3, 0.82)
      mascotGroup.add(bellyMesh)

      // Wings
      const wingGeo = new THREE.ConeGeometry(0.55, 1.3, 20)
      wingGeo.rotateZ(Math.PI / 2.6)
      const lw = new THREE.Mesh(wingGeo, bodyMat)
      lw.position.set(-1.6, -0.1, 0)
      leftWing = lw
      mascotGroup.add(lw)

      const rw = new THREE.Mesh(wingGeo, bodyMat)
      rw.position.set(1.6, -0.1, 0)
      rw.scale.x = -1
      rightWing = rw
      mascotGroup.add(rw)

      // Beak
      const beakGeo = new THREE.ConeGeometry(0.24, 0.45, 16)
      beakGeo.rotateX(Math.PI / 2)
      const beak = new THREE.Mesh(beakGeo, accentMat)
      beak.position.set(0, 0.1, 1.55)
      mascotGroup.add(beak)

      // Feather Tuft / Crown
      const tuftGeo = new THREE.ConeGeometry(0.35, 0.7, 16)
      const tuft = new THREE.Mesh(tuftGeo, accentMat)
      tuft.position.set(0, 1.85, 0)
      crown = tuft
      mascotGroup.add(tuft)

    } else if (character === "piko") {
      // PIKO: Smart Bunny
      // Head & Body
      const bodyGeo = new THREE.SphereGeometry(1.5, 32, 32)
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
      mascotGroup.add(bodyMesh)

      // Belly
      const bellyGeo = new THREE.SphereGeometry(1.1, 28, 28)
      bellyGeo.scale(0.8, 0.9, 0.3)
      const belly = new THREE.Mesh(bellyGeo, bellyMat)
      belly.position.set(0, -0.35, 0.8)
      mascotGroup.add(belly)

      // Long Bunny Ears
      const earGeo = new THREE.CylinderGeometry(0.22, 0.28, 1.8, 24)
      earGeo.scale(1, 1, 0.5)

      const le = new THREE.Mesh(earGeo, bodyMat)
      le.position.set(-0.65, 2.1, 0)
      le.rotation.z = 0.15
      leftEar = le
      mascotGroup.add(le)

      const re = new THREE.Mesh(earGeo, bodyMat)
      re.position.set(0.65, 2.1, 0)
      re.rotation.z = -0.15
      rightEar = re
      mascotGroup.add(re)

      // Pink Inner Ear
      const innerEarGeo = new THREE.CylinderGeometry(0.12, 0.16, 1.4, 20)
      innerEarGeo.scale(1, 1, 0.3)
      const innerLe = new THREE.Mesh(innerEarGeo, blushMat)
      innerLe.position.set(0, 0, 0.15)
      le.add(innerLe)

      const innerRe = new THREE.Mesh(innerEarGeo, blushMat)
      innerRe.position.set(0, 0, 0.15)
      re.add(innerRe)

      // Cute Little Nose
      const noseGeo = new THREE.ConeGeometry(0.12, 0.18, 16)
      noseGeo.rotateX(Math.PI / 2)
      const nose = new THREE.Mesh(noseGeo, blushMat)
      nose.position.set(0, 0.15, 1.5)
      mascotGroup.add(nose)

    } else if (character === "mimi") {
      // MIMI: Warm Heart Bear
      const bodyGeo = new THREE.SphereGeometry(1.55, 32, 32)
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
      mascotGroup.add(bodyMesh)

      // Belly
      const bellyGeo = new THREE.SphereGeometry(1.15, 28, 28)
      bellyGeo.scale(0.85, 0.9, 0.3)
      const belly = new THREE.Mesh(bellyGeo, bellyMat)
      belly.position.set(0, -0.3, 0.8)
      mascotGroup.add(belly)

      // Round Bear Ears
      const earGeo = new THREE.SphereGeometry(0.55, 24, 24)
      earGeo.scale(1, 1, 0.5)
      const le = new THREE.Mesh(earGeo, bodyMat)
      le.position.set(-1.15, 1.35, 0)
      leftEar = le
      mascotGroup.add(le)

      const re = new THREE.Mesh(earGeo, bodyMat)
      re.position.set(1.15, 1.35, 0)
      rightEar = re
      mascotGroup.add(re)

      // Heart Emblem on Chest
      const heartGeo = new THREE.SphereGeometry(0.28, 16, 16)
      const heartLeft = new THREE.Mesh(heartGeo, blushMat)
      heartLeft.position.set(-0.18, -0.15, 1.25)
      const heartRight = new THREE.Mesh(heartGeo, blushMat)
      heartRight.position.set(0.18, -0.15, 1.25)
      crown = heartLeft
      mascotGroup.add(heartLeft)
      mascotGroup.add(heartRight)

      // Teddy Snout
      const snoutGeo = new THREE.SphereGeometry(0.42, 20, 20)
      snoutGeo.scale(1, 0.8, 0.6)
      const snout = new THREE.Mesh(snoutGeo, bellyMat)
      snout.position.set(0, 0.05, 1.38)
      mascotGroup.add(snout)

    } else if (character === "sparky") {
      // SPARKY: Star Fox
      const bodyGeo = new THREE.SphereGeometry(1.5, 32, 32)
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
      mascotGroup.add(bodyMesh)

      // Snout
      const snoutGeo = new THREE.ConeGeometry(0.5, 0.9, 20)
      snoutGeo.rotateX(Math.PI / 2)
      const snout = new THREE.Mesh(snoutGeo, bellyMat)
      snout.position.set(0, 0.05, 1.35)
      mascotGroup.add(snout)

      // Pointy Fox Ears
      const earGeo = new THREE.ConeGeometry(0.55, 1.25, 20)
      const le = new THREE.Mesh(earGeo, bodyMat)
      le.position.set(-0.95, 1.6, 0)
      le.rotation.z = 0.25
      leftEar = le
      mascotGroup.add(le)

      const re = new THREE.Mesh(earGeo, bodyMat)
      re.position.set(0.95, 1.6, 0)
      re.rotation.z = -0.25
      rightEar = re
      mascotGroup.add(re)

      // Fluffy Fox Tail
      const tailGeo = new THREE.ConeGeometry(0.65, 1.8, 20)
      tailGeo.rotateX(-Math.PI / 2.8)
      const tl = new THREE.Mesh(tailGeo, bodyMat)
      tl.position.set(0, -0.5, -1.2)
      tail = tl
      mascotGroup.add(tl)

      // Little Star on Head
      const starGeo = new THREE.OctahedronGeometry(0.35)
      const star = new THREE.Mesh(starGeo, accentMat)
      star.position.set(0, 1.8, 0.5)
      crown = star
      mascotGroup.add(star)

    } else if (character === "zen") {
      // ZEN: Smart Cyber Bot
      const headGeo = new THREE.BoxGeometry(2.3, 2.1, 2.1)
      const headMesh = new THREE.Mesh(headGeo, bodyMat)
      mascotGroup.add(headMesh)

      // Glass Visor
      const visorGeo = new THREE.BoxGeometry(1.9, 0.9, 0.3)
      const visorMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.1,
        metalness: 0.9,
      })
      const visor = new THREE.Mesh(visorGeo, visorMat)
      visor.position.set(0, 0.15, 1.05)
      mascotGroup.add(visor)

      // Antenna
      const antBaseGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 16)
      const antMesh = new THREE.Mesh(antBaseGeo, accentMat)
      antMesh.position.set(0, 1.4, 0)
      const antBallGeo = new THREE.SphereGeometry(0.28, 16, 16)
      const antBall = new THREE.Mesh(antBallGeo, accentMat)
      antBall.position.set(0, 0.45, 0)
      antMesh.add(antBall)
      crown = antMesh
      mascotGroup.add(antMesh)

      // Floating Cyber Ear Headphones
      const earPadGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.4, 20)
      earPadGeo.rotateZ(Math.PI / 2)
      const le = new THREE.Mesh(earPadGeo, accentMat)
      le.position.set(-1.3, 0.15, 0)
      leftEar = le
      mascotGroup.add(le)

      const re = new THREE.Mesh(earPadGeo, accentMat)
      re.position.set(1.3, 0.15, 0)
      rightEar = re
      mascotGroup.add(re)
    }

    // EYES & CHEEKS (Common to all kawaii characters except Zen visor)
    if (character !== "zen") {
      const eyeGeo = new THREE.SphereGeometry(0.26, 20, 20)
      const eyeGlintGeo = new THREE.SphereGeometry(0.1, 16, 16)

      // Left Eye
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
      leftEye.position.set(-0.52, 0.35, 1.4)
      const leftGlint = new THREE.Mesh(eyeGlintGeo, eyeGlintMat)
      leftGlint.position.set(-0.06, 0.08, 0.22)
      leftEye.add(leftGlint)
      mascotGroup.add(leftEye)

      // Right Eye
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
      rightEye.position.set(0.52, 0.35, 1.4)
      const rightGlint = new THREE.Mesh(eyeGlintGeo, eyeGlintMat)
      rightGlint.position.set(-0.06, 0.08, 0.22)
      rightEye.add(rightGlint)
      mascotGroup.add(rightEye)

      // Cheeks (Blush)
      const blushGeo = new THREE.CircleGeometry(0.24, 16)
      const leftBlush = new THREE.Mesh(blushGeo, blushMat)
      leftBlush.position.set(-0.95, 0.05, 1.3)
      leftBlush.rotation.y = -0.3
      mascotGroup.add(leftBlush)

      const rightBlush = new THREE.Mesh(blushGeo, blushMat)
      rightBlush.position.set(0.95, 0.05, 1.3)
      rightBlush.rotation.y = 0.3
      mascotGroup.add(rightBlush)
    } else {
      // Zen Cyan/Purple Glowing Visor Eyes
      const ledEyeGeo = new THREE.SphereGeometry(0.18, 16, 16)
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })

      const leftLed = new THREE.Mesh(ledEyeGeo, ledMat)
      leftLed.position.set(-0.45, 0.15, 1.22)
      mascotGroup.add(leftLed)

      const rightLed = new THREE.Mesh(ledEyeGeo, ledMat)
      rightLed.position.set(0.45, 0.15, 1.22)
      mascotGroup.add(rightLed)
    }

    // 5. Ambient Sparkle Particles
    let particleSystem: THREE.Points | null = null
    if (showParticles) {
      const pCount = 36
      const pGeo = new THREE.BufferGeometry()
      const pPos = new Float32Array(pCount * 3)

      for (let i = 0; i < pCount; i++) {
        const radius = 2.4 + Math.random() * 1.8
        const theta = Math.random() * Math.PI * 2
        const phi = (Math.random() - 0.5) * Math.PI
        pPos[i * 3] = radius * Math.cos(theta) * Math.cos(phi)
        pPos[i * 3 + 1] = radius * Math.sin(phi)
        pPos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi)
      }
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3))

      const pMat = new THREE.PointsMaterial({
        color: palette.particle,
        size: 0.14,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      })
      particleSystem = new THREE.Points(pGeo, pMat)
      scene.add(particleSystem)
    }

    // 6. Interactive Cursor Tracking & Animation Loop
    let mouseX = 0
    let mouseY = 0
    let targetRotY = 0
    let targetRotX = 0
    let spinVelocity = 0
    let hopOffset = 0
    let hopVelocity = 0

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return
      const rect = container.getBoundingClientRect()
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

      const x = ((clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1)

      mouseX = THREE.MathUtils.clamp(x, -1, 1)
      mouseY = THREE.MathUtils.clamp(y, -1, 1)
      targetRotY = mouseX * 0.45
      targetRotX = -mouseY * 0.3
    }

    const handleTap = () => {
      setIsInteracting(true)
      spinVelocity = 0.35
      hopVelocity = 0.28
      clickCount.current += 1
      setTimeout(() => setIsInteracting(false), 900)
      onClick?.()
    }

    if (interactive) {
      container.addEventListener("mousemove", handlePointerMove)
      container.addEventListener("touchmove", handlePointerMove, { passive: true })
      container.addEventListener("click", handleTap)
    }

    // Animation Render Loop
    let clock = new THREE.Clock()
    let frameId: number

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Physics Hop & Spin on Tap
      if (hopVelocity > 0 || hopOffset > 0) {
        hopOffset += hopVelocity
        hopVelocity -= 0.02
        if (hopOffset <= 0) {
          hopOffset = 0
          hopVelocity = 0
        }
      }

      if (spinVelocity > 0.005) {
        mascotGroup.rotation.y += spinVelocity
        spinVelocity *= 0.92
      } else {
        // Smooth cursor follow
        mascotGroup.rotation.y = THREE.MathUtils.lerp(mascotGroup.rotation.y, targetRotY, 0.08)
      }

      mascotGroup.rotation.x = THREE.MathUtils.lerp(mascotGroup.rotation.x, targetRotX, 0.08)

      // Mood-based Idle Floating / Bobbing
      let idleFloat = Math.sin(t * 2.2) * 0.12
      if (mood === "cheering" || mood === "excited") {
        idleFloat = Math.sin(t * 5.0) * 0.22
        mascotGroup.rotation.z = Math.sin(t * 4.0) * 0.08
      } else if (mood === "thinking") {
        idleFloat = Math.sin(t * 1.5) * 0.08
        mascotGroup.rotation.z = 0.12 + Math.sin(t * 1.5) * 0.04
      }

      mascotGroup.position.y = idleFloat + hopOffset

      // Sub-part secondary motion
      if (leftEar && rightEar) {
        const earWiggle = Math.sin(t * 3.5) * 0.06
        leftEar.rotation.z = 0.15 + earWiggle
        rightEar.rotation.z = -0.15 - earWiggle
      }

      if (leftWing && rightWing) {
        const wingFlap = Math.sin(t * 4.5) * 0.14
        leftWing.rotation.z = Math.PI / 2.6 + wingFlap
        rightWing.rotation.z = -(Math.PI / 2.6 + wingFlap)
      }

      if (tail) {
        tail.rotation.y = Math.sin(t * 4.0) * 0.25
      }

      if (crown) {
        crown.rotation.y = t * 1.5
      }

      // Rotate particle aura
      if (particleSystem) {
        particleSystem.rotation.y = t * 0.2
        particleSystem.rotation.x = Math.sin(t * 0.3) * 0.1
      }

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup on Unmount
    return () => {
      cancelAnimationFrame(frameId)
      if (interactive) {
        container.removeEventListener("mousemove", handlePointerMove)
        container.removeEventListener("touchmove", handlePointerMove)
        container.removeEventListener("click", handleTap)
      }
      renderer.dispose()
      scene.clear()
    }
  }, [webGLOk, character, mood, size, interactive, showParticles, onClick])

  // Fallback if WebGL is unavailable
  if (webGLOk === false) {
    return (
      <AssessmentMascot
        character={character}
        mood={mood}
        size={size}
        showSpeechBubble={showSpeechBubble}
        message={message}
        className={className}
      />
    )
  }

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Interactive Speech Bubble */}
      {showSpeechBubble && (
        <div className="mb-2 max-w-[240px] rounded-2xl bg-white/95 px-3.5 py-1.5 text-center text-xs font-bold text-slate-800 shadow-xl border border-slate-200/80 backdrop-blur-md relative z-10 animate-in fade-in zoom-in duration-300">
          {message}
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-200/80 rotate-45" />
        </div>
      )}

      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        style={{ width: size, height: size }}
        className={`relative cursor-pointer transition-transform duration-200 ${
          isInteracting ? "scale-105" : "hover:scale-[1.03]"
        }`}
        title="Klik atau sentuh aku! ✨"
      />

      {/* Interactive touch hint badge */}
      {interactive && (
        <span className="mt-1 text-[9px] font-semibold text-slate-400 opacity-60 tracking-tight">
          Sentuh / Putar 3D ✨
        </span>
      )}
    </div>
  )
}
