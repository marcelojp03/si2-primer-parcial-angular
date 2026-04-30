import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';
import { Workshop, WorkshopSchedule, WorkshopSpecialty, Specialty } from '../models/workshop.model';

@Injectable({ providedIn: 'root' })
export class WorkshopService {
    private http = inject(HttpClient);
    private messageService = inject(MessageService);
    private apiUrl = environment.api.baseUrl;

    getMyWorkshops(): Observable<Workshop[]> {
        return this.http.get<Workshop[]>(`${this.apiUrl}/workshops`).pipe(
            catchError(err => this.handleError(err, 'Error al cargar talleres'))
        );
    }

    getById(id: number): Observable<Workshop> {
        return this.http.get<Workshop>(`${this.apiUrl}/workshops/${id}`).pipe(
            catchError(err => this.handleError(err, 'Error al cargar taller'))
        );
    }

    create(data: Partial<Workshop>): Observable<Workshop> {
        return this.http.post<Workshop>(`${this.apiUrl}/workshops`, data).pipe(
            catchError(err => this.handleError(err, 'Error al crear taller'))
        );
    }

    update(id: number, data: Partial<Workshop>): Observable<Workshop> {
        return this.http.patch<Workshop>(`${this.apiUrl}/workshops/${id}`, data).pipe(
            catchError(err => this.handleError(err, 'Error al actualizar taller'))
        );
    }

    // ── Horarios ──────────────────────────────────────────────────────────
    /** GET /workshop-schedules/workshop/{workshop_id} */
    getSchedules(workshopId: number): Observable<WorkshopSchedule[]> {
        return this.http.get<WorkshopSchedule[]>(`${this.apiUrl}/workshop-schedules/workshop/${workshopId}`).pipe(
            catchError(err => this.handleError(err, 'Error al cargar horarios'))
        );
    }

    createSchedule(data: { workshop_id: number; weekday: string; start_time: string; end_time: string; active?: boolean }): Observable<WorkshopSchedule> {
        return this.http.post<WorkshopSchedule>(`${this.apiUrl}/workshop-schedules`, data).pipe(
            catchError(err => this.handleError(err, 'Error al guardar horario'))
        );
    }

    deleteSchedule(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/workshop-schedules/${id}`).pipe(
            catchError(err => this.handleError(err, 'Error al eliminar horario'))
        );
    }

    // ── Especialidades de taller ─────────────────────────────────────────
    getAllSpecialties(): Observable<Specialty[]> {
        return this.http.get<Specialty[]>(`${this.apiUrl}/specialties`).pipe(
            catchError(err => this.handleError(err, 'Error al cargar especialidades'))
        );
    }

    /** GET /workshop-specialties/workshop/{workshop_id} */
    getWorkshopSpecialties(workshopId: number): Observable<WorkshopSpecialty[]> {
        return this.http.get<WorkshopSpecialty[]>(`${this.apiUrl}/workshop-specialties/workshop/${workshopId}`).pipe(
            catchError(err => this.handleError(err, 'Error al cargar especialidades del taller'))
        );
    }

    addSpecialty(data: { workshop_id: number; specialty_id: number }): Observable<WorkshopSpecialty> {
        return this.http.post<WorkshopSpecialty>(`${this.apiUrl}/workshop-specialties`, data).pipe(
            catchError(err => this.handleError(err, 'Error al agregar especialidad'))
        );
    }

    removeSpecialty(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/workshop-specialties/${id}`).pipe(
            catchError(err => this.handleError(err, 'Error al eliminar especialidad'))
        );
    }

    // ── SUPERADMIN ────────────────────────────────────────────────────
    getAllWorkshops(): Observable<Workshop[]> {
        return this.http.get<Workshop[]>(`${this.apiUrl}/workshops`).pipe(
            catchError(err => this.handleError(err, 'Error al cargar talleres'))
        );
    }

    createSpecialty(data: { name: string; description?: string }): Observable<Specialty> {
        return this.http.post<Specialty>(`${this.apiUrl}/specialties`, data).pipe(
            catchError(err => this.handleError(err, 'Error al crear especialidad'))
        );
    }

    updateSpecialty(id: number, data: { name?: string; description?: string; status?: string }): Observable<Specialty> {
        return this.http.patch<Specialty>(`${this.apiUrl}/specialties/${id}`, data).pipe(
            catchError(err => this.handleError(err, 'Error al actualizar especialidad'))
        );
    }

    private handleError(err: any, summary: string): Observable<never> {
        const detail = err?.error?.detail || 'Error inesperado';
        this.messageService.add({ severity: 'error', summary, detail, life: 4000 });
        return throwError(() => err);
    }
}
