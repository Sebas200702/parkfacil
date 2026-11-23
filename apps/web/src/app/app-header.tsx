/** Marca: una bahía con el cupo apartado en violeta. Mismo dibujo que public/favicon.svg. */
const BrandMark = () => (
  <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8 shrink-0">
    <rect width="32" height="32" rx="6" className="fill-asphalt-950" />
    <rect x="11.5" y="10.5" width="9" height="16" className="fill-brand-600" />
    <path
      d="M8.5 27V7.5h15V27"
      fill="none"
      strokeWidth="3"
      strokeLinejoin="round"
      className="stroke-paper"
    />
  </svg>
)

export const AppHeader = () => (
  <header className="bg-asphalt-950 text-paper">
    <div className="mx-auto flex h-14 w-full max-w-3xl items-center px-4">
      <a
        href="/"
        className="inline-flex items-center gap-2.5 rounded-plate focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-paint"
      >
        <BrandMark />
        <span className="text-heading font-extrabold tracking-tight">ParkFácil</span>
      </a>
    </div>
  </header>
)
