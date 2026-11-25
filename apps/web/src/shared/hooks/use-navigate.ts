'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

/** Navega a una ruta de la app: navigate('/login'). */
export const useNavigate = (): ((route: string) => void) => {
  const router = useRouter()
  return useCallback((route: string) => router.push(route), [router])
}
