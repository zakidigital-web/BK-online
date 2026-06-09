"use client"

import { createContext, useContext, useCallback, ReactNode, useSyncExternalStore } from "react"

export interface User {
  id: string
  name: string
  username: string
  role: string
  anonymousId: string | null
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<User>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = "bk_user"
const AUTH_CHANGE_EVENT = "bk-auth-change"

let cachedSnapshot: User | null = null
let cachedKey: string | null = null

function parseStoredUser(): User | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (stored === cachedKey) return cachedSnapshot

  cachedKey = stored

  if (!stored) {
    cachedSnapshot = null
    return null
  }

  try {
    const parsed = JSON.parse(stored)
    if (parsed?.id && parsed?.name && parsed?.username && parsed?.role) {
      cachedSnapshot = parsed
      return parsed
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  cachedSnapshot = null
  return null
}

function subscribeAuthStore(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {}

  const handleChange = () => onStoreChange()
  window.addEventListener("storage", handleChange)
  window.addEventListener(AUTH_CHANGE_EVENT, handleChange)

  return () => {
    window.removeEventListener("storage", handleChange)
    window.removeEventListener(AUTH_CHANGE_EVENT, handleChange)
  }
}

function notifyAuthChange() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribeAuthStore, parseStoredUser, () => null)
  const loading = false

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Login gagal")
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user))
    notifyAuthChange()
    return data.user as User
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    notifyAuthChange()
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
