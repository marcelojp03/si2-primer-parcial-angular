import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
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
    respond(incidentId: number, workshopId: number, data: any): Observable<AssignmentCandidate> {
        return this.http.post<AssignmentCandidate>(
            `${this.apiUrl}/assignments/${incidentId}/candidates/${workshopId}/respond`, data
        ).pipe(
            catchError(err => this.handleError(err, 'Error al responder solicitud'))
        );
    }

    /** POST /assignments/{incident_id}/assign — asigna el mejor candidato aceptado */
    assign(incidentId: number): Observable<ServiceAssignment> {
        return this.http.post<ServiceAssignment>(`${this.apiUrl}/assignments/${incidentId}/assign`, {}).pipe(
            catchError(err => this.handleError(err, 'Error al asignar servicio'))
        );
    }

    /** GET /assignments/{incident_id} — obtiene asignación por incident_id */
    getByIncidentId(incidentId: number): Observable<ServiceAssignment | null> {
        return this.http.get<ServiceAssignment>(`${this.apiUrl}/assignments/${incidentId}`).pipe(
            catchError(() => of(null))
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

    /** POST /assignments/{assignment_id}/quote — taller envía cotización */
    submitQuote(assignmentId: number, data: {
        estimated_cost: number;
        estimated_completion_minutes: number;
        quotation_description: string;
    }): Observable<ServiceAssignment> {
        return this.http.post<ServiceAssignment>(`${this.apiUrl}/assignments/${assignmentId}/quote`, data).pipe(
            catchError(err => this.handleError(err, 'Error al enviar cotización'))
        );
    }

    /** PATCH /assignments/{assignment_id}/quote/respond — cliente aprueba/rechaza */
    respondQuote(assignmentId: number, status: 'APROBADO' | 'RECHAZADO'): Observable<ServiceAssignment> {
        return this.http.patch<ServiceAssignment>(`${this.apiUrl}/assignments/${assignmentId}/quote/respond`, { status }).pipe(
            catchError(err => this.handleError(err, 'Error al responder cotización'))
        );
    }

    /** GET /assignments/invitations/pending — invitaciones pendientes con TTL */
    getPendingInvitations(): Observable<AssignmentCandidate[]> {
        return this.http.get<AssignmentCandidate[]>(`${this.apiUrl}/assignments/invitations/pending`).pipe(
            catchError(() => [])
        );
    }

    private handleError(err: any, summary: string): Observable<never> {
        const detail = err?.error?.detail || 'Error inesperado';
        this.messageService.add({ severity: 'error', summary, detail, life: 4000 });
        return throwError(() => err);
    }
}

