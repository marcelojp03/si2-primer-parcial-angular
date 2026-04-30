import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'auth_user';

const PUBLIC_PATHS = ['/auth/login', '/auth/register'];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const messageService = inject(MessageService);

    const isPublic = PUBLIC_PATHS.some(path => req.url.includes(path));
    const token = sessionStorage.getItem(TOKEN_KEY);

    if (!isPublic && token) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !isPublic) {
                sessionStorage.removeItem(TOKEN_KEY);
                sessionStorage.removeItem(USER_KEY);
                messageService.add({
                    severity: 'warn',
                    summary: 'Sesión expirada',
                    detail: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
                    life: 3000
                });
                setTimeout(() => router.navigate(['/login']), 3000);
            }
            return throwError(() => error);
        })
    );
};

