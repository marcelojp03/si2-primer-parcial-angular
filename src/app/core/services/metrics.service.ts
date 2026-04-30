import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';
import { DashboardMetrics, Notification } from '../models/metrics.model';

@Injectable({ providedIn: 'root' })
export class MetricsService {
    private http = inject(HttpClient);
    private messageService = inject(MessageService);
    private apiUrl = environment.api.baseUrl;

    getDashboard(): Observable<DashboardMetrics> {
        return this.http.get<DashboardMetrics>(`${this.apiUrl}/metrics/dashboard`).pipe(
            catchError(err => this.handleError(err, 'Error al cargar métricas'))
        );
    }

    getNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.apiUrl}/notifications`).pipe(
            catchError(err => this.handleError(err, 'Error al cargar notificaciones'))
        );
    }

    private handleError(err: any, summary: string): Observable<never> {
        const detail = err?.error?.detail || 'Error inesperado';
        this.messageService.add({ severity: 'error', summary, detail, life: 4000 });
        return throwError(() => err);
    }
}

