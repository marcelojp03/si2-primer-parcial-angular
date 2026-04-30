import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const superadminGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const loginTree = router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });

    if (!auth.isAuthenticated()) {
        return loginTree;
    }

    const user = auth.getCurrentUser();
    if (user) {
        return user.rolCodigo === 'SUPERADMIN' ? true : router.createUrlTree(['/']);
    }

    // Token válido pero sin datos de usuario – intentar recuperar
    return auth.getMe().pipe(
        map(res => {
            if (res.codigo === 200 && res.data) {
                return res.data.rolCodigo === 'SUPERADMIN' ? true : router.createUrlTree(['/']);
            }
            return loginTree;
        }),
        catchError(() => of(loginTree))
    );
};

