"use client"

import { useEffect, useRef } from "react"

const HEARTBEAT_INTERVAL = 60_000

export function useHeartbeat(userId: string | null | undefined) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!userId) return

    const ping = () => {
      fetch("/api/user/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      }).catch(() => {})
    }

    ping()
    intervalRef.current = setInterval(ping, HEARTBEAT_INTERVAL)

    const onVisibility = () => {
      if (document.visibilityState === "visible") ping()
    }
    document.addEventListener("visibilitychange", onVisibility)

    const onFocus = () => ping()
    window.addEventListener("focus", onFocus)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("focus", onFocus)
    }
  }, [userId])
}
