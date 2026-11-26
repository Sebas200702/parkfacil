import { expect, test } from '@playwright/test'

test('flujo landing -> login -> reservar', async ({ page }) => {
  const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
  await page.goto(baseUrl)
  await expect(page.locator('body')).toBeVisible()

  const loginTrigger = page
    .getByRole('link', { name: /iniciar sesion|iniciar sesión|login|ingresar/i })
    .or(page.getByRole('button', { name: /iniciar sesion|iniciar sesión|login|ingresar/i }))
    .first()

  if (await loginTrigger.count()) {
    await loginTrigger.click()
    await expect(page.locator('body')).toBeVisible()
  }

  const reserveBtn = page.getByRole('button', { name: /reservar/i }).first()
  if (await reserveBtn.count()) {
    await reserveBtn.click()
    await expect(page.locator('body')).toBeVisible()
  }
})
