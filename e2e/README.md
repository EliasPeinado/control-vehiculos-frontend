# Tests E2E con Playwright

Este directorio contiene los tests End-to-End (E2E) de la aplicación Control Vehículos Frontend, implementados con [Playwright](https://playwright.dev/).

## 📁 Estructura

```
e2e/
├── auth/                    # Tests de autenticación
│   └── login.spec.ts
├── dashboard/               # Tests del dashboard
│   └── dashboard.spec.ts
├── evaluaciones/            # Tests de evaluaciones
│   └── nueva-evaluacion.spec.ts
├── turnos/                  # Tests de turnos
│   └── reservar-turno.spec.ts
├── vehiculos/               # Tests de vehículos
│   └── buscar-vehiculo.spec.ts
├── helpers/                 # Utilidades para tests
│   ├── auth.helper.ts      # Helper de autenticación
│   ├── form.helper.ts      # Helper de formularios
│   └── navigation.helper.ts # Helper de navegación
└── examples/                # Ejemplos de uso
    └── with-helpers.spec.ts
```

## 🚀 Comandos Disponibles

### Ejecutar todos los tests
```bash
npm run e2e
```

### Ejecutar tests en modo UI (interfaz gráfica)
```bash
npm run e2e:ui
```

### Ejecutar tests con navegador visible
```bash
npm run e2e:headed
```

### Modo debug (paso a paso)
```bash
npm run e2e:debug
```

### Ver reporte HTML de la última ejecución
```bash
npm run e2e:report
```

### Ejecutar en navegadores específicos
```bash
npm run e2e:chromium   # Solo Chrome
npm run e2e:firefox    # Solo Firefox
npm run e2e:webkit     # Solo Safari
```

## 📝 Escribir Tests

### Test básico

```typescript
import { test, expect } from '@playwright/test';

test.describe('Mi Módulo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mi-ruta');
  });

  test('debe mostrar el título', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /mi título/i })).toBeVisible();
  });
});
```

### Usando Helpers

```typescript
import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';
import { NavigationHelper } from '../helpers/navigation.helper';

test.describe('Con Helpers', () => {
  test('flujo completo', async ({ page }) => {
    // Login
    await AuthHelper.loginAsAdmin(page);
    
    // Navegar
    await NavigationHelper.goToNuevaEvaluacion(page);
    
    // Verificar
    await expect(page).toHaveURL(/\/evaluaciones\/nueva/);
  });
});
```

## 🛠️ Helpers Disponibles

### AuthHelper

Utilidades para autenticación:

- `login(page, email, password)` - Login con credenciales específicas
- `loginAsAdmin(page)` - Login como administrador
- `loginAsEvaluador(page)` - Login como evaluador
- `loginAsUser(page)` - Login como usuario regular
- `logout(page)` - Cerrar sesión
- `isAuthenticated(page)` - Verificar si está autenticado

### NavigationHelper

Utilidades para navegación:

- `goToNuevaEvaluacion(page)` - Ir a nueva evaluación
- `goToReservarTurno(page)` - Ir a reservar turno
- `goToBuscarVehiculo(page)` - Ir a buscar vehículo
- `goToDashboard(page)` - Ir al dashboard
- `waitForPageLoad(page)` - Esperar carga completa
- `isOnPage(page, urlPattern)` - Verificar URL actual

### FormHelper

Utilidades para formularios:

- `fillByLabel(page, label, value)` - Completar campo por label
- `fillByPlaceholder(page, placeholder, value)` - Completar por placeholder
- `selectOption(page, label, value)` - Seleccionar opción en dropdown
- `clickButton(page, buttonText)` - Click en botón
- `isButtonDisabled(page, buttonText)` - Verificar si botón está deshabilitado
- `hasValidationError(page, label)` - Verificar error de validación
- `fillForm(page, fields)` - Completar múltiples campos
- `setSliderValue(page, value, index)` - Establecer valor de slider

## 🎯 Buenas Prácticas

### 1. Usar selectores semánticos

```typescript
// ✅ Bueno - Usa roles y texto
await page.getByRole('button', { name: /enviar/i });
await page.getByLabel(/email/i);

// ❌ Malo - Usa selectores CSS frágiles
await page.locator('.btn-primary');
await page.locator('#email-input');
```

### 2. Usar expresiones regulares case-insensitive

```typescript
// ✅ Bueno - Funciona con "Email", "email", "EMAIL"
await page.getByLabel(/email/i);

// ❌ Malo - Solo funciona con "Email" exacto
await page.getByLabel('Email');
```

### 3. Esperar elementos antes de interactuar

```typescript
// ✅ Bueno - Playwright espera automáticamente
await expect(page.getByText(/resultado/i)).toBeVisible();

// ⚠️ Usar waitForTimeout solo cuando sea necesario
await page.waitForTimeout(1000);
```

### 4. Organizar tests con describe y beforeEach

```typescript
test.describe('Mi Módulo', () => {
  test.beforeEach(async ({ page }) => {
    // Setup común para todos los tests
    await AuthHelper.loginAsUser(page);
    await NavigationHelper.goToMiModulo(page);
  });

  test('caso 1', async ({ page }) => {
    // Test específico
  });

  test('caso 2', async ({ page }) => {
    // Test específico
  });
});
```

### 5. Manejar elementos opcionales

```typescript
// ✅ Bueno - Verifica existencia antes de interactuar
const button = page.getByRole('button', { name: /opcional/i });
if (await button.isVisible()) {
  await button.click();
}
```

## 🔧 Configuración

La configuración de Playwright está en `playwright.config.ts`:

- **Timeout por test**: 30 segundos
- **Reintentos en CI**: 2
- **Navegadores**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Servidor de desarrollo**: Se inicia automáticamente en `http://localhost:4200`
- **Screenshots**: Solo en fallos
- **Videos**: Solo en fallos
- **Trace**: En el primer reintento

## 📊 Reportes

Después de ejecutar los tests, se generan reportes en:

- `test-results/` - Resultados detallados de cada test
- `playwright-report/` - Reporte HTML interactivo

Para ver el reporte HTML:

```bash
npm run e2e:report
```

## 🐛 Debugging

### Modo Debug

```bash
npm run e2e:debug
```

Esto abre Playwright Inspector donde puedes:
- Ejecutar tests paso a paso
- Ver el estado del DOM
- Inspeccionar locators
- Ver screenshots

### Ver tests en el navegador

```bash
npm run e2e:headed
```

### Modo UI (recomendado)

```bash
npm run e2e:ui
```

Interfaz gráfica completa con:
- Ejecución de tests
- Timeline de acciones
- Screenshots
- Network requests
- Console logs

## 📚 Recursos

- [Documentación de Playwright](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Locators](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)

## 🔐 Credenciales de Test

Para los tests, se usan las siguientes credenciales:

- **Admin**: `admin@test.com` / `admin123`
- **Evaluador**: `evaluador@test.com` / `evaluador123`
- **Usuario**: `usuario@test.com` / `usuario123`

**Nota**: Estas credenciales deben existir en el backend de testing.

## ⚠️ Notas Importantes

1. **Servidor de desarrollo**: Los tests inician automáticamente el servidor en `http://localhost:4200`
2. **Backend**: Asegúrate de que el backend esté corriendo y accesible
3. **Base de datos**: Usa una base de datos de testing con datos de prueba
4. **Tiempo de ejecución**: Los tests completos pueden tardar varios minutos
5. **Paralelización**: Los tests se ejecutan en paralelo por defecto

## 🚦 CI/CD

En entornos de CI/CD, los tests se ejecutan con:

- 2 reintentos automáticos en caso de fallo
- 1 worker (sin paralelización)
- Capturas de pantalla y videos en fallos
- Modo headless

Ejemplo para GitHub Actions:

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run e2e
  env:
    CI: true

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 📞 Soporte

Si tienes problemas con los tests E2E:

1. Verifica que el servidor de desarrollo esté corriendo
2. Revisa los logs en `test-results/`
3. Usa el modo debug: `npm run e2e:debug`
4. Consulta la documentación de Playwright
