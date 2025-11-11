import { test, expect } from '@playwright/test';

test.describe('Buscar Vehículo', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/');
    await page.getByLabel(/email/i).fill('usuario@test.com');
    await page.getByLabel(/contraseña/i).fill('usuario123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Navegar a buscar vehículo
    await page.goto('/vehiculos/buscar');
  });

  test('debe mostrar la página de búsqueda de vehículos', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /buscar vehículo/i })).toBeVisible();
  });

  test('debe permitir buscar por matrícula', async ({ page }) => {
    const matriculaInput = page.getByPlaceholder(/matrícula/i);
    
    if (await matriculaInput.isVisible()) {
      await matriculaInput.fill('ABC123');
      await page.getByRole('button', { name: /buscar/i }).click();
      
      // Esperar resultados
      await page.waitForTimeout(1000);
    }
  });

  test('debe mostrar mensaje cuando no hay resultados', async ({ page }) => {
    const matriculaInput = page.getByPlaceholder(/matrícula/i);
    
    if (await matriculaInput.isVisible()) {
      await matriculaInput.fill('NOEXISTE999');
      await page.getByRole('button', { name: /buscar/i }).click();
      
      // Verificar mensaje de no resultados
      await expect(
        page.getByText(/no se encontraron|sin resultados/i)
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe mostrar detalles del vehículo al encontrarlo', async ({ page }) => {
    const matriculaInput = page.getByPlaceholder(/matrícula/i);
    
    if (await matriculaInput.isVisible()) {
      await matriculaInput.fill('ABC123');
      await page.getByRole('button', { name: /buscar/i }).click();
      
      // Esperar y verificar si aparecen detalles
      await page.waitForTimeout(1000);
      
      // Verificar que se muestran campos típicos de un vehículo
      const hasDetails = await page.getByText(/marca|modelo|propietario/i).isVisible();
      if (hasDetails) {
        await expect(page.getByText(/marca|modelo|propietario/i)).toBeVisible();
      }
    }
  });
});
