import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';
import { Incident, IncidentEvidence, AiAnalysis } from '../models/incident.model';

@Injectable({ providedIn: 'root' })
export class IncidentService {
    private http = inject(HttpClient);
    private messageService = inject(MessageService);
    private apiUrl = environment.api.baseUrl;

    getAll(statusId?: number, page = 1, limit = 20): Observable<Incident[]> {
        let params = new HttpParams().set('page', page).set('limit', limit);
        if (statusId !== undefined) {
            params = params.set('status_id', statusId);
        }
        return this.http.get<Incident[]>(`${this.apiUrl}/incidents`, { params }).pipe(
            catchError(err => this.handleError(err, 'Error al cargar incidentes'))
        );
    }

    getById(id: number): Observable<Incident> {
        return this.http.get<Incident>(`${this.apiUrl}/incidents/${id}`).pipe(
            catchError(err => this.handleError(err, 'Error al cargar incidente'))
        );
    }

    getEvidences(incidentId: number): Observable<IncidentEvidence[]> {
        return this.http.get<IncidentEvidence[]>(`${this.apiUrl}/incident-evidences/incident/${incidentId}`).pipe(
            catchError(err => this.handleError(err, 'Error al cargar evidencias'))
        );
    }

    getAiAnalysis(incidentId: number): Observable<AiAnalysis> {
        return this.http.get<AiAnalysis>(`${this.apiUrl}/ai-analysis/${incidentId}`).pipe(
            catchError(err => {
                if (err?.status === 404) return throwError(() => err);
                return this.handleError(err, 'Error al cargar análisis IA');
            })
        );
    }

    private handleError(err: any, summary: string): Observable<never> {
        const detail = err?.error?.detail || 'Error inesperado';
        this.messageService.add({ severity: 'error', summary, detail, life: 4000 });
        return throwError(() => err);
    }
}

