import { AdminScreen } from './admin-screen'

// Con exportación estática cada ruta debe conocerse al compilar: /admin y sus tres secciones.
export const generateStaticParams = () => [
  { section: [] },
  { section: ['espacios'] },
  { section: ['tarifas'] },
  { section: ['metricas'] },
]

export const dynamicParams = false

/** Rutas "/admin", "/admin/espacios", "/admin/tarifas" y "/admin/metricas". */
export default function AdminPage() {
  return <AdminScreen />
}
