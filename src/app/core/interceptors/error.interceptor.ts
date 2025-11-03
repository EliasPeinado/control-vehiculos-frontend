import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);
  const errorHandler: ErrorHandlerService = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log all errors for debugging
      errorHandler.logError(error, `${req.method} ${req.url}`);

      // Handle 401 Unauthorized - try to refresh token
      if (error.status === 401 && !req.url.includes('/auth/')) {
        const refreshToken: string | null = authService.getRefreshToken();
        
        if (refreshToken) {
          return authService.refresh(refreshToken).pipe(
            switchMap(() => {
              // Retry original request with new token
              const newToken: string | null = authService.accessToken();
              const cloned = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(cloned);
            }),
            catchError((refreshError: HttpErrorResponse) => {
              // Refresh failed, logout user
              errorHandler.logError(refreshError, 'Token Refresh Failed');
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        } else {
          // No refresh token available, logout
          authService.logout();
          return throwError(() => error);
        }
      }

      // Handle 403 Forbidden
      if (error.status === 403) {
        console.warn('Access forbidden:', req.url);
      }

      // Handle 404 Not Found
      if (error.status === 404) {
        console.warn('Resource not found:', req.url);
      }

      // Handle 500+ Server Errors
      if (error.status >= 500) {
        console.error('Server error:', error.status);
      }

      // Handle Network Errors
      if (error.status === 0) {
        console.error('Network error - Cannot reach server');
      }

      return throwError(() => error);
    })
  );
};
