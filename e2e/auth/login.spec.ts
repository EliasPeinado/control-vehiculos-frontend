import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe mostrar el formulario de login', async ({ page }) => {
    await expect(page).toHaveTitle(/Control Vehiculos/i);
    
    // Verificar que existe el formulario de login
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    // Completar formulario con credenciales inválidas
    await page.getByLabel(/email/i).fill('usuario@invalido.com');
    await page.getByLabel(/contraseña/i).fill('password123');
    
    // Hacer click en el botón de login
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Verificar mensaje de error
    await expect(page.getByText(/credenciales inválidas/i)).toBeVisible();
  });

  test('debe navegar al dashboard con credenciales válidas', async ({ page }) => {
    // Completar formulario con credenciales válidas
    await page.getByLabel(/email/i).fill('admin@test.com');
    await page.getByLabel(/contraseña/i).fill('admin123');
    
    // Hacer click en el botón de login
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Verificar redirección al dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('debe validar campos requeridos', async ({ page }) => {
    // Intentar enviar formulario vacío
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Verificar que los campos tienen el atributo required
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute('required');
  });
});
