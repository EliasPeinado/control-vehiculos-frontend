import { type Page, type Locator } from '@playwright/test';

/**
 * Helper para interacción con formularios en tests E2E
 */
export class FormHelper {
  /**
   * Completa un campo de texto por su label
   */
  static async fillByLabel(page: Page, label: string | RegExp, value: string): Promise<void> {
    await page.getByLabel(label).fill(value);
  }

  /**
   * Completa un campo de texto por su placeholder
   */
  static async fillByPlaceholder(page: Page, placeholder: string | RegExp, value: string): Promise<void> {
    await page.getByPlaceholder(placeholder).fill(value);
  }

  /**
   * Selecciona una opción en un dropdown
   */
  static async selectOption(page: Page, label: string | RegExp, value: string): Promise<void> {
    const select: Locator = page.getByLabel(label);
    await select.selectOption(value);
  }

  /**
   * Hace click en un botón por su texto
   */
  static async clickButton(page: Page, buttonText: string | RegExp): Promise<void> {
    await page.getByRole('button', { name: buttonText }).click();
  }

  /**
   * Verifica si un botón está deshabilitado
   */
  static async isButtonDisabled(page: Page, buttonText: string | RegExp): Promise<boolean> {
    const button: Locator = page.getByRole('button', { name: buttonText });
    return await button.isDisabled();
  }

  /**
   * Verifica si un campo tiene error de validación
   */
  static async hasValidationError(page: Page, label: string | RegExp): Promise<boolean> {
    const field: Locator = page.getByLabel(label);
    const ariaInvalid: string | null = await field.getAttribute('aria-invalid');
    return ariaInvalid === 'true';
  }

  /**
   * Completa un formulario con múltiples campos
   */
  static async fillForm(page: Page, fields: Record<string, string>): Promise<void> {
    for (const [label, value] of Object.entries(fields)) {
      await this.fillByLabel(page, new RegExp(label, 'i'), value);
    }
  }

  /**
   * Limpia un campo de texto
   */
  static async clearField(page: Page, label: string | RegExp): Promise<void> {
    await page.getByLabel(label).clear();
  }

  /**
   * Establece el valor de un slider (input range)
   */
  static async setSliderValue(page: Page, value: number, index: number = 0): Promise<void> {
    const sliders: Locator[] = await page.locator('input[type="range"]').all();
    if (sliders[index]) {
      await sliders[index].fill(value.toString());
    }
  }

  /**
   * Completa un textarea
   */
  static async fillTextarea(page: Page, placeholder: string | RegExp, value: string): Promise<void> {
    await page.getByPlaceholder(placeholder).fill(value);
  }
}
