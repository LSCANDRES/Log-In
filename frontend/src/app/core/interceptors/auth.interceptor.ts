import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Skip real API calls when using simulated mock tokens
  const isMockToken = token?.startsWith('mock-');

  // Don't add token to auth requests (except logout/profile)
  const isAuthRequest = req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/google') ||
    req.url.includes('/auth/verify-email') ||
    req.url.includes('/auth/resend-verification');

  if (token && !isAuthRequest) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If using mock tokens, don't try to refresh or logout on errors
      if (isMockToken) {
        return throwError(() => error);
      }

      if (error.status === 401 && !req.url.includes('/auth/')) {
        // Try to refresh token
        return authService.refreshToken().pipe(
          switchMap((tokens) => {
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${tokens.accessToken}`,
              },
            });
            return next(newReq);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
