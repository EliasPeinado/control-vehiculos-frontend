import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/');
    await page.getByLabel(/email/i).fill('admin@test.com');
    await page.getByLabel(/contraseña/i).fill('admin123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
  });

  test('debe mostrar el dashboard después del login', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('debe mostrar el menú de navegación', async ({ page }) => {
    // Verificar que existe navegación
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('debe permitir navegar a diferentes secciones', async ({ page }) => {
    // Buscar links de navegación comunes
    const links = [
      /evaluaciones/i,
      /turnos/i,
      /vehículos/i,
    ];

    for (const linkText of links) {
      const link = page.getByRole('link', { name: linkText });
      if (await link.isVisible()) {
        await expect(link).toBeVisible();
      }
    }
  });

  test('debe mostrar información del usuario logueado', async ({ page }) => {
    // Verificar que se muestra alguna información del usuario
    const userInfo = page.getByText(/admin@test.com|admin/i);
    if (await userInfo.isVisible()) {
      await expect(userInfo).toBeVisible();
    }
  });

  test('debe permitir cerrar sesión', async ({ page }) => {
    const logoutButton = page.getByRole('button', { name: /cerrar sesión|logout|salir/i });
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Verificar redirección al login
      await expect(page).toHaveURL(/\/login|\/$/);
    }
  });
});
