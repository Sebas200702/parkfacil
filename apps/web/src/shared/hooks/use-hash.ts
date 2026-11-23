import { useSyncExternalStore } from 'react'

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

const getHash = () => window.location.hash

/** Hash actual de la URL; se actualiza cuando cambia. */
export const useHash = (): string => useSyncExternalStore(subscribe, getHash)
