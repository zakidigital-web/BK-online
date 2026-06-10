"use client"

import { useState, useEffect, useCallback } from "react"
import { Wifi, WifiOff } from "lucide-react"

interface OnlineUser {
  id: string
  name: string
  role: string
  lastSeen: string | null
}

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000

function isOnline(lastSeen: string | null): boolean {
  if (!lastSeen) return false
  return Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS
}

export function OnlineIndicator({ minimal = false }: { minimal?: boolean }) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/user/online-status")
      const data = await res.json()
      setOnlineUsers(data.users || [])
    } catch {}
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30_000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const onlineCount = onlineUsers.filter((u) => isOnline(u.lastSeen)).length

  if (minimal) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        {onlineCount > 0 ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="text-green-600 font-medium">{onlineCount} Guru BK Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 text-gray-400" />
            <span className="text-gray-400">Guru BK sedang offline</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-900">Status Guru BK</h4>
      <div className="space-y-1.5">
        {onlineUsers.length === 0 && (
          <p className="text-xs text-gray-400">Memuat...</p>
        )}
        {onlineUsers.map((u) => (
          <div key={u.id} className="flex items-center gap-2 text-sm">
            {isOnline(u.lastSeen) ? (
              <Wifi className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-gray-300" />
            )}
            <span className={isOnline(u.lastSeen) ? "text-gray-900 font-medium" : "text-gray-400"}>
              {u.name}
            </span>
            <span className="text-[10px] text-gray-400 uppercase">{u.role}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
