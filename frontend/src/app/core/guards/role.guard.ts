import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];
  const currentUser = authService.currentUser();

  if (!currentUser) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
    // Redirect to appropriate page based on role
    if (currentUser.role === 'ADMIN') {
      router.navigate(['/admin/dashboard']);
    } else {
      router.navigate(['/user/profile']);
    }
    return false;
  }

  return true;
};
