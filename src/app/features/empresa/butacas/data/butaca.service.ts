import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { Butaca, ButacaRequest } from '../models/butaca.model';

@Injectable({ providedIn: 'root' })
export class ButacaService {
    private http = inject(HttpClient);
    private apiUrl = environment.api.baseUrl;

    listar(sectorId: number, empresaId: number): Observable<ApiResponse<Butaca[]>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.get<ApiResponse<Butaca[]>>(`${this.apiUrl}/sectores/${sectorId}/butacas`, { params });
    }

    obtener(butacaId: number, empresaId: number): Observable<ApiResponse<Butaca>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.get<ApiResponse<Butaca>>(`${this.apiUrl}/butacas/${butacaId}`, { params });
    }

    crear(sectorId: number, empresaId: number, request: ButacaRequest): Observable<ApiResponse<Butaca>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.post<ApiResponse<Butaca>>(`${this.apiUrl}/sectores/${sectorId}/butacas`, request, { params });
    }

    crearLote(sectorId: number, empresaId: number, lote: ButacaRequest[]): Observable<ApiResponse<Butaca[]>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.post<ApiResponse<Butaca[]>>(`${this.apiUrl}/sectores/${sectorId}/butacas/lote`, lote, { params });
    }

    actualizar(butacaId: number, empresaId: number, request: Partial<ButacaRequest>): Observable<ApiResponse<Butaca>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.patch<ApiResponse<Butaca>>(`${this.apiUrl}/butacas/${butacaId}`, request, { params });
    }

    desactivar(butacaId: number, empresaId: number): Observable<ApiResponse<any>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/butacas/${butacaId}`, { params });
    }
}

