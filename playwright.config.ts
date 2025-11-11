import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para E2E testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  
  /* Tiempo máximo de ejecución por test */
  timeout: 30 * 1000,
  
  /* Configuración de expect */
  expect: {
    timeout: 5000
  },
  
  /* Ejecutar tests en paralelo */
  fullyParallel: true,
  
  /* Fallar el build en CI si dejaste test.only */
  forbidOnly: !!process.env.CI,
  
  /* Reintentos en CI */
  retries: process.env.CI ? 2 : 0,
  
  /* Workers en paralelo */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter */
  reporter: [
    ['html'],
    ['list']
  ],
  
  /* Configuración compartida para todos los proyectos */
  use: {
    /* URL base para usar en navegación */
    baseURL: 'http://localhost:4200',
    
    /* Capturar trace en el primer reintento */
    trace: 'on-first-retry',
    
    /* Screenshots en fallo */
    screenshot: 'only-on-failure',
    
    /* Video en fallo */
    video: 'retain-on-failure',
  },

  /* Configurar proyectos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Tests en mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Servidor de desarrollo */
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
