import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { StaffEvento, CrearStaffRequest, EditarStaffRequest, StaffSector } from '../models/staff-evento.model';

@Injectable({ providedIn: 'root' })
export class StaffEventoService {
    private http = inject(HttpClient);
    private apiUrl = environment.api.baseUrl;

    listar(eventoId: number, empresaId: number): Observable<ApiResponse<StaffEvento[]>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.get<ApiResponse<StaffEvento[]>>(`${this.apiUrl}/eventos/${eventoId}/staff`, { params });
    }

    obtener(staffEventoId: number, empresaId: number): Observable<ApiResponse<StaffEvento>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.get<ApiResponse<StaffEvento>>(`${this.apiUrl}/staff-evento/${staffEventoId}`, { params });
    }

    crear(request: CrearStaffRequest): Observable<ApiResponse<StaffEvento>> {
        return this.http.post<ApiResponse<StaffEvento>>(`${this.apiUrl}/staff-evento`, request);
    }

    actualizar(staffEventoId: number, empresaId: number, request: EditarStaffRequest): Observable<ApiResponse<StaffEvento>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.patch<ApiResponse<StaffEvento>>(`${this.apiUrl}/staff-evento/${staffEventoId}`, request, { params });
    }

    desactivar(staffEventoId: number, empresaId: number): Observable<ApiResponse<any>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/staff-evento/${staffEventoId}`, { params });
    }

    // ── Sectores del Staff ──

    listarSectores(staffEventoId: number, empresaId: number): Observable<ApiResponse<StaffSector[]>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.get<ApiResponse<StaffSector[]>>(`${this.apiUrl}/staff-evento/${staffEventoId}/sectores`, { params });
    }

    asignarSector(staffEventoId: number, empresaId: number, sectorId: number): Observable<ApiResponse<StaffSector>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.post<ApiResponse<StaffSector>>(`${this.apiUrl}/staff-evento/${staffEventoId}/sectores`, { sectorId }, { params });
    }

    quitarSector(staffEventoId: number, empresaId: number, sectorId: number): Observable<ApiResponse<StaffSector>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.delete<ApiResponse<StaffSector>>(`${this.apiUrl}/staff-evento/${staffEventoId}/sectores/${sectorId}`, { params });
    }

    cambiarSectorActivo(staffEventoId: number, empresaId: number, sectorId: number): Observable<ApiResponse<StaffSector>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.patch<ApiResponse<StaffSector>>(`${this.apiUrl}/staff-evento/${staffEventoId}/sectores/activo`, { sectorId }, { params });
    }
}

