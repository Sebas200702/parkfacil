type ClassPart = string | false | null | undefined

/** Une clases de Tailwind y descarta las condicionales que no aplican. */
export const cx = (...parts: ClassPart[]): string => parts.filter(Boolean).join(' ')
