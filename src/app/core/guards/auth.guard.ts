import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const loginTree = router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });

    if (!auth.isAuthenticated()) {
        return loginTree;
    }

    // Si ya tenemos usuario en memoria, dejar pasar
    if (auth.getCurrentUser()) {
        return true;
    }

    // Token existe pero sin usuario en memoria → recuperar de la API
    return auth.getMe().pipe(
        map(() => true),
        catchError(() => of(loginTree))
    );
};

// Alias para compatibilidad con imports existentes
export const authMatchGuard = authGuard;

