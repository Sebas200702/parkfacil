import 'leaflet/dist/leaflet.css'
import './parking-map.css'
import type { Parking, VehicleType } from '@features/parkings/parking-types'
import { signMarkerHtml, signMarkerLabel } from '@features/parkings/utils/sign-marker-util'
import type { GeoPoint } from '@shared/utils/geo-util'
import L from 'leaflet'
import { useEffect, useRef } from 'react'

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const BOGOTA: L.LatLngTuple = [4.6767, -74.0483]
const FIT_PADDING: L.PointTuple = [56, 56]

type ParkingMapProps = {
  parkings: Parking[]
  vehicle: VehicleType
  selectedId: string | null
  onSelect: (id: string) => void
  userPosition: GeoPoint | null
}

const buildMarker = (parking: Parking, free: number, selected: boolean): L.Marker =>
  L.marker([parking.lat, parking.lng], {
    icon: L.divIcon({
      className: 'group outline-none',
      iconSize: [0, 0],
      html: signMarkerHtml(free, selected),
    }),
    title: parking.nombre,
    zIndexOffset: selected ? 1000 : 0,
  })

/** Mapa de OpenStreetMap en escala de grises: las placas P son el único color. */
export const ParkingMap = ({
  parkings,
  vehicle,
  selectedId,
  onSelect,
  userPosition,
}: ParkingMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const userRef = useRef<L.LayerGroup | null>(null)
  const onSelectRef = useRef(onSelect)
  const fittedRef = useRef('')
  const boundsRef = useRef<L.LatLngBounds | null>(null)
  const movedRef = useRef(false)
  const pannedRef = useRef<string | null>(null)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const map = L.map(container, {
      center: BOGOTA,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    })
    L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map)
    L.control.zoom({ position: 'topright' }).addTo(map)
    // Abajo a la izquierda: abajo a la derecha va el botón "Mi ubicación".
    L.control.attribution({ position: 'bottomleft' }).addTo(map)
    markersRef.current = L.layerGroup().addTo(map)
    userRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    // Mientras la persona no haya movido el mapa, un cambio de tamaño vuelve a encuadrar los
    // parqueaderos. Si el mapa nace sin tamaño (panel oculto, giro del teléfono) el primer
    // encuadre queda demasiado lejos.
    const markMoved = () => {
      movedRef.current = true
    }
    container.addEventListener('pointerdown', markMoved)
    container.addEventListener('wheel', markMoved, { passive: true })

    const observer = new ResizeObserver(() => {
      map.invalidateSize()
      if (!movedRef.current && boundsRef.current) {
        map.fitBounds(boundsRef.current, { padding: FIT_PADDING, maxZoom: 15, animate: false })
      }
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      container.removeEventListener('pointerdown', markMoved)
      container.removeEventListener('wheel', markMoved)
      map.remove()
      mapRef.current = null
      fittedRef.current = ''
      boundsRef.current = null
      movedRef.current = false
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = markersRef.current
    if (!map || !layer) return

    layer.clearLayers()
    for (const parking of parkings) {
      const free = parking.cupos[vehicle]
      const selected = parking.id === selectedId
      const marker = buildMarker(parking, free, selected).addTo(layer)
      marker.on('click', () => onSelectRef.current(parking.id))
      marker
        .getElement()
        ?.setAttribute('aria-label', signMarkerLabel(parking.nombre, free, selected))
    }

    // Solo se encuadra cuando cambia el conjunto de parqueaderos, no en cada refresco de cupos.
    const idsKey = parkings.map((parking) => parking.id).join('|')
    if (parkings.length > 0 && idsKey !== fittedRef.current) {
      const bounds = L.latLngBounds(parkings.map((parking) => [parking.lat, parking.lng]))
      map.fitBounds(bounds, { padding: FIT_PADDING, maxZoom: 15 })
      fittedRef.current = idsKey
      boundsRef.current = bounds
    }

    if (selectedId !== pannedRef.current) {
      const target = parkings.find((parking) => parking.id === selectedId)
      if (target) {
        map.panTo([target.lat, target.lng])
        movedRef.current = true
      }
      pannedRef.current = selectedId
    }
  }, [parkings, vehicle, selectedId])

  useEffect(() => {
    const map = mapRef.current
    const layer = userRef.current
    if (!map || !layer) return

    layer.clearLayers()
    if (!userPosition) return

    L.circleMarker([userPosition.lat, userPosition.lng], {
      radius: 8,
      weight: 3,
      fillOpacity: 1,
      interactive: false,
      className: 'fill-asphalt-950 stroke-paper',
    }).addTo(layer)
    map.setView([userPosition.lat, userPosition.lng], 15)
    movedRef.current = true
  }, [userPosition])

  return (
    <section
      ref={containerRef}
      aria-label="Mapa de parqueaderos"
      className="isolate z-0 size-full"
    />
  )
}
