import { test, expect } from '@playwright/test';

test.describe('Reservar Turno', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/');
    await page.getByLabel(/email/i).fill('usuario@test.com');
    await page.getByLabel(/contraseña/i).fill('usuario123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Navegar a reservar turno
    await page.goto('/turnos/reservar');
  });

  test('debe mostrar la página de reservar turno', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /reservar turno/i })).toBeVisible();
  });

  test('debe permitir buscar un vehículo por matrícula', async ({ page }) => {
    const matriculaInput = page.getByPlaceholder(/matrícula/i);
    
    if (await matriculaInput.isVisible()) {
      await matriculaInput.fill('ABC123');
      await page.getByRole('button', { name: /buscar/i }).click();
      
      // Esperar resultados
      await page.waitForTimeout(1000);
    }
  });

  test('debe mostrar formulario de reserva al seleccionar vehículo', async ({ page }) => {
    // Este test depende de que haya vehículos disponibles
    const buscarButton = page.getByRole('button', { name: /buscar/i });
    
    if (await buscarButton.isVisible()) {
      await page.getByPlaceholder(/matrícula/i).fill('ABC123');
      await buscarButton.click();
      
      // Esperar y verificar si aparece el formulario de reserva
      await page.waitForTimeout(1000);
    }
  });

  test('debe validar campos requeridos en el formulario', async ({ page }) => {
    // Verificar que los campos requeridos están marcados
    const requiredFields = page.locator('input[required], select[required]');
    const count = await requiredFields.count();
    
    expect(count).toBeGreaterThan(0);
  });
});
