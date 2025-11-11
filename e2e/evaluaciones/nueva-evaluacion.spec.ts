import { test, expect, type Locator } from '@playwright/test';

test.describe('Nueva Evaluación', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/');
    await page.getByLabel(/email/i).fill('evaluador@test.com');
    await page.getByLabel(/contraseña/i).fill('evaluador123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Navegar a nueva evaluación
    await page.goto('/evaluaciones/nueva');
  });

  test('debe mostrar la página de nueva evaluación', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /nueva evaluación/i })).toBeVisible();
    await expect(page.getByText(/seleccione un turno pendiente/i)).toBeVisible();
  });

  test('debe mostrar lista de turnos pendientes', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /turnos pendientes/i })).toBeVisible();
    
    // Verificar que hay turnos o mensaje de sin turnos
    const hasTurnos: boolean = await page.getByText(/turno.*encontrado/i).isVisible();
    if (hasTurnos) {
      await expect(page.getByRole('button', { name: /iniciar evaluación/i }).first()).toBeVisible();
    } else {
      await expect(page.getByText(/no hay turnos pendientes/i)).toBeVisible();
    }
  });

  test('debe permitir cambiar entre vista de cards y lista', async ({ page }) => {
    const toggleButton: Locator = page.getByRole('button', { name: /ver lista|ver cards/i });
    
    if (await toggleButton.isVisible()) {
      const initialText: string = await toggleButton.textContent() || '';
      await toggleButton.click();
      
      // Verificar que el texto cambió
      await expect(toggleButton).not.toHaveText(initialText);
    }
  });

  test('debe filtrar turnos por centro', async ({ page }) => {
    // Buscar el dropdown de centro
    const centroDropdown: Locator = page.getByLabel(/filtrar por centro/i);
    
    if (await centroDropdown.isVisible()) {
      await centroDropdown.click();
      
      // Seleccionar primer centro disponible
      const firstOption: Locator = page.locator('[role="option"]').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
        
        // Verificar que se aplicó el filtro
        await expect(page.getByRole('button', { name: /limpiar filtros/i })).toBeVisible();
      }
    }
  });

  test('debe filtrar turnos por matrícula', async ({ page }) => {
    const matriculaInput: Locator = page.getByPlaceholder(/ingrese matrícula/i);
    
    if (await matriculaInput.isVisible()) {
      await matriculaInput.fill('ABC123');
      
      // Esperar a que se aplique el filtro
      await page.waitForTimeout(500);
      
      // Verificar que se aplicó el filtro
      await expect(page.getByRole('button', { name: /limpiar filtros/i })).toBeVisible();
    }
  });

  test('debe iniciar evaluación al seleccionar un turno', async ({ page }) => {
    // Buscar el primer botón de evaluar
    const evaluarButton: Locator = page.getByRole('button', { name: /iniciar evaluación|evaluar/i }).first();
    
    if (await evaluarButton.isVisible()) {
      await evaluarButton.click();
      
      // Verificar que se muestra la sección de evaluación
      await expect(page.getByRole('heading', { name: /evaluando turno/i })).toBeVisible();
      await expect(page.getByText(/chequeos de inspección/i)).toBeVisible();
    }
  });

  test('debe permitir completar una evaluación', async ({ page }) => {
    // Iniciar evaluación
    const evaluarButton: Locator = page.getByRole('button', { name: /iniciar evaluación|evaluar/i }).first();
    
    if (await evaluarButton.isVisible()) {
      await evaluarButton.click();
      
      // Completar cada chequeo
      const sliders: Locator[] = await page.locator('input[type="range"]').all();
      for (const slider of sliders) {
        await slider.fill('8'); // Puntaje de 8/10
      }
      
      // Agregar observaciones
      const textareas: Locator[] = await page.locator('textarea').all();
      for (let i = 0; i < textareas.length; i++) {
        await textareas[i].fill(`Observación del chequeo ${i + 1}`);
      }
      
      // Verificar resumen
      await expect(page.getByText(/puntaje total/i)).toBeVisible();
      await expect(page.getByText(/resultado estimado/i)).toBeVisible();
      
      // Verificar que el botón de registrar está habilitado
      const registrarButton: Locator = page.getByRole('button', { name: /registrar evaluación/i });
      await expect(registrarButton).toBeEnabled();
    }
  });

  test('debe calcular correctamente el puntaje total', async ({ page }) => {
    // Iniciar evaluación
    const evaluarButton: Locator = page.getByRole('button', { name: /iniciar evaluación|evaluar/i }).first();
    
    if (await evaluarButton.isVisible()) {
      await evaluarButton.click();
      
      // Establecer todos los sliders en 10
      const sliders: Locator[] = await page.locator('input[type="range"]').all();
      for (const slider of sliders) {
        await slider.fill('10');
      }
      
      // Verificar que el puntaje total es 100
      await expect(page.getByText(/100\/100/)).toBeVisible();
      await expect(page.getByText(/SEGURO/i)).toBeVisible();
    }
  });

  test('debe permitir volver a la selección de turnos', async ({ page }) => {
    // Iniciar evaluación
    const evaluarButton: Locator = page.getByRole('button', { name: /iniciar evaluación|evaluar/i }).first();
    
    if (await evaluarButton.isVisible()) {
      await evaluarButton.click();
      
      // Click en volver
      await page.getByRole('button', { name: /volver a turnos/i }).click();
      
      // Verificar que volvió a la lista de turnos
      await expect(page.getByRole('heading', { name: /turnos pendientes/i })).toBeVisible();
    }
  });

  test('debe mostrar mensaje de éxito al registrar evaluación', async ({ page }) => {
    // Iniciar evaluación
    const evaluarButton: Locator = page.getByRole('button', { name: /iniciar evaluación|evaluar/i }).first();
    
    if (await evaluarButton.isVisible()) {
      await evaluarButton.click();
      
      // Completar evaluación rápidamente
      const sliders: Locator[] = await page.locator('input[type="range"]').all();
      for (const slider of sliders) {
        await slider.fill('8');
      }
      
      // Registrar evaluación
      await page.getByRole('button', { name: /registrar evaluación/i }).click();
      
      // Verificar mensaje de éxito o redirección
      await expect(
        page.getByText(/evaluación registrada|éxito/i)
      ).toBeVisible({ timeout: 10000 });
    }
  });
});
