"use client"

import React from "react"
import { motion } from "framer-motion"

export type MascotCharacter = "kimi" | "piko" | "mimi" | "sparky" | "zen"
export type MascotMood = "happy" | "thinking" | "cheering" | "calm" | "excited"

export const MASCOT_CHARACTERS: Record<
  MascotCharacter,
  {
    name: string
    title: string
    description: string
    color: string
    bgLight: string
    accentText: string
    badgeBg: string
  }
> = {
  kimi: {
    name: "Kimi",
    title: "Konselor Sahabat",
    description: "Pemandu eksplorasi minat, bakat, dan cita-cita masa depanmu.",
    color: "from-emerald-500 to-teal-600",
    bgLight: "from-emerald-50 via-teal-50 to-white",
    accentText: "text-emerald-600",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  piko: {
    name: "Piko",
    title: "Pemandu Belajar",
    description: "Kelinci cerdas yang membantumu menemukan cara belajar paling seru!",
    color: "from-blue-500 to-indigo-600",
    bgLight: "from-blue-50 via-indigo-50 to-white",
    accentText: "text-blue-600",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
  },
  mimi: {
    name: "Mimi",
    title: "Teman Cerita & Hati",
    description: "Beruang awan yang hangat, selalu siap mendengarkan perasaanmu.",
    color: "from-rose-400 to-orange-400",
    bgLight: "from-rose-50 via-orange-50 to-white",
    accentText: "text-rose-600",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
  },
  sparky: {
    name: "Sparky",
    title: "Penjelajah Karakter",
    description: "Rubah bintang penuh energi untuk mengenali 18 nilai positifmu!",
    color: "from-amber-500 to-orange-500",
    bgLight: "from-amber-50 via-orange-50 to-white",
    accentText: "text-amber-600",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
  },
  zen: {
    name: "Zen",
    title: "Analis Kepribadian",
    description: "Robot pintar penjelajah tipe kepribadian dan potensi alamimu.",
    color: "from-indigo-500 to-violet-600",
    bgLight: "from-indigo-50 via-purple-50 to-white",
    accentText: "text-indigo-600",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
}

interface MascotProps {
  character?: MascotCharacter
  mood?: MascotMood
  size?: number
  className?: string
  showSpeechBubble?: boolean
  message?: string
  animated?: boolean
}

export function AssessmentMascot({
  character = "kimi",
  mood = "happy",
  size = 120,
  className = "",
  showSpeechBubble = false,
  message = "Semangat selalu ya!",
  animated = true,
}: MascotProps) {
  const w = size
  const h = size

  // Motion variants based on mood
  const motionAnim = animated
    ? mood === "cheering"
      ? { y: [0, -10, 0, -5, 0], rotate: [0, -4, 4, -2, 0] }
      : mood === "excited"
      ? { y: [0, -8, 0], scale: [1, 1.04, 1] }
      : mood === "thinking"
      ? { rotate: [0, 6, 0, -6, 0], y: [0, -3, 0] }
      : { y: [0, -5, 0] }
    : {}

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble with speech tip */}
      {showSpeechBubble && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 360, damping: 24 }}
          className="mb-2 max-w-[220px] rounded-2xl bg-white/95 px-3.5 py-1.5 text-center text-xs font-semibold text-slate-800 shadow-lg border border-slate-200/80 backdrop-blur-sm relative z-10"
        >
          {message}
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-200/80 rotate-45" />
        </motion.div>
      )}

      {/* Animated Character Wrapper */}
      <motion.div
        animate={motionAnim}
        transition={{
          repeat: Infinity,
          duration: mood === "cheering" ? 2.2 : mood === "excited" ? 2.6 : 3.4,
          ease: "easeInOut",
        }}
        style={{ width: w, height: h }}
        className="relative filter drop-shadow-md"
      >
        <svg
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.12" />
            </filter>

            {/* Gradients */}
            <linearGradient id="kimiGrad" x1="20" y1="20" x2="140" y2="150" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34D399" />
              <stop offset="0.5" stopColor="#3B82F6" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>

            <linearGradient id="pikoGrad" x1="30" y1="20" x2="130" y2="145" gradientUnits="userSpaceOnUse">
              <stop stopColor="#93C5FD" />
              <stop offset="0.6" stopColor="#60A5FA" />
              <stop offset="1" stopColor="#818CF8" />
            </linearGradient>

            <linearGradient id="mimiGrad" x1="20" y1="20" x2="140" y2="150" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDBA74" />
              <stop offset="0.45" stopColor="#FDA4AF" />
              <stop offset="1" stopColor="#FB7185" />
            </linearGradient>

            <linearGradient id="sparkyGrad" x1="30" y1="20" x2="130" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" />
              <stop offset="0.5" stopColor="#FB923C" />
              <stop offset="1" stopColor="#F97316" />
            </linearGradient>

            <linearGradient id="zenGrad" x1="25" y1="25" x2="135" y2="145" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="0.5" stopColor="#818CF8" />
              <stop offset="1" stopColor="#C084FC" />
            </linearGradient>

            <linearGradient id="pinkBlush" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#F472B6" stopOpacity="0.75" />
              <stop offset="1" stopColor="#FDA4AF" stopOpacity="0.3" />
            </linearGradient>

            <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#F43F5E" />
              <stop offset="1" stopColor="#FB7185" />
            </linearGradient>
          </defs>

          {/* CHARACTER: KIMI (Counselor Jelly) */}
          {character === "kimi" && (
            <g filter="url(#softGlow)">
              {/* Ears */}
              <ellipse cx="44" cy="38" rx="8" ry="14" fill="#3B82F6" transform="rotate(-25 44 38)" />
              <ellipse cx="44" cy="38" rx="4.5" ry="9" fill="#BFDBFE" transform="rotate(-25 44 38)" />
              <ellipse cx="116" cy="38" rx="8" ry="14" fill="#6366F1" transform="rotate(25 116 38)" />
              <ellipse cx="116" cy="38" rx="4.5" ry="9" fill="#DDD6FE" transform="rotate(25 116 38)" />

              {/* Body */}
              <path
                d="M80 30C48 30 34 54 34 90C34 122 52 136 80 136C108 136 126 122 126 90C126 54 112 30 80 30Z"
                fill="url(#kimiGrad)"
              />

              {/* Graduation Cap */}
              <g transform="translate(62, 12)">
                <polygon points="18,4 36,12 18,20 0,12" fill="#312E81" />
                <polygon points="18,17 32,12 18,7 4,12" fill="#6366F1" />
                <path d="M30 14L34 22" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                <circle cx="34" cy="23" r="2.5" fill="#F59E0B" />
              </g>

              {/* Cheeks */}
              <circle cx="48" cy="95" r="7.5" fill="url(#pinkBlush)" />
              <circle cx="112" cy="95" r="7.5" fill="url(#pinkBlush)" />

              {/* Face Details */}
              <FaceMood mood={mood} eyeY={80} mouthY={94} />

              {/* Hands */}
              {mood === "cheering" ? (
                <g>
                  <ellipse cx="26" cy="68" rx="7" ry="9" fill="#93C5FD" transform="rotate(-30 26 68)" />
                  <ellipse cx="134" cy="68" rx="7" ry="9" fill="#C7D2FE" transform="rotate(30 134 68)" />
                </g>
              ) : (
                <g>
                  <ellipse cx="38" cy="102" rx="6.5" ry="8" fill="#93C5FD" />
                  <ellipse cx="122" cy="102" rx="6.5" ry="8" fill="#C7D2FE" />
                </g>
              )}
            </g>
          )}

          {/* CHARACTER: PIKO (VARK Study Bunny with Glasses/Headphones) */}
          {character === "piko" && (
            <g filter="url(#softGlow)">
              {/* Bunny Long Ears */}
              <motion.g
                animate={mood === "cheering" ? { rotate: [-4, 4, -4] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <path d="M48 55C40 30 40 10 52 10C62 10 60 30 56 55Z" fill="#93C5FD" />
                <path d="M50 48C46 30 46 16 52 16C58 16 56 30 54 48Z" fill="#FCE7F3" />

                <path d="M112 55C120 30 120 10 108 10C98 10 100 30 104 55Z" fill="#818CF8" />
                <path d="M110 48C114 30 114 16 108 16C102 16 104 30 106 48Z" fill="#FCE7F3" />
              </motion.g>

              {/* Body */}
              <path
                d="M80 44C50 44 38 64 38 96C38 126 56 138 80 138C104 138 122 126 122 96C122 64 110 44 80 44Z"
                fill="url(#pikoGrad)"
              />

              {/* White Bunny Belly */}
              <ellipse cx="80" cy="108" rx="26" ry="22" fill="#FFFFFF" opacity="0.6" />

              {/* Cheeks */}
              <circle cx="50" cy="98" r="7" fill="url(#pinkBlush)" />
              <circle cx="110" cy="98" r="7" fill="url(#pinkBlush)" />

              {/* Cute Round Glasses */}
              <g stroke="#1E293B" strokeWidth="2.5">
                <circle cx="62" cy="84" r="13" fill="#FFFFFF" fillOpacity="0.45" />
                <circle cx="98" cy="84" r="13" fill="#FFFFFF" fillOpacity="0.45" />
                <path d="M75 84H85" strokeLinecap="round" />
              </g>

              {/* Face Details */}
              <FaceMood mood={mood} eyeY={84} mouthY={98} />

              {/* Bunny Nose */}
              <polygon points="78,92 82,92 80,95" fill="#F43F5E" />

              {/* Hands holding a mini notebook or cheering */}
              {mood === "cheering" ? (
                <g>
                  <ellipse cx="32" cy="72" rx="7" ry="8" fill="#DBEAFE" transform="rotate(-25 32 72)" />
                  <ellipse cx="128" cy="72" rx="7" ry="8" fill="#DBEAFE" transform="rotate(25 128 72)" />
                </g>
              ) : (
                <g>
                  {/* Little pencil and pad */}
                  <rect x="68" y="108" width="24" height="20" rx="3" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
                  <path d="M72 113H88M72 118H84" stroke="#A16207" strokeWidth="1.5" strokeLinecap="round" />
                  <ellipse cx="64" cy="116" rx="5" ry="6" fill="#DBEAFE" />
                  <ellipse cx="96" cy="116" rx="5" ry="6" fill="#DBEAFE" />
                </g>
              )}
            </g>
          )}

          {/* CHARACTER: MIMI (Emotional Wellness Warm Cloud Bear) */}
          {character === "mimi" && (
            <g filter="url(#softGlow)">
              {/* Cute Round Bear Ears */}
              <circle cx="48" cy="46" r="16" fill="#FB7185" />
              <circle cx="48" cy="46" r="9" fill="#FFE4E6" />
              <circle cx="112" cy="46" r="16" fill="#FB923C" />
              <circle cx="112" cy="46" r="9" fill="#FFE4E6" />

              {/* Fluffy Round Head/Body */}
              <path
                d="M80 38C52 38 38 58 38 92C38 124 54 138 80 138C106 138 122 124 122 92C122 58 108 38 80 38Z"
                fill="url(#mimiGrad)"
              />

              {/* Muzzle Snout */}
              <ellipse cx="80" cy="94" rx="16" ry="12" fill="#FFF1F2" />
              <ellipse cx="80" cy="90" rx="4.5" ry="3.5" fill="#881337" />

              {/* Cheeks */}
              <circle cx="46" cy="94" r="8" fill="url(#pinkBlush)" />
              <circle cx="114" cy="94" r="8" fill="url(#pinkBlush)" />

              {/* Face Details */}
              <FaceMood mood={mood} eyeY={80} mouthY={98} />

              {/* Heart in hands or hugging */}
              <g transform="translate(68, 108)">
                <path
                  d="M12 4C8 0 2 1 1 7C-1 13 8 18 12 22C16 18 25 13 23 7C22 1 16 0 12 4Z"
                  fill="url(#heartGrad)"
                />
              </g>
              <ellipse cx="64" cy="118" rx="6" ry="6" fill="#FDA4AF" />
              <ellipse cx="96" cy="118" rx="6" ry="6" fill="#FDA4AF" />
            </g>
          )}

          {/* CHARACTER: SPARKY (Karakter Diri Star Fox) */}
          {character === "sparky" && (
            <g filter="url(#softGlow)">
              {/* Fox Pointy Ears */}
              <polygon points="34,60 48,22 66,54" fill="#EA580C" />
              <polygon points="38,56 48,28 62,52" fill="#FED7AA" />

              <polygon points="126,60 112,22 94,54" fill="#EA580C" />
              <polygon points="122,56 112,28 98,52" fill="#FED7AA" />

              {/* Body */}
              <path
                d="M80 40C52 40 40 60 40 94C40 126 56 138 80 138C104 138 120 126 120 94C120 60 108 40 80 40Z"
                fill="url(#sparkyGrad)"
              />

              {/* Fox Cheek Fluff */}
              <polygon points="36,92 26,100 38,104" fill="#FED7AA" />
              <polygon points="124,92 134,100 122,104" fill="#FED7AA" />

              {/* Star on Forehead */}
              <polygon
                points="80,48 83,55 90,56 85,61 86,68 80,64 74,68 75,61 70,56 77,55"
                fill="#FEF08A"
                stroke="#EAB308"
                strokeWidth="1"
              />

              {/* Cheeks */}
              <circle cx="48" cy="98" r="7" fill="url(#pinkBlush)" />
              <circle cx="112" cy="98" r="7" fill="url(#pinkBlush)" />

              {/* Little Fox Nose */}
              <circle cx="80" cy="92" r="3.5" fill="#1C1917" />

              {/* Face Details */}
              <FaceMood mood={mood} eyeY={82} mouthY={98} />

              {/* Hands & Star Badge */}
              {mood === "cheering" ? (
                <g>
                  <ellipse cx="28" cy="74" rx="7" ry="8" fill="#FED7AA" transform="rotate(-30 28 74)" />
                  <ellipse cx="132" cy="74" rx="7" ry="8" fill="#FED7AA" transform="rotate(30 132 74)" />
                </g>
              ) : (
                <g>
                  <ellipse cx="44" cy="110" rx="6" ry="7" fill="#FED7AA" />
                  <ellipse cx="116" cy="110" rx="6" ry="7" fill="#FED7AA" />
                  {/* Glowing medal / medal ribbon */}
                  <circle cx="80" cy="116" r="9" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
                  <polygon
                    points="80,111 82,115 86,115 83,118 84,122 80,119 76,122 77,118 74,115 78,115"
                    fill="#FFFFFF"
                  />
                </g>
              )}
            </g>
          )}

          {/* CHARACTER: ZEN (MBTI Cognitive Smart Bot) */}
          {character === "zen" && (
            <g filter="url(#softGlow)">
              {/* Antenna with Lightbulb / Prism Orb */}
              <line x1="80" y1="36" x2="80" y2="18" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" />
              <circle cx="80" cy="14" r="8" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
              <circle cx="78" cy="12" r="2.5" fill="#FFFFFF" />

              {/* Side Antenna Ears */}
              <rect x="26" y="70" width="8" height="18" rx="4" fill="#818CF8" />
              <rect x="126" y="70" width="8" height="18" rx="4" fill="#818CF8" />

              {/* Robot Rounded Chassis */}
              <rect x="34" y="36" width="92" height="96" rx="34" fill="url(#zenGrad)" />

              {/* Digital Screen Visor */}
              <rect x="44" y="60" width="72" height="42" rx="16" fill="#0F172A" stroke="#1E293B" strokeWidth="2" />

              {/* Visor Glare */}
              <path d="M48 68L68 68" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

              {/* Pixel / Cyber Eyes on Screen */}
              {mood === "cheering" ? (
                <g stroke="#38BDF8" strokeWidth="3" strokeLinecap="round">
                  <path d="M54 78L62 74L70 78" />
                  <path d="M90 78L98 74L106 78" />
                </g>
              ) : mood === "thinking" ? (
                <g fill="#38BDF8">
                  <circle cx="62" cy="78" r="5" />
                  <line x1="90" y1="78" x2="106" y2="78" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                </g>
              ) : (
                <g fill="#38BDF8">
                  <rect x="56" y="74" width="10" height="10" rx="3" />
                  <rect x="94" y="74" width="10" height="10" rx="3" />
                </g>
              )}

              {/* Cute Digital Pixel Smile */}
              <path
                d="M74 88C76 91 84 91 86 88"
                stroke="#38BDF8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Cheeks */}
              <circle cx="48" cy="98" r="5" fill="#F472B6" opacity="0.8" />
              <circle cx="112" cy="98" r="5" fill="#F472B6" opacity="0.8" />

              {/* Core / MBTI Crystal Gem */}
              <circle cx="80" cy="116" r="6" fill="#22D3EE" stroke="#0891B2" strokeWidth="1.5" />

              {/* Floating Hands */}
              <ellipse cx="28" cy="98" rx="6" ry="7" fill="#818CF8" />
              <ellipse cx="132" cy="98" rx="6" ry="7" fill="#818CF8" />
            </g>
          )}

          {/* Sparkles / Magic Stars Around Companion */}
          <g>
            <path
              d="M24 44L25.5 48.5L30 50L25.5 51.5L24 56L22.5 51.5L18 50L22.5 48.5Z"
              fill="#FBBF24"
              opacity="0.85"
            />
            <path
              d="M136 44L137.5 48.5L142 50L137.5 51.5L136 56L134.5 51.5L130 50L134.5 48.5Z"
              fill="#FBBF24"
              opacity="0.85"
            />
          </g>
        </svg>
      </motion.div>
    </div>
  )
}

/**
 * Shared face expressions based on mood
 */
function FaceMood({ mood, eyeY, mouthY }: { mood: MascotMood; eyeY: number; mouthY: number }) {
  if (mood === "happy") {
    return (
      <g>
        {/* Happy curved eyes ^^ */}
        <path
          d={`M52 ${eyeY}C56 ${eyeY - 7} 66 ${eyeY - 7} 70 ${eyeY}`}
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d={`M90 ${eyeY}C94 ${eyeY - 7} 104 ${eyeY - 7} 108 ${eyeY}`}
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Happy smile */}
        <path
          d={`M72 ${mouthY}C76 ${mouthY + 5} 84 ${mouthY + 5} 88 ${mouthY}`}
          stroke="#0F172A"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </g>
    )
  }

  if (mood === "cheering") {
    return (
      <g>
        {/* Star sparkle eyes */}
        <path
          d={`M57 ${eyeY - 8}L59 ${eyeY - 2}L65 ${eyeY}L59 ${eyeY + 2}L57 ${eyeY + 8}L55 ${eyeY + 2}L49 ${eyeY}L55 ${eyeY - 2}Z`}
          fill="#F59E0B"
        />
        <path
          d={`M99 ${eyeY - 8}L101 ${eyeY - 2}L107 ${eyeY}L101 ${eyeY + 2}L99 ${eyeY + 8}L97 ${eyeY + 2}L91 ${eyeY}L97 ${eyeY - 2}Z`}
          fill="#F59E0B"
        />
        {/* Big open smile with tongue */}
        <path d={`M70 ${mouthY}C70 ${mouthY + 10} 90 ${mouthY + 10} 90 ${mouthY}Z`} fill="#DC2626" />
        <path
          d={`M74 ${mouthY + 4}C77 ${mouthY + 1} 83 ${mouthY + 1} 86 ${mouthY + 4}C84 ${mouthY + 7} 76 ${mouthY + 7} 74 ${mouthY + 4}Z`}
          fill="#F472B6"
        />
      </g>
    )
  }

  if (mood === "thinking") {
    return (
      <g>
        <circle cx="60" cy={eyeY - 1} r="6.5" fill="#0F172A" />
        <circle cx="58" cy={eyeY - 3} r="2.2" fill="#FFFFFF" />
        <path
          d={`M92 ${eyeY}C96 ${eyeY - 4} 104 ${eyeY - 4} 108 ${eyeY}`}
          stroke="#0F172A"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Tiny 'o' mouth */}
        <circle cx="80" cy={mouthY} r="3" fill="#0F172A" />
      </g>
    )
  }

  // excited / calm
  return (
    <g>
      {/* Big sparkling curious eyes */}
      <ellipse cx="60" cy={eyeY} rx="6" ry="7.5" fill="#0F172A" />
      <circle cx="58" cy={eyeY - 3} r="2.8" fill="#FFFFFF" />
      <circle cx="62" cy={eyeY + 3} r="1.5" fill="#93C5FD" />

      <ellipse cx="100" cy={eyeY} rx="6" ry="7.5" fill="#0F172A" />
      <circle cx="98" cy={eyeY - 3} r="2.8" fill="#FFFFFF" />
      <circle cx="102" cy={eyeY + 3} r="1.5" fill="#93C5FD" />

      {/* Gentle smile */}
      <path
        d={`M73 ${mouthY}C76 ${mouthY + 4} 84 ${mouthY + 4} 87 ${mouthY}`}
        stroke="#0F172A"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  )
}
