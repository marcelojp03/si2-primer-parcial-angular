import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';
import { UserAuth } from '@/core/models/auth.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private http = inject(HttpClient);
    private messageService = inject(MessageService);
    private base = environment.api.baseUrl;

    createUser(data: { full_name: string; email: string; password: string; role: string; phone?: string; ci?: string }): Observable<UserAuth> {
        return this.http.post<UserAuth>(`${this.base}/auth/register`, data).pipe(
            catchError(err => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || 'No se pudo crear el usuario.' });
                return throwError(() => err);
            })
        );
    }

    getAll(): Observable<UserAuth[]> {
        return this.http.get<UserAuth[]>(`${this.base}/users`).pipe(
            catchError(err => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista de usuarios.' });
                return throwError(() => err);
            })
        );
    }

    update(id: number, data: Partial<UserAuth>): Observable<UserAuth> {
        return this.http.patch<UserAuth>(`${this.base}/users/${id}`, data).pipe(
            catchError(err => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el usuario.' });
                return throwError(() => err);
            })
        );
    }
}

