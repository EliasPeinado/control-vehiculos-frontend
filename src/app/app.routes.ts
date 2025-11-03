import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./modules/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./modules/shared/layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./modules/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'turnos/reservar',
        loadComponent: () => import('./modules/turnos/pages/reservar-turno/reservar-turno.component').then(m => m.ReservarTurnoComponent)
      },
      {
        path: 'vehiculos/buscar',
        loadComponent: () => import('./modules/vehiculos/pages/buscar-vehiculo/buscar-vehiculo.component').then(m => m.BuscarVehiculoComponent)
      },
      {
        path: 'evaluaciones/nueva',
        loadComponent: () => import('./modules/evaluaciones/pages/nueva-evaluacion/nueva-evaluacion.component').then(m => m.NuevaEvaluacionComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
