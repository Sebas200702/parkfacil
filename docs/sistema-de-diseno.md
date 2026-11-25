# Sistema de diseño: ParkFácil Señalética

Lenguaje visual del frontend (`apps/web`). Sale del parqueadero mismo: placas de señal, bahías
pintadas en el piso y el tiquete de la talanquera. Los tokens viven en
`apps/web/src/shared/styles/theme.css` y los componentes en `apps/web/src/shared/ui`.

Para verlo corriendo: `npm run dev -w @parkfacil/web` y abrir `http://localhost:5173/#ui`.

## Para quién se diseña

Una persona que maneja y necesita saber en el celular, en menos de diez segundos, dónde hay cupo.

- Texto de 16 px o más y cifras grandes.
- Ningún control mide menos de 48 px de alto.
- Una sola acción primaria (placa ultravioleta rellena) por pantalla.
- El estado nunca depende solo del color: siempre lleva forma y rótulo.

## Color

| Token | Valor | Uso |
|---|---|---|
| `brand-600` / `brand-700` | `#5522d6` / `#3e149f` | Acción primaria, enlaces, placas del mapa. Hover. |
| `brand-100` | `#e8e0fb` | Selección y hover de filas. |
| `paint` | `#f2b705` | Amarillo vial. Acento solo sobre `asphalt-950` o `brand-600`. |
| `asphalt-950` / `600` / `400` | `#16131f` / `#504b60` / `#7f7a90` | Texto, texto secundario, bordes de control. |
| `concrete-100` / `200` / `300` | `#eeedf2` / `#e0dee7` / `#cbc8d4` | Fondo de página, separadores. |
| `paper` | `#ffffff` | Superficies. |
| `status-free` (+ `-tint`) | `#177a45` | LIBRE y avisos de éxito. |
| `status-held` (+ `-ink`, `-tint`) | `#f2b705` | RESERVADO. El amarillo nunca es color de texto; se usa `-ink`. |
| `status-taken` (+ `-tint`) | `#bf3324` | OCUPADO, errores y acción destructiva. |

Reglas: el ultravioleta va plano, sin degradados. Verde, amarillo y rojo son de los estados y no
se usan para decorar. En las listas del conductor lo ocupado va en gris (`asphalt-400`).
La paleta por defecto de Tailwind está apagada: solo existen estos colores.

## Tipografía

- **Bricolage Grotesque** (`font-sans`) para rótulos y texto.
- **Martian Mono** (`font-mono`) para datos: contador, cupos, tarifas y códigos. Siempre con `tabular-nums`.

| Clase | Tamaño / alto | Peso | Uso |
|---|---|---|---|
| `text-display` | 40 / 42 | 800 | Título de pantalla, uno por vista |
| `text-title` | 28 / 32 | 800 | Nombre del parqueadero en el detalle |
| `text-heading` | 20 / 26 | 700 | Sección, nombre en filas |
| `text-body` | 16 / 24 | 400 | Texto corrido |
| `text-label` | 14 / 20 | 600 | Etiquetas y estados |
| `text-caption` | 13 / 18 | 400 | Dirección, distancia |
| `text-count` | 52 / 56 | 700 | Contador de la reserva (mono) |
| `text-figure` | 20 / 24 | 700 | Cupos libres (mono) |
| `text-data` | 14 / 28 | 500 | Tarifas (mono) |
| `text-stencil` | 11 / 16 | 700 | Códigos como `B-14` (mono, mayúsculas) |

## Forma

- Radios: `rounded-bay` 2 px, `rounded-plate` 6 px (botones, campos, avisos), `rounded-card` 10 px. Sin píldoras.
- Bordes de 2 px que definen el objeto. Sombras solo en lo que flota sobre el mapa (`shadow-marker`, `shadow-sheet`).
- Se separa con líneas y espacio, no con tarjetas dentro de tarjetas.
- Movimiento: transiciones de color de 100 ms; nada pulsa ni rebota. Se respeta `prefers-reduced-motion`.

## Iconos e ilustraciones

- Iconos de **Lucide** (`lucide-react`), 20 px junto a texto, color heredado. Un icono acompaña a un
  rótulo; los botones de solo icono llevan `aria-label`.
- El estado de un espacio usa el glifo de bahía (`BayStatus`), no un icono de Lucide.
- Ilustraciones de **unDraw** con el acento recoloreado a `brand-600`, en
  `src/shared/assets/illustrations`. Una por pantalla, donde hay espacio y no compiten con un
  dato: pantallas vacías (`EmptyState`), inicio de sesión y registro, y la invitación a compartir
  la ubicación al final de la lista. Nunca dentro de una fila, un aviso o encima del mapa.
- El plano del parqueadero (`BayMap`) dibuja un carro o una moto vistos desde arriba en cada bahía
  ocupada y un tiquete en la reservada. El admin lo ve con los espacios reales; el conductor ve un
  resumen a partir de los conteos (`LotPlan`), sin códigos de espacio.

## Componentes base

| Componente | Archivo | Para qué |
|---|---|---|
| `Button` | `button.tsx` | Variantes `primary`, `secondary`, `quiet`, `danger`; `icon`, `block`, `loading` |
| `Field`, `Input` | `field.tsx` | Etiqueta visible y error enlazado con `aria-describedby` |
| `Segmented` | `segmented.tsx` | Elegir entre dos o tres opciones (Carro / Moto) |
| `BayStatus`, `BayGlyph` | `bay-status.tsx` | Estado `free`, `held`, `taken` con forma, rótulo y color |
| `BayMap` | `bay-map.tsx` | Plano de bahías visto desde arriba: carro, moto o ticket de reserva, con rótulo y barra de color |
| `CupoMeter` | `cupo-meter.tsx` | Franja de 12 bahías más la cifra exacta |
| `Notice` | `notice.tsx` | Aviso `error`, `warn`, `ok` junto a la acción que lo causó |
| `EmptyState`, `Illustration` | `empty-state.tsx`, `illustration.tsx` | Pantalla sin contenido |

## Voz

Español de Colombia, de tú, directo. Los botones empiezan con verbo (`Reservar cupo`). Los errores
dicen qué pasó y qué hacer (`Sin cupos. Se llenó mientras reservabas.`) y nunca muestran el código
de la API. Pesos con punto de miles y sin decimales (`$4.500`).
