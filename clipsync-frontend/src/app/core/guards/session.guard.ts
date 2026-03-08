import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const sessionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated() && authService.getSessionId()) {
        return true;
    }

    if (route.paramMap.has('code')) {
        return true;
    }

    router.navigate(['/']);
    return false;
};
