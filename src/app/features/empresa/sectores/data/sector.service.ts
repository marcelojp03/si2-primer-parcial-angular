import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { Sector, SectorRequest } from '../models/sector.model';

@Injectable({ providedIn: 'root' })
export class SectorService {
    private http = inject(HttpClient);
    private apiUrl = environment.api.baseUrl;

    listar(eventoId: number, empresaId: number): Observable<ApiResponse<Sector[]>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.get<ApiResponse<Sector[]>>(`${this.apiUrl}/eventos/${eventoId}/sectores`, { params });
    }

    obtener(sectorId: number, empresaId: number): Observable<ApiResponse<Sector>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.get<ApiResponse<Sector>>(`${this.apiUrl}/sectores/${sectorId}`, { params });
    }

    crear(eventoId: number, empresaId: number, request: SectorRequest): Observable<ApiResponse<Sector>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.post<ApiResponse<Sector>>(`${this.apiUrl}/eventos/${eventoId}/sectores`, request, { params });
    }

    actualizar(sectorId: number, empresaId: number, request: Partial<SectorRequest>): Observable<ApiResponse<Sector>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.patch<ApiResponse<Sector>>(`${this.apiUrl}/sectores/${sectorId}`, request, { params });
    }

    desactivar(sectorId: number, empresaId: number): Observable<ApiResponse<any>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/sectores/${sectorId}`, { params });
    }
}

