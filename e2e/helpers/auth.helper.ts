import { type Page } from '@playwright/test';

/**
 * Helper para autenticación en tests E2E
 */
export class AuthHelper {
  /**
   * Realiza login con credenciales específicas
   */
  static async login(page: Page, email: string, password: string): Promise<void> {
    await page.goto('/');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/contraseña/i).fill(password);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Esperar a que se complete la navegación
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  }

  /**
   * Login como administrador
   */
  static async loginAsAdmin(page: Page): Promise<void> {
    await this.login(page, 'admin@test.com', 'admin123');
  }

  /**
   * Login como evaluador
   */
  static async loginAsEvaluador(page: Page): Promise<void> {
    await this.login(page, 'evaluador@test.com', 'evaluador123');
  }

  /**
   * Login como usuario regular
   */
  static async loginAsUser(page: Page): Promise<void> {
    await this.login(page, 'usuario@test.com', 'usuario123');
  }

  /**
   * Cierra sesión
   */
  static async logout(page: Page): Promise<void> {
    const logoutButton = page.getByRole('button', { name: /cerrar sesión|logout|salir/i });
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForURL(/\/login|\/$/);
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  static async isAuthenticated(page: Page): Promise<boolean> {
    const url: string = page.url();
    return url.includes('/dashboard') || !url.includes('/login');
  }
}
