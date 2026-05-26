import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(requiredRole: 'SUPERADMIN' | 'ADMIN_TALLER'): CanActivateFn {
    return () => {
        const auth = inject(AuthService);
        const router = inject(Router);
        const user = auth.getCurrentUser();

        if (!user) {
            return router.createUrlTree(['/login']);
        }
        if (user.role !== requiredRole) {
            return router.createUrlTree(['/dashboard']);
        }
        return true;
    };
}

/** Guard para ADMIN_PLATAFORMA (SUPERADMIN con is_platform_admin = true) */
export const platformAdminGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.getCurrentUser();
    if (!user) return router.createUrlTree(['/login']);
    if (user.role === 'SUPERADMIN' && user.is_platform_admin) return true;
    return router.createUrlTree(['/dashboard']);
};


