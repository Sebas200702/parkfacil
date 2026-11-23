const PESOS = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

/** Pesos colombianos con punto de miles y sin decimales: 4500 → "$4.500". */
export const formatPesos = (value: number): string => `$${PESOS.format(value)}`
