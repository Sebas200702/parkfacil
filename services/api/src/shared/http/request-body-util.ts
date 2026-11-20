import type { PublicEvent } from './http-types'

/** Lee el cuerpo JSON de la petición (también si viene en base64). Cuerpo vacío = `{}`. */
export const readJsonBody = (event: Pick<PublicEvent, 'body' | 'isBase64Encoded'>): unknown => {
  if (!event.body) return {}
  const text = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body
  return JSON.parse(text)
}
