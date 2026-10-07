export interface SessionPayload {
  id: string
  name: string
  username: string
  role: string
  anonymousId?: string | null
  exp: number
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: SESSION_SECRET must be configured in environment variables!")
    }
    return "dev-bk-session-secret-local-development-only"
  }
  return secret
}

// Web Crypto API helpers (compatible with Node.js, Vercel Edge Runtime, and browser)
async function getCryptoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(getSessionSecret())
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  while (base64.length % 4) {
    base64 += "="
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function createSessionToken(user: {
  id: string
  name: string
  username: string
  role: string
  anonymousId?: string | null
}): Promise<string> {
  const payload: SessionPayload = {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    anonymousId: user.anonymousId || null,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
  }

  const encoder = new TextEncoder()
  const jsonStr = JSON.stringify(payload)
  const encodedPayload = base64UrlEncode(encoder.encode(jsonStr))

  const key = await getCryptoKey()
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(encodedPayload)
  )

  const signature = base64UrlEncode(new Uint8Array(signatureBuffer))
  return `${encodedPayload}.${signature}`
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") return null
  const parts = token.split(".")
  if (parts.length !== 2) return null

  const [encodedPayload, signatureStr] = parts

  try {
    const key = await getCryptoKey()
    const encoder = new TextEncoder()
    const signatureBytes = base64UrlDecode(signatureStr)

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as BufferSource,
      encoder.encode(encodedPayload)
    )

    if (!isValid) return null

    const payloadBytes = base64UrlDecode(encodedPayload)
    const decoder = new TextDecoder()
    const payload = JSON.parse(decoder.decode(payloadBytes)) as SessionPayload

    if (!payload.exp || Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export async function getServerSession(): Promise<SessionPayload | null> {
  try {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const token = cookieStore.get("bk_session")?.value
    if (!token) return null
    return await verifySessionToken(token)
  } catch {
    return null
  }
}
