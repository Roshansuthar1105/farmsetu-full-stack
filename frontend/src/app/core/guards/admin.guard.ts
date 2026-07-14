import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.currentUser()?.role;

  if (role && ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'EDITOR', 'VIEWER'].includes(role)) {
    return true;
  }

  return router.createUrlTree(['/app/dashboard']);
};
