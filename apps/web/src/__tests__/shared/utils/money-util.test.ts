import { formatPesos } from '@shared/utils/money-util'
import { describe, expect, it } from 'vitest'

describe('formatPesos', () => {
  it('usa punto de miles y no muestra decimales', () => {
    expect(formatPesos(4500)).toBe('$4.500')
    expect(formatPesos(30000)).toBe('$30.000')
    expect(formatPesos(500)).toBe('$500')
  })
})
