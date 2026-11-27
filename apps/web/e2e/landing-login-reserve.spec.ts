import { expect, type Page, test } from '@playwright/test'

const cancelActiveReservation = async (page: Page) => {
  await page.goto('/reservas')
  await expect(page.getByRole('heading', { name: 'Mis reservas' })).toBeVisible()

  const cancelButton = page.getByRole('button', { name: 'Cancelar reserva' })
  if (await cancelButton.isVisible()) {
    await cancelButton.click()
    await page.getByRole('button', { name: 'Sí, cancelar' }).click()
    await expect(cancelButton).toHaveCount(0)
  }
}

test('flujo landing -> login -> reservar', async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL
  const password = process.env.E2E_USER_PASSWORD
  test.skip(
    !process.env.CI && (!email || !password),
    'Configura E2E_USER_EMAIL y E2E_USER_PASSWORD',
  )
  if (!email || !password) {
    throw new Error('CI requiere los secrets E2E_USER_EMAIL y E2E_USER_PASSWORD')
  }

  await page.goto('/')
  await expect(page.getByRole('heading', { name: /llega con el cupo apartado/i })).toBeVisible()

  await page.getByRole('link', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
  await page.getByLabel('Correo electrónico').fill(email)
  await page.getByLabel('Contraseña').fill(password)

  const reservationsResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith('/reservas/mias') &&
      response.request().method() === 'GET',
  )
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  expect((await reservationsResponse).status()).toBe(200)
  await expect(page).toHaveURL(/\/mapa\/?$/)
  await expect(page.getByRole('heading', { name: 'Parqueaderos' })).toBeVisible()

  await cancelActiveReservation(page)
  await page.goto('/mapa')
  await expect(page.getByRole('heading', { name: 'Parqueaderos' })).toBeVisible()

  await page.getByRole('button', { name: /Parque 93/i }).click()
  await expect(page.getByRole('heading', { name: 'Parque 93' })).toBeVisible()

  try {
    await page.getByRole('button', { name: 'Reservar cupo' }).click()
    await expect(page.getByRole('heading', { name: /Tu reserva.*carro/i })).toBeVisible()
    await expect(page.getByText(/C-\d+/)).toBeVisible()
  } finally {
    await cancelActiveReservation(page)
  }
})
