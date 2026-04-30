import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';
import { Technician, TechnicianSpecialty } from '../models/technician.model';

@Injectable({ providedIn: 'root' })
export class TechnicianService {
    private http = inject(HttpClient);
    private messageService = inject(MessageService);
    private apiUrl = environment.api.baseUrl;

    getAll(workshopId: number): Observable<Technician[]> {
        return this.http.get<Technician[]>(`${this.apiUrl}/technicians/workshop/${workshopId}`).pipe(
            catchError(err => this.handleError(err, 'Error al cargar técnicos'))
        );
    }

    create(data: Partial<Technician>): Observable<Technician> {
        return this.http.post<Technician>(`${this.apiUrl}/technicians`, data).pipe(
            catchError(err => this.handleError(err, 'Error al crear técnico'))
        );
    }

    update(id: number, data: Partial<Technician>): Observable<Technician> {
        return this.http.patch<Technician>(`${this.apiUrl}/technicians/${id}`, data).pipe(
            catchError(err => this.handleError(err, 'Error al actualizar técnico'))
        );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/technicians/${id}`).pipe(
            catchError(err => this.handleError(err, 'Error al eliminar técnico'))
        );
    }

    addSpecialty(data: { technician_id: number; specialty_id: number }): Observable<TechnicianSpecialty> {
        return this.http.post<TechnicianSpecialty>(`${this.apiUrl}/technician-specialties`, data).pipe(
            catchError(err => this.handleError(err, 'Error al agregar especialidad al técnico'))
        );
    }

    removeSpecialty(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/technician-specialties/${id}`).pipe(
            catchError(err => this.handleError(err, 'Error al eliminar especialidad del técnico'))
        );
    }

    private handleError(err: any, summary: string): Observable<never> {
        const detail = err?.error?.detail || 'Error inesperado';
        this.messageService.add({ severity: 'error', summary, detail, life: 4000 });
        return throwError(() => err);
    }
}

