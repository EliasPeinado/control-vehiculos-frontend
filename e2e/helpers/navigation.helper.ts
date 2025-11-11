import { type Page } from '@playwright/test';

/**
 * Helper para navegación en tests E2E
 */
export class NavigationHelper {
  /**
   * Navega a la página de nueva evaluación
   */
  static async goToNuevaEvaluacion(page: Page): Promise<void> {
    await page.goto('/evaluaciones/nueva');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navega a la página de reservar turno
   */
  static async goToReservarTurno(page: Page): Promise<void> {
    await page.goto('/turnos/reservar');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navega a la página de buscar vehículo
   */
  static async goToBuscarVehiculo(page: Page): Promise<void> {
    await page.goto('/vehiculos/buscar');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navega al dashboard
   */
  static async goToDashboard(page: Page): Promise<void> {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Espera a que la página esté completamente cargada
   */
  static async waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verifica si estamos en una URL específica
   */
  static async isOnPage(page: Page, urlPattern: RegExp): Promise<boolean> {
    const url: string = page.url();
    return urlPattern.test(url);
  }
}
