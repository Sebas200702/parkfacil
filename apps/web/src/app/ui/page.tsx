'use client'

import { UiGallery } from '@app/ui-gallery'

/** Ruta "/ui": galería del sistema de diseño, para desarrollo. */
export default function UiPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <UiGallery />
    </main>
  )
}
