import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';
import { NavigationHelper } from '../helpers/navigation.helper';
import { FormHelper } from '../helpers/form.helper';

/**
 * Ejemplo de tests usando helpers
 * Estos tests demuestran cómo usar las utilidades para escribir tests más limpios
 */
test.describe('Ejemplo con Helpers', () => {
  test('login usando AuthHelper', async ({ page }) => {
    await AuthHelper.loginAsAdmin(page);
    
    // Verificar que estamos en el dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('navegación usando NavigationHelper', async ({ page }) => {
    await AuthHelper.loginAsEvaluador(page);
    await NavigationHelper.goToNuevaEvaluacion(page);
    
    // Verificar que estamos en la página correcta
    await expect(page.getByRole('heading', { name: /nueva evaluación/i })).toBeVisible();
  });

  test('formulario usando FormHelper', async ({ page }) => {
    await AuthHelper.loginAsUser(page);
    await NavigationHelper.goToBuscarVehiculo(page);
    
    // Usar FormHelper para completar el formulario
    await FormHelper.fillByPlaceholder(page, /matrícula/i, 'ABC123');
    await FormHelper.clickButton(page, /buscar/i);
    
    // Esperar resultados
    await page.waitForTimeout(1000);
  });

  test('flujo completo con múltiples helpers', async ({ page }) => {
    // 1. Login
    await AuthHelper.loginAsEvaluador(page);
    
    // 2. Navegar a nueva evaluación
    await NavigationHelper.goToNuevaEvaluacion(page);
    
    // 3. Verificar que estamos en la página correcta
    await expect(page.getByRole('heading', { name: /nueva evaluación/i })).toBeVisible();
    
    // 4. Si hay turnos disponibles, iniciar evaluación
    const evaluarButton = page.getByRole('button', { name: /iniciar evaluación|evaluar/i }).first();
    
    if (await evaluarButton.isVisible()) {
      await evaluarButton.click();
      
      // 5. Completar evaluación usando FormHelper
      const sliderCount = await page.locator('input[type="range"]').count();
      for (let i = 0; i < sliderCount; i++) {
        await FormHelper.setSliderValue(page, 8, i);
      }
      
      // 6. Verificar que el botón de registrar está habilitado
      const isDisabled = await FormHelper.isButtonDisabled(page, /registrar evaluación/i);
      expect(isDisabled).toBe(false);
    }
  });

  test('logout usando AuthHelper', async ({ page }) => {
    await AuthHelper.loginAsAdmin(page);
    await AuthHelper.logout(page);
    
    // Verificar que volvimos al login
    await expect(page).toHaveURL(/\/login|\/$/);
  });
});
