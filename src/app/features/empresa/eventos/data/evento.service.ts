import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { Evento, EventoRequest, TipoEvento } from '../models/evento.model';

@Injectable({ providedIn: 'root' })
export class EventoService {
    private http = inject(HttpClient);
    private apiUrl = environment.api.baseUrl;

    listar(empresaId: number): Observable<ApiResponse<Evento[]>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.get<ApiResponse<Evento[]>>(`${this.apiUrl}/mi-empresa/eventos`, { params });
    }

    obtener(eventoId: number, empresaId: number): Observable<ApiResponse<Evento>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.get<ApiResponse<Evento>>(`${this.apiUrl}/eventos/${eventoId}`, { params });
    }

    crear(request: EventoRequest): Observable<ApiResponse<Evento>> {
        return this.http.post<ApiResponse<Evento>>(`${this.apiUrl}/eventos`, request);
    }

    actualizar(eventoId: number, empresaId: number, request: Partial<EventoRequest>): Observable<ApiResponse<Evento>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.patch<ApiResponse<Evento>>(`${this.apiUrl}/eventos/${eventoId}`, request, { params });
    }

    desactivar(eventoId: number, empresaId: number): Observable<ApiResponse<any>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/eventos/${eventoId}`, { params });
    }

    listarTiposEvento(): Observable<ApiResponse<TipoEvento[]>> {
        return this.http.get<ApiResponse<TipoEvento[]>>(`${this.apiUrl}/tipos-evento`);
    }
}

