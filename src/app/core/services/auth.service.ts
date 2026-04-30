import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, UserAuth } from '../models/auth.model';

/** @deprecated kept for backward compat — use UserAuth */
export type UsuarioAuth = UserAuth;

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = environment.api.baseUrl;

    private readonly TOKEN_KEY = environment.auth.tokenKey;   // 'access_token'
    private readonly USER_KEY  = environment.auth.userKey;    // 'auth_user'

    private currentUserSubject = new BehaviorSubject<UserAuth | null>(this.getUserFromStorage());
    public currentUser$ = this.currentUserSubject.asObservable();

    // ─────────────────────────────────── Auth endpoints ──────────────────────────────────

    /**
     * POST /auth/login → solo retorna token.
     * Luego hace GET /users/me para cargar el perfil del usuario.
     */
    login(email: string, password: string): Observable<UserAuth> {
        const body: LoginRequest = { email, password };
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, body).pipe(
            tap(response => {
                sessionStorage.setItem(this.TOKEN_KEY, response.access_token);
            }),
            switchMap(() => this.getMe()),
            catchError(error => {
                console.error('[AuthService] login error:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * POST /auth/register → devuelve UserRead (no token).
     * El usuario debe hacer login después.
     */
    register(data: RegisterRequest): Observable<UserAuth> {
        return this.http.post<UserAuth>(`${this.apiUrl}/auth/register`, data).pipe(
            catchError(error => {
                console.error('[AuthService] register error:', error);
                return throwError(() => error);
            })
        );
    }

    /** GET /users/me — carga el perfil del usuario autenticado */
    getMe(): Observable<UserAuth> {
        return this.http.get<UserAuth>(`${this.apiUrl}/users/me`).pipe(
            tap(user => {
                sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
                this.currentUserSubject.next(user);
            }),
            catchError(error => {
                console.error('[AuthService] getMe error:', error);
                return throwError(() => error);
            })
        );
    }

    logout(): void {
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    // ─────────────────────────────────── Helpers ────────────────────────────────────────

    getAccessToken(): string | null {
        return sessionStorage.getItem(this.TOKEN_KEY);
    }

    getCurrentUser(): UserAuth | null {
        return this.currentUserSubject.getValue();
    }

    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }

    clearSession(): void {
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
    }

    private getUserFromStorage(): UserAuth | null {
        try {
            const raw = sessionStorage.getItem(this.USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }
}
