'use client'

import { AdminRoute } from '@components/AdminRoute'
import { AdminLayout } from '@pages/admin/AdminLayout'
import { useNavigate } from '@shared/hooks/use-navigate'
import { usePathname } from 'next/navigation'

/** Panel del administrador. La sección activa sale de la ruta. */
export const AdminScreen = () => {
  const navigate = useNavigate()
  const pathname = usePathname()

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6">
      <AdminRoute onNavigate={navigate}>
        <AdminLayout currentRoute={pathname} onNavigate={navigate} />
      </AdminRoute>
    </main>
  )
}
