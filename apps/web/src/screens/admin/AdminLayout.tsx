import { useAuth } from '@context/AuthContext'
import { getAdminParqueaderoId } from '@lib/token'
import { LiveSpacesPage } from '@pages/admin/LiveSpacesPage'
import { MetricsPage } from '@pages/admin/MetricsPage'
import { TariffsPage } from '@pages/admin/TariffsPage'
import { Segmented, type SegmentedOption } from '@shared/ui/segmented'
import { BarChart3, Car, DollarSign } from 'lucide-react'
import { useEffect, useMemo } from 'react'

export interface AdminLayoutProps {
  currentRoute?: string
  onNavigate?: (route: string) => void
}

export type AdminSection = 'espacios' | 'tarifas' | 'metricas'

const SECTIONS: ReadonlyArray<SegmentedOption<AdminSection>> = [
  { value: 'espacios', label: 'Espacios en vivo', icon: Car },
  { value: 'tarifas', label: 'Tarifas', icon: DollarSign },
  { value: 'metricas', label: 'Métricas', icon: BarChart3 },
]

export const AdminLayout = ({ currentRoute = '/admin/espacios', onNavigate }: AdminLayoutProps) => {
  const { idToken } = useAuth()
  const parqueaderoId = getAdminParqueaderoId(idToken)

  // Redirección por defecto de /admin hacia /admin/espacios
  useEffect(() => {
    if (currentRoute === '/admin' || currentRoute === '/admin/') {
      onNavigate?.('/admin/espacios')
    }
  }, [currentRoute, onNavigate])

  const activeSection: AdminSection = useMemo(() => {
    if (currentRoute.includes('tarifas')) return 'tarifas'
    if (currentRoute.includes('metricas')) return 'metricas'
    return 'espacios'
  }, [currentRoute])

  const handleSectionChange = (section: AdminSection) => {
    onNavigate?.(`/admin/${section}`)
  }

  return (
    <div className="grid gap-6">
      {/* Encabezado indicando el parqueadero administrado */}
      <div className="flex flex-col gap-2 rounded-plate border-2 border-asphalt-200 bg-paper p-4 shadow-sm sm:p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-title font-extrabold tracking-tight sm:text-display text-asphalt-950">
            Panel Administrativo
          </h1>
          <p className="mt-1 text-body text-asphalt-600">
            Gestión en tiempo real de parqueaderos, tarifas y métricas operativas.
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-x-2 rounded-plate border-2 border-brand-200 bg-brand-50 px-4 py-2 text-brand-900">
          <span className="text-caption font-bold uppercase tracking-wider text-brand-700">
            Parqueadero:
          </span>
          <strong className="break-all text-body font-mono font-extrabold text-brand-950">
            {parqueaderoId ?? 'Sin asignar'}
          </strong>
        </div>
      </div>

      {/* Navegación interna entre las tres secciones */}
      <div className="w-full">
        <Segmented<AdminSection>
          label="Secciones del panel administrativo"
          options={SECTIONS}
          value={activeSection}
          onChange={handleSectionChange}
        />
      </div>

      {/* Contenido de cada sección placeholder */}
      <div
        key={activeSection}
        className="animate-rise rounded-plate border-2 border-asphalt-200 bg-paper p-4 shadow-sm sm:p-6"
      >
        {activeSection === 'espacios' ? (
          <LiveSpacesPage />
        ) : activeSection === 'tarifas' ? (
          <TariffsPage />
        ) : (
          <MetricsPage />
        )}
      </div>
    </div>
  )
}
