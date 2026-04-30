import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { TipoEvento, CrearTipoEventoRequest, EditarTipoEventoRequest } from '../models/tipo-evento.model';

@Injectable({ providedIn: 'root' })
export class TipoEventoInternoService {
    private http = inject(HttpClient);
    private apiUrl = environment.api.baseUrl;

    listar(): Observable<ApiResponse<TipoEvento[]>> {
        return this.http.get<ApiResponse<TipoEvento[]>>(`${this.apiUrl}/interno/tipos-evento`);
    }

    crear(request: CrearTipoEventoRequest): Observable<ApiResponse<TipoEvento>> {
        return this.http.post<ApiResponse<TipoEvento>>(`${this.apiUrl}/interno/tipos-evento`, request);
    }

    actualizar(id: number, request: EditarTipoEventoRequest): Observable<ApiResponse<TipoEvento>> {
        return this.http.patch<ApiResponse<TipoEvento>>(`${this.apiUrl}/interno/tipos-evento/${id}`, request);
    }

    eliminar(id: number): Observable<ApiResponse<TipoEvento>> {
        return this.http.delete<ApiResponse<TipoEvento>>(`${this.apiUrl}/interno/tipos-evento/${id}`);
    }
}

