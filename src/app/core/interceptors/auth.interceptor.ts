import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);
  const token: string | null = authService.accessToken();

  // Skip auth header for login and refresh endpoints
  const skipAuth: boolean = req.url.includes('/auth/login') || 
                            req.url.includes('/auth/refresh') || 
                            req.url.includes('/health');

  if (token && !skipAuth) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
