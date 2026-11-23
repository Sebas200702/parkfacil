import { BayStatus } from '@shared/ui/bay-status'
import { Button } from '@shared/ui/button'
import { CupoMeter } from '@shared/ui/cupo-meter'
import { EmptyState } from '@shared/ui/empty-state'
import { Field, Input } from '@shared/ui/field'
import { Notice } from '@shared/ui/notice'
import { Segmented, type SegmentedOption } from '@shared/ui/segmented'
import { Car, Motorbike, Navigation, Search, Ticket, X } from 'lucide-react'
import { type ReactNode, useState } from 'react'

type Vehicle = 'CARRO' | 'MOTO'

const VEHICLES: ReadonlyArray<SegmentedOption<Vehicle>> = [
  { value: 'CARRO', label: 'Carro', icon: Car },
  { value: 'MOTO', label: 'Moto', icon: Motorbike },
]

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="grid gap-4 border-concrete-200 border-t pt-6">
    <h2 className="text-heading">{title}</h2>
    {children}
  </section>
)

/** Galería de desarrollo: todos los componentes base con datos de ejemplo. */
export const UiGallery = () => {
  const [vehicle, setVehicle] = useState<Vehicle>('CARRO')

  return (
    <div className="grid gap-8">
      <h1 className="text-display">Sistema de diseño</h1>

      <Section title="Botones">
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={Ticket}>Reservar cupo</Button>
          <Button variant="secondary" icon={Navigation}>
            Cómo llegar
          </Button>
          <Button variant="quiet">Ver tarifas</Button>
          <Button variant="danger" icon={X}>
            Cancelar reserva
          </Button>
          <Button loading loadingLabel="Reservando">
            Reservar cupo
          </Button>
        </div>
      </Section>

      <Section title="Formularios">
        <div className="grid max-w-[21.25rem] gap-4">
          <Segmented
            label="Tipo de vehículo"
            options={VEHICLES}
            value={vehicle}
            onChange={setVehicle}
          />
          <Field label="Correo" htmlFor="gallery-email">
            <Input id="gallery-email" type="email" placeholder="nombre@correo.com" />
          </Field>
          <Field label="Contraseña" htmlFor="gallery-password" error="Usa mínimo 8 caracteres.">
            <Input id="gallery-password" type="password" defaultValue="12345" invalid />
          </Field>
        </div>
      </Section>

      <Section title="Estado de un espacio">
        <div className="flex flex-wrap gap-6">
          <BayStatus state="free" />
          <BayStatus state="held" />
          <BayStatus state="taken" />
        </div>
        <div className="grid max-w-[36rem] gap-6 sm:grid-cols-2">
          <CupoMeter free={12} capacity={40} />
          <CupoMeter free={0} capacity={25} />
        </div>
      </Section>

      <Section title="Avisos">
        <div className="grid max-w-[26.25rem] gap-3">
          <Notice tone="error" title="Sin cupos">
            Se llenó mientras reservabas. Mira otro parqueadero cerca.
          </Notice>
          <Notice tone="warn" title="Ya tienes una reserva activa">
            Cancélala o espera a que venza para reservar otra.
          </Notice>
          <Notice tone="ok" title="Reserva cancelada">
            El cupo quedó libre.
          </Notice>
        </div>
      </Section>

      <Section title="Pantallas vacías">
        <div className="grid gap-4 sm:grid-cols-2">
          <EmptyState
            illustration="no-reservations"
            title="Aún no tienes reservas"
            action={<Button icon={Search}>Buscar parqueadero</Button>}
          >
            Aparta un cupo y lo verás aquí con su contador.
          </EmptyState>
          <EmptyState
            illustration="expired"
            title="Tu reserva venció"
            action={<Button icon={Ticket}>Reservar de nuevo</Button>}
          >
            Pasaron los 15 minutos y el cupo quedó libre.
          </EmptyState>
          <EmptyState
            illustration="offline"
            title="No pudimos conectar"
            action={<Button variant="secondary">Reintentar</Button>}
          >
            Revisa tu señal e intenta de nuevo.
          </EmptyState>
          <EmptyState illustration="no-results" title="No hay parqueaderos cerca">
            Mueve el mapa para buscar en otra zona.
          </EmptyState>
        </div>
      </Section>
    </div>
  )
}
