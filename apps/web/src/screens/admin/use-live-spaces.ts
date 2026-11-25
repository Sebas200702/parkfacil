import { api } from '@lib/api'
import type { Espacio } from '@lib/types'
import { useCallback, useEffect, useRef, useState } from 'react'

export const REFRESH_MS = 5000

/** Consulta /admin/espacios cada 5 s sin solapar peticiones en curso. */
export const useLiveSpaces = () => {
  const [spaces, setSpaces] = useState<Espacio[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const inFlight = useRef(false)
  const mounted = useRef(true)

  const refresh = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    setRefreshing(true)
    const res = await api.get<Espacio[]>('/admin/espacios')
    inFlight.current = false
    if (!mounted.current) return
    setRefreshing(false)
    if (res.error) {
      setError(res.error.message)
      return
    }
    setError(null)
    setSpaces(res.data ?? [])
    setUpdatedAt(new Date())
  }, [])

  useEffect(() => {
    mounted.current = true
    void refresh()
    const timer = setInterval(() => void refresh(), REFRESH_MS)
    return () => {
      mounted.current = false
      clearInterval(timer)
    }
  }, [refresh])

  return { spaces, error, updatedAt, refreshing, refresh }
}
