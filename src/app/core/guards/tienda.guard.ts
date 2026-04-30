import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Guard para la tienda pública: solo requiere token válido, sin empresa */
export const tiendaGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
        return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
    }

    return true;
};

