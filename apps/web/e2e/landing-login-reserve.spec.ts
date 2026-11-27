import { expect, test } from '@playwright/test'

test('flujo landing -> login -> reservar', async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.removeItem('parkfacil.demo.reservas')
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: /llega con el cupo apartado/i })).toBeVisible()

  await page.getByRole('link', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
  await expect(page.getByLabel('Correo electrónico')).toBeVisible()
  await expect(page.getByLabel('Contraseña')).toBeVisible()

  await page.goto('/mapa')
  await expect(page.getByRole('heading', { name: 'Parqueaderos' })).toBeVisible()

  await page.getByRole('button', { name: /Parque 93/i }).click()
  await expect(page.getByRole('heading', { name: 'Parque 93' })).toBeVisible()

  await page.getByRole('button', { name: 'Reservar cupo' }).click()
  await expect(page.getByRole('heading', { name: /Tu reserva.*carro/i })).toBeVisible()
  await expect(page.getByText(/C-\d+/)).toBeVisible()
})
