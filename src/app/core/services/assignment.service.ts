import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';
import { ServiceAssignment, AssignmentCandidate } from '../models/assignment.model';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
    private http = inject(HttpClient);
    private messageService = inject(MessageService);
    private apiUrl = environment.api.baseUrl;

    /** POST /assignments/{incident_id}/candidates — calcula candidatos */
    getCandidates(incidentId: number): Observable<AssignmentCandidate[]> {
        return this.http.post<AssignmentCandidate[]>(`${this.apiUrl}/assignments/${incidentId}/candidates`, {}).pipe(
            catchError(err => this.handleError(err, 'Error al obtener candidatos'))
        );
    }

    /** POST /assignments/{incident_id}/candidates/{workshop_id}/respond */
    respond(incidentId: number, workshopId: number, responseStatus: 'ACEPTADO' | 'RECHAZADO', note?: string): Observable<AssignmentCandidate> {
        return this.http.post<AssignmentCandidate>(
            `${this.apiUrl}/assignments/${incidentId}/candidates/${workshopId}/respond`,
            { response_status: responseStatus, response_note: note }
        ).pipe(
            catchError(err => this.handleError(err, responseStatus === 'ACEPTADO' ? 'Error al aceptar solicitud' : 'Error al rechazar solicitud'))
        );
    }

    /** POST /assignments/{incident_id}/assign — asigna el mejor candidato aceptado */
    assign(incidentId: number): Observable<ServiceAssignment> {
        return this.http.post<ServiceAssignment>(`${this.apiUrl}/assignments/${incidentId}/assign`, {}).pipe(
            catchError(err => this.handleError(err, 'Error al asignar servicio'))
        );
    }

    /** GET /assignments/{incident_id} — obtiene asignación por incident_id */
    getByIncidentId(incidentId: number): Observable<ServiceAssignment> {
        return this.http.get<ServiceAssignment>(`${this.apiUrl}/assignments/${incidentId}`).pipe(
            catchError(err => this.handleError(err, 'Error al cargar asignación'))
        );
    }

    /** PATCH /assignments/{assignment_id}/status */
    update(id: number, data: {
        assignment_status?: string;
        technician_id?: number;
        estimated_cost?: number;
        final_cost?: number;
        performed_service_description?: string;
        final_notes?: string;
    }): Observable<ServiceAssignment> {
        return this.http.patch<ServiceAssignment>(`${this.apiUrl}/assignments/${id}/status`, data).pipe(
            catchError(err => this.handleError(err, 'Error al actualizar asignación'))
        );
    }

    private handleError(err: any, summary: string): Observable<never> {
        const detail = err?.error?.detail || 'Error inesperado';
        this.messageService.add({ severity: 'error', summary, detail, life: 4000 });
        return throwError(() => err);
    }
}

